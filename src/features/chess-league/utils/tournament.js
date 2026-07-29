// Tournament scheduling and bracket utilities

export function getTournamentDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return Array.from({ length: 8 }, (_, i) => {
    const day = lastDay - 7 + i;
    return `${year}-${mm}-${String(day).padStart(2, '0')}`;
  });
}

export function propagateWinners(rounds) {
  const r = JSON.parse(JSON.stringify(rounds));
  for (let i = 0; i < r.length - 1; i++) {
    const next = r[i + 1];
    next.games.forEach((g, gi) => {
      const a = r[i].games[2 * gi];
      const b = r[i].games[2 * gi + 1];
      g.p1 = a?.winner ?? null;
      g.p2 = b?.winner ?? null;
      if (!g.p1 || !g.p2) g.winner = null;
      else if (g.p1.username === 'bye') g.winner = g.p2;
      else if (g.p2.username === 'bye') g.winner = g.p1;
    });
  }
  return r;
}

const ROUND_NAMES = [
  'Group Stage Round 1',
  'Group Stage Round 2',
  'Group Stage Round 3',
  'Round of 32',
  'Round of 16',
  'Quarterfinals',
  'Semifinals',
  'Final'
];

// Helper to extract a normalised school key for separation logic (Rule 3.4).
// Handles all real-world variants found in the Supabase profiles table.
export const getSchool = (p) => {
  if (!p) return 'unknown';
  const raw = (p.school || p.university || '').toLowerCase().trim().replace(/\s+/g, ' ');
  if (!raw) return 'unknown';
  if (/university of uyo|uniuyo|uni uyo|university of auyo/.test(raw)) return 'uniuyo';
  if (/university of calabar|\bunical\b/.test(raw)) return 'unical';
  if (/bells university/.test(raw)) return 'bells';
  if (/federal university of technology.*ikot|futa.*ikot|ikot abasi/.test(raw)) return 'futi';
  if (/university of nigeria|\bunn\b/.test(raw)) return 'unn';
  if (/akwa ibom state university|akwaibom state university|\baksu\b/.test(raw)) return 'aksu';
  if (/air force institute|\bafit\b/.test(raw)) return 'afit';
  if (/nnamdi azikiwe|nnandi azikiwe|\bunizik\b/.test(raw)) return 'unizik';
  if (/mohawk college/.test(raw)) return 'mohawk';
  return raw.substring(0, 20); // fallback: first 20 chars of name as key
};

// Generate only Round 1  permanent, called once by admin
export function generateRound1(players, year, month, options = {}) {
  const targetEloGap = options.targetEloGap ?? 400;
  const schoolPenalty = options.schoolPenalty ?? 150;
  const customDate = options.customDate;

  // 1. Separate non-provisional and provisional
  const nonProvisional = players.filter(p => !p.isProvisional);
  const provisional = players.filter(p => p.isProvisional);

  // 2. Sort non-provisional by rating desc
  nonProvisional.sort((a, b) => b.rating - a.rating);

  // 3. Shuffle provisional stably (so it remains identical across page refreshes)
  const shuffledProvisional = [...provisional].sort((a, b) => {
    const hashA = [...(a.username || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const hashB = [...(b.username || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return hashA - hashB || a.username.localeCompare(b.username);
  });

  // 4. Combined sorted list
  const sortedPlayers = [...nonProvisional, ...shuffledProvisional];

  // 5. Determine byes (Rule 3.3)
  const numByes = 64 - sortedPlayers.length;
  // Byes go to the highest-rated non-provisional players
  const byePlayers = sortedPlayers.slice(0, numByes);
  const activePlayers = sortedPlayers.slice(numByes);

  const BYE_OBJ = { name: 'BYE', username: 'bye', school: '', department: '' };

  // Create bye games (Auto-advancing)
  const byeGames = byePlayers.map((p, i) => ({
    id: `R1_G${i + 1}`,
    p1: p,
    p2: BYE_OBJ,
    winner: p,
    gameLink: ''
  }));

  // Create paired matchups aiming for ELO difference of ~400
  const unpaired = [...activePlayers];
  const pairedGames = [];
  let gameIdCounter = numByes + 1;

  while (unpaired.length > 0) {
    const p1 = unpaired.shift();
    
    let bestIdx = -1;
    let minCost = Infinity;
    
    for (let i = 0; i < unpaired.length; i++) {
      const p2 = unpaired[i];
      const sameSchool = getSchool(p1) && getSchool(p2) && (getSchool(p1) === getSchool(p2));
      const eloDiff = Math.abs((p1.rating || 0) - (p2.rating || 0));
      const dev = Math.abs(eloDiff - targetEloGap);
      const cost = dev + (sameSchool ? schoolPenalty : 0);
      
      if (cost < minCost) {
        minCost = cost;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      const p2 = unpaired.splice(bestIdx, 1)[0];
      pairedGames.push({
        id: `R1_G${gameIdCounter++}`,
        p1: p1,
        p2: p2,
        winner: null,
        gameLink: ''
      });
    } else {
      pairedGames.push({
        id: `R1_G${gameIdCounter++}`,
        p1: p1,
        p2: BYE_OBJ,
        winner: p1,
        gameLink: ''
      });
    }
  }

  const dates = getTournamentDates(year, month);
  const roundDate = customDate || dates[0];
  return { roundNum: 1, name: ROUND_NAMES[0], date: roundDate, games: [...byeGames, ...pairedGames] };
}

// Extract surviving players (top 2 per group during Group Stage, or match winners in Knockout Stage)
export function getSurvivingPlayers(tournament) {
  if (!tournament || !tournament.rounds || tournament.rounds.length === 0) return [];

  const rounds = tournament.rounds;
  const lastRound = rounds[rounds.length - 1];

  // Check if group stage is active
  const hasGroupStage = rounds.some(r => r.isGroupStage || r.name?.toLowerCase().includes('group'));

  if (hasGroupStage) {
    const groupGames = [];
    rounds.forEach(r => {
      if (r.isGroupStage || r.name?.toLowerCase().includes('group')) {
        (r.games || []).forEach(g => groupGames.push(g));
      }
    });

    const groupsMap = new Map();
    groupGames.forEach(g => {
      const label = g.groupLabel || 'A';
      if (!groupsMap.has(label)) groupsMap.set(label, new Map());
      const playerMap = groupsMap.get(label);
      if (g.p1 && g.p1.username !== 'bye') playerMap.set(g.p1.username, g.p1);
      if (g.p2 && g.p2.username !== 'bye') playerMap.set(g.p2.username, g.p2);
    });

    if (groupsMap.size === 0 && tournament.players?.length) {
      const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const G = Math.ceil(tournament.players.length / 4);
      for (let i = 0; i < G; i++) {
        const label = labels[i % labels.length];
        const pMap = new Map();
        tournament.players.slice(i * 4, i * 4 + 4).forEach(p => {
          if (p.username) pMap.set(p.username, p);
        });
        groupsMap.set(label, pMap);
      }
    }

    const surviving = [];
    const thirdPlaceList = [];

    Array.from(groupsMap.keys()).sort().forEach(groupLabel => {
      const playerMap = groupsMap.get(groupLabel);
      const players = Array.from(playerMap.values());

      const standings = players.map(p => {
        let P = 0, W = 0, D = 0, L = 0;
        groupGames.forEach(g => {
          if (g.groupLabel && g.groupLabel !== groupLabel) return;
          const isP1 = g.p1 && (g.p1.username === p.username || g.p1.id === p.id);
          const isP2 = g.p2 && (g.p2.username === p.username || g.p2.id === p.id);

          if ((isP1 || isP2) && g.winner !== null && g.winner !== undefined) {
            P++;
            const isWinner = typeof g.winner === 'object'
              ? (g.winner.username === p.username || g.winner.id === p.id)
              : false;
            const isDraw = typeof g.winner === 'object'
              ? (g.winner.username === 'draw' || g.winner.name === 'Draw')
              : g.winner === 'draw';

            if (isWinner) W++;
            else if (isDraw) D++;
            else L++;
          }
        });

        const Pts = (W * 1) + (D * 0.5);
        return { ...p, P, W, D, L, Pts };
      });

      standings.sort((a, b) => {
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;
        if (b.W !== a.W) return b.W - a.W;
        if (b.P !== a.P) return b.P - a.P;
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return (a.name || '').localeCompare(b.name || '');
      });

      const top2 = standings.slice(0, 2);
      surviving.push(...top2);

      if (standings.length >= 3) {
        thirdPlaceList.push(standings[2]);
      }
    });

    // Option B: If 30 top-2 qualifiers, include top 2 best 3rd-place finishers to make a 32-player Round of 32
    if (surviving.length === 30 && thirdPlaceList.length >= 2) {
      thirdPlaceList.sort((a, b) => {
        if (b.Pts !== a.Pts) return b.Pts - a.Pts;
        if (b.W !== a.W) return b.W - a.W;
        if (b.P !== a.P) return b.P - a.P;
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return (a.name || '').localeCompare(b.name || '');
      });
      const bestThirds = thirdPlaceList.slice(0, 2);
      surviving.push(...bestThirds);
    }

    return surviving;
  } else {
    const winners = [];
    (lastRound.games || []).forEach(g => {
      if (g.winner && typeof g.winner === 'object' && g.winner.username !== 'forfeit' && g.winner.username !== 'bye') {
        winners.push(g.winner);
      }
    });
    return winners;
  }
}

// Generate next round from winners of the last round  called by admin after logging all results
export function generateNextRound(rounds, year, month, options = {}) {
  const tournament = options.tournament || { rounds, players: options.players };
  const last = rounds[rounds.length - 1];
  const winners = (options.selectedPlayers && options.selectedPlayers.length > 0)
    ? options.selectedPlayers
    : getSurvivingPlayers(tournament);
  const nextNum = last.roundNum + 1;
  const targetEloGap = options.targetEloGap ?? 400;
  const schoolPenalty = options.schoolPenalty ?? 150;
  const customDate = options.customDate;
  const dates = getTournamentDates(year, month);
  const dateIdx = Math.min(nextNum - 1, dates.length - 1);

  // 1. Sort winners by ELO rating desc to calculate boundaries
  const sortedWinners = [...winners].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const numPairs = Math.floor(sortedWinners.length / 2);

  // 2. Compute boundary gaps
  let minAvg = 0;
  let maxAvg = 0;

  if (numPairs > 0) {
    // min_avg: adjacent pairing
    let sumMin = 0;
    for (let i = 0; i < numPairs; i++) {
      sumMin += Math.abs((sortedWinners[i * 2].rating || 0) - (sortedWinners[i * 2 + 1].rating || 0));
    }
    minAvg = sumMin / numPairs;

    // max_avg: split-half pairing
    let sumMax = 0;
    for (let i = 0; i < numPairs; i++) {
      sumMax += Math.abs((sortedWinners[i].rating || 0) - (sortedWinners[i + numPairs].rating || 0));
    }
    maxAvg = sumMax / numPairs;
  }

  // 3. Determine target Elo gap
  let target = targetEloGap;
  if (target < minAvg) {
    target = minAvg;
  } else if (target > maxAvg) {
    target = maxAvg;
  }

  // 4. Greedy cost-based pairing
  const unpaired = [...winners];
  const games = [];
  let gameIdCounter = 1;
  const BYE_OBJ = { name: 'BYE', username: 'bye', school: '', department: '' };

  while (unpaired.length > 0) {
    const p1 = unpaired.shift();
    
    let bestIdx = -1;
    let minCost = Infinity;
    
    for (let i = 0; i < unpaired.length; i++) {
      const p2 = unpaired[i];
      const sameSchool = getSchool(p1) && getSchool(p2) && (getSchool(p1) === getSchool(p2));
      const eloDiff = Math.abs((p1.rating || 0) - (p2.rating || 0));
      const dev = Math.abs(eloDiff - target);
      const cost = dev + (sameSchool ? schoolPenalty : 0);
      
      if (cost < minCost) {
        minCost = cost;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      const p2 = unpaired.splice(bestIdx, 1)[0];
      games.push({
        id: `R${nextNum}_G${gameIdCounter++}`,
        p1: p1,
        p2: p2,
        winner: null,
        gameLink: ''
      });
    } else {
      games.push({
        id: `R${nextNum}_G${gameIdCounter++}`,
        p1: p1,
        p2: BYE_OBJ,
        winner: p1,
        gameLink: ''
      });
    }
  }
  const roundDate = customDate || dates[dateIdx];
  const roundName = options.roundName || (ROUND_NAMES[nextNum - 1] ?? `Round ${nextNum}`);
  const isGroupStage = roundName.toLowerCase().includes('group');
  const isKnockout = !isGroupStage;
  return { roundNum: nextNum, name: roundName, date: roundDate, isGroupStage, isKnockout, games };
}


export function getCountdownTarget(tournament) {
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth() + 1;
  const todayStr = `${y}-${String(m).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const today8pm = new Date(`${todayStr}T20:00:00+01:00`);

  if (tournament && tournament.month_year) {
    const parts = tournament.month_year.split('-');
    if (parts.length === 2) {
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }
  }

  const dates = getTournamentDates(y, m);

  if (!tournament || tournament.status === 'upcoming') {
    if (today8pm > now) {
      return { date: today8pm, label: 'Round 1 starts in' };
    }
    return { date: new Date(`${dates[0]}T20:00:00+01:00`), label: 'Round 1 starts in' };
  }

  if (tournament.status === 'active') {
    const rounds = tournament.rounds || [];
    const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
    const currentNum = latestRound ? (latestRound.roundNum || rounds.length) : 1;
    const nextNum = currentNum + 1;

    // Admin panel override stored in DB takes priority
    if (latestRound && latestRound.next_round_start) {
      const customLabel = latestRound.next_round_label || `Round ${nextNum} starts in`;
      return { 
        date: new Date(latestRound.next_round_start), 
        label: customLabel
      };
    }

    // Default to previous round start time + 24 hours or next date in sequence
    const prevDateStr = latestRound?.date || dates[Math.min(currentNum - 1, dates.length - 1)];
    const prevDateObj = new Date(prevDateStr.includes('T') ? prevDateStr : `${prevDateStr}T20:00:00+01:00`);
    const nextDate = !isNaN(prevDateObj.getTime())
      ? new Date(prevDateObj.getTime() + 24 * 60 * 60 * 1000)
      : new Date(`${dates[Math.min(nextNum - 1, dates.length - 1)]}T20:00:00+01:00`);

    const defaultLabel = latestRound?.next_round_label || `Round ${nextNum} starts in`;
    return { 
      date: nextDate, 
      label: defaultLabel
    };
  }

  if (today8pm > now) {
    return { date: today8pm, label: "Round 1 starts in" };
  }

  const nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
  return { date: new Date(`${getTournamentDates(ny, nm)[0]}T20:00:00+01:00`), label: "Next tournament in" };
}


// ─────────────────────────────────────────────────────────────────────────────
// WORLD CUP GROUP-STAGE FIXTURE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const WC_GROUP_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ELO_SPREAD = 800;   // hard cap on intra-group spread
const MAX_SWAP_ATTEMPTS = 50; // guard against infinite swap loops

/**
 * Fisher-Yates shuffle  returns a new array.
 */
function fyShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Round-robin fixture list for an array of players.
 * Returns: [{ roundIndex, white, black }]
 */
function buildRoundRobin(players, groupLabel) {
  const pool = [...players];
  if (pool.length % 2 !== 0) pool.push(null); // phantom bye
  const n = pool.length;
  const fixtures = [];

  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const p1 = pool[i];
      const p2 = pool[n - 1 - i];
      if (!p1 || !p2) continue; // skip phantom bye slots
      const white = (r + i) % 2 === 0 ? p1 : p2;
      const black = white === p1 ? p2 : p1;
      fixtures.push({ roundIndex: r, groupLabel, white, black });
    }
    // Rotate all except first
    pool.splice(1, 0, pool.pop());
  }
  return fixtures;
}

/**
 * generateWorldCupFixtures(players, year, month, options)
 *
 * Produces a World Cup-style group stage for the given player list:
 *   - Pot-seeded draw (one player per pot per group)
 *   - 800-Elo intra-group spread cap (best-effort swap)
 *   - School separation: hard = same dept, soft = same university
 *   - Round-robin within each group (3 rounds for groups of 4)
 *   - Wildcard-ready: groups metadata stored for UI rendering
 *
 * Returns: { rounds, groups }
 *   rounds  – array of round objects matching existing tournament schema
 *   groups  – array of group metadata objects for UI/standings
 */
export function generateWorldCupFixtures(players, year, month, options = {}) {
  const customDates = options.dates || null;
  const dates = getTournamentDates(year, month); // last 8 days of month

  // ── 1. Sort: rated desc, then provisionals alphabetically ──────────────────
  const rated = players.filter(p => !p.isProvisional).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const prov  = players.filter(p =>  p.isProvisional).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const sorted = [...rated, ...prov];
  sorted.forEach((p, i) => { p._seed = i + 1; });

  const N = sorted.length;
  if (N < 4) throw new Error('Not enough players for group stage (need ≥ 4)');

  // ── 2. Group / pot sizing ──────────────────────────────────────────────────
  const G = Math.ceil(N / 4);          // number of groups (ceil ensures Group O & remainder groups get created)
  const numPots = 4;                    // always 4 pots
  // Remainder players get distributed into the first `rem` groups as a 5th slot
  const rem = N % 4;
  // groupSizes[g] = 4 or 5
  const groupSizes = Array.from({ length: G }, (_, g) => g < rem ? 5 : 4);

  // ── 3. Build pots ─────────────────────────────────────────────────────────
  // Pot p contains players whose index falls in the p-th "row" of the grid
  // (snake distribution would equalise averages  we build this then shuffle)
  const pots = [];
  let cursor = 0;
  for (let p = 0; p < numPots; p++) {
    const potSize = groupSizes.filter(sz => sz > p).length;
    pots.push(sorted.slice(cursor, cursor + potSize));
    cursor += potSize;
  }
  // 5th-player overflow pot (only exists when rem > 0)
  if (rem > 0 && cursor < sorted.length) {
    pots.push(sorted.slice(cursor));
  }

  // ── 4. Initialise empty groups ────────────────────────────────────────────
  /** @type {Array<Array<Object>>} groups[g] = list of players in Group g */
  const groups = Array.from({ length: G }, () => []);

  // ── 5. Assign each pot with shuffle + school separation + spread cap ───────
  const activePots = pots.filter(pot => pot.length > 0);
  activePots.forEach((pot, potIdx) => {
    const shuffled = fyShuffle(pot);
    // Which group indices need a slot from this pot?
    const eligible = fyShuffle(
      groups.map((_, gi) => gi).filter(gi => groups[gi].length === potIdx)
    );

    // Assign players to groups
    shuffled.forEach((player, i) => {
      groups[eligible[i]].push(player);
    });

    // ── School separation swap (soft constraint) ──────────────────────────
    let swaps = 0;
    let madeSwap = true;
    while (madeSwap && swaps < MAX_SWAP_ATTEMPTS) {
      madeSwap = false;
      for (let gi = 0; gi < G; gi++) {
        const slot = groups[gi][potIdx];
        if (!slot) continue;
        const slotSchool = getSchool(slot);
        const conflict = groups[gi].slice(0, potIdx).some(
          earlier => getSchool(earlier) === slotSchool && slotSchool !== 'unknown'
        );
        if (!conflict) continue;
        // Try to swap with another group's same-pot player
        for (let gj = gi + 1; gj < G; gj++) {
          const other = groups[gj][potIdx];
          if (!other) continue;
          const otherSchool = getSchool(other);
          const newConflictGi = groups[gi].slice(0, potIdx).some(
            e => getSchool(e) === otherSchool && otherSchool !== 'unknown'
          );
          const newConflictGj = groups[gj].slice(0, potIdx).some(
            e => getSchool(e) === slotSchool && slotSchool !== 'unknown'
          );
          if (!newConflictGi && !newConflictGj) {
            groups[gi][potIdx] = other;
            groups[gj][potIdx] = slot;
            madeSwap = true;
            swaps++;
            break;
          }
        }
        if (madeSwap) break;
      }
    }

    // ── Elo spread cap swap (hard constraint, best-effort) ────────────────
    if (potIdx >= 1) { // spread only measurable once ≥2 players assigned
      for (let gi = 0; gi < G; gi++) {
        const grp = groups[gi].filter(Boolean);
        const ratedGrp = grp.filter(p => !p.isProvisional);
        if (ratedGrp.length < 2) continue;
        const hi = Math.max(...ratedGrp.map(p => p.rating || 0));
        const lo = Math.min(...ratedGrp.map(p => p.rating || 0));
        if (hi - lo <= MAX_ELO_SPREAD) continue;
        // Spread exceeded  try swapping the newest addition (potIdx slot) with another group
        const culprit = groups[gi][potIdx];
        for (let gj = gi + 1; gj < G; gj++) {
          const candidate = groups[gj][potIdx];
          if (!candidate) continue;
          // Simulate swap
          const grpAfter = [...grp.slice(0, -1), candidate].filter(p => !p.isProvisional);
          const newHi = Math.max(...grpAfter.map(p => p.rating || 0));
          const newLo = Math.min(...grpAfter.map(p => p.rating || 0));
          if (newHi - newLo < hi - lo) { // strictly better spread
            groups[gi][potIdx] = candidate;
            groups[gj][potIdx] = culprit;
            break;
          }
        }
      }
    }
  });

  // ── 6. Build all round-robin fixtures across groups ───────────────────────
  // Collect per-round fixtures: roundFixtures[r] = [{groupLabel, white, black}]
  const NUM_RR_ROUNDS = 3; // max round-robins for groups of 4
  const roundFixtures = Array.from({ length: NUM_RR_ROUNDS }, () => []);

  groups.forEach((group, gi) => {
    const label = WC_GROUP_LABELS[gi];
    const fixtures = buildRoundRobin(group, label);
    fixtures.forEach(({ roundIndex, groupLabel, white, black }) => {
      if (roundIndex < NUM_RR_ROUNDS) {
        roundFixtures[roundIndex].push({ groupLabel, white, black });
      }
    });
  });

  // ── 7. Convert to tournament round objects ────────────────────────────────
  const rounds = roundFixtures.map((fixtures, ri) => {
    const roundNum = ri + 1;
    const roundDate = customDates?.[ri] || dates[ri] || dates[dates.length - 1];
    let gameCounter = 1;
    const games = fixtures.map(({ groupLabel, white, black }) => ({
      id: `G${groupLabel}_R${roundNum}_G${gameCounter++}`,
      groupLabel,
      p1: white,
      p2: black,
      winner: null,
      gameLink: ''
    }));
    return {
      roundNum,
      name: `Group Stage - Round ${roundNum}`,
      date: roundDate,
      isGroupStage: true,
      games
    };
  });

  // ── 8. Build group metadata objects for UI/standings ──────────────────────
  const groupsMeta = groups.map((players, gi) => ({
    label: WC_GROUP_LABELS[gi],
    players: players.filter(Boolean),
    avgRating: (() => {
      const rp = players.filter(p => p && !p.isProvisional);
      return rp.length ? Math.round(rp.reduce((s, p) => s + (p.rating || 0), 0) / rp.length) : null;
    })()
  }));

  return { rounds, groups: groupsMeta };
}
