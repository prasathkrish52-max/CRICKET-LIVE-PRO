"use client";

import React, { useEffect, useState, use } from "react";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { teamService } from "@/lib/services/teamService";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import Link from "next/link";

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamDetails = React.useCallback(async () => {
    try {
      const data = await teamService.getTeamWithPlayers(id);
      setTeam(data);
    } catch (error) {
      console.error("Error fetching team details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-pitch flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stadium-gold"></div>
      </div>
    );
  }

  if (!team) return <div className="p-12 text-center text-white">Team not found.</div>;

  return (
    <div className="min-h-screen bg-stadium-pitch p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin/teams" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Teams
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 border-white/5 sticky top-8">
              <div className="w-32 h-32 rounded-full bg-stadium-navy border-2 border-stadium-gold mx-auto mb-6 overflow-hidden flex items-center justify-center shadow-2xl shadow-stadium-gold/10">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-slate-700">{team.name[0]}</span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-white text-center uppercase tracking-tighter mb-2">{team.name}</h1>
              <p className="text-slate-500 text-center text-sm mb-8">Official Squad Roster</p>
              
              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 uppercase font-bold tracking-widest">Total Players</span>
                  <span className="text-white font-mono">{team.players?.length || 0}</span>
                </div>
              </div>

              <div className="mt-12">
                <PlayerForm teamId={id} onSuccess={fetchTeamDetails} />
              </div>
            </div>
          </div>

          {/* Squad List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6 border-b border-stadium-gold/30 pb-2 inline-block">
              Squad Members
            </h2>

            {team.players?.length === 0 ? (
              <div className="glass-card p-12 text-center border-white/5">
                <p className="text-slate-400">No players registered in this squad yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {team.players.map((player: any) => (
                  <Card key={player.id} className="border-white/5">
                    <CardBody className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-stadium-gold/10 flex items-center justify-center text-stadium-gold font-bold">
                          {player.jersey_number || "—"}
                        </div>
                        <div>
                          <h4 className="text-white font-bold uppercase text-sm">{player.name}</h4>
                          <p className="text-xs text-slate-500 uppercase">{player.batting_style}</p>
                        </div>
                      </div>
                      <Badge variant="info" className="text-[10px]">{player.role.toUpperCase()}</Badge>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
