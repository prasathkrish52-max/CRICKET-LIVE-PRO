import { supabase } from '../supabase';

// Centralized fetching logic
export async function getLiveMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      status,
      venue,
      match_date,
      team_a:teams!team_a_id(id, name, short_name),
      team_b:teams!team_b_id(id, name, short_name),
      innings (
        innings_number,
        total_runs,
        total_wickets,
        overs
      )
    `)
    .neq('status', 'completed')
    .order('status', { ascending: false })
    .order('match_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getScheduledMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      status,
      venue,
      match_date,
      team_a:teams!team_a_id(id, name, short_name),
      team_b:teams!team_b_id(id, name, short_name)
    `)
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true });

  if (error) throw error;
  return data || [];
}
