alter table public.prayer_requests
  add column if not exists category text,
  add column if not exists phone_contact text;

update public.prayer_requests
set
  category = coalesce(category, assistance_type),
  phone_contact = coalesce(phone_contact, contact)
where category is null
   or phone_contact is null;

alter table public.prayer_requests
  drop constraint if exists prayer_requests_category_check;

alter table public.prayer_requests
  add constraint prayer_requests_category_check
  check (
    category is null
    or category in ('urgence_vitale', 'maladie', 'deuil', 'accompagnement')
  );

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
        and category in ('urgence_vitale', 'maladie', 'deuil', 'accompagnement')
        and phone_contact is not null
        and length(trim(phone_contact)) > 0
        and length(trim(phone_contact)) <= 160
      )
    )
  );
