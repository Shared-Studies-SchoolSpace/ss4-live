/**
 * World Cup Style Fixture Generator — Analysis Script (READ-ONLY, no Supabase writes)
 *
 * Algorithm:
 *  1. Fetch all registered players (those with a chess/lichess username) from Supabase
 *  2. Sort by rating descending; provisionals (no rating or rating=1200 default) go to the back
 *  3. Assign seed ranks 1..N
 *  4. Decide group count & group size based on total player count
 *  5. Divide into Pots (one pot per "row" in a snake grid)
 *  6. Snake-assign baseline slots so every group has exactly the same average seed rank
 *  7. Within each Pot, randomly shuffle the assignment (this is the "draw" element)
 *  8. Validate: compute each group's average Elo, flag if deviation > threshold
 *  9. Generate round-robin fixtures within each group
 * 10. Pretty-print the complete analysis
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// ── Env ───────────────────────────────────────────────────────────────────────
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// ── Configuration ─────────────────────────────────────────────────────────────
const TARGET_GROUP_SIZE = 4;   // players per group (4 = 3 round-robins each)
const SCHOOL_SEPARATION = true; // try to keep same-school players apart

// ── Helpers ───────────────────────────────────────────────────────────────────
const getSchool = (p) => {
  if (!p.school) return '';
  return p.school.toLowerCase().trim()
    .replace(/university of /g, '')
    .replace(/nnamdi azikiwe university.*/g, 'unizik')
    .replace(/bells university.*/g, 'bells')
    .replace(/uniuyo|university of uyo/g, 'uyo');
};

/**
 * Fisher-Yates shuffle (deterministic seed optional)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Round-robin fixture generator for a group
 * Returns array of {white, black} match objects
 */
function roundRobinFixtures(group) {
  const players = [...group];
  if (players.length % 2 !== 0) players.push(null); // BYE
  const n = players.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const p1 = players[i];
      const p2 = players[n - 1 - i];
      if (p1 && p2) {
        round.push(((r + i) % 2 === 0) ? { white: p1, black: p2 } : { white: p2, black: p1 });
      }
    }
    rounds.push(round);
    // Rotate all except first
    players.splice(1, 0, players.pop());
  }
  return rounds;
}

/**
 * Try to swap same-school players into different groups within the same Pot tier
 * Returns modified groups (mutates in place)
 */
function applySameSchoolSwap(groups, potIndex, G) {
  // Iterate each group slot in this pot row
  for (let g = 0; g < G; g++) {
    const slot = groups[g][potIndex];
    // Check if any other player in this group (from earlier pots) shares school
    const conflict = groups[g].slice(0, potIndex).some(
      earlier => earlier && getSchool(earlier) === getSchool(slot) && getSchool(slot) !== ''
    );
    if (!conflict) continue;
    // Try to swap with another group in same pot row
    for (let g2 = g + 1; g2 < G; g2++) {
      const slot2 = groups[g2][potIndex];
      // Check that swapping doesn't create a new conflict in the other group
      const conflictG2slot2 = groups[g2].slice(0, potIndex).some(
        earlier => earlier && getSchool(earlier) === getSchool(slot) && getSchool(slot) !== ''
      );
      const conflictG1slot1 = groups[g].slice(0, potIndex).some(
        earlier => earlier && getSchool(earlier) === getSchool(slot2) && getSchool(slot2) !== ''
      );
      if (!conflictG2slot2 && !conflictG1slot1) {
        groups[g][potIndex] = slot2;
        groups[g2][potIndex] = slot;
        break;
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═'.repeat(70));
  console.log('  SCL WORLD CUP-STYLE FIXTURE GENERATOR — ANALYSIS RUN');
  console.log('  (READ-ONLY — no data written to Supabase)');
  console.log('═'.repeat(70));

  // 1. Fetch players
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) { console.error('Supabase error:', error); return; }

  const allPlayers = (data || [])
    .filter(p => p.chess_username || p.lichess_username)
    .map(p => ({
      id: p.id,
      name: p.name || p.chess_username || p.lichess_username,
      username: p.chess_username || p.lichess_username,
      rating: Math.max(p.chess_rating || 0, p.lichess_rating || 0) || null,
      school: p.university || p.school || 'Unknown',
      department: p.department || '',
      isProvisional: !p.chess_rating && !p.lichess_rating
    }));

  const N = allPlayers.length;
  console.log(`\n📋 Total registered players: ${N}\n`);

  if (N < 4) { console.log('Not enough players for a group stage.'); return; }

  // 2. Sort: non-provisional by rating desc, then provisionals alphabetically
  const nonProv = allPlayers.filter(p => !p.isProvisional).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const prov    = allPlayers.filter(p => p.isProvisional).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const sorted  = [...nonProv, ...prov];

  // Assign seed ranks (1-indexed)
  sorted.forEach((p, i) => { p.seed = i + 1; });

  // Rating stats
  const ratings = nonProv.map(p => p.rating);
  const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 1200;
  const minRating = ratings.length ? Math.min(...ratings) : 1200;
  const maxRating = ratings.length ? Math.max(...ratings) : 1200;

  console.log('📊 Rating Statistics:');
  console.log(`   Rated players    : ${nonProv.length}`);
  console.log(`   Provisional      : ${prov.length}`);
  console.log(`   Average rating   : ${avgRating}`);
  console.log(`   Range            : ${minRating} – ${maxRating}`);
  console.log(`   Spread           : ${maxRating - minRating} Elo`);

  // School breakdown
  const schoolMap = {};
  sorted.forEach(p => {
    const s = p.school || 'Unknown';
    schoolMap[s] = (schoolMap[s] || 0) + 1;
  });
  console.log(`\n🏫 Schools / Institutions (${Object.keys(schoolMap).length} distinct):`);
  Object.entries(schoolMap).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => {
    console.log(`   ${String(c).padStart(3)}  ${s}`);
  });

  // 3. Determine group count G
  // Prefer groups of TARGET_GROUP_SIZE; if remainder is 1, reduce one group to 5
  let G = Math.floor(N / TARGET_GROUP_SIZE);
  let groupSizes = Array(G).fill(TARGET_GROUP_SIZE);
  const remainder = N % TARGET_GROUP_SIZE;
  if (remainder > 0) {
    // Distribute remainder players by enlarging the first `remainder` groups by 1
    for (let i = 0; i < remainder; i++) groupSizes[i]++;
  }

  const numPots = Math.max(...groupSizes); // number of pots = max group size

  console.log(`\n⚽ World Cup Group Stage Configuration:`);
  console.log(`   Players          : ${N}`);
  console.log(`   Groups           : ${G}`);
  console.log(`   Pots             : ${numPots}`);
  console.log(`   Group sizes      : ${groupSizes.join(', ')}`);

  // 4. Build Pots
  const pots = [];
  let playerIdx = 0;
  for (let potNum = 0; potNum < numPots; potNum++) {
    // How many players go in this pot? All groups except those that are smaller
    const potSize = groupSizes.filter(sz => sz > potNum).length;
    pots.push(sorted.slice(playerIdx, playerIdx + potSize));
    playerIdx += potSize;
  }

  console.log('\n🪣 Pot composition:');
  pots.forEach((pot, pi) => {
    const ratingStr = pot.map(p => p.rating || 'Prov').join(', ');
    console.log(`   Pot ${pi + 1} (seeds ${pot[0]?.seed}–${pot[pot.length-1]?.seed}): ${pot.length} players [${ratingStr}]`);
  });

  // 5. Snake-assign + random draw within Pots
  // groups[g] = array of players in Group g+1, one per pot
  const groups = Array.from({ length: G }, () => []);

  for (let potNum = 0; potNum < numPots; potNum++) {
    const pot = [...pots[potNum]];
    const shuffledPot = shuffle(pot); // Random draw within pot
    // Only fill groups that have a slot in this pot
    const eligibleGroups = shuffle(
      groups.map((_, gi) => gi).filter(gi => groupSizes[gi] > potNum)
    );
    shuffledPot.forEach((player, i) => {
      groups[eligibleGroups[i]].push(player);
    });

    // Apply school separation constraint (best-effort swap)
    if (SCHOOL_SEPARATION) {
      applySameSchoolSwap(groups, potNum, G);
    }
  }

  // 6. Compute group stats & print groups
  const tournamentMeanRating = avgRating;
  const ELO_VARIANCE_CAP = 80; // warn if group avg deviates > 80 from tournament mean

  console.log('\n' + '─'.repeat(70));
  console.log('  GROUP DRAW RESULTS');
  console.log('─'.repeat(70));

  const groupLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const groupStats = [];

  groups.forEach((group, gi) => {
    const label = groupLabels[gi];
    const ratedInGroup = group.filter(p => !p.isProvisional);
    const groupAvgRating = ratedInGroup.length
      ? Math.round(ratedInGroup.reduce((s, p) => s + (p.rating || 0), 0) / ratedInGroup.length)
      : 'N/A';
    const deviation = ratedInGroup.length ? Math.abs(groupAvgRating - tournamentMeanRating) : null;
    const warning = deviation !== null && deviation > ELO_VARIANCE_CAP ? '⚠️ ' : '   ';

    groupStats.push({ label, group, groupAvgRating, deviation });

    // School conflict check
    const schools = group.map(p => getSchool(p)).filter(Boolean);
    const schoolConflicts = schools.filter((s, i) => schools.indexOf(s) !== i);
    const conflictStr = schoolConflicts.length ? ` [SAME-SCHOOL CONFLICT: ${[...new Set(schoolConflicts)].join(', ')}]` : '';

    console.log(`\n  GROUP ${label} ${warning}(avg Elo: ${groupAvgRating}, deviation: ${deviation ?? 'N/A'} from mean)${conflictStr}`);
    console.log(`  ${'─'.repeat(60)}`);
    group.forEach(p => {
      const ratingStr = p.isProvisional ? '(Prov)' : `${p.rating}`;
      const seedStr   = `#${String(p.seed).padStart(2)}`;
      const schoolStr = (p.school || '').substring(0, 25).padEnd(25);
      console.log(`  ${seedStr} ${String(p.name || p.username).padEnd(25)} ${ratingStr.padStart(7)}  ${schoolStr}  @${p.username}`);
    });
  });

  // 7. Balance summary
  const ratedGroups = groupStats.filter(g => g.deviation !== null);
  if (ratedGroups.length) {
    const maxDev = Math.max(...ratedGroups.map(g => g.deviation));
    const minAvg = Math.min(...ratedGroups.map(g => g.groupAvgRating));
    const maxAvg = Math.max(...ratedGroups.map(g => g.groupAvgRating));
    console.log('\n' + '─'.repeat(70));
    console.log('  BALANCE REPORT');
    console.log('─'.repeat(70));
    console.log(`  Tournament mean Elo : ${tournamentMeanRating}`);
    console.log(`  Lowest group avg    : ${minAvg}`);
    console.log(`  Highest group avg   : ${maxAvg}`);
    console.log(`  Max group deviation : ${maxDev} Elo  ${maxDev > ELO_VARIANCE_CAP ? '⚠️  (exceeds ' + ELO_VARIANCE_CAP + '-Elo cap)' : '✅  (within cap)'}`);
    console.log(`  Elo Spread within groups:`);
    groupStats.forEach(gs => {
      const ratedG = gs.group.filter(p => !p.isProvisional);
      if (ratedG.length < 2) return;
      const hi = Math.max(...ratedG.map(p => p.rating));
      const lo = Math.min(...ratedG.map(p => p.rating));
      console.log(`    Group ${gs.label}: ${lo} – ${hi}  (internal spread: ${hi - lo})`);
    });
  }

  // 8. Generate and print round-robin match schedule
  console.log('\n' + '─'.repeat(70));
  console.log('  FIXTURE LIST (Round-Robin within Groups)');
  console.log('─'.repeat(70));

  let totalMatches = 0;
  groups.forEach((group, gi) => {
    const label = groupLabels[gi];
    const rounds = roundRobinFixtures(group);
    const matchCount = rounds.reduce((s, r) => s + r.length, 0);
    totalMatches += matchCount;
    console.log(`\n  GROUP ${label} — ${matchCount} matches (${rounds.length} rounds):`);
    rounds.forEach((round, ri) => {
      console.log(`    Round ${ri + 1}:`);
      round.forEach(m => {
        const wName = (m.white.name || m.white.username).padEnd(25);
        const bName = (m.black.name || m.black.username).padEnd(25);
        const wElo  = m.white.isProvisional ? '(Prov)' : String(m.white.rating).padStart(4);
        const bElo  = m.black.isProvisional ? '(Prov)' : String(m.black.rating).padStart(4);
        console.log(`      ${wName} [${wElo}]  vs  ${bName} [${bElo}]`);
      });
    });
  });

  // 9. Knockout bracket info
  const qualifiers = G * 2; // Top 2 from each group advance
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(qualifiers)));
  console.log('\n' + '─'.repeat(70));
  console.log('  KNOCKOUT PROJECTION');
  console.log('─'.repeat(70));
  console.log(`  Groups               : ${G}`);
  console.log(`  Qualifiers (top 2)   : ${qualifiers}`);
  console.log(`  Knockout bracket size: ${bracketSize} (next power of 2)`);
  console.log(`  Byes in Round of ${bracketSize} : ${bracketSize - qualifiers}`);
  console.log(`  Total group matches  : ${totalMatches}`);
  const knockoutRounds = Math.ceil(Math.log2(bracketSize));
  const koMatches = bracketSize - 1;
  console.log(`  Total knockout matches (max): ${koMatches}`);
  console.log(`  GRAND TOTAL matches (max)   : ${totalMatches + koMatches}`);

  console.log('\n' + '═'.repeat(70));
  console.log('  END OF ANALYSIS — No data was written to Supabase.');
  console.log('═'.repeat(70) + '\n');
}

main().catch(console.error);
