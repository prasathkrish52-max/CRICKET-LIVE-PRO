import React from "react";
import { Badge } from "./Badge";

export function SetupNotice() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stadium-pitch/90 backdrop-blur-md p-6">
      <div className="glass-card max-w-md w-full p-8 text-center border-stadium-gold/30">
        <Badge variant="gold" className="mb-4">Configuration Required</Badge>
        <h2 className="text-2xl font-bold mb-4 text-white">Supabase Setup Needed</h2>
        <p className="text-slate-300 mb-6 leading-relaxed">
          To start using Cricket Live Pro, you need to connect your Supabase project.
        </p>
        
        <div className="bg-stadium-navy/50 rounded-lg p-4 text-left mb-6 font-mono text-sm border border-white/5">
          <p className="text-emerald-400 mb-2"># Step 1: Create .env.local</p>
          <p className="text-slate-400"># Step 2: Add your credentials:</p>
          <p className="text-amber-400 mt-2">NEXT_PUBLIC_SUPABASE_URL=...</p>
          <p className="text-amber-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
        </div>

        <p className="text-xs text-slate-500 italic">
          Check .env.example for the template. After adding the variables, restart your dev server.
        </p>
      </div>
    </div>
  );
}
