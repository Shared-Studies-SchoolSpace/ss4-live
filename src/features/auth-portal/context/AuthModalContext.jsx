import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import StudentSignupModal from '../components/StudentSignupModal';
import SignupChoiceModal from '../components/SignupChoiceModal';
import { useAuth } from '../hooks/useAuth';

/**
 * AuthModalContext
 *
 * Provides a site-wide, prop-drilling-free way to:
 *   1. Open the sign-in/register modal from anywhere.
 *   2. Support student vs general pre-flow branching.
 *   3. Register a one-shot "post-login" callback so the action that prompted
 *      the sign-in can be completed automatically once auth succeeds.
 *
 * Usage:
 *   const { openAuthModal } = useAuthModal();
 *   openAuthModal('register for this tournament', () => handleRegister());
 */

const AuthModalContext = createContext({
  openAuthModal: () => {},
});

export function AuthModalProvider({ children }) {
  const [stage, setStage] = useState(null); // null | 'choice' | 'student' | 'general' | 'login'
  // A ref so the callback is never stale inside the modal's onClose handler
  const pendingCallbackRef = useRef(null);
  const { user, loading } = useAuth();
  const [pendingSuccess, setPendingSuccess] = useState(false);

  /**
   * openAuthModal(reason?, onAuthenticated?, mode?)
   *
   * @param {string}   [reason]          – Human-readable reason shown to the user (for future tooltip use).
   * @param {Function} [onAuthenticated] – Callback invoked once the user has signed in / registered.
   * @param {string}   [mode]            – The mode to open: 'login' | 'register' | 'student' | 'general'.
   */
  const openAuthModal = useCallback((reason = '', onAuthenticated = null, mode = 'register') => {
    pendingCallbackRef.current = onAuthenticated;
    if (mode === 'login') {
      setStage('login');
    } else if (mode === 'student') {
      setStage('student');
    } else if (mode === 'general') {
      setStage('general');
    } else {
      setStage('choice');
    }
  }, []);

  const handleClose = useCallback(() => {
    setStage(null);
    // Do NOT invoke the callback on cancel — only on successful auth
    pendingCallbackRef.current = null;
    setPendingSuccess(false);
  }, []);

  /**
   * Called after a successful sign-in or sign-up.
   * Fires the pending callback if one was registered.
   */
  const handleAuthSuccess = useCallback(() => {
    setStage(null);
    if (typeof pendingCallbackRef.current === 'function') {
      setPendingSuccess(true);
    }
  }, []);

  // Fire the callback only when auth loading completes and user is authenticated
  React.useEffect(() => {
    if (pendingSuccess && !loading && user) {
      pendingCallbackRef.current?.();
      pendingCallbackRef.current = null;
      setPendingSuccess(false);
    }
  }, [pendingSuccess, loading, user]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      {stage === 'choice' && (
        <SignupChoiceModal
          onClose={handleClose}
          onStudent={() => setStage('student')}
          onGeneral={() => setStage('general')}
          onSignIn={() => setStage('login')}
        />
      )}
      {(stage === 'student' || stage === 'general' || stage === 'login') && (
        <StudentSignupModal
          onClose={handleClose}
          onAuthSuccess={handleAuthSuccess}
          initialIsLogin={stage === 'login'}
          initialFlowType={stage === 'general' ? 'general' : 'student'}
          onBackToChoice={() => setStage('choice')}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
