-- Bibliothèque Academy : métadonnées pour les entrées de type « livre » (couverture, auteur, liens PDF / web).
alter table public.lessons
  add column if not exists author text,
  add column if not exists cover_image text,
  add column if not exists download_url text,
  add column if not exists external_link text;

alter table public.lessons drop constraint if exists lessons_content_kind_check;

alter table public.lessons
  add constraint lessons_content_kind_check
  check (content_kind in ('text', 'article', 'video', 'audio', 'livre'));
