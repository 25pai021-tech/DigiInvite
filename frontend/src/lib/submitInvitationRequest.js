import { supabase } from './supabaseClient';

const BUCKET = 'design-uploads';

/**
 * Uploads a single file to the design-uploads bucket under the user's id,
 * and returns its public URL.
 */
async function uploadFile(file, userId, folder) {
  const path = `${userId}/${folder}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
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

  const couplePhotoUrl = design.couplePhoto?.[0]
    ? await uploadFile(design.couplePhoto[0], user.id, 'couple-photo')
    : null;

  const referenceImageUrls = design.referenceImages?.length
    ? await Promise.all(design.referenceImages.map((file) => uploadFile(file, user.id, 'references')))
    : [];

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
        theme: design.theme || null,
        color: design.color || null,
        instructions: design.instructions || null,
        additional_notes: design.additionalNotes || null,
        couple_photo_url: couplePhotoUrl,
        reference_image_urls: referenceImageUrls,
        status: 'Pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data; // includes the generated id (use as the Request ID)
}
