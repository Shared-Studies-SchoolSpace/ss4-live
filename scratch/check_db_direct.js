import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bkxlbnemthwkfpfdlxmg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k');

async function main() {
  const { data, error } = await supabase.from('tournaments').select('*');
  if (error) {
    console.error('Error fetching tournaments:', error);
    return;
  }
  console.log('Tournaments in DB:', JSON.stringify(data.map(t => ({
    id: t.id,
    name: t.name,
    month_year: t.month_year,
    status: t.status,
    roundsCount: t.rounds ? t.rounds.length : 0,
    winner: t.winner
  })), null, 2));
}

main();
