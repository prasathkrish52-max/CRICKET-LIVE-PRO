"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MatchManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tab, setTab] = useState<"schedule" | "squad" | "toss">("schedule");

  // Form State
  const [schedule, setSchedule] = useState({ date: "", time: "", venue: "" });
  const [toss, setToss] = useState({ won_by: "", decision: "bat" });

  const fetchMatch = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*, team_a:team_a_id(*), team_b:team_b_id(*)")
      .eq("id", params.id)
      .single();
    
    if (!error) {
      setMatch(data);
      if (data.match_date) {
        const d = new Date(data.match_date);
        setSchedule({
          date: d.toISOString().split('T')[0],
          time: d.toTimeString().split(' ')[0].substring(0, 5),
          venue: data.venue || ""
        });
      }
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatch();
  }, [fetchMatch]);

  const updateSchedule = async () => {
    setIsProcessing(true);
    const match_date = new Date(`${schedule.date}T${schedule.time}`).toISOString();
    const { error } = await supabase
      .from("matches")
      .update({ match_date, venue: schedule.venue })
      .eq("id", params.id);
    
    if (!error) alert("Match scheduled successfully!");
    setIsProcessing(false);
  };

  const handleToss = async () => {
    setIsProcessing(true);
    const { error } = await supabase
      .from("matches")
      .update({ 
        toss_won_by: toss.won_by, 
        toss_decision: toss.decision,
        status: 'live' 
      })
      .eq("id", params.id);
    
    if (!error) {
      // Initialize innings based on toss
      const battingFirstId = toss.decision === 'bat' ? toss.won_by : (toss.won_by === match.team_a_id ? match.team_b_id : match.team_a_id);
      
      await supabase.from("innings").insert([
        { match_id: params.id, team_id: battingFirstId, innings_number: 1 }
      ]);

      router.push(`/scorer/matches/${params.id}`);
    }
    setIsProcessing(false);
  };

  const [teamAPlayers, setTeamAPlayers] = useState<any[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<any[]>([]);
  const [selectedXI_A, setSelectedXI_A] = useState<string[]>([]);
  const [selectedXI_B, setSelectedXI_B] = useState<string[]>([]);
  const [roles, setRoles] = useState<{ [key: string]: "C" | "VC" | null }>({});

  const fetchPlayers = React.useCallback(async () => {
    if (!match) return;
    const { data: playersA } = await supabase.from("players").select("*").eq("team_id", match.team_a_id);
    const { data: playersB } = await supabase.from("players").select("*").eq("team_id", match.team_b_id);
    
    // Also fetch already selected XI if exists
    const { data: existingXI } = await supabase.from("playing_xi").select("*").eq("match_id", params.id);
    
    if (existingXI && existingXI.length > 0) {
      const xiA = existingXI.filter(p => p.team_id === match.team_a_id);
      const xiB = existingXI.filter(p => p.team_id === match.team_b_id);
      setSelectedXI_A(xiA.map(p => p.player_id));
      setSelectedXI_B(xiB.map(p => p.player_id));
      
      const roleMap: any = {};
      existingXI.forEach(p => {
        if (p.is_captain) roleMap[p.player_id] = "C";
        if (p.is_vice_captain) roleMap[p.player_id] = "VC";
      });
      setRoles(roleMap);
    }

    setTeamAPlayers(playersA || []);
    setTeamBPlayers(playersB || []);
  }, [match, params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) fetchPlayers();
  }, [match, fetchPlayers]);

  const togglePlayer = (team: 'A' | 'B', playerId: string) => {
    const isTeamA = team === 'A';
    const selected = isTeamA ? selectedXI_A : selectedXI_B;
    const setter = isTeamA ? setSelectedXI_A : setSelectedXI_B;

    if (selected.includes(playerId)) {
      setter(selected.filter(id => id !== playerId));
      // Remove roles if player unselected
      const newRoles = { ...roles };
      delete newRoles[playerId];
      setRoles(newRoles);
    } else {
      if (selected.length >= 11) return alert("Maximum 11 players allowed!");
      setter([...selected, playerId]);
    }
  };

  const setRole = (playerId: string, role: "C" | "VC") => {
    // Check if another player in same team already has this role
    const playerTeam = teamAPlayers.find(p => p.id === playerId) ? 'A' : 'B';
    const otherPlayersInTeam = playerTeam === 'A' ? teamAPlayers : teamBPlayers;
    
    const newRoles = { ...roles };
    otherPlayersInTeam.forEach(p => {
      if (newRoles[p.id] === role) delete newRoles[p.id];
    });
    
    newRoles[playerId] = role;
    setRoles(newRoles);
  };

  const saveSquads = async () => {
    setIsProcessing(true);
    try {
      // 1. Delete existing XI
      await supabase.from("playing_xi").delete().eq("match_id", params.id);

      // 2. Prepare new XI records
      const xi_A = selectedXI_A.map(pid => ({
        match_id: params.id,
        team_id: match.team_a_id,
        player_id: pid,
        is_captain: roles[pid] === 'C',
        is_vice_captain: roles[pid] === 'VC',
      }));

      const xi_B = selectedXI_B.map(pid => ({
        match_id: params.id,
        team_id: match.team_b_id,
        player_id: pid,
        is_captain: roles[pid] === 'C',
        is_vice_captain: roles[pid] === 'VC',
      }));

      const { error } = await supabase.from("playing_xi").insert([...xi_A, ...xi_B]);
      if (error) throw error;
      alert("Squads saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-stadium-gold text-center py-20 animate-pulse">Initializing Match Suite...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/admin/tournaments/${match.tournament_id}/fixtures`} className="text-xs font-black text-stadium-gold hover:underline uppercase mb-2 block">← Back to Fixtures</Link>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4 uppercase">
            {match.team_a?.name} <span className="text-stadium-gold italic text-xl">vs</span> {match.team_b?.name}
          </h1>
        </div>
        <Badge variant={match.status === 'live' ? 'live' : 'secondary'}>{match.status}</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        {["schedule", "squad", "toss"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
              tab === t ? "border-stadium-gold text-stadium-gold" : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {tab === "schedule" && (
            <Card isGlass className="border-none">
              <CardBody className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none"
                      value={schedule.date}
                      onChange={(e) => setSchedule({...schedule, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none"
                      value={schedule.time}
                      onChange={(e) => setSchedule({...schedule, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venue / Ground</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none"
                    placeholder="e.g. National Stadium, Pitch 2"
                    value={schedule.venue}
                    onChange={(e) => setSchedule({...schedule, venue: e.target.value})}
                  />
                </div>
                <Button variant="gold" onClick={updateSchedule} disabled={isProcessing} className="w-full h-14 uppercase font-black tracking-widest">Update Schedule</Button>
              </CardBody>
            </Card>
          )}

          {tab === "squad" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <div className="text-xs font-black uppercase text-slate-400">Squad Selection</div>
                <Button variant="gold" size="sm" onClick={saveSquads} disabled={isProcessing}>Save Both Squads</Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Team A Selection */}
                <div className="space-y-4">
                  <div className="text-sm font-black text-stadium-gold uppercase">{match.team_a?.name} ({selectedXI_A.length}/11)</div>
                  <div className="space-y-2">
                    {teamAPlayers.map(p => {
                      const isSelected = selectedXI_A.includes(p.id);
                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? "border-stadium-emerald bg-stadium-emerald/5" : "border-white/5 bg-white/5"}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={isSelected} onChange={() => togglePlayer('A', p.id)} className="w-4 h-4 accent-stadium-emerald" />
                            <div className="text-xs font-bold">{p.name}</div>
                          </div>
                          {isSelected && (
                            <div className="flex gap-1">
                              <button onClick={() => setRole(p.id, 'C')} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${roles[p.id] === 'C' ? "bg-stadium-gold text-pitch" : "bg-white/10 text-slate-500"}`}>C</button>
                              <button onClick={() => setRole(p.id, 'VC')} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${roles[p.id] === 'VC' ? "bg-slate-400 text-pitch" : "bg-white/10 text-slate-500"}`}>VC</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team B Selection */}
                <div className="space-y-4">
                  <div className="text-sm font-black text-stadium-gold uppercase">{match.team_b?.name} ({selectedXI_B.length}/11)</div>
                  <div className="space-y-2">
                    {teamBPlayers.map(p => {
                      const isSelected = selectedXI_B.includes(p.id);
                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? "border-stadium-emerald bg-stadium-emerald/5" : "border-white/5 bg-white/5"}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={isSelected} onChange={() => togglePlayer('B', p.id)} className="w-4 h-4 accent-stadium-emerald" />
                            <div className="text-xs font-bold">{p.name}</div>
                          </div>
                          {isSelected && (
                            <div className="flex gap-1">
                              <button onClick={() => setRole(p.id, 'C')} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${roles[p.id] === 'C' ? "bg-stadium-gold text-pitch" : "bg-white/10 text-slate-500"}`}>C</button>
                              <button onClick={() => setRole(p.id, 'VC')} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${roles[p.id] === 'VC' ? "bg-slate-400 text-pitch" : "bg-white/10 text-slate-500"}`}>VC</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "toss" && (
            <Card isGlass className="border-none">
              <CardBody className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Who won the toss?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setToss({...toss, won_by: match.team_a_id})}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${toss.won_by === match.team_a_id ? "border-stadium-gold bg-stadium-gold/10" : "border-white/5 hover:border-white/20"}`}
                    >
                      <div className="font-black uppercase">{match.team_a?.name}</div>
                    </button>
                    <button 
                      onClick={() => setToss({...toss, won_by: match.team_b_id})}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${toss.won_by === match.team_b_id ? "border-stadium-gold bg-stadium-gold/10" : "border-white/5 hover:border-white/20"}`}
                    >
                      <div className="font-black uppercase">{match.team_b?.name}</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Decision after winning toss</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setToss({...toss, decision: 'bat'})}
                      className={`p-4 rounded-xl border-2 transition-all font-bold uppercase ${toss.decision === 'bat' ? "border-stadium-emerald bg-stadium-emerald/10 text-stadium-emerald" : "border-white/5"}`}
                    >
                      🏏 Batting
                    </button>
                    <button 
                      onClick={() => setToss({...toss, decision: 'field'})}
                      className={`p-4 rounded-xl border-2 transition-all font-bold uppercase ${toss.decision === 'field' ? "border-stadium-emerald bg-stadium-emerald/10 text-stadium-emerald" : "border-white/5"}`}
                    >
                      👐 Fielding
                    </button>
                  </div>
                </div>

                <Button variant="gold" onClick={handleToss} disabled={!toss.won_by || isProcessing} className="w-full h-16 uppercase font-black tracking-widest text-lg bg-stadium-emerald hover:bg-stadium-emerald/80 border-none shadow-lg shadow-stadium-emerald/20">
                  Activate Match & Start Scoring
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quick Checklist</CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <span className={match.match_date ? "text-stadium-emerald" : "text-slate-600"}>✓</span>
                Schedule Match
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <span className="text-slate-600">✓</span>
                Register Players (11+)
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <span className="text-slate-600">✓</span>
                Select Playing XI
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <span className={match.status === 'live' ? "text-stadium-emerald" : "text-slate-600"}>✓</span>
                Perform Toss
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Fixed missing import for Link
import Link from "next/link";
