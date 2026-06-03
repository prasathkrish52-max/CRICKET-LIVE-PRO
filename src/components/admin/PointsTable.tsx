"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { supabase } from "@/lib/supabase";

interface PointsRow {
  id: string;
  team_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  ties: number;
  no_result: number;
  points: number;
  net_run_rate: number;
  position: number;
  team: { name: string; logo_url: string | null };
}

interface PointsTableProps {
  tournamentId: string;
  compact?: boolean;
  onRowClick?: (teamId: string) => void;
}

// ── Optimized Row Component ──────────────────────────────────────────────────
const TableRow = memo(({ 
  row, 
  idx, 
  compact, 
  isTop2 
}: { 
  row: PointsRow; 
  idx: number; 
  compact?: boolean; 
  isTop2: boolean;
}) => {
  const rankDisplay = useMemo(() => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return idx + 1;
  }, [idx]);

  return (
    <tr
      className={`border-b border-white/[0.03] transition-all duration-500 ease-in-out hover:bg-white/5 
        ${isTop2 ? "bg-emerald-500/[0.03]" : ""}
        animate-fade-in`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Rank */}
      <td className="px-4 py-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg
          ${idx === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black scale-110" :
            idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-black" :
            idx === 2 ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white" :
            "bg-white/5 text-slate-400 border border-white/5"}`}>
          {rankDisplay}
        </div>
      </td>

      {/* Team */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stadium-navy border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {row.team?.logo_url
              ? <img src={row.team.logo_url} alt={row.team.name} className="w-full h-full object-cover" />
              : <span className="text-[11px] font-black text-stadium-gold uppercase">{row.team?.name?.[0] ?? "?"}</span>}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-black uppercase tracking-tight transition-colors ${isTop2 ? "text-white" : "text-slate-300"}`}>
              {row.team?.name ?? "Unknown"}
            </span>
            {isTop2 && !compact && (
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Qualified
              </span>
            )}
          </div>
        </div>
      </td>

      <td className={`px-4 py-4 text-center text-sm font-bold transition-all ${compact ? "hidden md:table-cell" : "text-slate-400"}`}>
        {row.matches_played}
      </td>
      <td className="px-4 py-4 text-center text-sm font-black text-emerald-400">
        {row.wins}
      </td>
      {!compact && (
        <td className="px-4 py-4 text-center text-sm font-bold text-red-400">
          {row.losses}
        </td>
      )}
      <td className="px-4 py-4 text-center">
        <div className="relative inline-block">
          <span className="text-sm font-black text-stadium-gold relative z-10">{row.points}</span>
          <div className="absolute inset-0 bg-stadium-gold/10 blur-md rounded-full -z-0" />
        </div>
      </td>
      <td className={`px-4 py-4 text-center text-xs font-bold font-mono tabular-nums ${compact ? "hidden lg:table-cell text-slate-500" : "text-slate-400"}`}>
        {row.net_run_rate >= 0 ? "+" : ""}{row.net_run_rate.toFixed(3)}
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";

// ── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonRow({ compact }: { compact?: boolean }) {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4"><div className="w-8 h-8 rounded-xl bg-white/5" /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5" />
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>
      </td>
      <td className={`px-4 py-4 ${compact ? "hidden md:table-cell" : ""}`}><div className="h-4 w-6 mx-auto bg-white/5 rounded" /></td>
      <td className="px-4 py-4"><div className="h-4 w-6 mx-auto bg-white/5 rounded" /></td>
      {!compact && <td className="px-4 py-4"><div className="h-4 w-6 mx-auto bg-white/5 rounded" /></td>}
      <td className="px-4 py-4"><div className="h-4 w-8 mx-auto bg-white/5 rounded" /></td>
      <td className={`px-4 py-4 ${compact ? "hidden lg:table-cell" : ""}`}><div className="h-4 w-12 mx-auto bg-white/5 rounded" /></td>
    </tr>
  );
}

export function PointsTable({ tournamentId, compact }: PointsTableProps) {
  const [rows, setRows] = useState<PointsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("points_table")
        .select(`*, team:teams(name, logo_url)`)
        .eq("tournament_id", tournamentId)
        .order("points", { ascending: false })
        .order("wins", { ascending: false })
        .order("net_run_rate", { ascending: false });

      if (!error && data) {
        setRows(data as PointsRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchStandings();

    let timeoutId: NodeJS.Timeout;
    const channelName = `points-table-live-${tournamentId}-${Date.now()}`;

    const handleUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const { data } = await supabase
          .from("points_table")
          .select(`*, team:teams(name, logo_url)`)
          .eq("tournament_id", tournamentId)
          .order("points", { ascending: false })
          .order("wins", { ascending: false })
          .order("net_run_rate", { ascending: false });

        if (data) {
          setRows((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
            return data as PointsRow[];
          });
        }
      }, 1000);
    };

    const sub = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "points_table", filter: `tournament_id=eq.${tournamentId}` },
        handleUpdate
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(sub);
    };
  }, [fetchStandings, tournamentId]);

  if (!loading && rows.length === 0) {
    return (
      <div className="glass-card py-16 text-center border-white/5 bg-white/[0.02] animate-slide-up">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          📊
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">League Standings</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          Waiting for match results...
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-card border-white/5 overflow-hidden transition-all duration-700 ${compact ? "p-0" : "p-0"}`}>
      {/* Header */}
      {!compact && (
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-stadium-gold rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Premium Standings</h3>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Real-time Data</span>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-4 py-4 text-left text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] w-12">Rank</th>
              <th className="px-4 py-4 text-left text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Team</th>
              <th className={`px-4 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ${compact ? "hidden md:table-cell" : ""}`}>Mat</th>
              <th className="px-4 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Won</th>
              {!compact && <th className="px-4 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Lost</th>}
              <th className="px-4 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Pts</th>
              <th className={`px-4 py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ${compact ? "hidden lg:table-cell" : ""}`}>NRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {loading ? (
              [...Array(compact ? 4 : 6)].map((_, i) => <SkeletonRow key={i} compact={compact} />)
            ) : (
              rows.map((row, idx) => (
                <TableRow 
                  key={row.id} 
                  row={row} 
                  idx={idx} 
                  compact={compact}
                  isTop2={idx < (compact ? 2 : 4)} // Dynamic qualification zone
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Legend */}
      {!compact && (
        <div className="px-6 py-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Q = Potential Qualification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-xl bg-stadium-gold shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Leader</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.1em] font-mono">
            Standard Tie-breakers: Points {">"} Wins {">"} NRR
          </span>
        </div>
      )}
    </div>
  );
}
