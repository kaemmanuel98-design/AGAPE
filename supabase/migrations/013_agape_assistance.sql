alter table public.prayer_requests
  add column if not exists requester_user_id uuid references auth.users (id) on delete set null,
  add column if not exists assistance_type text,
  add column if not exists contact text;

alter table public.prayer_requests
  drop constraint if exists prayer_requests_assistance_type_check;

alter table public.prayer_requests
  add constraint prayer_requests_assistance_type_check
  check (
    assistance_type is null
    or assistance_type in ('urgence', 'maladie', 'deuil', 'accompagnement')
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
        and assistance_type in ('urgence', 'maladie', 'deuil', 'accompagnement')
        and contact is not null
        and length(trim(contact)) > 0
        and length(trim(contact)) <= 160
      )
    )
  );

create index if not exists prayer_requests_requester_user_idx
  on public.prayer_requests (requester_user_id, created_at desc);
