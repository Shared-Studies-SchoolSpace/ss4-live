import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountdownTarget } from '../utils/tournament';
import { supabase } from '../../../supabase';

const SHOW_DAYS_BEFORE = 14;
const URGENT_THRESHOLD = 3;
const DISMISS_KEY = 'ss4_partner_banner_dismissed_v1';

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
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [targetDate, setTargetDate] = useState(null);
  const [bannerLabel, setBannerLabel] = useState('');
  const [bannerConfig, setBannerConfig] = useState({ showBanner: true, mode: 'partner', version: 1, headline: '' });

  useEffect(() => {
    let isMounted = true;

    const loadTarget = async () => {
      let tObj = null;
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .in('status', ['active', 'upcoming'])
          .order('month_year', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          const { data: fallbackData } = await supabase
            .from('tournaments')
            .select('*')
            .order('month_year', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (fallbackData && isMounted) tObj = fallbackData;
        } else if (data && isMounted) {
          tObj = data;
        }
      } catch (err) {
        console.warn('Could not fetch active tournament for banner:', err);
      }

      if (!isMounted) return;
      const { date, label, showBanner, mode, version, headline } = getCountdownTarget(tObj);

      if (showBanner === false) {
        setVisible(false);
        return;
      }

      // Check versioned dismissal: Reset dismissal if admin incremented banner_version
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        try {
          const { dismissedVersion } = JSON.parse(stored);
          const isSameOrNewerVersion = (dismissedVersion || 1) >= (version || 1);
          if (isSameOrNewerVersion) {
            setVisible(false);
            return;
          }
        } catch {
          // Ignore parse errors
        }
      }

      setTargetDate(date);
      setBannerLabel(label || '');
      setBannerConfig({ showBanner, mode: mode || 'partner', version: version || 1, headline: headline || '' });
      setVisible(true);
    };

    loadTarget();

    // Unique channel ID per listener instance to prevent "cannot add postgres_changes callbacks after subscribe()"
    const channelId = `tournament-banner-sync-${Math.random().toString(36).substring(2, 9)}`;
    const tournamentChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          if (isMounted) loadTarget();
        }
      )
      .subscribe();

    // Fallback polling interval (60s)
    const intervalId = setInterval(loadTarget, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (tournamentChannel) {
        supabase.removeChannel(tournamentChannel);
      }
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, JSON.stringify({
      dismissedAt: new Date().toISOString(),
      dismissedVersion: bannerConfig.version || 1
    }));
  };

  const { days, hours, mins, secs, expired } = useCountdown(targetDate);

  if (!visible || dismissed || bannerConfig.showBanner === false) return null;

  // Only display match schedule countdown if explicitly configured in matches mode with valid unexpired date
  const isMatchCountdown = bannerConfig.mode === 'matches' && targetDate && !expired;
  const isUrgent = isMatchCountdown && days < URGENT_THRESHOLD;

  // Custom headline banner mode
  const isCustomMode = bannerConfig.mode === 'custom' && bannerConfig.headline;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key="site-top-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden', position: 'relative', zIndex: 60 }}
          role="banner"
          aria-label={isMatchCountdown ? "Tournament match schedule" : "Partnership announcement"}
        >
          {isMatchCountdown ? (
            /* Match Countdown Variant */
            <div
              className="relative w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 overflow-hidden select-none"
              style={{
                background: 'linear-gradient(100deg, #0c1e54 0%, #1A56C4 55%, #1e3a8a 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
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
                  }}
                />
              )}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
                <p className="text-white font-bold text-[11px] sm:text-xs leading-tight truncate m-0">
                  <span
                    className="font-black mr-2 uppercase tracking-wide"
                    style={{ color: isUrgent ? '#93C5FD' : '#A5C8FF', fontSize: '11px' }}
                  >
                    SCL {bannerLabel || 'Round'}:
                  </span>
                  <span className="hidden sm:inline text-white/90">
                    {isUrgent ? `Starts in ${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m! Check your pairings.` : `Matches scheduled! Starting in ${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m.`}
                  </span>
                  <span className="inline sm:hidden text-white/90">
                    {bannerLabel || 'Matches'} in {days > 0 ? `${days}d ` : ''}${hours}h!
                  </span>
                </p>
              </div>
              <div
                className="hidden sm:flex items-center gap-1.5 shrink-0 relative z-10"
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
              <div className="flex items-center gap-2 shrink-0 relative z-10">
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
                    background: isUrgent ? '#1A56C4' : 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: isUrgent ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  View Pairings
                  <svg style={{ width: '11px', height: '11px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <button
                  onClick={handleDismiss}
                  aria-label="Dismiss banner"
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer border-none focus:outline-none focus-visible:outline-2 focus-visible:outline-white"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Primary Default SS4 Orange Partner Banner */
            <div
              className="relative w-full flex items-center justify-between gap-3 px-3 sm:px-6 py-2.5 overflow-hidden select-none"
              style={{
                background: 'linear-gradient(90deg, #C84E00 0%, #E8640A 50%, #F07018 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {/* Chess board micro-texture overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.05,
                  pointerEvents: 'none',
                  backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.6) 0% 25%, transparent 0% 50%)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* LEFT: Become a Partner Copy */}
              <div className="flex items-center gap-2 min-w-0 flex-1 relative z-10">
                <span
                  className="font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[10px] shadow-2xs shrink-0 select-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: '#FFFFFF',
                    letterSpacing: '0.08em',
                  }}
                >
                  {isCustomMode ? 'Announcement' : 'Partner'}
                </span>
                <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate m-0">
                  <span className="font-black text-white">
                    {isCustomMode ? bannerConfig.headline : 'Become a Partner'}
                  </span>
                  {!isCustomMode && (
                    <span className="hidden sm:inline text-white/95 text-xs font-normal ml-2">
                      — Collaborate with SS4 to empower collegiate chess &amp; student excellence across Nigeria
                    </span>
                  )}
                </p>
              </div>

              {/* RIGHT: CTA Button leading to /partners + dismiss */}
              <div className="flex items-center gap-2 shrink-0 relative z-10">
                <a
                  href="/partners"
                  id="top-banner-partner-cta"
                  className="inline-flex items-center gap-1.5 rounded-xl font-black transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white active:scale-95 shadow-xs hover:shadow-md hover:brightness-105"
                  style={{
                    padding: '6px 14px',
                    minHeight: '32px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    background: '#FFFFFF',
                    color: '#C84E00',
                  }}
                >
                  <span>Partner With Us</span>
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
                  aria-label="Dismiss banner"
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer border-none focus:outline-none focus-visible:outline-2 focus-visible:outline-white hover:bg-white/30"
                  style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF' }}
                >
                  <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
