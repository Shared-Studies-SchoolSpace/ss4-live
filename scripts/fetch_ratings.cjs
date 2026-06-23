const fs = require('fs');
const path = require('path');
const { tournamentPlayers } = require('../src/data/tournamentPlayers.js');

async function fetchStats(username) {
  const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SS4 Chess League Tournament Bot'
  };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    const rapid = data.chess_rapid || {};
    const rating = rapid.last?.rating || 0;
    const record = rapid.record || { win: 0, loss: 0, draw: 0 };
    const gamesCount = (record.win || 0) + (record.loss || 0) + (record.draw || 0);
    
    return { rating, gamesCount };
  } catch (err) {
    console.error(`Failed to fetch stats for ${username}:`, err.message);
    return { rating: 0, gamesCount: 0 };
  }
}

async function run() {
  console.log(`Starting to fetch Chess.com stats for ${tournamentPlayers.length} players...`);
  const results = [];
  
  for (let i = 0; i < tournamentPlayers.length; i++) {
    const player = tournamentPlayers[i];
    console.log(`[${i+1}/${tournamentPlayers.length}] Fetching ${player.username}...`);
    const stats = await fetchStats(player.username);
    
    results.push({
      ...player,
      rating: stats.rating,
      gamesCount: stats.gamesCount,
      isProvisional: stats.gamesCount < 20
    });
    
    // 150ms sleep to avoid aggressive rate limiting
    await new Promise(r => setTimeout(r, 150));
  }
  
  const destPath = path.join(__dirname, '../src/data/playersWithRatings.json');
  fs.writeFileSync(destPath, JSON.stringify(results, null, 2));
  console.log(`Finished! Saved to ${destPath}`);
}

run();
