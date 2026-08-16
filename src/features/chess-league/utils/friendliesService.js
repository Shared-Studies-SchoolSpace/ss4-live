const DEFAULT_HOSTS = ['Jhudex'];

/**
 * Auto-fetches all tournaments created by a Lichess host user directly from Lichess API.
 * Returns array of tournament objects sorted by startsAt desc.
 */
export async function fetchHostTournaments(username = 'Jhudex') {
  try {
    const res = await fetch(`https://lichess.org/api/user/${username}/tournament/created`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.trim()) return [];

    const lines = text.trim().split('\n').filter(Boolean);
    const tournaments = lines.map(line => {
      try {
        const item = JSON.parse(line);
        return {
          id: item.id,
          name: item.fullName || item.name || `Arena #${item.id}`,
          startsAt: item.startsAt ? new Date(item.startsAt).toISOString() : null,
          finishesAt: item.finishesAt ? new Date(item.finishesAt).toISOString() : null,
          status: item.status,
          isFinished: item.status === 30 || item.isFinished,
          isStarted: item.status === 20 || item.isStarted,
          winner: item.winner || null,
          nbPlayers: item.nbPlayers || 0,
          clock: item.clock || null,
          rated: item.rated ?? true,
          createdBy: item.createdBy || username
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Sort descending by start date
    tournaments.sort((a, b) => new Date(b.startsAt || 0) - new Date(a.startsAt || 0));

    return tournaments;
  } catch (err) {
    console.warn(`Error fetching tournaments for host ${username}:`, err);
    return [];
  }
}

/**
 * Fetches player results for a specific Lichess tournament ID with retry backoff.
 */
export async function fetchTournamentResults(tournamentId, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`https://lichess.org/api/tournament/${tournamentId}/results`);
      if (res.status === 429 && attempt < retries) {
        // Rate limited - wait before retrying
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return [];
      const text = await res.text();
      if (!text.trim()) return [];

      const lines = text.trim().split('\n').filter(Boolean);
      return lines.map(line => {
        try {
          return {
            ...JSON.parse(line),
            arena_id: tournamentId
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      console.warn(`Error fetching results for tournament ${tournamentId}:`, err);
      return [];
    }
  }
  return [];
}

/**
 * Auto-fetches all tournaments & results across all configured hosts without database dependency.
 * Uses batching to prevent API rate limiting.
 */
export async function fetchAllFriendliesData(hosts = DEFAULT_HOSTS, fallbackIds = ['O8MFtK4X']) {
  let allTournaments = [];
  
  // 1. Auto-fetch created tournaments for each host
  for (const host of hosts) {
    const hostTournaments = await fetchHostTournaments(host);
    allTournaments.push(...hostTournaments);
  }

  // Deduplicate by ID
  const map = new Map();
  allTournaments.forEach(t => map.set(t.id, t));

  // If no host tournaments found, fallback to fallback IDs
  if (map.size === 0) {
    fallbackIds.forEach(id => {
      map.set(id, { id, name: `Arena #${id}`, startsAt: null });
    });
  }

  const tournamentList = Array.from(map.values());
  tournamentList.sort((a, b) => new Date(b.startsAt || 0) - new Date(a.startsAt || 0));

  // 2. Fetch results in small controlled batches (concurrency of 4) to avoid rate limits
  const BATCH_SIZE = 4;
  const historyData = [];

  for (let i = 0; i < tournamentList.length; i += BATCH_SIZE) {
    const batch = tournamentList.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (t) => {
        const results = await fetchTournamentResults(t.id);
        return {
          id: t.id,
          meta: t,
          results
        };
      })
    );
    historyData.push(...batchResults);
  }

  const arenaDetailsMap = {};
  const combinedResults = [];

  historyData.forEach(item => {
    arenaDetailsMap[item.id] = item;
    if (item.results && item.results.length > 0) {
      item.results.forEach(res => {
        combinedResults.push({
          ...res,
          startsAt: item.meta?.startsAt || null
        });
      });
    }
  });

  return {
    tournaments: tournamentList,
    arenaDetailsMap,
    allArenaResults: combinedResults
  };
}
