"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { scoringService } from "@/lib/services/scoringService";
import { InningsStatus } from "@/components/scorer/InningsStatus";
import { ScoringControls } from "@/components/scorer/ScoringControls";
import { BallTimeline, BallEntry } from "@/components/scorer/BallTimeline";
import { BatterSelection } from "@/components/scorer/BatterSelection";
import { BowlerSelection } from "@/components/scorer/BowlerSelection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ScoringClient({ 
  id, 
  initialMatch, 
  initialInnings, 
  initialBalls,
  initialActivePlayers 
}: { 
  id: string, 
  initialMatch: any, 
  initialInnings: any, 
  initialBalls: any[],
  initialActivePlayers: any
}) {
  const [match, setMatch] = useState<any>(initialMatch);
  const [innings, setInnings] = useState<any>(initialInnings);
  const [inningsNumber, setInningsNumber] = useState(initialInnings?.innings_number || 1);
  const [target, setTarget] = useState<number | null>(null);
  const [activePlayers, setActivePlayers] = useState<any>(initialActivePlayers);
  const [balls, setBalls] = useState<BallEntry[]>(initialBalls);

  // Overlays
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<string>("");

  // Computed Player Stats from balls
  const { strikerStats, nonStrikerStats, bowlerStats, inningsStats } = useMemo(() => {
    const confirmedBalls = balls.filter(b => !b.isOptimistic);
    const bat: Record<string, { runs: number; balls: number; fours: number; sixes: number }> = {};
    const bowl: Record<string, { runs: number; legalBalls: number; wickets: number }> = {};
    
    let totalRuns = 0;
    let totalWickets = 0;
    let legalBalls = 0;

    for (const b of balls) { // Using all balls including optimistic for instant UI update!
      totalRuns += b.runs_scored;
      const isWide = b.extra_type === 'wide';
      const isNoBall = b.extra_type === 'no_ball';
      const isBye = b.extra_type === 'bye' || b.extra_type === 'leg_bye';
      
      if (isWide || isNoBall) totalRuns += 1;
      if (!isWide && !isNoBall) legalBalls += 1;
      if (b.is_wicket) totalWickets += 1;
    }

    for (const b of confirmedBalls) {
      const isWide = b.extra_type === 'wide';
      const isNoBall = b.extra_type === 'no_ball';
      const isBye = b.extra_type === 'bye' || b.extra_type === 'leg_bye';
      const extraRuns = (isWide || isNoBall) ? 1 : 0;

      if (b.batsman_id) {
        if (!bat[b.batsman_id]) bat[b.batsman_id] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
        if (!isWide) bat[b.batsman_id].balls++;
        if (!isBye) bat[b.batsman_id].runs += b.runs_scored;
        if (b.runs_scored === 4 && !isBye) bat[b.batsman_id].fours++;
        if (b.runs_scored === 6 && !isBye) bat[b.batsman_id].sixes++;
      }
      if (b.bowler_id) {
        if (!bowl[b.bowler_id]) bowl[b.bowler_id] = { runs: 0, legalBalls: 0, wickets: 0 };
        if (!isWide && !isNoBall) bowl[b.bowler_id].legalBalls++;
        bowl[b.bowler_id].runs += b.runs_scored + extraRuns;
        if (b.is_wicket) bowl[b.bowler_id].wickets++;
      }
    }

    const getOvers = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
    const getEconomy = (runs: number, legalBalls: number) => legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(2) : "0.00";

    const strikerId = activePlayers.striker?.id;
    const nonStrikerId = activePlayers.nonStriker?.id;
    const bowlerId = activePlayers.bowler?.id;

    const sBat = strikerId ? bat[strikerId] : null;
    const nsBat = nonStrikerId ? bat[nonStrikerId] : null;
    const bBowl = bowlerId ? bowl[bowlerId] : null;

    return {
      inningsStats: {
        totalRuns,
        totalWickets,
        oversString: getOvers(legalBalls),
        totalBalls: legalBalls
      },
      strikerStats: sBat ? { ...sBat } : { runs: 0, balls: 0, fours: 0, sixes: 0 },
      nonStrikerStats: nsBat ? { ...nsBat } : { runs: 0, balls: 0, fours: 0, sixes: 0 },
      bowlerStats: bBowl
        ? { overs: getOvers(bBowl.legalBalls), runs: bBowl.runs, wickets: bBowl.wickets, economy: getEconomy(bBowl.runs, bBowl.legalBalls) }
        : { overs: "0.0", runs: 0, wickets: 0, economy: "0.00" },
    };
  }, [balls, activePlayers]);

  useEffect(() => {
    // Subscribe to live innings updates (Calculated automatically by DB triggers now!)
    const sub = supabase.channel(`innings-live-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'innings', filter: `match_id=eq.${id}` }, payload => {
        setInnings((prev: any) => JSON.stringify(prev) === JSON.stringify(payload.new) ? prev : payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'balls' }, async payload => {
        // Refetch balls to ensure accurate timeline on other devices
        if (payload.eventType === 'INSERT') {
          setBalls(prev => [...prev, payload.new as any]);
        } else if (payload.eventType === 'DELETE') {
          setBalls(prev => prev.filter(b => b.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [id]);

  useEffect(() => {
    const checkCompletion = async () => {
      if (!innings || !match) return;
      const maxBalls = (match.overs_format || 20) * 6;
      const isAllOut = inningsStats.totalWickets >= 10;
      const isOversUp = inningsStats.totalBalls >= maxBalls;
      const isTargetChased = inningsNumber === 2 && target !== null && inningsStats.totalRuns >= target;

      if (!isAllOut && !isOversUp && !isTargetChased) return;

      if (inningsNumber === 1) {
        if (!showInningsBreak && !matchComplete) {
          setTarget(inningsStats.totalRuns + 1);
          setShowInningsBreak(true);
        }
      } else {
        if (!matchComplete) {
          const inn1Runs = target ? target - 1 : 0;
          const battingTeamId = innings.team_id;
          const bowlingTeamId = innings.team_id === match.team_a_id ? match.team_b_id : match.team_a_id;

          let winnerId: string | null = null;
          let result = "";

          if (isTargetChased) {
            winnerId = battingTeamId;
            result = `Won by ${10 - inningsStats.totalWickets} wickets`;
          } else {
            winnerId = bowlingTeamId;
            if (inn1Runs === inningsStats.totalRuns) {
               result = "Match Tied";
            } else {
               result = `Won by ${inn1Runs - inningsStats.totalRuns} runs`;
            }
          }

          // Only update database if status is not already completed
          if (match.status !== 'completed') {
            await supabase.from('matches').update({ status: 'completed', winner_id: winnerId }).eq('id', id);
          }

          const winnerData = winnerId === match.team_a_id ? match.team_a : (winnerId === match.team_b_id ? match.team_b : null);
          setWinnerTeam(winnerData);
          setMatchResult(result);
          setMatchComplete(true);
        }
      }
    };

    checkCompletion();
  }, [innings, match, id, inningsStats, inningsNumber, target, showInningsBreak, matchComplete]);

  const handleUndo = async () => {
    const confirmedBalls = balls.filter(b => !b.isOptimistic);
    if (confirmedBalls.length === 0 || !innings) return;
    const lastBall = confirmedBalls[confirmedBalls.length - 1];
    
    // Optimistic UI Update
    setBalls(balls.filter(b => b.id !== lastBall.id));
    
    try {
      // Deleting the ball will automatically trigger the DB to recalculate the innings score!
      await supabase.from('balls').delete().eq('id', lastBall.id);
    } catch (err) {
      alert("Failed to undo. Please try again.");
    }
  };

  const handleRecordBall = async (runs: number, extraType?: string, isWicket?: boolean) => {
    const { striker, nonStriker, bowler } = activePlayers;
    if (!innings || !striker || !bowler) return;

    const isLegalBall = !['wide', 'no_ball'].includes(extraType || '');
    const extraRuns = (extraType === 'wide' || extraType === 'no_ball') ? 1 : 0;
    const overNumber = Math.floor(inningsStats.totalBalls / 6);
    const ballInOver = (inningsStats.totalBalls % 6) + 1;

    let shouldRotate = runs % 2 !== 0;
    if (isLegalBall && (inningsStats.totalBalls + 1) % 6 === 0) shouldRotate = !shouldRotate;
    
    // For non-wicket balls, optimistic rotate
    if (shouldRotate && !isWicket) {
      setActivePlayers({ ...activePlayers, striker: activePlayers.nonStriker, nonStriker: activePlayers.striker });
      await scoringService.updateActivePlayers(innings.id, activePlayers.nonStriker.id, activePlayers.striker.id, bowler.id);
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticBall: BallEntry = {
      id: tempId, over_number: overNumber,
      ball_number: isLegalBall ? ballInOver : ballInOver - 1,
      runs_scored: runs, is_wicket: !!isWicket,
      extra_type: extraType || null, created_at: new Date().toISOString(),
      isOptimistic: true, batsman_id: striker.id, bowler_id: bowler.id,
      dismissed_batsman_id: isWicket ? striker.id : undefined
    };

    setBalls(prev => [...prev, optimisticBall]);

    try {
      const confirmedBall = await scoringService.recordBall({
        innings_id: innings.id, over_number: overNumber,
        ball_number: isLegalBall ? ballInOver : ballInOver - 1,
        batsman_id: striker.id, bowler_id: bowler.id,
        runs_scored: runs, is_wicket: isWicket,
        extra_type: extraType as any, extra_runs: extraRuns,
        dismissed_batsman_id: isWicket ? striker.id : undefined
      });

      setBalls(prev => prev.map(b => b.id === tempId ? { ...optimisticBall, id: confirmedBall.id, isOptimistic: false } : b));
      
      // If wicket or over complete, update active players AFTER ball is saved
      let newStriker = striker;
      let newNonStriker = nonStriker;
      let newBowler = bowler;

      if (isWicket) {
        if (shouldRotate) {
          newStriker = nonStriker;
          newNonStriker = null;
        } else {
          newStriker = null;
        }
      }

      // Clear bowler if over is complete (but not if match is complete)
      if (isLegalBall && (inningsStats.totalBalls + 1) % 6 === 0) {
        newBowler = null;
      }

      if (isWicket || !newBowler) {
        setActivePlayers({ ...activePlayers, striker: newStriker, nonStriker: newNonStriker, bowler: newBowler });
        await scoringService.updateActivePlayers(innings.id, newStriker?.id || null, newNonStriker?.id || null, newBowler?.id || null);
      }
    } catch (err) {
      setBalls(prev => prev.filter(b => b.id !== tempId));
      alert("Failed to sync score. Check your connection or RLS permissions.");
    }
  };

  const start2ndInnings = async () => {
    if (!match || !innings) return;
    const inn2TeamId = innings.team_id === match.team_a_id ? match.team_b_id : match.team_a_id;
    try {
      const newInnings = await scoringService.initializeInnings(id, inn2TeamId, 2);
      setInnings(newInnings);
      setBalls([]);
      setInningsNumber(2);
      setShowInningsBreak(false);
      window.location.reload(); // Hard refresh to get server-side players
    } catch (err) {
      console.error(err);
    }
  };

  const startInnings = async () => {
    if (!match) return;
    const battingTeamId = match.toss_decision === 'bat' ? match.toss_won_by : (match.toss_won_by === match.team_a_id ? match.team_b_id : match.team_a_id);
    const teamId = battingTeamId || match.team_a_id;
    try {
      const newInnings = await scoringService.initializeInnings(id, teamId, 1);
      setInnings(newInnings);
      window.location.reload(); // Hard refresh to get server-side players
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatterSelect = async (playerId: string) => {
    if (!innings) return;
    if (!activePlayers?.striker) {
      await supabase.from('innings').update({ current_striker_id: playerId }).eq('id', innings.id);
    } else if (!activePlayers?.nonStriker) {
      await supabase.from('innings').update({ current_non_striker_id: playerId }).eq('id', innings.id);
    }
    window.location.reload();
  };

  const handleBowlerSelect = () => {
    window.location.reload();
  };

  const battingTeam = innings ? (innings.team_id === match?.team_a_id ? match?.team_a : match?.team_b) : null;

  return (
    <div className="min-h-screen bg-pitch">
      {/* Overlays */}
      {showInningsBreak && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="glass-card p-12 max-w-lg w-full text-center border-stadium-gold/20 animate-slide-up">
            <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tight">Innings Break</h2>
            <Button variant="gold" size="lg" onClick={start2ndInnings} className="h-16 px-12 text-lg w-full">🚀 Start 2nd Innings</Button>
          </div>
        </div>
      )}

      {matchComplete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="glass-card p-12 max-w-lg w-full text-center border-emerald-500/20 animate-slide-up">
            <h2 className="text-5xl font-black text-white mb-3 uppercase tracking-tight">{winnerTeam?.name}</h2>
            <p className="text-emerald-400 text-xl font-bold mb-10">{matchResult}</p>
            <Link href="/admin/tournaments"><Button variant="gold" size="lg" className="w-full h-14">Tournament Admin</Button></Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-24 glass-panel border-b border-white/5 flex items-center sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/tournaments" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Badge variant="live">Scoring Console</Badge>
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter mt-1">
                {match?.team_a?.name} <span className="text-stadium-gold">v</span> {match?.team_b?.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 animate-slide-up">
        {!innings ? (
          <Card className="max-w-2xl mx-auto py-24 text-center border-white/5 bg-white/[0.01]">
            <div className="w-24 h-24 bg-stadium-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-stadium-gold/20 animate-bounce">🏏</div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Ready for Toss</h2>
            <Button variant="gold" size="lg" onClick={startInnings} className="h-16 px-12 text-lg">Begin 1st Innings</Button>
          </Card>
        ) : (
          <div className="grid xl:grid-cols-3 gap-10">
            {innings && (!activePlayers?.striker || !activePlayers?.nonStriker) && !showInningsBreak && !matchComplete && (
              <BatterSelection 
                matchId={match.id} 
                battingTeamId={innings.team_id} 
                inningsId={innings.id} 
                onSelect={handleBatterSelect} 
              />
            )}
            {innings && activePlayers?.striker && activePlayers?.nonStriker && !activePlayers?.bowler && !showInningsBreak && !matchComplete && (
              <BowlerSelection 
                matchId={match.id} 
                bowlingTeamId={innings.team_id === match.team_a_id ? match.team_b_id : match.team_a_id} 
                inningsId={innings.id} 
                onSelect={handleBowlerSelect} 
              />
            )}

            <div className="xl:col-span-2 space-y-10">
              <InningsStatus
                teamName={battingTeam?.name || ""}
                totalRuns={inningsStats.totalRuns}
                totalWickets={inningsStats.totalWickets}
                overs={inningsStats.oversString}
                inningsNumber={inningsNumber}
                target={target}
                striker={activePlayers.striker ? { name: activePlayers.striker.name, ...strikerStats } : null}
                nonStriker={activePlayers.nonStriker ? { name: activePlayers.nonStriker.name, ...nonStrikerStats } : null}
                bowler={activePlayers.bowler ? { name: activePlayers.bowler.name, ...bowlerStats } : null}
              />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-stadium-gold rounded-full" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Command Center</h3>
                  </div>
                  <button
                    onClick={handleUndo}
                    disabled={balls.filter(b => !b.isOptimistic).length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                  >
                    Undo Last Ball
                  </button>
                </div>
                <Card className="bg-white/[0.02] border-white/5">
                  <ScoringControls onRecordBall={handleRecordBall} onUndo={handleUndo} />
                </Card>
              </div>
            </div>

            <div className="xl:col-span-1">
              <BallTimeline inningsId={innings.id} currentOvers={parseFloat(inningsStats.oversString)} balls={balls} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
