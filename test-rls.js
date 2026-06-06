const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkyhiohytsioucwwohky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhpb2h5dHNpb3Vjd3dvaGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTk1MDcsImV4cCI6MjA5NjI5NTUwN30.CQhg3GJxS_tMnDbq6eJ2xfLzVXwtuin5RHUGB7PgvqA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhpb2h5dHNpb3Vjd3dvaGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDcxOTUwNywiZXhwIjoyMDk2Mjk1NTA3fQ.Dmzbpgean-IgAnDWgP8Qo7EyJCSg2HO2729WwlUb6SE';

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log("=== STARTING STORAGE DIAGNOSTICS ===");
  
  // 1. Check Buckets
  console.log("\n[1/4] Checking Buckets...");
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
  if (bucketsError) {
    console.error("❌ Failed to list buckets:", bucketsError);
    return;
  }
  console.log("✅ Buckets found:", buckets.map(b => b.name).filter(name => ['teams', 'players', 'tournaments'].includes(name)).join(', '));

  // 2. Test Anon Upload (Should FAIL due to RLS)
  console.log("\n[2/4] Testing ANONYMOUS Upload (Should be BLOCKED by RLS)...");
  const { error: anonUploadError } = await anonClient.storage
    .from('teams')
    .upload('anon-test.txt', 'test content');
    
  if (anonUploadError) {
    console.log(`✅ Anonymous upload successfully BLOCKED. Error: ${anonUploadError.message}`);
  } else {
    console.error("❌ ERROR: Anonymous upload succeeded! RLS is not working correctly.");
  }

  // 3. Test Admin Upload (Bypasses RLS to act as successful authenticated upload check)
  console.log("\n[3/4] Testing AUTHENTICATED/ADMIN Upload (Should SUCCEED)...");
  const fileName = `auth-test-${Date.now()}.txt`;
  const { data: adminUploadData, error: adminUploadError } = await adminClient.storage
    .from('teams')
    .upload(fileName, 'Hello World', { contentType: 'text/plain' });

  if (adminUploadError) {
    console.error("❌ Upload FAILED:", adminUploadError.message);
    return;
  }
  console.log("✅ Upload SUCCEEDED!");

  // 4. Test Public Read
  console.log("\n[4/4] Testing PUBLIC READ Access...");
  const { data: urlData } = anonClient.storage.from('teams').getPublicUrl(fileName);
  console.log("   Generated URL:", urlData.publicUrl);
  
  try {
    const res = await fetch(urlData.publicUrl);
    if (res.ok) {
      console.log(`✅ Public Read SUCCEEDED! HTTP Status: ${res.status}`);
    } else {
      console.error(`❌ Public Read FAILED! HTTP Status: ${res.status}`);
    }
  } catch(e) {
    console.error("❌ Public Read Fetch Error:", e.message);
  }

  // Cleanup
  console.log("\n[Cleanup] Deleting test file...");
  await adminClient.storage.from('teams').remove([fileName]);
  console.log("=== DIAGNOSTICS COMPLETE ===");
}

runTests();
