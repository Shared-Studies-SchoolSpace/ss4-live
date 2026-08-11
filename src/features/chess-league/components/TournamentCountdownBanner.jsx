import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountdownTarget } from '../utils/tournament';
import { supabase } from '../../../supabase';

const SHOW_DAYS_BEFORE = 14;
const URGENT_THRESHOLD = 3;
const DISMISS_KEY = 'scl_tournament_banner_dismissed_v3';

function useCountdown(targetDate) {
  const calc = useCallback(() => {
    if (!targetDate) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    const diff = targetDate.getTime() - Date.now();
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
  const [targetDate, setTargetDate] = useState(null);
  const [bannerLabel, setBannerLabel] = useState('');

  useEffect(() => {
    const loadTarget = async () => {
      let tObj = null;
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('*')
          .or('status.eq.active,status.eq.upcoming')
          .order('month_year', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) tObj = data;
      } catch (err) {
        console.warn('Could not fetch active tournament for banner:', err);
      }

      const { date, label } = getCountdownTarget(tObj);

      // Fix 1: If there is no valid scheduled future date, don't show the banner at all.
      // Previously getCountdownTarget returned today-8pm as a fallback, causing the banner
      // to fire every evening with stale copy even with no active tournament.
      if (!date) return;

      const msAway = date.getTime() - Date.now();
      const daysAway = msAway / (1000 * 60 * 60 * 24);
      if (daysAway <= 0 || daysAway > SHOW_DAYS_BEFORE) return;

      // Fix 2: Per-event dismiss — only suppress the banner if the user dismissed it
      // for this EXACT target date. Previously the dismiss reset on calendar-month
      // rollover, which was too coarse (reset even when no new event was scheduled,
      // or failed to reset when a new event was scheduled mid-month).
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        try {
          const { dismissedFor } = JSON.parse(stored);
          if (dismissedFor && new Date(dismissedFor).toISOString() === date.toISOString()) {
            return; // dismissed for this exact event — stay hidden
          }
          // Different target date → new event, ignore the old dismiss
        } catch {
          // Legacy string format or corrupt data — ignore and show the banner
        }
      }

      setTargetDate(date);
      setBannerLabel(label || 'Tournament Round');
      setVisible(true);
    };

    loadTarget();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // Store the exact event date so a new event correctly resets the dismiss
    localStorage.setItem(DISMISS_KEY, JSON.stringify({
      dismissedAt: new Date().toISOString(),
      dismissedFor: targetDate ? targetDate.toISOString() : null,
    }));
  };

  const { days, hours, mins, secs, expired } = useCountdown(targetDate);

  if (!visible || dismissed || expired || !targetDate) return null;

  const isUrgent = days < URGENT_THRESHOLD;

  // Fix 3: Use dynamic bannerLabel — was hardcoded "Round of 32" regardless of round stage
  const headline = isUrgent
    ? `${bannerLabel} starts in ${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m!`
    : `SCL ${bannerLabel} matches are scheduled! Get ready.`;

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
          aria-label="Tournament schedule announcement"
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

            {/* LEFT: dynamic label (was hardcoded "SCL Round of 32.") */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <p className="text-white font-bold text-[11px] sm:text-xs leading-tight truncate" style={{ margin: 0 }}>
                <span
                  className="font-black mr-1"
                  style={{ color: isUrgent ? '#93C5FD' : '#A5C8FF', fontSize: '12px' }}
                >
                  SCL {bannerLabel}.
                </span>
                <span className="hidden sm:inline">{headline}</span>
                <span className="inline sm:hidden">
                  {hours}h {mins}m left: {bannerLabel}!
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

            {/* RIGHT: CTA + dismiss */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/chess-league/tournament"
                id="tournament-banner-cta"
                className="inline-flex items-center gap-1.5 rounded-xl font-black transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white active:scale-95"
                style={{
                  padding: '6px 14px',
                  minHeight: '32px',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: isUrgent
                    ? 'linear-gradient(135deg, #1A56C4, #3B82F6)'
                    : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: isUrgent ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  boxShadow: isUrgent ? '0 2px 12px rgba(26,86,196,0.45)' : 'none',
                  backdropFilter: 'blur(4px)',
                }}
              >
                View Tournament
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

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                aria-label="Dismiss tournament banner"
                className="flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer border-none focus:outline-none focus-visible:outline-2 focus-visible:outline-white"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              >
                <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
