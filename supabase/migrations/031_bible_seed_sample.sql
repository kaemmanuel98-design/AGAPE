-- Échantillon pour tester la navigation (à compléter / importer pour la Bible entière).
-- Exécuter dans Supabase SQL Editor après 024 et 030.

insert into public.bible_versions (slug, title, language, notes)
values
  ('lsg', 'Louis Segond 1910', 'fr', 'Traduction française — échantillon'),
  ('kjv', 'King James Version', 'en', 'English — sample')
on conflict (slug) do update
set title = excluded.title,
    language = excluded.language,
    notes = excluded.notes;

-- Genèse 1:1–3 (LSG)
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

-- Jean 3:16–18 (LSG)
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

-- John 3:16 (KJV)
insert into public.bible_verses (version_id, book_code, book_title, book_sort, chapter, verse, body_text)
select v.id, 'jhn', 'John', 43, 3, 16,
  'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
from public.bible_versions v
where v.slug = 'kjv'
on conflict (version_id, book_code, chapter, verse) do update
set body_text = excluded.body_text;
