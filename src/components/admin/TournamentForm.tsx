"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { tournamentService, TournamentCreateData } from "@/lib/services/tournamentService";

interface TournamentFormProps {
  onSuccess: (message?: string) => void;
  onCancel: () => void;
}

export function TournamentForm({ onSuccess, onCancel }: TournamentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TournamentCreateData>({
    name: "",
    format: "league",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      await tournamentService.createTournament(formData);
      onSuccess(`Tournament "${formData.name}" created successfully!`);
    } catch (error: any) {
      setFormError(error.message || "Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 border-stadium-gold/20">
      {formError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 text-sm">⚠️</span>
          <p className="text-red-400 text-sm font-medium">{formError}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
          Tournament Name
        </label>
        <input
          required
          type="text"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-stadium-gold transition-colors placeholder:text-slate-600"
          placeholder="e.g. Summer Premier League 2026"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Format
          </label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-stadium-gold transition-colors"
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
          >
            <option value="league">League (Round Robin)</option>
            <option value="knockout">Knockout (Elimination)</option>
            <option value="hybrid">Hybrid (League + Knockout)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Start Date <span className="text-slate-600">(optional)</span>
          </label>
          <input
            type="date"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-stadium-gold transition-colors"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="submit" variant="gold" className="flex-grow" isLoading={loading}>
          Create Tournament
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
