-- Cricket Live Pro Database Schema
-- This schema defines all tables needed for the Cricket Live Pro platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication and roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- super_admin, tournament_admin, scorer_admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  photo_url TEXT,
  owner_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT, -- batsman, bowler, all-rounder
  batting_style TEXT,
  bowling_style TEXT,
  jersey_number INTEGER,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  format TEXT NOT NULL, -- league, knockout, hybrid
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  team_a_id UUID REFERENCES teams(id),
  team_b_id UUID REFERENCES teams(id),
  venue TEXT,
  match_date TIMESTAMP WITH TIME ZONE,
  overs_format INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, completed
  winner_id UUID REFERENCES teams(id),
  match_type TEXT, -- league, knockout_pre_qf, knockout_qf, knockout_sf, knockout_final
  round TEXT, -- for knockout stages
  toss_won_by UUID REFERENCES teams(id),
  toss_decision TEXT, -- bat, field
  is_locked BOOLEAN DEFAULT FALSE, -- for Playing XI locking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playing XI table
CREATE TABLE playing_xi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  team_id UUID REFERENCES teams(id),
  player_id UUID REFERENCES players(id),
  is_captain BOOLEAN DEFAULT FALSE,
  is_vice_captain BOOLEAN DEFAULT FALSE,
  position INTEGER, -- batting order position
  is_bench BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Innings table
CREATE TABLE innings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  team_id UUID REFERENCES teams(id),
  innings_number INTEGER NOT NULL, -- 1st or 2nd innings
  total_runs INTEGER DEFAULT 0,
  total_wickets INTEGER DEFAULT 0,
  overs REAL DEFAULT 0.0,
  balls INTEGER DEFAULT 0,
  extras INTEGER DEFAULT 0,
  current_striker_id UUID REFERENCES players(id),
  current_non_striker_id UUID REFERENCES players(id),
  current_bowler_id UUID REFERENCES players(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balls table (ball-by-ball data)
CREATE TABLE balls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innings_id UUID REFERENCES innings(id),
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  batsman_id UUID REFERENCES players(id),
  bowler_id UUID REFERENCES players(id),
  runs_scored INTEGER DEFAULT 0,
  is_wicket BOOLEAN DEFAULT FALSE,
  wicket_type TEXT, -- bowled, caught, run_out, stumped, lbw, etc.
  fielder_id UUID REFERENCES players(id),
  dismissed_batsman_id UUID REFERENCES players(id),
  extra_type TEXT, -- wide, no_ball, bye, leg_bye
  extra_runs INTEGER DEFAULT 0,
  is_free_hit BOOLEAN DEFAULT FALSE,
  commentary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scorecards table
CREATE TABLE scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  team_id UUID REFERENCES teams(id),
  player_id UUID REFERENCES players(id),
  innings_number INTEGER NOT NULL,
  runs INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  strike_rate REAL DEFAULT 0.0,
  overs_bowled REAL DEFAULT 0.0,
  maiden_overs INTEGER DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets_taken INTEGER DEFAULT 0,
  economy_rate REAL DEFAULT 0.0,
  catches INTEGER DEFAULT 0,
  run_outs INTEGER DEFAULT 0,
  stumpings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points table
CREATE TABLE points_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES teams(id),
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  no_result INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  net_run_rate REAL DEFAULT 0.0,
  position INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

-- Knockout brackets table
CREATE TABLE knockout_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  match_id UUID REFERENCES matches(id),
  round TEXT NOT NULL, -- pre_qf, qf, sf, final
  position INTEGER NOT NULL, -- position in bracket
  team_id UUID REFERENCES teams(id),
  winner_team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Man of the Match awards
CREATE TABLE man_of_the_match (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  player_id UUID REFERENCES players(id),
  rating REAL NOT NULL, -- calculated MOM rating
  match_impact_score REAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament settings table
CREATE TABLE tournament_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) UNIQUE,
  overs_per_match INTEGER DEFAULT 20,
  balls_per_over INTEGER DEFAULT 6,
  points_per_win INTEGER DEFAULT 2,
  points_per_tie INTEGER DEFAULT 1,
  points_per_no_result INTEGER DEFAULT 1,
  nrr_calculation_method TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match events table
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  event_type TEXT NOT NULL, -- toss, match_started, rain_delay, innings_break, match_ended
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_tournaments_format ON tournaments(format);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_playing_xi_match ON playing_xi(match_id);
CREATE INDEX idx_innings_match ON innings(match_id);
CREATE INDEX idx_balls_innings ON balls(innings_id);
CREATE INDEX idx_scorecards_match ON scorecards(match_id);
CREATE INDEX idx_scorecards_player ON scorecards(player_id);
CREATE INDEX idx_points_table_tournament ON points_table(tournament_id);
CREATE INDEX idx_knockout_brackets_tournament ON knockout_brackets(tournament_id);
CREATE INDEX idx_man_of_match_match ON man_of_the_match(match_id);
CREATE INDEX idx_tournament_settings_tourn ON tournament_settings(tournament_id);
CREATE INDEX idx_match_events_match ON match_events(match_id);

-- Automated Points Table Update Function
CREATE OR REPLACE FUNCTION update_points_table_on_match_complete()
RETURNS TRIGGER AS $$
DECLARE
  points_win INTEGER;
  points_tie INTEGER;
  points_nr INTEGER;
  t_id UUID;
BEGIN
  -- Only trigger on status change to 'completed'
  IF (OLD.status <> 'completed' AND NEW.status = 'completed') THEN
    t_id := NEW.tournament_id;

    -- Get tournament settings
    SELECT points_per_win, points_per_tie, points_per_no_result 
    INTO points_win, points_tie, points_nr
    FROM tournament_settings 
    WHERE tournament_id = t_id;

    -- Default values if settings missing
    points_win := COALESCE(points_win, 2);
    points_tie := COALESCE(points_tie, 1);
    points_nr := COALESCE(points_nr, 1);

    -- Update winners points
    IF NEW.winner_id IS NOT NULL THEN
      -- Handle Winner
      INSERT INTO points_table (tournament_id, team_id, matches_played, wins, points)
      VALUES (t_id, NEW.winner_id, 1, 1, points_win)
      ON CONFLICT (tournament_id, team_id) DO UPDATE SET
        matches_played = points_table.matches_played + 1,
        wins = points_table.wins + 1,
        points = points_table.points + points_win,
        updated_at = NOW();

      -- Handle Loser
      INSERT INTO points_table (tournament_id, team_id, matches_played, losses, points)
      VALUES (t_id, CASE WHEN NEW.winner_id = NEW.team_a_id THEN NEW.team_b_id ELSE NEW.team_a_id END, 1, 1, 0)
      ON CONFLICT (tournament_id, team_id) DO UPDATE SET
        matches_played = points_table.matches_played + 1,
        losses = points_table.losses + 1,
        updated_at = NOW();
    ELSE
      -- Handle Tie / No Result
      -- Team A
      INSERT INTO points_table (tournament_id, team_id, matches_played, ties, points)
      VALUES (t_id, NEW.team_a_id, 1, 1, points_tie)
      ON CONFLICT (tournament_id, team_id) DO UPDATE SET
        matches_played = points_table.matches_played + 1,
        ties = points_table.ties + 1,
        points = points_table.points + points_tie,
        updated_at = NOW();
      
      -- Team B
      INSERT INTO points_table (tournament_id, team_id, matches_played, ties, points)
      VALUES (t_id, NEW.team_b_id, 1, 1, points_tie)
      ON CONFLICT (tournament_id, team_id) DO UPDATE SET
        matches_played = points_table.matches_played + 1,
        ties = points_table.ties + 1,
        points = points_table.points + points_tie,
        updated_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_points_table
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE PROCEDURE update_points_table_on_match_complete();

-- Tournament Teams (Registration Junction)
CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES teams(id),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'users', 'teams', 'players', 'tournaments', 'matches', 
    'playing_xi', 'innings', 'balls', 'scorecards', 
    'points_table', 'knockout_brackets', 'man_of_the_match',
    'tournament_settings'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%s_updated_at 
      BEFORE UPDATE ON %s 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column()
    ', t, t);
  END LOOP;
END $$;