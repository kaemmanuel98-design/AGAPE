-- Premier utilisateur Auth → role super-admin (pour pouvoir gérer l’admin sans SQL manuel).
-- Les suivants → member.
-- Idempotent : réécrit la fonction et les politiques ci-dessous.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
begin
  select case
    when exists (select 1 from public.profiles where role = 'super-admin')
    then 'member'::text
    else 'super-admin'::text
  end
  into new_role;

  insert into public.profiles (id, role)
  values (new.id, new_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Secours si le trigger n’a pas tourné : l’utilisateur ne peut insérer que sa propre ligne en « member » (pas d’élévation via le client).
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (
    auth.uid() = id
    and role = 'member'
  );
