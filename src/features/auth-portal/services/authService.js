import { supabase } from '../../../supabase';
import { normalizeEmail, validateLoginForm, validateSignupForm, validatePasswordResetForm } from '../utils/authValidation';

/**
 * Isolated Authentication Service
 * Manages Supabase Auth, Profile creation, and storage preference.
 */

/**
 * Sets the remember me preference in localStorage before initiating auth operations.
 * @param {boolean} rememberMe 
 */
export function setRememberMePreference(rememberMe) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('ss4_remember_me', rememberMe ? 'true' : 'false');
    }
  } catch (err) {
    console.warn('[authService] Failed writing rememberMe preference:', err);
  }
}

/**
 * Executes user sign-in with email and password.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {boolean} [params.rememberMe=false]
 * @returns {Promise<{ data: any, error: Error|null }>}
 */
export async function signInUser({ email, password, rememberMe = false }) {
  const validationErrors = validateLoginForm({ email, password });
  if (Object.keys(validationErrors).length > 0) {
    const firstErrKey = Object.keys(validationErrors)[0];
    return { data: null, error: new Error(validationErrors[firstErrKey]) };
  }

  const cleanEmail = normalizeEmail(email);
  setRememberMePreference(rememberMe);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Executes user signup and profile row creation (S10 division auto-assignment removed).
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {Object} params.profileData
 * @param {boolean} [params.rememberMe=false]
 * @returns {Promise<{ data: any, error: Error|null, warning?: string }>}
 */
export async function signUpUser({ email, password, profileData = {}, rememberMe = false }) {
  const validationErrors = validateSignupForm({ email, password, ...profileData });
  if (Object.keys(validationErrors).length > 0) {
    const firstErrKey = Object.keys(validationErrors)[0];
    return { data: null, error: new Error(validationErrors[firstErrKey]) };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanName = (profileData.name || '').trim();
  const cleanPhone = (profileData.phone || profileData.whatsapp || '').trim();
  const cleanChessUser = (profileData.chess_username || '').trim();
  const cleanLichessUser = (profileData.lichess_username || '').trim();

  setRememberMePreference(rememberMe);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          university: profileData.university || '',
          faculty: profileData.faculty || '',
          department: profileData.department || '',
          level: profileData.level || '',
          phone: cleanPhone,
          whatsapp: cleanPhone,
          chess_username: cleanChessUser,
          lichess_username: cleanLichessUser,
          chess_rating: profileData.chess_rating || 0,
          lichess_rating: profileData.lichess_rating || 0,
          role: 'player'
        }
      }
    });

    if (error) throw error;

    let warningMessage = null;

    if (data?.user) {
      const profileRecord = {
        id: data.user.id,
        email: cleanEmail,
        name: cleanName,
        university: profileData.university || '',
        faculty: profileData.faculty || '',
        department: profileData.department || '',
        level: profileData.level || '',
        chess_username: cleanChessUser,
        lichess_username: cleanLichessUser,
        chess_rating: profileData.chess_rating || 0,
        lichess_rating: profileData.lichess_rating || 0,
        role: 'player'
      };

      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(profileRecord);

      if (profileErr) {
        console.error('[authService] Profile row upsert failed, self-heal on next login:', profileErr.message);
        warningMessage = 'Account created! Finalizing your profile on first login...';
      }
    }

    return { data, error: null, warning: warningMessage };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Sends a password reset email to the specified user.
 * @param {string} email 
 * @returns {Promise<{ data: any, error: Error|null }>}
 */
export async function sendPasswordResetEmail(email) {
  const validationErrors = validatePasswordResetForm(email);
  if (Object.keys(validationErrors).length > 0) {
    return { data: null, error: new Error(validationErrors.email) };
  }

  const cleanEmail = normalizeEmail(email);

  try {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard?tab=settings`
      : '/dashboard?tab=settings';

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
