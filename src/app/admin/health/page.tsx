"use client";

import React, { useEffect, useState } from "react";
import { healthService, HealthReport } from "@/lib/services/healthService";
import { HealthCheckCard } from "@/components/admin/HealthCheckCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminHealthPage() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runDiagnostics = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthService.runFullDiagnostics();
      setReports(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Diagnostics failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runDiagnostics();
  }, [runDiagnostics]);

  const connectionReport = reports.find(r => r.type === 'connection');
  const tableReports = reports.filter(r => r.type === 'table');
  const storageReport = reports.find(r => r.type === 'storage');

  return (
    <div className="min-h-screen bg-stadium-pitch p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <Link href="/admin/tournaments" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Admin Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">
              System Health
            </h1>
            <p className="text-slate-400 mt-2">
              Diagnostic overview of your Supabase infrastructure.
              {lastCheck && <span className="ml-2 text-slate-600 italic">(Last checked: {lastCheck.toLocaleTimeString()})</span>}
            </p>
          </div>
          <Button variant="gold" onClick={runDiagnostics} isLoading={loading}>
            Run Diagnostics
          </Button>
        </header>

        <div className="grid gap-8">
          {/* Connection Status */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Core Connection</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {connectionReport && <HealthCheckCard report={connectionReport} />}
              {storageReport && <HealthCheckCard report={storageReport} />}
            </div>
          </section>

          {/* Table Status */}
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Database Schema</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tableReports.map(report => (
                <HealthCheckCard key={report.id} report={report} />
              ))}
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="glass-card p-8 border-stadium-gold/10 mt-8">
            <h3 className="text-lg font-bold text-white uppercase mb-4">Troubleshooting Guide</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs">1</div>
                <p className="text-sm text-slate-400">If <strong>Connection</strong> is unhealthy, verify your <code>.env.local</code> file contains valid Supabase keys.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs">2</div>
                <p className="text-sm text-slate-400">If <strong>Tables</strong> are unhealthy, ensure you have executed the <code>supabase/schema.sql</code> script in your Supabase SQL Editor.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs">3</div>
                <p className="text-sm text-slate-400">If <strong>Storage</strong> is unhealthy, manually create a bucket named <code>teams</code> in your Supabase Storage dashboard and set it to public.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
