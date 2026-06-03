"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { generateCommentaryText } from "@/lib/commentary";

interface CommentaryListProps {
  balls: any[];
}

export const CommentaryList = ({ balls }: CommentaryListProps) => {
  return (
    <div className="space-y-4">
      {balls.map((ball, index) => {
        const commentary = generateCommentaryText({
          ...ball,
          batsman_name: ball.batsman?.name,
          bowler_name: ball.bowler?.name,
        });

        const isOverEnd = ball.ball_number === 6;

        return (
          <div key={ball.id || index} className="group">
            {/* Over Separator */}
            {isOverEnd && index !== 0 && (
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-white/10 flex-grow"></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End of Over {ball.over_number + 1}</div>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
            )}

            <div className={`flex gap-4 p-3 rounded-lg transition-colors ${ball.is_wicket ? "bg-red-500/10 border-l-4 border-red-500" : "hover:bg-white/5 border-l-4 border-transparent"}`}>
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-sm font-bold text-stadium-gold">{ball.over_number}.{ball.ball_number}</span>
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex gap-2">
                    {ball.is_wicket ? (
                      <Badge variant="error">WICKET</Badge>
                    ) : ball.extra_type ? (
                      <Badge variant="warning">{ball.extra_type.toUpperCase()}</Badge>
                    ) : (
                      <Badge variant={ball.runs_scored >= 4 ? "gold" : "secondary"}>
                        {ball.runs_scored} {ball.runs_scored === 1 ? "RUN" : "RUNS"}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {commentary}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {balls.length === 0 && (
        <div className="text-center py-10 text-slate-500 italic">
          No commentary available for this innings yet.
        </div>
      )}
    </div>
  );
};
