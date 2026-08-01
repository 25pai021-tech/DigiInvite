-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Adds the two columns the new Fabric.js editor needs to save/reload a card's edits.

alter table invitation_requests
  add column if not exists editor_state jsonb,
  add column if not exists preview_url text;

-- Make sure the storage bucket used for saved previews & uploaded images exists.
-- (Skip this if 'design-uploads' already exists — it's the same bucket
-- submitInvitationRequest.js already uploads couple photos/reference images to.)
insert into storage.buckets (id, name, public)
values ('design-uploads', 'design-uploads', true)
on conflict (id) do nothing;

-- RLS: allow a signed-in user to update editor_state/preview_url only on their own request.
-- (Only needed if you don't already have a general "owner can update own rows" policy.)
drop policy if exists "Users can update own invitation_requests" on invitation_requests;
create policy "Users can update own invitation_requests"
  on invitation_requests
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
