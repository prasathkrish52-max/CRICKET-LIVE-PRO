-- Run this in Supabase SQL Editor to patch the points_table
ALTER TABLE points_table ADD CONSTRAINT points_table_tournament_id_team_id_key UNIQUE (tournament_id, team_id);
