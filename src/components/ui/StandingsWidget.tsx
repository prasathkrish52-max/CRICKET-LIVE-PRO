"use client";

import React from "react";
import { PointsTable } from "@/components/admin/PointsTable";
import { Badge } from "@/components/ui/Badge";

interface StandingsWidgetProps {
  tournamentId: string;
}

export function StandingsWidget({ tournamentId }: StandingsWidgetProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Standings</h3>
        <Badge variant="live" className="text-[7px] px-1.5 py-0.5">Sync Active</Badge>
      </div>
      
      <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01]">
        <PointsTable tournamentId={tournamentId} compact />
      </div>
      
      <div className="px-2">
        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
          Top teams advance to the knockout stage based on NRR tie-breakers.
        </p>
      </div>
    </div>
  );
}
