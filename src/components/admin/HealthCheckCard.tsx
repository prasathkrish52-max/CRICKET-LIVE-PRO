import React from "react";
import { HealthReport } from "@/lib/services/healthService";

interface HealthCheckCardProps {
  report: HealthReport;
}

export function HealthCheckCard({ report }: HealthCheckCardProps) {
  const isHealthy = report.status === "healthy";
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isHealthy 
        ? "bg-stadium-emerald/5 border-stadium-emerald/20" 
        : "bg-red-500/5 border-red-500/20"
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? "bg-stadium-emerald animate-pulse" : "bg-red-500"}`}></div>
          <span className="text-sm font-bold text-white uppercase tracking-tight">{report.name}</span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isHealthy ? "text-stadium-emerald" : "text-red-500"}`}>
          {report.status}
        </span>
      </div>
      {report.message && (
        <p className="mt-2 text-[10px] text-slate-500 font-mono italic">{report.message}</p>
      )}
    </div>
  );
}
