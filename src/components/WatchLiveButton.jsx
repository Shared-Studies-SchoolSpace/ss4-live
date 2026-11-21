import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  VARSITY_S2_EVENTS,
  getCurrentLiveVarsityMatch,
  isVarsityEventCompleted,
} from '../features/chess-league/data/varsitySeason2Data';
import {
  getStoredEvents,
  fetchVarsityEvents,
  subscribeToVarsityEvents,
} from '../features/chess-league/services/varsityMatchService';

const DEFAULT_MATCHDAY_2_URL = 'https://lichess.org/tournament/CnYWk8AG';

/**
 * WatchLiveButton
 * Renders on the navbar:
 * - During active match time window: "Watch Live" button navigating to the live Lichess arena.
 * - When no matches are live: shows "no live matches currently".
 * Dynamically reacts to new match days uploaded via the Admin panel.
 */
export const WatchLiveButton = ({ className = '', variant = 'navbar' }) => {
  const [events, setEvents] = useState(() => getStoredEvents());

  const [liveState, setLiveState] = useState(() => {
    // Check URL params for preview/testing overrides (?live=true, ?testLive=1, ?offline=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('offline') === '1' || params.get('live') === 'false') {
        return {
          isLive: false,
          title: 'SCL Varsity Games · Matchday 2',
          url: DEFAULT_MATCHDAY_2_URL,
        };
      }
      if (params.get('live') === 'true' || params.get('testLive') === '1') {
        return {
          isLive: true,
          title: 'SCL Varsity Games · Matchday 2',
          url: DEFAULT_MATCHDAY_2_URL,
        };
      }
    }
    const initialEvents = getStoredEvents();
    const liveMatch = getCurrentLiveVarsityMatch(new Date(), initialEvents);
    return {
      isLive: Boolean(liveMatch),
      title: liveMatch?.title || 'SCL Varsity Games · Matchday 2',
      url: liveMatch?.link || DEFAULT_MATCHDAY_2_URL,
    };
  });

  useEffect(() => {
    let isMounted = true;

    // Fetch latest persisted events from Supabase in background
    fetchVarsityEvents().then((remoteEvents) => {
      if (isMounted && remoteEvents && remoteEvents.length > 0) {
        setEvents(remoteEvents);
      }
    });

    // Listen to admin additions/deletions
    const unsubscribe = subscribeToVarsityEvents((updatedEvents) => {
      if (isMounted && updatedEvents && updatedEvents.length > 0) {
        setEvents(updatedEvents);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkStatus = () => {
      // Allow testing override
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('offline') === '1' || params.get('live') === 'false') {
          setLiveState({
            isLive: false,
            title: 'SCL Varsity Games · Matchday 2',
            url: DEFAULT_MATCHDAY_2_URL,
          });
          return;
        }
        if (params.get('live') === 'true' || params.get('testLive') === '1') {
          setLiveState({
            isLive: true,
            title: 'SCL Varsity Games · Matchday 2',
            url: DEFAULT_MATCHDAY_2_URL,
          });
          return;
        }
      }

      const match = getCurrentLiveVarsityMatch(new Date(), events);
      setLiveState({
        isLive: Boolean(match),
        title: match?.title || 'SCL Varsity Games',
        url: match?.link || DEFAULT_MATCHDAY_2_URL,
      });
    };

    checkStatus();
    // Check every 10 seconds to transition dynamically when match window starts/ends
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [events]);

  const nextUpcoming = events.find((e) => !isVarsityEventCompleted(e));

  const handleOfflineClick = () => {
    if (nextUpcoming) {
      toast.info(`No live matches currently. Next up: ${nextUpcoming.title} (${nextUpcoming.dateStr} · ${nextUpcoming.timeRange} WAT) on Lichess.`, {
        position: 'top-center',
        autoClose: 4000,
      });
    } else {
      const lastMatch = events[events.length - 1];
      toast.info(`No live matches currently. Recent match: ${lastMatch?.title || 'Matchday 2'} has concluded.`, {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  if (liveState.isLive) {
    return (
      <a
        href={liveState.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-space font-extrabold text-xs sm:text-sm tracking-wide shadow-xs hover:shadow transition-all active:scale-95 shrink-0 cursor-pointer ${className}`}
        aria-label="Watch live match on Lichess"
        title="Match is LIVE! Click to watch on Lichess"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span>Watch Live</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  // Not Live state: Displays "no live matches currently"
  if (variant === 'mobile-drawer') {
    return (
      <button
        type="button"
        onClick={handleOfflineClick}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F0EEEA] hover:bg-[#EBE9E4] text-slate-600 font-medium text-xs transition-colors text-left cursor-pointer border-none ${className}`}
        aria-label="no live matches currently"
        title="No live matches currently. Click for upcoming schedule."
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
          <span>no live matches currently</span>
        </span>
        <span className="text-[10px] font-space font-bold uppercase tracking-wider text-slate-400">
          {nextUpcoming ? `${nextUpcoming.shortTitle} next` : 'No live match'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOfflineClick}
      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F0EEEA] hover:bg-[#EBE9E4] text-slate-600 font-medium text-[11px] sm:text-xs transition-colors shrink-0 cursor-pointer border-none ${className}`}
      aria-label="no live matches currently"
      title="No live matches currently. Click for upcoming schedule."
    >
      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">no live matches currently</span>
    </button>
  );
};

export default WatchLiveButton;
