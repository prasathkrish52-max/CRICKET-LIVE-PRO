const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log("Checking Database Status...");
  
  // 1. Force schema reload
  const { error: rpcError } = await adminClient.rpc('reload_schema');
  if (rpcError) console.log("Note: Could not call reload_schema via RPC (might not exist):", rpcError.message);
  
  // 2. Check if tournaments table exists
  const { data, error } = await adminClient.from('tournaments').select('id').limit(1);
  if (error) {
    console.log("❌ Error fetching from 'tournaments':", error.message);
  } else {
    console.log("✅ 'tournaments' table EXISTS and is accessible by admin.");
  }

  // 3. Check if matches table exists
  const { data: mData, error: mError } = await adminClient.from('matches').select('id').limit(1);
  if (mError) {
    console.log("❌ Error fetching from 'matches':", mError.message);
  } else {
    console.log("✅ 'matches' table EXISTS.");
  }
}

checkDatabase();
