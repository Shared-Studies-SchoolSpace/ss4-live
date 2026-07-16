// src/utils/chessService.js

/**
 * Fetch Chess.com Rapid/Blitz ratings for a player
 */
export async function fetchChessComStats(username) {
  if (!username) return { rating: 0, error: 'No username provided' };
  const url = `https://api.chess.com/pub/player/${encodeURIComponent(username.trim())}/stats`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SS4-ChessLeague/1.0'
  };

  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) return { rating: 0, error: 'User not found' };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    const rapid = data.chess_rapid || {};
    const rating = rapid.last?.rating || 1200;
    
    const wins = rapid.record?.win || 0;
    const losses = rapid.record?.loss || 0;
    const draws = rapid.record?.draw || 0;

    return { rating, wins, losses, draws, error: null };
  } catch (err) {
    console.error('Error fetching Chess.com stats:', err);
    return { rating: 1200, error: err.message };
  }
}

/**
 * Fetch Lichess ratings for a player
 */
export async function fetchLichessStats(username) {
  if (!username) return { rating: 0, error: 'No username provided' };
  const url = `https://lichess.org/api/user/${encodeURIComponent(username.trim())}`;
  
  try {
    const res = await fetch(url);
    if (res.status === 404) return { rating: 0, error: 'User not found' };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const rapid = data.perfs?.rapid?.rating || 1500;
    const rating = rapid;

    // Fetch game stats
    const count = data.count || {};
    const wins = count.win || 0;
    const losses = count.loss || 0;
    const draws = count.draw || 0;

    return { rating, wins, losses, draws, error: null };
  } catch (err) {
    console.error('Error fetching Lichess stats:', err);
    return { rating: 1500, error: err.message };
  }
}

/**
 * Searches for the latest match between two Chess.com users
 */
async function searchChessComMutual(userA, userB) {
  const cleanA = userA.toLowerCase().trim();
  const cleanB = userB.toLowerCase().trim();
  
  try {
    // Get archives index
    const listRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanA)}/games/archives`);
    if (!listRes.ok) return null;
    const listData = await listRes.json();
    const archives = listData.archives || [];
    if (archives.length === 0) return null;

    // Scan the most recent archives (last 2 months maximum)
    const recentArchives = archives.slice(-2).reverse();
    for (const archiveUrl of recentArchives) {
      const archiveRes = await fetch(archiveUrl);
      if (!archiveRes.ok) continue;
      const archiveData = await archiveRes.json();
      const games = archiveData.games || [];
      
      // Find matches where opponent is userB
      const mutualGames = games.filter(g => {
        const white = g.white.username.toLowerCase();
        const black = g.black.username.toLowerCase();
        return (white === cleanA && black === cleanB) || (white === cleanB && black === cleanA);
      });

      if (mutualGames.length > 0) {
        // Return latest match
        const latest = mutualGames[mutualGames.length - 1];
        const isWhite = latest.white.username.toLowerCase() === cleanA;
        const result = isWhite ? latest.white.result : latest.black.result;
        
        let winner = null;
        if (result === 'win') {
          winner = isWhite ? userA : userB;
        } else if (latest.white.result === 'win' || latest.black.result === 'win') {
          winner = isWhite ? userB : userA;
        }

        return {
          platform: 'chess.com',
          url: latest.url,
          winner,
          date: new Date(latest.end_time * 1000).toISOString()
        };
      }
    }
  } catch (err) {
    console.error('Error searching Chess.com mutual games:', err);
  }
  return null;
}

/**
 * Searches for the latest match between two Lichess users
 */
async function searchLichessMutual(userA, userB) {
  const cleanA = userA.toLowerCase().trim();
  const cleanB = userB.toLowerCase().trim();

  try {
    const url = `https://lichess.org/api/games/user/${encodeURIComponent(cleanA)}?vs=${encodeURIComponent(cleanB)}&max=1&moves=false`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/x-ndjson' }
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null;

    // Lichess returns NDJSON (newline-delimited JSON)
    const game = JSON.parse(text.split('\n')[0]);
    
    let winner = null;
    if (game.winner) {
      winner = game.winner === 'white' ? game.players.white.user.name : game.players.black.user.name;
    }

    return {
      platform: 'lichess',
      url: `https://lichess.org/${game.id}`,
      winner,
      date: new Date(game.createdAt).toISOString()
    };
  } catch (err) {
    console.error('Error searching Lichess mutual games:', err);
  }
  return null;
}

/**
 * Dynamically search the external platforms for mutual games between two players
 */
export async function searchMutualGames(profileA, profileB) {
  let chessComMatch = null;
  let lichessMatch = null;

  if (profileA.chess_username && profileB.chess_username) {
    chessComMatch = await searchChessComMutual(profileA.chess_username, profileB.chess_username);
  }

  if (profileA.lichess_username && profileB.lichess_username) {
    lichessMatch = await searchLichessMutual(profileA.lichess_username, profileB.lichess_username);
  }

  if (chessComMatch && lichessMatch) {
    // Return the more recent one
    return new Date(chessComMatch.date) > new Date(lichessMatch.date) ? chessComMatch : lichessMatch;
  }
  return chessComMatch || lichessMatch || null;
}

const playerApiCache = {};

/**
 * Fetches player profile details (avatar) and rating from the platform APIs
 */
export async function fetchCompletePlayerData(username, platform = 'chess.com') {
  if (!username) return null;
  const cleanUser = username.trim().toLowerCase();
  const cacheKey = `${platform}:${cleanUser}`;
  
  if (playerApiCache[cacheKey]) {
    return playerApiCache[cacheKey];
  }
  
  try {
    const cached = sessionStorage.getItem(`chess_player:${cacheKey}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      playerApiCache[cacheKey] = parsed;
      return parsed;
    }
  } catch (e) {
    // Ignore sessionStorage error
  }

  const result = {
    username,
    platform,
    avatar: null,
    rating: null,
    title: null,
    error: null
  };

  try {
    if (platform === 'chess.com') {
      const profilePromise = fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUser)}`)
        .then(r => r.ok ? r.json() : null);

      const statsPromise = fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUser)}/stats`)
        .then(r => r.ok ? r.json() : null);

      const [profile, stats] = await Promise.all([profilePromise, statsPromise]);
      if (profile) {
        result.avatar = profile.avatar || null;
        result.title = profile.title || null;
      }
      if (stats) {
        const rapid = stats.chess_rapid || {};
        result.rating = rapid.last?.rating || stats.chess_blitz?.last?.rating || 1200;
      }
    } else {
      // Lichess API
      const res = await fetch(`https://lichess.org/api/user/${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const data = await res.json();
        result.rating = data.perfs?.rapid?.rating || data.perfs?.blitz?.rating || 1500;
        result.title = data.title || null;
      }
    }

    playerApiCache[cacheKey] = result;
    try {
      sessionStorage.setItem(`chess_player:${cacheKey}`, JSON.stringify(result));
    } catch (e) {}

    return result;
  } catch (err) {
    console.error('Error in fetchCompletePlayerData:', err);
    result.error = err.message;
    return result;
  }
}

