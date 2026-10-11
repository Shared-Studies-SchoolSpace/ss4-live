const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k';

function request(pathStr, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'bkxlbnemthwkfpfdlxmg.supabase.co',
      path: '/rest/v1/' + pathStr,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const jsonPath = path.resolve(__dirname, '../src/features/chess-league/data/augustTournamentData.json');
  console.log('Reading single source of truth from:', jsonPath);
  const tournamentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Tournament: ${tournamentData.name} (${tournamentData.id})`);
  console.log(`Players: ${tournamentData.players.length}`);
  console.log(`Groups: ${tournamentData.groups.length}`);
  console.log(`Rounds: ${tournamentData.rounds.length}`);
  console.log(`Status: ${tournamentData.status}`);
  console.log(`Winner: ${tournamentData.winner}`);

  // Build Supabase payload matching tournaments table columns
  const payload = {
    id: tournamentData.id,
    name: tournamentData.name,
    month_year: tournamentData.month_year,
    status: tournamentData.status,
    winner: tournamentData.winner,
    players: tournamentData.players,
    rounds: tournamentData.rounds,
    registration_status: tournamentData.registration_status || 'closed',
    show_banner: false,
    auto_close_registration: true
  };

  console.log('Upserting August tournament into Supabase tournaments table...');
  const res = await request('tournaments?id=eq.2026-08', 'PATCH', payload);

  if (Array.isArray(res) && res.length > 0) {
    console.log('✅ SUCCESS! Supabase tournaments table successfully updated for 2026-08!');
    console.log('Updated tournament ID:', res[0].id);
    console.log('Updated status:', res[0].status);
    console.log('Updated winner:', res[0].winner);
    console.log('Updated players count:', res[0].players?.length);
    console.log('Updated rounds count:', res[0].rounds?.length);
    res[0].rounds.forEach(r => {
      console.log(`  - ${r.name}: ${r.games?.length} matches`);
    });
  } else {
    console.error('❌ Update failed. Response:', res);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
