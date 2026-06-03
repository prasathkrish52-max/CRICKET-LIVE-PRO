"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ScorerMatchListPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(name, logo_url),
          team_b:teams!team_b_id(name, logo_url),
          tournament:tournaments(name)
        `)
        .neq('status', 'completed')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches for scoring:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-stadium-gold rounded-full" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Scoring Command</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select an active match to begin live transmission</p>
        </header>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <Card className="py-20 text-center border-dashed border-white/5 bg-white/[0.01]">
            <div className="text-5xl mb-6 opacity-20">📊</div>
            <h2 className="text-xl font-bold text-white mb-2">No Active Matches</h2>
            <p className="text-slate-500 text-sm mb-8">Go to tournaments to schedule and start new matches.</p>
            <Link href="/admin/tournaments">
              <Button variant="gold">View Tournaments</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 animate-slide-up">
            {matches.map((match) => (
              <Card key={match.id} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
                {match.status === 'live' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                )}
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="info" className="text-[9px] font-black tracking-widest">
                          {match.tournament?.name || 'Tournament'}
                        </Badge>
                        <Badge variant={match.status === 'live' ? 'live' : 'secondary'} className="text-[9px]">
                          {match.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-white uppercase truncate">{match.team_a.name}</span>
                        <span className="text-stadium-gold font-black italic text-xs">VS</span>
                        <span className="text-lg font-black text-white uppercase truncate">{match.team_b.name}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                        {new Date(match.match_date).toLocaleString()} • {match.venue}
                      </p>
                    </div>
                    
                    <Link href={`/scorer/matches/${match.id}`}>
                      <Button variant="gold" className="px-8 font-black tracking-widest uppercase text-[10px] h-12">
                        {match.status === 'live' ? 'Resume Scoring' : 'Start Scoring'}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
