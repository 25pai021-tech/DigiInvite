import { supabase } from './supabaseClient';


import { fixSpelling } from './spellFix';
const BUCKET = 'design-uploads';

/**
 * Uploads a single file to the design-uploads bucket under the user's id,
 * and returns its public URL.
 */
async function uploadFile(file, userId, folder) {
  if (!file) return null;
  const safeName = (file.name || 'image.png').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${folder}/${Date.now()}-${safeName}`;
  const contentType = file.type || 'image/jpeg';

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (uploadError) {
    console.error('Storage upload failed:', uploadError);
    throw new Error(`Upload failed for ${file.name}: ${uploadError.message || 'Storage error'}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error(`Failed to retrieve public URL for ${file.name}`);
  }
  return data.publicUrl;
}

/**
 * Uploads any attached images, then inserts the invitation request.
 * Replaces the mockSubmit() placeholder in CreateInvitation.jsx.
 *
 * payload: { eventType, details, design }
 */
export async function submitInvitationRequest({ eventType, details, design, template }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to submit a request.');
  }

  let couplePhotoUrl = null;
  if (design.couplePhoto?.[0]) {
    try {
      couplePhotoUrl = await uploadFile(design.couplePhoto[0], user.id, 'couple-photo');
    } catch (err) {
      throw new Error(`Failed to upload couple photo: ${err.message}`);
    }
  }

  let referenceImageUrls = [];
  if (design.referenceImages?.length) {
    try {
      referenceImageUrls = await Promise.all(
        design.referenceImages.map((file) => uploadFile(file, user.id, 'references'))
      );
    } catch (err) {
      throw new Error(`Failed to upload reference images: ${err.message}`);
    }
  }

  const { data, error } = await supabase
    .from('invitation_requests')
    .insert([
      {
        user_id: user.id,
        event_type: eventType,
        template_id: template?.id || null,
        generated_image_url: template?.config?.full_image_url || null,
        event_name: details.eventName,
        host_name: details.hostName,
        bride_name: details.brideName || null,
        groom_name: details.groomName || null,
        date: details.date,
        time: details.time,
        venue: details.venue,
        phone: details.phone,
        email: details.email,
        map_link: details.mapLink || null,
        special_message: details.specialMessage || null,
        theme: design.theme === 'custom' ? (design.customTheme?.trim() || 'Custom') : (design.theme || null),
        color: design.color || null,
        instructions: design.instructions || null,
        additional_notes: design.additionalNotes || null,
        couple_photo_url: couplePhotoUrl,
        reference_image_urls: referenceImageUrls,
        status: 'Pending',
        event_name: fixSpelling(details.eventName),
        host_name: fixSpelling(details.hostName),
        special_message: fixSpelling(details.specialMessage) || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data; // includes the generated id (use as the Request ID)
}
