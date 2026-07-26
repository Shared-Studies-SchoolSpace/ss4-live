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
 * Scours the last 10 games of a player on Chess.com or Lichess looking for a game with opponent
 */
export async function searchPlayerLast10GamesVsOpponent(playerUser, opponentUser, platform = 'chess.com') {
  const cleanA = (playerUser || '').toLowerCase().trim();
  const cleanB = (opponentUser || '').toLowerCase().trim();
  if (!cleanA || !cleanB) return null;

  try {
    if (platform === 'chess.com') {
      const listRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanA)}/games/archives`);
      if (!listRes.ok) return null;
      const listData = await listRes.json();
      const archives = listData.archives || [];
      if (archives.length === 0) return null;

      // Fetch the latest month archive
      const latestArchiveUrl = archives[archives.length - 1];
      const archiveRes = await fetch(latestArchiveUrl);
      if (!archiveRes.ok) return null;
      const archiveData = await archiveRes.json();
      const allGames = archiveData.games || [];
      
      // Get last 10 games of home player A
      const last10 = allGames.slice(-10).reverse();

      // Find match vs opponent B
      const match = last10.find(g => {
        const white = (g.white.username || '').toLowerCase();
        const black = (g.black.username || '').toLowerCase();
        return (white === cleanA && black === cleanB) || (white === cleanB && black === cleanA);
      });

      if (match) {
        const isWhite = match.white.username.toLowerCase() === cleanA;
        const res = isWhite ? match.white.result : match.black.result;
        let winner = null;
        if (res === 'win') {
          winner = playerUser;
        } else if (match.white.result === 'win' || match.black.result === 'win') {
          winner = opponentUser;
        } else if (['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'time-vs-insufficient'].includes(res)) {
          winner = 'draw';
        }

        return {
          platform: 'chess.com',
          url: match.url,
          winner,
          date: new Date(match.end_time * 1000).toISOString()
        };
      }
    } else {
      // Lichess API - fetch last 10 games of user A
      const url = `https://lichess.org/api/games/user/${encodeURIComponent(cleanA)}?max=10&moves=false`;
      const res = await fetch(url, { headers: { 'Accept': 'application/x-ndjson' } });
      if (!res.ok) return null;
      const text = await res.text();
      if (!text.trim()) return null;

      const lines = text.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const game = JSON.parse(line);
          const white = (game.players?.white?.user?.name || '').toLowerCase();
          const black = (game.players?.black?.user?.name || '').toLowerCase();
          if ((white === cleanA && black === cleanB) || (white === cleanB && black === cleanA)) {
            let winner = null;
            if (game.winner) {
              winner = game.winner === 'white' ? (game.players.white.user.name || playerUser) : (game.players.black.user.name || opponentUser);
            } else if (game.status === 'draw') {
              winner = 'draw';
            }
            return {
              platform: 'lichess',
              url: `https://lichess.org/${game.id}`,
              winner,
              date: new Date(game.createdAt).toISOString()
            };
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error searching player last 10 games vs opponent:', err);
  }
  return null;
}

/**
 * Dynamically search external platforms for mutual games between two players
 */
export async function searchMutualGames(profileA, profileB) {
  if (!profileA || !profileB) return null;

  // Try Chess.com first
  const userA_Chess = profileA.chess_username || profileA.username;
  const userB_Chess = profileB.chess_username || profileB.username;
  if (userA_Chess && userB_Chess) {
    const match = await searchPlayerLast10GamesVsOpponent(userA_Chess, userB_Chess, 'chess.com');
    if (match) return match;
  }

  // Try Lichess
  const userA_Lichess = profileA.lichess_username || profileA.username;
  const userB_Lichess = profileB.lichess_username || profileB.username;
  if (userA_Lichess && userB_Lichess) {
    const match = await searchPlayerLast10GamesVsOpponent(userA_Lichess, userB_Lichess, 'lichess');
    if (match) return match;
  }

  return null;
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

