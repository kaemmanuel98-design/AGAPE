alter table public.members_registration
  add column if not exists is_priority boolean not null default false;

create index if not exists members_registration_is_priority_idx
  on public.members_registration (is_priority desc, created_at desc);
