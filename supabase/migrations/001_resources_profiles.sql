-- Exécuter ce script dans l'éditeur SQL Supabase (ou via CLI migrations).
-- Ajuste les politiques si ton projet a déjà une table profiles.

-- Table profils (rôles)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_read_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Ressources (YouTube + PDF)
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  resource_type text not null check (resource_type in ('youtube', 'pdf')),
  youtube_url text,
  pdf_url text,
  pdf_filename text,
  created_at timestamptz not null default now(),
  constraint resources_youtube check (
    resource_type <> 'youtube' or (youtube_url is not null and youtube_url <> '')
  ),
  constraint resources_pdf check (
    resource_type <> 'pdf' or (pdf_url is not null and pdf_url <> '')
  )
);

create index if not exists resources_created_at_idx on public.resources (created_at desc);

alter table public.resources enable row level security;

-- Lecture publique (page Découvrir sans connexion)
create policy "resources_select_public"
  on public.resources for select
  using (true);

-- Écriture réservée aux super-admin
create policy "resources_insert_super_admin"
  on public.resources for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create policy "resources_update_super_admin"
  on public.resources for update
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

create policy "resources_delete_super_admin"
  on public.resources for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- Bucket stockage PDF (créer le bucket "teaching-pdfs" en public dans l'UI si besoin)
insert into storage.buckets (id, name, public)
  values ('teaching-pdfs', 'teaching-pdfs', true)
  on conflict (id) do update set public = excluded.public;

-- Politiques storage
create policy "teaching_pdfs_select_public"
  on storage.objects for select
  using (bucket_id = 'teaching-pdfs');

create policy "teaching_pdfs_insert_super_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'teaching-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create policy "teaching_pdfs_update_super_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'teaching-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

create policy "teaching_pdfs_delete_super_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'teaching-pdfs'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super-admin'
    )
  );

-- Profil à la création du compte : à activer si besoin (syntaxe selon version PostgreSQL).
-- create or replace function public.handle_new_user() ...
-- create trigger on_auth_user_created after insert on auth.users ...
-- Sinon : après inscription, insérez manuellement une ligne dans profiles avec role 'member'.
