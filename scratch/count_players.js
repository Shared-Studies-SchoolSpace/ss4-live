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

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: tournaments, error } = await supabase.from('tournaments').select('name, status, players');
  if (error) {
    console.error(error);
    return;
  }
  for (const t of tournaments) {
    console.log(`${t.name} (${t.status}): ${t.players ? t.players.length : 0} players`);
  }
}
main();
