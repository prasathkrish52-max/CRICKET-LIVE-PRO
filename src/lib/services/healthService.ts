import { supabase } from '../supabase';

export interface HealthReport {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  message?: string;
  type: 'connection' | 'table' | 'storage';
}

const CORE_TABLES = [
  'users', 'teams', 'players', 'tournaments', 'matches', 
  'innings', 'balls', 'tournament_settings', 
  'tournament_teams', 'playing_xi', 'points_table'
];

export const healthService = {
  async checkConnection(): Promise<HealthReport> {
    try {
      // Try a basic select on a known public table or just check the client
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error && error.code === 'PGRST301') {
        // This is usually an RLS or policy issue, but it means the table exists and connection is OK
        return { id: 'conn', name: 'Supabase Connection', status: 'healthy', type: 'connection' };
      }
      
      if (error) throw error;
      
      return { id: 'conn', name: 'Supabase Connection', status: 'healthy', type: 'connection' };
    } catch (err: any) {
      return { 
        id: 'conn', 
        name: 'Supabase Connection', 
        status: 'unhealthy', 
        message: err.message || 'Connection failed. Check your API keys.',
        type: 'connection'
      };
    }
  },

  async checkTable(tableName: string): Promise<HealthReport> {
    try {
      const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true }).limit(0);
      
      if (error) {
        if (error.code === '42P01') {
          return { id: tableName, name: `Table: ${tableName}`, status: 'unhealthy', message: 'Table does not exist.', type: 'table' };
        }
        // Other errors might just be permission/RLS issues which is fine for existence check
        return { id: tableName, name: `Table: ${tableName}`, status: 'healthy', type: 'table' };
      }
      
      return { id: tableName, name: `Table: ${tableName}`, status: 'healthy', type: 'table' };
    } catch (err: any) {
      return { id: tableName, name: `Table: ${tableName}`, status: 'unhealthy', message: err.message, type: 'table' };
    }
  },

  async runFullDiagnostics(): Promise<HealthReport[]> {
    const results: HealthReport[] = [];
    
    // 1. Check Connection
    results.push(await this.checkConnection());
    
    // 2. Check Tables
    const tableChecks = await Promise.all(CORE_TABLES.map(t => this.checkTable(t)));
    results.push(...tableChecks);
    
    // 3. Check Storage
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      const hasTeamsBucket = buckets?.some(b => b.id === 'teams');
      
      results.push({ 
        id: 'storage', 
        name: 'Storage Connectivity', 
        status: error ? 'unhealthy' : 'healthy', 
        message: error?.message,
        type: 'storage'
      });

      results.push({
        id: 'bucket-teams',
        name: 'Bucket: teams',
        status: hasTeamsBucket ? 'healthy' : 'unhealthy',
        message: hasTeamsBucket ? 'Bucket active and accessible.' : 'Bucket "teams" not found. Run storage_setup.sql.',
        type: 'storage'
      });
    } catch (err: any) {
      results.push({ id: 'storage', name: 'Storage Connectivity', status: 'unhealthy', message: err.message, type: 'storage' });
    }
    
    return results;
  }
};
