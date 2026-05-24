export function generateRoundRobin(players) {
  const n = players.length;
  const isOdd = n % 2 !== 0;
  const tempPlayers = [...players];
  if (isOdd) tempPlayers.push("BYE");
  
  const numPlayers = tempPlayers.length;
  const numRounds = numPlayers - 1;
  const gamesPerRound = numPlayers / 2;
  
  const rounds = [];
  
  for (let r = 0; r < numRounds; r++) {
    const roundGames = [];
    for (let g = 0; g < gamesPerRound; g++) {
      const p1 = tempPlayers[g];
      const p2 = tempPlayers[numPlayers - 1 - g];
      
      if (p1 !== "BYE" && p2 !== "BYE") {
        // Alternate colors
        if ((r + g) % 2 === 0) {
          roundGames.push([p1, p2]);
        } else {
          roundGames.push([p2, p1]);
        }
      }
    }
    
    rounds.push({
      round: r + 1,
      date: `Round ${r + 1} - Date TBD`,
      games: roundGames
    });
    
    // Rotate players (keep the first one fixed)
    tempPlayers.splice(1, 0, tempPlayers.pop());
  }
  
  return rounds;
}

export function generateSwissNextRound(
  players,
  previousRounds,
  gameResults,
  divisionId
) {
  // 1. Calculate current scores and history
  const scores = {};
  const history = {};
  const colorBalance = {}; // white - black

  players.forEach(p => {
    scores[p] = 0;
    history[p] = new Set();
    colorBalance[p] = 0;
  });

  previousRounds.forEach((r) => {
    r.games.forEach(([w, b]) => {
      if (w === 'BYE' || b === 'BYE') {
        const p = w === 'BYE' ? b : w;
        if (history[p]) history[p].add('BYE');
        if (scores[p] !== undefined) scores[p] += 3;
        return;
      }

      const key = `${divisionId}_R${r.round}_${w}_${b}`;
      const res = gameResults[key];
      
      if (history[w]) history[w].add(b);
      if (history[b]) history[b].add(w);
      colorBalance[w]++;
      colorBalance[b]--;

      if (res === 'white') scores[w] += 3;
      else if (res === 'black') scores[b] += 3;
      else if (res === 'draw') { scores[w] += 1; scores[b] += 1; }
    });
  });

  // 2. Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0) || Math.random() - 0.5);

  const pairings = [];
  const used = new Set();

  // Handle Odd Player BYE
  if (players.length % 2 !== 0) {
    let byePlayer = null;
    // Find the lowest-scoring player who hasn't had a BYE yet
    for (let k = sortedPlayers.length - 1; k >= 0; k--) {
      const p = sortedPlayers[k];
      if (!history[p].has('BYE')) {
        byePlayer = p;
        break;
      }
    }
    // Fallback if everyone already had a BYE
    if (!byePlayer) {
      byePlayer = sortedPlayers[sortedPlayers.length - 1];
    }
    
    pairings.push([byePlayer, 'BYE']);
    used.add(byePlayer);
    used.add('BYE');
  }

  // 3. Simple greedy pairing (can be improved with backtracking)
  for (let i = 0; i < sortedPlayers.length; i++) {
    const p1 = sortedPlayers[i];
    if (used.has(p1)) continue;

    let found = false;
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const p2 = sortedPlayers[j];
      if (used.has(p2)) continue;

      if (!history[p1].has(p2)) {
        // Determine colors
        if (colorBalance[p1] <= colorBalance[p2]) {
          pairings.push([p1, p2]);
        } else {
          pairings.push([p2, p1]);
        }
        used.add(p1);
        used.add(p2);
        found = true;
        break;
      }
    }

    if (!found) {
      // Float p1 if possible or just pair with next available if forced
      // For this version, we'll just pair with the first available player if no choice
      for (let j = i + 1; j < sortedPlayers.length; j++) {
        const p2 = sortedPlayers[j];
        if (used.has(p2)) continue;
        
        pairings.push([p1, p2]);
        used.add(p1);
        used.add(p2);
        break;
      }
    }
  }

  return pairings;
}
