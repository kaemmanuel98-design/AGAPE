-- Catégorie catalogue Academy (filtres UI) : valeur libre éditable dans Supabase (ex. integration, data, musique, communaute).

alter table public.academy_courses
  add column if not exists catalog_category text not null default 'communaute';

comment on column public.academy_courses.catalog_category is
  'Clé ou libellé court pour regrouper les cours (filtres sur /academy). À modifier directement dans Supabase.';

create index if not exists academy_courses_catalog_category_idx
  on public.academy_courses (catalog_category);
