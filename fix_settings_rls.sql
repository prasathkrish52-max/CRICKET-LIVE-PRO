ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tournament_settings" ON tournament_settings;
DROP POLICY IF EXISTS "anon_insert_tournament_settings" ON tournament_settings;
CREATE POLICY "anon_select_tournament_settings" ON tournament_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_tournament_settings" ON tournament_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
