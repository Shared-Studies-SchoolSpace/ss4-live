import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const createClientInstance = () => createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retrySignUp(client, email, password, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        if (error.status === 429 || error.message.includes('rate limit')) {
          console.warn(`   [Rate Limit] SignUp failed for ${email}. Retrying in ${backoff}ms...`);
          await delay(backoff);
          backoff *= 2;
          continue;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`   [Network/Timeout Error] ${err.message}. Retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff *= 2;
    }
  }
}

async function retryQuery(queryFn, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await queryFn();
      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`   [Query Error] ${err.message || err}. Retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff *= 2;
    }
  }
}

async function runBroadcastVerification() {
  console.log('=== Milestone 3 (R3): Universal Admin Broadcast Verification ===');

  const clientAdmin = createClientInstance();
  const clientPlayer = createClientInstance();

  const emailAdmin = `test_admin_${Date.now()}@example.com`;
  const emailPlayer = `test_player_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  let adminUser = null;
  let playerUser = null;
  let annId = null;

  try {
    // 1. Sign up Admin User
    console.log(`1. Signing up Admin User (${emailAdmin})...`);
    const signUpAdmin = await retrySignUp(clientAdmin, emailAdmin, password);
    adminUser = signUpAdmin.user;
    console.log(`   Admin User created with ID: ${adminUser.id}`);

    // Create Admin Profile with role = 'admin'
    console.log(`   Creating Admin Profile...`);
    await retryQuery(() => clientAdmin
      .from('profiles')
      .insert({
        id: adminUser.id,
        email: emailAdmin,
        name: 'Test Administrator',
        role: 'admin'
      })
    );
    console.log('   Admin Profile created successfully.');

    await delay(1000);

    // 2. Sign up Player User
    console.log(`2. Signing up Player User (${emailPlayer})...`);
    const signUpPlayer = await retrySignUp(clientPlayer, emailPlayer, password);
    playerUser = signUpPlayer.user;
    console.log(`   Player User created with ID: ${playerUser.id}`);

    // Create Player Profile with role = 'player'
    console.log(`   Creating Player Profile...`);
    await retryQuery(() => clientPlayer
      .from('profiles')
      .insert({
        id: playerUser.id,
        email: emailPlayer,
        name: 'Test Regular Player',
        role: 'player'
      })
    );
    console.log('   Player Profile created successfully.');

    await delay(1000);

    // 3. Test global announcement creation as Admin
    console.log('3. Testing global announcement creation in announcements table as Admin...');
    const testTitle = `[Verification Broadcast ${Date.now()}]`;
    const testContent = 'This is an automated test broadcast verification message.';
    
    const annData = await retryQuery(() => clientAdmin
      .from('announcements')
      .insert({
        title: testTitle,
        content: testContent,
        created_by: adminUser.id
      })
      .select()
      .single()
    );

    annId = annData.id;
    console.log(`   Announcement created successfully! ID: ${annId}, Title: "${annData.title}"`);

    // 4. Test database block: verify standard player CANNOT create announcements (RLS validation)
    console.log('4. Verifying that a regular player CANNOT create announcements...');
    let blockedByRls = false;
    try {
      await clientPlayer
        .from('announcements')
        .insert({
          title: 'Malicious announcement',
          content: 'This should be blocked.',
          created_by: playerUser.id
        });
    } catch (err) {
      blockedByRls = true;
      console.log('   Correctly blocked by RLS policy! Error:', err.message || err);
    }
    
    if (!blockedByRls) {
      const { error: insertErr } = await clientPlayer
        .from('announcements')
        .insert({
          title: 'Malicious announcement',
          content: 'This should be blocked.',
          created_by: playerUser.id
        });
      if (insertErr && (insertErr.code === '42501' || insertErr.message.includes('row-level security'))) {
        blockedByRls = true;
        console.log('   Correctly blocked by RLS policy! Code:', insertErr.code);
      }
    }

    if (!blockedByRls) {
      throw new Error('Security vulnerability: Regular player successfully bypassed RLS policy and inserted an announcement!');
    }

    // 5. Test notification dispatching to all players
    console.log('5. Testing broadcast notification dispatch to notifications table...');
    const notifsToInsert = [
      {
        user_id: playerUser.id,
        type: 'announcement',
        title: `📢 ${testTitle}`,
        message: testContent,
        link: '/news'
      }
    ];

    // Note: Do not append `.select()` here as it violates the SELECT RLS policy for the non-recipient admin client.
    await retryQuery(() => clientAdmin
      .from('notifications')
      .insert(notifsToInsert)
    );

    console.log(`   Dispatched notifications successfully.`);

    // 6. Test targeted notification query as Player
    console.log('6. Verifying recipient notification retrieval as Player User...');
    const userNotifs = await retryQuery(() => clientPlayer
      .from('notifications')
      .select('*')
      .eq('user_id', playerUser.id)
      .order('created_at', { ascending: false })
    );

    const matched = userNotifs.find(n => n.title.includes(testTitle));
    if (!matched) {
      throw new Error('Targeted notification was not retrieved in user notifications query!');
    }
    console.log(`   Recipient Player successfully retrieved notification: "${matched.title}"`);

    // Cleanup: Delete the announcements, notifications, and profiles
    console.log('7. Cleaning up test announcement, notifications, and profiles...');
    await retryQuery(() => clientAdmin.from('announcements').delete().eq('id', annId));
    await retryQuery(() => clientAdmin.from('notifications').delete().eq('title', `📢 ${testTitle}`));
    await retryQuery(() => clientAdmin.from('profiles').delete().eq('id', adminUser.id));
    await retryQuery(() => clientPlayer.from('profiles').delete().eq('id', playerUser.id));
    console.log('   Cleanup complete.');

    console.log('🎉 Universal Admin Broadcast Verification Completed Successfully!\n');
  } catch (err) {
    console.error('❌ Universal Admin Broadcast Verification Failed:', err);
    const cleanupClient = createClient(url, key);
    if (annId) await cleanupClient.from('announcements').delete().eq('id', annId).then();
    if (adminUser) await cleanupClient.from('profiles').delete().eq('id', adminUser.id).then();
    if (playerUser) await cleanupClient.from('profiles').delete().eq('id', playerUser.id).then();
    process.exit(1);
  }
}

runBroadcastVerification();
