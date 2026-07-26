/**
 * seed_july_2026.js — One-shot script to generate and upload July 2026 fixtures.
 *
 * Generates a World Cup-style group stage (14 groups of 4) from all current
 * registered players and upserts the tournament row to Supabase.
 *
 * Usage: node --input-type=module < scratch/seed_july_2026.js
 * Safe to re-run — upsert is idempotent.
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

// ── Inline copy of utility functions (so this script is self-contained) ───────

const getSchool = (p) => {
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
  return raw.substring(0, 20);
};

const MAX_ELO_SPREAD = 800;
const MAX_SWAP_ATTEMPTS = 50;
const WC_GROUP_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function fyShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getTournamentDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return Array.from({ length: 8 }, (_, i) => {
    const day = lastDay - 7 + i;
    return `${year}-${mm}-${String(day).padStart(2, '0')}`;
  });
}

function buildRoundRobin(players, groupLabel) {
  const pool = [...players];
  if (pool.length % 2 !== 0) pool.push(null);
  const n = pool.length;
  const fixtures = [];
  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const p1 = pool[i];
      const p2 = pool[n - 1 - i];
      if (!p1 || !p2) continue;
      const white = (r + i) % 2 === 0 ? p1 : p2;
      const black = white === p1 ? p2 : p1;
      fixtures.push({ roundIndex: r, groupLabel, white, black });
    }
    pool.splice(1, 0, pool.pop());
  }
  return fixtures;
}

function generateWorldCupFixtures(players, year, month) {
  const dates = getTournamentDates(year, month);

  const rated = players.filter(p => !p.isProvisional).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const prov  = players.filter(p =>  p.isProvisional).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const sorted = [...rated, ...prov];
  sorted.forEach((p, i) => { p._seed = i + 1; });

  const N = sorted.length;
  const G = Math.floor(N / 4);
  const rem = N % 4;
  const groupSizes = Array.from({ length: G }, (_, g) => g < rem ? 5 : 4);

  const pots = [];
  let cursor = 0;
  for (let p = 0; p < 4; p++) {
    const potSize = groupSizes.filter(sz => sz > p).length;
    pots.push(sorted.slice(cursor, cursor + potSize));
    cursor += potSize;
  }
  if (rem > 0 && cursor < sorted.length) pots.push(sorted.slice(cursor));

  const groups = Array.from({ length: G }, () => []);

  const activePots = pots.filter(pot => pot.length > 0);
  activePots.forEach((pot, potIdx) => {
    const shuffled = fyShuffle(pot);
    const eligible = fyShuffle(
      groups.map((_, gi) => gi).filter(gi => groups[gi].length === potIdx)
    );
    shuffled.forEach((player, i) => { groups[eligible[i]].push(player); });

    // School separation
    let swaps = 0, madeSwap = true;
    while (madeSwap && swaps < MAX_SWAP_ATTEMPTS) {
      madeSwap = false;
      for (let gi = 0; gi < G; gi++) {
        const slot = groups[gi][potIdx];
        if (!slot) continue;
        const slotSchool = getSchool(slot);
        const conflict = groups[gi].slice(0, potIdx).some(e => getSchool(e) === slotSchool && slotSchool !== 'unknown');
        if (!conflict) continue;
        for (let gj = gi + 1; gj < G; gj++) {
          const other = groups[gj][potIdx];
          if (!other) continue;
          const otherSchool = getSchool(other);
          const newCGi = groups[gi].slice(0, potIdx).some(e => getSchool(e) === otherSchool && otherSchool !== 'unknown');
          const newCGj = groups[gj].slice(0, potIdx).some(e => getSchool(e) === slotSchool && slotSchool !== 'unknown');
          if (!newCGi && !newCGj) {
            groups[gi][potIdx] = other;
            groups[gj][potIdx] = slot;
            madeSwap = true; swaps++;
            break;
          }
        }
        if (madeSwap) break;
      }
    }

    // Elo spread cap
    if (potIdx >= 1) {
      for (let gi = 0; gi < G; gi++) {
        const grp = groups[gi].filter(Boolean);
        const rg = grp.filter(p => !p.isProvisional);
        if (rg.length < 2) continue;
        const hi = Math.max(...rg.map(p => p.rating || 0));
        const lo = Math.min(...rg.map(p => p.rating || 0));
        if (hi - lo <= MAX_ELO_SPREAD) continue;
        const culprit = groups[gi][potIdx];
        for (let gj = gi + 1; gj < G; gj++) {
          const candidate = groups[gj][potIdx];
          if (!candidate) continue;
          const after = [...grp.slice(0, -1), candidate].filter(p => !p.isProvisional);
          const nHi = Math.max(...after.map(p => p.rating || 0));
          const nLo = Math.min(...after.map(p => p.rating || 0));
          if (nHi - nLo < hi - lo) { groups[gi][potIdx] = candidate; groups[gj][potIdx] = culprit; break; }
        }
      }
    }
  });

  const NUM_RR_ROUNDS = 3;
  const roundFixtures = Array.from({ length: NUM_RR_ROUNDS }, () => []);
  groups.forEach((group, gi) => {
    const label = WC_GROUP_LABELS[gi];
    buildRoundRobin(group, label).forEach(({ roundIndex, groupLabel, white, black }) => {
      if (roundIndex < NUM_RR_ROUNDS) roundFixtures[roundIndex].push({ groupLabel, white, black });
    });
  });

  const rounds = roundFixtures.map((fixtures, ri) => {
    const roundNum = ri + 1;
    let gc = 1;
    return {
      roundNum,
      name: `Group Stage — Round ${roundNum}`,
      date: dates[ri] || dates[dates.length - 1],
      isGroupStage: true,
      games: fixtures.map(({ groupLabel, white, black }) => ({
        id: `G${groupLabel}_R${roundNum}_G${gc++}`,
        groupLabel,
        p1: white,
        p2: black,
        winner: null,
        gameLink: ''
      }))
    };
  });

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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🏆 July 2026 SCL Tournament — World Cup Fixture Generator');
  console.log('─'.repeat(60));

  // 1. Fetch players
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  if (profErr) { console.error('❌ Failed to fetch profiles:', profErr); process.exit(1); }

  const players = (profiles || [])
    .filter(p => p.chess_username || p.lichess_username)
    .map(p => ({
      id: p.id,
      name: p.name || p.chess_username || p.lichess_username,
      username: p.chess_username || p.lichess_username,
      rating: Math.max(p.chess_rating || 0, p.lichess_rating || 0) || null,
      school: (p.email === 'ekpeetengeabasi@gmail.com' || p.chess_username === 'Power_101') ? 'University of Uyo' : (p.university || p.school || 'Unknown'),
      department: (p.email === 'ekpeetengeabasi@gmail.com' || p.chess_username === 'Power_101') ? 'Electrical Engineering' : (p.department || ''),
      contact: p.contact || '',
      isProvisional: !p.chess_rating && !p.lichess_rating
    }));

  console.log(`✅ Fetched ${players.length} registered players`);

  // 2. Generate fixtures
  const { rounds, groups } = generateWorldCupFixtures(players, 2026, 7);
  const totalGames = rounds.reduce((s, r) => s + r.games.length, 0);

  console.log(`✅ Generated ${groups.length} groups, ${rounds.length} rounds, ${totalGames} games`);

  // 3. Print group summary
  console.log('\n📋 Group Draw:');
  groups.forEach(g => {
    const names = g.players.map(p => `${p.name} [${p.rating || 'Prov'}]`).join(', ');
    console.log(`  Group ${g.label} (avg ${g.avgRating || 'N/A'}): ${names}`);
  });

  // 4. Check if July 2026 tournament already exists
  const { data: existing } = await supabase
    .from('tournaments')
    .select('id, status, rounds')
    .eq('id', '2026-07')
    .maybeSingle();

  if (existing && existing.rounds && existing.rounds.length > 0) {
    const hasResults = existing.rounds.some(r => r.games?.some(g => g.winner));
    if (hasResults) {
      console.error('\n⚠️  July 2026 tournament already has logged results — aborting to prevent data loss.');
      console.error('   Delete the row manually in Supabase first if you want to regenerate.');
      process.exit(1);
    }
    console.log('\n⚠️  July 2026 tournament exists but has no results — overwriting fixtures...');
  } else {
    console.log('\n🆕 No existing July 2026 tournament — creating fresh...');
  }

  // 5. Upsert to Supabase
  const tournamentRow = {
    id: '2026-07',
    name: 'July 2026 SCL Tournament',
    month_year: '2026-07',
    status: 'active',
    players: players,
    rounds: rounds,
    groups: groups,
    winner: null
  };

  const { error: upsertErr } = await supabase
    .from('tournaments')
    .upsert(tournamentRow);

  if (upsertErr) {
    // groups column may not exist yet — try without it
    console.warn('⚠️  Upsert with groups column failed, trying without groups field...');
    console.warn('   Error:', upsertErr.message);
    const { error: upsertErr2 } = await supabase
      .from('tournaments')
      .upsert({ ...tournamentRow, groups: undefined });
    if (upsertErr2) {
      console.error('❌ Upsert failed:', upsertErr2);
      process.exit(1);
    }
    console.log('\n✅ Uploaded (without groups column — add it to the table if needed).');
  } else {
    console.log('\n✅ Successfully uploaded to Supabase!');
  }

  console.log('\n📊 Summary:');
  console.log(`   Tournament ID : 2026-07`);
  console.log(`   Status        : active`);
  console.log(`   Players       : ${players.length}`);
  console.log(`   Groups        : ${groups.length}`);
  console.log(`   Rounds        : ${rounds.length} (group stage)`);
  console.log(`   Total games   : ${totalGames}`);
  console.log('\n🎉 Done! Landing page will now show July 2026 group pairings.');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
