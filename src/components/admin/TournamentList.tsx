import React from "react";
import { Badge } from "../ui/Badge";
import { Card, CardBody } from "../ui/Card";
import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  start_date: string | null;
}

interface TournamentListProps {
  tournaments: Tournament[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-20 glass-card bg-white/[0.02] border-dashed">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🏆
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active tournaments found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tournaments.map((tournament) => (
        <Link key={tournament.id} href={`/admin/tournaments/${tournament.id}`}>
          <Card hoverable className="group border-white/5 bg-white/[0.01]">
            <CardBody className="p-0">
              <div className="h-2 bg-gradient-to-r from-stadium-gold via-stadium-emerald to-stadium-accent opacity-50" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-stadium-gold/10 flex items-center justify-center text-xl shadow-lg border border-stadium-gold/20 group-hover:scale-110 transition-transform">
                    {tournament.format === 'league' ? '📈' : '⚔️'}
                  </div>
                  <Badge variant={
                    tournament.status === "active" ? "live" : 
                    tournament.status === "completed" ? "success" : "gold"
                  }>
                    {tournament.status}
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-stadium-gold transition-colors">
                  {tournament.name}
                </h3>
                
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {tournament.format}
                    </span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="text-[10px] font-bold uppercase tracking-widest">
                    {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : "Pending Start"}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}

