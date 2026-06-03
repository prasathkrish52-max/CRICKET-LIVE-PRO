import { supabase } from '../supabase';

export interface TeamCreateData {
  name: string;
  logo_url?: string;
  owner_details?: any;
}

export interface PlayerCreateData {
  name: string;
  team_id: string;
  role: 'batsman' | 'bowler' | 'all-rounder';
  batting_style?: string;
  bowling_style?: string;
  jersey_number?: number;
}

export const teamService = {
  async getAllTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createTeam(teamData: TeamCreateData) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTeamWithPlayers(teamId: string) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        players (*)
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;
    return data;
  },

  async addPlayer(playerData: PlayerCreateData) {
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
