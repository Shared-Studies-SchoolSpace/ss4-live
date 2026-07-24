import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const email = `manual_test_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
  if (authErr) {
    console.error('Auth signUp failed:', authErr);
    return;
  }
  
  console.log('User signed up. ID:', authData.user.id);
  
  // Try manual profile insert
  const { data: profData, error: profErr } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: email,
      name: 'Manual Test Profile'
    })
    .select()
    .single();
    
  console.log('Profile insert result error:', profErr ? profErr.message : '✅ SUCCESS');
  console.log('Profile data:', profData);
  
  // Try notification insert
  const { data: notifData, error: notifErr } = await supabase
    .from('notifications')
    .insert({
      user_id: authData.user.id,
      type: 'test',
      title: 'Test Notification',
      message: 'Test message content'
    })
    .select()
    .single();
    
  console.log('Notification insert result error:', notifErr ? notifErr.message : '✅ SUCCESS');
  console.log('Notification data:', notifData);
}
check();
