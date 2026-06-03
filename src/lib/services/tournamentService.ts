import { supabase } from '../supabase';

export interface TournamentCreateData {
  name: string;
  format: 'league' | 'knockout' | 'hybrid';
  start_date?: string;
  end_date?: string;
}

export const tournamentService = {
  /**
   * Fetches all tournaments, ordered by most recent
   */
  async getAllTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Creates a new tournament and its default settings
   */
  async createTournament(tournamentData: TournamentCreateData) {
    // 1. Sanitize Data (convert empty strings to null for dates)
    const sanitizedData = {
      ...tournamentData,
      start_date: tournamentData.start_date || null,
      end_date: tournamentData.end_date || null,
      status: 'upcoming'
    };

    // 2. Create Tournament
    const { data: tournament, error: tourneyError } = await supabase
      .from('tournaments')
      .insert(sanitizedData)
      .select()
      .single();

    if (tourneyError) throw tourneyError;

    // 2. Initialize default settings for the tournament
    const { error: settingsError } = await supabase
      .from('tournament_settings')
      .insert({
        tournament_id: tournament.id,
        overs_per_match: 20,
        balls_per_over: 6,
        points_per_win: 2,
        points_per_tie: 1,
        points_per_no_result: 1
      });

    if (settingsError) {
      console.error('Failed to initialize tournament settings:', settingsError);
    }

    return tournament;
  },

  /**
   * Fetches specific tournament details along with settings
   */
  async getTournamentDetails(tournamentId: string) {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        tournament_settings (*)
      `)
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Assigns a team to a tournament
   */
  async assignTeam(tournamentId: string, teamId: string) {
    const { data, error } = await supabase
      .from('tournament_teams')
      .insert({ tournament_id: tournamentId, team_id: teamId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Removes a team from a tournament
   */
  async removeTeam(tournamentId: string, teamId: string) {
    const { error } = await supabase
      .from('tournament_teams')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId);

    if (error) throw error;
  },

  /**
   * Gets all teams registered for a specific tournament
   */
  async getTournamentTeams(tournamentId: string) {
    const { data, error } = await supabase
      .from('tournament_teams')
      .select(`
        id,
        registered_at,
        team:teams (*)
      `)
      .eq('tournament_id', tournamentId)
      .order('registered_at', { ascending: true });

    if (error) throw error;
    
    // Extract the nested team object for cleaner consuming API
    return data.map(item => item.team);
  }
};
