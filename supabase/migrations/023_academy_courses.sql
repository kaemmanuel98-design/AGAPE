-- Cours Academy : table dédiée (remplace l’usage public de `lessons` pour le catalogue / la lecture).
-- `is_featured` : affichage prioritaire sur la page d’accueil Academy (ex. GYNOSKO).

create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'Niveau 1',
  module_title text not null default 'Module',
  title text not null,
  content_kind text not null default 'text',
  text_content text,
  video_url text,
  audio_url text,
  author text,
  cover_image text,
  download_url text,
  external_link text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.academy_courses drop constraint if exists academy_courses_content_kind_check;

alter table public.academy_courses
  add constraint academy_courses_content_kind_check
  check (content_kind in ('text', 'article', 'video', 'audio', 'livre'));

create index if not exists academy_courses_sort_idx
  on public.academy_courses (sort_order asc, level asc, module_title asc, created_at desc);

create index if not exists academy_courses_featured_idx
  on public.academy_courses (is_featured desc, sort_order asc);

alter table public.academy_courses enable row level security;

drop policy if exists "academy_courses_select_public" on public.academy_courses;

create policy "academy_courses_select_public"
  on public.academy_courses for select
  to anon, authenticated
  using (true);

drop policy if exists "academy_courses_insert_super_admin" on public.academy_courses;

create policy "academy_courses_insert_super_admin"
  on public.academy_courses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

drop policy if exists "academy_courses_update_super_admin" on public.academy_courses;

create policy "academy_courses_update_super_admin"
  on public.academy_courses for update
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

drop policy if exists "academy_courses_delete_super_admin" on public.academy_courses;

create policy "academy_courses_delete_super_admin"
  on public.academy_courses for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );
