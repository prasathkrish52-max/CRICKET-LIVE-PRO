"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface WicketDialogProps {
  striker: any;
  nonStriker: any;
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export const WicketDialog = ({ striker, nonStriker, onConfirm, onCancel }: WicketDialogProps) => {
  const [type, setType] = useState("bowled");
  const [whoIsOut, setWhoIsOut] = useState(striker.id);

  const wicketTypes = [
    "bowled", "caught", "lbw", "stumped", "run_out", "hit_wicket"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-pitch/90 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-500/30">
        <CardHeader className="text-center">
          <Badge variant="error" className="mb-2">WICKET EVENT</Badge>
          <h3 className="text-xl font-black uppercase tracking-tighter">Dismissal Details</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Wicket Type */}
          <div className="grid grid-cols-3 gap-2">
            {wicketTypes.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all ${type === t ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 text-slate-400"}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Who is out? (Especially for Run Out) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Who was dismissed?</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setWhoIsOut(striker.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${whoIsOut === striker.id ? "border-red-500 bg-red-500/10" : "border-white/5"}`}
              >
                <div className="text-xs font-bold">{striker.name}</div>
                <div className="text-[8px] text-slate-500 uppercase font-black mt-1">Striker</div>
              </button>
              <button 
                onClick={() => setWhoIsOut(nonStriker.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${whoIsOut === nonStriker.id ? "border-red-500 bg-red-500/10" : "border-white/5"}`}
              >
                <div className="text-xs font-bold">{nonStriker.name}</div>
                <div className="text-[8px] text-slate-500 uppercase font-black mt-1">Non-Striker</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onCancel} className="flex-grow">Cancel</Button>
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700 flex-grow font-black uppercase tracking-widest"
              onClick={() => onConfirm({ type, dismissed_id: whoIsOut })}
            >
              Confirm Wicket
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
