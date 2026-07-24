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
  console.log("1. Deleting test profiles from 'profiles' table...");
  const { data: deletedProfiles, error: deleteErr } = await supabase
    .from('profiles')
    .delete()
    .like('email', 'test_%')
    .select();

  if (deleteErr) {
    console.error("Error deleting profiles:", deleteErr.message);
  } else {
    console.log(`Deleted ${deletedProfiles ? deletedProfiles.length : 0} test profiles:`, deletedProfiles);
  }

  console.log("\n2. Removing test players from 'divisions' table...");
  const { data: divisions, error: divErr } = await supabase
    .from('divisions')
    .select('*');

  if (divErr) {
    console.error("Error fetching divisions:", divErr.message);
    return;
  }

  for (const d of (divisions || [])) {
    const playersList = d.players || [];
    const filteredPlayers = playersList.filter(p => 
      !p.username?.startsWith('chess_user_') && 
      !p.name?.startsWith('Test User')
    );

    if (playersList.length !== filteredPlayers.length) {
      console.log(`Updating division ${d.name} (${d.id}): removing ${playersList.length - filteredPlayers.length} test players.`);
      const { error: updateErr } = await supabase
        .from('divisions')
        .update({ players: filteredPlayers })
        .eq('id', d.id);
      
      if (updateErr) {
        console.error(`Error updating division ${d.id}:`, updateErr.message);
      } else {
        console.log(`Division ${d.name} updated successfully.`);
      }
    } else {
      console.log(`Division ${d.name} (${d.id}) has no test players.`);
    }
  }
}

main();
