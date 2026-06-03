"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MatchResultDialogProps {
  winner: any;
  margin: string;
  onConfirm: () => void;
}

export const MatchResultDialog = ({ winner, margin, onConfirm }: MatchResultDialogProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-pitch/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Badge variant="gold" className="mb-4">MATCH COMPLETED</Badge>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Victory</h1>
        </div>

        <Card className="border-stadium-gold/30 bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-stadium-gold/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <CardBody className="py-12 text-center relative z-10">
            <div className="w-24 h-24 bg-pitch border-4 border-stadium-gold rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-stadium-gold/20">
              {winner?.logo_url ? <img src={winner.logo_url} className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-stadium-gold">{winner?.name?.[0]}</span>}
            </div>
            
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{winner?.name}</h2>
            <div className="text-stadium-gold text-xl font-bold italic">
              WON BY {margin.toUpperCase()}
            </div>
          </CardBody>
        </Card>

        <div className="mt-10">
          <Button 
            variant="gold" 
            className="w-full h-16 uppercase font-black text-lg tracking-widest bg-stadium-emerald hover:bg-stadium-emerald/80 border-none shadow-xl shadow-stadium-emerald/20"
            onClick={onConfirm}
          >
            Finalize & Close Match
          </Button>
          <p className="text-center text-[10px] text-slate-500 uppercase font-bold mt-4 tracking-widest">Points table and NRR will be updated automatically.</p>
        </div>
      </div>
    </div>
  );
};
