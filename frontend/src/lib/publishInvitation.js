import { supabase } from './supabaseClient';

const API_URL = 'http://localhost:8000';

/**
 * Publishes an existing invitation by ID.
 * Generates/saves public_slug, published = true, and published_at.
 */
export async function publishInvitation(requestId, customSlug = null) {
  // First attempt via backend API
  try {
    const res = await fetch(`${API_URL}/publishInvitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, custom_slug: customSlug || undefined }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend /publishInvitation failed, trying direct Supabase update:', err);
  }

  // Fallback: Direct Supabase update
  const { data: row, error: fetchErr } = await supabase
    .from('invitation_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchErr || !row) {
    throw new Error('Failed to find invitation to publish.');
  }

  let slug = (customSlug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) {
    const baseName = (row.event_name || row.event_type || 'invite')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 28)
      .replace(/-+$/, '');
    const rand = Math.random().toString(36).substring(2, 8);
    slug = `${baseName || 'invite'}-${rand}`;
  }

  const nowIso = new Date().toISOString();
  let editorState = row.editor_state || {};
  if (typeof editorState === 'string') {
    try {
      editorState = JSON.parse(editorState);
    } catch {
      editorState = {};
    }
  }
  editorState.publish_info = {
    public_slug: slug,
    published: true,
    published_at: nowIso,
  };

  try {
    const { error: colErr } = await supabase
      .from('invitation_requests')
      .update({
        public_slug: slug,
        published: true,
        published_at: nowIso,
        editor_state: editorState,
      })
      .eq('id', requestId);

    if (colErr) throw colErr;
  } catch (err) {
    console.warn('Direct column update failed; saving in editor_state only:', err);
    const { error: stErr } = await supabase
      .from('invitation_requests')
      .update({ editor_state: editorState })
      .eq('id', requestId);
    if (stErr) throw stErr;
  }

  return {
    success: true,
    public_slug: slug,
    published: true,
    published_at: nowIso,
    request_id: requestId,
    public_url: `/invite/${slug}`,
  };
}

/**
 * Loads a published invitation by public slug.
 */
export async function getPublicInvite(slug) {
  const cleanSlug = (slug || '').trim().toLowerCase();

  // 1. Try backend API
  try {
    const res = await fetch(`${API_URL}/publicInvite/${encodeURIComponent(cleanSlug)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    if (res.status === 404 || res.status === 403) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Invitation not found or unpublished');
    }
  } catch (err) {
    if (err.message && (err.message.includes('not found') || err.message.includes('not published'))) {
      throw err;
    }
    console.warn('Backend fetch failed, trying direct Supabase lookup:', err);
  }

  // 2. Direct Supabase fallback
  let inv = null;
  try {
    const { data } = await supabase
      .from('invitation_requests')
      .select('*')
      .eq('public_slug', cleanSlug)
      .maybeSingle();
    if (data) inv = data;
  } catch (err) {
    console.warn('Query by public_slug column failed:', err);
  }

  if (!inv) {
    const { data: allRows } = await supabase
      .from('invitation_requests')
      .select('*');
    for (const r of allRows || []) {
      let st = r.editor_state;
      if (typeof st === 'string') {
        try { st = JSON.parse(st); } catch { st = {}; }
      }
      if (st?.publish_info?.public_slug === cleanSlug) {
        inv = r;
        inv.published = st.publish_info.published;
        inv.published_at = st.publish_info.published_at;
        inv.public_slug = cleanSlug;
        break;
      }
    }
  }

  if (!inv) {
    throw new Error('Invitation not found.');
  }

  const isPublished = inv.published ?? inv.editor_state?.publish_info?.published;
  if (!isPublished) {
    throw new Error('This invitation has not been published yet.');
  }

  // Load photos
  let photos = [];
  try {
    const { data: dbPhotos } = await supabase
      .from('event_photos')
      .select('*')
      .eq('invitation_id', inv.id)
      .order('created_at', { ascending: false });
    if (dbPhotos) photos = dbPhotos;
  } catch {
    photos = inv.editor_state?.event_photos || [];
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
  const fullUrl = publicUrl.startsWith('http') ? publicUrl : `${window.location.origin}${publicUrl}`;
  const text = `🎉 You're invited to *${title}*!\n\nView the invitation, event details, venue & directions here:\n👉 ${fullUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
