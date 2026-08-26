import { supabase } from './supabaseClient';

function sampleFor(template, field, fallback) {
  const item = template.text_layout?.find((i) => i.field === field);
  return item?.sample || fallback;
}

function guessTitle(template) {
  const layout = template.text_layout;
  if (Array.isArray(layout) && layout.length > 0) {
    const biggest = [...layout].sort((a, b) => (b.size || 0) - (a.size || 0))[0];
    if (biggest?.sample) return biggest.sample;
  }
  return template.name || 'My Celebration';
}

export async function startFromTemplate(template) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to customize a template.');
  }
  function formatCategory(eventType) {
  if (!eventType) return '';
  return eventType
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

  const { data, error } = await supabase
    .from('invitation_requests')
    .insert([
      {
        user_id: user.id,
        template_id: template.id,
        event_type: template.event_type,
        theme: template.theme || null,
        event_name: `${formatCategory(template.event_type)} · ${guessTitle(template)}`,
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