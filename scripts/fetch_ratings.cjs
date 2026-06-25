const fs = require('fs');
const path = require('path');
const { tournamentPlayers } = require('../src/data/tournamentPlayers.js');

async function fetchStats(username) {
  const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) {
      return { rating: 0, gamesCount: 0, error: 'User not found (404)' };
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Check rapid
    const rapid = data.chess_rapid || {};
    const rapidRating = rapid.last?.rating || 0;
    const rapidRecord = rapid.record || { win: 0, loss: 0, draw: 0 };
    const rapidGames = (rapidRecord.win || 0) + (rapidRecord.loss || 0) + (rapidRecord.draw || 0);

    if (rapidRating > 0) {
      return { rating: rapidRating, gamesCount: rapidGames, source: 'rapid' };
    }

    // Fallback to blitz
    const blitz = data.chess_blitz || {};
    const blitzRating = blitz.last?.rating || 0;
    const blitzRecord = blitz.record || { win: 0, loss: 0, draw: 0 };
    const blitzGames = (blitzRecord.win || 0) + (blitzRecord.loss || 0) + (blitzRecord.draw || 0);

    if (blitzRating > 0) {
      return { rating: blitzRating, gamesCount: blitzGames, source: 'blitz' };
    }

    // Fallback to bullet
    const bullet = data.chess_bullet || {};
    const bulletRating = bullet.last?.rating || 0;
    const bulletRecord = bullet.record || { win: 0, loss: 0, draw: 0 };
    const bulletGames = (bulletRecord.win || 0) + (bulletRecord.loss || 0) + (bulletRecord.draw || 0);

    if (bulletRating > 0) {
      return { rating: bulletRating, gamesCount: bulletGames, source: 'bullet' };
    }
    
    return { rating: 0, gamesCount: 0, source: 'none' };
  } catch (err) {
    return { rating: 0, gamesCount: 0, error: err.message };
  }
}

async function run() {
  console.log(`Starting to fetch Chess.com stats for ${tournamentPlayers.length} players...\n`);
  const results = [];
  const warnings = [];
  
  for (let i = 0; i < tournamentPlayers.length; i++) {
    const player = tournamentPlayers[i];
    console.log(`[${i+1}/${tournamentPlayers.length}] Fetching stats for ${player.name} (@${player.username})...`);
    
    const stats = await fetchStats(player.username);
    let finalRating = stats.rating;
    let finalGamesCount = stats.gamesCount;
    let finalIsProvisional = stats.gamesCount < 20;

    if (stats.error) {
      warnings.push({ username: player.username, reason: `Error fetching data: ${stats.error}` });
      // Assign fallback rating for unrated/error players
      finalRating = 1200; 
      finalGamesCount = 0;
      finalIsProvisional = true;
      console.log(`  -> Warning: ${stats.error}. Assigned default ELO: 1200`);
    } else if (finalRating === 0) {
      warnings.push({ username: player.username, reason: 'No ratings returned (unrated on Chess.com)' });
      // Assign fallback rating for unrated players
      finalRating = 1200;
      finalGamesCount = 0;
      finalIsProvisional = true;
      console.log(`  -> Warning: Unrated on Chess.com. Assigned default ELO: 1200`);
    } else if (stats.source !== 'rapid') {
      console.log(`  -> Used fallback ELO from ${stats.source}: ${finalRating}`);
    } else {
      console.log(`  -> Success (Rapid ELO): ${finalRating}`);
    }
    
    results.push({
      ...player,
      rating: finalRating,
      gamesCount: finalGamesCount,
      isProvisional: finalIsProvisional
    });
    
    // 250ms sleep to avoid rate limits and simulate human browsing
    await new Promise(r => setTimeout(r, 250));
  }
  
  const destPath = path.join(__dirname, '../src/data/playersWithRatings.json');
  fs.writeFileSync(destPath, JSON.stringify(results, null, 2));
  console.log(`\nFinished! Saved to ${destPath}`);

  if (warnings.length > 0) {
    console.log('\n================ WARNINGS / UNRATED PLAYERS ================');
    warnings.forEach(w => {
      console.log(`- Username: @${w.username} | Reason: ${w.reason}`);
    });
    console.log('=============================================================');
  }
}

run();
