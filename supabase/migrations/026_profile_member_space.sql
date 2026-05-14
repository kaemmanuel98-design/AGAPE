-- Espace membre : talents sur profil, lien inscription ↔ Auth, Storage avatars géré par l’utilisateur connecté.

alter table public.profiles
  add column if not exists member_talents jsonb not null default '[]'::jsonb;

comment on column public.profiles.member_talents is
  'Talents issus du parcours /rejoindre (tableau de clés), éditables sur /profile/[id]/edit.';

alter table public.members_registration
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create unique index if not exists members_registration_auth_user_id_key
  on public.members_registration (auth_user_id)
  where auth_user_id is not null;

create index if not exists members_registration_auth_user_id_idx
  on public.members_registration (auth_user_id);

-- Mise à jour de sa propre fiche d’inscription (sync optionnelle avec le profil).
drop policy if exists "members_registration_update_own_link" on public.members_registration;
create policy "members_registration_update_own_link"
  on public.members_registration for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Bucket avatars : fichiers plats nommés [uuid]-[timestamp].jpg à la racine du bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (
      name like (auth.uid()::text || '-%.jpg')
      or name like (auth.uid()::text || '-%.jpeg')
    )
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (
      name like (auth.uid()::text || '-%.jpg')
      or name like (auth.uid()::text || '-%.jpeg')
    )
  )
  with check (
    bucket_id = 'avatars'
    and (
      name like (auth.uid()::text || '-%.jpg')
      or name like (auth.uid()::text || '-%.jpeg')
    )
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (
      name like (auth.uid()::text || '-%.jpg')
      or name like (auth.uid()::text || '-%.jpeg')
      or name like (auth.uid()::text || '-%.webp')
    )
  );

drop policy if exists "members_registration_update_super_admin" on public.members_registration;
create policy "members_registration_update_super_admin"
  on public.members_registration for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  )
  with check (true);
