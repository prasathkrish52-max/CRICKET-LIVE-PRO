"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { tournamentService } from "@/lib/services/tournamentService";
import { fixtureService } from "@/lib/services/fixtureService";
import { teamService } from "@/lib/services/teamService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchList } from "@/components/admin/MatchList";
import { FixtureGenerator } from "@/components/admin/FixtureGenerator";
import { PointsTable } from "@/components/admin/PointsTable";
import { StandingsWidget } from "@/components/ui/StandingsWidget";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";



// ── Inline toast ───────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-slide-up
      ${type === "success"
        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
        : "bg-red-900/90 border-red-500/30 text-red-300"}`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [tournamentTeams, setTournamentTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [registeringTeamId, setRegisteringTeamId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "matches";

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const handleTabChange = (tab: "matches" | "teams" | "standings" | "settings") => {
    router.push(`/admin/tournaments/${id}?tab=${tab}`, { scroll: false });
  };


  const fetchData = useCallback(async () => {
    try {
      const [tData, mData, teamsData, tTeamsData] = await Promise.all([
        tournamentService.getTournamentDetails(id),
        fixtureService.getTournamentMatches(id),
        teamService.getAllTeams(),
        tournamentService.getTournamentTeams(id),
      ]);
      setError(null);
      setTournament(tData);
      setMatches(mData);
      setAllTeams(teamsData);
      setTournamentTeams(tTeamsData);
    } catch (err: any) {
      setError(err.message || "Failed to load tournament details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegisterTeam = async (teamId: string, teamName: string) => {
    // Prevent duplicate submission
    if (registeringTeamId) return;
    setRegisteringTeamId(teamId);
    try {
      await tournamentService.assignTeam(id, teamId);
      // Optimistic local update
      const team = allTeams.find(t => t.id === teamId);
      if (team) setTournamentTeams(prev => [...prev, team]);
      showToast(`${teamName} added to tournament!`, "success");
    } catch (err: any) {
      const code = err?.code;
      if (code === "23505") {
        showToast(`${teamName} is already registered.`, "error");
      } else {
        showToast(err?.message || "Failed to register team.", "error");
      }
    } finally {
      setRegisteringTeamId(null);
    }
  };

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    setRegisteringTeamId(teamId);
    try {
      await tournamentService.removeTeam(id, teamId);
      setTournamentTeams(prev => prev.filter(t => t.id !== teamId));
      showToast(`${teamName} removed from tournament.`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove team.", "error");
    } finally {
      setRegisteringTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stadium-gold" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading tournament data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pitch flex items-center justify-center p-6 text-center">
        <div className="glass-card p-12 max-w-md border-red-500/30 bg-red-500/5">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 font-medium">{error}</p>
          <Button variant="secondary" onClick={fetchData}>Retry</Button>
          <Link href="/admin/tournaments" className="block mt-4 text-xs text-slate-500 uppercase font-bold tracking-widest hover:text-white transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const registeredTeamIds = new Set(tournamentTeams.map((t: any) => t.id));

  return (
    <div className="space-y-10">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link href="/admin/tournaments" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Tournaments
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-stadium-gold rounded-full" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{tournament.name}</h1>
            <Badge variant={tournament.status === "active" ? "live" : "info"}>{tournament.status.toUpperCase()}</Badge>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-5">
            {tournament.format} Format • {tournament.tournament_settings?.overs_per_match ?? "—"} Overs per Match
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setShowTeamModal(true)}
            disabled={loading}
          >
            Register Teams
          </Button>
          <Button 
            variant="gold" 
            className="stadium-shadow"
            disabled={loading}
            onClick={() => {
              // Start tournament logic placeholder
              alert("Tournament started! Fixtures are now live.");
            }}
          >
            Start Tournament
          </Button>
        </div>
      </header>

      {/* Tabs + Content */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex gap-8 border-b border-white/5 mb-8 px-2">
            {(["matches", "teams", "standings", "settings"] as const).map(tab => (
            <button
              key={tab}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
                ${currentTab === tab ? "text-stadium-gold" : "text-slate-500 hover:text-white"}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab === "matches" ? "Fixtures & Results" :
               tab === "teams" ? `Squads (${tournamentTeams.length})` :
               tab === "standings" ? "Standings" :
               "Settings"}
              
              {currentTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-stadium-gold shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-fade-in" />
              )}
            </button>
          ))}
          </div>

          {currentTab === "matches" ? (
            <MatchList matches={matches} />
          ) : currentTab === "standings" ? (
            <PointsTable tournamentId={id} />
          ) : currentTab === "settings" ? (
            <div className="glass-card p-10 border-white/5 text-center">
              <div className="text-3xl mb-4 opacity-20">⚙️</div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Tournament Settings</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Configure match overs, points distribution, and advanced tournament rules here.</p>
            </div>
          ) : (

            <div>
              {tournamentTeams.length === 0 ? (
                <div className="glass-card py-16 text-center border-dashed border-white/5 bg-white/[0.01]">
                  <div className="text-3xl mb-3 opacity-20">🛡️</div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No teams registered yet</p>
                  <button onClick={() => setShowTeamModal(true)} className="mt-4 text-stadium-gold text-xs font-black uppercase tracking-widest hover:underline">
                    Register Teams →
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tournamentTeams.map((team: any) => (
                    <div key={team.id} className="glass-card p-4 flex items-center justify-between gap-4 border-white/5 group hover:border-white/10 transition-all">
                      <Link href={`/admin/teams/${team.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-stadium-navy border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {team.logo_url
                            ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-black text-stadium-gold">{team.name[0]}</span>}
                        </div>
                        <span className="text-white font-black uppercase text-sm tracking-tight">{team.name}</span>
                      </Link>
                      <button
                        onClick={() => handleRemoveTeam(team.id, team.name)}
                        disabled={registeringTeamId === team.id}
                        className="text-slate-600 hover:text-red-400 transition-colors text-xs font-bold opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
          <FixtureGenerator
            tournamentId={id}
            tournamentFormat={tournament.format}
            teams={tournamentTeams}
            onGenerated={fetchData}
          />
          
          <StandingsWidget tournamentId={id} />
        </div>
      </div>

      {/* Team Registration Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6" onClick={(e) => e.target === e.currentTarget && setShowTeamModal(false)}>
          <div className="glass-card max-w-md w-full p-8 border-stadium-gold/20 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Register Teams</h2>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{tournamentTeams.length} teams registered</p>
              </div>
              <button onClick={() => setShowTeamModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            {allTeams.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-slate-500 text-sm font-bold mb-4">No teams found. Create teams first.</p>
                <Link href="/admin/teams" className="text-stadium-gold text-xs font-black uppercase tracking-widest hover:underline">
                  Go to Team Registry →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6 pr-1">
                {allTeams.map((team: any) => {
                  const isRegistered = registeredTeamIds.has(team.id);
                  const isLoading = registeringTeamId === team.id;
                  return (
                    <div key={team.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isRegistered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5 hover:border-white/10"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stadium-navy flex items-center justify-center overflow-hidden shrink-0">
                          {team.logo_url
                            ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                            : <span className="text-xs font-black text-stadium-gold">{team.name[0]}</span>}
                        </div>
                        <span className="text-white text-sm font-bold uppercase tracking-tight">{team.name}</span>
                      </div>
                      {isRegistered ? (
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <span>✓</span> Registered
                        </span>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          disabled={isLoading || !!registeringTeamId}
                          isLoading={isLoading}
                          onClick={() => handleRegisterTeam(team.id, team.name)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="secondary" className="w-full" onClick={() => setShowTeamModal(false)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
