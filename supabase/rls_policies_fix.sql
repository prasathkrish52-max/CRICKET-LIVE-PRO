-- ============================================================
-- Cricket Live Pro - Supabase RLS Policy Fix
-- Run this in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- Drop any existing conflicting policies first
DROP POLICY IF EXISTS "Public View Teams" ON tournament_teams;
DROP POLICY IF EXISTS "Public Register Teams" ON tournament_teams;
DROP POLICY IF EXISTS "Public Insert" ON tournament_teams;

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon role) to SELECT from tournament_teams
CREATE POLICY "anon_select_tournament_teams"
ON tournament_teams
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone (anon role) to INSERT into tournament_teams
CREATE POLICY "anon_insert_tournament_teams"
ON tournament_teams
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone (anon role) to DELETE from tournament_teams
CREATE POLICY "anon_delete_tournament_teams"
ON tournament_teams
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================
-- Also fix tournaments, teams, and matches tables RLS
-- so all admin CRUD works without auth
-- ============================================================

-- TOURNAMENTS table
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tournaments" ON tournaments;
DROP POLICY IF EXISTS "anon_insert_tournaments" ON tournaments;
DROP POLICY IF EXISTS "anon_update_tournaments" ON tournaments;
CREATE POLICY "anon_select_tournaments" ON tournaments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_tournaments" ON tournaments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_tournaments" ON tournaments FOR UPDATE TO anon, authenticated USING (true);

-- TEAMS table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_teams" ON teams;
DROP POLICY IF EXISTS "anon_insert_teams" ON teams;
CREATE POLICY "anon_select_teams" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_teams" ON teams FOR INSERT TO anon, authenticated WITH CHECK (true);

-- TOURNAMENT SETTINGS table
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tournament_settings" ON tournament_settings;
DROP POLICY IF EXISTS "anon_insert_tournament_settings" ON tournament_settings;
CREATE POLICY "anon_select_tournament_settings" ON tournament_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_tournament_settings" ON tournament_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- MATCHES table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_matches" ON matches;
DROP POLICY IF EXISTS "anon_insert_matches" ON matches;
CREATE POLICY "anon_select_matches" ON matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_matches" ON matches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_matches" ON matches FOR UPDATE TO anon, authenticated USING (true);

-- INNINGS table
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_innings" ON innings;
DROP POLICY IF EXISTS "anon_insert_innings" ON innings;
DROP POLICY IF EXISTS "anon_update_innings" ON innings;
CREATE POLICY "anon_select_innings" ON innings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_innings" ON innings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_innings" ON innings FOR UPDATE TO anon, authenticated USING (true);

-- BALLS table
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_balls" ON balls;
DROP POLICY IF EXISTS "anon_insert_balls" ON balls;
CREATE POLICY "anon_select_balls" ON balls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_balls" ON balls FOR INSERT TO anon, authenticated WITH CHECK (true);

-- PLAYERS table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_players" ON players;
DROP POLICY IF EXISTS "anon_insert_players" ON players;
CREATE POLICY "anon_select_players" ON players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_players" ON players FOR INSERT TO anon, authenticated WITH CHECK (true);
