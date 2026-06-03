"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { teamService, PlayerCreateData } from "@/lib/services/teamService";

interface PlayerFormProps {
  teamId: string;
  onSuccess: () => void;
}

export function PlayerForm({ teamId, onSuccess }: PlayerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<PlayerCreateData, "team_id">>({
    name: "",
    role: "batsman",
    batting_style: "Right-hand bat",
    bowling_style: "N/A",
    jersey_number: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamService.addPlayer({ ...formData, team_id: teamId });
      setFormData({
        name: "",
        role: "batsman",
        batting_style: "Right-hand bat",
        bowling_style: "N/A",
        jersey_number: 0,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to add player:", error);
      alert("Error adding player.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 glass-card border-white/5">
      <h3 className="text-sm font-bold text-stadium-gold uppercase tracking-widest mb-4">Add New Player</h3>
      
      <div>
        <input
          required
          type="text"
          className="w-full bg-stadium-navy/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stadium-gold transition-colors text-sm"
          placeholder="Player Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <select
          className="bg-stadium-navy/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stadium-gold transition-colors text-sm"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
        >
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all-rounder">All-rounder</option>
        </select>

        <input
          type="number"
          className="bg-stadium-navy/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stadium-gold transition-colors text-sm"
          placeholder="Jersey #"
          value={formData.jersey_number || ""}
          onChange={(e) => setFormData({ ...formData, jersey_number: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          className="bg-stadium-navy/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stadium-gold transition-colors text-sm"
          placeholder="Batting Style"
          value={formData.batting_style}
          onChange={(e) => setFormData({ ...formData, batting_style: e.target.value })}
        />
        <input
          type="text"
          className="bg-stadium-navy/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-stadium-gold transition-colors text-sm"
          placeholder="Bowling Style"
          value={formData.bowling_style}
          onChange={(e) => setFormData({ ...formData, bowling_style: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        variant="gold"
        size="sm"
        className="w-full"
        isLoading={loading}
      >
        Add Player to Squad
      </Button>
    </form>
  );
}
