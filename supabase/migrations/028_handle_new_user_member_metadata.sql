-- Trigger d'inscription : remplit public.profiles depuis auth.users + raw_user_meta_data
-- (full_name, avatar_url, current_need, city) envoyés par /rejoindre.
-- Corrige « Database error creating new user » si le trigger précédent ne correspondait plus au schéma.
-- Exécuter dans Supabase → SQL Editor (ou `supabase db push`) si l'inscription échoue encore.

begin;

-- Colonnes membre (idempotent, au cas où 027 n'a pas encore été appliquée)
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists current_need text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists email text;

-- Politique d'insertion pour le rôle service (secours si le trigger tourne hors security definer).
drop policy if exists "profiles_insert_service_role" on public.profiles;
create policy "profiles_insert_service_role"
  on public.profiles
  for insert
  to service_role
  with check (true);

grant insert on table public.profiles to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
  normalized_email text;
  meta jsonb;
  v_full_name text;
  v_avatar_url text;
  v_current_need text;
  v_city text;
begin
  normalized_email := lower(trim(coalesce(new.email, '')));
  new_role := case normalized_email
    when 'kaemmanuel98@gmail.com' then 'super-admin'
    else 'member'
  end;

  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_full_name := nullif(trim(meta->>'full_name'), '');
  v_avatar_url := nullif(trim(meta->>'avatar_url'), '');
  v_current_need := nullif(trim(meta->>'current_need'), '');
  v_city := nullif(trim(meta->>'city'), '');

  insert into public.profiles (
    id,
    email,
    role,
    full_name,
    avatar_url,
    current_need,
    city
  )
  values (
    new.id,
    new.email,
    new_role,
    v_full_name,
    v_avatar_url,
    v_current_need,
    v_city
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    current_need = coalesce(excluded.current_need, public.profiles.current_need),
    city = coalesce(excluded.city, public.profiles.city),
    role = case
      when public.profiles.role = 'super-admin' then public.profiles.role
      else excluded.role
    end;

  return new;
exception
  when others then
    raise exception 'handle_new_user failed for user %: %', new.id, sqlerrm;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

commit;
