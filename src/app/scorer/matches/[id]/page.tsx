import React, { use } from "react";
import ScoringClient from "./ScoringClient";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Scoring Console | Cricket Live Pro",
};

// Force dynamic rendering since matches update constantly
export const dynamic = "force-dynamic";

export default async function ScoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // 1. Fetch Match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)')
      .eq('id', id)
      .single();

    if (matchError) throw matchError;

    // 2. Fetch Innings
    const { data: allInnings } = await supabase
      .from('innings')
      .select('*')
      .eq('match_id', id)
      .order('innings_number', { ascending: true });

    let currentInnings = null;
    let initialBalls = [];
    let activePlayers = { striker: null, nonStriker: null, bowler: null };

    if (allInnings && allInnings.length > 0) {
      currentInnings = allInnings[allInnings.length - 1];

      // Fetch Balls
      const { data: balls } = await supabase
        .from('balls')
        .select('id, over_number, ball_number, runs_scored, is_wicket, extra_type, created_at, batsman_id, bowler_id')
        .eq('innings_id', currentInnings.id)
        .order('created_at', { ascending: true });
        
      if (balls) {
        initialBalls = balls;
      }

      // Fetch Active Players
      const playerIds = [
        currentInnings.current_striker_id, 
        currentInnings.current_non_striker_id, 
        currentInnings.current_bowler_id
      ].filter(Boolean);

      if (playerIds.length > 0) {
        const { data: players } = await supabase.from('players').select('*').in('id', playerIds);
        if (players) {
          activePlayers = {
            striker: players.find((p: any) => p.id === currentInnings.current_striker_id),
            nonStriker: players.find((p: any) => p.id === currentInnings.current_non_striker_id),
            bowler: players.find((p: any) => p.id === currentInnings.current_bowler_id),
          };
        }
      }
    }

    return (
      <ScoringClient 
        id={id}
        initialMatch={match}
        initialInnings={currentInnings}
        initialBalls={initialBalls}
        initialActivePlayers={activePlayers}
      />
    );

  } catch (err: any) {
    return (
      <div className="min-h-screen bg-pitch flex items-center justify-center p-6 text-center">
        <div className="glass-card p-12 max-w-md border-red-500/30">
          <p className="text-red-400 mb-6">Failed to load match data: {err.message}</p>
        </div>
      </div>
    );
  }
}
