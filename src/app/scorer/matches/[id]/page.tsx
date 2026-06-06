"use client";

import React, { useEffect, useState, use, useCallback, useMemo } from "react";
import { scoringService } from "@/lib/services/scoringService";
import { InningsStatus } from "@/components/scorer/InningsStatus";
import { ScoringControls } from "@/components/scorer/ScoringControls";
import { BallTimeline, BallEntry } from "@/components/scorer/BallTimeline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ScoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any>(null);
  const [inningsNumber, setInningsNumber] = useState(1);
  const [target, setTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlayers, setActivePlayers] = useState<{ striker: any; nonStriker: any; bowler: any }>({
    striker: null, nonStriker: null, bowler: null,
  });
  const [balls, setBalls] = useState<BallEntry[]>([]);

  // ── Overlays ──────────────────────────────────────────────────────────────
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<string>("");

  // ── Computed Player Stats from balls ──────────────────────────────────────
  const { strikerStats, nonStrikerStats, bowlerStats } = useMemo(() => {
    const confirmedBalls = balls.filter(b => !b.isOptimistic);
    const bat: Record<string, { runs: number; balls: number; fours: number; sixes: number }> = {};
    const bowl: Record<string, { runs: number; legalBalls: number; wickets: number }> = {};

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
      strikerStats: sBat ? { ...sBat } : { runs: 0, balls: 0, fours: 0, sixes: 0 },
      nonStrikerStats: nsBat ? { ...nsBat } : { runs: 0, balls: 0, fours: 0, sixes: 0 },
      bowlerStats: bBowl
        ? { overs: getOvers(bBowl.legalBalls), runs: bBowl.runs, wickets: bBowl.wickets, economy: getEconomy(bBowl.runs, bBowl.legalBalls) }
        : { overs: "0.0", runs: 0, wickets: 0, economy: "0.00" },
    };
  }, [balls, activePlayers]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMatchData = useCallback(async () => {
    try {
      const { data: mData, error: mError } = await supabase
        .from('matches').select('*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)').eq('id', id).single();
      if (mError) throw mError;
      setMatch(mData);

      const { data: allInnings } = await supabase
        .from('innings').select('*').eq('match_id', id).order('innings_number', { ascending: true });

      if (allInnings && allInnings.length > 0) {
        const currentInnings = allInnings[allInnings.length - 1];
        setInnings(currentInnings);
        setInningsNumber(currentInnings.innings_number);

        if (allInnings.length >= 2) {
          setTarget(allInnings[0].total_runs + 1);
        }

        const playerIds = [currentInnings.current_striker_id, currentInnings.current_non_striker_id, currentInnings.current_bowler_id].filter(Boolean);
        if (playerIds.length > 0) {
          const { data: players } = await supabase.from('players').select('*').in('id', playerIds);
          if (players) {
            setActivePlayers({
              striker: players.find(p => p.id === currentInnings.current_striker_id),
              nonStriker: players.find(p => p.id === currentInnings.current_non_striker_id),
              bowler: players.find(p => p.id === currentInnings.current_bowler_id),
            });
          }
        }

        const { data: existingBalls } = await supabase
          .from('balls')
          .select('id, over_number, ball_number, runs_scored, is_wicket, extra_type, created_at, batsman_id, bowler_id')
          .eq('innings_id', currentInnings.id)
          .order('created_at', { ascending: true });
        if (existingBalls) setBalls(existingBalls as BallEntry[]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load match data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatchData();
    const sub = supabase.channel(`innings-live-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'innings', filter: `match_id=eq.${id}` }, payload => {
        setInnings((prev: any) => JSON.stringify(prev) === JSON.stringify(payload.new) ? prev : payload.new);
      }).subscribe();
    return () => { sub.unsubscribe(); };
  }, [id, fetchMatchData]);

  // ── Innings Completion Check ───────────────────────────────────────────────
  const checkAndHandleCompletion = useCallback(async (nextInnings: any, currentInningsNum: number, currentTarget: number | null) => {
    const maxBalls = (match?.overs_format || 20) * 6;
    const isAllOut = nextInnings.total_wickets >= 10;
    const isOversUp = nextInnings.balls >= maxBalls;
    const isTargetChased = currentInningsNum === 2 && currentTarget !== null && nextInnings.total_runs >= currentTarget;

    if (!isAllOut && !isOversUp && !isTargetChased) return;

    if (currentInningsNum === 1) {
      // 1st innings over → innings break
      setTarget(nextInnings.total_runs + 1);
      setShowInningsBreak(true);
    } else {
      // 2nd innings over → match complete
      const inn1Runs = currentTarget ? currentTarget - 1 : 0;
      const inn2Runs = nextInnings.total_runs;
      const battingTeamId = nextInnings.team_id;
      const bowlingTeamId = nextInnings.team_id === match?.team_a_id ? match?.team_b_id : match?.team_a_id;

      let winnerId: string | null = null;
      let result = "";

      if (isTargetChased) {
        winnerId = battingTeamId;
        result = `Won by ${10 - nextInnings.total_wickets} wickets`;
      } else {
        winnerId = bowlingTeamId;
        result = `Won by ${inn1Runs - inn2Runs} runs`;
      }

      await supabase.from('matches').update({ status: 'completed', winner_id: winnerId }).eq('id', id);

      const winnerData = winnerId === match?.team_a_id ? match?.team_a : match?.team_b;
      setWinnerTeam(winnerData);
      setMatchResult(result);
      setMatchComplete(true);
    }
  }, [match, id]);

  // ── Undo Last Ball ────────────────────────────────────────────────────────
  const handleUndo = async () => {
    const confirmedBalls = balls.filter(b => !b.isOptimistic);
    if (confirmedBalls.length === 0 || !innings) return;

    const lastBall = confirmedBalls[confirmedBalls.length - 1];
    const remainingBalls = confirmedBalls.slice(0, -1);
    const prevBalls = [...balls];
    const prevInnings = { ...innings };

    // Recalculate totals from remaining balls
    let totalRuns = 0, totalWickets = 0, ballCount = 0, extras = 0;
    for (const b of remainingBalls) {
      const isLegal = !['wide', 'no_ball'].includes(b.extra_type || '');
      const extraRuns = (b.extra_type === 'wide' || b.extra_type === 'no_ball') ? 1 : 0;
      totalRuns += b.runs_scored + extraRuns;
      if (b.is_wicket) totalWickets++;
      if (isLegal) ballCount++;
      extras += extraRuns;
    }
    const newOvers = Math.floor(ballCount / 6) + (ballCount % 6) / 10;
    const updatedInnings = { ...innings, total_runs: totalRuns, total_wickets: totalWickets, balls: ballCount, overs: newOvers, extras };

    setBalls(remainingBalls);
    setInnings(updatedInnings);

    try {
      await supabase.from('balls').delete().eq('id', lastBall.id);
      await supabase.from('innings').update({ total_runs: totalRuns, total_wickets: totalWickets, balls: ballCount, overs: newOvers, extras }).eq('id', innings.id);
    } catch (err) {
      setBalls(prevBalls);
      setInnings(prevInnings);
      alert("Failed to undo. Please try again.");
    }
  };

  // ── Record Ball ───────────────────────────────────────────────────────────
  const handleRecordBall = async (runs: number, extraType?: string, isWicket?: boolean) => {
    const { striker, nonStriker, bowler } = activePlayers;
    if (!innings || !striker || !bowler) return;

    const prevInnings = { ...innings };
    const prevPlayers = { ...activePlayers };
    const prevBalls = [...balls];

    const isLegalBall = !['wide', 'no_ball'].includes(extraType || '');
    const extraRuns = (extraType === 'wide' || extraType === 'no_ball') ? 1 : 0;
    const nextBallCount = innings.balls + (isLegalBall ? 1 : 0);
    const overNumber = Math.floor(innings.balls / 6);
    const ballInOver = (innings.balls % 6) + 1;

    const nextInnings = {
      ...innings,
      total_runs: innings.total_runs + runs + extraRuns,
      total_wickets: innings.total_wickets + (isWicket ? 1 : 0),
      balls: nextBallCount,
      overs: Math.floor(nextBallCount / 6) + (nextBallCount % 6) / 10,
      extras: innings.extras + extraRuns
    };

    let shouldRotate = runs % 2 !== 0;
    if (isLegalBall && nextBallCount % 6 === 0) shouldRotate = !shouldRotate;
    let nextPlayers = { ...activePlayers };
    if (shouldRotate) nextPlayers = { ...prevPlayers, striker: prevPlayers.nonStriker, nonStriker: prevPlayers.striker };

    const tempId = `temp-${Date.now()}`;
    const optimisticBall: BallEntry = {
      id: tempId, over_number: overNumber,
      ball_number: isLegalBall ? ballInOver : ballInOver - 1,
      runs_scored: runs, is_wicket: !!isWicket,
      extra_type: extraType || null, created_at: new Date().toISOString(),
      isOptimistic: true, batsman_id: striker.id, bowler_id: bowler.id,
    };

    setInnings(nextInnings);
    setActivePlayers(nextPlayers);
    setBalls(prev => [...prev, optimisticBall]);

    try {
      const confirmedBall = await scoringService.recordBall({
        innings_id: innings.id, over_number: overNumber,
        ball_number: isLegalBall ? ballInOver : ballInOver - 1,
        batsman_id: striker.id, bowler_id: bowler.id,
        runs_scored: runs, is_wicket: isWicket,
        extra_type: extraType as any, extra_runs: extraRuns
      });

      await supabase.from('innings').update({
        total_runs: nextInnings.total_runs, total_wickets: nextInnings.total_wickets,
        balls: nextInnings.balls, overs: nextInnings.overs, extras: nextInnings.extras,
        current_striker_id: nextPlayers.striker?.id,
        current_non_striker_id: nextPlayers.nonStriker?.id,
        current_bowler_id: nextPlayers.bowler?.id
      }).eq('id', innings.id);

      setBalls(prev => prev.map(b =>
        b.id === tempId ? { ...optimisticBall, id: confirmedBall.id, isOptimistic: false } : b
      ));

      await checkAndHandleCompletion(nextInnings, inningsNumber, target);

    } catch (err) {
      setInnings(prevInnings);
      setActivePlayers(prevPlayers);
      setBalls(prevBalls);
      alert("Failed to sync score. Please check your connection.");
    }
  };

  // ── Start 2nd Innings ─────────────────────────────────────────────────────
  const start2ndInnings = async () => {
    if (!match || !innings) return;
    const inn2TeamId = innings.team_id === match.team_a_id ? match.team_b_id : match.team_a_id;
    try {
      const newInnings = await scoringService.initializeInnings(id, inn2TeamId, 2);
      setInnings(newInnings);
      setBalls([]);
      setInningsNumber(2);
      setShowInningsBreak(false);

      const { data: players } = await supabase.from('players').select('*').eq('team_id', inn2TeamId).limit(3);
      if (players && players.length >= 3) {
        setActivePlayers({ striker: players[0], nonStriker: players[1], bowler: players[2] });
        await scoringService.updateActivePlayers(newInnings.id, players[0].id, players[1].id, players[2].id);
      }
    } catch (err) {
      console.error("Failed to start 2nd innings:", err);
    }
  };

  // ── Start 1st Innings ─────────────────────────────────────────────────────
  const startInnings = async () => {
    if (!match) return;
    const battingTeamId = match.toss_decision === 'bat' ? match.toss_won_by : (match.toss_won_by === match.team_a_id ? match.team_b_id : match.team_a_id);
    const teamId = battingTeamId || match.team_a_id;
    try {
      const newInnings = await scoringService.initializeInnings(id, teamId, 1);
      setInnings(newInnings);
      setBalls([]);
      const { data: players } = await supabase.from('players').select('*').eq('team_id', teamId).limit(3);
      if (players && players.length >= 3) {
        setActivePlayers({ striker: players[0], nonStriker: players[1], bowler: players[2] });
        await scoringService.updateActivePlayers(newInnings.id, players[0].id, players[1].id, players[2].id);
      }
    } catch (err) {
      console.error("Failed to start innings:", err);
    }
  };

  const battingTeam = innings ? (innings.team_id === match?.team_a_id ? match?.team_a : match?.team_b) : null;

  if (loading) return (
    <div className="min-h-screen bg-pitch flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stadium-gold" />
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Scoring Console...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-pitch flex items-center justify-center p-6 text-center">
      <div className="glass-card p-12 max-w-md border-red-500/30">
        <p className="text-red-400 mb-6">{error}</p>
        <Button variant="secondary" onClick={fetchMatchData}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pitch">
      {/* ── Innings Break Overlay ─────────────────────────────────────────── */}
      {showInningsBreak && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="glass-card p-12 max-w-lg w-full text-center border-stadium-gold/20 animate-slide-up">
            <div className="text-6xl mb-6">🏏</div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">1st Innings Complete</p>
            <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tight">Innings Break</h2>
            <div className="p-8 bg-stadium-gold/10 border border-stadium-gold/20 rounded-3xl mb-8">
              <p className="text-[10px] font-black text-stadium-gold uppercase tracking-widest mb-2">Target Set</p>
              <p className="text-8xl font-black text-white score-number">{target}</p>
              <p className="text-slate-400 text-sm mt-2 font-bold">runs to win</p>
            </div>
            <Button variant="gold" size="lg" onClick={start2ndInnings} className="h-16 px-12 text-lg w-full">
              🚀 Start 2nd Innings
            </Button>
          </div>
        </div>
      )}

      {/* ── Match Complete Overlay ────────────────────────────────────────── */}
      {matchComplete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="glass-card p-12 max-w-lg w-full text-center border-emerald-500/20 animate-slide-up">
            <div className="text-8xl mb-6">🏆</div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Match Complete</p>
            <h2 className="text-5xl font-black text-white mb-3 uppercase tracking-tight">{winnerTeam?.name}</h2>
            <p className="text-emerald-400 text-xl font-bold mb-10">{matchResult}</p>
            <div className="flex gap-4">
              <Link href="/live" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full h-14">View Live Dashboard</Button>
              </Link>
              <Link href="/admin/tournaments" className="flex-1">
                <Button variant="gold" size="lg" className="w-full h-14">Tournament Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="h-24 glass-panel border-b border-white/5 flex items-center sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/tournaments" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Badge variant="live">Scoring Console</Badge>
                {inningsNumber === 2 && target && (
                  <span className="text-[10px] bg-stadium-accent/20 text-stadium-accent border border-stadium-accent/30 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">
                    2nd Innings · Target {target}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter mt-1">
                {match?.team_a?.name} <span className="text-stadium-gold">v</span> {match?.team_b?.name}
              </h1>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match ID</p>
            <p className="text-xs font-bold text-white font-mono uppercase">{id.slice(0, 8)}</p>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 animate-slide-up">
        {!innings ? (
          <Card className="max-w-2xl mx-auto py-24 text-center border-white/5 bg-white/[0.01]">
            <div className="w-24 h-24 bg-stadium-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-stadium-gold/20 animate-bounce">🏏</div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Ready for Toss</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Initialize the match to begin the professional broadcast scoring.</p>
            <Button variant="gold" size="lg" onClick={startInnings} className="h-16 px-12 text-lg">Begin 1st Innings</Button>
          </Card>
        ) : (
          <div className="grid xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2 space-y-10">
              <InningsStatus
                teamName={battingTeam?.name || ""}
                totalRuns={innings.total_runs}
                totalWickets={innings.total_wickets}
                overs={innings.overs.toFixed(1)}
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
                  {/* Undo Button */}
                  <button
                    onClick={handleUndo}
                    disabled={balls.filter(b => !b.isOptimistic).length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl
                      text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white
                      transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Undo Last Ball
                  </button>
                </div>
                <Card className="bg-white/[0.02] border-white/5">
                  <ScoringControls
                    onRecordBall={handleRecordBall}
                    onUndo={handleUndo}
                  />
                </Card>
              </div>
            </div>

            <div className="xl:col-span-1">
              <BallTimeline
                inningsId={innings.id}
                currentOvers={innings.overs}
                balls={balls}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
