-- =============================================================================
-- VELMONT — Contact form submissions
-- =============================================================================

create table public.contact_submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_submissions_resolved_idx on public.contact_submissions(is_resolved);

alter table public.contact_submissions enable row level security;

-- Inserted only via the service role from the /api/contact route (which
-- rate-limits and validates first), so no public insert policy is needed.
create policy "contact_submissions_staff_read" on public.contact_submissions
  for select using (public.is_staff());
create policy "contact_submissions_staff_update" on public.contact_submissions
  for update using (public.is_staff());
