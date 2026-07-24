import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const clientAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const clientPlayer = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retrySignUp(client, email, password, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        if (error.status === 429 || error.message.includes('rate limit')) {
          await delay(backoff);
          backoff *= 2;
          continue;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(backoff);
      backoff *= 2;
    }
  }
}

async function run() {
  const emailAdmin = `test_admin_${Date.now()}@example.com`;
  const emailPlayer = `test_player_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  try {
    const sa = await retrySignUp(clientAdmin, emailAdmin, password);
    await clientAdmin.from('profiles').insert({ id: sa.user.id, email: emailAdmin, name: 'Admin', role: 'admin' });

    await delay(1000);

    const sp = await retrySignUp(clientPlayer, emailPlayer, password);
    await clientPlayer.from('profiles').insert({ id: sp.user.id, email: emailPlayer, name: 'Player', role: 'player' });

    console.log('Admin ID:', sa.user.id);
    console.log('Player ID:', sp.user.id);

    const testTitle = `Test Broadcast ${Date.now()}`;
    const testContent = 'Test content';

    // Try inserting notification WITHOUT .select()
    const { error } = await clientAdmin
      .from('notifications')
      .insert([
        {
          user_id: sp.user.id,
          type: 'announcement',
          title: `📢 ${testTitle}`,
          message: testContent,
          link: '/news'
        }
      ]);

    if (error) {
      console.log('Insert WITHOUT .select() failed! Error object:', error);
    } else {
      console.log('Insert WITHOUT .select() succeeded! ✅');
    }

    // Cleanup
    await clientAdmin.from('profiles').delete().eq('id', sa.user.id);
    await clientPlayer.from('profiles').delete().eq('id', sp.user.id);
  } catch (e) {
    console.error('Run failed:', e);
  }
}
run();
