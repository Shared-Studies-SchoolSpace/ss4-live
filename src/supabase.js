import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables must be defined.');
}

/**
 * Custom storage proxy that routes session persistence to either
 * localStorage (when "Remember Me" is checked) or sessionStorage (when unchecked).
 *
 * Reads the `ss4_remember_me` flag set by the auth modal before sign-in.
 * Falls back to sessionStorage so the default is session-scoped (safer).
 */
const rememberMeStorage = {
  getItem: (key) => {
    const remember = localStorage.getItem('ss4_remember_me') === 'true';
    return remember ? localStorage.getItem(key) : sessionStorage.getItem(key);
  },
  setItem: (key, value) => {
    const remember = localStorage.getItem('ss4_remember_me') === 'true';
    if (remember) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: rememberMeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
