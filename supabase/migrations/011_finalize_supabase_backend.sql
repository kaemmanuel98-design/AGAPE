-- Finalisation backend Supabase pour Agape
-- 1) Trigger de creation automatique du profil
-- 2) RLS avance sur public.profiles
-- 3) Validation planning.service_date
-- 4) Policies storage sur le bucket agape-media

begin;

-- ---------------------------------------------------------------------------
-- PROFILES: structure minimale requise
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- TRIGGER D'INSCRIPTION
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- PROTECTION DU ROLE: seul le super-admin (ou SQL admin/service role) peut
-- modifier la colonne role.
-- ---------------------------------------------------------------------------

drop trigger if exists profiles_preserve_role on public.profiles;
drop function if exists public.preserve_profile_role();

create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if current_user in ('postgres', 'supabase_admin', 'supabase_auth_admin')
       or auth.role() = 'service_role'
       or exists (
         select 1
         from public.profiles p
         where p.id = auth.uid()
           and p.role = 'super-admin'
       ) then
      return new;
    end if;

    raise exception 'Only super-admin can change profile roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row
  execute function public.guard_profile_role_change();

-- ---------------------------------------------------------------------------
-- RLS: lecture de tous les profils pour les utilisateurs authentifies,
-- modification limitee a son propre profil, avec une policy speciale
-- pour le super-admin.
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_read_own" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_super_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_super_admin"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

-- Pas de policy INSERT cote client: la creation du profil passe par le trigger.

-- ---------------------------------------------------------------------------
-- PLANNING: validation de la date
-- NOTE: un trigger est prefere a un CHECK avec current_date pour une regle
-- temporelle "par rapport a aujourd'hui".
-- ---------------------------------------------------------------------------

create or replace function public.validate_planning_service_date()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.service_date < current_date then
    raise exception 'service_date cannot be in the past.';
  end if;

  return new;
end;
$$;

drop trigger if exists planning_validate_service_date on public.planning;

create trigger planning_validate_service_date
  before insert or update of service_date on public.planning
  for each row
  execute function public.validate_planning_service_date();

-- ---------------------------------------------------------------------------
-- STORAGE: bucket public en lecture, ecriture reservee au super-admin
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('agape-media', 'agape-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "agape_media_select_public" on storage.objects;
drop policy if exists "agape_media_insert_super_admin" on storage.objects;
drop policy if exists "agape_media_update_super_admin" on storage.objects;
drop policy if exists "agape_media_delete_super_admin" on storage.objects;
drop policy if exists "agape_media_insert_member_profiles" on storage.objects;
drop policy if exists "agape_media_update_member_profiles" on storage.objects;
drop policy if exists "agape_media_delete_member_profiles" on storage.objects;

create policy "agape_media_select_public"
  on storage.objects for select
  using (bucket_id = 'agape-media');

create policy "agape_media_insert_super_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

create policy "agape_media_update_super_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  )
  with check (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

create policy "agape_media_delete_super_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

commit;
