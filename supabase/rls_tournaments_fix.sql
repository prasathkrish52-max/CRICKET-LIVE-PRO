-- ==============================================================================
-- CRICKET LIVE PRO - RLS FIX FOR REGISTRY (TOURNAMENTS, TEAMS, PLAYERS)
-- RUN THIS IN SUPABASE SQL EDITOR
-- ==============================================================================

-- 1. Ensure RLS is fully enabled (Safe to run even if already enabled)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to prevent duplicates/conflicts
DROP POLICY IF EXISTS "Public Read Tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated Insert Tournaments" ON tournaments;
DROP POLICY IF EXISTS "Public Read Teams" ON teams;
DROP POLICY IF EXISTS "Authenticated Insert Teams" ON teams;
DROP POLICY IF EXISTS "Public Read Players" ON players;
DROP POLICY IF EXISTS "Authenticated Insert Players" ON players;

-- 3. TOURNAMENTS Policies
-- Allow anyone to read
CREATE POLICY "Public Read Tournaments" ON tournaments FOR SELECT USING (true);
-- Allow authenticated users to create
CREATE POLICY "Authenticated Insert Tournaments" ON tournaments FOR INSERT TO authenticated WITH CHECK (true);

-- 4. TEAMS Policies
-- Allow anyone to read
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
-- Allow authenticated users to create
CREATE POLICY "Authenticated Insert Teams" ON teams FOR INSERT TO authenticated WITH CHECK (true);

-- 5. PLAYERS Policies
-- Allow anyone to read
CREATE POLICY "Public Read Players" ON players FOR SELECT USING (true);
-- Allow authenticated users to create
CREATE POLICY "Authenticated Insert Players" ON players FOR INSERT TO authenticated WITH CHECK (true);
