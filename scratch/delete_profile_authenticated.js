import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const email = 'test_1784313906450@gmail.com';
  const password = 'Password_1784313906450!';
  
  console.log(`Signing in as ${email}...`);
  const { data, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInErr) {
    console.error("Sign in failed:", signInErr.message);
    return;
  }

  const user = data.user;
  console.log("Sign in successful. User ID:", user.id);

  console.log("Attempting to delete profile...");
  const { data: deleted, error: deleteErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)
    .select();

  if (deleteErr) {
    console.error("Delete failed:", deleteErr.message);
  } else {
    console.log("Delete successful! Row deleted:", deleted);
  }
}

main();
