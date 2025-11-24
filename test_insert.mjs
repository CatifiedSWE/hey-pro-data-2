import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvidydsfnnrathhpuxye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aWR5ZHNmbm5yYXRoaHB1eHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTI3NTgsImV4cCI6MjA3OTE4ODc1OH0.dv9nJwlWXGwJUrsptNkvI5BJQjUEWMMY4ZPOuvsxqVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing INSERT without authentication (will likely fail due to RLS)...\n');

// Try to insert a test profile without auth (should fail)
const { data, error } = await supabase
  .from('user_profiles')
  .insert([
    {
      user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
      first_name: 'Test',
      surname: 'User',
      country: 'UAE',
      city: 'Dubai'
    }
  ])
  .select();

if (error) {
  console.error('❌ INSERT failed (expected due to RLS):', error.message);
  console.error('   Code:', error.code);
  console.error('   Hint:', error.hint);
  if (error.code === '42501') {
    console.log('\n✅ GOOD: RLS is properly blocking unauthenticated inserts');
  }
} else {
  console.log('✅ INSERT succeeded:', data);
}

// Check if auth.users table has any users
console.log('\nChecking if any users exist in auth system...');
const { count, error: countError } = await supabase
  .from('user_profiles')
  .select('*', { count: 'exact', head: true });

console.log('Profile count:', count);
