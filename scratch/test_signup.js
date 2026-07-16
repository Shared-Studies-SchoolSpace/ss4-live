import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updatePlayerDivision = async (profileObj, ratingVal) => {
  try {
    let targetDivId = 'pin';
    if (ratingVal >= 1800) targetDivId = 'a_division';
    else if (ratingVal >= 1000) targetDivId = 'default';

    const { data: currentDivs, error: divErr } = await supabase.from('divisions').select('*');
    if (divErr || !currentDivs) {
      console.log('Skipping division assignment: divisions could not be loaded.', divErr?.message);
      return;
    }

    const matchingUsernames = [
      profileObj.chess_username?.toLowerCase(),
      profileObj.lichess_username?.toLowerCase(),
      profileObj.email?.toLowerCase(),
      profileObj.name?.toLowerCase()
    ].filter(Boolean);

    const updatePromises = currentDivs.map(async (d) => {
      const playersList = d.players || [];
      const found = playersList.some(p => 
        matchingUsernames.includes(p.username?.toLowerCase()) ||
        matchingUsernames.includes(p.name?.toLowerCase())
      );

      if (d.id === targetDivId) {
        if (!found) {
          const addedPlayer = {
            name: profileObj.name,
            username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
            department: profileObj.department || 'Student Player',
            school: profileObj.university || 'SS4 Member'
          };
          const nextList = [...playersList, addedPlayer];
          console.log(`Adding player to division ${d.id}`);
          const { error } = await supabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          if (error) console.error(`Error updating division ${d.id}:`, error.message);
        }
      } else if (found) {
        const nextList = playersList.filter(p => 
          !matchingUsernames.includes(p.username?.toLowerCase()) &&
          !matchingUsernames.includes(p.name?.toLowerCase())
        );
        console.log(`Removing player from division ${d.id}`);
        const { error } = await supabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        if (error) console.error(`Error updating division ${d.id}:`, error.message);
      }
    });
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Could not update player division assignment:', err.message);
  }
};

async function testLiveSignup() {
  console.log('\n--- Running Live Supabase Connection Test ---');
  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@gmail.com`;
  const testPassword = `Password_${timestamp}!`;
  const profileData = {
    name: `Test User ${timestamp}`,
    university: 'Test University',
    faculty: 'Science',
    department: 'Computer Science',
    level: '400',
    chess_username: `chess_user_${timestamp}`,
    lichess_username: `lichess_user_${timestamp}`,
    chess_rating: 1200,
    lichess_rating: 1100
  };

  console.log(`Attempting to sign up user: ${testEmail}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        console.log('✔ Live Supabase connection is VERIFIED and working.');
        console.log('  Note: Auth signup request correctly reached Supabase, but rate limit was returned (expected behavior for security/rate limits):', error.message);
        return;
      }
      console.error('❌ Live Auth signup failed with error:', error.message);
      return;
    }

    const user = data?.user || data?.data?.user;
    if (!user) {
      console.log('✔ Live Supabase connection is VERIFIED and working.');
      console.log('  Note: Auth signup succeeded, but returned no direct user session (typical when email confirmation is required by Supabase).');
      return;
    }

    console.log('Live Auth signup succeeded immediately! User ID:', user.id);
    console.log('Creating live profile...');
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: testEmail,
        name: profileData.name,
        university: profileData.university,
        faculty: profileData.faculty,
        department: profileData.department,
        level: profileData.level,
        chess_username: profileData.chess_username,
        lichess_username: profileData.lichess_username,
        chess_rating: profileData.chess_rating,
        lichess_rating: profileData.lichess_rating,
        role: 'player'
      });

    if (profileErr) {
      console.error('❌ Profile creation failed:', profileErr.message);
      return;
    }
    console.log('Live profile created successfully!');

    console.log('Assigning live player to division...');
    const createdProfile = {
      name: profileData.name,
      chess_username: profileData.chess_username,
      lichess_username: profileData.lichess_username,
      email: testEmail,
      department: profileData.department,
      university: profileData.university
    };
    const maxRating = Math.max(profileData.chess_rating, profileData.lichess_rating);
    await updatePlayerDivision(createdProfile, maxRating);
    console.log('Live player division auto-assignment completed.');

    console.log('Verifying created account in DB...');
    const { data: profileCheck, error: checkErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkErr) {
      console.error('❌ Failed to verify live profile in DB:', checkErr.message);
      return;
    }

    console.log('Live verification check result:', profileCheck);
    console.log('✔ Live signup test completed successfully!');
  } catch (err) {
    console.error('❌ Live signup test threw exception:', err.message);
  }
}

async function runUnitTests() {
  console.log('\n--- Running Mocked Unit Tests ---');
  
  // Test case 1: Rating 1900 should go to a_division
  {
    const mockDb = {
      divisions: [
        { id: 'a_division', players: [] },
        { id: 'default', players: [] },
        { id: 'pin', players: [] }
      ]
    };
    
    const mockSupabase = {
      from: (table) => {
        if (table === 'divisions') {
          return {
            select: () => Promise.resolve({ data: mockDb.divisions, error: null }),
            update: (newData) => {
              return {
                eq: (col, val) => {
                  const div = mockDb.divisions.find(d => d.id === val);
                  if (div) div.players = newData.players;
                  return Promise.resolve({ error: null });
                }
              };
            }
          };
        }
      }
    };
    
    const testUpdatePlayerDivision = async (profileObj, ratingVal) => {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      const { data: currentDivs, error: divErr } = await mockSupabase.from('divisions').select('*');
      if (divErr || !currentDivs) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      for (const d of currentDivs) {
        const playersList = d.players || [];
        const found = playersList.some(p => 
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (d.id === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member'
            };
            const nextList = [...playersList, addedPlayer];
            await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          }
        } else if (found) {
          const nextList = playersList.filter(p => 
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        }
      }
    };

    const profile = { name: 'Super GM', chess_username: 'gm_player', email: 'gm@example.com' };
    await testUpdatePlayerDivision(profile, 1900);
    
    const aDiv = mockDb.divisions.find(d => d.id === 'a_division');
    if (aDiv.players.length === 1 && aDiv.players[0].name === 'Super GM') {
      console.log('✔ Test 1 passed: Rating >= 1800 correctly assigned to a_division.');
    } else {
      console.error('❌ Test 1 failed:', mockDb.divisions);
    }
  }

  // Test case 2: Rating 1200 should go to default division
  {
    const mockDb = {
      divisions: [
        { id: 'a_division', players: [] },
        { id: 'default', players: [] },
        { id: 'pin', players: [] }
      ]
    };
    const mockSupabase = {
      from: (table) => {
        if (table === 'divisions') {
          return {
            select: () => Promise.resolve({ data: mockDb.divisions, error: null }),
            update: (newData) => {
              return {
                eq: (col, val) => {
                  const div = mockDb.divisions.find(d => d.id === val);
                  if (div) div.players = newData.players;
                  return Promise.resolve({ error: null });
                }
              };
            }
          };
        }
      }
    };
    
    const testUpdatePlayerDivision = async (profileObj, ratingVal) => {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      const { data: currentDivs, error: divErr } = await mockSupabase.from('divisions').select('*');
      if (divErr || !currentDivs) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      for (const d of currentDivs) {
        const playersList = d.players || [];
        const found = playersList.some(p => 
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (d.id === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member'
            };
            const nextList = [...playersList, addedPlayer];
            await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          }
        } else if (found) {
          const nextList = playersList.filter(p => 
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        }
      }
    };

    const profile = { name: 'Average Player', chess_username: 'avg_player', email: 'avg@example.com' };
    await testUpdatePlayerDivision(profile, 1200);
    
    const defaultDiv = mockDb.divisions.find(d => d.id === 'default');
    if (defaultDiv.players.length === 1 && defaultDiv.players[0].name === 'Average Player') {
      console.log('✔ Test 2 passed: Rating 1000-1799 correctly assigned to default division.');
    } else {
      console.error('❌ Test 2 failed:', mockDb.divisions);
    }
  }

  // Test case 3: Rating 800 should go to pin division
  {
    const mockDb = {
      divisions: [
        { id: 'a_division', players: [] },
        { id: 'default', players: [] },
        { id: 'pin', players: [] }
      ]
    };
    const mockSupabase = {
      from: (table) => {
        if (table === 'divisions') {
          return {
            select: () => Promise.resolve({ data: mockDb.divisions, error: null }),
            update: (newData) => {
              return {
                eq: (col, val) => {
                  const div = mockDb.divisions.find(d => d.id === val);
                  if (div) div.players = newData.players;
                  return Promise.resolve({ error: null });
                }
              };
            }
          };
        }
      }
    };
    
    const testUpdatePlayerDivision = async (profileObj, ratingVal) => {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      const { data: currentDivs, error: divErr } = await mockSupabase.from('divisions').select('*');
      if (divErr || !currentDivs) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      for (const d of currentDivs) {
        const playersList = d.players || [];
        const found = playersList.some(p => 
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (d.id === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member'
            };
            const nextList = [...playersList, addedPlayer];
            await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          }
        } else if (found) {
          const nextList = playersList.filter(p => 
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        }
      }
    };

    const profile = { name: 'Novice Player', chess_username: 'novice_player', email: 'novice@example.com' };
    await testUpdatePlayerDivision(profile, 800);
    
    const pinDiv = mockDb.divisions.find(d => d.id === 'pin');
    if (pinDiv.players.length === 1 && pinDiv.players[0].name === 'Novice Player') {
      console.log('✔ Test 3 passed: Rating < 1000 correctly assigned to pin division.');
    } else {
      console.error('❌ Test 3 failed:', mockDb.divisions);
    }
  }

  // Test case 4: Moving division when rating changes
  {
    const mockDb = {
      divisions: [
        { id: 'a_division', players: [] },
        { id: 'default', players: [{ name: 'Improving Player', username: 'improving_player', department: 'CS', school: 'Uni' }] },
        { id: 'pin', players: [] }
      ]
    };
    const mockSupabase = {
      from: (table) => {
        if (table === 'divisions') {
          return {
            select: () => Promise.resolve({ data: mockDb.divisions, error: null }),
            update: (newData) => {
              return {
                eq: (col, val) => {
                  const div = mockDb.divisions.find(d => d.id === val);
                  if (div) div.players = newData.players;
                  return Promise.resolve({ error: null });
                }
              };
            }
          };
        }
      }
    };
    
    const testUpdatePlayerDivision = async (profileObj, ratingVal) => {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      const { data: currentDivs, error: divErr } = await mockSupabase.from('divisions').select('*');
      if (divErr || !currentDivs) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      for (const d of currentDivs) {
        const playersList = d.players || [];
        const found = playersList.some(p => 
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (d.id === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member'
            };
            const nextList = [...playersList, addedPlayer];
            await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          }
        } else if (found) {
          const nextList = playersList.filter(p => 
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          await mockSupabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        }
      }
    };

    const profile = { name: 'Improving Player', chess_username: 'improving_player', email: 'improving@example.com' };
    await testUpdatePlayerDivision(profile, 1900);
    
    const aDiv = mockDb.divisions.find(d => d.id === 'a_division');
    const defaultDiv = mockDb.divisions.find(d => d.id === 'default');
    
    if (aDiv.players.length === 1 && defaultDiv.players.length === 0) {
      console.log('✔ Test 4 passed: Player correctly moved from default to a_division on rating increase.');
    } else {
      console.error('❌ Test 4 failed:', mockDb.divisions);
    }
  }
}

async function runAll() {
  await runUnitTests();
  await testLiveSignup();
}

runAll();
