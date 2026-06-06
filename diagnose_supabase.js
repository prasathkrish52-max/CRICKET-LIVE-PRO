const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

const tables = ['teams', 'matches', 'tournaments', 'innings', 'balls', 'points_table'];

async function diagnose() {
  console.log("=== SUPABASE STRUCTURED DIAGNOSIS ===\n");
  
  console.log("5. Validating Environment Configuration:");
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Anon Key Length: ${supabaseAnonKey ? supabaseAnonKey.length : 0}`);
  console.log(`Service Key Length: ${supabaseServiceKey ? supabaseServiceKey.length : 0}`);
  console.log("Status: OK (Connected to config)\n");

  let missingTables = [];
  let presentTables = [];

  console.log("1. Verifying Table Existence (via Service Role - Bypasses RLS):");
  for (const table of tables) {
    const { error } = await adminClient.from(table).select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
        console.log(`❌ Table '${table}' NOT FOUND (Missing or Cache Stale)`);
        missingTables.push(table);
      } else {
        console.log(`❓ Table '${table}' ERROR: ${error.message}`);
      }
    } else {
      console.log(`✅ Table '${table}' EXISTS`);
      presentTables.push(table);
    }
  }

  console.log("\n2. Checking RLS Policies (via Anon Key):");
  if (presentTables.length === 0) {
    console.log("Skipping RLS check since no tables were found.");
  } else {
    for (const table of presentTables) {
      const { data, error } = await anonClient.from(table).select('id').limit(1);
      if (error) {
        console.log(`❌ RLS blocks SELECT on '${table}' (Error: ${error.message})`);
      } else {
        console.log(`✅ RLS allows SELECT on '${table}' (Returned data: ${data ? data.length : 0} rows)`);
      }
    }
  }

  console.log("\n3. Schema File Analysis:");
  if (missingTables.length > 0) {
    console.log(`The following tables are missing: ${missingTables.join(', ')}`);
    console.log("This indicates that 'schema.sql' was NOT executed, or failed partially.");
  } else {
    console.log("All required tables are present. 'schema.sql' executed successfully.");
  }

  console.log("\n4. API / Schema Sync Analysis:");
  // Attempt to trigger schema reload via RPC just to see if the RPC exists
  const { error: rpcError } = await adminClient.rpc('reload_schema');
  if (rpcError && missingTables.length > 0) {
    console.log("Schema cache reload RPC not available by default. Since tables are missing, you must run schema.sql AND THEN run `NOTIFY pgrst, 'reload schema'` in the SQL Editor.");
  } else if (missingTables.length > 0) {
    console.log("Tables are still missing. This confirms the physical tables do not exist in the database, not just a cache issue.");
  } else {
    console.log("Schema cache is perfectly in sync with active tables.");
  }

  console.log("\n=== FINAL ROOT CAUSE & ACTION PLAN ===");
  if (missingTables.length > 0) {
    console.log("Root Cause: Missing Tables (Database Reset or Schema Migration Failure)");
    console.log("Action Plan:");
    console.log("1. Run `supabase/schema.sql` in Supabase SQL Editor.");
    console.log("2. Run `supabase/production_migration.sql` in Supabase SQL Editor.");
    console.log("3. Run `NOTIFY pgrst, 'reload schema';` in Supabase SQL Editor.");
  } else {
    console.log("Root Cause: Likely an intermittent network/cache issue that has resolved, OR RLS policies are too strict.");
  }
}

diagnose();
