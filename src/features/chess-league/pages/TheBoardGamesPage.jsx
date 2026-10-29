import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { VARSITY_TEAMS } from '../data/varsityData';
import { PlayerProfile } from '../components/PlayerProfile';
import { fetchCompletePlayerData } from '../utils/chessService';

import BOARD_GAMES_EVENTS from '../data/boardGamesData.json';

// Event data (links, dates, titles, podiums) is generated from the SS4 Chess League
// WhatsApp export by `scripts/extract_boardgames.py`. Detailed Lichess standings
// below were verified separately for the first two arenas.
const VERIFIED_RESULTS = {
  LM1: {
    description: 'LeagueMatch 1 on Lichess has officially concluded. 31 university contenders clashed across 112 matches with Juk3s taking the championship with 33 points.',
    results: {
      totalPlayers: 31,
      totalGames: 112,
      totalMoves: 8162,
      durationMinutes: 60,
      podium: [
        {
          rank: 1,
          label: 'Champion',
          name: 'Juk3s',
          school: 'Champion',
          rating: 2264,
          score: 33,
          performance: 2246,
          games: 12,
          wins: 9,
          berserks: 8
        },
        {
          rank: 2,
          label: 'Runner-Up',
          name: 'minatoe5',
          realName: 'Peter Eti Essien',
          school: 'University of Uyo',
          rating: 2132,
          score: 26,
          performance: 2274,
          games: 11,
          wins: 7,
          berserks: 8
        },
        {
          rank: 3,
          label: '2nd Runner-Up',
          name: 'D-genius',
          school: '2nd Runner-Up',
          rating: 2228,
          score: 23,
          performance: 1975,
          games: 12,
          wins: 7,
          berserks: 4
        }
      ],
      standings: [
        { rank: 1, name: 'Juk3s', rating: 2264, score: 33, performance: 2246, record: '9W • 12G' },
        { rank: 2, name: 'minatoe5', detail: 'Peter Eti Essien (UNIUYO)', rating: 2132, score: 26, performance: 2274, record: '7W • 11G' },
        { rank: 3, name: 'D-genius', rating: 2228, score: 23, performance: 1975, record: '7W • 12G' },
        { rank: 4, name: 'simon25', rating: 2034, score: 20, performance: 2031, record: '6W • 12G' },
        { rank: 5, name: 'garconune', rating: 1876, score: 20, performance: 1986, record: '6W • 12G' },
        { rank: 6, name: 'Darlington12', rating: 2297, score: 18, performance: 2212, record: '6W • 8G' },
        { rank: 7, name: 'emike001', rating: 2082, score: 18, performance: 2081, record: '6W • 12G' },
        { rank: 8, name: 'Yuki_Prime', rating: 1843, score: 16, performance: 1961, record: '5W • 11G' },
        { rank: 9, name: 'mittensttock', rating: 1864, score: 15, performance: 1914, record: '5W • 11G' },
        { rank: 10, name: 'KeseneNicholas', rating: 1640, score: 14, performance: 1680, record: '5W • 10G' }
      ]
    },
  },
  LM2: {
    description: 'LeagueMatch 2 on Lichess has officially concluded. 36 university contenders clashed across 116 matches. UNIUYO’s Board 1 lead Amakuro Minalabh (D-genius) clinched 1st place with 32 points, edging out Babcock’s simon25 (28 pts) and UNIUYO teammate minatoe5 (22 pts).',
    results: {
      totalPlayers: 36,
      totalGames: 116,
      totalMoves: 8802,
      durationMinutes: 60,
      podium: [
        {
          rank: 1,
          label: 'Champion',
          name: 'D-genius',
          realName: 'Amakuro Minalabh',
          school: 'University of Uyo',
          rating: 2282,
          score: 32,
          performance: 2324,
          games: 11,
          wins: 10,
          berserks: 0
        },
        {
          rank: 2,
          label: 'Runner-Up',
          name: 'simon25',
          realName: 'Akogo Simon',
          school: 'Babcock University',
          rating: 2053,
          score: 28,
          performance: 2174,
          games: 12,
          wins: 9,
          berserks: 1
        },
        {
          rank: 3,
          label: '2nd Runner-Up',
          name: 'minatoe5',
          realName: 'Peter Eti Essien',
          school: 'University of Uyo',
          rating: 2114,
          score: 22,
          performance: 1963,
          games: 12,
          wins: 7,
          berserks: 8
        }
      ],
      standings: [
        { rank: 1, name: 'D-genius', detail: 'Amakuro Minalabh (UNIUYO)', rating: 2282, score: 32, performance: 2324, record: '10W • 11G' },
        { rank: 2, name: 'simon25', detail: 'Akogo Simon (BABCOCK)', rating: 2053, score: 28, performance: 2174, record: '9W • 12G' },
        { rank: 3, name: 'minatoe5', detail: 'Peter Eti Essien (UNIUYO)', rating: 2114, score: 22, performance: 1963, record: '7W • 12G' },
        { rank: 4, name: 'emike001', detail: 'Emmanuel Michael (FUTIA)', rating: 2091, score: 20, record: '8W • 11G' },
        { rank: 5, name: 'Ataria-Daniel-2002', detail: 'Daniel Daniel (REDEEMER\'S)', rating: 2065, score: 18, record: '6W • 10G' },
        { rank: 6, name: 'Archerlima111', rating: 1870, score: 18, record: '6W • 12G' },
        { rank: 7, name: 'Juk3s', rating: 2253, score: 16, record: '5W • 9G' },
        { rank: 8, name: 'Crown_mf', rating: 1952, score: 13, record: '6W • 11G' },
        { rank: 9, name: 'garconune', rating: 1833, score: 12, record: '4W • 10G' },
        { rank: 10, name: 'Esamzy', rating: 2005, score: 12, record: '4W • 10G' }
      ]
    },
  },
};

const PODIUM_LABELS = ['Winner', 'Runner-Up', '3rd'];
const PILL_LABELS = { RO32: 'R32', RO16: 'R16', QF: 'QF', SF: 'SF', F: 'Final' };

const withPts = (r) => `${r.name} (${r.score} pts)`;

const EVENTS = BOARD_GAMES_EVENTS.map((e) => {
  const verified = VERIFIED_RESULTS[e.key];
  const podium = verified
    ? verified.results.podium.map(withPts)
    : e.podium;
  const isLeague = e.matchNumber != null;
  const podiumHighlights = podium.map((name, i) => `${PODIUM_LABELS[i]}: ${name}`);
  let description = e.recap;
  if (verified) description = verified.description;
  else if (e.status === 'LIVE') description = `${e.title} is LIVE tonight at 8 PM on Lichess. ${e.recap}`;
  else if (e.status === 'SCHEDULED') description = `${e.title} is scheduled for Oct ${e.day}. The Lichess link will be shared on match day.`;
  else if (isLeague) {
    description = `${e.title} (${e.timeControl} arena) on Lichess has concluded.${podium[0] ? ` ${podium[0]} took the top spot.` : ''}`;
  }
  return {
    ...e,
    isLeague,
    podium,
    description,
    results: verified?.results,
    phase: isLeague ? 'League Stage' : 'Knockout Stage',
    stage: isLeague ? `League Match ${e.matchNumber}` : e.label,
    isLive: e.status === 'LIVE',
    isCompleted: e.status === 'COMPLETED',
    highlights: [e.timeControl, ...(['RO32', 'RO16', 'QF'].includes(e.key) ? ['Best of 3'] : []), ...podiumHighlights],
  };
});

const lastLink = EVENTS.filter((e) => e.link).pop();
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
    shortTitle: e.isLeague ? e.label : PILL_LABELS[e.key],
    link: e.link,
    status: e.status,
    isLive: e.isLive,
    isCompleted: e.isCompleted,
    timeControl: e.timeControl,
    stage: e.stage,
    description: e.description,
    highlights: e.highlights,
    winner: e.podium[0],
    runnerUp: e.podium[1],
    third: e.podium[2],
    key: e.key,
  }));


const TIME_CONTROLS = [
  {
    mode: 'Blitz',
    time: '3 + 0',
    description: '3 minutes, zero increment. Maximum tactical pressure and lightning instincts.',
    icon: 'bolt',
    accent: '#F97316'
  },
  {
    mode: 'Blitz',
    time: '5 + 0',
    description: '5 minutes flat. Strategic calculations balanced with fast clock management.',
    icon: 'timer',
    accent: '#EAB308'
  },
  {
    mode: 'Rapid',
    time: '10 + 0',
    description: '10 minutes per contender. Deep positional battles, endgames, and grandmaster precision.',
    icon: 'hourglass_top',
    accent: '#0284C7'
  }
];

const INSTITUTION_METAS = {
  covenant: { short: 'CU', motto: 'Reigning Champions', color: '#0D9488', notable: 'Anuchi Emmanuel (August Champion), Alao David' },
  unilorin: { short: 'UNILORIN', motto: 'The Better By Far', color: '#DB2777', notable: 'Kenneth Gilbert (August Runner-Up), Durojaiye B.' },
  bells: { short: 'BELLSTECH', motto: 'First Private Tech University', color: '#DC2626', notable: 'James Henshaw (August Semifinalist), Anietie Ben' },
  futia: { short: 'FUTIA', motto: 'Aerospace & Tech Pride', color: '#059669', notable: 'Emmanuel Michael (August Semifinalist), Thompson E.' },
  uniuyo: { short: 'UNIUYO', motto: 'Unity, Wisdom & Service', color: '#EA580C', notable: 'Jesse Edem (June Champion), Peter Eti' },
  babcock: { short: 'BABCOCK', motto: 'Knowledge, Truth & Service', color: '#D97706', notable: 'Akogo Simon (Elite 8), Adedipe Temini' },
  landmark: { short: 'LANDMARK', motto: 'Agrarian Revolutionaries', color: '#7C3AED', notable: 'Princewill Obi (Elite 8), Mbah Ernest' },
  unn: { short: 'UNN', motto: 'Restoring The Dignity', color: '#0284C7', notable: 'Okoli Tochukwu (July Champion), Ugwu Praise' },
  unical: { short: 'UNICAL', motto: 'Knowledge For Service', color: '#E11D48', notable: 'Dean Bassey (Elite 8), Ita Best James' },
  redeemers: { short: 'RUN', motto: 'Running with the Vision', color: '#2563EB', notable: 'Daniel Daniel, Odukoya Emmanuel' },
  biu: { short: 'BIU', motto: 'Academic Excellence', color: '#B45309', notable: 'Akinrogunde Clinton, Jeffrey Obanor' }
};

const ORDERED_INSTITUTION_IDS = [
  'covenant',
  'unilorin',
  'bells',
  'futia',
  'uniuyo',
  'babcock',
  'landmark',
  'unn',
  'unical',
  'redeemers',
  'biu'
];



const NO_MATCH_DAY = {
  hasMatch: false,
  title: 'No Matches Scheduled',
  phase: 'Tournament Calendar',
  stage: 'No match data',
  timeControl: 'No matches',
  arenaLink: null,
  isLive: false,
  isCompleted: false,
  gridLabel: null,
  gridLabelShort: null,
  description: 'No theBoardGames matches were scheduled for this date.',
  highlights: null,
};

// Calendar: Oct 9 – Oct 31 based on verified tournament schedule (boardGamesData.json).
// Non-match days carry zero fabricated labels or results.
const TOURNAMENT_DAYS = Array.from({ length: 23 }, (_, i) => {
  const day = 9 + i;
  const weekday = new Date(2026, 9, day).toLocaleDateString('en-US', { weekday: 'short' });
  const base = { day, dayIndex: i + 1, weekday };
  const ev = EVENTS.find((e) => e.day === day);

  if (ev) {
    let gridLabel = ev.label;
    let gridLabelShort = ev.label;

    if (ev.key === 'F') {
      // The single authentic final of the tournament on Oct 31
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
    };
  }

  // Days with no match: honest, zero hallucination
  return { ...base, ...NO_MATCH_DAY };
});


export default function TheBoardGamesPage() {
  const [activeArenaMatch, setActiveArenaMatch] = useState(LEAGUE_MATCHES[0]);
  const [selectedDay, setSelectedDay] = useState(() => {
    return TOURNAMENT_DAYS.find(d => d.isLive) || TOURNAMENT_DAYS[0];
  });
  const [copied, setCopied] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [reconciledRatings, setReconciledRatings] = useState({});

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
          // Graceful fallback to verified baseline
        }
      }
    }

    pollLiveRatings();

    return () => {
      isMounted = false;
    };
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

  useEffect(() => {
    document.title = `${activeArenaMatch.title} | SS4 Chess League`;
    window.scrollTo(0, 0);
  }, [activeArenaMatch]);

  const handleCopyLink = (linkOverride) => {
    const link = typeof linkOverride === 'string' ? linkOverride : activeArenaMatch.link;
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
      text: `${targetTitle} is ${isLive ? 'LIVE' : 'available'} on Lichess!\nFeaturing the best chess players from top universities in Nigeria.\n\nArena Link: ${targetLink}\n\nThe Board Remembers.`,
      url: targetLink
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyLink(targetLink);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] text-slate-900 min-h-screen selection:bg-orange-500 selection:text-white font-sans">
      
      {/* ── 1. HERO & TOURNAMENT DATES SECTION ── */}
      <section className="relative bg-white text-slate-900 pt-3 sm:pt-4 pb-4 sm:pb-5 px-3 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          {/* Header Title Bar */}
          <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-outfit text-slate-900 leading-none">
                <span>the</span>
                <span className="text-[#E8640A]">BOARDGAMES</span>
              </h1>
              <span className="text-xs font-bold text-slate-500 font-sans hidden sm:inline">
                &bull; Top Nigerian University Chess Masters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">9th – 31st October 2026</span>
              <span className="text-slate-300">&bull;</span>
              <span className="font-bold text-[#E8640A]">Select date for match data</span>
            </div>
          </div>

          {/* Date Grid & Active Day Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-stretch">
            {/* Left Column: Compact 5-Column Grid (all dates visible without scrolling) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {TOURNAMENT_DAYS.map((d) => {
                  const isSelected = selectedDay.day === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      aria-label={`Select October ${d.day}${d.gridLabel ? ` - ${d.gridLabel}` : ''}`}
                      className={`h-[46px] sm:h-[50px] rounded-lg sm:rounded-xl border flex flex-col items-center justify-center px-1 py-0.5 sm:py-1 transition-all cursor-pointer select-none text-center relative ${
                        isSelected
                          ? 'bg-[#E8640A] text-white border-[#E8640A] shadow-xs shadow-orange-500/20 ring-2 ring-[#E8640A] ring-offset-1'
                          : d.hasMatch
                            ? 'bg-white hover:bg-orange-50/50 text-slate-800 border-slate-200/90 hover:border-orange-300'
                            : 'bg-slate-50/60 hover:bg-slate-100/60 text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider leading-none ${
                        isSelected ? 'text-orange-100' : 'text-slate-400'
                      }`}>
                        {d.weekday}
                      </span>
                      <span className={`text-sm sm:text-base font-black font-outfit leading-none my-0.5 ${
                        isSelected ? 'text-white' : d.hasMatch ? 'text-slate-900' : 'text-slate-400 font-medium'
                      }`}>
                        {d.day}
                      </span>
                      {d.gridLabel ? (
                        <span className={`text-[7.5px] sm:text-[8.5px] font-bold leading-none truncate max-w-full px-0.5 ${
                          isSelected
                            ? 'text-orange-100'
                            : d.isLive
                              ? 'text-emerald-600 font-black'
                              : d.key === 'F'
                                ? 'text-amber-600 font-black'
                                : 'text-slate-500'
                        }`}>
                          <span className="hidden sm:inline">{d.gridLabel}</span>
                          <span className="sm:hidden">{d.gridLabelShort}</span>
                        </span>
                      ) : (
                        <span className="h-2 sm:h-2.5 block" aria-hidden="true" />
                      )}
                      {d.isLive && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live Today"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Day Data Card */}
            <div className="lg:col-span-5 flex flex-col">
              <AnimatePresence mode="wait">
                <Motion.div
                  key={selectedDay.day}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl sm:rounded-2xl bg-slate-100/80 border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col justify-between h-full min-h-[255px]"
                >
                  {selectedDay.hasMatch && selectedDay.isCompleted && selectedDay.results ? (
                    /* ── COMPLETED MATCH VIEW ── */
                    <div className="space-y-2">
                      {/* Header Row */}
                      <div className="pb-1.5 border-b border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                          </span>
                          <span className="text-xs font-black text-[#E8640A] uppercase tracking-wide leading-tight">
                            {selectedDay.phase} &bull; {selectedDay.stage}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 shadow-2xs">
                          <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1c1.98-.44 3.49-2.07 3.61-4.06C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                          </svg>
                          <span>{selectedDay.key === 'F' ? 'Final Results' : 'Official Results'}</span>
                        </span>
                      </div>

                      {/* Title & Stats */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black font-outfit text-slate-900 leading-tight">
                          {selectedDay.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold text-slate-600 bg-white shadow-2xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{selectedDay.results.totalPlayers} Contenders</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white shadow-2xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{selectedDay.results.totalGames} Games</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white shadow-2xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>{selectedDay.timeControl}</span>
                          </span>
                        </div>
                      </div>

                      {/* Official Podium Winners */}
                      {selectedDay.results.podium && selectedDay.results.podium.length >= 3 && (
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                            Top 3 Podium Winners
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 items-stretch">
                            {/* 2nd Place */}
                            <div className="bg-white/90 border border-slate-200/70 rounded-lg p-1.5 text-center flex flex-col justify-between">
                              <div>
                                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[8px] font-black mx-auto flex items-center justify-center mb-0.5">2</span>
                                <span className="text-[10px] font-black text-slate-800 block truncate" title={selectedDay.results.podium[1].name}>
                                  {selectedDay.results.podium[1].name}
                                </span>
                              </div>
                              <div className="mt-1 leading-none">
                                <span className="text-xs font-black text-slate-800">{selectedDay.results.podium[1].score} pts</span>
                                <span className="text-[8px] text-slate-400 block font-mono mt-0.5">{selectedDay.results.podium[1].rating}</span>
                              </div>
                            </div>

                            {/* 1st Place (Champion) */}
                            <div className="bg-gradient-to-b from-amber-100 to-amber-200/60 border border-amber-300/70 rounded-lg p-1.5 text-center flex flex-col justify-between shadow-2xs">
                              <div>
                                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-black mx-auto flex items-center justify-center mb-0.5">1</span>
                                <span className="text-[10px] font-black text-slate-900 block truncate" title={selectedDay.results.podium[0].name}>
                                  {selectedDay.results.podium[0].name}
                                </span>
                              </div>
                              <div className="mt-1 leading-none">
                                <span className="text-xs font-black text-amber-900">{selectedDay.results.podium[0].score} pts</span>
                                <span className="text-[8px] text-amber-800 block font-mono mt-0.5">{selectedDay.results.podium[0].rating}</span>
                              </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="bg-orange-50/90 border border-orange-200/70 rounded-lg p-1.5 text-center flex flex-col justify-between">
                              <div>
                                <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-800 text-[8px] font-black mx-auto flex items-center justify-center mb-0.5">3</span>
                                <span className="text-[10px] font-black text-slate-800 block truncate" title={selectedDay.results.podium[2].name}>
                                  {selectedDay.results.podium[2].name}
                                </span>
                              </div>
                              <div className="mt-1 leading-none">
                                <span className="text-xs font-black text-slate-800">{selectedDay.results.podium[2].score} pts</span>
                                <span className="text-[8px] text-slate-400 block font-mono mt-0.5">{selectedDay.results.podium[2].rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <a
                          href={selectedDay.arenaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8640A] hover:bg-[#c95307] text-white font-black text-[11px] shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <span>Full Lichess Results</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(selectedDay.arenaLink)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 shadow-2xs font-bold text-[11px] transition-all cursor-pointer border border-slate-200/80"
                        >
                          <svg className="w-3 h-3 text-[#E8640A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(selectedDay)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 shadow-2xs font-bold text-[11px] transition-all cursor-pointer border border-slate-200/80"
                          title="Share match details"
                        >
                          <svg className="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ) : selectedDay.hasMatch ? (
                    /* ── UPCOMING / LIVE MATCH VIEW ── */
                    <div className="space-y-2">
                      {/* Header Row */}
                      <div className="pb-1.5 border-b border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                          </span>
                          <span className="text-xs font-black text-[#E8640A] uppercase tracking-wide leading-tight">
                            {selectedDay.phase} &bull; {selectedDay.stage}
                          </span>
                        </div>
                        {selectedDay.isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Live Tonight
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 shadow-2xs">
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Match Title & Format */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black font-outfit text-slate-900 leading-tight">
                          {selectedDay.title}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-xs font-bold text-slate-700">
                          <svg className="w-3.5 h-3.5 text-[#E8640A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selectedDay.timeControl}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedDay.description}
                      </p>

                      {/* Actions */}
                      {selectedDay.arenaLink ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          <a
                            href={selectedDay.arenaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8640A] hover:bg-[#c95307] text-white font-black text-[11px] shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <span>{selectedDay.isCompleted ? 'View on Lichess' : 'Join on Lichess'}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(selectedDay.arenaLink)}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 shadow-2xs font-bold text-[11px] transition-all cursor-pointer border border-slate-200/80"
                          >
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1.5 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Official Lichess arena link will be broadcast on match day.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── NO MATCH SCHEDULED VIEW ── */
                    <div className="space-y-2">
                      {/* Header Row */}
                      <div className="pb-1.5 border-b border-slate-200/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                          Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight">
                          Tournament Calendar
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black font-outfit text-slate-800 leading-tight">
                          No Matches Scheduled
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          No theBoardGames tournament matches were scheduled for this date.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Select a match day on the calendar to inspect pairing details and results.</span>
                      </div>
                    </div>
                  )}
                </Motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LIVE ARENA CENTER (theBOARDGAMES Arena Broadcast Deck) ── */}
      <section id="arena-broadcast-deck" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Header / Eyebrow */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${activeArenaMatch.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className={`text-xs font-black uppercase tracking-wider font-mono ${
                activeArenaMatch.isLive ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {activeArenaMatch.isLive ? 'LIVE BROADCAST • OFFICIAL ARENA' : 'OFFICIAL ARENA ARCHIVE & REPLAY'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 tracking-tight">
              {activeArenaMatch.title} Arena
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live inter-collegiate arena tournament hosted on Lichess.org &bull; Tournament ID:{' '}
              <code className="text-[#E8640A] font-mono font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                {activeArenaMatch.id}
              </code>
            </p>
          </div>

          {/* Quick Header Actions & Match Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Match Select Pills */}
            <div className="inline-flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
              {LEAGUE_MATCHES.map((match) => {
                const isActive = activeArenaMatch.id === match.id;
                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => {
                      setActiveArenaMatch(match);
                      setIframeLoaded(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#E8640A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    {match.isLive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                    <span>{match.shortTitle}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black/20 text-white' : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {match.isLive ? 'LIVE' : match.key === 'F' ? 'Final' : 'Completed'}
                    </span>
                  </button>
                );
              })}
            </div>

            <a
              href={activeArenaMatch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8640A] hover:bg-[#c95307] text-white text-xs sm:text-sm font-black shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Open on Lichess</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(activeArenaMatch.link)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Arena Frame Container */}
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Arena Control Deck Bar */}
          <div className="bg-[#0B192C] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-300">{activeArenaMatch.title}:</span>
              <span className="text-orange-400 font-semibold">{activeArenaMatch.stage || activeArenaMatch.dateStr}</span>
              {activeArenaMatch.winner && (
                <span className="hidden md:inline text-slate-400">&bull; Winner: {activeArenaMatch.winner}</span>
              )}
            </div>

            {/* View Mode & Utility Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                title={isExpanded ? "Collapse View" : "Expand Arena Height"}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                title="Launch in Full Window"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Full Tab</span>
              </a>
            </div>
          </div>

          {/* Iframe Arena Canvas */}
          <div className={`relative w-full bg-[#181614] flex items-center justify-center transition-all duration-300 ${
            isExpanded ? 'h-[780px] sm:h-[900px]' : 'h-[600px] sm:h-[680px]'
          }`}>
            {/* Loading Indicator */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181614] text-white z-10">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3 animate-pulse">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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

          {/* Dedicated Non-Obtrusive Arena Footer Strip */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 22H5v-2h14v2zm-3-4H8v-1.5c0-.83.67-1.5 1.5-1.5h.5c0-.87-.39-1.65-1-2.18V11c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1.82c-.61.53-1 1.31-1 2.18h.5c.83 0 1.5.67 1.5 1.5V18zm-4-11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </span>
              <span>
                <strong className="text-slate-800">Direct Lichess Arena Access:</strong> If browser cookie policies limit in-frame pairing or chat, open directly on Lichess.
              </span>
            </div>

            <a
              href={activeArenaMatch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#E8640A] hover:text-[#c95307] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Launch {activeArenaMatch.title} in Lichess</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. OFFICIAL TIME CONTROLS (Material 3 Expressive Tonal Cards) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">
            Match Dynamics
          </p>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-slate-900">
            Official Battle Time Controls
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            theBOARDGAMES features three certified FIDE & online chess clocks to test tactical speed, intuition, and deep positional accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIME_CONTROLS.map((tc, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div 
                className="absolute top-0 right-0 w-28 h-28 -mr-6 -mt-6 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: tc.accent }}
              />

              <div className="flex items-center justify-between mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${tc.accent}15`, color: tc.accent }}
                >
                  {tc.mode}
                </span>
                <span className="text-xs font-bold text-slate-400">Match Standard</span>
              </div>

              <div className="text-3xl sm:text-4xl font-black font-space tracking-tight text-slate-900 mb-3">
                {tc.time}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {tc.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. CONTESTING INSTITUTIONS (Interactive 3D Flip Cards with 5-Board Rosters) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <p className="text-xs font-black uppercase tracking-widest text-brand-primary">
                National Collegiate Field
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-slate-900">
              11 Premier Nigerian Institutions
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Click any university card to flip and inspect verified 5-board student rosters linked to their live chess profiles.
            </p>
          </div>

          <a
            href="/chess-league/varsity"
            className="text-xs font-black text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 shadow-2xs"
          >
            <span>View Full Varsity Rosters</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {institutionCards.map((uni) => {
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
                className="perspective-1000 h-[290px] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-2xl select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE: Enriched Collegiate Card with Black University Text and Chess Intelligence */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Bar: University Short (Black text, no bg) & Rating */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                          {uni.short}
                        </span>
                        <span className="text-[11px] font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {uni.averageRating} Elo
                        </span>
                      </div>

                      {/* University Full Name (Black text, no bg) */}
                      <h4 className="text-sm sm:text-base font-black text-black font-outfit leading-tight line-clamp-2">
                        {uni.name}
                      </h4>

                      {/* Board 1 Star Contender Pill */}
                      {uni.board1 && (
                        <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5 flex items-center justify-between">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              Board 1 Lead
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate block leading-tight mt-0.5">
                              {uni.board1.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-black text-slate-800 bg-white shadow-2xs px-2 py-0.5 rounded-md shrink-0">
                            {uni.board1.rating}
                          </span>
                        </div>
                      )}

                      {/* Collegiate Metrics: Match Record & Rating Range */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-slate-50 rounded-xl p-2 text-left">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                            Match Record
                          </span>
                          <span className="text-xs font-black font-space text-slate-800 block mt-0.5">
                            {uni.record ? `${uni.record.wins}W • ${uni.record.draws}D • ${uni.record.losses}L` : 'Active'}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2 text-left">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                            Rating Range
                          </span>
                          <span className="text-xs font-black font-mono text-slate-800 block mt-0.5">
                            {uni.ratingRange}
                          </span>
                        </div>
                      </div>

                      {/* Recent Form */}
                      {uni.recentForm && uni.recentForm.length > 0 && (
                        <div className="flex items-center justify-between px-1 mt-2.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
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

                    {/* Footer: Roster Flip Action (No squad field) */}
                    <div className="pt-2 flex items-center justify-end text-xs font-bold text-brand-primary">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors">
                        <span>View 5-Board Roster</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE: SS4 Blue Roster with Clickable Names (No chess.com buttons, holds all 5 players, no scroll) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-brand-primary text-white shadow-md p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-1.5 shrink-0 border-b border-white/15">
                      <span className="text-xs font-black text-white font-outfit uppercase tracking-wider">
                        {uni.short} Roster
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardFlip(uni.id);
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white text-white hover:text-brand-primary text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Flip back"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                    </div>

                    {/* 5-Board Player List: Comfortably holds all 5 players with no scroll */}
                    <div className="space-y-1.5 flex-1 flex flex-col justify-center py-1">
                      {uni.players && uni.players.length > 0 ? (
                        uni.players
                          .slice()
                          .sort((a, b) => a.board - b.board)
                          .map((player) => (
                            <div
                              key={player.id || player.board}
                              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="w-5 h-5 rounded bg-white/20 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0">
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
                    <div className="pt-2 text-center shrink-0">
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
      </section>

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
                onClick={() => setIsZoomOpen(false)}
                className="mt-4 px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Viewer &times;
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. PLAYER PROFILE MODAL ── */}
      {selectedPlayerForModal && (
        <PlayerProfile
          player={selectedPlayerForModal}
          onClose={() => setSelectedPlayerForModal(null)}
        />
      )}
    </div>
  );
}
