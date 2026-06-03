"use client";

import React, { useState, useCallback } from "react";

interface ScoringControlsProps {
  onRecordBall: (runs: number, extraType?: string, isWicket?: boolean) => void;
  onUndo: () => void;
  disabled?: boolean;
}

type LastEvent = { type: "run"; runs: number } | { type: "wicket" } | { type: "extra"; label: string } | null;

function EventFlash({ event }: { event: NonNullable<LastEvent> }) {
  if (event.type === "wicket") {
    return (
      <div className="animate-wicket rounded-2xl p-6 text-center border border-red-500/30 mb-2">
        <div className="text-5xl font-black text-red-400 uppercase tracking-tight animate-score-flash">WICKET!</div>
        <div className="text-xs text-red-400/60 font-black uppercase tracking-widest mt-1">OUT</div>
      </div>
    );
  }
  if (event.type === "run" && event.runs === 6) {
    return (
      <div className="animate-boundary-6 rounded-2xl p-6 text-center border border-emerald-500/30 mb-2">
        <div className="text-5xl font-black text-emerald-400 animate-score-flash">SIX!</div>
        <div className="text-xs text-emerald-400/60 font-black uppercase tracking-widest mt-1">Maximum</div>
      </div>
    );
  }
  if (event.type === "run" && event.runs === 4) {
    return (
      <div className="animate-boundary-4 rounded-2xl p-6 text-center border border-yellow-500/30 mb-2">
        <div className="text-5xl font-black text-stadium-gold animate-score-flash">FOUR!</div>
        <div className="text-xs text-yellow-500/60 font-black uppercase tracking-widest mt-1">Boundary</div>
      </div>
    );
  }
  if (event.type === "run") {
    return (
      <div className="rounded-2xl p-4 text-center border border-white/5 bg-white/5 mb-2">
        <div className="text-4xl font-black text-white animate-score-flash">
          {event.runs === 0 ? "•" : event.runs}
        </div>
        <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
          {event.runs === 0 ? "Dot Ball" : `${event.runs} Run${event.runs > 1 ? "s" : ""}`}
        </div>
      </div>
    );
  }
  if (event.type === "extra") {
    return (
      <div className="rounded-2xl p-4 text-center border border-slate-600/30 bg-white/5 mb-2">
        <div className="text-3xl font-black text-slate-400">{event.label}</div>
        <div className="text-xs text-slate-600 font-black uppercase tracking-widest mt-1">Extra</div>
      </div>
    );
  }
  return null;
}

export function ScoringControls({ onRecordBall, onUndo, disabled }: ScoringControlsProps) {
  const [lastEvent, setLastEvent] = useState<LastEvent>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerEvent = useCallback((event: LastEvent) => {
    setLastEvent(event);
    setFlashKey(k => k + 1);
    // Auto-clear after 2 seconds
    setTimeout(() => setLastEvent(null), 2000);
  }, []);

  const handleRun = async (r: number) => {
    setIsSyncing(true);
    triggerEvent({ type: "run", runs: r });
    try {
      await onRecordBall(r);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExtra = async (type: string, label: string) => {
    setIsSyncing(true);
    triggerEvent({ type: "extra", label });
    try {
      await onRecordBall(0, type);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleWicket = async () => {
    setIsSyncing(true);
    triggerEvent({ type: "wicket" });
    try {
      await onRecordBall(0, undefined, true);
    } finally {
      setIsSyncing(false);
    }
  };

  const runs = [0, 1, 2, 3, 4, 6];
  const extras = [
    { label: "Wide", type: "wide", short: "Wd" },
    { label: "No Ball", type: "no_ball", short: "Nb" },
    { label: "Leg Bye", type: "leg_bye", short: "Lb" },
    { label: "Bye", type: "bye", short: "By" },
  ];

  return (
    <div className="space-y-8">
      {/* Live Event Flash */}
      {lastEvent && <EventFlash key={flashKey} event={lastEvent} />}

      {/* Runs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-stadium-emerald rounded-full" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Record Runs</h4>
          </div>
          {isSyncing && (
            <div className="flex items-center gap-2 text-[8px] font-black text-stadium-gold uppercase tracking-[0.2em] animate-pulse">
              <span className="w-1 h-1 rounded-full bg-stadium-gold" />
              Broadcast Syncing...
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {runs.map((r) => (
            <button
              key={r}
              disabled={disabled}
              onClick={() => handleRun(r)}
              className={`h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all
                active:scale-90 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed select-none
                ${r === 4
                  ? "bg-stadium-gold/10 border-stadium-gold/40 text-stadium-gold hover:bg-stadium-gold/20 hover:shadow-lg hover:shadow-stadium-gold/20"
                  : r === 6
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/20"
                  : r === 0
                  ? "bg-white/3 border-white/5 text-slate-600 hover:bg-white/8 hover:border-white/10"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                }`}
            >
              <span className="text-3xl font-black score-number leading-none">{r === 0 ? "•" : r}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">
                {r === 0 ? "Dot" : r === 4 ? "Four" : r === 6 ? "Six" : "Runs"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Extras + Actions */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Extras */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-stadium-accent rounded-full" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Extras</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {extras.map((e) => (
              <button
                key={e.type}
                disabled={disabled}
                onClick={() => handleExtra(e.type, e.label)}
                className="flex items-center justify-between px-5 py-4 bg-white/5 border border-white/5
                  rounded-2xl text-xs font-black text-slate-400 hover:text-white hover:bg-white/10
                  hover:border-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="uppercase tracking-widest">{e.label}</span>
                <span className={`text-sm font-black px-2 py-0.5 rounded-lg
                  ${e.type === "wide" ? "bg-slate-700 text-slate-300" :
                    e.type === "no_ball" ? "bg-orange-500/20 text-orange-400" :
                    "bg-white/5 text-slate-500"}`}>
                  {e.short}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Critical Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-red-500 rounded-full" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Actions</h4>
          </div>
          <div className="flex gap-3 h-[calc(100%-2rem)]">
            <button
              disabled={disabled}
              onClick={handleWicket}
              className="flex-grow bg-gradient-to-b from-red-600 to-red-700 text-white rounded-2xl
                font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-red-900/40
                hover:from-red-500 hover:to-red-600 hover:shadow-red-800/50
                transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                flex flex-col items-center justify-center gap-2 border border-red-500/30"
            >
              <span className="text-2xl">☝️</span>
              WICKET
            </button>
            <button
              disabled={disabled}
              onClick={onUndo}
              className="px-6 bg-white/5 border border-white/5 text-slate-500 rounded-2xl
                font-black uppercase tracking-widest text-xs
                hover:text-white hover:bg-white/10 hover:border-white/10
                transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              UNDO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
