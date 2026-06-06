-- ==============================================================================
-- CRICKET LIVE PRO - PRODUCTION MIGRATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTHENTICATION & ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Helper function to get the current user's role securely
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE email = auth.jwt()->>'email' OR id = auth.uid();
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on core tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_table ENABLE ROW LEVEL SECURITY;

-- -------------------
-- RLS: Matches Table
-- -------------------
-- Public Read
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
-- Admin & Scorer Write
CREATE POLICY "Admin/Scorer Write Matches" ON matches FOR ALL 
TO authenticated 
USING (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'))
WITH CHECK (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'));

-- -------------------
-- RLS: Innings Table
-- -------------------
CREATE POLICY "Public Read Innings" ON innings FOR SELECT USING (true);
CREATE POLICY "Admin/Scorer Write Innings" ON innings FOR ALL 
TO authenticated 
USING (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'))
WITH CHECK (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'));

-- -------------------
-- RLS: Balls Table
-- -------------------
CREATE POLICY "Public Read Balls" ON balls FOR SELECT USING (true);
CREATE POLICY "Admin/Scorer Write Balls" ON balls FOR ALL 
TO authenticated 
USING (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'))
WITH CHECK (get_auth_user_role() IN ('super_admin', 'tournament_admin', 'scorer', 'scorer_admin'));

-- -------------------
-- RLS: Points Table
-- -------------------
CREATE POLICY "Public Read Points Table" ON points_table FOR SELECT USING (true);
CREATE POLICY "Admin Write Points Table" ON points_table FOR ALL 
TO authenticated 
USING (get_auth_user_role() IN ('super_admin', 'tournament_admin'))
WITH CHECK (get_auth_user_role() IN ('super_admin', 'tournament_admin'));


-- ------------------------------------------------------------------------------
-- 2. ATOMIC LIVE SCORING TRIGGERS
-- ------------------------------------------------------------------------------

-- Function to atomically aggregate runs, wickets, and overs when a ball is inserted/deleted
CREATE OR REPLACE FUNCTION atomic_update_innings_on_ball()
RETURNS TRIGGER AS $$
DECLARE
  target_innings_id UUID;
  new_total_runs INTEGER;
  new_total_wickets INTEGER;
  new_extras INTEGER;
  legal_balls INTEGER;
  calculated_overs REAL;
BEGIN
  -- Determine which innings ID we are modifying
  IF TG_OP = 'DELETE' THEN
    target_innings_id := OLD.innings_id;
  ELSE
    target_innings_id := NEW.innings_id;
  END IF;

  -- Atomically calculate totals directly from the balls table
  SELECT 
    COALESCE(SUM(runs_scored + extra_runs), 0),
    COALESCE(SUM(CASE WHEN is_wicket THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(extra_runs), 0),
    COALESCE(SUM(CASE WHEN extra_type IN ('wide', 'no_ball') THEN 0 ELSE 1 END), 0)
  INTO 
    new_total_runs, new_total_wickets, new_extras, legal_balls
  FROM balls WHERE innings_id = target_innings_id;

  -- Calculate mathematically accurate overs (e.g. 19 legal balls = 3.1 overs)
  calculated_overs := FLOOR(legal_balls / 6) + ((legal_balls % 6) / 10.0);

  -- Update the innings row
  UPDATE innings SET
    total_runs = new_total_runs,
    total_wickets = new_total_wickets,
    extras = new_extras,
    balls = legal_balls,
    overs = calculated_overs,
    updated_at = NOW()
  WHERE id = target_innings_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any, then create it
DROP TRIGGER IF EXISTS tr_atomic_update_innings ON balls;
CREATE TRIGGER tr_atomic_update_innings
AFTER INSERT OR UPDATE OR DELETE ON balls
FOR EACH ROW
EXECUTE PROCEDURE atomic_update_innings_on_ball();


-- ------------------------------------------------------------------------------
-- 3. AUTOMATIC NRR (Net Run Rate) CALCULATION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_nrr_on_match_complete()
RETURNS TRIGGER AS $$
DECLARE
  team_runs_scored INTEGER;
  team_overs_faced REAL;
  team_runs_conceded INTEGER;
  team_overs_bowled REAL;
  
  t_id UUID;
  team_record RECORD;
BEGIN
  -- We only calculate NRR when a match is marked 'completed'
  IF (OLD.status <> 'completed' AND NEW.status = 'completed') THEN
    t_id := NEW.tournament_id;

    -- Loop through both teams in the match
    FOR team_record IN SELECT UNNEST(ARRAY[NEW.team_a_id, NEW.team_b_id]) AS t_id LOOP
      -- Calculate aggregate stats across all completed matches in this tournament for the team
      SELECT 
        COALESCE(SUM(inn1.total_runs), 0),
        COALESCE(SUM(inn1.overs), 0.0),
        COALESCE(SUM(inn2.total_runs), 0),
        COALESCE(SUM(inn2.overs), 0.0)
      INTO 
        team_runs_scored, team_overs_faced, team_runs_conceded, team_overs_bowled
      FROM matches m
      -- Runs scored
      LEFT JOIN innings inn1 ON inn1.match_id = m.id AND inn1.team_id = team_record.t_id
      -- Runs conceded
      LEFT JOIN innings inn2 ON inn2.match_id = m.id AND inn2.team_id <> team_record.t_id
      WHERE m.tournament_id = NEW.tournament_id AND m.status = 'completed';

      -- Update the Points Table NRR
      -- Formula: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
      UPDATE points_table SET
        net_run_rate = (
          CASE WHEN team_overs_faced > 0 THEN team_runs_scored / team_overs_faced ELSE 0 END
        ) - (
          CASE WHEN team_overs_bowled > 0 THEN team_runs_conceded / team_overs_bowled ELSE 0 END
        ),
        updated_at = NOW()
      WHERE tournament_id = NEW.tournament_id AND team_id = team_record.t_id;

    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook into the matches table completion
DROP TRIGGER IF EXISTS tr_update_nrr ON matches;
CREATE TRIGGER tr_update_nrr
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE PROCEDURE update_nrr_on_match_complete();
