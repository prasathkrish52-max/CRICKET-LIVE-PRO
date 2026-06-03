"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { generateLeagueFixtures } from "@/lib/tournament-engine";

export default function ManageTournamentPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<any>(null);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [allRegistryTeams, setAllRegistryTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [params.id]);

  const fetchTournamentData = async () => {
    setLoading(true);
    
    // 1. Fetch Tournament & Settings
    const { data: tourn } = await supabase
      .from("tournaments")
      .select("*, tournament_settings(*)")
      .eq("id", params.id)
      .single();
    
    setTournament(tourn);

    // 2. Fetch Teams already in this tournament
    const { data: tTeams } = await supabase
      .from("tournament_teams")
      .select("*, team:team_id(*)")
      .eq("tournament_id", params.id);
    
    setRegisteredTeams(tTeams || []);

    // 3. Fetch Global Registry (teams NOT in this tournament)
    const registeredIds = tTeams?.map(tt => tt.team_id) || [];
    const { data: globalTeams } = await supabase
      .from("teams")
      .select("*")
      .not("id", "in", `(${registeredIds.join(",") || "00000000-0000-0000-0000-000000000000"})`);
    
    setAllRegistryTeams(globalTeams || []);
    
    setLoading(false);
  };

  const addTeamToTournament = async (teamId: string) => {
    setIsProcessing(true);
    const { error } = await supabase
      .from("tournament_teams")
      .insert([{ tournament_id: params.id, team_id: teamId }]);
    
    if (!error) await fetchTournamentData();
    setIsProcessing(false);
  };

  const removeTeamFromTournament = async (assignmentId: string) => {
    setIsProcessing(true);
    const { error } = await supabase
      .from("tournament_teams")
      .delete()
      .eq("id", assignmentId);
    
    if (!error) await fetchTournamentData();
    setIsProcessing(false);
  };

  const handleGenerateFixtures = async () => {
    if (!tournament) return;
    setIsProcessing(true);
    
    try {
      const teamsForFixture = registeredTeams.map(rt => ({ id: rt.team_id, name: rt.team.name }));
      const fixtures = generateLeagueFixtures(teamsForFixture);
      
      // Save fixtures to matches table
      const matchInserts = fixtures.map(f => ({
        tournament_id: params.id,
        team_a_id: f.teamAId,
        team_b_id: f.teamBId,
        match_type: f.matchType,
        round: f.round,
        status: 'scheduled',
        overs_format: tournament.tournament_settings?.[0]?.overs_per_match || 20
      }));

      const { error } = await supabase.from("matches").insert(matchInserts);
      if (error) throw error;

      alert(`${fixtures.length} fixtures generated successfully!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-stadium-gold text-center py-20 animate-pulse">Initializing Management Suite...</div>;

  const minTeams = tournament?.format === 'league' ? 2 : 4;
  const canGenerate = registeredTeams.length >= minTeams;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">{tournament?.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="gold">{tournament?.format}</Badge>
            <Badge variant="info">{registeredTeams.length} Teams Registered</Badge>
          </div>
        </div>
        <Button 
          variant="gold" 
          size="lg" 
          disabled={!canGenerate || isProcessing}
          onClick={handleGenerateFixtures}
        >
          {isProcessing ? "Processing..." : "Generate Fixtures"}
        </Button>
      </div>

      {!canGenerate && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm font-bold">
          ⚠️ Register at least {minTeams} teams to unlock fixture generation.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Registered Teams */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none bg-white/5">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Registered Teams</h3>
              <span className="text-xs text-slate-500">{registeredTeams.length} Active</span>
            </CardHeader>
            <CardBody className="space-y-4">
              {registeredTeams.map((rt) => (
                <div key={rt.id} className="flex items-center justify-between p-4 bg-pitch/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                      {rt.team.logo_url ? <img src={rt.team.logo_url} className="w-full h-full object-cover" /> : <span className="font-bold text-stadium-gold">{rt.team.name[0]}</span>}
                    </div>
                    <div>
                      <div className="font-bold">{rt.team.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Registered on {new Date(rt.registered_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500" onClick={() => removeTeamFromTournament(rt.id)} disabled={isProcessing}>Remove</Button>
                </div>
              ))}
              {registeredTeams.length === 0 && <div className="text-center py-10 text-slate-500 italic">No teams registered yet.</div>}
            </CardBody>
          </Card>
        </div>

        {/* Global Registry Selection */}
        <div className="space-y-6">
          <Card className="border-stadium-gold/20">
            <CardHeader>
              <h3 className="text-lg font-bold uppercase tracking-tight">Available in Registry</h3>
            </CardHeader>
            <CardBody className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {allRegistryTeams.map((team) => (
                <div key={team.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-stadium-gold/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pitch rounded flex items-center justify-center text-xs font-bold">{team.name[0]}</div>
                    <span className="text-sm font-medium">{team.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-stadium-gold" onClick={() => addTeamToTournament(team.id)} disabled={isProcessing}>Add</Button>
                </div>
              ))}
              {allRegistryTeams.length === 0 && <div className="text-xs text-slate-500 italic py-4">All registry teams are registered.</div>}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
