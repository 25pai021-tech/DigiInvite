import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Publishes an existing invitation by ID.
 * Generates/saves public_slug, published = true, and published_at.
 */
export async function publishInvitation(requestId, customSlug = null) {
  // Always go through the backend so the Premium gate is enforced. (No direct
  // Supabase fallback — that would let a free user bypass the publish gate.)
  let res;
  try {
    res = await fetch(`${API_URL}/publishInvitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, custom_slug: customSlug || undefined }),
    });
  } catch {
    throw new Error('Could not reach the server to publish. Please try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || 'Failed to publish invitation.');
    err.status = res.status;   // 402 = Premium required
    throw err;
  }
  return data;
}

/**
 * Loads a published invitation by public slug.
 * PRIMARY path: backend API (uses service key, bypasses RLS — always works).
 * Fallback: direct Supabase query by public_slug column (requires migration to be run).
 */
export async function getPublicInvite(slug) {
  const cleanSlug = (slug || '').trim().toLowerCase();

  // 1. PRIMARY: backend API (service key bypasses RLS)
  try {
    const res = await fetch(`${API_URL}/publicInvite/${encodeURIComponent(cleanSlug)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    // Backend explicitly says not found/unpublished — don't fall through
    const errText = await res.text();
    let detail = 'Invitation not found or not published.';
    try { detail = JSON.parse(errText).detail || detail; } catch { /* use default */ }
    throw new Error(detail);
  } catch (err) {
    // If the error came from our throw above, re-throw
    if (!(err instanceof TypeError)) {
      throw err;
    }
    // TypeError = network error (backend not running) — try Supabase fallback
    console.warn('Backend unreachable, trying direct Supabase query:', err.message);
  }

  // 2. FALLBACK: direct Supabase query by public_slug column (requires migration)
  let inv = null;
  try {
    const { data, error } = await supabase
      .from('invitation_requests')
      .select('*')
      .eq('public_slug', cleanSlug)
      .eq('published', true)
      .maybeSingle();
    if (!error && data) inv = data;
  } catch (err) {
    console.warn('Direct Supabase query failed:', err);
  }

  if (!inv) {
    throw new Error(
      'Could not load invitation. Please ensure the backend is running or the Supabase migration has been applied.'
    );
  }

  // Load photos from Supabase
  let photos = [];
  try {
    const { data: dbPhotos } = await supabase
      .from('event_photos')
      .select('*')
      .eq('invitation_id', inv.id)
      .order('created_at', { ascending: false });
    if (dbPhotos) photos = dbPhotos;
  } catch {
    photos = [];
  }

  return { success: true, invitation: inv, photos };
}

/**
 * Uploads an event photo without requiring login.
 */
export async function uploadPublicEventPhoto(slug, file, caption = '', uploadedBy = 'Guest') {
  // 1. Try backend multipart endpoint first
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (uploadedBy) formData.append('uploaded_by', uploadedBy);

    const res = await fetch(`${API_URL}/publicInvite/${encodeURIComponent(slug)}/uploadPhoto`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.photo;
    }
  } catch (err) {
    console.warn('Backend photo upload failed, trying direct Supabase storage:', err);
  }

  // 2. Direct Supabase storage fallback
  const invData = await getPublicInvite(slug);
  const invId = invData.invitation.id;

  const ext = (file.name || 'photo.jpg').split('.').pop() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext.toLowerCase()) ? ext.toLowerCase() : 'jpg';
  const filePath = `${invId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
  const contentType = file.type || `image/${cleanExt}`;

  let targetBucket = 'event-photos';
  let { error: uploadError } = await supabase.storage.from(targetBucket).upload(filePath, file, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    // try design-uploads fallback
    targetBucket = 'design-uploads';
    const fallbackRes = await supabase.storage.from(targetBucket).upload(filePath, file, {
      contentType,
      upsert: false,
    });
    if (fallbackRes.error) throw new Error(`Photo upload failed: ${fallbackRes.error.message}`);
  }

  const { data: pubData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
  const photoUrl = pubData?.publicUrl;
  if (!photoUrl) throw new Error('Could not retrieve uploaded photo URL.');

  const photoRecord = {
    invitation_id: invId,
    photo_url: photoUrl,
    caption: caption || '',
    uploaded_by: uploadedBy || 'Guest',
    created_at: new Date().toISOString(),
  };

  try {
    const { data: inserted, error: insertError } = await supabase
      .from('event_photos')
      .insert([photoRecord])
      .select()
      .single();
    if (!insertError && inserted) return inserted;
  } catch {
    // fallback in editor_state
    const { data: curr } = await supabase
      .from('invitation_requests')
      .select('editor_state')
      .eq('id', invId)
      .single();
    let st = curr?.editor_state || {};
    if (typeof st === 'string') {
      try { st = JSON.parse(st); } catch { st = {}; }
    }
    const currPhotos = st.event_photos || [];
    photoRecord.id = `temp_${Date.now()}`;
    currPhotos.unshift(photoRecord);
    st.event_photos = currPhotos;
    await supabase.from('invitation_requests').update({ editor_state: st }).eq('id', invId);
  }

  return photoRecord;
}

/**
 * Generates a WhatsApp share URL with pre-filled invitation text.
 */
export function getWhatsAppShareUrl(title, publicUrl) {
  const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  const fullUrl = publicUrl.startsWith('http') ? publicUrl : `${SITE_URL}${publicUrl}`;
  const text = `🎉 You're invited to *${title}*!\n\nView the invitation, event details, venue & directions here:\n👉 ${fullUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
