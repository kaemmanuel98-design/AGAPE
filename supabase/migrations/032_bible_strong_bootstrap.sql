-- Bible Strong : script unique pour Supabase SQL Editor.
-- À exécuter si vous avez l'erreur « relation bible_verses does not exist ».
-- Regroupe les migrations 024 (tables) + 030 (vues) + 031 (échantillon).

begin;

-- ---------------------------------------------------------------------------
-- 1) Tables de base (migration 024)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 2) Vues navigation livre / chapitre (migration 030)
-- ---------------------------------------------------------------------------

create or replace view public.bible_books_by_version as
select
  version_id,
  book_code,
  min(book_title) as book_title,
  min(book_sort) as book_sort,
  max(chapter) as max_chapter,
  count(*)::bigint as verse_count
from public.bible_verses
group by version_id, book_code;

create or replace view public.bible_chapters_by_version as
select
  version_id,
  book_code,
  chapter,
  count(*)::bigint as verse_count
from public.bible_verses
group by version_id, book_code, chapter;

grant select on public.bible_books_by_version to anon, authenticated;
grant select on public.bible_chapters_by_version to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Données d'exemple LSG + KJV (migration 031)
-- ---------------------------------------------------------------------------

insert into public.bible_versions (slug, title, language, notes)
values
  ('lsg', 'Louis Segond 1910', 'fr', 'Traduction française — échantillon'),
  ('kjv', 'King James Version', 'en', 'English — sample')
on conflict (slug) do update
set title = excluded.title,
    language = excluded.language,
    notes = excluded.notes;

insert into public.bible_verses (version_id, book_code, book_title, book_sort, chapter, verse, body_text)
select v.id, 'gen', 'Genèse', 1, 1, n.verse, n.body
from public.bible_versions v
cross join (
  values
    (1, 'Au commencement, Dieu créa les cieux et la terre.'),
    (2, 'La terre était informe et vide : il y avait des ténèbres à la surface de l''abîme, et l''esprit de Dieu se mouvait au-dessus des eaux.'),
    (3, 'Dieu dit : Que la lumière soit ! Et la lumière fut.')
) as n(verse, body)
where v.slug = 'lsg'
on conflict (version_id, book_code, chapter, verse) do update
set body_text = excluded.body_text,
    book_title = excluded.book_title;

insert into public.bible_verses (version_id, book_code, book_title, book_sort, chapter, verse, body_text)
select v.id, 'jhn', 'Jean', 43, 3, n.verse, n.body
from public.bible_versions v
cross join (
  values
    (16, 'Car Dieu a tant aimé le monde qu''il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu''il ait la vie éternelle.'),
    (17, 'Dieu, en effet, n''a pas envoyé son Fils dans le monde pour qu''il juge le monde, mais pour que le monde soit sauvé par lui.'),
    (18, 'Celui qui croit en lui n''est point jugé ; mais celui qui ne croit pas est déjà jugé, parce qu''il n''a pas cru au nom du Fils unique de Dieu.')
) as n(verse, body)
where v.slug = 'lsg'
on conflict (version_id, book_code, chapter, verse) do update
set body_text = excluded.body_text;

insert into public.bible_verses (version_id, book_code, book_title, book_sort, chapter, verse, body_text)
select v.id, 'jhn', 'John', 43, 3, 16,
  'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
from public.bible_versions v
where v.slug = 'kjv'
on conflict (version_id, book_code, chapter, verse) do update
set body_text = excluded.body_text;

commit;
