-- Simple member profiles + children linked to the authenticated parent.

alter table public.profiles
  add column if not exists first_names text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_profile_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_profile_timestamp();

create or replace function public.preserve_profile_role()
returns trigger
language plpgsql
as $$
begin
  new.role := old.role;
  return new;
end;
$$;

drop trigger if exists profiles_preserve_role on public.profiles;
create trigger profiles_preserve_role
  before update on public.profiles
  for each row
  execute function public.preserve_profile_role();

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  first_names text not null,
  last_name text,
  phone text,
  address text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists child_profiles_parent_idx
  on public.child_profiles (parent_id, created_at desc);

alter table public.child_profiles enable row level security;

drop trigger if exists child_profiles_touch_updated_at on public.child_profiles;
create trigger child_profiles_touch_updated_at
  before update on public.child_profiles
  for each row
  execute function public.touch_profile_timestamp();

drop policy if exists "child_profiles_select_own" on public.child_profiles;
create policy "child_profiles_select_own"
  on public.child_profiles for select
  to authenticated
  using (auth.uid() = parent_id);

drop policy if exists "child_profiles_insert_own" on public.child_profiles;
create policy "child_profiles_insert_own"
  on public.child_profiles for insert
  to authenticated
  with check (auth.uid() = parent_id);

drop policy if exists "child_profiles_update_own" on public.child_profiles;
create policy "child_profiles_update_own"
  on public.child_profiles for update
  to authenticated
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

drop policy if exists "child_profiles_delete_own" on public.child_profiles;
create policy "child_profiles_delete_own"
  on public.child_profiles for delete
  to authenticated
  using (auth.uid() = parent_id);

drop policy if exists "agape_media_insert_member_profiles" on storage.objects;
create policy "agape_media_insert_member_profiles"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agape-media'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'children'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

drop policy if exists "agape_media_update_member_profiles" on storage.objects;
create policy "agape_media_update_member_profiles"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agape-media'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'children'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

drop policy if exists "agape_media_delete_member_profiles" on storage.objects;
create policy "agape_media_delete_member_profiles"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'agape-media'
    and (
      (
        (storage.foldername(name))[1] = 'profiles'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      or (
        (storage.foldername(name))[1] = 'children'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );
