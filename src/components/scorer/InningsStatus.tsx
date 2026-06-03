import React, { memo } from "react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface BatStat { name: string; runs: number; balls: number; fours: number; sixes: number; }
interface BowlStat { name: string; overs: string; runs: number; wickets: number; economy: string; }

interface InningsStatusProps {
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  overs: string;
  striker: BatStat | null;
  nonStriker: BatStat | null;
  bowler: BowlStat | null;
  inningsNumber?: number;
  target?: number | null;
}

export const InningsStatus = memo(({
  teamName, totalRuns, totalWickets, overs,
  striker, nonStriker, bowler,
  inningsNumber = 1, target = null
}: InningsStatusProps) => {
  const need = target ? Math.max(0, target - totalRuns) : null;
  const strikeRate = striker && striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0";

  return (
    <Card className="stadium-shadow !p-0 border-white/5 bg-pitch relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-gold/5 blur-[80px] rounded-full -mr-32 -mt-32" />

      <div className="p-8 md:p-10 relative z-10">
        {/* Score Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-stadium-gold rounded-full" />
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                {teamName} — {inningsNumber === 1 ? "1st" : "2nd"} Innings
              </h2>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl md:text-8xl font-black text-white tracking-tighter score-number">
                {totalRuns}<span className="text-stadium-gold">/</span>{totalWickets}
              </span>
              <span className="text-2xl md:text-3xl text-slate-500 font-bold tracking-tighter">
                {overs} <span className="text-[10px] uppercase tracking-widest text-slate-600">Overs</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="live" className="px-4 py-2 text-[10px]">Transmission Live</Badge>
            {inningsNumber === 2 && target && (
              <div className="text-right p-3 bg-stadium-accent/10 border border-stadium-accent/20 rounded-xl">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Target / Need</p>
                <p className="text-lg font-black text-stadium-gold">{target} <span className="text-slate-400 text-sm font-bold">/ {need}</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 pt-10 border-t border-white/5">
          {/* Batting */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pb-3 border-b border-white/5">
              <span>Batting</span>
              <div className="flex gap-6 pr-2">
                <span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span>
              </div>
            </div>

            {[striker, nonStriker].map((bat, idx) => {
              const sr = bat && bat.balls > 0 ? ((bat.runs / bat.balls) * 100).toFixed(0) : "0";
              return (
                <div key={idx} className={`flex justify-between items-center transition-all duration-300 ${idx === 0 ? "scale-[1.02] origin-left" : "opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 rounded-full ${idx === 0 ? "bg-stadium-gold shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-transparent"}`} />
                    <div>
                      <span className={`text-sm font-black uppercase tracking-tight ${idx === 0 ? "text-white" : "text-slate-400"}`}>
                        {bat?.name || "—"}
                      </span>
                      {idx === 0 && <span className="ml-2 text-[9px] text-stadium-gold font-black">★</span>}
                    </div>
                  </div>
                  <div className="flex gap-6 font-black text-sm score-number pr-2">
                    <span className={`w-5 text-right ${idx === 0 ? "text-stadium-gold" : ""}`}>{bat?.runs ?? 0}</span>
                    <span className="w-5 text-right text-slate-500">{bat?.balls ?? 0}</span>
                    <span className="w-5 text-right text-slate-400">{bat?.fours ?? 0}</span>
                    <span className="w-5 text-right text-slate-400">{bat?.sixes ?? 0}</span>
                    <span className="w-8 text-right text-slate-600 text-xs">{sr}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bowling */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pb-3 border-b border-white/5">
              <span>Bowling</span>
              <div className="flex gap-6 pr-2">
                <span>O</span><span>R</span><span>W</span><span>Eco</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stadium-emerald/10 border border-stadium-emerald/20 flex items-center justify-center text-stadium-emerald font-black text-xs">
                  B
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-white">{bowler?.name || "—"}</span>
              </div>
              <div className="flex gap-6 font-black text-sm score-number pr-2">
                <span className="w-6 text-right text-stadium-emerald">{bowler?.overs ?? "0.0"}</span>
                <span className="w-6 text-right text-slate-400">{bowler?.runs ?? 0}</span>
                <span className="w-6 text-right text-white">{bowler?.wickets ?? 0}</span>
                <span className="w-8 text-right text-slate-600 text-xs">{bowler?.economy ?? "0.00"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

InningsStatus.displayName = "InningsStatus";
