"use client";

import React, { useEffect, useState } from 'react';
import { matchService } from '@/lib/services/matchService';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function TournamentFixturesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchService.getTournamentMatches(id);
        setMatches(data);
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [id]);

  if (loading) return <div className="text-white animate-pulse">Loading fixtures...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Match Schedule</h2>
        <Button variant="gold" size="sm">Generate Auto-Fixtures</Button>
      </div>

      <div className="grid gap-4">
        {matches.length === 0 ? (
          <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-white">No Fixtures Scheduled</h3>
            <p className="text-slate-400 text-sm mt-1">Generate fixtures to start the tournament.</p>
          </div>
        ) : (
          matches.map((match) => (
            <Card key={match.id} className="bg-white/5 border-white/10 hover:border-stadium-gold/30 transition-colors">
              <CardBody className="p-4 flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Match Info */}
                <div className="flex-1 w-full text-center md:text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                    {match.match_type} • {match.overs_format} Overs
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="font-bold text-lg text-white w-32 text-right truncate">
                      {match.team_a?.name || 'TBD'}
                    </div>
                    <div className="text-xs font-black text-stadium-gold bg-stadium-gold/10 px-2 py-1 rounded">
                      VS
                    </div>
                    <div className="font-bold text-lg text-white w-32 text-left truncate">
                      {match.team_b?.name || 'TBD'}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4">
                  <Badge variant={match.status === 'live' ? 'live' : 'secondary'} className="w-24 justify-center uppercase text-[10px]">
                    {match.status}
                  </Badge>
                  
                  {match.status === 'scheduled' && (
                    <Link href={`/admin/matches/${match.id}/live`}>
                      <Button variant="outline" size="sm" className="border-stadium-gold text-stadium-gold hover:bg-stadium-gold hover:text-pitch">
                        Start Match
                      </Button>
                    </Link>
                  )}
                  {match.status === 'live' && (
                    <Link href={`/scorer/matches/${match.id}`}>
                      <Button variant="gold" size="sm" className="animate-pulse">
                        Open Scorer
                      </Button>
                    </Link>
                  )}
                  {match.status === 'completed' && (
                    <Button variant="ghost" size="sm" className="text-slate-400" disabled>
                      Match Over
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
