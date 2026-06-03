"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { matchService } from '@/lib/services/matchService';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function MatchControlRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            team_a:teams!matches_team_a_id_fkey(*),
            team_b:teams!matches_team_b_id_fkey(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setMatch(data);
      } catch (err) {
        console.error("Failed to load match", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleStartMatch = async () => {
    try {
      await matchService.updateMatchStatus(id, 'live');
      setMatch({ ...match, status: 'live' });
    } catch (err) {
      console.error("Failed to start match", err);
    }
  };

  if (loading) return <div className="text-white animate-pulse p-10">Loading Control Room...</div>;
  if (!match) return <div className="text-white p-10">Match not found.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant={match.status === 'live' ? 'live' : 'secondary'} className="uppercase">
          {match.status}
        </Badge>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Match Control Room</h1>
        <p className="text-slate-400">Manage pre-match workflows and scoring authorization.</p>
      </div>

      {/* Match Context Card */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center w-full md:w-1/3">
              <div className="w-24 h-24 bg-white/5 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4">
                🛡️
              </div>
              <h2 className="text-2xl font-bold text-white truncate">{match.team_a?.name}</h2>
            </div>
            
            <div className="text-center">
              <div className="text-stadium-gold font-black text-xl mb-2">VS</div>
              <div className="text-xs font-bold text-slate-500 uppercase">{match.overs_format} Overs</div>
            </div>

            <div className="text-center w-full md:w-1/3">
              <div className="w-24 h-24 bg-white/5 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4">
                🛡️
              </div>
              <h2 className="text-2xl font-bold text-white truncate">{match.team_b?.name}</h2>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pre-Match Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Pre-Match Checklist</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-slate-300">Playing XI Selected</span>
              <Badge variant="gold">Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-slate-300">Toss Completed</span>
              <Badge variant="gold">Required</Badge>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-stadium-gold/10 border-stadium-gold/30">
          <CardHeader>
            <h3 className="text-lg font-bold text-stadium-gold">System Authorization</h3>
          </CardHeader>
          <CardBody className="flex flex-col justify-center h-[calc(100%-4rem)]">
            {match.status === 'scheduled' ? (
              <Button 
                variant="gold" 
                size="lg" 
                className="w-full text-lg shadow-lg shadow-stadium-gold/20"
                onClick={handleStartMatch}
              >
                AUTHORIZE MATCH START
              </Button>
            ) : (
              <Link href={`/scorer/matches/${match.id}`} className="block w-full">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full text-lg bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  OPEN LIVE SCORER
                </Button>
              </Link>
            )}
            <p className="text-center text-xs text-stadium-gold/60 mt-4">
              {match.status === 'scheduled' 
                ? "Authorizing will lock the Playing XI and enable the live scoring UI."
                : "Match is currently live. Scoring is authorized."}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
