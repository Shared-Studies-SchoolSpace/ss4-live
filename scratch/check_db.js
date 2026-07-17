import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('tournaments').select('*');
  if (error) {
    console.error('Error fetching tournaments:', error);
    return;
  }
  console.log('Tournaments in DB:', data.map(t => ({
    id: t.id,
    name: t.name,
    month_year: t.month_year,
    status: t.status,
    roundsCount: t.rounds ? t.rounds.length : 0,
    winner: t.winner
  })));
}

main();
