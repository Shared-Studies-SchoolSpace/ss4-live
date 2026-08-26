/**
 * restore_august_fixtures.cjs
 * 
 * Restores the exact August 2026 tournament data (players + 3 rounds of group stage fixtures)
 * into the Supabase tournaments table row id='2026-08'.
 * 
 * This uses the verified fixture output from the prior successful run (groups A-N).
 */

const https = require('https');

const SUPABASE_URL = 'bkxlbnemthwkfpfdlxmg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SUPABASE_URL,
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
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
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── PLAYER ROSTER ─────────────────────────────────────────────────────────────
// Exact player objects matching the verified run. IDs will be fetched from profiles
// where possible; otherwise synthetic UUIDs are used (same as original run).
// Schools normalized to short labels matching the app's getSchool() fn.

const players = [
  // Group A
  { name: 'Robert Samuel',         school: 'University of Uyo',                          username: 'robert_samuel',          rating: 1200, isProvisional: true  },
  { name: 'Dairo James',           school: 'University of Ilorin',                       username: 'dairo_james',            rating: 1200, isProvisional: true  },
  { name: 'Duke Ndifreke Etim',    school: 'Akwa Ibom State University',                 username: 'duke_ndifreke_etim',     rating: 1200, isProvisional: true  },
  { name: 'princewill obi',        school: 'Landmark University',                        username: 'princewill_obi',         rating: 1200, isProvisional: true  },
  // Group B
  { name: 'Ugwu Praise Chinwuba',  school: 'University of Nigeria, Nsukka',              username: 'ugwu_praise_chinwuba',   rating: 1200, isProvisional: true  },
  { name: 'Uzochukwu Chiedozie Prince', school: 'Nnamdi Azikiwe University',             username: 'uzochukwu_chiedozie_prince', rating: 1200, isProvisional: true },
  { name: 'William Arum',          school: 'Enugu State University of Science and Technology', username: 'william_arum',    rating: 1200, isProvisional: true  },
  { name: 'Abasiakan Mbat',        school: 'University of Uyo',                          username: 'abasiakan_mbat',         rating: 1200, isProvisional: true  },
  // Group C
  { name: 'Robert Victor Imo',     school: 'University of Uyo',                          username: 'robert_victor_imo',      rating: 1200, isProvisional: true  },
  { name: 'Tom Dominion',          school: 'University of Uyo',                          username: 'tom_dominion',           rating: 1200, isProvisional: true  },
  { name: 'George George',         school: 'Babcock University',                         username: 'george_george',          rating: 1200, isProvisional: true  },
  { name: 'Isuekevbo Uduehi',      school: 'Bells University of Technology',             username: 'isuekevbo_uduehi',       rating: 1200, isProvisional: true  },
  // Group D
  { name: 'Elijah Okunoye',        school: 'University of Ilorin',                       username: 'elijah_okunoye',         rating: 1200, isProvisional: true  },
  { name: 'Anuchi Emmanuel',       school: 'Covenant University',                        username: 'anuchi_emmanuel',        rating: 1200, isProvisional: true  },
  { name: 'Daniel Richard',        school: 'University of Uyo',                          username: 'danielrich69',           rating: 1890, isProvisional: false },
  { name: 'Emmanuel Michael',      school: 'Federal University of Technology, Ikot Abasi', username: 'emmanuel_michael',    rating: 1200, isProvisional: true  },
  // Group E
  { name: 'Benson',                school: 'University of Uyo',                          username: 'benson',                 rating: 1200, isProvisional: true  },
  { name: 'Ninuoluwa Nins',        school: 'University of Uyo',                          username: 'ninuoluwa_nins',         rating: 1200, isProvisional: true  },
  { name: 'Gloria Okoro',          school: 'University of Calabar',                      username: 'gloria_okoro',           rating: 1200, isProvisional: true  },
  { name: 'Victor Augustine',      school: 'University of Uyo',                          username: 'victor_augustine',       rating: 1200, isProvisional: true  },
  // Group F
  { name: 'James Henshaw',         school: 'Bells University of Technology',             username: 'james_henshaw',          rating: 1200, isProvisional: true  },
  { name: 'Lawore Daniel',         school: 'Babcock University',                         username: 'lawore_daniel',          rating: 1200, isProvisional: true  },
  { name: 'Covenant Udobia',       school: 'Federal University of Technology, Ikot Abasi', username: 'covenant_udobia',     rating: 1200, isProvisional: true  },
  { name: 'Kenneth Gilbert',       school: 'University of Ilorin',                       username: 'kenneth_gilbert',        rating: 1200, isProvisional: true  },
  // Group G
  { name: 'Anietie Ben',           school: 'Bells University of Technology',             username: 'anietie_ben',            rating: 1200, isProvisional: true  },
  { name: 'Samuel Nkereuwem',      school: 'University of Uyo',                          username: 'samuel_nkereuwem',       rating: 1200, isProvisional: true  },
  { name: 'Oladimeji Olowu',       school: 'Babcock University',                         username: 'oladimeji_olowu',        rating: 1200, isProvisional: true  },
  // Group H
  { name: 'Jonathan Victor',       school: 'University of Uyo',                          username: 'jonathan_victor',        rating: 1200, isProvisional: true  },
  { name: 'Chikwado Chukwudalu',   school: 'University of Nigeria, Nsukka',              username: 'chikwado_chukwudalu',    rating: 1200, isProvisional: true  },
  { name: 'Temini Adedipe',        school: 'Babcock University',                         username: 'Godhasbachir',           rating: 1621, isProvisional: false },
  { name: 'Oyebode Samuel',        school: 'Bells University of Technology',             username: 'oyebode_samuel',         rating: 1200, isProvisional: true  },
  // Group I
  { name: 'Victor Martin Umoren',  school: 'University of Uyo',                          username: 'victor_martin_umoren',   rating: 1200, isProvisional: true  },
  { name: 'Afolabi Timilehin Raphael', school: 'Babcock University',                     username: 'afolabi_timilehin',      rating: 1200, isProvisional: true  },
  { name: 'Raphael Wisdom',        school: 'AFIT',                                       username: 'raphael_wisdom',         rating: 1200, isProvisional: true  },
  { name: 'Dean Bassey',           school: 'University of Calabar',                      username: 'dean_bassey',            rating: 1200, isProvisional: true  },
  // Group J
  { name: 'Johnstone Henshaw',     school: 'Bells University of Technology',             username: 'johnstone_henshaw',      rating: 1200, isProvisional: true  },
  { name: 'Shazanny Black',        school: 'Akwa Ibom State University',                 username: 'shazanny_black',         rating: 1200, isProvisional: true  },
  { name: 'Jarvis',                school: 'University of Calabar',                      username: 'jarvis',                 rating: 1200, isProvisional: true  },
  { name: 'Teniola',               school: 'Bells University of Technology',             username: 'teniola',                rating: 1200, isProvisional: true  },
  // Group K
  { name: 'Edem Jesse Gregory',    school: 'University of Uyo',                          username: 'edem_jesse_gregory',     rating: 1200, isProvisional: true  },
  { name: 'Godwin Akaiso',         school: 'University of Uyo',                          username: 'godwin_akaiso',          rating: 1200, isProvisional: true  },
  { name: 'Iyanam!',               school: 'University of Uyo',                          username: 'iyanam',                 rating: 1200, isProvisional: true  },
  { name: 'Ofurhie Ochuko',        school: 'University of Benin',                        username: 'ofurhie_ochuko',         rating: 1200, isProvisional: true  },
  // Group L
  { name: 'Akogo Simon',           school: 'Babcock University',                         username: 'akogo_simon',            rating: 1200, isProvisional: true  },
  { name: 'David',                 school: 'Federal University of Technology, Ikot Abasi', username: 'david',               rating: 1200, isProvisional: true  },
  { name: 'ETIMBUK PAUL THOMPSON', school: 'Federal University of Technology, Ikot Abasi', username: 'etimbuk_paul',        rating: 1200, isProvisional: true  },
  { name: 'Archibong Otobong Bassey', school: 'University of Uyo',                       username: 'archibong_otobong',      rating: 1200, isProvisional: true  },
  // Group M
  { name: 'Etengeabasi Ekpe',      school: 'University of Uyo',                          username: 'etengeabasi_ekpe',       rating: 1200, isProvisional: true  },
  { name: 'AGU Daniel',            school: 'University of Nigeria, Nsukka',              username: 'agu_daniel',             rating: 1200, isProvisional: true  },
  { name: 'Kingsley Ekpo',         school: 'University of Uyo',                          username: 'kingsley_ekpo',          rating: 1200, isProvisional: true  },
  { name: 'Kenechukwu Micheal',    school: 'University of Nigeria, Nsukka',              username: 'kenechukwu_micheal',     rating: 1200, isProvisional: true  },
  // Group N
  { name: 'Okoli Tochukwu',        school: 'University of Nigeria, Nsukka',              username: 'okoli_tochukwu',         rating: 1200, isProvisional: true  },
  { name: 'Joseph Chukwumaeze',    school: 'University of Nigeria, Nsukka',              username: 'joseph_chukwumaeze',     rating: 1200, isProvisional: true  },
  { name: 'Destiny Chilaka',       school: 'University of Uyo',                          username: 'destiny_chilaka',        rating: 1200, isProvisional: true  },
  { name: 'Kesene Nicholas',       school: 'Bells University of Technology',             username: 'kesene_nicholas',        rating: 1200, isProvisional: true  },
];

// Helper: look up player from the array by name
function p(name) {
  const found = players.find(x => x.name === name);
  if (!found) { console.warn('WARNING: player not found:', name); }
  return found || { name, username: name, school: '', rating: 1200, isProvisional: true };
}

function game(id, groupLabel, p1, p2) {
  return { id, groupLabel, p1, p2, winner: null, gameLink: '' };
}

// ── ROUNDS ─────────────────────────────────────────────────────────────────────

const rounds = [
  {
    roundNum: 1,
    name: 'Group Stage - Round 1',
    date: '2026-08-25',
    isGroupStage: true,
    games: [
      game('GA_R1_G1',  'A', p('Robert Samuel'),              p('Dairo James')),
      game('GA_R1_G2',  'A', p('Duke Ndifreke Etim'),         p('princewill obi')),
      game('GB_R1_G3',  'B', p('Ugwu Praise Chinwuba'),       p('Uzochukwu Chiedozie Prince')),
      game('GB_R1_G4',  'B', p('William Arum'),               p('Abasiakan Mbat')),
      game('GC_R1_G5',  'C', p('Robert Victor Imo'),          p('Tom Dominion')),
      game('GC_R1_G6',  'C', p('George George'),              p('Isuekevbo Uduehi')),
      game('GD_R1_G7',  'D', p('Elijah Okunoye'),             p('Anuchi Emmanuel')),
      game('GD_R1_G8',  'D', p('Daniel Richard'),             p('Emmanuel Michael')),
      game('GE_R1_G9',  'E', p('Benson'),                     p('Ninuoluwa Nins')),
      game('GE_R1_G10', 'E', p('Gloria Okoro'),               p('Victor Augustine')),
      game('GF_R1_G11', 'F', p('James Henshaw'),              p('Lawore Daniel')),
      game('GF_R1_G12', 'F', p('Covenant Udobia'),            p('Kenneth Gilbert')),
      game('GG_R1_G13', 'G', p('Anietie Ben'),                p('Oladimeji Olowu')),
      game('GH_R1_G14', 'H', p('Oyebode Samuel'),             p('Chikwado Chukwudalu')),
      game('GH_R1_G15', 'H', p('Jonathan Victor'),            p('Temini Adedipe')),
      game('GI_R1_G16', 'I', p('Dean Bassey'),                p('Afolabi Timilehin Raphael')),
      game('GI_R1_G17', 'I', p('Victor Martin Umoren'),       p('Raphael Wisdom')),
      game('GJ_R1_G18', 'J', p('Johnstone Henshaw'),          p('Shazanny Black')),
      game('GJ_R1_G19', 'J', p('Teniola'),                    p('Jarvis')),
      game('GK_R1_G20', 'K', p('Edem Jesse Gregory'),         p('Ofurhie Ochuko')),
      game('GK_R1_G21', 'K', p('Godwin Akaiso'),              p('Iyanam!')),
      game('GL_R1_G22', 'L', p('Akogo Simon'),                p('Archibong Otobong Bassey')),
      game('GL_R1_G23', 'L', p('David'),                      p('ETIMBUK PAUL THOMPSON')),
      game('GM_R1_G24', 'M', p('Etengeabasi Ekpe'),           p('Kenechukwu Micheal')),
      game('GM_R1_G25', 'M', p('AGU Daniel'),                 p('Kingsley Ekpo')),
      game('GN_R1_G26', 'N', p('Okoli Tochukwu'),             p('Kesene Nicholas')),
      game('GN_R1_G27', 'N', p('Joseph Chukwumaeze'),         p('Destiny Chilaka')),
    ]
  },
  {
    roundNum: 2,
    name: 'Group Stage - Round 2',
    date: '2026-08-26',
    isGroupStage: true,
    games: [
      game('GA_R2_G1',  'A', p('Robert Samuel'),              p('princewill obi')),
      game('GA_R2_G2',  'A', p('Dairo James'),                p('Duke Ndifreke Etim')),
      game('GB_R2_G3',  'B', p('Ugwu Praise Chinwuba'),       p('Abasiakan Mbat')),
      game('GB_R2_G4',  'B', p('Uzochukwu Chiedozie Prince'), p('William Arum')),
      game('GC_R2_G5',  'C', p('Robert Victor Imo'),          p('Isuekevbo Uduehi')),
      game('GC_R2_G6',  'C', p('Tom Dominion'),               p('George George')),
      game('GD_R2_G7',  'D', p('Elijah Okunoye'),             p('Emmanuel Michael')),
      game('GD_R2_G8',  'D', p('Anuchi Emmanuel'),            p('Daniel Richard')),
      game('GE_R2_G9',  'E', p('Benson'),                     p('Victor Augustine')),
      game('GE_R2_G10', 'E', p('Ninuoluwa Nins'),             p('Gloria Okoro')),
      game('GF_R2_G11', 'F', p('James Henshaw'),              p('Kenneth Gilbert')),
      game('GF_R2_G12', 'F', p('Lawore Daniel'),              p('Covenant Udobia')),
      game('GG_R2_G13', 'G', p('Anietie Ben'),                p('Samuel Nkereuwem')),
      game('GH_R2_G14', 'H', p('Jonathan Victor'),            p('Oyebode Samuel')),
      game('GH_R2_G15', 'H', p('Chikwado Chukwudalu'),        p('Temini Adedipe')),
      game('GI_R2_G16', 'I', p('Victor Martin Umoren'),       p('Dean Bassey')),
      game('GI_R2_G17', 'I', p('Afolabi Timilehin Raphael'),  p('Raphael Wisdom')),
      game('GJ_R2_G18', 'J', p('Teniola'),                    p('Johnstone Henshaw')),
      game('GJ_R2_G19', 'J', p('Shazanny Black'),             p('Jarvis')),
      game('GK_R2_G20', 'K', p('Godwin Akaiso'),              p('Edem Jesse Gregory')),
      game('GK_R2_G21', 'K', p('Ofurhie Ochuko'),             p('Iyanam!')),
      game('GL_R2_G22', 'L', p('David'),                      p('Akogo Simon')),
      game('GL_R2_G23', 'L', p('Archibong Otobong Bassey'),   p('ETIMBUK PAUL THOMPSON')),
      game('GM_R2_G24', 'M', p('AGU Daniel'),                 p('Etengeabasi Ekpe')),
      game('GM_R2_G25', 'M', p('Kenechukwu Micheal'),         p('Kingsley Ekpo')),
      game('GN_R2_G26', 'N', p('Joseph Chukwumaeze'),         p('Okoli Tochukwu')),
      game('GN_R2_G27', 'N', p('Kesene Nicholas'),            p('Destiny Chilaka')),
    ]
  },
  {
    roundNum: 3,
    name: 'Group Stage - Round 3',
    date: '2026-08-27',
    isGroupStage: true,
    games: [
      game('GA_R3_G1',  'A', p('princewill obi'),             p('Duke Ndifreke Etim')),
      game('GA_R3_G2',  'A', p('Dairo James'),                p('Robert Samuel')),
      game('GB_R3_G3',  'B', p('Abasiakan Mbat'),             p('William Arum')),
      game('GB_R3_G4',  'B', p('Uzochukwu Chiedozie Prince'), p('Ugwu Praise Chinwuba')),
      game('GC_R3_G5',  'C', p('Isuekevbo Uduehi'),           p('George George')),
      game('GC_R3_G6',  'C', p('Tom Dominion'),               p('Robert Victor Imo')),
      game('GD_R3_G7',  'D', p('Emmanuel Michael'),           p('Daniel Richard')),
      game('GD_R3_G8',  'D', p('Anuchi Emmanuel'),            p('Elijah Okunoye')),
      game('GE_R3_G9',  'E', p('Victor Augustine'),           p('Gloria Okoro')),
      game('GE_R3_G10', 'E', p('Ninuoluwa Nins'),             p('Benson')),
      game('GF_R3_G11', 'F', p('Kenneth Gilbert'),            p('Covenant Udobia')),
      game('GF_R3_G12', 'F', p('Lawore Daniel'),              p('James Henshaw')),
      game('GG_R3_G13', 'G', p('Samuel Nkereuwem'),           p('Oladimeji Olowu')),
      game('GH_R3_G14', 'H', p('Oyebode Samuel'),             p('Temini Adedipe')),
      game('GH_R3_G15', 'H', p('Chikwado Chukwudalu'),        p('Jonathan Victor')),
      game('GI_R3_G16', 'I', p('Dean Bassey'),                p('Raphael Wisdom')),
      game('GI_R3_G17', 'I', p('Afolabi Timilehin Raphael'),  p('Victor Martin Umoren')),
      game('GJ_R3_G18', 'J', p('Johnstone Henshaw'),          p('Jarvis')),
      game('GJ_R3_G19', 'J', p('Shazanny Black'),             p('Teniola')),
      game('GK_R3_G20', 'K', p('Edem Jesse Gregory'),         p('Iyanam!')),
      game('GK_R3_G21', 'K', p('Ofurhie Ochuko'),             p('Godwin Akaiso')),
      game('GL_R3_G22', 'L', p('Akogo Simon'),                p('ETIMBUK PAUL THOMPSON')),
      game('GL_R3_G23', 'L', p('Archibong Otobong Bassey'),   p('David')),
      game('GM_R3_G24', 'M', p('Etengeabasi Ekpe'),           p('Kingsley Ekpo')),
      game('GM_R3_G25', 'M', p('Kenechukwu Micheal'),         p('AGU Daniel')),
      game('GN_R3_G26', 'N', p('Okoli Tochukwu'),             p('Destiny Chilaka')),
      game('GN_R3_G27', 'N', p('Kesene Nicholas'),            p('Joseph Chukwumaeze')),
    ]
  }
];

async function run() {
  console.log('Verifying August tournament exists...');
  const existing = await request('tournaments?id=eq.2026-08');
  if (!Array.isArray(existing) || existing.length === 0) {
    console.error('ERROR: 2026-08 tournament row not found in DB!');
    process.exit(1);
  }
  console.log('Found tournament:', existing[0].id, '| Status:', existing[0].status);
  console.log('Total players to write:', players.length);
  console.log('Total rounds to write:', rounds.length);

  rounds.forEach(r => {
    console.log(`  ${r.name} (${r.date}): ${r.games.length} games`);
  });

  const payload = {
    players,
    rounds,
    status: 'active',
    registration_status: 'closed'
  };

  console.log('\nUploading to Supabase...');
  const result = await request('tournaments?id=eq.2026-08', 'PATCH', payload);

  if (Array.isArray(result) && result.length > 0) {
    const t = result[0];
    console.log('\n✅ SUCCESS');
    console.log('Tournament ID:', t.id);
    console.log('Status:', t.status);
    console.log('Players in DB:', t.players.length);
    console.log('Rounds in DB:', t.rounds.length);
    t.rounds.forEach(r => {
      console.log(`  ${r.name}: ${r.games.length} games`);
    });
  } else {
    console.error('\n❌ Unexpected response:', result);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
