const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("Starting Verification Tests...\n");

  // Force Schema Cache reload
  const { error: rpcError } = await anonClient.rpc('reload_schema');

  // 1. Check RLS - Anonymous Write
  console.log("Test 1: Anonymous Write (Should Fail)");
  const { error: anonError } = await anonClient
    .from('balls')
    .insert([{ innings_id: '123e4567-e89b-12d3-a456-426614174000', over_number: 0, ball_number: 1, batsman_id: '123e4567-e89b-12d3-a456-426614174000', bowler_id: '123e4567-e89b-12d3-a456-426614174000', runs_scored: 1 }]);
  
  if (anonError) {
    console.log("✅ Success: Anonymous write blocked by RLS:", anonError.message);
  } else {
    console.log("❌ Failed: Anonymous write was allowed! RLS is not active.");
  }

  // 2. Check Public Read
  console.log("\nTest 2: Anonymous Read (Should Succeed)");
  const { data: readData, error: readError } = await anonClient
    .from('matches')
    .select('id')
    .limit(1);
    
  if (readError) {
    console.log("❌ Failed: Anonymous read failed:", readError.message);
  } else {
    console.log("✅ Success: Public read allowed.");
  }

  console.log("\nSystem verification complete.");
}

runTests();
