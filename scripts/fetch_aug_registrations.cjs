/**
 * fetch_aug_registrations.cjs
 * Fetches users who created accounts between Aug 18-19 2026 from Supabase,
 * cross-references with the tournament phone directory, and outputs
 * a new 'Alte Registrations' list.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://bkxlbnemthwkfpfdlxmg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k';

// Aug 18 00:00:00 UTC to Aug 19 23:59:59 UTC
const DATE_FROM = '2026-08-18T00:00:00.000Z';
const DATE_TO   = '2026-08-19T23:59:59.999Z';

function supabaseRequest(path, params = {}) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const fullPath = `/rest/v1/${path}${query ? '?' + query : ''}`;
    const options = {
      hostname: 'bkxlbnemthwkfpfdlxmg.supabase.co',
      path: fullPath,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data, raw: true });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Phone directory data from tournament_players_phone_numbers.txt
// (unique players with phone numbers)
const phoneDirectory = {
  'Martin_The': { name: 'Victor Martin Umoren', phone: 'N/A' },
  'Kontor001': { name: 'Kingsley Ekpo', phone: '+234 906 051 5456' },
  'Jude_Ben': { name: 'Anietie Ben', phone: '+234 806 307 1862' },
  'Jesse70256': { name: 'Edem, Jesse Gregory', phone: '+234 814 507 4849' },
  'Lilshadys': { name: 'William Arum', phone: '+234 913 632 6622' },
  'Bayron-sage7': { name: 'ETIMBUK PAUL THOMPSON', phone: '+234 701 565 0278' },
  'Princedoziee': { name: 'Uzochukwu chiedozie prince', phone: '+234 704 598 1381' },
  'Anonix_01': { name: 'Covenant Udobia', phone: 'N/A' },
  'GeneralRal': { name: 'Batista Effontery', phone: '+234 905 608 5216' },
  'Prince_of_pieceX': { name: 'Kenneth Gilbert', phone: '+234 913 159 2008' },
  'Elijah_eao': { name: 'Elijah Okunoye', phone: 'N/A' },
  'Unclesam34e': { name: 'Robert Samuel', phone: '+234 806 475 5213' },
  'deanbassey001': { name: 'Dean Bassey', phone: '+234 706 445 2708' },
  'victoraugustine': { name: 'Victor Augustine', phone: '+234 707 172 4882' },
  'Shazanny-112': { name: 'Shazanny Black', phone: '+234 704 638 3887' },
  'basky09': { name: 'Abasiakan Mbat', phone: 'N/A' },
  'Yari-bem': { name: 'AGU Daniel', phone: 'N/A' },
  'PraiseChinwuba': { name: 'Ugwu Praise Chinwuba', phone: '+234 704 926 9211' },
  'Ikbeast1': { name: 'Emmanuel Michael', phone: '+234 906 710 7943' },
  'joeblaq104': { name: 'Joseph Chukwumaeze', phone: '+234 803 397 9096' },
  'Ninuoluwa': { name: 'Ninuoluwa Nins', phone: '+234 816 798 8323' },
  'Duke-001': { name: 'Duke Ndifreke Etim', phone: '+234 708 529 5795' },
  'TheWeehfhi': { name: 'Oyebode Samuel', phone: '+234 816 944 2714' },
  'Mathemachesser-the-GOAT': { name: 'princewill obi', phone: 'N/A' },
  'Gloria0726': { name: 'Gloria Okoro', phone: 'N/A' },
  'Davidbarakaii': { name: 'David', phone: '+234 704 178 3383' },
  'Fulgent47': { name: 'Samuel Nkereuwem', phone: '+234 902 971 0550' },
  'Shin_12': { name: 'Johnstone Henshaw', phone: '+234 708 406 4561' },
  'olatunjijeremiah': { name: 'Olatunjijeremiah', phone: 'N/A' },
  'Bolouaweri': { name: 'Ado Bolouaweri Samuel', phone: 'N/A' },
  'Alexrichy19': { name: 'Alex Richard', phone: 'N/A' },
  'Yoyo1513': { name: 'Raphael wisdom', phone: 'N/A' },
  'danielrich69': { name: 'Daniel Richard', phone: '+234 814 502 1780' },
  'Bestmvh': { name: 'Best James', phone: 'N/A' },
  'Kidd9h': { name: 'Robert Victor Imo', phone: '+234 705 523 4409' },
  'Blozisom1': { name: 'Blossom AMAETOR', phone: 'N/A' },
  'D_Resign_Gambit': { name: 'Teniola', phone: 'N/A' },
  'Karyptus': { name: 'Chris Emmanuel Etim', phone: '+234 916 863 6887' },
  'ajv1510': { name: 'Victor Ani-Joseph', phone: 'N/A' },
  'scorpiochicago1': { name: 'Vincent Clement Effiong', phone: 'N/A' },
  'HAKAI_026': { name: 'Okoli Tochukwu', phone: 'N/A' },
  'kingiyanam': { name: 'Iyanam!', phone: '+234 704 631 7575' },
  'Imblesseddy': { name: 'Edidiong Okoro', phone: 'N/A' },
  'Savlast': { name: 'Saviour Ibok', phone: 'N/A' },
  'WS-MIC-HAEL': { name: 'Sunny', phone: '+234 907 929 9847' },
  'NobbieFF': { name: 'Jarvis', phone: '+234 806 930 7996' },
  'jonzing200': { name: 'Jonathan Victor', phone: '+234 812 817 3134' },
  'chilax333': { name: 'Destiny Chilaka', phone: '+234 813 973 2276' },
  'Zilla065': { name: 'José Akpan', phone: 'N/A' },
  'Picklerick-24': { name: 'Pickle Rick', phone: 'N/A' },
  'Inimfon_67': { name: 'Inimfon Akpan', phone: '+234 913 609 8015' },
  '21stPhenom': { name: 'Enoch Isaac', phone: 'N/A' },
  'Master': { name: 'Prince Betiang', phone: 'N/A' },
  'milly_2872': { name: 'Raphael Anyorikyo', phone: 'N/A' },
  'Dara-veldora': { name: 'Edara-Abasi Nnyanga Akpan', phone: 'N/A' },
  'Emmaculate': { name: 'Idorenyin Emmanuel', phone: 'N/A' },
  'Kg_flames': { name: 'Faith Uko', phone: 'N/A' },
  'BenG_22': { name: 'Benson', phone: 'N/A' },
  'Udohephraim': { name: 'Udoh, Ephraim', phone: 'N/A' },
  'gallfather': { name: 'Godwin Akaiso', phone: 'N/A' },
  'Checkmate': { name: 'Ches sing', phone: 'N/A' },
  'Goodnessmbakara': { name: 'Goodness Mbakara', phone: 'N/A' },
  'Sprky124': { name: 'Favour Nnenji', phone: '+234 802 758 7953' },
  'Ay_ano_koji123444562': { name: 'Adeoye Daniel', phone: '+234 907 108 6914' },
  'Strav1k': { name: 'Ade', phone: '+1 289 689 2415' },
  'BOE200': { name: 'Bassey Okon Etia', phone: 'N/A' },
  'chesskiller090': { name: 'Sanusi Inioluwa', phone: 'N/A' },
  'MaouTanner': { name: 'Isuekevbo Uduehi', phone: '+234 912 660 6382' },
  'Zavvy23': { name: 'Iniubong Wilson Udofia', phone: 'N/A' },
  'ManCHESSterLaurel': { name: 'Laurel Amanam Umohntuen', phone: 'N/A' },
  'Power_101': { name: 'Etengeabasi Ekpe', phone: '+234 906 419 6491' },
  'Kontor_001': { name: 'Kingsley Ekpo', phone: '+234 906 051 5456' },
  'Rowlex19': { name: 'Rowland Ini John', phone: '+234 810 614 4924' },
  'OkoyaOluwadamilare': { name: 'OKOYA OLADIMEJI OLUWADAMILARE', phone: '+234 902 398 4526' },
  'Efejossy': { name: 'Efeturi Joseph Ishaka', phone: '+234 810 325 7385' },
  'Shazam-112': { name: 'Jerome, Anietienteabasi Lawren', phone: '+234 704 638 3887' },
  'Ezzy29': { name: 'John Israel', phone: '+234 906 176 4913' },
  'Ohzzy90': { name: 'Ohzzy', phone: '+234 808 990 0375' },
  'kingsleydominus': { name: 'Kingsley Basssy', phone: '0705493993' },
  'Mfonmyservant': { name: 'Abasifreke Sylvester Nyarks', phone: '+234 816 718 4937' },
  'Favourizo1': { name: 'Philip Favour', phone: '+234 808 177 9634' },
  'Emex1': { name: 'Oliver Emmanuel', phone: '+234 814 621 1361' },
  'r2_snyp': { name: 'Ugbani Onyekachi Favour', phone: '+234 812 212 6954' },
  'precious2145': { name: 'Precious Egware', phone: '+234 810 690 0661' },
  'chibest9': { name: 'Oliaku Chiedozie Christian', phone: '+234 904 437 2256' },
  'Stormcote': { name: 'UduakAbasi Francis Ekanem', phone: '+234 907 818 6827' },
  'Rfirm842': { name: 'James Mfon', phone: '+234 704 111 0528' },
  'Jonzing200': { name: 'Essien Jonathan Victor', phone: '+234 812 817 3134' },
  'OtobongBassey': { name: 'Archibong Otobong Bassey', phone: '+234 913 879 4763' },
  'Dharrygee': { name: 'Michael Denis Okon', phone: '+234 911 431 7232' },
  'sellysmart': { name: 'Sunday, Excellence Kufre', phone: '+234 913 016 0444' },
  'PRI639': { name: 'Princewill', phone: '+234 912 410 6396' },
  'shalombenx': { name: 'Shalom Bebebaraseigha', phone: '+234 707 057 6049' },
  'Samuelikescodin': { name: 'Samuel Amiang Akpan', phone: '+234 810 438 2157' },
  'olami254': { name: 'Adepoju Emmanuel Olamide', phone: '+234 705 197 7326' },
  'keseneNicholas': { name: 'Kesene Nicholas', phone: '+234 901 512 5293' },
  'thatshortboyeyez': { name: 'Israel', phone: '+234 707 680 7027' },
  'Chilax333': { name: 'Destiny Chilaka', phone: '+234 813 973 2276' },
  'Robdarkknight': { name: 'Osmond-Nath Robson Robinson', phone: '+234 812 632 9930' },
  'oblivion1416': { name: 'Henshaw James', phone: '+234 902 804 5978' },
};

async function discoverTables() {
  console.log('\n📋 Discovering available tables...');
  // Try to introspect via OpenAPI
  const res = await supabaseRequest('', {});
  return res;
}

async function queryTable(table, params) {
  return supabaseRequest(table, params);
}

async function run() {
  console.log('='.repeat(70));
  console.log('   ALTE REGISTRATIONS - Aug 18-19, 2026 Account Creation Query');
  console.log('='.repeat(70));
  console.log(`\nFetching users created between ${DATE_FROM} and ${DATE_TO}...\n`);

  // Tables to try (common Supabase auth + custom profile tables)
  const tablesToTry = ['profiles', 'users', 'players', 'members', 'registrations', 'accounts'];

  let foundUsers = [];
  let successTable = null;

  for (const table of tablesToTry) {
    console.log(`  → Trying table: "${table}"...`);
    const res = await queryTable(table, {
      'created_at': `gte.${DATE_FROM}`,
      'created_at': `lte.${DATE_TO}`,
      'select': '*',
      'order': 'created_at.asc',
      'limit': '500'
    });

    if (res.status === 200 && Array.isArray(res.data) && res.data.length >= 0) {
      console.log(`  ✓ Table "${table}" accessible — ${res.data.length} records in range.\n`);
      if (res.data.length > 0) {
        foundUsers = res.data;
        successTable = table;
        break;
      } else if (successTable === null) {
        successTable = table; // remember first accessible table even if empty
      }
    } else if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`  ✓ Table "${table}" is empty for this date range.`);
    } else {
      const msg = res.data?.message || res.data?.code || res.status;
      console.log(`  ✗ Table "${table}" not accessible: ${msg}`);
    }
  }

  // Also try with date range filter properly split
  if (foundUsers.length === 0) {
    console.log('\n  → Retrying with proper date range filter on "profiles"...');
    const res = await supabaseRequest('profiles', {
      'select': '*',
      'created_at': `gte.2026-08-18T00:00:00.000Z`,
      'order': 'created_at.asc',
      'limit': '200'
    });
    if (res.status === 200 && Array.isArray(res.data)) {
      // Filter client-side
      foundUsers = res.data.filter(u => {
        const d = new Date(u.created_at);
        return d >= new Date('2026-08-18T00:00:00Z') && d <= new Date('2026-08-19T23:59:59Z');
      });
      console.log(`  ✓ Found ${foundUsers.length} profiles created Aug 18-19.`);
      if (foundUsers.length > 0) successTable = 'profiles';
    }
  }

  // Try lte separately (URLSearchParams only keeps last key)
  // Supabase REST: use multiple query params with same name for range
  if (foundUsers.length === 0) {
    console.log('\n  → Trying manual range query on "profiles" with proper params...');
    const hostname = 'bkxlbnemthwkfpfdlxmg.supabase.co';
    const queryPath = `/rest/v1/profiles?select=*&created_at=gte.2026-08-18T00%3A00%3A00.000Z&created_at=lte.2026-08-19T23%3A59%3A59.999Z&order=created_at.asc&limit=200`;

    const rangeResult = await new Promise((resolve, reject) => {
      const options = {
        hostname,
        path: queryPath,
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
          catch (e) { resolve({ status: res.statusCode, data }); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (rangeResult.status === 200 && Array.isArray(rangeResult.data)) {
      foundUsers = rangeResult.data;
      if (foundUsers.length > 0) successTable = 'profiles';
      console.log(`  ✓ Found ${foundUsers.length} profiles in range.`);
    } else {
      console.log(`  ✗ Range query result: ${rangeResult.status}`, JSON.stringify(rangeResult.data).substring(0, 200));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n  DB Result: ${foundUsers.length} user(s) found in "Aug 18-19" window.`);

  // --- Build the output list ---
  const outputLines = [];
  const now = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

  outputLines.push('='.repeat(80));
  outputLines.push('                        ALTE REGISTRATIONS                               ');
  outputLines.push('         Users Who Created Accounts: August 18 - 19, 2026               ');
  outputLines.push('='.repeat(80));
  outputLines.push(`Generated : ${now}`);
  outputLines.push(`Source    : Supabase DB (table: ${successTable || 'profiles'}) + Tournament Phone Directory`);
  outputLines.push('');

  // --- Section 1: From DB ---
  outputLines.push('='.repeat(80));
  outputLines.push('  SECTION A: FROM DATABASE (created_at: Aug 18-19, 2026)');
  outputLines.push(`  Total: ${foundUsers.length} accounts`);
  outputLines.push('='.repeat(80));
  outputLines.push('No.  Full Name                       Username              Phone           Created At         Institution');
  outputLines.push('-'.repeat(120));

  if (foundUsers.length === 0) {
    outputLines.push('  (No records found for this date range in the database)');
  } else {
    foundUsers.forEach((u, i) => {
      const num = String(i + 1).padEnd(4);
      const name = (u.full_name || u.name || u.display_name || '—').padEnd(31);
      const username = (u.username || u.email || '—').padEnd(21);
      const phone = (u.phone || u.phone_number || 'N/A').padEnd(15);
      const createdAt = u.created_at ? new Date(u.created_at).toLocaleString('en-NG') : '—';
      const institution = u.institution || u.school || u.university || '—';
      outputLines.push(`${num} ${name} ${username} ${phone} ${createdAt.padEnd(18)} ${institution}`);
    });
  }

  // --- Section 2: From Phone Directory (tournament players who registered Aug 18-19) ---
  // We cross-reference: if a DB user's username matches the phone directory, enrich with phone
  outputLines.push('');
  outputLines.push('='.repeat(80));
  outputLines.push('  SECTION B: CROSS-REFERENCED WITH TOURNAMENT PHONE DIRECTORY');
  outputLines.push('  (DB registrants matched against the tournament phone list)');
  outputLines.push('='.repeat(80));
  outputLines.push('No.  Full Name                       Username              Phone           Institution');
  outputLines.push('-'.repeat(100));

  let matchCount = 0;
  if (foundUsers.length > 0) {
    foundUsers.forEach((u, i) => {
      const username = u.username || '';
      const directoryEntry = phoneDirectory[username] || phoneDirectory[username.toLowerCase()] || null;
      if (directoryEntry) {
        matchCount++;
        const num = String(matchCount).padEnd(4);
        const name = directoryEntry.name.padEnd(31);
        const uname = username.padEnd(21);
        const phone = directoryEntry.phone.padEnd(15);
        const institution = u.institution || u.school || '—';
        outputLines.push(`${num} ${name} ${uname} ${phone} ${institution}`);
      }
    });
  }
  if (matchCount === 0) {
    outputLines.push('  (No cross-reference matches found)');
  }

  outputLines.push('');
  outputLines.push('='.repeat(80));
  outputLines.push('  SECTION C: ALL TOURNAMENT PHONE DIRECTORY ENTRIES (for reference)');
  outputLines.push('  Source: tournament_players_phone_numbers.txt');
  outputLines.push('='.repeat(80));
  outputLines.push('No.  Full Name                       Username                 Phone Number');
  outputLines.push('-'.repeat(80));

  const dirEntries = Object.entries(phoneDirectory);
  dirEntries.forEach(([username, info], i) => {
    const num = String(i + 1).padEnd(4);
    const name = info.name.padEnd(31);
    const uname = username.padEnd(24);
    outputLines.push(`${num} ${name} ${uname} ${info.phone}`);
  });

  outputLines.push('');
  outputLines.push('='.repeat(80));
  outputLines.push(`  SUMMARY`);
  outputLines.push('='.repeat(80));
  outputLines.push(`  • DB Accounts created Aug 18-19, 2026 : ${foundUsers.length}`);
  outputLines.push(`  • Matched in phone directory          : ${matchCount}`);
  outputLines.push(`  • Total unique phone entries          : ${dirEntries.length}`);
  outputLines.push('='.repeat(80));

  const output = outputLines.join('\n');
  const outPath = path.join(__dirname, '../alte_registrations.txt');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log('\n✅ "Alte Registrations" list saved to:', outPath);
  console.log('\n--- PREVIEW (first 60 lines) ---');
  outputLines.slice(0, 60).forEach(l => console.log(l));

  // Also print raw DB users for inspection
  if (foundUsers.length > 0) {
    console.log('\n\n--- RAW DB RECORDS (Aug 18-19) ---');
    console.log(JSON.stringify(foundUsers, null, 2));
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
