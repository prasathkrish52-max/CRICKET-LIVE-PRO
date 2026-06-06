"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

interface MatchInitializerProps {
  matchId: string;
  inningsId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  onComplete: () => void;
}

interface PlayerXi {
  team_id: string;
  player: { id: string, name: string };
}

export const MatchInitializer = ({ matchId, inningsId, battingTeamId, bowlingTeamId, onComplete }: MatchInitializerProps) => {
  const [battingSquad, setBattingSquad] = useState<PlayerXi[]>([]);
  const [bowlingSquad, setBowlingSquad] = useState<PlayerXi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selection, setSelection] = useState({
    striker_id: "",
    non_striker_id: "",
    bowler_id: "",
  });

  const fetchSquads = useCallback(async () => {
    // Fetch Playing XI for both teams
    const { data: xi } = await supabase
      .from("playing_xi")
      .select("*, player:player_id(*)")
      .eq("match_id", matchId);
    
    if (xi) {
      setBattingSquad(xi.filter((p: any) => p.team_id === battingTeamId));
      setBowlingSquad(xi.filter((p: any) => p.team_id === bowlingTeamId));
    }
    setLoading(false);
  }, [matchId, battingTeamId, bowlingTeamId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSquads();
  }, [fetchSquads]);

  const handleStartMatch = async () => {
    if (!selection.striker_id || !selection.non_striker_id || !selection.bowler_id) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("innings")
        .update({
          current_striker_id: selection.striker_id,
          current_non_striker_id: selection.non_striker_id,
          current_bowler_id: selection.bowler_id,
        })
        .eq("id", inningsId);

      if (error) throw error;
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-stadium-gold font-black">PREPARING FIELD...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-pitch/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight uppercase">Initialize Match</h1>
          <p className="text-slate-400 mt-2 font-medium">Select opening pair and first bowler to begin.</p>
        </div>

        <div className="space-y-6">
          {/* Batsmen Selection */}
          <Card className="border-white/5 bg-white/5">
            <CardHeader className="text-[10px] font-black text-stadium-gold uppercase tracking-widest">Opening Batsmen</CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Striker</label>
                <select 
                  className="w-full bg-pitch/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  value={selection.striker_id}
                  onChange={(e) => setSelection({...selection, striker_id: e.target.value})}
                >
                  <option value="">Select Striker</option>
                  {battingSquad.map(p => (
                    <option key={p.player.id} value={p.player.id} disabled={p.player.id === selection.non_striker_id}>{p.player.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Non-Striker</label>
                <select 
                  className="w-full bg-pitch/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  value={selection.non_striker_id}
                  onChange={(e) => setSelection({...selection, non_striker_id: e.target.value})}
                >
                  <option value="">Select Non-Striker</option>
                  {battingSquad.map(p => (
                    <option key={p.player.id} value={p.player.id} disabled={p.player.id === selection.striker_id}>{p.player.name}</option>
                  ))}
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Bowler Selection */}
          <Card className="border-white/5 bg-white/5">
            <CardHeader className="text-[10px] font-black text-stadium-gold uppercase tracking-widest">Opening Bowler</CardHeader>
            <CardBody className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Select Bowler</label>
              <select 
                className="w-full bg-pitch/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                value={selection.bowler_id}
                onChange={(e) => setSelection({...selection, bowler_id: e.target.value})}
              >
                <option value="">Select Bowler</option>
                {bowlingSquad.map(p => (
                  <option key={p.player.id} value={p.player.id}>{p.player.name}</option>
                ))}
              </select>
            </CardBody>
          </Card>

          <Button 
            variant="gold" 
            className="w-full h-16 uppercase font-black text-lg tracking-widest bg-stadium-emerald hover:bg-stadium-emerald/80 border-none shadow-lg shadow-stadium-emerald/20"
            disabled={!selection.striker_id || !selection.non_striker_id || !selection.bowler_id || isProcessing}
            onClick={handleStartMatch}
          >
            {isProcessing ? "BOOTSTRAPPING..." : "Start Live Match"}
          </Button>
        </div>
      </div>
    </div>
  );
};
