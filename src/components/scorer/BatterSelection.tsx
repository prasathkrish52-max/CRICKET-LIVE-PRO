"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

interface BatterSelectionProps {
  matchId: string;
  battingTeamId: string;
  inningsId: string;
  onSelect: (playerId: string) => void;
}

export const BatterSelection = ({ matchId, battingTeamId, inningsId, onSelect }: BatterSelectionProps) => {
  const [availableBatsmen, setAvailableBatsmen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableBatsmen();
  }, [matchId]);

  const fetchAvailableBatsmen = async () => {
    // 1. Get Playing XI
    const { data: xi } = await supabase
      .from("playing_xi")
      .select("*, player:player_id(*)")
      .eq("match_id", matchId)
      .eq("team_id", battingTeamId);

    // 2. Get Dismissed Players from balls table for this innings
    const { data: balls } = await supabase
      .from("balls")
      .select("dismissed_batsman_id")
      .eq("innings_id", inningsId)
      .not("dismissed_batsman_id", "is", null);
    
    // 3. Get currently on-field players from innings
    const { data: currentInnings } = await supabase
      .from("innings")
      .select("current_striker_id, current_non_striker_id")
      .eq("id", inningsId)
      .single();

    const dismissedIds = balls?.map((b: { dismissed_batsman_id: string }) => b.dismissed_batsman_id) || [];
    const activeIds = [currentInnings?.current_striker_id, currentInnings?.current_non_striker_id];
    const unavailableIds = [...dismissedIds, ...activeIds];

    const available = xi?.filter((p: any) => !unavailableIds.includes(p.player_id)) || [];
    setAvailableBatsmen(available);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-10 animate-pulse text-stadium-gold font-bold">READYING NEXT BATTER...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-pitch/90 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-sm w-full border-stadium-gold/30">
        <CardHeader className="text-center">
          <h3 className="text-xl font-black uppercase tracking-tighter">Next Batter</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Select Incoming Player</p>
        </CardHeader>
        <CardBody className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {availableBatsmen.map((p) => (
            <button
              key={p.player.id}
              onClick={() => onSelect(p.player.id)}
              className="w-full text-left p-4 bg-white/5 hover:bg-stadium-gold/10 border border-white/10 rounded-xl transition-all group flex justify-between items-center"
            >
              <div>
                <div className="font-bold text-sm group-hover:text-stadium-gold">{p.player.name}</div>
                <div className="text-[8px] text-slate-500 uppercase font-black">{p.player.role || "Batsman"}</div>
              </div>
              <div className="text-xs font-black text-slate-600">#{p.player.jersey_number || "—"}</div>
            </button>
          ))}
          {availableBatsmen.length === 0 && (
            <div className="text-center py-10 text-slate-500 italic text-xs">All players have batted. Innings Complete?</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
