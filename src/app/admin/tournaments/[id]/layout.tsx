"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { tournamentService } from '@/lib/services/tournamentService';
import { Badge } from '@/components/ui/Badge';

export default function TournamentAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    const fetchTourney = async () => {
      try {
        const data = await tournamentService.getTournamentDetails(id);
        setTournament(data);
      } catch (err) {
        console.error("Failed to load tournament", err);
      }
    };
    fetchTourney();
  }, [id]);

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="gold" className="uppercase text-[10px]">
                {tournament?.format || 'Loading...'}
              </Badge>
              <Badge variant="secondary" className="uppercase text-[10px]">
                {tournament?.status || 'Loading...'}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {tournament?.name || 'Loading Tournament...'}
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
        {children}
      </div>
    </div>
  );
}
