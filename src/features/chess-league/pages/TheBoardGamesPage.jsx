import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { VARSITY_TEAMS } from '../data/varsityData';
import { PlayerProfile } from '../components/PlayerProfile';
import { fetchCompletePlayerData } from '../utils/chessService';
import DailyFriendliesLeaderboard from '../components/DailyFriendliesLeaderboard';
import ChessTournamentPage from './ChessTournamentPage';
import PrimaryTabs from '../../../components/PrimaryTabs';

import BOARD_GAMES_EVENTS from '../data/boardGamesData.json';

const PODIUM_LABELS = ['Champion', 'Runner-Up', '3rd Place'];
const PILL_LABELS = { RO32: 'R32', RO16: 'R16', QF: 'QF', SF: 'SF', F: 'Final' };

const withPts = (r) => (typeof r === 'string' ? r : `${r.name} (${r.score} pts)`);

const EVENTS = BOARD_GAMES_EVENTS.map((e) => {
  const verifiedResults = e.results;
  const rawPodium = verifiedResults?.podium || e.podium || [];
  const podium = rawPodium.map(withPts);
  const isLeague = e.matchNumber != null;
  const podiumHighlights = podium.map((name, i) => `${PODIUM_LABELS[i] || 'Rank ' + (i + 1)}: ${name}`);

  let description = e.recap;
  if (e.status === 'LIVE') {
    description = `${e.title} is LIVE tonight on Lichess. ${e.recap || ''}`;
  } else if (e.status === 'SCHEDULED') {
    description = `${e.title} is scheduled for Oct ${e.day}.`;
  } else if (isLeague) {
    description = `${e.title} (${e.timeControl} arena) on Lichess has concluded.${podium[0] ? ` ${podium[0]} took 1st place.` : ''}`;
  }

  return {
    ...e,
    isLeague,
    podium,
    description,
    results: verifiedResults,
    phase: isLeague ? 'League Stage' : 'Knockout Stage',
    stage: isLeague ? `League Match ${e.matchNumber}` : e.label,
    isLive: e.status === 'LIVE',
    isCompleted: e.status === 'COMPLETED',
    highlights: [e.timeControl, ...(['RO32', 'RO16', 'QF', 'F'].includes(e.key) ? ['Best of 3'] : []), ...podiumHighlights],
  };
});

const lastLink = EVENTS.filter((e) => e.link).pop() || EVENTS[0];
const ARENA_LINK = lastLink.link;
const ARENA_ID = lastLink.id;

// Live Arena deck list, newest first
const LEAGUE_MATCHES = EVENTS
  .filter((e) => e.link)
  .slice()
  .reverse()
  .map((e) => ({
    id: e.id,
    matchNumber: e.matchNumber,
    day: e.day,
    weekday: e.weekday,
    dateStr: `${e.weekday}, Oct ${e.day}`,
    title: e.title,
    label: e.label,
    shortTitle: e.isLeague ? `Match ${e.matchNumber}` : (PILL_LABELS[e.key] || e.label),
    link: e.link,
    status: e.status,
    isLive: e.isLive,
    isCompleted: e.isCompleted,
    timeControl: e.timeControl,
    stage: e.stage,
    phase: e.phase,
    description: e.description,
    highlights: e.highlights,
    winner: e.podium[0],
    runnerUp: e.podium[1],
    third: e.podium[2],
    results: e.results,
    key: e.key,
  }));

const TIME_CONTROLS = [
  {
    mode: 'Blitz',
    time: '3 + 0',
    description: '3 minutes flat, zero increment. Maximum tactical pressure, sharp tactics, and lightning instincts.',
    icon: 'bolt',
    accent: '#B84D00',
    pillClass: 'bg-[#FFEEDB] text-[#2E0E00]',
    badge: 'Opening Arenas'
  },
  {
    mode: 'Blitz',
    time: '5 + 0',
    description: '5 minutes flat. Strategic calculations balanced with fast clock management and midgame tension.',
    icon: 'timer',
    accent: '#92400E',
    pillClass: 'bg-amber-100 text-amber-900',
    badge: 'Mid-Season Arenas'
  },
  {
    mode: 'Rapid',
    time: '10 + 0',
    description: '10 minutes per contender. Deep positional battles, king safety, and tournament knockout precision.',
    icon: 'hourglass_top',
    accent: '#1A56C4',
    pillClass: 'bg-[#E8EFFF] text-[#00194B]',
    badge: 'Knockout Stages'
  }
];

const INSTITUTION_METAS = {
  unilorin: { short: 'UNILORIN', motto: 'The Better By Far', color: '#DB2777', notable: 'Kenneth Gilbert (Finalist), Durojaiye B., Iysa-Bello' },
  unical: { short: 'UNICAL', motto: 'Knowledge For Service', color: '#E11D48', notable: 'Emmanuel Edet (Final Winner), Ita Best James, Dean Bassey' },
  uniuyo: { short: 'UNIUYO', motto: 'Unity, Wisdom & Service', color: '#EA580C', notable: 'Jesse Edem (June Champion), Utibeabasi Inwang, Peter Eti' },
  biu: { short: 'BIU', motto: 'Academic Excellence', color: '#B45309', notable: 'Fidelis Hickman (SF Lead), Clinton Akinrogunde, Jeffrey Obanor' },
  bells: { short: 'BELLSTECH', motto: 'First Private Tech University', color: '#DC2626', notable: 'Akogo Simon, Isuekevbo Joel (M5 Winner), Anietie Ben' },
  redeemers: { short: 'RUN', motto: 'Running with the Vision', color: '#2563EB', notable: 'Daniel Daniel, Emmanuel Odukoya, John Akeju' },
  landmark: { short: 'LANDMARK', motto: 'Agrarian Revolutionaries', color: '#7C3AED', notable: 'Princewill Obi, Mbah Ernest, Emmanuel Chisom' },
  babcock: { short: 'BABCOCK', motto: 'Knowledge, Truth & Service', color: '#D97706', notable: 'Yuki Prime, Daniel Lawore, Temini Adedipe' },
  unn: { short: 'UNN', motto: 'Restoring The Dignity', color: '#0284C7', notable: 'Okoli Tochukwu (July Champion), Daniel Agu, Joseph Chukwumaeze' },
  covenant: { short: 'CU', motto: 'Hebron Bishops', color: '#0D9488', notable: 'Odushina Emmanuel, Ninuoluwa, Alao David' },
  futia: { short: 'FUTIA', motto: 'Aerospace & Tech Pride', color: '#059669', notable: 'Emike, Bassey Okon Etia, David Barakaii' }
};

const ORDERED_INSTITUTION_IDS = [
  'unilorin',
  'unical',
  'uniuyo',
  'biu',
  'bells',
  'redeemers',
  'landmark',
  'babcock',
  'unn',
  'covenant',
  'futia'
];

const NO_MATCH_DAY = {
  hasMatch: false,
  title: 'No Matches Scheduled',
  phase: 'Tournament Calendar',
  stage: 'Rest / Prep Day',
  timeControl: 'No matches',
  arenaLink: null,
  isLive: false,
  isCompleted: false,
  gridLabel: null,
  gridLabelShort: null,
  description: 'No theBoardGames matches were scheduled for this date. Contenders rested and analyzed games.',
  highlights: null,
};

// Calendar: Oct 9 – Oct 31 based on verified tournament schedule
const TOURNAMENT_DAYS = Array.from({ length: 23 }, (_, i) => {
  const day = 9 + i;
  const weekday = new Date(2026, 9, day).toLocaleDateString('en-US', { weekday: 'short' });
  const base = { day, dayIndex: i + 1, weekday };
  const ev = EVENTS.find((e) => e.day === day);

  if (ev) {
    let gridLabel = ev.label;
    let gridLabelShort = ev.label;

    if (ev.key === 'F') {
      gridLabel = 'Final';
      gridLabelShort = 'Final';
    } else if (ev.isLive) {
      gridLabel = 'LIVE';
      gridLabelShort = 'LIVE';
    } else if (ev.key === 'SF') {
      gridLabel = 'Semifinals';
      gridLabelShort = 'SF';
    } else if (ev.key === 'QF') {
      gridLabel = 'Quarterfinals';
      gridLabelShort = 'QF';
    } else if (ev.key === 'RO16') {
      gridLabel = 'Round of 16';
      gridLabelShort = 'R16';
    } else if (ev.key === 'RO32') {
      gridLabel = 'Round of 32';
      gridLabelShort = 'R32';
    } else if (ev.matchNumber != null) {
      gridLabel = `Match ${ev.matchNumber}`;
      gridLabelShort = `M${ev.matchNumber}`;
    }

    return {
      ...base,
      hasMatch: true,
      title: ev.title,
      phase: ev.phase,
      stage: ev.stage,
      status: ev.status,
      isCompleted: ev.isCompleted,
      isLive: ev.isLive,
      timeControl: ev.timeControl,
      arenaLink: ev.link,
      description: ev.description,
      highlights: ev.highlights,
      results: ev.results,
      gridLabel,
      gridLabelShort,
      key: ev.key,
      totalPlayers: ev.totalPlayers || ev.results?.totalPlayers || 0,
      totalGames: ev.totalGames || ev.results?.totalGames || 0,
    };
  }

  return { ...base, ...NO_MATCH_DAY };
});

const COMPETITION_TABS = [
  {
    id: 'championship',
    label: 'theBOARDGAMES',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'daily-league',
    label: 'Daily League',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    id: 'monthly-tournament',
    label: 'Monthly Tournaments',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 21h8m-4-4v4m-5-9a5 5 0 0010 0V5H7v7zm10-5h2a2 2 0 012 2v1a3 3 0 01-3 3h-1M7 7H5a2 2 0 00-2 2v1a3 3 0 003 3h1" />
      </svg>
    ),
  },
];

export default function TheBoardGamesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = (rawTab === 'daily' || rawTab === 'daily-league' || rawTab === 'league')
    ? 'daily-league'
    : (rawTab === 'monthly' || rawTab === 'monthly-tournament' || rawTab === 'tournament')
    ? 'monthly-tournament'
    : 'championship';

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const [activeArenaMatch, setActiveArenaMatch] = useState(LEAGUE_MATCHES[0]);
  const [selectedDay, setSelectedDay] = useState(() => {
    return TOURNAMENT_DAYS.find(d => d.isLive) || TOURNAMENT_DAYS[0];
  });
  const [calendarFilter, setCalendarFilter] = useState('matches'); // 'matches' | 'all' | 'league' | 'knockout'
  const [calendarViewMode, setCalendarViewMode] = useState('strip'); // 'strip' | 'grid' on mobile
  const [showStandingsDrawer, setShowStandingsDrawer] = useState(false);
  const [arenaStageTab, setArenaStageTab] = useState('all'); // 'all' | 'league' | 'knockout'
  const [copied, setCopied] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [reconciledRatings, setReconciledRatings] = useState({});

  const trackScrollRef = useRef(null);

  // Poll live ratings from chess.com / lichess
  useEffect(() => {
    let isMounted = true;
    async function pollLiveRatings() {
      const allPlayers = VARSITY_TEAMS.flatMap(t => (t.players || []));
      for (const p of allPlayers) {
        if (!p.handle) continue;
        try {
          const data = await fetchCompletePlayerData(p.handle, p.platform || 'chess.com');
          if (data?.rating && isMounted) {
            setReconciledRatings(prev => {
              const key = p.id || `${p.platform}:${p.handle}`;
              if (prev[key] === data.rating) return prev;
              return { ...prev, [key]: data.rating };
            });
          }
        } catch {
          // Graceful fallback
        }
      }
    }
    pollLiveRatings();
    return () => { isMounted = false; };
  }, []);

  const institutionCards = useMemo(() => {
    return ORDERED_INSTITUTION_IDS.map(id => {
      const team = VARSITY_TEAMS.find(t => t.id === id) || {};
      const meta = INSTITUTION_METAS[id] || {};
      const rawPlayers = team.players || [];
      const players = rawPlayers.map(p => {
        const key = p.id || `${p.platform}:${p.handle}`;
        const live = reconciledRatings[key];
        return {
          ...p,
          rating: live || p.rating
        };
      });
      const ratings = players.map(p => p.rating).filter(Boolean);
      const minRating = ratings.length ? Math.min(...ratings) : 1200;
      const maxRating = ratings.length ? Math.max(...ratings) : 2200;
      const avgRating = ratings.length 
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) 
        : (team.averageRating || 1200);
      const board1 = players.find(p => p.board === 1);
      return {
        id,
        name: team.name || meta.short,
        short: meta.short || team.shortName || id.toUpperCase(),
        color: meta.color || team.color || '#E8640A',
        motto: meta.motto || team.nickname || 'theBoardGames Contender',
        notable: meta.notable || '',
        nickname: team.nickname || '',
        location: team.location || team.name,
        averageRating: avgRating,
        record: team.record || { wins: 0, draws: 0, losses: 0 },
        recentForm: team.recentForm || ['W', 'W', 'W', 'D', 'W'],
        players,
        board1,
        ratingRange: `${minRating} – ${maxRating}`,
        points: team.points || 0
      };
    });
  }, [reconciledRatings]);

  // Filtered universities based on search query
  const filteredInstitutions = useMemo(() => {
    if (!searchQuery.trim()) return institutionCards;
    const q = searchQuery.toLowerCase().trim();
    return institutionCards.filter(u => {
      const matchesUni = u.name.toLowerCase().includes(q) || u.short.toLowerCase().includes(q);
      const matchesPlayer = (u.players || []).some(p => p.name?.toLowerCase().includes(q) || p.handle?.toLowerCase().includes(q));
      return matchesUni || matchesPlayer;
    });
  }, [institutionCards, searchQuery]);

  // Filtered calendar days based on current tab
  const filteredDays = useMemo(() => {
    if (calendarFilter === 'matches') {
      return TOURNAMENT_DAYS.filter(d => d.hasMatch);
    }
    if (calendarFilter === 'league') {
      return TOURNAMENT_DAYS.filter(d => d.hasMatch && d.phase?.includes('League'));
    }
    if (calendarFilter === 'knockout') {
      return TOURNAMENT_DAYS.filter(d => d.hasMatch && !d.phase?.includes('League'));
    }
    return TOURNAMENT_DAYS;
  }, [calendarFilter]);

  // Filtered arena deck matches based on tab
  const filteredArenaMatches = useMemo(() => {
    if (arenaStageTab === 'league') {
      return LEAGUE_MATCHES.filter(m => m.matchNumber != null);
    }
    if (arenaStageTab === 'knockout') {
      return LEAGUE_MATCHES.filter(m => m.matchNumber == null);
    }
    return LEAGUE_MATCHES;
  }, [arenaStageTab]);

  const toggleCardFlip = (teamId) => {
    setFlippedCards(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const handlePlayerClick = (e, player, uni) => {
    e.stopPropagation();
    const isLichess = player.platform === 'lichess';
    setSelectedPlayerForModal({
      ...player,
      name: player.name,
      username: player.handle,
      platform: player.platform,
      chess_username: player.handle_c || (!isLichess ? player.handle : undefined),
      lichess_username: player.handle_l || (isLichess ? player.handle : undefined),
      university: uni.name,
      school: uni.name,
      department: `Board ${player.board} • ${uni.short}`,
      rating: player.rating,
      chess_rating: !isLichess ? player.rating : undefined,
      lichess_rating: isLichess ? player.rating : undefined,
      stats: player.stats || {},
      P: player.stats?.played || 6,
      W: player.stats?.wins || 0,
      D: player.stats?.draws || 0,
      L: player.stats?.losses || 0,
    });
  };

  const handleCopyLink = (linkOverride) => {
    const link = typeof linkOverride === 'string' ? linkOverride : activeArenaMatch.link;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Lichess Arena link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.info(`Arena Link: ${link}`);
    });
  };

  const handleShare = (matchOrDay) => {
    const targetLink = matchOrDay?.arenaLink || matchOrDay?.link || activeArenaMatch.link;
    const targetTitle = matchOrDay?.title || activeArenaMatch.title;
    const isLive = matchOrDay?.isLive !== undefined ? matchOrDay.isLive : activeArenaMatch.isLive;
    const shareData = {
      title: `${targetTitle} | SS4 Chess League`,
      text: `${targetTitle} is ${isLive ? 'LIVE' : 'available'} on Lichess!\nFeaturing top university chess players in Nigeria.\n\nLink: ${targetLink}`,
      url: targetLink
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyLink(targetLink);
    }
  };

  // Next / Prev arena match navigation
  const currentArenaIdx = LEAGUE_MATCHES.findIndex(m => m.id === activeArenaMatch.id);
  const handlePrevArena = () => {
    if (currentArenaIdx > 0) {
      setActiveArenaMatch(LEAGUE_MATCHES[currentArenaIdx - 1]);
      setIframeLoaded(false);
    }
  };
  const handleNextArena = () => {
    if (currentArenaIdx < LEAGUE_MATCHES.length - 1) {
      setActiveArenaMatch(LEAGUE_MATCHES[currentArenaIdx + 1]);
      setIframeLoaded(false);
    }
  };

  return (
    <div className="w-full bg-brand-bg-cream text-brand-text-dark min-h-screen selection:bg-[#B84D00] selection:text-white font-avenir pb-16">

      {/* ── UNIFIED SCL COMPETITION TABS ── */}
      <PrimaryTabs
        tabs={COMPETITION_TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
        sticky={true}
        stickyTop="top-16 lg:top-20"
      />

      {/* ── TAB 1: theBOARDGAMES Championship ── */}
      {activeTab === 'championship' && (
        <React.Fragment>
      {/* ── 0. STICKY QUICK-NAVIGATION SUB-BAR ── */}
      <nav
        aria-label="theBoardGames Quick Navigation"
        className="sticky top-[120px] lg:top-[136px] z-30 bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(15,23,42,0.05)] py-2 px-3 sm:px-6 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Logo / Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-space font-black text-sm sm:text-base text-brand-text-dark leading-none">
              <span>the</span>
              <span className="text-[#B84D00]">BOARDGAMES</span>
            </span>
            <span className="text-[10px] font-extrabold font-space px-2 py-0.5 rounded-md bg-[#FFEEDB] text-[#2E0E00] uppercase tracking-wider">
              Oct &apos;26
            </span>
          </div>

          {/* Quick Anchor Pills */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-xs font-bold text-slate-600">
            <a
              href="#schedule"
              className="px-2.5 py-1.5 rounded-lg hover:bg-[#F0EEEA] hover:text-brand-text-dark transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#B84D00]"
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline">Schedule</span>
            </a>
            <a
              href="#arena-broadcast-deck"
              className="px-2.5 py-1.5 rounded-lg hover:bg-[#FFEEDB] hover:text-[#2E0E00] transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#B84D00]"
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-[#B84D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Arena Deck</span>
            </a>
            <a
              href="#time-controls"
              className="px-2.5 py-1.5 rounded-lg hover:bg-[#F0EEEA] hover:text-brand-text-dark transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#B84D00]"
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Time Controls</span>
            </a>
            <a
              href="#institutions"
              className="px-2.5 py-1.5 rounded-lg hover:bg-[#F0EEEA] hover:text-brand-text-dark transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#B84D00]"
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 21h18M4 18h16M6 18V9m4 9V9m4 9V9m4 9V9M2 9l10-6 10 6" />
              </svg>
              <span>Squads</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── 1. HERO & TOURNAMENT STATS SECTION ── */}
      <section className="relative bg-white pt-5 sm:pt-7 pb-6 sm:pb-8 px-3 sm:px-6 lg:px-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Category Overline & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-[#FFEEDB] text-[#2E0E00] px-3 py-1 rounded-full text-[11px] font-extrabold font-space uppercase tracking-wider">
                <span>SS4 Chess League</span>
                <span>•</span>
                <span>October Championship</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-space tracking-tight text-brand-text-dark leading-tight">
                the<span className="text-[#B84D00]">BOARDGAMES</span> Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                Official tournament arena center for Nigeria&apos;s elite university chess championship. 11 premier universities, 13 verified stages, and live game-by-game records.
              </p>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 shrink-0">
              <a
                href={ARENA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#B84D00] hover:bg-[#963F00] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00]"
              >
                <span>Latest Arena on Lichess</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F0EEEA] hover:bg-[#E5E2DC] text-brand-text-dark text-xs sm:text-sm font-bold transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00]"
              >
                <svg className="w-4 h-4 text-[#B84D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Poster</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Strip (Responsive 2x2 grid on mobile, 4-col on tablet/desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white rounded-xl p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <span className="text-[10px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">Universities</span>
              <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">11 Universities</span>
              <span className="text-[11px] text-slate-600 font-medium">Bells, UNIUYO, UNILORIN...</span>
            </div>
            <div className="bg-white rounded-xl p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <span className="text-[10px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">Tournament Matches</span>
              <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">13 Stages</span>
              <span className="text-[11px] text-slate-600 font-medium">8 Arenas • 5 Knockouts</span>
            </div>
            <div className="bg-white rounded-xl p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <span className="text-[10px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">Active Contenders</span>
              <span className="text-xl sm:text-2xl font-black font-space text-[#B84D00] block mt-0.5">67+ Masters</span>
              <span className="text-[11px] text-slate-600 font-medium">Verified student players</span>
            </div>
            <div className="bg-white rounded-xl p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <span className="text-[10px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">Games Recorded</span>
              <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">770 Games</span>
              <span className="text-[11px] text-slate-600 font-medium">With real Lichess PGNs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TOURNAMENT CALENDAR & MATCH TRACKER SECTION ── */}
      <section id="schedule" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Section Header & View Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#B84D00]"></span>
              <span className="text-xs font-extrabold font-space uppercase tracking-wider text-[#B84D00]">
                October 2026 Schedule
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space text-brand-text-dark tracking-tight">
              Match Schedule & Daily Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Select any match day to inspect confirmed podiums, participant numbers, and official scores.
            </p>
          </div>

          {/* Filter Pills & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex bg-[#F0EEEA] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                aria-pressed={calendarFilter === 'matches'}
                onClick={() => setCalendarFilter('matches')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarFilter === 'matches'
                    ? 'bg-white text-brand-text-dark shadow-2xs font-black'
                    : 'hover:text-brand-text-dark'
                }`}
              >
                Match Days ({EVENTS.filter((e) => e.link).length})
              </button>
              <button
                type="button"
                aria-pressed={calendarFilter === 'all'}
                onClick={() => setCalendarFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarFilter === 'all'
                    ? 'bg-white text-brand-text-dark shadow-2xs font-black'
                    : 'hover:text-brand-text-dark'
                }`}
              >
                All Oct (23)
              </button>
              <button
                type="button"
                aria-pressed={calendarFilter === 'league'}
                onClick={() => setCalendarFilter('league')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarFilter === 'league'
                    ? 'bg-white text-brand-text-dark shadow-2xs font-black'
                    : 'hover:text-brand-text-dark'
                }`}
              >
                League (M1–8)
              </button>
              <button
                type="button"
                aria-pressed={calendarFilter === 'knockout'}
                onClick={() => setCalendarFilter('knockout')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarFilter === 'knockout'
                    ? 'bg-white text-brand-text-dark shadow-2xs font-black'
                    : 'hover:text-brand-text-dark'
                }`}
              >
                Knockouts
              </button>
            </div>

            {/* View Mode Toggle on Mobile */}
            <div className="inline-flex lg:hidden bg-[#F0EEEA] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
              <button
                type="button"
                aria-pressed={calendarViewMode === 'strip'}
                onClick={() => setCalendarViewMode('strip')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarViewMode === 'strip' ? 'bg-white text-[#B84D00] shadow-2xs font-black' : 'hover:text-brand-text-dark'
                }`}
                title="Horizontal Strip View"
                aria-label="Horizontal Strip View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                aria-pressed={calendarViewMode === 'grid'}
                onClick={() => setCalendarViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  calendarViewMode === 'grid' ? 'bg-white text-[#B84D00] shadow-2xs font-black' : 'hover:text-brand-text-dark'
                }`}
                title="Calendar Grid View"
                aria-label="Calendar Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Viewport Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">

          {/* LEFT COLUMN: Date Selector (Horizontal Strip on Mobile or Responsive Grid) */}
          <div className="lg:col-span-7 flex flex-col space-y-2">

            {/* 1. Mobile Carousel Strip (Default on Mobile) */}
            <div className={`lg:hidden ${calendarViewMode === 'strip' ? 'block' : 'hidden'}`}>
              <div
                ref={trackScrollRef}
                className="flex gap-2 overflow-x-auto no-scrollbar py-1.5 px-0.5 snap-x scroll-smooth"
              >
                {filteredDays.map((d) => {
                  const isSelected = selectedDay.day === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedDay(d)}
                      aria-label={`Select October ${d.day}${d.gridLabel ? ` - ${d.gridLabel}` : ''}`}
                      className={`min-w-[78px] sm:min-w-[88px] flex-shrink-0 snap-start rounded-2xl p-2.5 flex flex-col items-center justify-between transition-all cursor-pointer select-none text-center relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00] ${
                        isSelected
                          ? 'bg-[#B84D00] text-white shadow-sm'
                          : d.hasMatch
                            ? 'bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:bg-[#FFEEDB]/50 text-slate-800'
                            : 'bg-[#ECE9E3]/70 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[9px] font-bold uppercase tracking-wider mb-1">
                        <span className={isSelected ? 'text-orange-100' : 'text-slate-500'}>
                          {d.weekday}
                        </span>
                        {d.isLive && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-600'}`}></span>
                        )}
                        {d.isCompleted && (
                          <svg
                            className={`w-3 h-3 shrink-0 ${isSelected ? 'text-orange-100' : 'text-[#B84D00]'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <span className={`text-xl font-black font-space leading-none my-1 ${
                        isSelected ? 'text-white' : d.hasMatch ? 'text-brand-text-dark' : 'text-slate-400'
                      }`}>
                        {d.day}
                      </span>

                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : d.hasMatch
                            ? 'bg-[#F0EEEA] text-slate-700'
                            : 'text-slate-400'
                      }`}>
                        {d.gridLabelShort || 'Rest'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] font-bold text-slate-500 text-right pr-1 pt-1">
                &larr; Scroll dates horizontally &rarr;
              </div>
            </div>

            {/* 2. Responsive Grid (Always on Desktop, Optional on Mobile) */}
            <div className={`${calendarViewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 sm:gap-2">
                {filteredDays.map((d) => {
                  const isSelected = selectedDay.day === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedDay(d)}
                      aria-label={`Select October ${d.day}${d.gridLabel ? ` - ${d.gridLabel}` : ''}`}
                      className={`h-[58px] sm:h-[64px] rounded-xl flex flex-col items-center justify-between px-1.5 py-1.5 transition-all cursor-pointer select-none text-center relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00] ${
                        isSelected
                          ? 'bg-[#B84D00] text-white shadow-sm'
                          : d.hasMatch
                            ? 'bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:bg-[#FFEEDB]/50 text-slate-800'
                            : 'bg-[#ECE9E3]/70 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider">
                        <span className={isSelected ? 'text-orange-100' : 'text-slate-500'}>
                          {d.weekday}
                        </span>
                        {d.isLive && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-600'}`}></span>
                        )}
                      </div>

                      <span className={`text-base sm:text-lg font-black font-space leading-none ${
                        isSelected ? 'text-white' : d.hasMatch ? 'text-brand-text-dark' : 'text-slate-400 font-medium'
                      }`}>
                        {d.day}
                      </span>

                      {d.gridLabel ? (
                        <span className={`text-[8.5px] sm:text-[9.5px] font-bold leading-none truncate max-w-full px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : d.isLive
                              ? 'text-emerald-800 bg-emerald-100 font-black'
                              : 'text-slate-700 bg-[#F0EEEA]'
                        }`}>
                          <span>{d.gridLabelShort}</span>
                        </span>
                      ) : (
                        <span className="text-[8px] text-slate-400">Rest</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper Legend */}
            <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-600 font-medium px-1 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B84D00]"></span>
                  <span>Match Day</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>Live</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D9D5CD]"></span>
                  <span>Rest Day</span>
                </span>
              </div>
              <span>Click any date to inspect match</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Active Day Details Card */}
          <div className="lg:col-span-5 flex flex-col">
            <AnimatePresence mode="wait">
              <Motion.div
                key={selectedDay.day}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex flex-col justify-between"
              >
                {selectedDay.hasMatch ? (
                  /* ── MATCH DAY VIEW ── */
                  <div className="space-y-3.5">

                    {/* Header Row */}
                    <div className="pb-1 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                          Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                        </span>
                        <span className="text-xs font-extrabold font-space text-[#B84D00] uppercase tracking-wide leading-tight">
                          {selectedDay.phase} &bull; {selectedDay.stage}
                        </span>
                      </div>

                      {selectedDay.isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold font-space bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Live Tonight
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold font-space uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFEEDB] text-[#2E0E00] flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#B84D00]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1c1.98-.44 3.49-2.07 3.61-4.06C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                          </svg>
                          <span>Official Results</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Key Stats */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black font-space text-brand-text-dark leading-tight">
                        {selectedDay.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {selectedDay.totalPlayers > 0 && (
                          <span className="text-xs font-bold text-slate-700 bg-[#F6F4F0] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{selectedDay.totalPlayers} Contenders</span>
                          </span>
                        )}
                        {selectedDay.totalGames > 0 && (
                          <span className="text-xs font-bold text-slate-700 bg-[#F6F4F0] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{selectedDay.totalGames} Games</span>
                          </span>
                        )}
                        <span className="text-xs font-black text-[#2E0E00] bg-[#FFEEDB] px-2.5 py-1 rounded-lg font-mono">
                          {selectedDay.timeControl}
                        </span>
                      </div>
                    </div>

                    {/* Official Podium Winners */}
                    {selectedDay.results?.podium && selectedDay.results.podium.length >= 3 && (
                      <div className="bg-[#F6F4F0] rounded-xl p-3">
                        <span className="text-[10px] font-extrabold font-space uppercase tracking-wider text-slate-500 block mb-2">
                          Official Top 3 Podium
                        </span>

                        <div className="grid grid-cols-3 gap-2">
                          {/* 2nd Place */}
                          <div className="bg-white rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                            <div>
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black font-space mx-auto flex items-center justify-center mb-1">
                                2
                              </span>
                              <span className="text-xs font-black text-brand-text-dark block truncate" title={selectedDay.results.podium[1].name}>
                                {selectedDay.results.podium[1].name}
                              </span>
                            </div>
                            <div className="mt-1.5">
                              <span className="text-xs font-black text-slate-800">{selectedDay.results.podium[1].score} pts</span>
                              <span className="text-[10px] text-slate-500 block font-mono">Elo {selectedDay.results.podium[1].rating}</span>
                            </div>
                          </div>

                          {/* 1st Place Champion */}
                          <div className="bg-[#FFEEDB] text-[#2E0E00] rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                            <div>
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black font-space mx-auto flex items-center justify-center mb-1">
                                1
                              </span>
                              <span className="text-xs font-black text-[#2E0E00] block truncate" title={selectedDay.results.podium[0].name}>
                                {selectedDay.results.podium[0].name}
                              </span>
                            </div>
                            <div className="mt-1.5">
                              <span className="text-xs font-black text-[#2E0E00]">{selectedDay.results.podium[0].score} pts</span>
                              <span className="text-[10px] text-[#B84D00] font-mono font-bold block">Elo {selectedDay.results.podium[0].rating}</span>
                            </div>
                          </div>

                          {/* 3rd Place */}
                          <div className="bg-white rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                            <div>
                              <span className="w-5 h-5 rounded-full bg-[#FFEEDB] text-[#2E0E00] text-[10px] font-black font-space mx-auto flex items-center justify-center mb-1">
                                3
                              </span>
                              <span className="text-xs font-black text-brand-text-dark block truncate" title={selectedDay.results.podium[2].name}>
                                {selectedDay.results.podium[2].name}
                              </span>
                            </div>
                            <div className="mt-1.5">
                              <span className="text-xs font-black text-slate-800">{selectedDay.results.podium[2].score} pts</span>
                              <span className="text-[10px] text-slate-500 block font-mono">Elo {selectedDay.results.podium[2].rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expandable Top 10 Standings Drawer */}
                    {selectedDay.results?.standings && selectedDay.results.standings.length > 0 && (
                      <div className="rounded-xl overflow-hidden bg-[#F6F4F0]">
                        <button
                          type="button"
                          aria-expanded={showStandingsDrawer}
                          onClick={() => setShowStandingsDrawer(!showStandingsDrawer)}
                          className="w-full px-3.5 py-2.5 bg-[#F0EEEA] hover:bg-[#E7E4DE] text-xs font-black text-brand-text-dark flex items-center justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B84D00]"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#B84D00] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Top 10 Match Standings ({selectedDay.results.standings.length})</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                            <span>{showStandingsDrawer ? 'Hide' : 'Expand'}</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${showStandingsDrawer ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>

                        {showStandingsDrawer && (
                          <div className="overflow-x-auto max-h-56 no-scrollbar bg-white text-xs">
                            <table className="w-full text-left">
                              <thead className="bg-[#F6F4F0] text-[10px] font-extrabold font-space text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2 px-3 text-center">#</th>
                                  <th className="py-2 px-3">Player</th>
                                  <th className="py-2 px-3 text-center">Score</th>
                                  <th className="py-2 px-3 text-right">Rating</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F0EEEA] font-medium">
                                {selectedDay.results.standings.map((p) => (
                                  <tr key={p.rank} className="hover:bg-[#F6F4F0]/60 transition-colors">
                                    <td className="py-2 px-3 text-center font-bold text-slate-500">{p.rank}</td>
                                    <td className="py-2 px-3 font-bold text-brand-text-dark truncate max-w-[140px]">{p.name}</td>
                                    <td className="py-2 px-3 text-center font-black text-slate-800">{p.score}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-500 text-[11px]">{p.rating}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar (Mobile Responsive Stack) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      {selectedDay.arenaLink ? (
                        <>
                          <a
                            href={selectedDay.arenaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B84D00] hover:bg-[#963F00] text-white font-bold text-xs shadow-2xs hover:shadow transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00]"
                          >
                            <span>Open on Lichess</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(selectedDay.arenaLink)}
                              className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#F0EEEA] hover:bg-[#E5E2DC] text-brand-text-dark font-bold text-xs transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B84D00]"
                            >
                              <svg className="w-3.5 h-3.5 text-[#B84D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShare(selectedDay)}
                              className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#F0EEEA] hover:bg-[#E5E2DC] text-brand-text-dark font-bold text-xs transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B84D00]"
                            >
                              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              <span>Share</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-600 font-medium py-1">
                          Official arena link will be shared on match day.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── NO MATCH SCHEDULED VIEW ── */
                  <div className="space-y-3">
                    <div className="pb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                      </span>
                      <span className="text-xs font-extrabold font-space text-slate-500 uppercase tracking-wide">
                        Tournament Calendar
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black font-space text-brand-text-dark">
                        No Matches Scheduled
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {selectedDay.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F6F4F0] text-xs text-slate-600 flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Select any match day highlighted in the schedule above to review games and official results.</span>
                    </div>
                  </div>
                )}
              </Motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── 3. LIVE ARENA CENTER (theBOARDGAMES Arena Broadcast Deck) ── */}
      <section id="arena-broadcast-deck" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16">

        {/* Arena Header & Stage Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${activeArenaMatch.isLive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
              <span className={`text-xs font-extrabold font-space uppercase tracking-wider ${
                activeArenaMatch.isLive ? 'text-emerald-700' : 'text-slate-600'
              }`}>
                {activeArenaMatch.isLive ? 'LIVE BROADCAST • OFFICIAL ARENA' : 'OFFICIAL ARENA ARCHIVE & REPLAY'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space text-brand-text-dark tracking-tight">
              {activeArenaMatch.title} Arena
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Hosted on Lichess.org &bull; ID:{' '}
              <code className="text-[#2E0E00] font-mono font-bold bg-[#FFEEDB] px-2 py-0.5 rounded-md">
                {activeArenaMatch.id}
              </code>
            </p>
          </div>

          {/* Match Stage Selector & Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

            {/* Stage Tabs (League vs Knockouts) */}
            <div className="inline-flex bg-[#F0EEEA] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
              <button
                type="button"
                aria-pressed={arenaStageTab === 'all'}
                onClick={() => setArenaStageTab('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  arenaStageTab === 'all' ? 'bg-white text-brand-text-dark shadow-2xs font-black' : 'hover:text-brand-text-dark'
                }`}
              >
                All ({LEAGUE_MATCHES.length})
              </button>
              <button
                type="button"
                aria-pressed={arenaStageTab === 'league'}
                onClick={() => setArenaStageTab('league')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  arenaStageTab === 'league' ? 'bg-white text-brand-text-dark shadow-2xs font-black' : 'hover:text-brand-text-dark'
                }`}
              >
                League (M1–8)
              </button>
              <button
                type="button"
                aria-pressed={arenaStageTab === 'knockout'}
                onClick={() => setArenaStageTab('knockout')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  arenaStageTab === 'knockout' ? 'bg-white text-brand-text-dark shadow-2xs font-black' : 'hover:text-brand-text-dark'
                }`}
              >
                Knockouts (4)
              </button>
            </div>

            {/* Prev / Next Match Jumpers */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevArena}
                disabled={currentArenaIdx === 0}
                className="px-3 py-2 rounded-xl bg-white text-xs font-bold text-brand-text-dark hover:bg-[#F0EEEA] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#B84D00]"
                title="Previous Match"
              >
                &larr; Prev
              </button>
              <button
                type="button"
                onClick={handleNextArena}
                disabled={currentArenaIdx === LEAGUE_MATCHES.length - 1}
                className="px-3 py-2 rounded-xl bg-white text-xs font-bold text-brand-text-dark hover:bg-[#F0EEEA] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#B84D00]"
                title="Next Match"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Horizontal Match Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-[#F0EEEA] rounded-2xl mb-4">
          {filteredArenaMatches.map((match) => {
            const isActive = activeArenaMatch.id === match.id;
            return (
              <button
                key={match.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveArenaMatch(match);
                  setIframeLoaded(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-[#B84D00] ${
                  isActive
                    ? 'bg-[#B84D00] text-white shadow-xs'
                    : 'text-slate-700 hover:text-brand-text-dark hover:bg-white'
                }`}
              >
                {match.isLive && (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-300' : 'bg-emerald-600'}`}></span>
                )}
                <span>{match.shortTitle}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#E5E2DC] text-slate-700'
                }`}>
                  {match.isLive ? 'LIVE' : match.timeControl}
                </span>
              </button>
            );
          })}
        </div>

        {/* Arena Frame Container */}
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">

          {/* Arena Control Deck Bar */}
          <div className="bg-[#0B192C] text-white px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-200">{activeArenaMatch.title}:</span>
              <span className="text-[#E8640A] font-bold">{activeArenaMatch.stage || activeArenaMatch.dateStr}</span>
              {activeArenaMatch.winner && (
                <span className="hidden md:inline text-slate-300">&bull; 1st: {activeArenaMatch.winner}</span>
              )}
            </div>

            {/* View Mode & Utility Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                title={isExpanded ? "Collapse View" : "Expand Arena Height"}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {isExpanded ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  )}
                </svg>
                <span>{isExpanded ? 'Default Size' : 'Expand Height'}</span>
              </button>

              <a
                href={activeArenaMatch.link}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E8640A] hover:bg-[#c95307] text-white text-xs font-black transition-all cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                title="Launch in Full Window"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open in Lichess</span>
              </a>
            </div>
          </div>

          {/* Iframe Arena Canvas with Mobile-Friendly Responsive Heights */}
          <div className={`relative w-full bg-[#181614] flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? 'h-[620px] sm:h-[780px] lg:h-[900px]'
              : 'h-[420px] sm:h-[540px] lg:h-[680px]'
          }`}>
            {/* Loading Indicator */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181614] text-white z-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E8640A]/15 flex items-center justify-center text-[#E8640A] mb-3 animate-pulse">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 22H5v-2h14v2zm-3-4H8v-1.5c0-.83.67-1.5 1.5-1.5h.5c0-.87-.39-1.65-1-2.18V11c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1.82c-.61.53-1 1.31-1 2.18h.5c.83 0 1.5.67 1.5 1.5V18zm-4-11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-200">Connecting to Lichess Arena...</p>
                <p className="text-xs text-slate-400 mt-1">{activeArenaMatch.title}</p>
              </div>
            )}

            <iframe
              key={activeArenaMatch.id}
              src={activeArenaMatch.link}
              title={`${activeArenaMatch.title} Live Arena`}
              className="w-full h-full border-none"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          </div>

          {/* Dedicated Arena Footer Strip */}
          <div className="bg-[#F6F4F0] px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#FFEEDB] text-[#B84D00] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 22H5v-2h14v2zm-3-4H8v-1.5c0-.83.67-1.5 1.5-1.5h.5c0-.87-.39-1.65-1-2.18V11c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1.82c-.61.53-1 1.31-1 2.18h.5c.83 0 1.5.67 1.5 1.5V18zm-4-11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </span>
              <span>
                <strong className="text-brand-text-dark">Direct Lichess Arena Access:</strong> If browser cookie policies limit pairings, open directly on Lichess.
              </span>
            </div>

            <a
              href={activeArenaMatch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-black text-[#B84D00] hover:text-[#963F00] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B84D00]"
            >
              <span>Launch {activeArenaMatch.title} on Lichess &rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. OFFICIAL TIME CONTROLS (Material 3 Expressive Tonal Cards) ── */}
      <section id="time-controls" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-14 sm:pt-18">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs font-extrabold font-space uppercase tracking-widest text-[#B84D00] mb-1">
            Match Dynamics
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space tracking-tight text-brand-text-dark">
            Official Battle Time Controls
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium leading-relaxed">
            theBOARDGAMES features three certified FIDE & online chess clocks to test tactical speed, intuition, and deep positional accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {TIME_CONTROLS.map((tc, idx) => (
            <div
              key={idx}
              className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold font-space uppercase tracking-wider ${tc.pillClass}`}
                >
                  {tc.mode}
                </span>
                <span className="text-[11px] font-bold text-slate-500">{tc.badge}</span>
              </div>

              <div className="text-3xl sm:text-4xl font-black font-space tracking-tight text-brand-text-dark mb-2">
                {tc.time}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {tc.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CONTESTING INSTITUTIONS (Interactive Flip Cards with 5-Board Rosters) ── */}
      <section id="institutions" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-14 sm:pt-18">

        {/* Section Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <p className="text-xs font-extrabold font-space uppercase tracking-widest text-brand-primary">
                Participating Universities
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space tracking-tight text-brand-text-dark">
              11 Premier Nigerian Institutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Click or tap any university card to flip and inspect verified 5-board student rosters.
            </p>
          </div>

          {/* Search Box on Mobile & Desktop */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university or player..."
                className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#B84D00]/30 text-brand-text-dark placeholder-slate-400"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <a
              href="/chess-league/varsity"
              className="text-xs font-extrabold font-space text-[#00194B] hover:text-brand-primary transition-colors flex items-center gap-1 shrink-0 px-3.5 py-2.5 rounded-xl bg-[#E8EFFF] hover:bg-[#D8E5FF] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span>Full Varsity Hub &rarr;</span>
            </a>
          </div>
        </div>

        {/* Institution Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInstitutions.map((uni) => {
            const isFlipped = !!flippedCards[uni.id];

            return (
              <div
                key={uni.id}
                onClick={() => toggleCardFlip(uni.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCardFlip(uni.id);
                  }
                }}
                aria-label={`${uni.name} roster card. Click to flip.`}
                className="perspective-1000 h-[300px] cursor-pointer group focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84D00] rounded-2xl select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE: University Card */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all p-4 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Bar: University Short & Rating */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-black font-space uppercase tracking-wider text-brand-text-dark">
                          {uni.short}
                        </span>
                        <span className="text-[11px] font-bold font-mono text-slate-700 bg-[#F0EEEA] px-2 py-0.5 rounded-md">
                          {uni.averageRating} Elo
                        </span>
                      </div>

                      {/* University Full Name */}
                      <h4 className="text-sm font-black text-brand-text-dark font-space leading-snug line-clamp-2">
                        {uni.name}
                      </h4>

                      {/* Team Tournament Standing & Points */}
                      <div className="mt-2.5 bg-[#F6F4F0] rounded-xl p-2 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-[9px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">
                            League Points
                          </span>
                          <span className="text-xs font-bold text-brand-text-dark truncate block leading-tight mt-0.5">
                            {uni.points} Pts
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-black text-[#B84D00] bg-white shadow-2xs px-2 py-0.5 rounded-md shrink-0">
                          Rank #{ORDERED_INSTITUTION_IDS.indexOf(uni.id) + 1}
                        </span>
                      </div>

                      {/* University Metrics */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-[#F6F4F0] rounded-xl p-2 text-left">
                          <span className="text-[9px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">
                            Match Record
                          </span>
                          <span className="text-xs font-black font-space text-brand-text-dark block mt-0.5">
                            {uni.record ? `${uni.record.wins}W • ${uni.record.draws}D • ${uni.record.losses}L` : 'Active'}
                          </span>
                        </div>
                        <div className="bg-[#F6F4F0] rounded-xl p-2 text-left">
                          <span className="text-[9px] font-extrabold font-space uppercase tracking-wider text-slate-500 block">
                            Rating Range
                          </span>
                          <span className="text-xs font-black font-mono text-brand-text-dark block mt-0.5">
                            {uni.ratingRange}
                          </span>
                        </div>
                      </div>

                      {/* Recent Form */}
                      {uni.recentForm && uni.recentForm.length > 0 && (
                        <div className="flex items-center justify-between px-1 mt-2">
                          <span className="text-[9px] font-extrabold font-space uppercase tracking-wider text-slate-500">
                            Recent Form
                          </span>
                          <div className="flex items-center gap-1">
                            {uni.recentForm.map((result, rIdx) => (
                              <span
                                key={rIdx}
                                className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center font-mono ${
                                  result === 'W'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : result === 'D'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Roster Flip Action */}
                    <div className="pt-2 flex items-center justify-end text-xs font-bold text-[#B84D00]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B84D00] group-hover:underline">
                        <span>View 5-Board Roster</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE: SS4 Varsity Navy Roster with Clickable Names */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-[#0B192C] text-white shadow-md p-4 flex flex-col justify-between overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-1 shrink-0">
                      <span className="text-xs font-black text-white font-space uppercase tracking-wider">
                        {uni.short} Roster
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardFlip(uni.id);
                        }}
                        className="px-2 py-1 rounded-md bg-white/15 hover:bg-white text-white hover:text-[#0B192C] text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                        title="Flip back"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                    </div>

                    {/* 5-Board Player List */}
                    <div className="space-y-1 flex-1 flex flex-col justify-center py-0.5">
                      {uni.players && uni.players.length > 0 ? (
                        uni.players
                          .slice()
                          .sort((a, b) => a.board - b.board)
                          .map((player) => (
                            <div
                              key={player.id || player.board}
                              className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/10 hover:bg-white/15 transition-all text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="w-4 h-4 rounded bg-white/20 text-white font-mono text-[9px] font-black flex items-center justify-center shrink-0">
                                  B{player.board}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handlePlayerClick(e, player, uni)}
                                  className="font-bold text-white hover:text-amber-200 hover:underline truncate text-left cursor-pointer transition-colors"
                                  title={`View ${player.name}'s profile`}
                                >
                                  {player.name}
                                </button>
                              </div>
                              <span className="text-[10px] text-white/75 font-mono shrink-0 pl-1.5">
                                {player.rating}
                              </span>
                            </div>
                          ))
                      ) : (
                        <div className="py-4 text-center text-xs text-white/70">
                          Roster pending
                        </div>
                      )}
                    </div>

                    {/* Footer hint */}
                    <div className="pt-1.5 text-center shrink-0">
                      <span className="text-[10px] text-white/60">
                        Tap player name to view info
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstitutions.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.04)] mt-4">
            <p className="text-sm font-bold text-slate-700">No universities or players matched &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-[#B84D00] hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        )}
      </section>
      </React.Fragment>
      )}

      {/* ── TAB 2: Daily League Arenas & Standings ── */}
      {activeTab === 'daily-league' && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="mb-6 space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#FFEEDB] text-[#2E0E00] px-3 py-1 rounded-full text-[11px] font-extrabold font-space uppercase tracking-wider">
              <span>SS4 Chess League</span>
              <span>•</span>
              <span>Daily Arena Series</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-space text-brand-text-dark tracking-tight">
              Daily League Leaderboard &amp; Arenas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              Official cumulative standings, nightly blitz results, and performance ratings across all SCL Daily Arenas on Lichess.
            </p>
          </div>

          <DailyFriendliesLeaderboard
            onPlayerSelect={(p) => setSelectedPlayerForModal(p)}
          />
        </section>
      )}

      {/* ── TAB 3: Monthly Tournaments Hub ── */}
      {activeTab === 'monthly-tournament' && (
        <div className="w-full">
          <ChessTournamentPage />
        </div>
      )}

      {/* ── 6. POSTER FULLSCREEN ZOOM MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
          >
            <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
              <img
                src="/october-tournament-poster.png"
                alt="theBOARDGAMES Full Poster"
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                Close Viewer &times;
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. PLAYER PROFILE MODAL ── */}
      {selectedPlayerForModal && (
        <PlayerProfile
          player={selectedPlayerForModal}
          onClose={() => setSelectedPlayerForModal(null)}
        />
      )}
    </div>
  );
}
