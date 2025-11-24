// Test script to check profile API and database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testProfileAPI() {
  console.log('=== Testing Profile API and Database ===\n');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Step 1: Check if user_profiles table exists and has data
  console.log('1. Checking user_profiles table...');
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('user_id, first_name, surname, legal_first_name, legal_surname')
    .limit(5);
  
  if (profileError) {
    console.error('❌ Error querying user_profiles:', profileError.message);
    console.error('   Error code:', profileError.code);
    console.error('   This might indicate RLS policy issues or table does not exist');
  } else {
    console.log(`✅ Found ${profiles?.length || 0} profiles in database`);
    if (profiles && profiles.length > 0) {
      console.log('   Sample profile fields:', Object.keys(profiles[0]));
      console.log('   First profile user_id:', profiles[0].user_id);
    }
  }
  
  console.log('\n2. Testing API endpoint without auth...');
  const response1 = await fetch('http://localhost:3000/api/profile');
  console.log(`   Status: ${response1.status} (expected 401)`);
  const data1 = await response1.text();
  console.log(`   Response: ${data1.substring(0, 100)}`);
  
  console.log('\n=== Test Complete ===');
}

testProfileAPI().catch(console.error);
