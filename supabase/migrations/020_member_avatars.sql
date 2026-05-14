-- Photo de profil des inscriptions : URL publique Storage persistée pour l’affichage (<img> / Next Image).
-- L’upload vers le bucket `avatars` est effectué côté serveur (clé service_role), pas par le client anonyme.

alter table public.members_registration
  add column if not exists avatar_url text;

comment on column public.members_registration.avatar_url is
  'URL publique Supabase Storage (bucket avatars), ex. …/storage/v1/object/public/avatars/{id}/avatar.webp';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/webp', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "members_registration_insert_public" on public.members_registration;
create policy "members_registration_insert_public"
  on public.members_registration for insert
  to anon, authenticated
  with check (
    length(trim(phone)) > 0
    and length(trim(phone)) <= 160
    and (full_name is null or length(trim(full_name)) <= 200)
    and (first_name is null or length(trim(first_name)) <= 120)
    and (last_name is null or length(trim(last_name)) <= 120)
    and (city is null or length(trim(city)) <= 160)
    and (preferred_language is null or length(trim(preferred_language)) <= 16)
    and (situation is null or length(trim(situation)) <= 2000)
    and (support_message is null or length(trim(support_message)) <= 2000)
    and (accompaniment_need is null or length(trim(accompaniment_need)) <= 64)
    and jsonb_typeof(talents) = 'array'
    and (avatar_url is null or length(trim(avatar_url)) <= 2048)
  );
