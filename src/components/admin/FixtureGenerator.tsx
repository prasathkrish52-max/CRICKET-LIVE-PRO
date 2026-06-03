"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { fixtureService } from "@/lib/services/fixtureService";

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

interface FixtureGeneratorProps {
  tournamentId: string;
  tournamentFormat: string;
  teams: Team[];
  onGenerated: () => void;
}

export function FixtureGenerator({ tournamentId, tournamentFormat, teams, onGenerated }: FixtureGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(teams.map(t => t.id));
  const [venue, setVenue] = useState("Stadium Grounds");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleGenerate = async () => {
    if (selectedTeamIds.length < 2) {
      alert("Please select at least 2 teams.");
      return;
    }

    setLoading(true);
    try {
      if (tournamentFormat === "league") {
        await fixtureService.generateLeagueFixtures(tournamentId, selectedTeamIds, new Date(startDate), venue);
      } else {
        await fixtureService.generateKnockoutBrackets(tournamentId, selectedTeamIds, new Date(startDate), venue);
      }
      onGenerated();
    } catch (error) {
      console.error("Failed to generate fixtures:", error);
      alert("Error generating fixtures.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border-stadium-gold/20">
      <h3 className="text-sm font-bold text-stadium-gold uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Fixture Generator
      </h3>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Default Venue</label>
            <input
              type="text"
              className="w-full bg-stadium-navy/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-stadium-gold outline-none"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Start From</label>
            <input
              type="date"
              className="w-full bg-stadium-navy/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-stadium-gold outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Select Teams ({selectedTeamIds.length})</label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {teams.length === 0 ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton h-10 w-full" />)
            ) : (
              teams.map(team => (
                <div 
                  key={team.id} 
                  className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${
                    selectedTeamIds.includes(team.id) ? 'bg-stadium-gold/10 border-stadium-gold/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => !loading && handleToggleTeam(team.id)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedTeamIds.includes(team.id) ? 'bg-stadium-gold border-stadium-gold text-stadium-pitch' : 'border-white/20'
                  }`}>
                    {selectedTeamIds.includes(team.id) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                  </div>
                  <span className="text-xs text-white">{team.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <Button 
          variant="gold" 
          className="w-full text-[10px] font-black tracking-[0.2em] uppercase" 
          isLoading={loading}
          onClick={handleGenerate}
        >
          Generate {tournamentFormat === 'league' ? 'League' : 'Bracket'} Schedule
        </Button>
      </div>
    </div>
  );
}
