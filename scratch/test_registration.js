import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// load environment variables manually
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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegister() {
  console.log("Fetching upcoming tournament...");
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'upcoming')
    .maybeSingle();

  if (error) {
    console.error("Error fetching tournament:", error);
    process.exit(1);
  }

  if (!tournament) {
    console.error("No upcoming tournament found.");
    process.exit(1);
  }

  console.log(`Found upcoming tournament: ${tournament.name}`);

  const testPlayer = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Test Player (Ponytail)",
    username: "test_ponytail_player",
    rating: 1500,
    school: "Ponytail University",
    department: "Lazy Science"
  };

  const updatedPlayers = [
    ...(tournament.players || []).filter(p => p.id !== testPlayer.id),
    testPlayer
  ];

  console.log("Registering test player in DB...");
  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ players: updatedPlayers })
    .eq('id', tournament.id);

  if (updateError) {
    console.error("Failed to register player:", updateError);
    process.exit(1);
  }

  console.log("Success! Player registered in DB. Current list count:", updatedPlayers.length);
}

testRegister();
