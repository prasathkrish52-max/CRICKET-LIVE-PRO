import { supabase } from '../supabase';

export interface BallRecordData {
  innings_id: string;
  over_number: number;
  ball_number: number;
  batsman_id: string;
  bowler_id: string;
  runs_scored: number;
  is_wicket?: boolean;
  wicket_type?: string;
  dismissed_batsman_id?: string;
  fielder_id?: string;
  extra_type?: 'wide' | 'no_ball' | 'bye' | 'leg_bye' | null;
  extra_runs?: number;
  is_free_hit?: boolean;
  commentary?: string;
}

export const scoringService = {
  /**
   * Initializes a new innings for a team
   */
  async initializeInnings(matchId: string, teamId: string, inningsNumber: 1 | 2) {
    const { data, error } = await supabase
      .from('innings')
      .insert({
        match_id: matchId,
        team_id: teamId,
        innings_number: inningsNumber,
        total_runs: 0,
        total_wickets: 0,
        balls: 0,
        overs: 0.0,
        extras: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Records a ball and updates innings state (transactional via trigger/logic)
   */
  async recordBall(ballData: BallRecordData) {
    // In a production app, this could be a Supabase RPC to ensure atomicity
    // between inserting the ball and updating the innings totals.
    // For now, we rely on the application layer or database triggers.
    const { data: ball, error: ballError } = await supabase
      .from('balls')
      .insert(ballData)
      .select()
      .single();

    if (ballError) throw ballError;

    // Optional: Compute current innings state and update
    // This is often handled efficiently via triggers in PostgreSQL
    
    return ball;
  },

  /**
   * Updates the active players on the field
   */
  async updateActivePlayers(
    inningsId: string, 
    strikerId: string, 
    nonStrikerId: string, 
    bowlerId: string
  ) {
    const { data, error } = await supabase
      .from('innings')
      .update({
        current_striker_id: strikerId,
        current_non_striker_id: nonStrikerId,
        current_bowler_id: bowlerId
      })
      .eq('id', inningsId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes the most recent ball to undo an action
   */
  async undoLastBall(inningsId: string) {
    // 1. Fetch the most recent ball
    const { data: lastBall, error: fetchError } = await supabase
      .from('balls')
      .select('*')
      .eq('innings_id', inningsId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!lastBall) return null; // Nothing to undo

    // 2. Delete it
    const { error: deleteError } = await supabase
      .from('balls')
      .delete()
      .eq('id', lastBall.id);

    if (deleteError) throw deleteError;

    return lastBall;
  }
};
