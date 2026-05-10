-- Table unifiée pour vidéos / PDF et catégories Adulte / Enfant

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type text not null check (content_type in ('video', 'pdf')),
  content_url text not null,
  category text not null check (category in ('adult', 'child')),
  created_at timestamptz not null default now()
);

create index if not exists contents_category_created_idx
  on public.contents (category, created_at desc);

alter table public.contents enable row level security;

drop policy if exists "contents_select_public" on public.contents;
create policy "contents_select_public"
  on public.contents for select
  using (true);

drop policy if exists "contents_insert_super_admin" on public.contents;
create policy "contents_insert_super_admin"
  on public.contents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "contents_delete_super_admin" on public.contents;
create policy "contents_delete_super_admin"
  on public.contents for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "contents_update_super_admin" on public.contents;
create policy "contents_update_super_admin"
  on public.contents for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
