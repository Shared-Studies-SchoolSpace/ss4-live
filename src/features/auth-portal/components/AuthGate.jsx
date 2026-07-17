import React, { cloneElement, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';

/**
 * AuthGate
 *
 * Wraps any interactive child element. If the current visitor is a guest
 * (not signed in), clicking the child is intercepted — the auth modal opens
 * instead, with the original action queued as a post-login callback.
 *
 * Once the user signs in, the callback fires automatically and the action
 * completes without the user needing to click again.
 *
 * Props:
 *   children   – A single React element whose onClick will be intercepted.
 *   reason     – Short human-readable phrase describing why auth is needed.
 *                Used for the tooltip: "Sign in to <reason>".
 *   onAction   – (optional) explicit action callback. If omitted, the original
 *                child onClick is used.
 *
 * Usage:
 *   <AuthGate reason="join this tournament" onAction={handleRegister}>
 *     <button>Register Now</button>
 *   </AuthGate>
 */
export default function AuthGate({ children, reason = 'continue', onAction }) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [showTooltip, setShowTooltip] = useState(false);

  // If authenticated, pass children through unmodified
  if (user) {
    return <>{children}</>;
  }

  // Determine the action to run post-login
  const action = onAction ?? children?.props?.onClick;

  const handleGuestClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Flash tooltip briefly
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2500);

    // Open modal with post-login callback
    openAuthModal(reason, action);
  };

  // Clone child with the intercepted onClick and visual cues
  const gatedChild = cloneElement(children, {
    onClick: handleGuestClick,
    'aria-label': `Sign in to ${reason}`,
  });

  return (
    <span className="relative inline-block">
      {gatedChild}

      {/* Tooltip */}
      {showTooltip && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] text-center
                     bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest
                     px-3 py-1.5 rounded-full shadow-lg pointer-events-none z-50
                     animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          Sign in to {reason}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111111]" />
        </span>
      )}
    </span>
  );
}
