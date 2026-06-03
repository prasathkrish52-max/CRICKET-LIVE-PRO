import { supabase } from './lib/supabase';

async function checkConnection() {
  console.log('--- Supabase Connection Health Check ---');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Connection Failed:', error.message);
      if (error.message.includes('fetch')) {
        console.error('💡 Hint: Check if your Supabase URL is correct and you have internet access.');
      }
    } else {
      console.log('✅ Connection Successful! Database is reachable.');
    }
  } catch (err) {
    console.error('💥 Unexpected Error:', err);
  }
}

checkConnection();
