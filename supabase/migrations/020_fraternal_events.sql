-- Événements fraternels affichés sur le calendrier (timeline) AGAPE
create table if not exists public.fraternal_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  meeting_url text,
  registration_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists fraternal_events_starts_at_idx
  on public.fraternal_events (starts_at asc);

alter table public.fraternal_events enable row level security;

drop policy if exists "fraternal_events_select_public" on public.fraternal_events;
create policy "fraternal_events_select_public"
  on public.fraternal_events for select
  to anon, authenticated
  using (true);

drop policy if exists "fraternal_events_write_super_admin" on public.fraternal_events;

drop policy if exists "fraternal_events_insert_super_admin" on public.fraternal_events;
create policy "fraternal_events_insert_super_admin"
  on public.fraternal_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "fraternal_events_update_super_admin" on public.fraternal_events;
create policy "fraternal_events_update_super_admin"
  on public.fraternal_events for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "fraternal_events_delete_super_admin" on public.fraternal_events;
create policy "fraternal_events_delete_super_admin"
  on public.fraternal_events for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
