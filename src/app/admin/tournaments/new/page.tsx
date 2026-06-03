"use client";

import React from "react";
import { TournamentForm } from "@/components/admin/TournamentForm";
import { useRouter } from "next/navigation";

export default function NewTournamentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stadium-pitch p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <button 
            onClick={() => router.back()}
            className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">
            Create Tournament
          </h1>
          <p className="text-slate-400 mt-2">Define your format, schedule, and rules.</p>
        </header>

        <TournamentForm 
          onSuccess={() => router.push("/admin/tournaments")}
          onCancel={() => router.push("/admin/tournaments")}
        />
      </div>
    </div>
  );
}

