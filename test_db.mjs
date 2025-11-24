import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvidydsfnnrathhpuxye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aWR5ZHNmbm5yYXRoaHB1eHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTI3NTgsImV4cCI6MjA3OTE4ODc1OH0.dv9nJwlWXGwJUrsptNkvI5BJQjUEWMMY4ZPOuvsxqVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing database connection...\n');

// Check user_profiles table
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id, first_name, surname, created_at')
  .limit(3);

if (error) {
  console.error('❌ Error:', error.message);
  console.error('   Code:', error.code);
  console.error('   Details:', error.details);
} else {
  console.log(`✅ Found ${data?.length || 0} profiles`);
  if (data && data.length > 0) {
    console.log('Sample data:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️  No profiles found in database');
  }
}
