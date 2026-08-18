import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateSignupForm,
  validatePasswordResetForm,
  normalizeEmail
} from '../utils/authValidation.js';

describe('Authentication Validation Utility Suite', () => {
  describe('validateEmail', () => {
    it('should return an error message for empty or missing email', () => {
      assert.strictEqual(validateEmail(''), 'Email is required');
      assert.strictEqual(validateEmail(null), 'Email is required');
      assert.strictEqual(validateEmail('   '), 'Email is required');
    });

    it('should return an error for malformed email addresses', () => {
      assert.strictEqual(validateEmail('invalid-email'), 'Please enter a valid email address');
      assert.strictEqual(validateEmail('user@'), 'Please enter a valid email address');
      assert.strictEqual(validateEmail('@domain.com'), 'Please enter a valid email address');
      assert.strictEqual(validateEmail('user@domain'), 'Please enter a valid email address');
    });

    it('should return null for valid email addresses', () => {
      assert.strictEqual(validateEmail('test@example.com'), null);
      assert.strictEqual(validateEmail('  student@university.edu.ng  '), null);
    });
  });

  describe('validatePassword', () => {
    it('should return an error for empty password', () => {
      assert.strictEqual(validatePassword(''), 'Password is required');
      assert.strictEqual(validatePassword(null), 'Password is required');
    });

    it('should enforce 8 characters minimum during signup', () => {
      assert.strictEqual(validatePassword('1234567', true), 'Password must be at least 8 characters');
      assert.strictEqual(validatePassword('12345678', true), null);
    });

    it('should allow shorter passwords during login without enforcing signup length', () => {
      assert.strictEqual(validatePassword('short', false), null);
    });
  });

  describe('validateLoginForm', () => {
    it('should capture all validation errors for invalid login input', () => {
      const errors = validateLoginForm({ email: '', password: '' });
      assert.strictEqual(errors.email, 'Email is required');
      assert.strictEqual(errors.password, 'Password is required');
    });

    it('should return an empty error object for valid login input', () => {
      const errors = validateLoginForm({ email: 'user@example.com', password: 'secretpassword' });
      assert.deepStrictEqual(errors, {});
    });
  });

  describe('validateSignupForm', () => {
    it('should reject signup with missing first name or last name', () => {
      const errors = validateSignupForm({
        first_name: '',
        last_name: '',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348000000000',
        university: 'University of Uyo',
        faculty: 'Science',
        department: 'Computer Science',
        chess_username: 'player1'
      });
      assert.strictEqual(errors.first_name, 'First name is required');
      assert.strictEqual(errors.last_name, 'Last name is required');
    });

    it('should reject signup with missing mandatory phone', () => {
      const errors = validateSignupForm({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '',
        university: 'University of Uyo',
        faculty: 'Science',
        department: 'Computer Science',
        chess_username: 'player1'
      });
      assert.strictEqual(errors.phone, 'Phone / WhatsApp number is required');
    });

    it('should reject signup with missing mandatory academic fields (university, faculty, department)', () => {
      const errors = validateSignupForm({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348000000000',
        university: '',
        faculty: '',
        department: '',
        chess_username: 'player1'
      });
      assert.strictEqual(errors.university, 'University / School is required');
      assert.strictEqual(errors.faculty, 'Faculty is required');
      assert.strictEqual(errors.department, 'Department is required');
    });

    it('should reject signup when password confirmation does not match', () => {
      const errors = validateSignupForm({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Mismatch123!',
        phone: '+2348000000000',
        university: 'University of Uyo',
        faculty: 'Science',
        department: 'Computer Science',
        chess_username: 'player1'
      });
      assert.strictEqual(errors.confirm, 'Passwords do not match');
    });

    it('should require at least one chess credential', () => {
      const errors = validateSignupForm({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348000000000',
        university: 'University of Uyo',
        faculty: 'Science',
        department: 'Computer Science',
        chess_username: '',
        lichess_username: ''
      });
      assert.ok(errors.chess_username);
      assert.ok(errors.lichess_username);
    });

    it('should accept valid signup input with mandatory fields filled and optional level omitted', () => {
      const errorsChess = validateSignupForm({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348000000000',
        university: 'University of Uyo',
        faculty: 'Engineering',
        department: 'Mechanical Engineering',
        chess_username: 'grandmaster'
      });
      assert.deepStrictEqual(errorsChess, {});

      const errorsLichess = validateSignupForm({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348111111111',
        university: 'University of Lagos',
        faculty: 'Law',
        department: 'Public Law',
        level: '400',
        lichess_username: 'lichess_pro'
      });
      assert.deepStrictEqual(errorsLichess, {});
    });

    it('should accept valid signup input when full name string is provided', () => {
      const errors = validateSignupForm({
        name: 'John Doe',
        email: 'user@domain.com',
        password: 'Password123!',
        confirm: 'Password123!',
        phone: '+2348000000000',
        university: 'University of Uyo',
        faculty: 'Science',
        department: 'Computer Science',
        chess_username: 'player1'
      });
      assert.deepStrictEqual(errors, {});
    });
  });

  describe('validatePasswordResetForm', () => {
    it('should return error for invalid reset email', () => {
      const errors = validatePasswordResetForm('invalid');
      assert.strictEqual(errors.email, 'Please enter a valid email address');
    });

    it('should return empty errors for valid reset email', () => {
      const errors = validatePasswordResetForm('user@example.com');
      assert.deepStrictEqual(errors, {});
    });
  });

  describe('normalizeEmail', () => {
    it('should trim whitespace and lowercase email strings', () => {
      assert.strictEqual(normalizeEmail('  John.Doe@University.EDU  '), 'john.doe@university.edu');
      assert.strictEqual(normalizeEmail('USER@EXAMPLE.COM'), 'user@example.com');
      assert.strictEqual(normalizeEmail(''), '');
    });
  });
});
