import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "live" | "success" | "warning" | "error" | "info" | "gold" | "secondary";
  className?: string;
}

export const Badge = ({ children, variant = "info", className = "" }: BadgeProps) => {
  const variants = {
    live: "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] animate-live",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    gold: "bg-stadium-gold/10 text-stadium-gold border border-stadium-gold/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    secondary: "bg-white/5 text-slate-400 border border-white/10",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {variant === "live" && <span className="w-1 h-1 rounded-full bg-white mr-2 shadow-[0_0_8px_white]" />}
      {children}
    </span>
  );
};

