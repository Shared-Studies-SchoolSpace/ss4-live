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

async function run() {
  const emailAdmin = `test_admin_${Date.now()}@example.com`;
  const emailPlayer = `test_player_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  try {
    const { data: sa } = await clientAdmin.auth.signUp({ email: emailAdmin, password });
    await clientAdmin.from('profiles').insert({ id: sa.user.id, email: emailAdmin, name: 'Admin', role: 'admin' });

    const { data: sp } = await clientPlayer.auth.signUp({ email: emailPlayer, password });
    await clientPlayer.from('profiles').insert({ id: sp.user.id, email: emailPlayer, name: 'Player', role: 'player' });

    console.log('Admin ID:', sa.user.id);
    console.log('Player ID:', sp.user.id);

    const testTitle = `Test Broadcast ${Date.now()}`;
    const testContent = 'Test content';

    // Try inserting notification for Player User using clientAdmin
    const { data, error } = await clientAdmin
      .from('notifications')
      .insert([
        {
          user_id: sp.user.id,
          type: 'announcement',
          title: `📢 ${testTitle}`,
          message: testContent,
          link: '/news'
        }
      ])
      .select();

    if (error) {
      console.log('Insert failed! Error object:', error);
    } else {
      console.log('Insert succeeded! Data:', data);
    }

    // Cleanup
    await clientAdmin.from('profiles').delete().eq('id', sa.user.id);
    await clientPlayer.from('profiles').delete().eq('id', sp.user.id);
  } catch (e) {
    console.error('Run failed:', e);
  }
}
run();
