import { supabase } from '../supabase';

export const fixtureService = {
  /**
   * Generates League fixtures (Round Robin)
   */
  async generateLeagueFixtures(
    tournamentId: string, 
    teamIds: string[], 
    startDate: Date, 
    venue: string,
    overs: number = 20
  ) {
    const matches = [];
    let currentDate = new Date(startDate);

    // Round Robin Logic
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        matches.push({
          tournament_id: tournamentId,
          team_a_id: teamIds[i],
          team_b_id: teamIds[j],
          venue,
          match_date: currentDate.toISOString(),
          overs_format: overs,
          status: 'scheduled',
          match_type: 'league'
        });
        
        // Increment date by 1 day for each match for now
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Generates Knockout brackets (Single Elimination)
   */
  async generateKnockoutBrackets(
    tournamentId: string,
    teamIds: string[],
    startDate: Date,
    venue: string,
    overs: number = 20
  ) {
    // Basic single elimination bracket generation (assuming power of 2 for simplicity now)
    const numTeams = teamIds.length;
    const matches = [];
    let currentDate = new Date(startDate);

    // For simplicity, we'll just pair them up sequentially for the first round
    for (let i = 0; i < numTeams; i += 2) {
      if (i + 1 < numTeams) {
        matches.push({
          tournament_id: tournamentId,
          team_a_id: teamIds[i],
          team_b_id: teamIds[i+1],
          venue,
          match_date: currentDate.toISOString(),
          overs_format: overs,
          status: 'scheduled',
          match_type: 'knockout_qf', // Defaulting to QF for 8 teams, etc.
          round: 'Quarter Final'
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (error) throw error;
    return data;
  },

  async getTournamentMatches(tournamentId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team_a:teams!team_a_id (*),
        team_b:teams!team_b_id (*)
      `)
      .eq('tournament_id', tournamentId)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data;
  }
};
