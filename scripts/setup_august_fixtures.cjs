const https = require('https');
const crypto = require('crypto');

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'bkxlbnemthwkfpfdlxmg.supabase.co',
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const inputNames = [
  { name: 'Victor Martin Umoren', school: 'University of Uyo' },
  { name: 'Kingsley Ekpo', school: 'University of Uyo' },
  { name: 'Anietie Ben', school: 'Bells University of Technology' },
  { name: 'Edem, Jesse Gregory', school: 'University of Uyo' },
  { name: 'William Arum', school: 'Enugu State University of Science and Technology' },
  { name: 'ETIMBUK PAUL THOMPSON', school: 'Federal University of Technology, Ikot Abasi' },
  { name: 'Uzochukwu Chiedozie Prince', school: 'Nnamdi Azikiwe University' },
  { name: 'Covenant Udobia', school: 'Federal University of Technology, Ikot Abasi' },
  // Batista Effontery explicitly EXCLUDED per prompt instruction
  { name: 'Kenneth Gilbert', school: 'University of Ilorin' },
  { name: 'Elijah Okunoye', school: 'University of Ilorin' },
  { name: 'Robert Samuel', school: 'University of Uyo' },
  { name: 'Dean Bassey', school: 'University of Calabar' },
  { name: 'Victor Augustine', school: 'University of Uyo' },
  { name: 'Shazanny Black', school: 'Akwa Ibom State University' },
  { name: 'Abasiakan Mbat', school: 'University of Uyo' },
  { name: 'AGU Daniel', school: 'University of Nigeria, Nsukka' },
  { name: 'Ugwu Praise Chinwuba', school: 'University of Nigeria, Nsukka' },
  { name: 'Emmanuel Michael', school: 'Federal University of Technology, Ikot Abasi' },
  { name: 'Joseph Chukwumaeze', school: 'University of Nigeria, Nsukka' },
  { name: 'Ninuoluwa Nins', school: 'University of Uyo' },
  { name: 'Duke Ndifreke Etim', school: 'Akwa Ibom State University' },
  { name: 'Oyebode Samuel', school: 'Bells University of Technology' },
  { name: 'princewill obi', school: 'Landmark University' },
  { name: 'Gloria Okoro', school: 'University of Calabar' },
  { name: 'David', school: 'Federal University of Technology, Ikot Abasi' },
  { name: 'Samuel Nkereuwem', school: 'University of Uyo' },
  { name: 'Johnstone Henshaw', school: 'Bells University of Technology' },
  { name: 'oladimeji olowu', school: 'Babcock university' },
  { name: 'Archibong Otobong Bassey', school: 'University of Uyo' },
  { name: 'Benson Amblessed Chinecherem', school: 'University of Uyo' },
  { name: 'James Henshaw', school: 'Bells University of Technology' },
  { name: 'Adedipe Temini', school: 'Babcock University' }, // MUST match Temini Adedipe / Godhasbachir, NOT Ade / Strav1k!
  { name: 'Afolabi Timilehin Raphael', school: 'Babcock University' },
  { name: 'Ubongabasi Iyanam', school: 'University of Uyo' },
  { name: 'Teniola', school: 'Bells University of Technology' },
  { name: 'Kesene Nicholas', school: 'Bells University of Technology' },
  { name: 'Ofurhie ochuko', school: 'University of Benin' },
  { name: 'Chikwado Chukwudalu', school: 'University of Nigeria, Nnsuka' },
  { name: 'Akogo Simon', school: 'Babcock University' },
  { name: 'Lawore Daniel', school: 'Babcock University' },
  { name: 'Okoli Tochukwu', school: 'University of Nigeria Nsukka' },
  { name: 'Etengeabasi Ekpe', school: 'University of Uyo' },
  { name: 'Dairo James', school: 'university of ilorin' },
  { name: 'Robert Victor', school: 'University of Uyo' },
  { name: 'Destiny Chilaka', school: 'University of Uyo' },
  { name: 'Daniel Richard', school: 'University of Uyo' },
  { name: 'Tom Dominion', school: 'University of Uyo' },
  { name: 'Raphael Wisdom', school: 'AFIT' },
  { name: 'Godwin Akaiso', school: 'Uniuyo' },
  { name: 'Jarvis', school: '' },
  { name: 'Jonathan Victor', school: 'University of Uyo' },
  { name: 'Isuekevbo Uduehi', school: 'Bells University of Technology' },
  { name: 'Kenechukwu Micheal', school: 'university of Nigeria nsukka' },
  { name: 'Anuchi Emmanuel', school: 'Covenant University' },
  { name: 'George George', school: 'Babcock University' }
];

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSchool(p) {
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
  if (/babcock/.test(raw)) return 'babcock';
  if (/university of ilorin|unilorin/.test(raw)) return 'unilorin';
  return raw.substring(0, 20);
}

function fyShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function generateGroupStage(players) {
  const WC_GROUP_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const rated = players.filter(p => !p.isProvisional).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const prov  = players.filter(p =>  p.isProvisional).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const sorted = [...rated, ...prov];
  sorted.forEach((p, i) => { p._seed = i + 1; });

  const N = sorted.length;
  const G = Math.ceil(N / 4);
  const rem = N % 4;
  const groupSizes = Array.from({ length: G }, (_, g) => g < rem ? 5 : 4);

  const pots = [];
  let cursor = 0;
  for (let p = 0; p < 4; p++) {
    const potSize = groupSizes.filter(sz => sz > p).length;
    pots.push(sorted.slice(cursor, cursor + potSize));
    cursor += potSize;
  }
  if (rem > 0 && cursor < sorted.length) {
    pots.push(sorted.slice(cursor));
  }

  const groups = Array.from({ length: G }, () => []);
  pots.filter(pot => pot.length > 0).forEach((pot, potIdx) => {
    const shuffled = fyShuffle(pot);
    const eligible = fyShuffle(
      groups.map((_, gi) => gi).filter(gi => groups[gi].length === potIdx)
    );
    shuffled.forEach((player, i) => {
      groups[eligible[i]].push(player);
    });
  });

  const NUM_RR_ROUNDS = 3;
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

  const dates = ['2026-08-25', '2026-08-26', '2026-08-27'];
  const rounds = roundFixtures.map((fixtures, ri) => {
    const roundNum = ri + 1;
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
      date: dates[ri],
      isGroupStage: true,
      games
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

async function run() {
  let profiles = await request('profiles?select=*');
  console.log('Original profiles count:', profiles.length);

  // Exact 55 tournament player objects created directly with precise profile matching
  const tournamentPlayers = inputNames.map((item) => {
    const normInput = normalize(item.name);

    // Filter out Ade / Strav1k explicitly if matching Adedipe Temini
    let profile = null;
    if (normInput.includes('adedipe') || normInput.includes('temini')) {
      profile = profiles.find(p => p.name === 'Temini Adedipe' || p.chess_username === 'Godhasbachir');
    } else {
      profile = profiles.find(p => normalize(p.name) === normInput);
      if (!profile) {
        profile = profiles.find(p => p.name !== 'Ade' && (normalize(p.name).includes(normInput) || normInput.includes(normalize(p.name))));
      }
    }

    const name = profile ? profile.name : item.name;
    const username = profile ? (profile.chess_username || profile.name) : item.name.replace(/\s+/g, '_');
    const rating = profile ? (profile.chess_rating || 1200) : 1200;

    return {
      id: profile ? profile.id : crypto.randomUUID(),
      name,
      username,
      phone: profile?.phone_number || profile?.phone || '',
      rating,
      school: profile?.university || item.school || '',
      department: profile?.department || '',
      isProvisional: rating === 1200
    };
  });

  console.log('Total registered players for August tournament:', tournamentPlayers.length);

  const checkAde = tournamentPlayers.find(p => p.name === 'Ade' || p.username === 'Strav1k');
  console.log('Ade / Strav1k in players list?:', !!checkAde);

  const checkTemini = tournamentPlayers.find(p => p.name.includes('Temini') || p.name.includes('Adedipe'));
  console.log('Temini Adedipe in players list:', checkTemini);

  // Generate Group Stage Fixtures
  const { rounds, groups } = generateGroupStage(tournamentPlayers);
  console.log(`Generated ${groups.length} groups and ${rounds.length} rounds.`);

  // Update Supabase tournaments table for id "2026-08"
  const updatePayload = {
    players: tournamentPlayers,
    rounds: rounds,
    status: 'active',
    registration_status: 'closed'
  };

  const updated = await request('tournaments?id=eq.2026-08', 'PATCH', updatePayload);
  console.log('Tournament update result:', Array.isArray(updated) && updated.length > 0 ? 'SUCCESS' : updated);
}

run().catch(err => {
  console.error('Error running setup:', err);
});
