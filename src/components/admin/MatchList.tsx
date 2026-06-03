import { Badge } from "../ui/Badge";
import { Card, CardBody } from "../ui/Card";
import Link from "next/link";

interface Match {
  id: string;
  match_date: string;
  venue: string;
  status: string;
  match_type: string;
  round?: string;
  team_a: { name: string; logo_url: string | null };
  team_b: { name: string; logo_url: string | null };
}

interface MatchListProps {
  matches: Match[];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 glass-card">
        <p className="text-slate-400">No matches scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <Card key={match.id} className="border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 items-center">
                <Badge variant="info" className="text-[9px] font-black tracking-widest px-2 py-1 bg-sky-500/10 text-sky-400 border-sky-500/20">
                  {match.match_type.toUpperCase()}
                </Badge>
                {match.round && (
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    {match.round.replace('_', ' ')}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                {new Date(match.match_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • {match.venue}
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Team A */}
              <div className="flex items-center gap-4 w-1/3">
                <div className="w-10 h-10 rounded-xl bg-stadium-navy border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-stadium-gold/30 transition-colors">
                  {match.team_a.logo_url 
                    ? <img src={match.team_a.logo_url} className="w-full h-full object-cover" /> 
                    : <span className="text-sm font-black text-stadium-gold">{match.team_a.name[0]}</span>}
                </div>
                <span className="text-sm font-black text-white uppercase tracking-tight truncate">{match.team_a.name}</span>
              </div>

              {/* Action Center */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-[9px] text-slate-700 font-black italic tracking-widest">VS</span>
                <Link href={`/scorer/matches/${match.id}`}>
                  <button className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all
                    ${match.status === "live" 
                      ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/40" 
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-stadium-gold hover:text-black hover:border-stadium-gold"}`}>
                    {match.status === "scheduled" ? "Score Match" : match.status}
                  </button>
                </Link>
              </div>

              {/* Team B */}
              <div className="flex items-center gap-4 w-1/3 justify-end text-right">
                <span className="text-sm font-black text-white uppercase tracking-tight truncate">{match.team_b.name}</span>
                <div className="w-10 h-10 rounded-xl bg-stadium-navy border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-stadium-gold/30 transition-colors">
                  {match.team_b.logo_url 
                    ? <img src={match.team_b.logo_url} className="w-full h-full object-cover" /> 
                    : <span className="text-sm font-black text-stadium-gold">{match.team_b.name[0]}</span>}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
