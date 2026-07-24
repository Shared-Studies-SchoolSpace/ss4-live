import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function runTest() {
  const email = `test_rls_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  try {
    const { data: signUp, error: signupErr } = await client.auth.signUp({ email, password });
    if (signupErr) throw signupErr;
    const user = signUp.user;

    // Insert profile
    await client.from('profiles').insert({ id: user.id, email, name: 'Test RLS' });

    // Test 1: Insert notification for self (user_id = user.id)
    const { error: errSelf } = await client.from('notifications').insert({
      user_id: user.id,
      type: 'test',
      title: 'Test Self',
      message: 'Self message'
    });
    console.log('Result for inserting notification for SELF:', errSelf ? errSelf.message : '✅ SUCCESS');

    // Test 2: Insert notification for another user
    // Let's find any other user
    const { data: other } = await client.from('profiles').select('id').neq('id', user.id).limit(1);
    if (other && other.length > 0) {
      const otherId = other[0].id;
      const { error: errOther } = await client.from('notifications').insert({
        user_id: otherId,
        type: 'test',
        title: 'Test Other',
        message: 'Other message'
      });
      console.log('Result for inserting notification for OTHER user:', errOther ? errOther.message : '✅ SUCCESS');
    }

    // Cleanup
    await client.from('profiles').delete().eq('id', user.id);
  } catch (err) {
    console.error('Test error:', err);
  }
}
runTest();
