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

async function runDMVerification() {
  console.log('=== Milestone 3 (R3): 1-on-1 Direct Messaging Verification ===');

  const clientA = createClientInstance();
  const clientB = createClientInstance();

  const emailA = `test_user_a_${Date.now()}@example.com`;
  const emailB = `test_user_b_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  let userA = null;
  let userB = null;
  let messageId = null;

  try {
    // 1. Sign up User A
    console.log(`1. Signing up User A (${emailA})...`);
    const signUpA = await retrySignUp(clientA, emailA, password);
    userA = signUpA.user;
    console.log(`   User A created with ID: ${userA.id}`);

    // Create Profile A
    console.log(`   Creating Profile A...`);
    await retryQuery(() => clientA
      .from('profiles')
      .insert({
        id: userA.id,
        email: emailA,
        name: 'Test Player A',
        role: 'player',
        last_seen: new Date().toISOString()
      })
    );
    console.log('   Profile A created successfully.');

    await delay(1000);

    // 2. Sign up User B
    console.log(`2. Signing up User B (${emailB})...`);
    const signUpB = await retrySignUp(clientB, emailB, password);
    userB = signUpB.user;
    console.log(`   User B created with ID: ${userB.id}`);

    // Create Profile B
    console.log(`   Creating Profile B...`);
    await retryQuery(() => clientB
      .from('profiles')
      .insert({
        id: userB.id,
        email: emailB,
        name: 'Test Player B',
        role: 'player',
        last_seen: new Date().toISOString()
      })
    );
    console.log('   Profile B created successfully.');

    await delay(1000);

    // 3. Send message from User A to User B
    console.log('3. Testing message insertion from User A to User B...');
    const testMsgText = `[Test DM Verification ${Date.now()}]`;
    const insertedMsg = await retryQuery(() => clientA
      .from('direct_messages')
      .insert({
        sender_id: userA.id,
        receiver_id: userB.id,
        message: testMsgText
      })
      .select()
      .single()
    );

    messageId = insertedMsg.id;
    console.log(`   Message inserted successfully! ID: ${messageId}`);

    // 4. Query unread messages as User B
    console.log('4. Querying unread messages as User B...');
    const unreads = await retryQuery(() => clientB
      .from('direct_messages')
      .select('*')
      .eq('receiver_id', userB.id)
      .is('read_at', null)
    );

    const foundUnread = unreads.find(m => m.id === messageId);
    if (!foundUnread) {
      throw new Error('Inserted unread message was not found in recipient unread list!');
    }
    console.log(`   Recipient User B sees the message. Total unread messages: ${unreads.length}`);

    // 5. Update read receipt as User B
    console.log('5. Testing read receipt update (read_at timestamp) as User B...');
    const nowIso = new Date().toISOString();
    const updatedMsg = await retryQuery(() => clientB
      .from('direct_messages')
      .update({ read_at: nowIso })
      .eq('id', messageId)
      .select()
      .single()
    );

    if (!updatedMsg.read_at) {
      throw new Error('read_at was not properly updated on message read receipt!');
    }
    console.log(`   Read receipt verified! Message read_at set to: ${updatedMsg.read_at}`);

    // 6. Update presence timestamp (last_seen) as User A
    console.log('6. Testing presence heartbeat update (last_seen) as User A...');
    await retryQuery(() => clientA
      .from('profiles')
      .update({ last_seen: nowIso })
      .eq('id', userA.id)
    );
    console.log(`   Profile last_seen timestamp updated successfully to ${nowIso}`);

    // Cleanup
    console.log('7. Cleaning up test message...');
    await retryQuery(() => clientA.from('direct_messages').delete().eq('id', messageId));
    console.log('   Cleaning up profiles...');
    await retryQuery(() => clientA.from('profiles').delete().eq('id', userA.id));
    await retryQuery(() => clientB.from('profiles').delete().eq('id', userB.id));

    console.log('🎉 DM Verification Completed Successfully!\n');
  } catch (err) {
    console.error('❌ DM Verification Failed:', err);
    const cleanupClient = createClient(url, key);
    if (messageId) await cleanupClient.from('direct_messages').delete().eq('id', messageId).then();
    if (userA) await cleanupClient.from('profiles').delete().eq('id', userA.id).then();
    if (userB) await cleanupClient.from('profiles').delete().eq('id', userB.id).then();
    process.exit(1);
  }
}

runDMVerification();
