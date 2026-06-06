"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

export default function SquadManagementPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Player Form
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "batsman",
    batting_style: "Right Hand",
    bowling_style: "N/A",
    jersey_number: "",
  });

  const fetchTeamAndPlayers = React.useCallback(async () => {
    setLoading(true);
    const { data: teamData } = await supabase.from("teams").select("*").eq("id", params.id).single();
    const { data: playersData } = await supabase.from("players").select("*").eq("team_id", params.id).order("name");
    
    setTeam(teamData);
    setPlayers(playersData || []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeamAndPlayers();
  }, [fetchTeamAndPlayers]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const { error } = await supabase.from("players").insert([
      { ...newPlayer, team_id: params.id, jersey_number: parseInt(newPlayer.jersey_number) || null }
    ]);

    if (!error) {
      setNewPlayer({ name: "", role: "batsman", batting_style: "Right Hand", bowling_style: "N/A", jersey_number: "" });
      await fetchTeamAndPlayers();
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="text-stadium-gold text-center py-20 animate-pulse uppercase font-black tracking-tighter">Recruiting Squad...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight uppercase">{team?.name} Squad</h1>
        <p className="text-slate-400 mt-1">Manage the permanent roster for this professional franchise.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Player List */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {players.map((player) => (
              <Card key={player.id} className="border-none bg-white/5 hover:bg-white/[0.08] transition-all">
                <CardBody className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stadium-gold/10 rounded-full flex items-center justify-center text-stadium-gold font-black text-xs border border-stadium-gold/20">
                      {player.jersey_number || "—"}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{player.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{player.role}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[8px]">{player.batting_style}</Badge>
                </CardBody>
              </Card>
            ))}
          </div>
          {players.length === 0 && <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 italic">No players registered in this squad yet.</div>}
        </div>

        {/* Add Player Form */}
        <div className="space-y-6">
          <Card isGlass className="border-stadium-gold/20 sticky top-6">
            <CardHeader>
              <h3 className="text-lg font-bold uppercase tracking-tight">Add Player</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Player Name</label>
                  <input
                    required
                    className="w-full bg-pitch/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-stadium-gold outline-none"
                    placeholder="e.g. Virat Kohli"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Role</label>
                    <select
                      className="w-full bg-pitch/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      value={newPlayer.role}
                      onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})}
                    >
                      <option value="batsman">Batsman</option>
                      <option value="bowler">Bowler</option>
                      <option value="all-rounder">All-Rounder</option>
                      <option value="wicket-keeper">Wicket-Keeper</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Jersey #</label>
                    <input
                      className="w-full bg-pitch/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-stadium-gold outline-none"
                      placeholder="18"
                      value={newPlayer.jersey_number}
                      onChange={(e) => setNewPlayer({...newPlayer, jersey_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Batting Style</label>
                  <select
                    className="w-full bg-pitch/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                    value={newPlayer.batting_style}
                    onChange={(e) => setNewPlayer({...newPlayer, batting_style: e.target.value})}
                  >
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                  </select>
                </div>
                <Button variant="gold" type="submit" disabled={isProcessing} className="w-full mt-4 h-12 uppercase font-black text-xs tracking-widest">Register Player</Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
