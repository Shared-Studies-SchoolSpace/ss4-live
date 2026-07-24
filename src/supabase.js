import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables must be defined.');
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`VITE_SUPABASE_URL appears malformed (got: "${supabaseUrl}"). It must start with https://.`);
}

/**
 * Custom storage proxy that routes session persistence to either
 * localStorage (when "Remember Me" is checked) or sessionStorage (when unchecked).
 *
 * Reads the `ss4_remember_me` flag set by the auth modal before sign-in.
 * Falls back to sessionStorage so the default is session-scoped (safer).
 */
export const rememberMeStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined') return null;
      const remember = localStorage.getItem('ss4_remember_me') === 'true';
      if (remember) {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn('[rememberMeStorage] getItem failed:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return;
      const remember = localStorage.getItem('ss4_remember_me') === 'true';
      if (remember) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[rememberMeStorage] setItem failed:', e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('[rememberMeStorage] removeItem failed:', e);
    }
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
