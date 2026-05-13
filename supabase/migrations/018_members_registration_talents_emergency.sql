alter table public.members_registration
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists preferred_language text,
  add column if not exists talents jsonb not null default '[]'::jsonb,
  add column if not exists accompaniment_need text,
  add column if not exists is_priority_emergency boolean not null default false;

create index if not exists members_registration_is_priority_emergency_idx
  on public.members_registration (is_priority_emergency desc, created_at desc);

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
  );
