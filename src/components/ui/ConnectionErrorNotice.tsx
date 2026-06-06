"use client";

import React, { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { supabase } from "@/lib/supabase";

interface ConnectionErrorNoticeProps {
  errorDetails?: string;
  onRetry: () => void;
}

export function ConnectionErrorNotice({ errorDetails, onRetry }: ConnectionErrorNoticeProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      // Test the connection by selecting from tournaments table (limit 0 to minimize overhead)
      const { error } = await supabase.from("tournaments").select("count", { count: "exact", head: true }).limit(0);
      
      // If we don't get a network error, it's successful (errors like PGRST301 indicate table exists, but RLS blocks it)
      if (!error || (error.code !== "PGRST301" && !error.message.includes("fetch"))) {
        onRetry();
      } else {
        throw error;
      }
    } catch (err: any) {
      setRetryError(err.message || "Failed to fetch. Database is still unreachable.");
    } finally {
      setRetrying(false);
    }
  };

  const projectReference = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "ehzqhqtqqkmouaiutiqe";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stadium-pitch/95 backdrop-blur-lg p-6 overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-8 md:p-10 text-center border-stadium-gold/30 stadium-shadow my-8">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-stadium-gold/20 rounded-full blur-xl animate-live" />
          <div className="relative w-16 h-16 rounded-full bg-stadium-navy border border-stadium-gold/30 flex items-center justify-center text-3xl">
            ⚠️
          </div>
        </div>

        <Badge variant="gold" className="mb-4">Database Connection Offline</Badge>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-white tracking-tight">Database Unreachable</h2>
        
        <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
          The application is unable to connect to your Supabase project. This usually means the project is <span className="text-stadium-gold font-bold">Paused</span> due to inactivity or the URL is incorrect.
        </p>

        {errorDetails && (
          <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 text-red-400 font-mono text-xs mb-6 break-all">
            Error: {errorDetails}
          </div>
        )}

        <div className="bg-stadium-navy/50 rounded-xl p-6 text-left mb-6 border border-white/5 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">How to restore connection:</h4>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs mt-0.5">1</div>
            <p className="text-xs md:text-sm text-slate-400">
              Log in to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-stadium-accent hover:underline font-semibold">Supabase Dashboard</a>.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs mt-0.5">2</div>
            <p className="text-xs md:text-sm text-slate-400">
              Locate project <code className="text-stadium-gold bg-stadium-gold/10 px-1.5 py-0.5 rounded font-mono text-xs">{projectReference}</code> and click <strong className="text-white">Restore Project</strong> (it takes 1-2 minutes).
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-stadium-gold/10 text-stadium-gold flex items-center justify-center font-bold text-xs mt-0.5">3</div>
            <p className="text-xs md:text-sm text-slate-400">
              Check your <code className="text-slate-300 font-mono text-xs">.env.local</code> if you created a new project, and update the keys.
            </p>
          </div>
        </div>

        {retryError && (
          <p className="text-xs text-red-400 mb-4 animate-pulse">
            ❌ {retryError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="gold" 
            className="w-full sm:w-auto px-8 py-3 font-bold uppercase tracking-wider text-xs"
            onClick={handleRetry} 
            isLoading={retrying}
          >
            Reconnect Database
          </Button>
          
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full sm:w-auto text-center text-xs text-slate-400 hover:text-white transition-colors py-2 px-4 border border-white/10 hover:border-white/20 rounded-xl"
          >
            Open Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
