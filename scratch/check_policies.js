import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_policies'); // Oh, standard rpc might not exist. Let's run a select on pg_policies using an sql function if we have one, or check if we can query it.
  // Wait, we can't query pg_policies via postgrest unless it's exposed or we use a custom function.
  // Let's write a simple script to test inserting a notification directly and see what happens, or check the migration execution status.
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found');
    return;
  }
  const uid = profiles[0].id;
  const { error: insError } = await supabase.from('notifications').insert({
    user_id: uid,
    type: 'test',
    title: 'Test',
    message: 'Test message'
  });
  console.log('Insert test:', insError);
}
check();
