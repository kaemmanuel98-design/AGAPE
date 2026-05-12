create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  message text not null,
  source text not null default 'kids',
  created_at timestamptz not null default now()
);

create index if not exists confessions_created_at_idx
  on public.confessions (created_at desc);

alter table public.confessions enable row level security;

drop policy if exists "confessions_insert_public" on public.confessions;
create policy "confessions_insert_public"
  on public.confessions for insert
  to anon, authenticated
  with check (
    source = 'kids'
    and length(trim(child_name)) > 0
    and length(trim(message)) > 0
  );

drop policy if exists "confessions_select_super_admin" on public.confessions;
create policy "confessions_select_super_admin"
  on public.confessions for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "confessions_delete_super_admin" on public.confessions;
create policy "confessions_delete_super_admin"
  on public.confessions for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
