import { supabase } from '../supabase';

export interface MatchScheduleData {
  tournament_id: string;
  team_a_id: string;
  team_b_id: string;
  venue?: string;
  match_date?: string;
  overs_format: number;
  match_type: 'league' | 'knockout_pre_qf' | 'knockout_qf' | 'knockout_sf' | 'knockout_final';
  round?: string;
}

export interface PlayingXISelection {
  player_id: string;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  position?: number;
  is_bench?: boolean;
}

export const matchService = {
  /**
   * Fetches matches for a tournament
   */
  async getTournamentMatches(tournamentId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team_a:teams!matches_team_a_id_fkey(id, name, logo_url),
        team_b:teams!matches_team_b_id_fkey(id, name, logo_url),
        winner:teams!matches_winner_id_fkey(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Schedules a new match
   */
  async scheduleMatch(matchData: MatchScheduleData) {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        ...matchData,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates match status (scheduled -> live -> completed)
   */
  async updateMatchStatus(matchId: string, status: 'scheduled' | 'live' | 'completed') {
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Records the toss result and decision
   */
  async recordToss(matchId: string, tossWonByTeamId: string, decision: 'bat' | 'field') {
    const { data, error } = await supabase
      .from('matches')
      .update({
        toss_won_by: tossWonByTeamId,
        toss_decision: decision
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Saves playing XI for a team in a match
   */
  async savePlayingXI(matchId: string, teamId: string, selections: PlayingXISelection[]) {
    // 1. Delete existing playing XI for this team in this match
    const { error: deleteError } = await supabase
      .from('playing_xi')
      .delete()
      .eq('match_id', matchId)
      .eq('team_id', teamId);

    if (deleteError) throw deleteError;

    // 2. Insert new selections
    const insertData = selections.map(s => ({
      ...s,
      match_id: matchId,
      team_id: teamId
    }));

    const { data, error: insertError } = await supabase
      .from('playing_xi')
      .insert(insertData)
      .select();

    if (insertError) throw insertError;
    return data;
  },
  
  /**
   * Locks the match from further Playing XI edits
   */
  async lockMatchPreRequisites(matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .update({ is_locked: true })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
