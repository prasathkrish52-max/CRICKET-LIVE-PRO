import Link from "next/link";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface MatchCardProps {
  id: string;
  teamA: { name: string; score?: string | number; wickets?: number; overs?: string | number };
  teamB: { name: string; score?: string | number; wickets?: number; overs?: string | number };
  status: "scheduled" | "live" | "completed";
  venue: string;
  matchDate: string;
}

export function MatchCard({ id, teamA, teamB, status, venue, matchDate }: MatchCardProps) {
  const isLive = status === "live";

  return (
    <Link href={`/live/${id}`}>
      <Card hoverable className={`group relative !p-0 border-white/5 bg-white/[0.01] overflow-hidden ${isLive ? "stadium-border-gold shadow-2xl shadow-stadium-gold/10" : ""}`}>
        {isLive && (
          <div className="absolute top-0 right-0 p-3 z-10">
            <Badge variant="live" className="px-3 py-1 shadow-lg shadow-red-900/40">LIVE</Badge>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* Team A */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-stadium-gold rounded-full opacity-50" />
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Franchise</h4>
                  <span className="text-xl font-black text-white uppercase tracking-tight group-hover:text-stadium-gold transition-colors">{teamA.name}</span>
                </div>
              </div>
              {teamA.score !== undefined && (
                <div className="text-right">
                  <div className="text-3xl font-black text-white score-number">
                    {teamA.score}<span className="text-stadium-gold">/</span>{teamA.wickets}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {teamA.overs} <span className="text-[8px] opacity-60">Overs</span>
                  </div>
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/5 flex-grow" />
              <span className="text-[10px] font-black text-slate-700 italic tracking-[0.3em]">VS</span>
              <div className="h-px bg-white/5 flex-grow" />
            </div>

            {/* Team B */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-white/5 rounded-full" />
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Opponent</h4>
                  <span className="text-xl font-black text-white uppercase tracking-tight group-hover:text-stadium-gold transition-colors">{teamB.name}</span>
                </div>
              </div>
              {teamB.score !== undefined && (
                <div className="text-right">
                  <div className="text-3xl font-black text-white score-number">
                    {teamB.score}<span className="text-stadium-gold">/</span>{teamB.wickets}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {teamB.overs} <span className="text-[8px] opacity-60">Overs</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Stadium Venue</p>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{venue}</span>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Match Date</p>
              <span className="text-[10px] text-stadium-gold font-black uppercase tracking-widest">{matchDate}</span>
            </div>
          </div>
        </div>
        
        {/* Hover Effect Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-stadium-gold via-stadium-emerald to-stadium-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Card>
    </Link>
  );
}


