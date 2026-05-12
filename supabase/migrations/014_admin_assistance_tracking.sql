alter table public.prayer_requests
  drop constraint if exists prayer_requests_assistance_type_check;

alter table public.prayer_requests
  add constraint prayer_requests_assistance_type_check
  check (
    assistance_type is null
    or assistance_type in ('urgence_vitale', 'maladie', 'deuil', 'accompagnement')
  );

alter table public.prayer_requests
  add column if not exists assistance_status text not null default 'en_attente',
  add column if not exists internal_notes text;

alter table public.prayer_requests
  drop constraint if exists prayer_requests_assistance_status_check;

alter table public.prayer_requests
  add constraint prayer_requests_assistance_status_check
  check (assistance_status in ('en_attente', 'en_cours', 'accompagne'));

alter table public.prayer_requests
  drop constraint if exists prayer_requests_requester_user_id_fkey;

alter table public.prayer_requests
  add constraint prayer_requests_requester_user_id_fkey
  foreign key (requester_user_id)
  references public.profiles (id)
  on delete set null;

drop policy if exists "prayer_requests_insert_public" on public.prayer_requests;
create policy "prayer_requests_insert_public"
  on public.prayer_requests for insert
  to anon, authenticated
  with check (
    length(trim(message)) > 0
    and length(trim(message)) <= 1200
    and (
      (
        coalesce(source, 'app') = 'app'
        and (
          is_anonymous = true
          or (
            sender_name is not null
            and length(trim(sender_name)) > 0
            and length(trim(sender_name)) <= 120
          )
        )
      )
      or (
        source = 'assistance'
        and requester_user_id = auth.uid()
        and assistance_type in ('urgence_vitale', 'maladie', 'deuil', 'accompagnement')
        and contact is not null
        and length(trim(contact)) > 0
        and length(trim(contact)) <= 160
      )
    )
  );

drop policy if exists "prayer_requests_update_super_admin" on public.prayer_requests;
create policy "prayer_requests_update_super_admin"
  on public.prayer_requests for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'super-admin'
    )
  );
