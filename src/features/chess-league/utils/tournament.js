export function parseRating(val) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  const cleaned = String(val || '').replace(/\D/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 1200 : parsed;
}

export function getTournamentDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return Array.from({ length: 8 }, (_, i) => {
    const day = lastDay - 7 + i;
    return `${year}-${mm}-${String(day).padStart(2, '0')}`;
  });
}

export function isBo3Round(roundName) {
  if (!roundName) return false;
  const name = roundName.toLowerCase();
  if (name.includes('group') || name.includes('32') || name.includes('16')) return false;
  return name.includes('quarter') || name.includes('semi') || name.includes('final') || name.includes('3rd');
}

export function initializeBo3SubGames(p1, p2) {
  const p1User = p1?.username || 'tbd';
  const p2User = p2?.username || 'tbd';
  return [
    { gameNum: 1, white: p1User, black: p2User, winner: null, gameLink: '' },
    { gameNum: 2, white: p2User, black: p1User, winner: null, gameLink: '' },
    { gameNum: 3, white: p1User, black: p2User, winner: null, gameLink: '' }
  ];
}

export function evaluateBo3Series(game) {
  if (!game) return { p1Pts: 0, p2Pts: 0, winner: null, isFinished: false, subGames: [] };

  if (game.p1?.username === 'bye') {
    return { p1Pts: 0, p2Pts: 0, winner: game.p2, isFinished: true, subGames: game.subGames || [] };
  }
  if (game.p2?.username === 'bye') {
    return { p1Pts: 0, p2Pts: 0, winner: game.p1, isFinished: true, subGames: game.subGames || [] };
  }

  if (game.bestOf !== 3 && (!game.subGames || game.subGames.length === 0)) {
    const isW1 = game.winner && typeof game.winner === 'object' && game.winner.username === game.p1?.username;
    const isW2 = game.winner && typeof game.winner === 'object' && game.winner.username === game.p2?.username;
    const isD = game.winner === 'draw' || (typeof game.winner === 'object' && game.winner.username === 'draw');
    return {
      p1Pts: isW1 ? 1 : isD ? 0.5 : 0,
      p2Pts: isW2 ? 1 : isD ? 0.5 : 0,
      winner: game.winner || null,
      isFinished: !!game.winner,
      subGames: []
    };
  }

  const p1User = game.p1?.username;
  const p2User = game.p2?.username;

  let p1Pts = 0;
  let p2Pts = 0;
  let completedCount = 0;
  const subGames = game.subGames ? [...game.subGames] : initializeBo3SubGames(game.p1, game.p2);

  subGames.forEach(sg => {
    if (!sg.winner) return;
    completedCount++;
    const wUser = (sg.winner && typeof sg.winner === 'object') ? sg.winner.username : sg.winner;
    if (wUser === p1User) {
      p1Pts += 1.0;
    } else if (wUser === p2User) {
      p2Pts += 1.0;
    } else if (wUser === 'draw' || wUser === 'draws') {
      p1Pts += 0.5;
      p2Pts += 0.5;
    }
  });

  let winner = null;
  let isFinished = false;

  const hasForfeit = subGames.some(sg => (sg.winner && typeof sg.winner === 'object' ? sg.winner.username : sg.winner) === 'forfeit');
  if (hasForfeit) {
    winner = { username: 'forfeit', name: 'Double Forfeit', rating: 0, school: '' };
    isFinished = true;
  } else if (p1Pts >= 1.5 && p1Pts > p2Pts) {
    winner = game.p1;
    isFinished = true;
  } else if (p2Pts >= 1.5 && p2Pts > p1Pts) {
    winner = game.p2;
    isFinished = true;
  } else if (p1Pts === 1.5 && p2Pts === 1.5) {
    if (subGames.length < 4) {
      subGames.push({ gameNum: 4, isArmageddon: true, white: p1User, black: p2User, winner: null, gameLink: '' });
    } else if (subGames[3].winner) {
      const g4Winner = (subGames[3].winner && typeof subGames[3].winner === 'object') ? subGames[3].winner.username : subGames[3].winner;
      if (g4Winner === p1User) {
        winner = game.p1;
        p1Pts += 1.0;
        isFinished = true;
      } else if (g4Winner === p2User) {
        winner = game.p2;
        p2Pts += 1.0;
        isFinished = true;
      }
    }
  }

  return {
    p1Pts,
    p2Pts,
    winner,
    isFinished,
    subGames,
    completedCount
  };
}

export function getMatchWinner(game) {
  if (!game) return null;
  if (game.bestOf === 3 || (game.subGames && game.subGames.length > 0)) {
    return evaluateBo3Series(game).winner;
  }
  return game.winner || null;
}

export function propagateWinners(rounds) {
  const r = JSON.parse(JSON.stringify(rounds));
  for (let i = 0; i < r.length - 1; i++) {
    const next = r[i + 1];
    next.games.forEach((g, gi) => {
      const a = r[i].games[2 * gi];
      const b = r[i].games[2 * gi + 1];

      const aWinner = a ? getMatchWinner(a) : null;
      const bWinner = b ? getMatchWinner(b) : null;

      g.p1 = aWinner;
      g.p2 = bWinner;

      if (g.bestOf === 3 && (g.p1 || g.p2)) {
        if (!g.subGames || g.subGames.length === 0) {
          g.subGames = initializeBo3SubGames(g.p1, g.p2);
        } else {
          g.subGames.forEach((sg, sgi) => {
            if (sgi % 2 === 0) {
              sg.white = g.p1?.username || 'tbd';
              sg.black = g.p2?.username || 'tbd';
            } else {
              sg.white = g.p2?.username || 'tbd';
              sg.black = g.p1?.username || 'tbd';
            }
          });
        }
      }

      if (!g.p1 || !g.p2) {
        g.winner = null;
      } else if (g.p1.username === 'bye') {
        g.winner = g.p2;
      } else if (g.p2.username === 'bye') {
        g.winner = g.p1;
      } else if (g.bestOf === 3) {
        g.winner = evaluateBo3Series(g).winner;
      }
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
      const eloDiff = Math.abs(parseRating(p1?.rating) - parseRating(p2?.rating));
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

// Compute and return group standings data across all groups
export function getGroupData(tournament, customPlayers = null) {
  if (!tournament) return [];
  const rawPlayers = customPlayers || tournament.players || [];

  let groupsMeta = tournament.groups || [];

  if (!groupsMeta.length && tournament.rounds?.length) {
    const discoveredLabels = new Set();
    tournament.rounds.forEach(r => {
      (r.games || []).forEach(g => {
        if (g.groupLabel) discoveredLabels.add(g.groupLabel);
      });
    });

    if (discoveredLabels.size > 0) {
      const sortedLabels = Array.from(discoveredLabels).sort();
      groupsMeta = sortedLabels.map(label => {
        const playersInGroup = new Map();
        tournament.rounds.forEach(r => {
          (r.games || []).forEach(g => {
            if (g.groupLabel === label) {
              if (g.p1 && g.p1.username !== 'bye') playersInGroup.set(g.p1.username, g.p1);
              if (g.p2 && g.p2.username !== 'bye') playersInGroup.set(g.p2.username, g.p2);
            }
          });
        });
        return {
          label,
          players: Array.from(playersInGroup.values())
        };
      });

      const assignedUsernames = new Set();
      groupsMeta.forEach(g => {
        (g.players || []).forEach(p => {
          if (p.username) assignedUsernames.add(p.username.toLowerCase());
        });
      });

      const unassignedPlayers = rawPlayers.filter(p => p.username && !assignedUsernames.has(p.username.toLowerCase()));
      if (unassignedPlayers.length > 0) {
        const lastLabel = sortedLabels[sortedLabels.length - 1] || 'N';
        const nextLabelChar = String.fromCharCode(lastLabel.charCodeAt(0) + 1);
        groupsMeta.push({
          label: nextLabelChar,
          players: unassignedPlayers
        });
      }
    }
  }

  if (!groupsMeta.length && rawPlayers.length >= 4) {
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const G = Math.ceil(rawPlayers.length / 4);
    groupsMeta = Array.from({ length: G }, (_, i) => ({
      label: labels[i % labels.length],
      players: rawPlayers.slice(i * 4, i * 4 + 4)
    }));
  }

  const allGames = [];
  (tournament.rounds || []).forEach(r => {
    (r.games || []).forEach(g => {
      allGames.push(g);
    });
  });

  return groupsMeta.map(grp => {
    const groupLabel = grp.label;
    const groupPlayers = grp.players || [];

    const standings = groupPlayers.map(p => {
      let P = 0, W = 0, D = 0, L = 0;
      allGames.forEach(g => {
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

      const computedPts = (W * 1) + (D * 0.5);
      const Pts = typeof p.pts === 'number' ? p.pts : typeof p.Pts === 'number' ? p.Pts : computedPts;

      return {
        ...p,
        P,
        W,
        D,
        L,
        Pts,
        pts: Pts
      };
    });

    standings.sort((a, b) => {
      if ((b.Pts || 0) !== (a.Pts || 0)) return (b.Pts || 0) - (a.Pts || 0);
      if ((b.W || 0) !== (a.W || 0)) return (b.W || 0) - (a.W || 0);
      if ((b.P || 0) !== (a.P || 0)) return (b.P || 0) - (a.P || 0);
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

    return {
      label: groupLabel,
      standings
    };
  });
}

/**
 * Evaluates completion status and extracts surviving players for a target round.
 * Round-specific survival rules:
 * - Group Stage -> Round of 32: Top 2 per group (plus top 2 best 3rd place if needed for 32).
 * - Knockout Stage -> Next Knockout Round: Winners of previous knockout round matches.
 */
export function getSurvivingPlayersStatus(tournament, targetRoundName = null) {
  if (!tournament || !tournament.rounds || tournament.rounds.length === 0) {
    return { isComplete: false, pendingCount: 0, pendingGames: [], survivors: [] };
  }

  const rounds = tournament.rounds;
  const lastRound = rounds[rounds.length - 1];

  // Determine target round name if not explicitly provided
  const nextNum = (lastRound.roundNum || rounds.length) + 1;
  const target = targetRoundName || (ROUND_NAMES[nextNum - 1] ?? `Round ${nextNum}`);
  const targetLower = target.toLowerCase();

  // Check whether target round advances from Group Stage (e.g., Round of 32) or from a Knockout round
  const isTargetR32 = targetLower.includes('32') || targetLower.includes('round of 32');
  const isLastRoundGroup = lastRound.isGroupStage || (lastRound.name && lastRound.name.toLowerCase().includes('group'));

  if (isTargetR32 || isLastRoundGroup) {
    // ── SURVIVAL FROM GROUP STAGE ──
    const groupRounds = rounds.filter(r => r.isGroupStage || (r.name && r.name.toLowerCase().includes('group')));
    const allGroupGames = groupRounds.flatMap(r => r.games || []);
    const pendingGames = allGroupGames.filter(g => !g.winner);

    const groupsData = getGroupData(tournament);
    const surviving = [];
    const thirdPlaceList = [];

    groupsData.forEach(grp => {
      const standings = grp.standings || [];
      const top2 = standings.slice(0, 2);
      surviving.push(...top2);

      if (standings.length >= 3) {
        thirdPlaceList.push(standings[2]);
      }
    });

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

    return {
      isComplete: pendingGames.length === 0,
      pendingCount: pendingGames.length,
      pendingGames,
      survivors: surviving
    };
  } else {
    // ── SURVIVAL FROM PREVIOUS KNOCKOUT ROUND ──
    // Determine preceding knockout round
    let sourceRound = lastRound;
    
    // If targetRoundName is specified, try to find the round that precedes it
    if (targetRoundName) {
      const targetIdx = rounds.findIndex(r => r.name && r.name.toLowerCase() === targetLower);
      if (targetIdx > 0) {
        sourceRound = rounds[targetIdx - 1];
      }
    }

    const prevGames = sourceRound.games || [];
    const pendingGames = prevGames.filter(g => !g.winner);

    const winners = [];
    prevGames.forEach(g => {
      if (g.winner && typeof g.winner === 'object' && g.winner.username !== 'forfeit' && g.winner.username !== 'bye') {
        winners.push(g.winner);
      }
    });

    return {
      isComplete: pendingGames.length === 0,
      pendingCount: pendingGames.length,
      pendingGames,
      survivors: winners
    };
  }
}

// Extract surviving players for a specific target round or default to current stage
export function getSurvivingPlayers(tournament, targetRoundName = null) {
  const status = getSurvivingPlayersStatus(tournament, targetRoundName);
  return status.survivors;
}

// Generate next round from winners of the last round - called by admin after logging all results
export function generateNextRound(rounds, year, month, options = {}) {
  const tournament = options.tournament || { rounds, players: options.players };
  const last = rounds[rounds.length - 1];
  const nextNum = last ? last.roundNum + 1 : 1;
  const roundName = options.roundName || (ROUND_NAMES[nextNum - 1] ?? `Round ${nextNum}`);
  const isGroupStage = roundName.toLowerCase().includes('group');
  const isKnockout = !isGroupStage;
  const isBo3 = isBo3Round(roundName);

  const customDate = options.customDate;
  const dates = getTournamentDates(year, month);
  const dateIdx = Math.min(nextNum - 1, dates.length - 1);
  const roundDate = customDate || dates[dateIdx];
  const BYE_OBJ = { name: 'BYE', username: 'bye', school: '', department: '' };

  // Deterministic knockout bracket pairing (Round of 32 -> 16 -> QF -> SF -> Final)
  if (isKnockout && last && last.games && last.games.length > 1 && !options.selectedPlayers) {
    const prevGames = last.games;
    const numNextGames = Math.floor(prevGames.length / 2);
    const games = [];

    for (let i = 0; i < numNextGames; i++) {
      const g1 = prevGames[i * 2];
      const g2 = prevGames[i * 2 + 1];

      let p1 = g1 ? getMatchWinner(g1) : null;
      let p2 = g2 ? getMatchWinner(g2) : null;

      // Auto-resolve BYE winners if not explicit
      if (!p1 && g1?.p1 && g1.p2?.username === 'bye') p1 = g1.p1;
      if (!p2 && g2?.p1 && g2.p2?.username === 'bye') p2 = g2.p1;

      let winner = null;
      if (p1?.username === 'bye' && p2 && p2.username !== 'bye') winner = p2;
      else if (p2?.username === 'bye' && p1 && p1.username !== 'bye') winner = p1;

      const gObj = {
        id: `R${nextNum}_G${i + 1}`,
        p1,
        p2,
        winner,
        gameLink: '',
        bestOf: isBo3 ? 3 : 1
      };

      if (isBo3) {
        gObj.subGames = initializeBo3SubGames(p1, p2);
        if (winner) {
          gObj.winner = winner;
        }
      }

      games.push(gObj);
    }

    return { roundNum: nextNum, name: roundName, date: roundDate, isGroupStage, isKnockout, games };
  }

  // Fallback / Swiss / Custom selection ELO-based pairing
  const winners = (Array.isArray(options.selectedPlayers))
    ? options.selectedPlayers
    : getSurvivingPlayers(tournament, roundName);

  const targetEloGap = options.targetEloGap ?? 400;
  const schoolPenalty = options.schoolPenalty ?? 150;

  // 1. Sort winners by ELO rating desc to calculate boundaries
  const sortedWinners = [...winners].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const numPairs = Math.floor(sortedWinners.length / 2);

  // 2. Compute boundary gaps
  let minAvg = 0;
  let maxAvg = 0;

  if (numPairs > 0) {
    let sumMin = 0;
    for (let i = 0; i < numPairs; i++) {
      sumMin += Math.abs((sortedWinners[i * 2].rating || 0) - (sortedWinners[i * 2 + 1].rating || 0));
    }
    minAvg = sumMin / numPairs;

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

  while (unpaired.length > 0) {
    const p1 = unpaired.shift();
    
    let bestIdx = -1;
    let minCost = Infinity;
    
    for (let i = 0; i < unpaired.length; i++) {
      const p2 = unpaired[i];
      const sameSchool = getSchool(p1) && getSchool(p2) && (getSchool(p1) === getSchool(p2));
      const eloDiff = Math.abs(parseRating(p1?.rating) - parseRating(p2?.rating));
      const dev = Math.abs(eloDiff - target);
      const cost = dev + (sameSchool ? schoolPenalty : 0);
      
      if (cost < minCost) {
        minCost = cost;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      const p2 = unpaired.splice(bestIdx, 1)[0];
      const gObj = {
        id: `R${nextNum}_G${gameIdCounter++}`,
        p1: p1,
        p2: p2,
        winner: null,
        gameLink: '',
        bestOf: isBo3 ? 3 : 1
      };
      if (isBo3) {
        gObj.subGames = initializeBo3SubGames(p1, p2);
      }
      games.push(gObj);
    } else {
      const gObj = {
        id: `R${nextNum}_G${gameIdCounter++}`,
        p1: p1,
        p2: BYE_OBJ,
        winner: p1,
        gameLink: '',
        bestOf: isBo3 ? 3 : 1
      };
      if (isBo3) {
        gObj.subGames = initializeBo3SubGames(p1, BYE_OBJ);
      }
      games.push(gObj);
    }
  }

  return { roundNum: nextNum, name: roundName, date: roundDate, isGroupStage, isKnockout, games };
}


export function getCountdownTarget(tournament) {
  const now = new Date();

  if (!tournament) {
    // No active tournament in DB - signal the banner to stay hidden.
    return { date: null, label: null, showBanner: false, mode: 'auto', version: 1, headline: '' };
  }

  const showBanner = tournament.show_banner !== false;
  const mode = tournament.banner_mode || 'auto';
  const version = tournament.banner_version || 1;
  const headline = tournament.banner_headline || '';

  // Priority 0: finals_completed_at countdown (12 hours post-finals celebration)
  if (tournament.status === 'active' && tournament.finals_completed_at) {
    const finalsCompletedTime = new Date(tournament.finals_completed_at).getTime();
    if (!isNaN(finalsCompletedTime)) {
      const finalsEnd = new Date(finalsCompletedTime + 12 * 60 * 60 * 1000);
      if (finalsEnd > now) {
        return {
          date: finalsEnd,
          label: 'Tournament Concludes & Next Registration Opens',
          showBanner,
          mode,
          version,
          headline
        };
      }
    }
  }

  // Priority 1: explicit top-level next_round_start on the tournament row
  if (tournament.next_round_start) {
    const customDate = new Date(tournament.next_round_start);
    if (!isNaN(customDate.getTime())) {
      return {
        date: customDate,
        label: tournament.next_round_label || (tournament.status === 'upcoming' ? 'Registration Closes in' : 'Tournament Round'),
        showBanner,
        mode,
        version,
        headline
      };
    }
  }

  // Priority 2: next_round_start on the most recent round
  const rounds = tournament.rounds || [];
  const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  if (latestRound && latestRound.next_round_start) {
    const customDate = new Date(latestRound.next_round_start);
    if (!isNaN(customDate.getTime())) {
      return {
        date: customDate,
        label: latestRound.next_round_label || latestRound.name || 'Next Round',
        showBanner,
        mode,
        version,
        headline
      };
    }
  }

  // Priority 3: Fallback for upcoming tournaments - start of monthly tournament (24th/25th 18:00 WAT)
  if (tournament.status === 'upcoming' || (!tournament.status && tournament.month_year)) {
    let year, month;
    if (tournament.month_year) {
      [year, month] = tournament.month_year.split('-').map(Number);
    } else {
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }
    const dates = getTournamentDates(year, month);
    const startDateStr = dates[0] ? `${dates[0]}T18:00:00+01:00` : null;
    const fallbackDate = startDateStr ? new Date(startDateStr) : new Date(now.getTime() + 7 * 86400 * 1000);
    return {
      date: fallbackDate,
      label: tournament.next_round_label || 'Registration Closes in',
      showBanner,
      mode,
      version,
      headline
    };
  }

  return { date: null, label: null, showBanner, mode, version, headline };
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

export const FINALS_TRANSITION_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Calculates the target month_year for the next upcoming tournament.
 * Rule:
 * 1. Find current calendar year and month M (e.g. 2026-08).
 * 2. Check if any tournament in allTournaments started in month M (status === 'active' or 'completed' with month_year === M).
 * 3. If NO tournament started in month M, return M.
 * 4. If a tournament started in month M, return M + 1 (e.g. 2026-09).
 */
export function calculateNextUpcomingMonth(allTournaments = []) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const curMY = `${curY}-${String(curM).padStart(2, '0')}`;

  const hasStartedInCurrentMonth = (allTournaments || []).some(t => 
    t.month_year === curMY && (t.status === 'active' || t.status === 'completed')
  );

  if (!hasStartedInCurrentMonth) {
    return curMY;
  }

  let nextY = curY;
  let nextM = curM + 1;
  if (nextM > 12) {
    nextM = 1;
    nextY += 1;
  }
  return `${nextY}-${String(nextM).padStart(2, '0')}`;
}

/**
 * Checks if 12 hours have passed since the finals were completed.
 */
export function checkFinalsCompletion(tournament) {
  if (!tournament || tournament.status !== 'active') return false;
  if (!tournament.finals_completed_at) return false;
  
  const completedAt = new Date(tournament.finals_completed_at).getTime();
  if (isNaN(completedAt)) return false;
  
  const elapsed = Date.now() - completedAt;
  return elapsed >= FINALS_TRANSITION_MS;
}
