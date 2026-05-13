-- ==========================================================
-- 1. TABLE : LESSONS (Académie)
-- ========================== ================================
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

-- Contrainte pour le type de contenu
alter table public.lessons drop constraint if exists lessons_content_kind_check;
alter table public.lessons 
  add constraint lessons_content_kind_check 
  check (content_kind in ('text', 'video', 'audio'));

create index if not exists lessons_level_module_sort_idx 
  on public.lessons (level, module_title, sort_order, created_at desc);

-- ==========================================================
-- 2. TABLE : PLANNING
-- ==========================================================
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
  add column if not exists intercession text, -- Champ spécifique gardé
  add column if not exists created_at timestamptz not null default now();

-- Évite d'avoir deux plannings pour le même culte le même jour
create unique index if not exists planning_service_date_name_idx 
  on public.planning (service_date, service_name);

create index if not exists planning_service_date_idx 
  on public.planning (service_date asc);

-- ==========================================================
-- 3. TABLE : DAILY EXHORTATIONS
-- ==========================================================
create table if not exists public.daily_exhortations (
  id uuid primary key default gen_random_uuid()
);

alter table public.daily_exhortations
  add column if not exists exhortation_date date not null default current_date,
  add column if not exists title text not null default 'Exhortation du jour',
  add column if not exists message text,
  add column if not exists audio_url text,
  add column if not exists created_at timestamptz not null default now();

-- Une seule exhortation par jour
create unique index if not exists daily_exhortations_date_idx 
  on public.daily_exhortations (exhortation_date);

-- ==========================================================
-- 4. SÉCURITÉ (RLS)
-- ==========================================================
alter table public.lessons enable row level security;
alter table public.planning enable row level security;
alter table public.daily_exhortations enable row level security;

-- Politiques de lecture publique
do $$ 
begin
  drop policy if exists "lessons_select_public" on public.lessons;
  drop policy if exists "planning_select_public" on public.planning;
  drop policy if exists "daily_exhortations_select_public" on public.daily_exhortations;
end $$;

create policy "lessons_select_public" on public.lessons for select using (true);
create policy "planning_select_public" on public.planning for select using (true);
create policy "daily_exhortations_select_public" on public.daily_exhortations for select using (true);

-- Politiques de modification (Super-Admin uniquement)
-- Note : Répété pour chaque table via une boucle ou manuellement
do $$ 
  declare 
    t text;
  begin
    for t in array ['lessons', 'planning', 'daily_exhortations'] loop
      execute format('drop policy if exists %I on public.%I', t || '_modify_admin', t);
      execute format('
        create policy %I on public.%I for all to authenticated
        using (exists (select 1 from public.profiles where id = auth.uid() and role = ''super-admin''))', 
        t || '_modify_admin', t);
    end loop;
end $$;

-- ==========================================================
-- 5. STOCKAGE (Storage)
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('agape-media', 'agape-media', true)
on conflict (id) do update set public = excluded.public;

-- Politique d'accès public aux fichiers
drop policy if exists "agape_media_select_public" on storage.objects;
create policy "agape_media_select_public" on storage.objects 
  for select using (bucket_id = 'agape-media');

-- Politique d'upload Admin
drop policy if exists "agape_media_admin_all" on storage.objects;
create policy "agape_media_admin_all" on storage.objects 
  for all to authenticated
  using (
    bucket_id = 'agape-media' 
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'super-admin')
  );