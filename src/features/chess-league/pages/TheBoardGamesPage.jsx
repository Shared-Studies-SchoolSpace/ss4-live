import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { VARSITY_TEAMS } from '../data/varsityData';

const ARENA_LINK = 'https://lichess.org/tournament/1e80iceM';
const ARENA_ID = '1e80iceM';

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

const INSTITUTION_CARDS = ORDERED_INSTITUTION_IDS.map(id => {
  const team = VARSITY_TEAMS.find(t => t.id === id) || {};
  const meta = INSTITUTION_METAS[id] || {};
  return {
    id,
    name: team.name || meta.short,
    short: meta.short || team.shortName || id.toUpperCase(),
    color: meta.color || team.color || '#E8640A',
    motto: meta.motto || team.nickname || 'Varsity Challenger',
    notable: meta.notable || '',
    nickname: team.nickname || '',
    location: team.location || team.name,
    averageRating: team.averageRating || 2050,
    record: team.record || { wins: 0, draws: 0, losses: 0 },
    players: team.players || []
  };
});

const getPlayerProfileUrl = (player) => {
  if (!player || !player.handle) return '#';
  const handle = encodeURIComponent(player.handle);
  if (player.platform === 'lichess') {
    return `https://lichess.org/@/${handle}`;
  }
  return `https://www.chess.com/member/${handle}`;
};


const SCHEDULE_MILESTONES = [
  {
    phase: 'Phase 1 • Day 1 Arena',
    title: 'theBoardGames LeagueMatch 1 Launch',
    dates: '9th – 11th Oct 2026',
    status: 'ACTIVE NOW',
    desc: 'The official Day 1 kickoff arena on Lichess. All registered university contenders clash for opening season points.',
    isActive: true
  },
  {
    phase: 'Phase 2 • Swiss Sprints',
    title: 'Institutional Points Race & Qualifiers',
    dates: '12th – 20th Oct 2026',
    status: 'UPCOMING',
    desc: 'Accelerated pairing rounds to establish seeds, university standings, and individual tier rankings.',
    isActive: false
  },
  {
    phase: 'Phase 3 • Elimination',
    title: 'Round of 16 & Quarterfinal Showdown',
    dates: '21st – 27th Oct 2026',
    status: 'SCHEDULED',
    desc: 'Head-to-head match fixtures. Only the top 8 survivor grandmasters advance to the medal rounds.',
    isActive: false
  },
  {
    phase: 'Phase 4 • Championship',
    title: 'Final Four & Grand Final Coronation',
    dates: '28th – 31st Oct 2026',
    status: 'FINALE',
    desc: 'The national title decider. The October 2026 Champion of theBOARDGAMES is crowned.',
    isActive: false
  }
];

const TOURNAMENT_DAYS = [
  {
    day: 9,
    dayIndex: 1,
    weekday: 'Fri',
    title: 'theBoardGames LeagueMatch 1',
    phase: 'Phase 1',
    stage: 'Kickoff Arena Launch',
    status: 'COMPLETED',
    isCompleted: true,
    isLive: false,
    timeControl: '3+0 Blitz • 5+0 Blitz • 10+0 Rapid',
    arenaLink: ARENA_LINK,
    description: 'Day 1 kickoff arena on Lichess has officially concluded. 31 university contenders clashed across 112 matches with Juk3s taking the championship with 33 points.',
    highlights: ['31 Contenders', '112 Games Played', 'Winner: Juk3s (33 pts)', 'Runner-Up: minatoe5 (26 pts)'],
    results: {
      totalPlayers: 31,
      totalGames: 112,
      totalMoves: 8162,
      durationMinutes: 60,
      podium: [
        {
          rank: 1,
          medal: '🥇',
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
          medal: '🥈',
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
          medal: '🥉',
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
    }
  },
  {
    day: 10,
    dayIndex: 2,
    weekday: 'Sat',
    title: 'LeagueMatch 1 • Day 2 Arena Sprint',
    phase: 'Phase 1',
    stage: 'Opening Weekend Arena',
    status: 'Upcoming',
    isLive: false,
    timeControl: '3+0 Blitz • 5+0 Blitz',
    arenaLink: null,
    description: 'High-speed blitz arena battles continuing the opening weekend points rally. Contenders fight for podium placement and early streak bonuses.',
    highlights: ['Blitz Arena Speedrun', 'Streak multiplier enabled', 'Standings update at 22:00 UTC']
  },
  {
    day: 11,
    dayIndex: 3,
    weekday: 'Sun',
    title: 'LeagueMatch 1 • Weekend Wrap-up',
    phase: 'Phase 1',
    stage: 'Weekend Finale',
    status: 'Upcoming',
    isLive: false,
    timeControl: '5+0 Blitz • 10+0 Rapid',
    arenaLink: null,
    description: 'Conclusion of opening weekend arena fixtures and consolidation of Phase 1 team points before the Swiss sprint phase.',
    highlights: ['Phase 1 points lock', 'Weekly leaderboard reset', 'Player of the Week voting']
  },
  {
    day: 12,
    dayIndex: 4,
    weekday: 'Mon',
    title: 'Swiss Sprints • Round 1',
    phase: 'Phase 2',
    stage: 'Institutional Qualifiers',
    status: 'Scheduled',
    isLive: false,
    timeControl: '5+0 Blitz',
    arenaLink: null,
    description: 'First round of Swiss pairings between university representatives across seeded institutional brackets.',
    highlights: ['Official Swiss pairings', 'Direct head-to-head matchplay', 'Buchholz tiebreak tracking']
  },
  {
    day: 13,
    dayIndex: 5,
    weekday: 'Tue',
    title: 'Swiss Sprints • Round 2',
    phase: 'Phase 2',
    stage: 'Institutional Qualifiers',
    status: 'Scheduled',
    isLive: false,
    timeControl: '5+0 Blitz',
    arenaLink: null,
    description: 'Accelerated pairing rounds to establish seeds, university standings, and individual tier positions.',
    highlights: ['Winner bracket clashes', 'Reigning champions in action', 'Live board analysis']
  },
  {
    day: 14,
    dayIndex: 6,
    weekday: 'Wed',
    title: 'Swiss Sprints • Round 3',
    phase: 'Phase 2',
    stage: 'Mid-Week Points Race',
    status: 'Scheduled',
    isLive: false,
    timeControl: '3+0 Blitz • 5+0 Blitz',
    arenaLink: null,
    description: 'Cross-institutional rivalries intensify as top board contenders battle for crucial seed advantages.',
    highlights: ['Top 16 cutoff race', 'Berserk risk rounds', 'Institutional derby matchups']
  },
  {
    day: 15,
    dayIndex: 7,
    weekday: 'Thu',
    title: 'Swiss Sprints • Round 4',
    phase: 'Phase 2',
    stage: 'Mid-Week Points Race',
    status: 'Scheduled',
    isLive: false,
    timeControl: '5+0 Blitz',
    arenaLink: null,
    description: 'Round 4 fixtures featuring top performers from Covenant, UNILORIN, BELLSTECH, and UNN.',
    highlights: ['Key institutional derbies', 'Grandmaster precision required', 'Live standings tracker']
  },
  {
    day: 16,
    dayIndex: 8,
    weekday: 'Fri',
    title: 'Swiss Sprints • Round 5',
    phase: 'Phase 2',
    stage: 'Weekend Qualifier Kickoff',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid',
    arenaLink: null,
    description: 'First rapid format series of Phase 2, testing deep calculation, opening preparation, and endgame technique.',
    highlights: ['Rapid 10+0 time control', 'No berserk permitted', 'Deep positional clashes']
  },
  {
    day: 17,
    dayIndex: 9,
    weekday: 'Sat',
    title: 'Swiss Sprints • Round 6',
    phase: 'Phase 2',
    stage: 'Super Saturday',
    status: 'Scheduled',
    isLive: false,
    timeControl: '3+0 Blitz • 5+0 Blitz',
    arenaLink: null,
    description: 'Doubleheader sprint rounds with double points on active win streaks across university boards.',
    highlights: ['High-stakes speed run', 'Win streak multipliers active', 'Full league broadcast']
  },
  {
    day: 18,
    dayIndex: 10,
    weekday: 'Sun',
    title: 'Swiss Sprints • Round 7',
    phase: 'Phase 2',
    stage: 'Sunday Showdown',
    status: 'Scheduled',
    isLive: false,
    timeControl: '5+0 Blitz',
    arenaLink: null,
    description: 'Penultimate Swiss round. Contenders battle fiercely to avoid lower seed elimination slots.',
    highlights: ['Top seed bubble matches', 'Pressure games on Board 1-4', 'Provisional brackets posted']
  },
  {
    day: 19,
    dayIndex: 11,
    weekday: 'Mon',
    title: 'Swiss Sprints • Round 8',
    phase: 'Phase 2',
    stage: 'Elimination Decider',
    status: 'Scheduled',
    isLive: false,
    timeControl: '5+0 Blitz',
    arenaLink: null,
    description: 'Critical round 8 fixtures determining the top 32 contenders advancing to the main knockout draw.',
    highlights: ['Top 32 qualification line', 'Sudden-death tiebreak prep', 'Rivalry match fixtures']
  },
  {
    day: 20,
    dayIndex: 12,
    weekday: 'Tue',
    title: 'Swiss Sprints • Final Round 9',
    phase: 'Phase 2',
    stage: 'Qualification Climax',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid',
    arenaLink: null,
    description: 'Final Swiss standings locked in. The top 32 seeds are officially confirmed for the knockout stage.',
    highlights: ['Final Swiss standings locked', 'Knockout bracket reveal', 'Official seed certificates']
  },
  {
    day: 21,
    dayIndex: 13,
    weekday: 'Wed',
    title: 'Round of 32 • Matchday 1',
    phase: 'Phase 3',
    stage: 'Knockout Stage',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid + Blitz Tiebreaks',
    arenaLink: null,
    description: 'Top 32 knockout bracket begins. Matches 1 through 8 in sudden-death head-to-head fixtures.',
    highlights: ['Single elimination begins', 'Matches 1 to 8', 'Armageddon tiebreak rules']
  },
  {
    day: 22,
    dayIndex: 14,
    weekday: 'Thu',
    title: 'Round of 32 • Matchday 2',
    phase: 'Phase 3',
    stage: 'Knockout Stage',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid + Blitz Tiebreaks',
    arenaLink: null,
    description: 'Matches 9 through 16 to finalize the Sweet 16 roster for the Round of 16 showdown.',
    highlights: ['Matches 9 to 16', 'Remaining Round of 32 fixtures', 'Sweet 16 roster finalized']
  },
  {
    day: 23,
    dayIndex: 15,
    weekday: 'Fri',
    title: 'Round of 16 • Part 1',
    phase: 'Phase 3',
    stage: 'Sweet 16',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid (Best of 3)',
    arenaLink: null,
    description: 'First 4 matches of the Round of 16. Elite university players clash for quarterfinal spots.',
    highlights: ['Best of 3 series', 'Elite 8 qualification on the line', 'Featured streamed matches']
  },
  {
    day: 24,
    dayIndex: 16,
    weekday: 'Sat',
    title: 'Round of 16 • Part 2',
    phase: 'Phase 3',
    stage: 'Sweet 16',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid (Best of 3)',
    arenaLink: null,
    description: 'Remaining 4 Round of 16 matches to decide the Elite 8 quarterfinalists.',
    highlights: ['Elite 8 bracket finalized', 'High-tension rapid series', 'Official quarterfinal draw']
  },
  {
    day: 25,
    dayIndex: 17,
    weekday: 'Sun',
    title: 'Quarterfinals • Matchday 1',
    phase: 'Phase 3',
    stage: 'Elite 8',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid (Best of 4)',
    arenaLink: null,
    description: 'Quarterfinal 1 & 2 fixtures. Highest stakes matches of the tournament to date.',
    highlights: ['Quarterfinals 1 & 2', 'Best of 4 rapid games', 'Semi-final berth at stake']
  },
  {
    day: 26,
    dayIndex: 18,
    weekday: 'Mon',
    title: 'Quarterfinals • Matchday 2',
    phase: 'Phase 3',
    stage: 'Elite 8',
    status: 'Scheduled',
    isLive: false,
    timeControl: '10+0 Rapid (Best of 4)',
    arenaLink: null,
    description: 'Quarterfinal 3 & 4 fixtures. The Final Four championship contenders emerge.',
    highlights: ['Quarterfinals 3 & 4', 'Final Four locked in', 'Medal contenders confirmed']
  },
  {
    day: 27,
    dayIndex: 19,
    weekday: 'Tue',
    title: 'Tactical Briefing & Rest Day',
    phase: 'Phase 3',
    stage: 'Semifinal Prep',
    status: 'Scheduled',
    isLive: false,
    timeControl: 'Exhibition & Analysis',
    arenaLink: null,
    description: 'Player interviews, game analysis of the Elite 8 games, and technical preparation ahead of the championship semifinals.',
    highlights: ['Official stream breakdown', 'Player interview specials', 'Semifinal previews']
  },
  {
    day: 28,
    dayIndex: 20,
    weekday: 'Wed',
    title: 'Semifinals • Final Four Clashes',
    phase: 'Phase 4',
    stage: 'Championship Semifinals',
    status: 'Championship',
    isLive: false,
    timeControl: '10+0 Rapid + Blitz Armageddon',
    arenaLink: null,
    description: 'National semifinals. Two historic matchups to decide who advances to the October 2026 Grand Final.',
    highlights: ['Semifinal 1 & 2', 'Best of 4 games', 'Grand Final spots decided']
  },
  {
    day: 29,
    dayIndex: 21,
    weekday: 'Thu',
    title: 'Third-Place Playoff',
    phase: 'Phase 4',
    stage: 'Bronze Medal Match',
    status: 'Championship',
    isLive: false,
    timeControl: '10+0 Rapid (Best of 4)',
    arenaLink: null,
    description: 'Battle for 3rd place podium honors and university pride between the semifinal runners-up.',
    highlights: ['Podium battle', 'Bronze medal decider', 'University points bonus']
  },
  {
    day: 30,
    dayIndex: 22,
    weekday: 'Fri',
    title: 'Grand Final • Match 1',
    phase: 'Phase 4',
    stage: 'Grand Final Series',
    status: 'Championship',
    isLive: false,
    timeControl: '10+0 Rapid Classical Match',
    arenaLink: null,
    description: 'Game 1 and 2 of the October 2026 Grand Final series between Nigeria’s top two university grandmasters.',
    highlights: ['Grand Final Game 1 & 2', 'Peak collegiate chess', 'National live stream']
  },
  {
    day: 31,
    dayIndex: 23,
    weekday: 'Sat',
    title: 'Grand Final Decider & Coronation',
    phase: 'Phase 4',
    stage: 'Grand Final Decider',
    status: 'Grand Finale',
    isLive: false,
    timeControl: '10+0 Rapid + Blitz Playoff',
    arenaLink: null,
    description: 'The final game of theBOARDGAMES October 2026. Champion crowned, awards ceremony and prize presentation.',
    highlights: ['Trophy presentation', 'Champion coronation', 'October 2026 Season Finale']
  }
];

export default function TheBoardGamesPage() {
  const [selectedDay, setSelectedDay] = useState(TOURNAMENT_DAYS[0]);
  const [copied, setCopied] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllStandings, setShowAllStandings] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  const toggleCardFlip = (teamId) => {
    setFlippedCards(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  useEffect(() => {
    document.title = 'theBOARDGAMES: LeagueMatch 1 | SS4 Chess League';
    window.scrollTo(0, 0);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ARENA_LINK).then(() => {
      setCopied(true);
      toast.success('Lichess Arena link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.info(`Arena Link: ${ARENA_LINK}`);
    });
  };

  const handleShare = () => {
    const shareData = {
      title: 'theBoardGames LeagueMatch 1 | SS4 Chess League',
      text: '📣 theBoardGames LeagueMatch 1 is LIVE!\nFeaturing the best chess players from top universities in Nigeria.\n\n🔗 Arena Link: https://lichess.org/tournament/1e80iceM\n\nThe Board Remembers.',
      url: ARENA_LINK
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] text-slate-900 min-h-screen selection:bg-orange-500 selection:text-white font-sans">
      
      {/* ── 1. HERO & TOURNAMENT DATES SECTION ── */}
      <section className="relative bg-white text-slate-900 pt-8 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          {/* Header Title & Subtitle */}
          <div className="mb-8 sm:mb-10 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-outfit text-slate-900 leading-tight">
              <span>the</span>
              <span className="text-[#E8640A]">BOARDGAMES</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal mt-2.5 max-w-2xl leading-relaxed">
              Featuring the best chess players from top universities in Nigeria.
            </p>
          </div>

          {/* 5 by 4 Date Grid & Day Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: 5 by 4 Grid of Squares from 9th to 31st */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">October Dates</span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs font-bold text-slate-600">9th – 31st October 2026</span>
                </div>
                <span className="text-xs font-bold text-[#E8640A] hidden sm:inline-block">Select date for match data</span>
              </div>

              {/* 5 by 4 Grid: 5 columns across */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {TOURNAMENT_DAYS.map((d) => {
                  const isSelected = selectedDay.day === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      aria-label={`Select October ${d.day}`}
                      className={`aspect-square rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center p-1 sm:p-2 transition-all cursor-pointer select-none text-center relative ${
                        isSelected
                          ? 'bg-[#E8640A] text-white border-[#E8640A] shadow-md shadow-orange-500/20 ring-2 ring-[#E8640A] ring-offset-2'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider leading-none ${
                        isSelected ? 'text-orange-100' : 'text-slate-400'
                      }`}>
                        {d.weekday}
                      </span>
                      <span className="text-lg sm:text-2xl font-black font-outfit leading-none my-1 sm:my-1.5">
                        {d.day}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-semibold leading-none ${
                        isSelected ? 'text-orange-100' : 'text-slate-500'
                      }`}>
                        {d.isCompleted ? 'Final' : 'Oct'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Day Data Card */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay.day}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
                >
                  {selectedDay.isCompleted && selectedDay.results ? (
                    /* ── COMPLETED ARENA WINNERS VIEW ── */
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                          </span>
                          <span className="text-xs font-black text-[#E8640A] uppercase tracking-wide">
                            {selectedDay.phase} &bull; {selectedDay.stage}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <span>🏆</span>
                          <span>Final Results</span>
                        </span>
                      </div>

                      {/* Title & Stats */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black font-outfit text-slate-900 leading-snug">
                          {selectedDay.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            👥 {selectedDay.results.totalPlayers} Contenders
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            ⚔️ {selectedDay.results.totalGames} Games
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            ⏱️ 60 Mins Arena
                          </span>
                        </div>
                      </div>

                      {/* ── Official Tournament Podium ── */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Official Podium Winners
                          </span>
                          <span className="text-[10px] font-bold text-amber-700">Top 3 Finishers</span>
                        </div>

                        {/* 3-Column Olympic Podium Layout: 2nd on Left, 1st in Middle, 3rd on Right */}
                        <div className="grid grid-cols-3 gap-2 items-end pt-1">
                          {/* 2nd Place (Silver) */}
                          <div className="bg-slate-100/90 border border-slate-300 rounded-xl p-2.5 text-center flex flex-col justify-between min-h-[145px]">
                            <div>
                              <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 mx-auto flex items-center justify-center text-xs font-bold shadow-2xs mb-1">
                                🥈
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                                2nd Place
                              </span>
                              <span className="text-xs sm:text-sm font-black text-slate-900 block truncate" title={selectedDay.results.podium[1].name}>
                                {selectedDay.results.podium[1].name}
                              </span>
                              {selectedDay.results.podium[1].school && (
                                <span className="text-[9px] font-semibold text-slate-500 block truncate leading-tight mt-0.5">
                                  {selectedDay.results.podium[1].school}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 pt-1 border-t border-slate-200/70">
                              <span className="text-base sm:text-lg font-black text-slate-800 font-outfit block leading-none">
                                {selectedDay.results.podium[1].score}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">pts &bull; {selectedDay.results.podium[1].rating}</span>
                            </div>
                          </div>

                          {/* 1st Place (Gold - Elevated Champion) */}
                          <div className="bg-gradient-to-b from-amber-50 to-amber-100/60 border-2 border-amber-400 rounded-2xl p-3 text-center flex flex-col justify-between min-h-[165px] shadow-sm relative">
                            <div className="absolute -top-2.5 inset-x-0 flex justify-center">
                              <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                                Champion
                              </span>
                            </div>
                            <div className="pt-1">
                              <div className="w-7 h-7 rounded-full bg-amber-400 border border-amber-500 mx-auto flex items-center justify-center text-sm font-bold shadow-xs mb-1">
                                🥇
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                                Winner
                              </span>
                              <span className="text-sm sm:text-base font-black text-slate-900 block truncate" title={selectedDay.results.podium[0].name}>
                                {selectedDay.results.podium[0].name}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
                                Rating {selectedDay.results.podium[0].rating}
                              </span>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-amber-200/80">
                              <span className="text-xl sm:text-2xl font-black text-amber-900 font-outfit block leading-none">
                                {selectedDay.results.podium[0].score}
                              </span>
                              <span className="text-[9px] font-bold text-amber-800">points &bull; {selectedDay.results.podium[0].wins} wins</span>
                            </div>
                          </div>

                          {/* 3rd Place (Bronze) */}
                          <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-2.5 text-center flex flex-col justify-between min-h-[145px]">
                            <div>
                              <div className="w-6 h-6 rounded-full bg-orange-200/70 border border-orange-300 mx-auto flex items-center justify-center text-xs font-bold shadow-2xs mb-1">
                                🥉
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-orange-700 block">
                                3rd Place
                              </span>
                              <span className="text-xs sm:text-sm font-black text-slate-900 block truncate" title={selectedDay.results.podium[2].name}>
                                {selectedDay.results.podium[2].name}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-500 block truncate leading-tight mt-0.5">
                                Rating {selectedDay.results.podium[2].rating}
                              </span>
                            </div>
                            <div className="mt-2 pt-1 border-t border-orange-200/70">
                              <span className="text-base sm:text-lg font-black text-orange-950 font-outfit block leading-none">
                                {selectedDay.results.podium[2].score}
                              </span>
                              <span className="text-[9px] font-bold text-orange-700">pts &bull; {selectedDay.results.podium[2].wins} wins</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Standings Mini-Table (Ranks 1-10) with expandable view */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Leaderboard (Top 10)
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAllStandings(!showAllStandings)}
                            className="text-[10px] font-bold text-[#E8640A] hover:underline cursor-pointer"
                          >
                            {showAllStandings ? 'Show Less' : 'View Top 10'}
                          </button>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                          {(showAllStandings ? selectedDay.results.standings : selectedDay.results.standings.slice(0, 5)).map((p) => (
                            <div key={p.rank} className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className={`w-4 text-[10px] font-black ${
                                  p.rank === 1 ? 'text-amber-500' : p.rank === 2 ? 'text-slate-400' : p.rank === 3 ? 'text-orange-500' : 'text-slate-400'
                                }`}>
                                  #{p.rank}
                                </span>
                                <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px]">
                                  {p.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 font-mono">{p.rating}</span>
                                <span className="text-xs font-black text-slate-900 font-outfit">{p.score} pts</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 mt-2 border-t border-slate-200">
                        <a
                          href={selectedDay.arenaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8640A] hover:bg-[#c95307] text-white font-black text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <span>Full Lichess Results</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-[#E8640A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                          title="Share match details"
                        >
                          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── INCOMPLETE / SCHEDULED DAYS VIEW ── */
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="border-b border-slate-200/80 pb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Oct {selectedDay.day}
                        </span>
                        <span className="text-xs font-black text-[#E8640A] uppercase tracking-wide">
                          {selectedDay.phase}
                        </span>
                      </div>

                      {/* Match Title & Stage */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black font-outfit text-slate-900 leading-snug">
                          {selectedDay.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1">
                          Stage: {selectedDay.stage}
                        </p>
                      </div>

                      {/* Time Control Card */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-base shrink-0">
                          ⏱️
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Time Control</span>
                          <span className="text-xs sm:text-sm font-black text-slate-800">{selectedDay.timeControl}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {selectedDay.description}
                      </p>

                      {/* Highlights */}
                      {selectedDay.highlights && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Match Highlights</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedDay.highlights.map((h, i) => (
                              <span key={i} className="inline-flex items-center text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions / Match Day Notice */}
                      {selectedDay.arenaLink ? (
                        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-slate-200">
                          <a
                            href={selectedDay.arenaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8640A] hover:bg-[#c95307] text-white font-black text-xs shadow-sm transition-all cursor-pointer"
                          >
                            <span>Join on Lichess</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>

                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-[#E8640A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                            title="Share match details"
                          >
                            <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 mt-5 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Arena link and pairing fixtures unlock on match day.</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LIVE ARENA CENTER (The Varsity Arena Broadcast Deck) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Header / Eyebrow */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 font-mono">
                LIVE BROADCAST &bull; OFFICIAL ARENA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 tracking-tight">
              theBoardGames LeagueMatch 1 Arena
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live inter-collegiate arena tournament hosted on Lichess.org &bull; Tournament ID:{' '}
              <code className="text-[#E8640A] font-mono font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                {ARENA_ID}
              </code>
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={ARENA_LINK}
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
              onClick={handleCopyLink}
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
          <div className="bg-[#0B192C] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-end gap-3 border-b border-slate-800">
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
                href={ARENA_LINK}
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
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl mb-3 animate-pulse">
                  ♟️
                </div>
                <p className="text-sm font-bold text-slate-200">Connecting to Lichess Arena...</p>
                <p className="text-xs text-slate-400 mt-1">theBoardGames LeagueMatch 1</p>
              </div>
            )}

            <iframe
              src={ARENA_LINK}
              title="theBoardGames LeagueMatch 1 Live Arena"
              className="w-full h-full border-none"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          </div>

          {/* Dedicated Non-Obtrusive Arena Footer Strip */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                ♟
              </span>
              <span>
                <strong className="text-slate-800">Direct Lichess Arena Access:</strong> If browser cookie policies limit in-frame pairing or chat, open directly on Lichess.
              </span>
            </div>

            <a
              href={ARENA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#E8640A] hover:text-[#c95307] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Launch Arena in Lichess App / Browser</span>
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
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <p className="text-xs font-black uppercase tracking-widest text-orange-600">
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
            className="text-xs font-black text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300"
          >
            <span>View Full Varsity Rosters</span>
            <span>&rarr;</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {INSTITUTION_CARDS.map((uni) => {
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
                className="perspective-1000 h-[385px] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-2xl select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE: Institution Identity & Accolades */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3.5">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${uni.color}15`, color: uni.color }}
                        >
                          {uni.short}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                          {uni.motto}
                        </span>
                      </div>

                      {/* University Title & Nickname */}
                      <h4 className="text-base font-black text-slate-900 font-outfit leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {uni.name}
                      </h4>
                      {uni.nickname && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                          {uni.nickname}
                        </p>
                      )}

                      {/* Team Stats Matrix */}
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Squad Field</span>
                          <span className="font-black text-slate-800 text-xs">5 Boards Confirmed</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Avg Rating</span>
                          <span className="font-black text-orange-600 font-space text-xs">{uni.averageRating} Elo</span>
                        </div>
                      </div>

                      {/* Key Contenders */}
                      {uni.notable && (
                        <div className="mt-3 text-[11px] text-slate-600 bg-orange-50/50 border border-orange-100/80 rounded-xl p-2.5 leading-relaxed">
                          <strong className="text-slate-800 font-bold block mb-0.5">Top Contenders:</strong>
                          <span className="line-clamp-2">{uni.notable}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Flip Affordance Footer */}
                    <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
                      <span>View 5-Board Roster</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        Flip ↻
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE: 5-Board Roster with Live Profile Links */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                    <div className="min-h-0 flex flex-col">
                      {/* Back Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: uni.color }}
                          />
                          <span className="text-xs font-black text-white uppercase tracking-wider truncate font-outfit">
                            {uni.short} Roster
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            (5 Boards)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardFlip(uni.id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          title="Flip back to team summary"
                        >
                          <span>↺</span>
                          <span>Back</span>
                        </button>
                      </div>

                      {/* 5-Board Player List */}
                      <div className="space-y-1.5 overflow-y-auto pr-0.5">
                        {uni.players && uni.players.length > 0 ? (
                          uni.players
                            .slice()
                            .sort((a, b) => a.board - b.board)
                            .map((player) => {
                              const profileUrl = getPlayerProfileUrl(player);
                              const platformName = player.platform === 'lichess' ? 'Lichess' : 'Chess.com';

                              return (
                                <div
                                  key={player.id || player.board}
                                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] transition-colors group/player"
                                >
                                  {/* Player Info */}
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                                      B{player.board}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-white truncate leading-tight group-hover/player:text-orange-300 transition-colors">
                                        {player.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono truncate leading-none mt-0.5">
                                        @{player.handle} &bull; <span className="text-slate-300 font-semibold">{player.rating} Elo</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Profile External Link Button */}
                                  <a
                                    href={profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-orange-500 hover:text-white text-slate-300 text-[10px] font-bold shrink-0 transition-colors cursor-pointer border border-white/10"
                                    title={`Open ${player.name}'s verified profile on ${platformName}`}
                                  >
                                    <span>{platformName}</span>
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              );
                            })
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400">
                            Roster pending verification
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
                      <span className="flex items-center gap-1 text-slate-400">
                        <span>Click profile to view games</span>
                        <span>↗</span>
                      </span>
                      <span className="text-orange-400 font-bold truncate max-w-[120px]">
                        {uni.short} Varsity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. MATCHDAY TIMELINE / TOURNAMENT ROADMAP ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">
              Tournament Roadmap
            </p>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight">
              theBOARDGAMES October Calendar
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              23 days of non-stop inter-collegiate chess culminating in the national crowning ceremony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCHEDULE_MILESTONES.map((mile, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 border transition-all ${
                  mile.isActive
                    ? 'bg-gradient-to-b from-orange-500/20 to-orange-500/5 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-white/[0.04] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {mile.dates}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      mile.isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {mile.status}
                  </span>
                </div>

                <span className="text-xs font-bold text-orange-400 block mb-1">{mile.phase}</span>
                <h3 className="text-base font-black text-white mb-2 font-outfit">{mile.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{mile.desc}</p>
              </div>
            ))}
          </div>

          {/* Slogan Banner */}
          <div className="mt-14 pt-8 border-t border-white/10 text-center space-y-2">
            <p className="text-lg font-black text-white font-outfit">
              Many Institutions, One Space.
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-orange-400">
              The Board Remembers.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. POSTER FULLSCREEN ZOOM MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
