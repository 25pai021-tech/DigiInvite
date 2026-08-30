-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Phase 3: the four landing-page "stats bar" numbers (Curated Designs,
-- Cultural Traditions, RSVP Response Rate, AI Generation Speed) must no
-- longer be hardcoded in the frontend — they need to come from the database.
--
-- None of the existing tables (templates, invitation_requests, invitations,
-- rsvp, admins) already store these four metrics directly, so this adds the
-- smallest possible new table to hold them: one row per stat, keyed by a
-- stable slug, with a numeric value the frontend can read. All four rows
-- are seeded at 0 as required; real values can be populated/updated later
-- (manually, or by a scheduled job) without any further schema changes.

create table if not exists landing_stats (
  key text primary key,
  label text not null,
  value numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- Seed the four stats currently shown on the landing page, all starting at 0.
-- Uses upsert so re-running this migration is safe and never overwrites a
-- value that has already been updated away from its seed default elsewhere.
insert into landing_stats (key, label, value)
values
  ('curated_designs', 'Curated Designs', 0),
  ('cultural_traditions', 'Cultural Traditions', 0),
  ('rsvp_response_rate', 'RSVP Response Rate', 0),
  ('ai_generation_speed', 'AI Generation Speed', 0)
on conflict (key) do nothing;

-- RLS: the landing page is public, so anyone (including signed-out visitors)
-- needs to be able to read these values. No write access is granted here —
-- updates should go through an authenticated/admin path added separately.
alter table landing_stats enable row level security;

drop policy if exists "Anyone can read landing_stats" on landing_stats;
create policy "Anyone can read landing_stats"
  on landing_stats
  for select
  using (true);