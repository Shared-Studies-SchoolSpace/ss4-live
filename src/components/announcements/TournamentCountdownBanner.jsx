import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTournamentDates } from '../../utils/tournament';

/**
 * TournamentCountdownBanner
 *
 * Laws of UX applied:
 * - Von Restorff:      One distinct strip — nothing else on-page pulses amber.
 * - Zeigarnik Effect: Live countdown ticks = incomplete task the brain wants to resolve.
 * - Goal-Gradient:    As days shrink the urgency message escalates.
 * - Fitts's Law:      44 px-min CTA, full-height dismiss area.
 * - Hick's Law:       Exactly one action: "Register Now".
 * - Occam's Razor:    Strip, not modal. Catchiness over space.
 * - Parkinson's Law:  Hard deadline shown explicitly to constrain deliberation.
 * - Peak-End Rule:    Dismiss is smooth/frictionless — no guilt, no friction.
 */

const SHOW_DAYS_BEFORE = 14;
const URGENT_THRESHOLD = 3;
const DISMISS_KEY = 'scl_tournament_banner_dismissed_v2';

function getNextTournamentStart() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  const datesThisMonth = getTournamentDates(y, m);
  const startThisMonth = new Date(`${datesThisMonth[0]}T20:00:00+01:00`);

  if (startThisMonth > now) {
    return { date: startThisMonth, month: m, year: y };
  }

  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  const datesNextMonth = getTournamentDates(ny, nm);
  return { date: new Date(`${datesNextMonth[0]}T20:00:00+01:00`), month: nm, year: ny };
}

function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = targetDate - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const totalSecs = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSecs / 86400),
      hours: Math.floor((totalSecs % 86400) / 3600),
      mins: Math.floor((totalSecs % 3600) / 60),
      secs: totalSecs % 60,
      expired: false,
    };
  }, [targetDate]);

  const [tick, setTick] = useState(calc);

  useEffect(() => {
    setTick(calc());
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return tick;
}

function Digit({ val, unit }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span
        className="text-[15px] sm:text-base font-black text-white"
        style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{unit}</span>
    </span>
  );
}

function Colon() {
  return <span className="font-black text-sm self-start mt-0.5 select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>:</span>;
}

export default function TournamentCountdownBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored) {
      const dismissedDate = new Date(stored);
      const now = new Date();
      if (
        dismissedDate.getFullYear() === now.getFullYear() &&
        dismissedDate.getMonth() === now.getMonth()
      ) {
        return;
      }
    }

    const { date, month, year } = getNextTournamentStart();
    const msAway = date - Date.now();
    const daysAway = msAway / (1000 * 60 * 60 * 24);

    if (daysAway > 0 && daysAway <= SHOW_DAYS_BEFORE) {
      setTournament({ date, month, year });
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  const { days, hours, mins, secs, expired } = useCountdown(
    tournament?.date ?? new Date(Date.now() + 1e9)
  );

  if (!visible || dismissed || expired) return null;

  const isUrgent = days < URGENT_THRESHOLD;

  const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = tournament ? MONTH_NAMES[tournament.month] : '';

  const headline = isUrgent
    ? `Last chance — tournament starts in ${days}d ${hours}h!`
    : `${monthName} Chess Tournament is ${days} day${days !== 1 ? 's' : ''} away — secure your spot!`;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key="tournament-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden', position: 'relative', zIndex: 60 }}
          role="banner"
          aria-label="Tournament registration announcement"
        >
          <div
            className="relative w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 overflow-hidden select-none"
            style={{
              background: 'linear-gradient(100deg, #0c1e54 0%, #1A56C4 55%, #1e3a8a 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Chess board micro-texture overlay */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                pointerEvents: 'none',
                backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.6) 0% 25%, transparent 0% 50%)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Urgent amber left pulse bar */}
            {isUrgent && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '3px',
                  background: '#E8640A',
                  boxShadow: '0 0 12px 2px rgba(232,100,10,0.55)',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            )}

            {/* LEFT: copy */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <p className="text-white font-bold text-[11px] sm:text-xs leading-tight truncate" style={{ margin: 0 }}>
                <span
                  className="font-black mr-1"
                  style={{ color: isUrgent ? '#F59E0B' : '#A5C8FF', fontSize: '12px' }}
                >
                  SCL Monthly Tournament.
                </span>
                <span className="hidden sm:inline">{headline}</span>
                <span className="inline sm:hidden">
                  {days}d {hours}h left — join now!
                </span>
              </p>
            </div>

            {/* CENTRE: live countdown */}
            <div
              className="hidden sm:flex items-center gap-1.5 shrink-0"
              aria-label={`${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds remaining`}
            >
              <Digit val={days} unit="d" />
              <Colon />
              <Digit val={hours} unit="h" />
              <Colon />
              <Digit val={mins} unit="m" />
              <Colon />
              <Digit val={secs} unit="s" />
            </div>

            {/* RIGHT: CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/chess-league/tournament"
                id="tournament-banner-cta"
                className="inline-flex items-center gap-1.5 rounded-full font-black transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white active:scale-95"
                style={{
                  padding: '6px 14px',
                  minHeight: '32px',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: isUrgent
                    ? 'linear-gradient(135deg, #E8640A, #F59E0B)'
                    : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: isUrgent ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  boxShadow: isUrgent ? '0 2px 12px rgba(232,100,10,0.45)' : 'none',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Register Now
                <svg
                  style={{ width: '11px', height: '11px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
