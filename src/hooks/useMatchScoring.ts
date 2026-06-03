"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Ball {
  id?: string;
  innings_id: string;
  over_number: number;
  ball_number: number;
  batsman_id: string;
  bowler_id: string;
  runs_scored: number;
  is_wicket: boolean;
  wicket_type?: string;
  fielder_id?: string;
  dismissed_batsman_id?: string | null;
  extra_type?: "wide" | "no_ball" | "bye" | "leg_bye";
  extra_runs: number;
  commentary?: string;
}

export interface Innings {
  id: string;
  match_id: string;
  team_id: string;
  innings_number: number;
  total_runs: number;
  total_wickets: number;
  overs: number;
  balls: number;
  extras: number;
  current_striker_id: string | null;
  current_non_striker_id: string | null;
  current_bowler_id: string | null;
  striker?: { id: string, name: string };
  non_striker?: { id: string, name: string };
  bowler?: { id: string, name: string };
}

export const useMatchScoring = (matchId: string) => {
  const [match, setMatch] = useState<any>(null);
  const [currentInnings, setCurrentInnings] = useState<Innings | null>(null);
  const [balls, setBalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial match, innings, and balls data
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*, team_a:team_a_id(name), team_b:team_b_id(name)")
          .eq("id", matchId)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData);

        const { data: inningsData, error: inningsError } = await supabase
          .from("innings")
          .select("*")
          .eq("match_id", matchId)
          .order("innings_number", { ascending: false })
          .limit(1);

        if (inningsError) throw inningsError;
        if (inningsData && inningsData.length > 0) {
          const activeInnings = inningsData[0];
          // Fetch full innings detail with player names
          const { data: inningsDetail, error: detailError } = await supabase
            .from("innings")
            .select("*, striker:current_striker_id(id, name), non_striker:current_non_striker_id(id, name), bowler:current_bowler_id(id, name)")
            .eq("id", activeInnings.id)
            .single();

          if (inningsDetail) {
            setCurrentInnings(inningsDetail);
          }

          const { data: ballsData, error: ballsError } = await supabase
            .from("balls")
            .select("*, batsman:batsman_id(name), bowler:bowler_id(name)")
            .eq("innings_id", activeInnings.id)
            .order("created_at", { ascending: false });

          if (ballsError) throw ballsError;
          setBalls(ballsData || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();

    // Subscribe to innings updates
    const inningsChannel = supabase
      .channel(`match_innings_${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "innings", filter: `match_id=eq.${matchId}` },
        (payload: { new: Innings }) => {
          setCurrentInnings(payload.new);
        }
      )
      .subscribe();

    // Subscribe to balls updates
    const ballsChannel = supabase
      .channel(`match_balls_${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "balls" },
        async (payload: any) => {
          if (payload.eventType === "INSERT") {
            // Fetch names for the new ball
            const { data: newBall } = await supabase
              .from("balls")
              .select("*, batsman:batsman_id(name), bowler:bowler_id(name)")
              .eq("id", payload.new.id)
              .single();
            
            if (newBall) {
              setBalls((prev: any[]) => [newBall, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setBalls((prev: any[]) => prev.filter((b: any) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inningsChannel);
      supabase.removeChannel(ballsChannel);
    };
  }, [matchId]);

  const recordBall = useCallback(async (ballData: Omit<Ball, "innings_id">) => {
    if (!currentInnings) return;

    try {
      // 1. Insert the ball record
      const { data: ball, error: ballError } = await supabase
        .from("balls")
        .insert([{ ...ballData, innings_id: currentInnings.id }])
        .select()
        .single();

      if (ballError) throw ballError;

      // 2. Calculate new innings state
      const isExtra = !!ballData.extra_type;
      const isWicket = ballData.is_wicket;
      const totalRunsFromBall = ballData.runs_scored + ballData.extra_runs;
      
      const newTotalRuns = currentInnings.total_runs + totalRunsFromBall;
      const newTotalWickets = isWicket ? currentInnings.total_wickets + 1 : currentInnings.total_wickets;
      const newExtras = isExtra ? currentInnings.extras + ballData.extra_runs : currentInnings.extras;
      
      // Strike Rotation Logic (Runs scored by batsman)
      let newStrikerId = currentInnings.current_striker_id;
      let newNonStrikerId = currentInnings.current_non_striker_id;

      const runsScoredByBatsman = ballData.runs_scored;
      const shouldRotate = [1, 3, 5].includes(runsScoredByBatsman);

      if (shouldRotate) {
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
      }

      // Handle Wicket Dismissal
      if (ballData.is_wicket && ballData.dismissed_batsman_id) {
        if (newStrikerId === ballData.dismissed_batsman_id) {
          newStrikerId = null;
        } else if (newNonStrikerId === ballData.dismissed_batsman_id) {
          newNonStrikerId = null;
        }
      }

      // Update balls/overs count
      const isLegalBall = !["wide", "no_ball"].includes(ballData.extra_type || "");
      let newBalls = currentInnings.balls;
      let newOvers = currentInnings.overs;

      if (isLegalBall) {
        newBalls += 1;
        if (newBalls === 6) {
          newBalls = 0;
          newOvers += 1;
          // Over End Strike Rotation
          [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
        }
      }

      // 3. Update innings record
      const { error: updateError } = await supabase
        .from("innings")
        .update({
          total_runs: newTotalRuns,
          total_wickets: newTotalWickets,
          balls: newBalls,
          overs: newOvers,
          extras: newExtras,
          current_striker_id: newStrikerId,
          current_non_striker_id: newNonStrikerId,
          // We null out current_bowler_id if over ends to trigger bowler selection
          current_bowler_id: newBalls === 0 && isLegalBall ? null : currentInnings.current_bowler_id,
        })
        .eq("id", currentInnings.id);

      // 4. Detect Innings End
      const isTenWickets = newTotalWickets === 10;
      const isOversComplete = newOvers === 20; // Assume 20 overs for now, can be dynamic
      
      // Target Check for 2nd Innings
      let isTargetReached = false;
      if (currentInnings.innings_number === 2) {
        // We'd need to fetch Innings 1 total runs here to be precise
        // For now, assume we'll check this in the next iteration or UI
      }

      if (isTenWickets || isOversComplete || isTargetReached) {
        // Mark innings as completed in future schema or just stop here
      }

    } catch (err: any) {
      setError(err.message);
    }
  }, [currentInnings]);

  const undoLastBall = useCallback(async () => {
    if (!currentInnings) return;

    try {
      // 1. Get the last ball
      const { data: lastBall, error: fetchError } = await supabase
        .from("balls")
        .select("*")
        .eq("innings_id", currentInnings.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!lastBall) {
        console.warn("No balls to undo");
        return;
      }

      // 2. Recalculate innings state (Reverse the ball)
      const totalRunsFromBall = lastBall.runs_scored + lastBall.extra_runs;
      const isLegalBall = !["wide", "no_ball"].includes(lastBall.extra_type || "");
      
      let newTotalRuns = currentInnings.total_runs - totalRunsFromBall;
      let newTotalWickets = lastBall.is_wicket ? currentInnings.total_wickets - 1 : currentInnings.total_wickets;
      let newExtras = lastBall.extra_type ? currentInnings.extras - lastBall.extra_runs : currentInnings.extras;
      
      let newBalls = currentInnings.balls;
      let newOvers = currentInnings.overs;

      if (isLegalBall) {
        if (newBalls === 0) {
          newBalls = 5;
          newOvers -= 1;
        } else {
          newBalls -= 1;
        }
      }

      // 3. Delete the ball and update innings
      const { error: deleteError } = await supabase.from("balls").delete().eq("id", lastBall.id);
      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("innings")
        .update({
          total_runs: Math.max(0, newTotalRuns),
          total_wickets: Math.max(0, newTotalWickets),
          balls: newBalls,
          overs: Math.max(0, newOvers),
          extras: Math.max(0, newExtras),
        })
        .eq("id", currentInnings.id);

      if (updateError) throw updateError;

    } catch (err: any) {
      setError(err.message);
    }
  }, [currentInnings]);

  const completeInnings = useCallback(async () => {
    if (!currentInnings || !match) return;

    try {
      if (currentInnings.innings_number === 1) {
        // Start 2nd Innings
        const bowlingTeamId = currentInnings.team_id === match.team_a_id ? match.team_b_id : match.team_a_id;
        const { error } = await supabase.from("innings").insert([
          { match_id: matchId, team_id: bowlingTeamId, innings_number: 2 }
        ]);
        if (error) throw error;
        window.location.reload(); // Refresh to load new innings
      } else {
        // End Match
        // Winner calculation logic will be handled by the UI before calling setMatchStatus
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentInnings, match, matchId]);

  const setMatchStatus = useCallback(async (status: string, winnerId: string | null) => {
    const { error } = await supabase
      .from("matches")
      .update({ status, winner_id: winnerId })
      .eq("id", matchId);
    
    if (error) throw error;
  }, [matchId]);

  return {
    match,
    currentInnings,
    balls,
    loading,
    error,
    recordBall,
    undoLastBall,
    completeInnings,
    setMatchStatus,
  };
};
