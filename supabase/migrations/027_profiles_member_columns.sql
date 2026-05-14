-- Colonnes « espace membre » sur public.profiles (inscription /rejoindre + page profil).
-- Compatible avec les projets qui n’utilisent pas la table members_registration.

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists current_need text;

alter table public.profiles
  add column if not exists message text;

alter table public.profiles
  add column if not exists talents text[] not null default '{}'::text[];

comment on column public.profiles.full_name is 'Nom affiché (prénom + nom) après inscription.';
comment on column public.profiles.avatar_url is 'URL publique Storage bucket avatars.';
comment on column public.profiles.current_need is 'Besoin d’accompagnement : soutien_moral, deuil, maladie, urgence.';
comment on column public.profiles.message is 'Message optionnel pour l’équipe.';
comment on column public.profiles.talents is 'Talents sélectionnés (clés stables, ex. musique_piano).';

alter table public.profiles
  add column if not exists city text;

alter table public.profiles
  add column if not exists preferred_language text;
