import { supabase } from './supabaseClient';

function sampleFor(template, field, fallback) {
  const item = template.text_layout?.find((i) => i.field === field);
  return item?.sample || fallback;
}

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
        event_name: sampleFor(template, 'event_name', template.name || 'My Celebration'),
        host_name: sampleFor(template, 'host_name', 'Your Name'),
        venue: sampleFor(template, 'venue', 'Your Venue'),
        date: new Date().toISOString().slice(0, 10),
        time: '18:00',
        phone: 'Not provided',
        email: user.email || 'Not provided',
        generated_image_url: template.config?.full_image_url || null,
        status: 'Draft',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}