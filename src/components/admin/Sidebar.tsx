"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { name: "Tournaments", href: "/admin/tournaments", icon: "🏆" },
  { name: "Team Registry", href: "/admin/teams", icon: "🛡️" },
  { name: "Live Scoring", href: "/scorer/matches", icon: "📊" },
  { name: "Public Live", href: "/live", icon: "📺" },
];

import { authService } from "@/lib/services/authService";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 glass-panel border-r border-white/5 z-50 flex flex-col bg-pitch/95 backdrop-blur-xl">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-stadium-gold flex items-center justify-center text-xl shadow-lg shadow-stadium-gold/20 group-hover:scale-110 transition-transform">
            🏏
          </div>
          <div>
            <h2 className="text-white text-lg font-black leading-none">CLP</h2>
            <p className="text-[10px] text-stadium-gold font-bold uppercase tracking-[0.2em] mt-1">Admin Pro</p>
          </div>
        </Link>
      </div>

      <nav className="flex-grow px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-stadium-gold/10 text-stadium-gold border border-stadium-gold/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-125 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-stadium-gold shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        {user && (
          <div className="glass-card p-4 bg-white/5 border-white/5 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-stadium-gold/20 flex items-center justify-center text-xs font-black text-stadium-gold border border-stadium-gold/20">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-red-500/20"
            >
              Terminate Session
            </button>
          </div>
        )}
        
        <div className="glass-card p-4 bg-white/[0.02] border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Endpoint</span>
          </div>
          <Badge variant="gold" className="w-full justify-center py-2 text-[8px] tracking-[0.2em]">v2.4.0 Stable</Badge>
        </div>
      </div>
    </aside>
  );
};
