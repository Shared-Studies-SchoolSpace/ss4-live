import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple manual parser for .env
const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking columns...");
  const { data: pData, error: pErr } = await supabase.from('profiles').select('last_seen').limit(1);
  if (pErr) {
    console.log("profiles.last_seen check:", pErr.message);
  } else {
    console.log("profiles.last_seen exists!");
  }

  const { data: mData, error: mErr } = await supabase.from('direct_messages').select('read_at').limit(1);
  if (mErr) {
    console.log("direct_messages.read_at check:", mErr.message);
  } else {
    console.log("direct_messages.read_at exists!");
  }
}

check();
