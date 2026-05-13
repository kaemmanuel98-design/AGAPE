create table if not exists public.members_registration (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text not null,
  city text,
  situation text,
  category text,
  support_message text,
  needs_urgent_help boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.members_registration
  enable row level security;

drop policy if exists "members_registration_insert_public" on public.members_registration;
create policy "members_registration_insert_public"
  on public.members_registration for insert
  to anon, authenticated
  with check (
    length(trim(phone)) > 0
    and length(trim(phone)) <= 160
    and (full_name is null or length(trim(full_name)) <= 160)
    and (city is null or length(trim(city)) <= 160)
    and (situation is null or length(trim(situation)) <= 300)
    and (support_message is null or length(trim(support_message)) <= 2000)
  );

drop policy if exists "members_registration_read_super_admin" on public.members_registration;
create policy "members_registration_read_super_admin"
  on public.members_registration for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

create index if not exists members_registration_created_at_idx
  on public.members_registration (created_at desc);
