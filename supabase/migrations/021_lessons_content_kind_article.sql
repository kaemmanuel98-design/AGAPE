-- Permet le type de leçon « article » (cours écrit distinct du simple « text » historique si besoin).
alter table public.lessons drop constraint if exists lessons_content_kind_check;

alter table public.lessons
  add constraint lessons_content_kind_check
  check (content_kind in ('text', 'article', 'video', 'audio'));
