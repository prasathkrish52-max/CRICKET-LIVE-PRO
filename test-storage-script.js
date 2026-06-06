const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkyhiohytsioucwwohky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhpb2h5dHNpb3Vjd3dvaGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTk1MDcsImV4cCI6MjA5NjI5NTUwN30.CQhg3GJxS_tMnDbq6eJ2xfLzVXwtuin5RHUGB7PgvqA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log("1. Checking buckets...");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Failed to list buckets:", bucketsError);
  } else {
    console.log("Buckets found:", buckets.map(b => b.name));
  }

  console.log("\n2. Testing upload to 'teams' bucket using anon key...");
  const fileName = `test-upload-${Date.now()}.txt`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('teams')
    .upload(fileName, 'This is a test file to verify public upload works.', {
      contentType: 'text/plain'
    });

  if (uploadError) {
    console.error("Upload failed (RLS policy check failed or bucket missing):", uploadError);
  } else {
    console.log("Upload successful:", uploadData.path);

    console.log("\n3. Testing public URL generation...");
    const { data: publicUrlData } = supabase.storage.from('teams').getPublicUrl(fileName);
    console.log("Public URL:", publicUrlData.publicUrl);
    
    try {
      const fetchResponse = await fetch(publicUrlData.publicUrl);
      console.log("Public URL fetch status:", fetchResponse.status);
    } catch(e) {
      console.error("Fetch failed:", e.message);
    }

    console.log("\n4. Testing delete from 'teams' bucket...");
    const { error: deleteError } = await supabase.storage.from('teams').remove([fileName]);
    if (deleteError) {
      console.error("Delete failed:", deleteError);
    } else {
      console.log("Delete successful.");
    }
  }
}

testStorage();
