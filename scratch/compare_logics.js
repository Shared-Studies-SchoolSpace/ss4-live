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
  console.log("=== LOGIC A: Query tournaments table where status = 'upcoming' ===");
  const { data: upcomingT, error: errA } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'upcoming');
    
  if (errA) {
    console.error("Logic A Error:", errA.message);
  } else {
    console.log(`Logic A returned ${upcomingT.length} upcoming tournaments.`);
    if (upcomingT.length > 0) {
      console.log("Players count in upcoming tournament:", upcomingT[0].players ? upcomingT[0].players.length : 0);
    } else {
      console.log("No upcoming tournament found in DB, count is 0.");
    }
  }

  console.log("\n=== LOGIC B: Query profiles table for registered players (real users) ===");
  const { data: profiles, error: errB } = await supabase
    .from('profiles')
    .select('*');
    
  if (errB) {
    console.error("Logic B Error:", errB.message);
  } else {
    console.log(`Logic B returned ${profiles.length} total profiles:`);
    profiles.forEach(p => {
      console.log(`- Name: ${p.name}, Username: ${p.chess_username}, Email: ${p.email}, Uni: '${p.university}'`);
    });
    
    const realPlayers = profiles.filter(p => !p.email.includes('test_'));
    console.log(`Number of real (non-test) players: ${realPlayers.length}`);
    realPlayers.forEach(p => {
      console.log(`  -> Real Player: ${p.name} (@${p.chess_username})`);
    });
  }
}

main();
