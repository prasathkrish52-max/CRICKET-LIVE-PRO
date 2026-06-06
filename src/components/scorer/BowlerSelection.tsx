"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

interface BowlerSelectionProps {
  matchId: string;
  bowlingTeamId: string;
  inningsId: string;
  onSelect: () => void;
}

export const BowlerSelection = ({ matchId, bowlingTeamId, inningsId, onSelect }: BowlerSelectionProps) => {
  const [bowlers, setBowlers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBowlers = useCallback(async () => {
    const { data: xi } = await supabase
      .from("playing_xi")
      .select("*, player:player_id(*)")
      .eq("match_id", matchId)
      .eq("team_id", bowlingTeamId);
    
    setBowlers(xi || []);
    setLoading(false);
  }, [matchId, bowlingTeamId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBowlers();
  }, [fetchBowlers]);

  const handleBowlerChange = async (bowlerId: string) => {
    setIsProcessing(true);
    const { error } = await supabase
      .from("innings")
      .update({ current_bowler_id: bowlerId })
      .eq("id", inningsId);
    
    if (!error) onSelect();
    setIsProcessing(false);
  };

  if (loading) return <div className="text-center py-10 animate-pulse text-stadium-gold font-bold">CHANGING ENDS...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-pitch/90 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-sm w-full border-stadium-gold/30">
        <CardHeader className="text-center">
          <h3 className="text-xl font-black uppercase tracking-tighter">New Over</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Select Next Bowler</p>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid gap-2">
            {bowlers.map((b) => (
              <button
                key={b.player.id}
                disabled={isProcessing}
                onClick={() => handleBowlerChange(b.player.id)}
                className="w-full text-left p-4 bg-white/5 hover:bg-stadium-gold/10 border border-white/10 rounded-xl transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm group-hover:text-stadium-gold">{b.player.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{b.player.bowling_style || "Bowler"}</span>
                </div>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
