-- Bundle : colonnes manquantes pour inscription /rejoindre + profil public.
-- À exécuter dans Supabase → SQL Editor si check-profiles-schema signale des colonnes absentes.
-- Puis appliquer aussi 028_handle_new_user_member_metadata.sql si createUser échoue encore.

begin;

alter table public.profiles add column if not exists first_names text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists preferred_language text;
alter table public.profiles add column if not exists message text;
alter table public.profiles add column if not exists talents text[] not null default '{}'::text[];
alter table public.profiles add column if not exists member_talents jsonb not null default '[]'::jsonb;

commit;
