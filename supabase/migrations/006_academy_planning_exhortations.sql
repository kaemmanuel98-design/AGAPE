-- Tables Academy, Planning et Exhortation du jour.

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level text,
  module text,
  text_content text,
  video_url text,
  audio_url text,
  sort_order integer,
  created_at timestamptz not null default now()
);

alter table public.lessons add column if not exists title text;
alter table public.lessons add column if not exists level text;
alter table public.lessons add column if not exists module text;
alter table public.lessons add column if not exists text_content text;
alter table public.lessons add column if not exists video_url text;
alter table public.lessons add column if not exists audio_url text;
alter table public.lessons add column if not exists sort_order integer;
alter table public.lessons add column if not exists created_at timestamptz not null default now();

create index if not exists lessons_level_module_order_idx
  on public.lessons (level, module, sort_order, created_at desc);

create table if not exists public.planning (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  service_name text,
  regie text,
  protocole text,
  louange text,
  predication text,
  intercession text,
  accueil text,
  created_at timestamptz not null default now()
);

alter table public.planning add column if not exists service_date date;
alter table public.planning add column if not exists service_name text;
alter table public.planning add column if not exists regie text;
alter table public.planning add column if not exists protocole text;
alter table public.planning add column if not exists louange text;
alter table public.planning add column if not exists predication text;
alter table public.planning add column if not exists intercession text;
alter table public.planning add column if not exists accueil text;
alter table public.planning add column if not exists created_at timestamptz not null default now();

create index if not exists planning_service_date_idx
  on public.planning (service_date);

create table if not exists public.daily_exhortations (
  id uuid primary key default gen_random_uuid(),
  exhortation_date date not null default current_date,
  message text not null,
  audio_url text,
  created_at timestamptz not null default now()
);

alter table public.daily_exhortations add column if not exists exhortation_date date not null default current_date;
alter table public.daily_exhortations add column if not exists message text;
alter table public.daily_exhortations add column if not exists audio_url text;
alter table public.daily_exhortations add column if not exists created_at timestamptz not null default now();

create index if not exists daily_exhortations_date_idx
  on public.daily_exhortations (exhortation_date desc);

alter table public.lessons enable row level security;
alter table public.planning enable row level security;
alter table public.daily_exhortations enable row level security;

drop policy if exists "lessons_select_public" on public.lessons;
create policy "lessons_select_public"
  on public.lessons for select
  using (true);

drop policy if exists "planning_select_public" on public.planning;
create policy "planning_select_public"
  on public.planning for select
  using (true);

drop policy if exists "daily_exhortations_select_public" on public.daily_exhortations;
create policy "daily_exhortations_select_public"
  on public.daily_exhortations for select
  using (true);

drop policy if exists "lessons_insert_super_admin" on public.lessons;
create policy "lessons_insert_super_admin"
  on public.lessons for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "lessons_update_super_admin" on public.lessons;
create policy "lessons_update_super_admin"
  on public.lessons for update
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

drop policy if exists "lessons_delete_super_admin" on public.lessons;
create policy "lessons_delete_super_admin"
  on public.lessons for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "planning_insert_super_admin" on public.planning;
create policy "planning_insert_super_admin"
  on public.planning for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "planning_update_super_admin" on public.planning;
create policy "planning_update_super_admin"
  on public.planning for update
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

drop policy if exists "planning_delete_super_admin" on public.planning;
create policy "planning_delete_super_admin"
  on public.planning for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "daily_exhortations_insert_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_insert_super_admin"
  on public.daily_exhortations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "daily_exhortations_update_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_update_super_admin"
  on public.daily_exhortations for update
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

drop policy if exists "daily_exhortations_delete_super_admin" on public.daily_exhortations;
create policy "daily_exhortations_delete_super_admin"
  on public.daily_exhortations for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do update set public = true;

drop policy if exists "audio_select_public" on storage.objects;
create policy "audio_select_public"
  on storage.objects for select
  using (bucket_id = 'audio');

drop policy if exists "audio_insert_super_admin" on storage.objects;
create policy "audio_insert_super_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "audio_update_super_admin" on storage.objects;
create policy "audio_update_super_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  )
  with check (
    bucket_id = 'audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "audio_delete_super_admin" on storage.objects;
create policy "audio_delete_super_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
