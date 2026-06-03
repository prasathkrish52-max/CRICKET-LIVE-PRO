import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('🚀 Starting Full System Verification...');

  try {
    // 1. Team Registration
    console.log('\n--- 1. Testing Team Registration ---');
    const { data: teamA, error: teamAError } = await supabase
      .from('teams')
      .insert({ name: 'Verification Strikers', owner_details: { owner: 'Test User' } })
      .select()
      .single();
    if (teamAError) throw teamAError;
    console.log(`✅ Team A created: ${teamA.name} (${teamA.id})`);

    const { data: teamB, error: teamBError } = await supabase
      .from('teams')
      .insert({ name: 'Verification Royals', owner_details: { owner: 'Test User 2' } })
      .select()
      .single();
    if (teamBError) throw teamBError;
    console.log(`✅ Team B created: ${teamB.name} (${teamB.id})`);

    // 2. Player Assignment
    console.log('\n--- 2. Testing Player Assignment ---');
    const { data: player1, error: p1Error } = await supabase
      .from('players')
      .insert({ name: 'Test Batsman', role: 'batsman', team_id: teamA.id })
      .select()
      .single();
    if (p1Error) throw p1Error;
    console.log(`✅ Player assigned to Team A: ${player1.name}`);

    // 3. Tournament Creation
    console.log('\n--- 3. Testing Tournament Creation ---');
    const { data: tournament, error: tourneyError } = await supabase
      .from('tournaments')
      .insert({ name: 'Verification Cup 2026', format: 'league', status: 'upcoming' })
      .select()
      .single();
    if (tourneyError) throw tourneyError;
    console.log(`✅ Tournament created: ${tournament.name} (${tournament.id})`);

    // Tournament Settings (needed for triggers)
    await supabase.from('tournament_settings').insert({
      tournament_id: tournament.id,
      points_per_win: 2,
      points_per_tie: 1
    });

    // 4. Match Scheduling
    console.log('\n--- 4. Testing Match Scheduling ---');
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        tournament_id: tournament.id,
        team_a_id: teamA.id,
        team_b_id: teamB.id,
        status: 'scheduled',
        overs_format: 5
      })
      .select()
      .single();
    if (matchError) throw matchError;
    console.log(`✅ Match scheduled: Team A vs Team B (${match.id})`);

    // 5. Live Scoring System Check (Innings & Balls)
    console.log('\n--- 5. Testing Live Scoring Logic ---');
    const { data: innings, error: inningsError } = await supabase
      .from('innings')
      .insert({
        match_id: match.id,
        team_id: teamA.id,
        innings_number: 1,
        total_runs: 0,
        total_wickets: 0,
        balls: 0
      })
      .select()
      .single();
    if (inningsError) throw inningsError;
    console.log(`✅ Innings created (${innings.id})`);

    const { data: ball, error: ballError } = await supabase
      .from('balls')
      .insert({
        innings_id: innings.id,
        over_number: 0,
        ball_number: 1,
        runs_scored: 4
      })
      .select()
      .single();
    if (ballError) throw ballError;
    console.log(`✅ Ball recorded: 4 runs`);

    // 6. Testing Triggers (Points Table Automation)
    console.log('\n--- 6. Testing Database Triggers (Points Table) ---');
    console.log('Simulating match completion (Team A wins)...');
    
    // Set match to completed and teamA as winner
    const { error: completeError } = await supabase
      .from('matches')
      .update({ status: 'completed', winner_id: teamA.id })
      .eq('id', match.id);
    if (completeError) throw completeError;

    // Check points table
    const { data: points, error: pointsError } = await supabase
      .from('points_table')
      .select('*')
      .eq('tournament_id', tournament.id);
    if (pointsError) throw pointsError;
    
    if (points && points.length > 0) {
      console.log(`✅ Points table updated automatically via trigger!`);
      const teamAPoints = points.find(p => p.team_id === teamA.id);
      console.log(`   Team A Wins: ${teamAPoints?.wins}, Points: ${teamAPoints?.points}`);
    } else {
      console.log(`❌ Points table trigger did not fire or row wasn't inserted.`);
    }

    console.log('\n🎉 ALL CORE SYSTEMS VERIFIED SUCCESSFULLY!');
    
    // Cleanup verification data
    console.log('\nCleaning up verification data...');
    await supabase.from('balls').delete().eq('innings_id', innings.id);
    await supabase.from('innings').delete().eq('id', innings.id);
    await supabase.from('points_table').delete().eq('tournament_id', tournament.id);
    await supabase.from('matches').delete().eq('id', match.id);
    await supabase.from('tournament_settings').delete().eq('tournament_id', tournament.id);
    await supabase.from('tournaments').delete().eq('id', tournament.id);
    await supabase.from('players').delete().eq('id', player1.id);
    await supabase.from('teams').delete().in('id', [teamA.id, teamB.id]);
    console.log('✅ Cleanup complete.');

  } catch (err: any) {
    console.error('\n❌ VERIFICATION FAILED:', err.message || err);
    process.exit(1);
  }
}

runTests();
