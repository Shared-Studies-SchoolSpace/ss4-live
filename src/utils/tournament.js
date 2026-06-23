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

const ROUND_NAMES = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];

// Generate only Round 1 — permanent, called once by admin
// Generate only Round 1 — permanent, called once by admin
export function generateRound1(players, year, month) {
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

  // 6. Same-school separation logic (Rule 3.4)
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

  // Group active players by school
  const groups = {};
  activePlayers.forEach(p => {
    const s = getSchool(p);
    if (!groups[s]) groups[s] = [];
    groups[s].push(p);
  });

  // Sort school groups by player count desc
  const schoolNames = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  // Interleave schools to keep same-school players as far apart as possible
  const interleaved = [];
  const schoolQueues = schoolNames.map(name => groups[name]);
  
  while (interleaved.length < activePlayers.length) {
    for (const queue of schoolQueues) {
      if (queue.length > 0) {
        interleaved.push(queue.shift());
      }
    }
  }

  // Pair them up: first half vs second half to draw them as far apart as possible
  const half = activePlayers.length / 2;
  const pairedGames = [];
  const BYE_OBJ = { name: 'BYE', username: 'bye', school: '', department: '' };

  // Create bye games (Auto-advancing)
  const byeGames = byePlayers.map((p, i) => ({
    id: `R1_G${i + 1}`,
    p1: p,
    p2: BYE_OBJ,
    winner: p,
    gameLink: ''
  }));

  // Create paired matchups
  for (let i = 0; i < half; i++) {
    pairedGames.push({
      id: `R1_G${numByes + i + 1}`,
      p1: interleaved[i],
      p2: interleaved[i + half],
      winner: null,
      gameLink: ''
    });
  }

  const dates = getTournamentDates(year, month);
  return { roundNum: 1, name: ROUND_NAMES[0], date: dates[0], games: [...byeGames, ...pairedGames] };
}

// Generate next round from winners of the last round — called by admin after logging all results
export function generateNextRound(rounds, year, month) {
  const last = rounds[rounds.length - 1];
  const winners = last.games.map(g => g.winner).filter(Boolean);
  const nextNum = last.roundNum + 1;
  const dates = getTournamentDates(year, month);
  const dateIdx = Math.min(nextNum - 1, dates.length - 1);
  const games = Array.from({ length: Math.floor(winners.length / 2) }, (_, i) => ({
    id: `R${nextNum}_G${i + 1}`,
    p1: winners[i * 2],
    p2: winners[i * 2 + 1],
    winner: null, gameLink: ''
  }));
  return { roundNum: nextNum, name: ROUND_NAMES[nextNum - 1] ?? `Round ${nextNum}`, date: dates[dateIdx], games };
}


export function getCountdownTarget(tournament) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() + 1;
  if (!tournament || tournament.status === 'upcoming') {
    const dates = getTournamentDates(y, m);
    return { date: new Date(`${dates[0]}T18:00:00`), label: 'Tournament begins in' };
  }
  if (tournament.status === 'active') {
    const pending = tournament.rounds.find(r => r.games.some(g => !g.winner));
    if (pending) return { date: new Date(`${pending.date}T18:00:00`), label: `${pending.name} starts in` };
  }
  // completed — next month's first tournament day
  const nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
  return { date: new Date(`${getTournamentDates(ny, nm)[0]}T18:00:00`), label: "Next tournament in" };
}
