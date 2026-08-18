import { supabase } from './supabaseClient';

/**
 * Creates a bare invitation request straight from a chosen template,
 * with no form. Fills every required field with a safe placeholder
 * the user can immediately overwrite inside the editor.
 * Returns the new request's id so the caller can navigate to the editor.
 */
export async function startFromTemplate(template) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to customize a template.');
  }

  const { data, error } = await supabase
    .from('invitation_requests')
    .insert([
      {
        user_id: user.id,
        template_id: template.id,
        event_type: template.event_type,
        theme: template.theme || null,
        event_name: template.name || 'My Celebration',
        host_name: user.user_metadata?.full_name || 'Your Name',
        date: new Date().toISOString().slice(0, 10),
        time: '18:00',
        venue: 'Your Venue',
        phone: 'Not provided',
        email: user.email || 'Not provided',
        generated_image_url: template.config?.full_image_url || null,
        status: 'Preview Ready',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}