import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";


export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-pitch">
      {/* Stadium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stadium-emerald/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stadium-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-5xl w-full animate-slide-up">
          <Badge variant="gold" className="mb-8 stadium-border-gold px-6 py-2 text-sm">
            Ultimate Cricket Ecosystem
          </Badge>
          
          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
            CRICKET<br />LIVE PRO
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Professional league management with sub-second live scoring. 
            Transform your tournament into a <span className="text-white font-bold">world-class broadcast experience.</span>
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card hoverable className="text-left group border-white/5 bg-white/[0.02]">
              <CardHeader className="border-none pb-2">
                <div className="w-12 h-12 rounded-xl bg-stadium-emerald/20 flex items-center justify-center mb-4 text-stadium-emerald group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl text-white font-black">Live Engine</h3>
              </CardHeader>
              <CardBody>
                <p className="text-slate-500 text-sm leading-relaxed">Proprietary real-time engine delivering ball-by-ball updates with near-zero latency.</p>
              </CardBody>
            </Card>

            <Card hoverable className="text-left group border-white/5 bg-white/[0.02]">
              <CardHeader className="border-none pb-2">
                <div className="w-12 h-12 rounded-xl bg-stadium-gold/20 flex items-center justify-center mb-4 text-stadium-gold group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl text-white font-black">Analytics</h3>
              </CardHeader>
              <CardBody>
                <p className="text-slate-500 text-sm leading-relaxed">Automated points tables, NRR calculation, and player performance tracking.</p>
              </CardBody>
            </Card>

            <Card hoverable className="text-left group border-white/5 bg-white/[0.02]">
              <CardHeader className="border-none pb-2">
                <div className="w-12 h-12 rounded-xl bg-stadium-accent/20 flex items-center justify-center mb-4 text-stadium-accent group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.105c1.54 2.139 3.387 3.996 5.498 5.498m7.007-7.007c.502-1.885.753-3.856.753-5.891 0-1.932-.214-3.815-.619-5.632m-15.708-4.007c2.105-1.54 3.996-3.387 5.498-5.498M10.5 3.5c1.885-.502 3.856-.753 5.891-.753 1.932 0 3.815.214 5.632.619m-1.406 8.906c.499.058.981.121 1.447.189m-1.447-1.447c-.058-.499-.121-.981-.189-1.447m1.447 1.447l.828-.828m1.103 1.103l.828-.828" /></svg>
                </div>
                <h3 className="text-xl text-white font-black">Hybrid Formats</h3>
              </CardHeader>
              <CardBody>
                <p className="text-slate-500 text-sm leading-relaxed">Seamless transition from league stages to knockout brackets automatically.</p>
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-wrap gap-6 justify-center items-center">
            <Link href="/live">
              <Button variant="gold" size="lg" className="h-16 text-lg stadium-shadow">
                Explore Live Matches
              </Button>
            </Link>
            <div className="flex gap-4">
              <Link href="/admin/tournaments">
                <Button variant="secondary" size="lg" className="h-16 border-white/10">
                  Admin Panel
                </Button>
              </Link>
              <Link href="/admin/teams">
                <Button variant="secondary" size="lg" className="h-16 border-white/10">
                  Team Registry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Overlay Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </main>
  );
}

