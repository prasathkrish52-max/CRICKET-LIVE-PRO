"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { InningsStatus } from "@/components/scorer/InningsStatus";
import { PointsTable } from "@/components/admin/PointsTable";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type TabType = "match" | "standings" | "scorecard" | "stats";

export default function PublicMatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("match");

  const fetchMatchData = useCallback(async () => {
    try {
      const { data: m } = await supabase.from('matches').select('*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)').eq('id', id).single();
      const { data: ins } = await supabase.from('innings').select('*').eq('match_id', id).order('innings_number', { ascending: true });
      
      setMatch(m);
      setInnings(ins || []);
    } catch (error) {
      console.error("Error fetching match detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatchData();
    
    const sub = supabase
      .channel(`public-match-${id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'innings', filter: `match_id=eq.${id}` }, 
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setInnings(prev => [...prev, payload.new].sort((a, b) => a.innings_number - b.innings_number));
          } else if (payload.eventType === 'UPDATE') {
            setInnings(prev => prev.map(inn => inn.id === payload.new.id ? payload.new : inn));
          } else if (payload.eventType === 'DELETE') {
            setInnings(prev => prev.filter(inn => inn.id !== payload.old.id));
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${id}` },
        (payload: any) => {
          setMatch((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    const poll = setInterval(fetchMatchData, 30000);

    return () => { 
      sub.unsubscribe(); 
      clearInterval(poll);
    };
  }, [id, fetchMatchData]);

  if (loading) return (
    <div className="min-h-screen bg-pitch flex flex-col items-center justify-center text-white gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-stadium-gold" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing Broadcast...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-pitch pb-24 md:pb-10">
      {/* Sticky Broadcast Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-pitch/80">
        <div className="flex items-center gap-4">
          <Link href="/live" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="live" className="text-[8px] px-2 py-0.5 shadow-[0_0_10px_rgba(239,68,68,0.3)]">Live Broadcast</Badge>
              {match?.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{match?.venue || 'Stadium Venue'}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <h2 className="text-xs font-black text-white uppercase tracking-tighter">Match Center</h2>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Ultra-Low Latency</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
        {/* Tab Selection (Desktop Header) */}
        <div className="hidden md:flex gap-8 border-b border-white/5 mb-2 px-2">
          {(["match", "standings"] as const).map(tab => (
            <button
              key={tab}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
                ${activeTab === tab ? "text-stadium-gold" : "text-slate-500 hover:text-white"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "match" ? "Match Live" : "Standings"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-stadium-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "match" ? (
          <div className="space-y-6 animate-slide-up">
            {/* Teams Matchup Hero */}
            <div className="relative glass-card border-none bg-gradient-to-br from-stadium-navy to-black p-8 flex justify-between items-center overflow-hidden mb-4 shadow-2xl">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-stadium-gold/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-stadium-accent/10 blur-[80px] rounded-full" />
              
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-2xl backdrop-blur-md">
                  {match?.team_a?.logo_url ? <img src={match.team_a.logo_url} className="w-full h-full object-cover rounded-2xl" /> : "🛡️"}
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">{match?.team_a?.name}</span>
              </div>

              <div className="flex flex-col items-center z-10">
                <div className="text-stadium-gold font-black italic text-xl tracking-tighter">VS</div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent my-2" />
              </div>

              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-2xl backdrop-blur-md">
                  {match?.team_b?.logo_url ? <img src={match.team_b.logo_url} className="w-full h-full object-cover rounded-2xl" /> : "⚔️"}
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">{match?.team_b?.name}</span>
              </div>
            </div>

            {innings.length === 0 ? (
              <div className="glass-card p-12 text-center border-white/5 bg-white/[0.02]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
                  🏏
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Lineups Locked</h2>
                <p className="text-slate-500 font-medium text-sm">Waiting for the first ball to be bowled...</p>
              </div>
            ) : (
              innings.map(inn => (
                <InningsStatus 
                  key={inn.id}
                  teamName={inn.team_id === match.team_a_id ? match.team_a.name : match.team_b.name}
                  totalRuns={inn.total_runs}
                  totalWickets={inn.total_wickets}
                  overs={inn.overs.toFixed(1)}
                  striker={null}
                  nonStriker={null}
                  bowler={null}
                />
              ))
            )}

            {/* Live Momentum & Timeline */}
            <section className="glass-card border-white/5 p-6 space-y-6">
              <header className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Timeline</h3>
                <span className="text-[10px] font-bold text-stadium-gold uppercase">Latest Event</span>
              </header>
              
              <div className="space-y-6">
                <div className="flex gap-6 relative">
                  <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-white/5" />
                  <div className="w-8 h-8 rounded-full bg-stadium-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-pitch font-black text-sm shrink-0 z-10">4</div>
                  <div className="pt-1">
                    <p className="text-sm text-white font-black uppercase tracking-tight">Boundary!</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                      Stunning cover drive pierces the gap for a magnificent boundary.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-fade-in">
             <PointsTable tournamentId={match?.tournament_id} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 glass-panel border-t border-white/10 z-[100] px-6 md:hidden flex justify-between items-center bg-pitch/90 backdrop-blur-xl">
        <button 
          onClick={() => setActiveTab("match")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "match" ? "text-stadium-gold scale-110" : "text-slate-500"}`}
        >
          <span className="text-xl">📺</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Match</span>
        </button>
        <button 
          onClick={() => setActiveTab("standings")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "standings" ? "text-stadium-gold scale-110" : "text-slate-500"}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Standings</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">📋</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Stats</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">🗞️</span>
          <span className="text-[8px] font-black uppercase tracking-widest">News</span>
        </button>
      </nav>
    </div>
  );
}


