create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  sender_name text,
  message text not null,
  is_anonymous boolean not null default false,
  source text not null default 'app',
  created_at timestamptz not null default now()
);

create index if not exists prayer_requests_created_at_idx
  on public.prayer_requests (created_at desc);

alter table public.prayer_requests enable row level security;

drop policy if exists "prayer_requests_insert_public" on public.prayer_requests;
create policy "prayer_requests_insert_public"
  on public.prayer_requests for insert
  to anon, authenticated
  with check (
    length(trim(message)) > 0
    and length(trim(message)) <= 1200
    and (
      is_anonymous = true
      or (
        sender_name is not null
        and length(trim(sender_name)) > 0
        and length(trim(sender_name)) <= 120
      )
    )
  );

drop policy if exists "prayer_requests_select_super_admin" on public.prayer_requests;
create policy "prayer_requests_select_super_admin"
  on public.prayer_requests for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );

drop policy if exists "prayer_requests_delete_super_admin" on public.prayer_requests;
create policy "prayer_requests_delete_super_admin"
  on public.prayer_requests for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );
