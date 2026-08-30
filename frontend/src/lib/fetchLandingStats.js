import { supabase } from './supabaseClient';

// Keys must match the `key` column seeded in landing_stats_migration.sql.
const STAT_KEYS = [
  'curated_designs',
  'cultural_traditions',
  'rsvp_response_rate',
  'ai_generation_speed',
];

/**
 * Fetches the landing-page stats-bar values from the `landing_stats` table.
 * Returns a { [key]: number } map. Any key missing from the response
 * (e.g. the table hasn't been migrated yet) safely falls back to 0, so the
 * stats bar never shows a hardcoded/placeholder number.
 */
export async function fetchLandingStats() {
  const fallback = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));

  const { data, error } = await supabase
    .from('landing_stats')
    .select('key, value')
    .in('key', STAT_KEYS);

  if (error || !data) {
    return fallback;
  }

  const result = { ...fallback };
  data.forEach((row) => {
    if (row?.key in result) {
      result[row.key] = Number(row.value) || 0;
    }
  });

  return result;
}