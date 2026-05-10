-- Rôle super-admin automatique pour un e-mail précis ; tous les autres → member.
-- Remplace la logique « premier inscrit » de la migration 004.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
  normalized_email text;
begin
  normalized_email := lower(trim(coalesce(new.email, '')));
  new_role := case normalized_email
    when 'kaemmanuel98@gmail.com' then 'super-admin'::text
    else 'member'::text
  end;

  insert into public.profiles (id, role)
  values (new.id, new_role)
  on conflict (id) do nothing;

  return new;
end;
$$;
