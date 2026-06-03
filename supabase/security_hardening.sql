-- ============================================================
-- Cricket Live Pro - Security Hardening
-- Restricts write operations to authenticated users only.
-- ============================================================

-- 1. Helper function to drop all anon write policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (policyname LIKE 'anon_insert%' OR policyname LIKE 'anon_update%' OR policyname LIKE 'anon_delete%')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. TOURNAMENTS
DROP POLICY IF EXISTS "auth_write_tournaments" ON tournaments;
CREATE POLICY "auth_write_tournaments" ON tournaments 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. TEAMS
DROP POLICY IF EXISTS "auth_write_teams" ON teams;
CREATE POLICY "auth_write_teams" ON teams 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. MATCHES
DROP POLICY IF EXISTS "auth_write_matches" ON matches;
CREATE POLICY "auth_write_matches" ON matches 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. INNINGS
DROP POLICY IF EXISTS "auth_write_innings" ON innings;
CREATE POLICY "auth_write_innings" ON innings 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. BALLS
DROP POLICY IF EXISTS "auth_write_balls" ON balls;
CREATE POLICY "auth_write_balls" ON balls 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. PLAYERS
DROP POLICY IF EXISTS "auth_write_players" ON players;
CREATE POLICY "auth_write_players" ON players 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. TOURNAMENT TEAMS
DROP POLICY IF EXISTS "auth_write_tournament_teams" ON tournament_teams;
CREATE POLICY "auth_write_tournament_teams" ON tournament_teams 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. TOURNAMENT SETTINGS
DROP POLICY IF EXISTS "auth_write_tournament_settings" ON tournament_settings;
CREATE POLICY "auth_write_tournament_settings" ON tournament_settings 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Ensure Public SELECT access remains for all
-- This assumes SELECT policies like 'anon_select_*' already exist or are added here:
-- (Already covered by previous scripts, but good to reinforce)
-- CREATE POLICY "public_view_matches" ON matches FOR SELECT USING (true);
-- ... etc
