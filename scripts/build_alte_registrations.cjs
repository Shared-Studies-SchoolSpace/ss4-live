/**
 * build_alte_registrations.cjs
 * Properly filters the DB data to only Aug 18-19 registrants,
 * cross-references by chess_username against the phone directory,
 * and writes the final "Alte Registrations" list.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreGxibmVtdGh3a2ZwZmRseG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjU1MDAsImV4cCI6MjA5MzI0MTUwMH0.trht6tUCphxDWALLF7AOjWhk7Lrz5dBi9ROaLCvNL8k';

// Phone directory keyed by chess_username (from tournament_players_phone_numbers.txt)
const phoneDirectory = {
  'Martin_The':              { name: 'Victor Martin Umoren',            phone: 'N/A' },
  'Kontor001':               { name: 'Kingsley Ekpo',                   phone: '+234 906 051 5456' },
  'Kontor_001':              { name: 'Kingsley Ekpo',                   phone: '+234 906 051 5456' },
  'Jude_Ben':                { name: 'Anietie Ben',                     phone: '+234 806 307 1862' },
  'Jesse70256':              { name: 'Edem, Jesse Gregory',             phone: '+234 814 507 4849' },
  'Lilshadys':               { name: 'William Arum',                    phone: '+234 913 632 6622' },
  'Bayron-sage7':            { name: 'ETIMBUK PAUL THOMPSON',           phone: '+234 701 565 0278' },
  'Princedoziee':            { name: 'Uzochukwu chiedozie prince',      phone: '+234 704 598 1381' },
  'Anonix_01':               { name: 'Covenant Udobia',                 phone: 'N/A' },
  'GeneralRal':              { name: 'Batista Effontery',               phone: '+234 905 608 5216' },
  'Prince_of_pieceX':        { name: 'Kenneth Gilbert',                 phone: '+234 913 159 2008' },
  'Elijah_eao':              { name: 'Elijah Okunoye',                  phone: 'N/A' },
  'Unclesam34e':             { name: 'Robert Samuel',                   phone: '+234 806 475 5213' },
  'deanbassey001':           { name: 'Dean Bassey',                     phone: '+234 706 445 2708' },
  'victoraugustine':         { name: 'Victor Augustine',                phone: '+234 707 172 4882' },
  'Shazanny-112':            { name: 'Shazanny Black',                  phone: '+234 704 638 3887' },
  'Shazam-112':              { name: 'Jerome, Anietienteabasi Lawren',  phone: '+234 704 638 3887' },
  'basky09':                 { name: 'Abasiakan Mbat',                  phone: 'N/A' },
  'Yari-bem':                { name: 'AGU Daniel',                      phone: 'N/A' },
  'PraiseChinwuba':          { name: 'Ugwu Praise Chinwuba',            phone: '+234 704 926 9211' },
  'Ikbeast1':                { name: 'Emmanuel Michael',                phone: '+234 906 710 7943' },
  'joeblaq104':              { name: 'Joseph Chukwumaeze',              phone: '+234 803 397 9096' },
  'Ninuoluwa':               { name: 'Ninuoluwa Nins',                  phone: '+234 816 798 8323' },
  'Duke-001':                { name: 'Duke Ndifreke Etim',              phone: '+234 708 529 5795' },
  'TheWeehfhi':              { name: 'Oyebode Samuel',                  phone: '+234 816 944 2714' },
  'Mathemachesser-the-GOAT': { name: 'princewill obi',                  phone: 'N/A' },
  'Gloria0726':              { name: 'Gloria Okoro',                    phone: 'N/A' },
  'Davidbarakaii':           { name: 'David',                           phone: '+234 704 178 3383' },
  'Fulgent47':               { name: 'Samuel Nkereuwem',                phone: '+234 902 971 0550' },
  'Shin_12':                 { name: 'Johnstone Henshaw',               phone: '+234 708 406 4561' },
  'olatunjijeremiah':        { name: 'Olatunjijeremiah',                phone: 'N/A' },
  'Bolouaweri':              { name: 'Ado Bolouaweri Samuel',           phone: 'N/A' },
  'Alexrichy19':             { name: 'Alex Richard',                    phone: 'N/A' },
  'Yoyo1513':                { name: 'Raphael wisdom',                  phone: 'N/A' },
  'danielrich69':            { name: 'Daniel Richard',                  phone: '+234 814 502 1780' },
  'Bestmvh':                 { name: 'Best James',                      phone: 'N/A' },
  'Kidd9h':                  { name: 'Robert Victor Imo',               phone: '+234 705 523 4409' },
  'Blozisom1':               { name: 'Blossom AMAETOR',                 phone: 'N/A' },
  'D_Resign_Gambit':         { name: 'Teniola',                         phone: 'N/A' },
  'Karyptus':                { name: 'Chris Emmanuel Etim',             phone: '+234 916 863 6887' },
  'ajv1510':                 { name: 'Victor Ani-Joseph',               phone: 'N/A' },
  'scorpiochicago1':         { name: 'Vincent Clement Effiong',         phone: 'N/A' },
  'HAKAI_026':               { name: 'Okoli Tochukwu',                  phone: 'N/A' },
  'kingiyanam':              { name: 'Iyanam!',                         phone: '+234 704 631 7575' },
  'Imblesseddy':             { name: 'Edidiong Okoro',                  phone: 'N/A' },
  'Savlast':                 { name: 'Saviour Ibok',                    phone: 'N/A' },
  'WS-MIC-HAEL':             { name: 'Sunny',                           phone: '+234 907 929 9847' },
  'WS-Mic-Hael':             { name: 'Sunny Sunday George',             phone: '+234 907 929 9847' },
  'NobbieFF':                { name: 'Jarvis',                          phone: '+234 806 930 7996' },
  'jonzing200':              { name: 'Jonathan Victor',                  phone: '+234 812 817 3134' },
  'Jonzing200':              { name: 'Essien Jonathan Victor',           phone: '+234 812 817 3134' },
  'chilax333':               { name: 'Destiny Chilaka',                 phone: '+234 813 973 2276' },
  'Chilax333':               { name: 'Destiny Chilaka',                 phone: '+234 813 973 2276' },
  'Zilla065':                { name: 'José Akpan',                      phone: 'N/A' },
  'Picklerick-24':           { name: 'Pickle Rick',                     phone: 'N/A' },
  'Inimfon_67':              { name: 'Inimfon Akpan',                   phone: '+234 913 609 8015' },
  '21stPhenom':              { name: 'Enoch Isaac',                     phone: 'N/A' },
  'Master':                  { name: 'Prince Betiang',                  phone: 'N/A' },
  'milly_2872':              { name: 'Raphael Anyorikyo',               phone: 'N/A' },
  'Dara-veldora':            { name: 'Edara-Abasi Nnyanga Akpan',       phone: 'N/A' },
  'Emmaculate':              { name: 'Idorenyin Emmanuel',              phone: 'N/A' },
  'Kg_flames':               { name: 'Faith Uko',                       phone: 'N/A' },
  'BenG_22':                 { name: 'Benson',                          phone: 'N/A' },
  'Udohephraim':             { name: 'Udoh, Ephraim',                   phone: 'N/A' },
  'gallfather':              { name: 'Godwin Akaiso',                   phone: 'N/A' },
  'Checkmate':               { name: 'Ches sing',                       phone: 'N/A' },
  'Goodnessmbakara':         { name: 'Goodness Mbakara',                phone: 'N/A' },
  'Sprky124':                { name: 'Favour Nnenji',                   phone: '+234 802 758 7953' },
  'Ay_ano_koji123444562':    { name: 'Adeoye Daniel',                   phone: '+234 907 108 6914' },
  'Strav1k':                 { name: 'Ade',                             phone: '+1 289 689 2415' },
  'BOE200':                  { name: 'Bassey Okon Etia',                phone: 'N/A' },
  'chesskiller090':          { name: 'Sanusi Inioluwa',                 phone: 'N/A' },
  'MaouTanner':              { name: 'Isuekevbo Uduehi',                phone: '+234 912 660 6382' },
  'Zavvy23':                 { name: 'Iniubong Wilson Udofia',          phone: 'N/A' },
  'ManCHESSterLaurel':       { name: 'Laurel Amanam Umohntuen',         phone: 'N/A' },
  'Power_101':               { name: 'Etengeabasi Ekpe',                phone: '+234 906 419 6491' },
  'Rowlex19':                { name: 'Rowland Ini John',                phone: '+234 810 614 4924' },
  'OkoyaOluwadamilare':      { name: 'OKOYA OLADIMEJI OLUWADAMILARE',   phone: '+234 902 398 4526' },
  'Efejossy':                { name: 'Efeturi Joseph Ishaka',           phone: '+234 810 325 7385' },
  'Ezzy29':                  { name: 'John Israel',                     phone: '+234 906 176 4913' },
  'Ohzzy90':                 { name: 'Ohzzy',                           phone: '+234 808 990 0375' },
  'kingsleydominus':         { name: 'Kingsley Basssy',                 phone: '0705493993' },
  'Mfonmyservant':           { name: 'Abasifreke Sylvester Nyarks',     phone: '+234 816 718 4937' },
  'Favourizo1':              { name: 'Philip Favour',                   phone: '+234 808 177 9634' },
  'Emex1':                   { name: 'Oliver Emmanuel',                 phone: '+234 814 621 1361' },
  'r2_snyp':                 { name: 'Ugbani Onyekachi Favour',         phone: '+234 812 212 6954' },
  'precious2145':            { name: 'Precious Egware',                 phone: '+234 810 690 0661' },
  'chibest9':                { name: 'Oliaku Chiedozie Christian',      phone: '+234 904 437 2256' },
  'Stormcote':               { name: 'UduakAbasi Francis Ekanem',       phone: '+234 907 818 6827' },
  'Rfirm842':                { name: 'James Mfon',                      phone: '+234 704 111 0528' },
  'OtobongBassey':           { name: 'Archibong Otobong Bassey',        phone: '+234 913 879 4763' },
  'Dharrygee':               { name: 'Michael Denis Okon',              phone: '+234 911 431 7232' },
  'sellysmart':              { name: 'Sunday, Excellence Kufre',        phone: '+234 913 016 0444' },
  'PRI639':                  { name: 'Princewill',                      phone: '+234 912 410 6396' },
  'shalombenx':              { name: 'Shalom Bebebaraseigha',           phone: '+234 707 057 6049' },
  'Samuelikescodin':         { name: 'Samuel Amiang Akpan',             phone: '+234 810 438 2157' },
  'olami254':                { name: 'Adepoju Emmanuel Olamide',        phone: '+234 705 197 7326' },
  'keseneNicholas':          { name: 'Kesene Nicholas',                 phone: '+234 901 512 5293' },
  'thatshortboyeyez':        { name: 'Israel',                          phone: '+234 707 680 7027' },
  'Robdarkknight':           { name: 'Osmond-Nath Robson Robinson',     phone: '+234 812 632 9930' },
  'oblivion1416':            { name: 'Henshaw James',                   phone: '+234 902 804 5978' },
  'real_cress':              { name: 'Justice Hero',                    phone: 'N/A' },
};

async function fetchAllProfiles() {
  const hostname = 'bkxlbnemthwkfpfdlxmg.supabase.co';
  const queryPath = `/rest/v1/profiles?select=*&order=created_at.asc&limit=500`;

  return new Promise((resolve, reject) => {
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
        catch (e) { resolve({ status: res.statusCode, data, raw: true }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function pad(str, len) {
  const s = String(str || '');
  return s.length >= len ? s.substring(0, len) : s + ' '.repeat(len - s.length);
}

async function run() {
  console.log('Fetching all profiles from Supabase...');
  const result = await fetchAllProfiles();

  if (result.status !== 200 || !Array.isArray(result.data)) {
    console.error('Failed to fetch profiles:', result.status, result.data);
    process.exit(1);
  }

  const allProfiles = result.data;
  console.log(`Total profiles in DB: ${allProfiles.length}`);

  // Filter: only accounts created between Aug 18 00:00:00 and Aug 19 23:59:59 UTC
  const aug18Start = new Date('2026-08-18T00:00:00.000Z');
  const aug19End   = new Date('2026-08-19T23:59:59.999Z');

  const altRegistrants = allProfiles.filter(u => {
    const d = new Date(u.created_at);
    return d >= aug18Start && d <= aug19End;
  });

  console.log(`Registrants Aug 18-19: ${altRegistrants.length}`);

  // Build enriched list with phone numbers from chess_username lookup
  const enriched = altRegistrants.map(u => {
    const cUsername = u.chess_username || '';
    const dirEntry = phoneDirectory[cUsername] || null;
    return {
      ...u,
      chess_username: cUsername,
      phone: dirEntry ? dirEntry.phone : (u.phone_number || 'N/A'),
    };
  });

  // ── Generate output ──────────────────────────────────────────────────────────
  const now = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', hour12: true });
  const lines = [];

  const W = 110;
  const HR = '='.repeat(W);
  const hr = '-'.repeat(W);

  lines.push(HR);
  lines.push('                              ALTE REGISTRATIONS                              ');
  lines.push('                 New Accounts Created: 18th - 19th August 2026               ');
  lines.push(HR);
  lines.push(`  Generated : ${now}`);
  lines.push(`  Source    : Supabase Database (profiles table) + Tournament Phone Directory`);
  lines.push(`  Total     : ${enriched.length} registrants`);
  lines.push('');

  // ── Main List ────────────────────────────────────────────────────────────────
  lines.push(HR);
  lines.push('  NEW REGISTRATIONS  (Aug 18 - 19, 2026)');
  lines.push(HR);
  lines.push(
    pad('No.', 5) +
    pad('Full Name', 28) +
    pad('Chess Username', 26) +
    pad('Phone Number', 20) +
    pad('Email', 34) +
    pad('Created At (WAT)', 22) +
    'Institution'
  );
  lines.push(hr);

  enriched.forEach((u, i) => {
    const createdWAT = new Date(u.created_at).toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    lines.push(
      pad(i + 1 + '.', 5) +
      pad(u.name || '—', 28) +
      pad(u.chess_username || '—', 26) +
      pad(u.phone, 20) +
      pad(u.email || '—', 34) +
      pad(createdWAT, 22) +
      (u.university || '—')
    );
  });

  // ── Extended Details Block ───────────────────────────────────────────────────
  lines.push('');
  lines.push(HR);
  lines.push('  EXTENDED PLAYER DETAILS');
  lines.push(HR);

  enriched.forEach((u, i) => {
    const createdWAT = new Date(u.created_at).toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    lines.push(`  ${i + 1}. ${u.name || '—'}`);
    lines.push(`     Chess Username  : ${u.chess_username || 'N/A'}`);
    lines.push(`     Lichess Username: ${u.lichess_username || 'N/A'}`);
    lines.push(`     Email           : ${u.email || 'N/A'}`);
    lines.push(`     Phone           : ${u.phone}`);
    lines.push(`     Chess Rating    : ${u.chess_rating || 'N/A'}`);
    lines.push(`     Lichess Rating  : ${u.lichess_rating || 'N/A'}`);
    lines.push(`     University      : ${u.university || 'N/A'}`);
    lines.push(`     Faculty         : ${u.faculty || 'N/A'}`);
    lines.push(`     Department      : ${u.department || 'N/A'}`);
    lines.push(`     Level           : ${u.level || 'N/A'}`);
    lines.push(`     Role            : ${u.role || 'N/A'}`);
    lines.push(`     Registered At   : ${createdWAT}`);
    lines.push('');
  });

  // ── Phone Quick Export ───────────────────────────────────────────────────────
  const withPhones = enriched.filter(u => u.phone && u.phone !== 'N/A');
  lines.push(HR);
  lines.push('  PHONE NUMBER EXPORT (Alte Registrants with known numbers)');
  lines.push(HR);
  lines.push(`  Total with phone: ${withPhones.length} of ${enriched.length}`);
  lines.push('');
  lines.push('  --- Nigerian Local Format ---');
  withPhones.forEach(u => {
    const local = u.phone.replace(/^\+234\s?/, '0').replace(/\s/g, '');
    lines.push(`  ${local}  (${u.name})`);
  });
  lines.push('');
  lines.push('  --- International E.164 Format ---');
  withPhones.forEach(u => {
    lines.push(`  ${u.phone}  (${u.name})`);
  });
  lines.push('');
  lines.push('  --- Comma-Separated (for WhatsApp Broadcast) ---');
  lines.push('  ' + withPhones.map(u => u.phone.replace(/^\+234\s?/, '0').replace(/\s/g, '')).join(', '));

  lines.push('');
  lines.push(HR);
  lines.push('  SUMMARY');
  lines.push(HR);
  lines.push(`  • Total new accounts (Aug 18-19, 2026) : ${enriched.length}`);
  lines.push(`  • With phone numbers (from directory)  : ${withPhones.length}`);
  lines.push(`  • Without phone numbers                : ${enriched.length - withPhones.length}`);
  lines.push(`  • Day breakdown:`);

  const aug18 = enriched.filter(u => new Date(u.created_at).toISOString().startsWith('2026-08-18'));
  const aug19 = enriched.filter(u => new Date(u.created_at).toISOString().startsWith('2026-08-19'));
  lines.push(`      18th August 2026 : ${aug18.length} registrations`);
  lines.push(`      19th August 2026 : ${aug19.length} registrations`);
  lines.push(HR);

  const output = lines.join('\n');
  const outPath = path.join(__dirname, '../alte_registrations.txt');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log(`\n✅ Saved to: ${outPath}`);
  console.log('\n' + output);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
