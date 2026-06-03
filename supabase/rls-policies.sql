-- Development RLS Policies (WARNING: DO NOT USE IN PRODUCTION WITHOUT AUTH)
-- These policies allow the application to function with the anon key for verification purposes.

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE playing_xi ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE man_of_the_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

-- Create open access policies for development verification
CREATE POLICY "Allow anonymous read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON players FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON tournaments FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON tournament_settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON tournament_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON tournament_settings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON tournament_settings FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON matches FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON playing_xi FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON playing_xi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON playing_xi FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access" ON innings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON innings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON innings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON innings FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON balls FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON balls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON balls FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON balls FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON points_table FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON points_table FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON points_table FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON points_table FOR DELETE USING (true);
