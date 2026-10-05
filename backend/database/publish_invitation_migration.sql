-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Adds columns and tables needed for the Smart Adaptive Invitation Publish feature.

-- 1. Add publish columns to invitation_requests
alter table invitation_requests
  add column if not exists public_slug text unique,
  add column if not exists published boolean not null default false,
  add column if not exists published_at timestamptz;

-- 2. Index on public_slug for fast lookup on public routes
create index if not exists idx_invitation_requests_public_slug
  on invitation_requests(public_slug);

-- 3. Create table for event photos uploaded by guests
create table if not exists event_photos (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitation_requests(id) on delete cascade,
  photo_url text not null,
  caption text,
  uploaded_by text default 'Guest',
  created_at timestamptz not null default now()
);

-- Index on invitation_id for fast event photos query
create index if not exists idx_event_photos_invitation_id
  on event_photos(invitation_id);

-- 4. Ensure storage bucket for event photos exists and is public
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

-- 5. RLS Policies for event_photos
alter table event_photos enable row level security;

-- Allow anyone (public) to view photos of an event
drop policy if exists "Public can view event_photos" on event_photos;
create policy "Public can view event_photos"
  on event_photos
  for select
  using (true);

-- Allow anyone (public, without login) to upload event photos
drop policy if exists "Public can insert event_photos" on event_photos;
create policy "Public can insert event_photos"
  on event_photos
  for insert
  with check (true);

-- 6. Allow public to read published invitation_requests
drop policy if exists "Anyone can read published invitation_requests" on invitation_requests;
create policy "Anyone can read published invitation_requests"
  on invitation_requests
  for select
  using (published = true or (auth.uid() is not null and auth.uid() = user_id));

-- 7. Storage policies for event-photos bucket
drop policy if exists "Public can upload event-photos" on storage.objects;
create policy "Public can upload event-photos"
  on storage.objects
  for insert
  with check (bucket_id = 'event-photos');

drop policy if exists "Public can view event-photos" on storage.objects;
create policy "Public can view event-photos"
  on storage.objects
  for select
  using (bucket_id = 'event-photos');
