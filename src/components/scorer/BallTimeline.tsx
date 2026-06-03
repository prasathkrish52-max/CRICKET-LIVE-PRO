"use client";

import React, { useEffect, useState, useRef, memo, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export interface BallEntry {
  id: string;
  over_number: number;
  ball_number: number;
  runs_scored: number;
  is_wicket: boolean;
  extra_type: string | null;
  created_at: string;
  isOptimistic?: boolean;
  batsman_id?: string;
  bowler_id?: string;
}

interface BallTimelineProps {
  inningsId: string;
  currentOvers: number;
  balls: BallEntry[];
}

function getBallStyle(ball: BallEntry): { bg: string; text: string; label: string; glow: string } {
  if (ball.is_wicket) return { bg: "bg-red-600", text: "text-white", label: "W", glow: "shadow-red-500/50" };
  if (ball.extra_type === "wide") return { bg: "bg-slate-700", text: "text-slate-300", label: "Wd", glow: "" };
  if (ball.extra_type === "no_ball") return { bg: "bg-orange-500/30", text: "text-orange-300", label: "Nb", glow: "" };
  if (ball.runs_scored === 6) return { bg: "bg-emerald-600", text: "text-white", label: "6", glow: "shadow-emerald-500/60" };
  if (ball.runs_scored === 4) return { bg: "bg-stadium-gold", text: "text-black", label: "4", glow: "shadow-yellow-500/50" };
  if (ball.runs_scored === 0) return { bg: "bg-white/5", text: "text-slate-500", label: "•", glow: "" };
  return { bg: "bg-white/10", text: "text-white", label: String(ball.runs_scored), glow: "" };
}

export const BallTimeline = memo(({ inningsId, currentOvers, balls }: BallTimelineProps) => {
  const currentOver = Math.floor(currentOvers);

  const { ballsByOver, sortedOvers } = useMemo(() => {
    const grouped: Record<number, BallEntry[]> = {};
    for (const ball of balls) {
      const over = ball.over_number;
      if (!grouped[over]) grouped[over] = [];
      grouped[over].push(ball);
    }
    const sorted = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    return { ballsByOver: grouped, sortedOvers: sorted };
  }, [balls]);

  if (balls.length === 0) {
    return (
      <div className="glass-card p-6 text-center border-white/5 bg-white/[0.01]">
        <p className="text-slate-600 text-xs font-black uppercase tracking-widest">Ball-by-ball timeline will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-5 bg-stadium-accent rounded-full" />
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Over-by-Over Timeline</h3>
      </div>

      {sortedOvers.map((overNum) => {
        const ballsInOver = ballsByOver[overNum];
        const isCurrentOver = overNum === currentOver;

        const overRuns = ballsInOver.reduce((s, b) => {
          return s + (b.runs_scored ?? 0) + ((b.extra_type === "wide" || b.extra_type === "no_ball") ? 1 : 0);
        }, 0);
        const overWickets = ballsInOver.filter((b) => b.is_wicket).length;

        return (
          <div
            key={overNum}
            className={`glass-card p-4 border transition-all ${
              isCurrentOver ? "border-stadium-gold/30 bg-stadium-gold/[0.02]" : "border-white/5 bg-white/[0.01]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isCurrentOver && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrentOver ? "text-stadium-gold" : "text-slate-500"}`}>
                  Over {overNum + 1}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-bold">
                {overRuns} runs{overWickets > 0 ? ` • ${overWickets}W` : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ballsInOver.map((ball, idx) => {
                const style = getBallStyle(ball);
                return (
                  <div
                    key={ball.id}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all
                      ${style.bg} ${style.text}
                      ${style.glow ? `shadow-lg ${style.glow}` : ""}
                      ${ball.isOptimistic ? "animate-pulse opacity-70 ring-2 ring-white/20" : "animate-ball-in"}`}
                    title={`Ball ${idx + 1}: ${ball.runs_scored} runs${ball.is_wicket ? " WICKET" : ""}${ball.extra_type ? ` (${ball.extra_type})` : ""}`}
                  >
                    {style.label}
                  </div>
                );
              })}

              {isCurrentOver && ballsInOver.filter(b => !b.isOptimistic).length < 6 &&
                [...Array(Math.max(0, 6 - ballsInOver.filter(b => !b.isOptimistic).length))].map((_, i) => (
                  <div key={`empty-${i}`} className="w-9 h-9 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
});

BallTimeline.displayName = "BallTimeline";
