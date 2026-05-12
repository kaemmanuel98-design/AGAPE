alter table public.profiles
  add column if not exists birth_date date;

create index if not exists profiles_birth_date_idx
  on public.profiles (birth_date);

create or replace function public.list_public_member_birthdays()
returns table (
  id uuid,
  first_names text,
  last_name text,
  avatar_url text,
  birth_date date
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.first_names,
    p.last_name,
    p.avatar_url,
    p.birth_date
  from public.profiles p
  where p.birth_date is not null
$$;

grant execute on function public.list_public_member_birthdays() to anon, authenticated;

create table if not exists public.birthday_messages (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles (id) on delete cascade,
  recipient_name text not null,
  sender_name text,
  message text not null,
  source text not null default 'calendar',
  created_at timestamptz not null default now()
);

create index if not exists birthday_messages_recipient_created_idx
  on public.birthday_messages (recipient_profile_id, created_at desc);

alter table public.birthday_messages enable row level security;

drop policy if exists "birthday_messages_insert_public" on public.birthday_messages;
create policy "birthday_messages_insert_public"
  on public.birthday_messages for insert
  to anon, authenticated
  with check (
    recipient_profile_id is not null
    and length(trim(recipient_name)) > 0
    and length(trim(message)) > 0
    and length(trim(message)) <= 300
    and (
      sender_name is null
      or length(trim(sender_name)) <= 80
    )
    and source in ('calendar', 'home')
  );

drop policy if exists "birthday_messages_select_owner_or_super_admin" on public.birthday_messages;
create policy "birthday_messages_select_owner_or_super_admin"
  on public.birthday_messages for select
  to authenticated
  using (
    auth.uid() = recipient_profile_id
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "birthday_messages_delete_super_admin" on public.birthday_messages;
create policy "birthday_messages_delete_super_admin"
  on public.birthday_messages for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
