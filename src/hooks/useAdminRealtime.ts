import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AdminDashboardStats {
  activeTournaments: number;
  registeredTeams: number;
  liveMatches: number;
  totalPlayers: number;
}

export function useAdminRealtime() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    activeTournaments: 0,
    registeredTeams: 0,
    liveMatches: 0,
    totalPlayers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchInitialStats = async () => {
      try {
        const [
          { count: tournamentsCount },
          { count: teamsCount },
          { count: liveMatchesCount },
          { count: playersCount }
        ] = await Promise.all([
          supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
          supabase.from('players').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          activeTournaments: tournamentsCount || 0,
          registeredTeams: teamsCount || 0,
          liveMatches: liveMatchesCount || 0,
          totalPlayers: playersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching initial stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStats();

    // Realtime subscriptions
    const matchesSub = supabase
      .channel('admin_matches_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        // Simple strategy: refetch counts when matches change (e.g. status changes to live)
        fetchInitialStats(); 
      })
      .subscribe();

    const teamsSub = supabase
      .channel('admin_teams_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchInitialStats();
      })
      .subscribe();
      
    const tournamentsSub = supabase
      .channel('admin_tournaments_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
        fetchInitialStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchesSub);
      supabase.removeChannel(teamsSub);
      supabase.removeChannel(tournamentsSub);
    };
  }, []);

  return { stats, loading };
}
