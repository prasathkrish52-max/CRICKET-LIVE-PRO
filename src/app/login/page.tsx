"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) router.push("/admin/tournaments");
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      router.push("/admin/tournaments");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stadium-gold/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stadium-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-stadium-gold rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-2xl">🏏</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Cricket <span className="text-stadium-gold">Live Pro</span>
            </h1>
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Command Center Login</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 border-white/5 shadow-2xl relative animate-slide-up delay-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stadium-gold to-stadium-accent opacity-50" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-tight animate-shake text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
                <input
                  required
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-stadium-gold transition-all font-medium placeholder:text-slate-700"
                  placeholder="admin@cricketlivepro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Security Key</label>
                <input
                  required
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-stadium-gold transition-all font-medium placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full py-4 text-sm font-black shadow-2xl transition-transform hover:scale-[1.02]"
              isLoading={loading}
            >
              Access Command Center
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <Link href="/" className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
              ← Return to Fan Zone
            </Link>
          </div>
        </div>

        {/* Bottom Notice */}
        <p className="text-center mt-10 text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
          Authorized personnel only. All access attempts are monitored and logged by the security system.
        </p>
      </div>
    </div>
  );
}
