import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-pitch">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow md:pl-72 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-stadium-gold rounded-full" />
            <h2 className="text-white text-sm font-bold tracking-widest uppercase">Console Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 glass-card px-4 py-2 bg-white/5 border-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Server: UK-EAST-1</span>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stadium-navy to-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-stadium-gold shadow-lg">
              TA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6 md:p-12 animate-slide-up">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            © 2026 Cricket Live Pro • Advanced Tournament Infrastructure
          </p>
        </footer>
      </div>
    </div>
  );
}

