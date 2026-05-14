-- Espace Bible Strong : texte biblique uniquement (versions + versets éditables dans Supabase).
-- Les numéros Strong peuvent être saisis dans `body_text` au format (G123) ou (H456) pour des liens lexique.

create table if not exists public.bible_versions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  language text not null default 'fr',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bible_verses (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.bible_versions (id) on delete cascade,
  book_code text not null,
  book_title text not null,
  book_sort integer not null default 1,
  chapter integer not null check (chapter >= 1),
  verse integer not null check (verse >= 1),
  body_text text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (version_id, book_code, chapter, verse)
);

create index if not exists bible_verses_version_book_sort_idx
  on public.bible_verses (version_id, book_sort asc, chapter asc, verse asc);

alter table public.bible_versions enable row level security;
alter table public.bible_verses enable row level security;

drop policy if exists "bible_versions_select_public" on public.bible_versions;
create policy "bible_versions_select_public"
  on public.bible_versions for select
  to anon, authenticated
  using (true);

drop policy if exists "bible_verses_select_public" on public.bible_verses;
create policy "bible_verses_select_public"
  on public.bible_verses for select
  to anon, authenticated
  using (true);
