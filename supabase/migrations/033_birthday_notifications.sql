-- Préférences anniversaire + notifications in-app pour les membres connectés

alter table public.profiles
  add column if not exists notify_birthdays boolean not null default true;

comment on column public.profiles.notify_birthdays is
  'Si true, le membre reçoit des rappels lors des anniversaires des autres membres.';

create table if not exists public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'birthday_reminder',
  subject_profile_id uuid references public.profiles (id) on delete cascade,
  notification_date date not null default (current_date),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint member_notifications_kind_check check (kind in ('birthday_reminder')),
  constraint member_notifications_unique_daily unique (
    recipient_profile_id,
    kind,
    subject_profile_id,
    notification_date
  )
);

create index if not exists member_notifications_recipient_unread_idx
  on public.member_notifications (recipient_profile_id, read_at)
  where read_at is null;

create index if not exists member_notifications_recipient_created_idx
  on public.member_notifications (recipient_profile_id, created_at desc);

alter table public.member_notifications enable row level security;

drop policy if exists "member_notifications_select_own" on public.member_notifications;
create policy "member_notifications_select_own"
  on public.member_notifications for select
  to authenticated
  using (auth.uid() = recipient_profile_id);

drop policy if exists "member_notifications_update_own" on public.member_notifications;
create policy "member_notifications_update_own"
  on public.member_notifications for update
  to authenticated
  using (auth.uid() = recipient_profile_id)
  with check (auth.uid() = recipient_profile_id);

-- Insertions via service role (API serveur) uniquement
drop policy if exists "member_notifications_insert_service" on public.member_notifications;
create policy "member_notifications_insert_service"
  on public.member_notifications for insert
  to authenticated
  with check (false);
