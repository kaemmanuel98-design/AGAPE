-- Align tables for academy, planning and daily exhortations.
-- Safe to run after tables already exist in Supabase.

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid()
);

alter table public.lessons
  add column if not exists level text not null default 'Niveau 1',
  add column if not exists module_title text not null default 'Module',
  add column if not exists title text not null default 'Nouvelle leçon',
  add column if not exists content_kind text not null default 'text',
  add column if not exists text_content text,
  add column if not exists video_url text,
  add column if not exists audio_url text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.lessons drop constraint if exists lessons_content_kind_check;
alter table public.lessons
  add constraint lessons_content_kind_check
  check (content_kind in ('text', 'video', 'audio'));

create index if not exists lessons_level_module_sort_idx
  on public.lessons (level, module_title, sort_order, created_at desc);

alter table public.lessons enable row level security;

drop policy if exists "lessons_select_public" on public.lessons;
create policy "lessons_select_public"
  on public.lessons for select
  using (true);

drop policy if exists "lessons_insert_super_admin" on public.lessons;
create policy "lessons_insert_super_admin"
  on public.lessons for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "lessons_update_super_admin" on public.lessons;
create policy "lessons_update_super_admin"
  on public.lessons for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "lessons_delete_super_admin" on public.lessons;
create policy "lessons_delete_super_admin"
  on public.lessons for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create table if not exists public.planning (
  id uuid primary key default gen_random_uuid()
);

alter table public.planning
  add column if not exists service_date date not null default current_date,
  add column if not exists service_name text not null default 'Culte',
  add column if not exists regie text,
  add column if not exists protocole text,
  add column if not exists accueil text,
  add column if not exists louange text,
  add column if not exists predication text,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists planning_service_date_name_idx
  on public.planning (service_date, service_name);

create index if not exists planning_service_date_idx
  on public.planning (service_date asc);

alter table public.planning enable row level security;

drop policy if exists "planning_select_public" on public.planning;
create policy "planning_select_public"
  on public.planning for select
  using (true);

drop policy if exists "planning_insert_super_admin" on public.planning;
create policy "planning_insert_super_admin"
  on public.planning for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "planning_update_super_admin" on public.planning;
create policy "planning_update_super_admin"
  on public.planning for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "planning_delete_super_admin" on public.planning;
create policy "planning_delete_super_admin"
  on public.planning for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create table if not exists public.daily_exhortations (
  id uuid primary key default gen_random_uuid()
);

alter table public.daily_exhortations
  add column if not exists exhortation_date date not null default current_date,
  add column if not exists title text not null default 'Exhortation du jour',
  add column if not exists message text,
  add column if not exists audio_url text,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists daily_exhortations_date_idx
  on public.daily_exhortations (exhortation_date);

alter table public.daily_exhortations enable row level security;

drop policy if exists "daily_exhortations_select_public" on public.daily_exhortations;
create policy "daily_exhortations_select_public"
  on public.daily_exhortations for select
  using (true);

drop policy if exists "daily_exhortations_insert_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_insert_super_admin"
  on public.daily_exhortations for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "daily_exhortations_update_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_update_super_admin"
  on public.daily_exhortations for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "daily_exhortations_delete_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_delete_super_admin"
  on public.daily_exhortations for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

insert into storage.buckets (id, name, public)
values ('agape-media', 'agape-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "agape_media_select_public" on storage.objects;
create policy "agape_media_select_public"
  on storage.objects for select
  using (bucket_id = 'agape-media');

drop policy if exists "agape_media_insert_super_admin" on storage.objects;
create policy "agape_media_insert_super_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "agape_media_update_super_admin" on storage.objects;
create policy "agape_media_update_super_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "agape_media_delete_super_admin" on storage.objects;
create policy "agape_media_delete_super_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'agape-media'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
