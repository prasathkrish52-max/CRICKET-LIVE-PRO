"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TeamList } from "@/components/admin/TeamList";
import { TeamForm } from "@/components/admin/TeamForm";
import { Button } from "@/components/ui/Button";
import { teamService } from "@/lib/services/teamService";
import Link from "next/link";

// ── Inline toast (shared pattern) ─────────────────────────────────────────
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-slide-up
      ${type === "success" ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300" : "bg-red-900/90 border-red-500/30 text-red-300"}`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await teamService.getAllTeams();
      setError(null);
      setTeams(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch teams. Please verify your Supabase setup.");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  return (
    <div className="space-y-10">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-stadium-gold rounded-full" />
            <h1 className="text-4xl font-black text-white tracking-tighter">Team Registry</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Register professional franchises, manage player rosters, and monitor team performance across all leagues.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="gold" size="md" className="stadium-shadow" onClick={() => setShowForm(true)}>
            Register Team
          </Button>
          <Link href="/admin/teams/new">
            <Button variant="secondary" size="md">Full Registration</Button>
          </Link>
          <Button variant="secondary" onClick={fetchTeams} size="md">Sync</Button>
        </div>
      </header>

      {/* Quick Register Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-md animate-slide-up">
            <TeamForm
              onSuccess={(msg) => {
                setShowForm(false);
                fetchTeams();
                showToast(msg || "Team registered!", "success");
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stadium-gold" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading team data...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 font-bold mb-6">{error}</p>
          <Button variant="secondary" onClick={fetchTeams}>Retry</Button>
        </div>
      ) : (
        <TeamList teams={teams} />
      )}
    </div>
  );
}
