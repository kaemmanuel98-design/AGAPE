-- Vues pour naviguer livre → chapitre sans charger tous les versets côté client.

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
