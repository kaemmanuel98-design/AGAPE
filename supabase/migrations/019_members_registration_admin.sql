alter table public.members_registration
  add column if not exists archived boolean not null default false,
  add column if not exists admin_notes text;

create index if not exists members_registration_archived_created_idx
  on public.members_registration (archived asc, created_at desc);

drop policy if exists "members_registration_update_super_admin" on public.members_registration;
create policy "members_registration_update_super_admin"
  on public.members_registration for update
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
