// Tournament scheduling and bracket utilities

export function getTournamentDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return Array.from({ length: 7 }, (_, i) => {
    const day = lastDay - 6 + i;
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

const ROUND_NAMES = ['Round 1', 'Round 2', 'Round 3', 'Quarterfinals', 'Semifinals', 'Final'];

// Helper to extract school for separation logic (Rule 3.4)
const getSchool = (p) => {
  if (!p || !p.school) return '';
  return p.school.toLowerCase().trim()
    .replace(/university of /g, "")
    .replace(/nnamdi azikiwe university\(unizik\)/g, "unizik")
    .replace(/nnamdi azikiwe university awka/g, "unizik")
    .replace(/nnandi azikiwe university\(unizik\)/g, "unizik")
    .replace(/bells university of technology/g, "bells")
    .replace(/bells university/g, "bells")
    .replace(/uniuyo/g, "uyo")
    .replace(/university of uyo/g, "uyo");
};

// Generate only Round 1 — permanent, called once by admin
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

// Generate next round from winners of the last round — called by admin after logging all results
export function generateNextRound(rounds, year, month, options = {}) {
  const last = rounds[rounds.length - 1];
  const winners = last.games.map(g => g.winner).filter(w => w && w.username !== 'forfeit');
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
  return { roundNum: nextNum, name: ROUND_NAMES[nextNum - 1] ?? `Round ${nextNum}`, date: roundDate, games };
}


export function getCountdownTarget(tournament) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() + 1;
  if (!tournament || tournament.status === 'upcoming') {
    const dates = getTournamentDates(y, m);
    return { date: new Date(`${dates[0]}T20:00:00+01:00`), label: 'Tournament begins in' };
  }
  if (tournament.status === 'active') {
    const pending = tournament.rounds.find(r => r.games.some(g => !g.winner));
    if (pending) return { date: new Date(`${pending.date}T20:00:00+01:00`), label: `${pending.name} starts in` };
  }
  // completed — next month's first tournament day
  const nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
  return { date: new Date(`${getTournamentDates(ny, nm)[0]}T20:00:00+01:00`), label: "Next tournament in" };
}
