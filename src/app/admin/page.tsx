"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const { stats, loading } = useAdminRealtime();
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentTournaments = async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) setRecentTournaments(data);
    };

    fetchRecentTournaments();
  }, []);

  const statCards = [
    { label: "Active Tournaments", value: loading ? "..." : stats.activeTournaments.toString(), icon: "🏆", trend: "Live" },
    { label: "Registered Teams", value: loading ? "..." : stats.registeredTeams.toString(), icon: "👥", trend: "Total" },
    { label: "Matches Live", value: loading ? "..." : stats.liveMatches.toString(), icon: "🔴", trend: "Active", isLive: true },
    { label: "Total Players", value: loading ? "..." : stats.totalPlayers.toString(), icon: "🏏", trend: "Total" },
  ];

  return (
    <div>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">DASHBOARD</h1>
          <p className="text-slate-400 mt-1">Welcome back, Admin. Real-time tournament control center.</p>
        </div>
        <Link href="/admin/tournaments/new">
          <Button variant="gold" className="shadow-lg shadow-stadium-gold/20">Create Tournament</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label} isGlass className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-1 ${
                  stat.isLive ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-stadium-gold'
                }`}>
                  {stat.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>}
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-black mb-1 text-white">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Recent Tournaments</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {recentTournaments.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No tournaments found. Create one to get started.</div>
                ) : (
                  recentTournaments.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-stadium-gold/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stadium-gold/10 rounded-xl flex items-center justify-center text-xl">🏆</div>
                        <div>
                          <div className="font-bold text-white">{t.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">{t.format} • {t.status}</div>
                        </div>
                      </div>
                      <Link href={`/admin/tournaments/${t.id}/manage`}>
                        <Button variant="ghost" size="sm" className="group-hover:text-stadium-gold text-slate-300">Manage</Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="border border-stadium-gold/30 bg-stadium-gold/5 backdrop-blur-xl">
            <CardHeader>
              <h3 className="text-lg font-bold uppercase tracking-tighter text-stadium-gold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link href="/admin/teams/new" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-0 text-white">
                  <span>➕</span> Register New Team
                </Button>
              </Link>
              <Link href="/admin/tournaments" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-0 text-white">
                  <span>📅</span> Generate Fixtures
                </Button>
              </Link>
              <Button variant="secondary" className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-0 text-white">
                <span>👤</span> Add Scorer Admin
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
