import React from "react";
import { Card, CardBody } from "../ui/Card";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

interface TeamListProps {
  teams: Team[];
}

export function TeamList({ teams }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-20 glass-card bg-white/[0.02] border-dashed">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🛡️
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No registered teams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Link key={team.id} href={`/admin/teams/${team.id}`}>
          <Card hoverable className="group border-white/5 bg-white/[0.01] h-full">
            <CardBody className="p-0 flex flex-col h-full">
              <div className="h-24 bg-gradient-to-br from-stadium-navy to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--stadium-gold)_0%,_transparent_70%)]" />
                <div className="absolute -bottom-6 -right-6 text-8xl opacity-10 font-black italic select-none">
                  TEAM
                </div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl bg-pitch border-2 border-stadium-gold shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-stadium-gold">{team.name[0]}</span>
                  )}
                </div>
                
                <div className="pt-14">
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-stadium-gold transition-colors uppercase tracking-tight">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stadium-emerald" />
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      Active Roster • Pro League
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="text-[10px] font-black text-stadium-gold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                    Manage Squad →
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

