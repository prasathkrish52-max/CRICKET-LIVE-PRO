"use client";

import React, { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LiveDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatches();

    const matchSub = supabase
      .channel('live-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, (payload) => {
        // Since innings are nested, we need to re-fetch or find the match
        // For simplicity and to ensure data consistency with nested teams, 
        // we'll re-fetch but we could also optimize this further.
        fetchLiveMatches();
      })
      .subscribe();

    // Fallback polling every 30 seconds to ensure data consistency
    const pollInterval = setInterval(fetchLiveMatches, 30000);

    return () => { 
      matchSub.unsubscribe(); 
      clearInterval(pollInterval);
    };
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(*),
          team_b:teams!team_b_id(*),
          innings (*)
        `)
        .neq('status', 'completed')
        .order('status', { ascending: false })
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching live matches:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch pb-20">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stadium-gold flex items-center justify-center text-xl shadow-lg shadow-stadium-gold/20">
            🏏
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Fan<span className="text-stadium-gold">Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="bg-emerald-500/5 border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Live Sync
          </Badge>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 md:p-6 space-y-10 animate-slide-up">
        {/* Live Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Transmission Live</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{matches.filter(m => m.status === 'live').length} Active</span>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-48 w-full rounded-3xl" />
              ))}
            </div>
          ) : matches.filter(m => m.status === 'live').length === 0 ? (

            <Card className="py-16 text-center border-dashed border-white/5 bg-white/[0.01]">
              <div className="text-4xl mb-4 opacity-20">📡</div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active broadcasts currently</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {matches.filter(m => m.status === 'live').map(match => {
                const inn1 = match.innings?.find((i: any) => i.innings_number === 1);
                const inn2 = match.innings?.find((i: any) => i.innings_number === 2);
                return (
                  <MatchCard
                    key={match.id}
                    id={match.id}
                    teamA={{
                      name: match.team_a.name,
                      score: inn1?.total_runs,
                      wickets: inn1?.total_wickets,
                      overs: inn1?.overs
                    }}
                    teamB={{
                      name: match.team_b.name,
                      score: inn2?.total_runs,
                      wickets: inn2?.total_wickets,
                      overs: inn2?.overs
                    }}
                    status="live"
                    venue={match.venue}
                    matchDate={new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-stadium-gold rounded-full" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Upcoming Fixtures</h2>
          </div>
          <div className="grid gap-4">
            {matches.filter(m => m.status === 'scheduled').map(match => (
              <MatchCard
                key={match.id}
                id={match.id}
                teamA={{ name: match.team_a.name }}
                teamB={{ name: match.team_b.name }}
                status="scheduled"
                venue={match.venue}
                matchDate={new Date(match.match_date).toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 glass-panel border-t border-white/10 z-[100] px-8 md:hidden flex justify-between items-center">
        <button className="flex flex-col items-center gap-1 text-stadium-gold">
          <span className="text-xl">🔴</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">📅</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Schedule</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">🛡️</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Teams</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">🏆</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Leagues</span>
        </button>
      </nav>
    </div>
  );
}

