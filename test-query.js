const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(*),
      team_b:teams!team_b_id(*),
      innings (*)
    `);

  if (error) {
    console.error('Error JSON:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success, data length:', data.length);
  }
}

testQuery();
