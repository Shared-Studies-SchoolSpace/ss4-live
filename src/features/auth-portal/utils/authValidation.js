/**
 * Pure validation utility functions for authentication & registration forms.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {string|null} Error message or null if valid.
 */
export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Validates a password.
 * @param {string} password 
 * @param {boolean} isSignup 
 * @returns {string|null} Error message or null if valid.
 */
export function validatePassword(password, isSignup = false) {
  if (!password) {
    return 'Password is required';
  }
  if (isSignup && password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

/**
 * Validates login form inputs.
 * @param {{ email?: string, password?: string }} form 
 * @returns {Record<string, string>} Map of field key to error message.
 */
export function validateLoginForm(form = {}) {
  const errors = {};
  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(form.password, false);
  if (passErr) errors.password = passErr;

  return errors;
}

/**
 * Validates registration form inputs.
 * Mandatory: first_name, last_name (or name), email, password, confirm, phone, university, faculty, department
 * Optional: level
 * Requirement: At least one chess credential (chess_username or lichess_username)
 * @param {Object} form 
 * @returns {Record<string, string>} Map of field key to error message.
 */
export function validateSignupForm(form = {}) {
  const errors = {};

  let firstName = (form.first_name || '').trim();
  let lastName = (form.last_name || '').trim();

  // Fallback: If form.name is provided instead of separate first_name/last_name
  if (!firstName && !lastName && form.name) {
    const parts = form.name.trim().split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  if (!firstName) {
    errors.first_name = 'First name is required';
  }

  if (!lastName) {
    errors.last_name = 'Last name is required';
  }

  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(form.password, true);
  if (passErr) errors.password = passErr;

  if (form.confirm !== undefined) {
    if (form.password && form.confirm && form.password !== form.confirm) {
      errors.confirm = 'Passwords do not match';
    } else if (!form.confirm && form.password) {
      errors.confirm = 'Please confirm your password';
    }
  }

  const phoneTrimmed = (form.phone || '').trim();
  if (!phoneTrimmed) {
    errors.phone = 'Phone / WhatsApp number is required';
  }

  const universityTrimmed = (form.university || '').trim();
  if (!universityTrimmed) {
    errors.university = 'University / School is required';
  }

  const facultyTrimmed = (form.faculty || '').trim();
  if (!facultyTrimmed) {
    errors.faculty = 'Faculty is required';
  }

  const departmentTrimmed = (form.department || '').trim();
  if (!departmentTrimmed) {
    errors.department = 'Department is required';
  }

  const chessTrimmed = (form.chess_username || '').trim();
  const lichessTrimmed = (form.lichess_username || '').trim();

  if (!chessTrimmed && !lichessTrimmed) {
    errors.chess_username = 'At least one Chess.com or Lichess username is required';
    errors.lichess_username = 'At least one Chess.com or Lichess username is required';
  }

  return errors;
}

/**
 * Validates password reset request form.
 * @param {string} email 
 * @returns {Record<string, string>} Map of field key to error message.
 */
export function validatePasswordResetForm(email) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  return errors;
}

/**
 * Normalizes email address for consistent comparison and auth calls.
 * @param {string} email 
 * @returns {string} Lowercased, trimmed email string.
 */
export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}
