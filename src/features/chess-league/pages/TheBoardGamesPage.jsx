import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

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

const SCORING_RULES = [
  {
    title: 'Match Win',
    score: '+2 Pts',
    sub: 'Standard Win',
    desc: 'Regular arena victory awarded upon checkmate, resignation, or opponent clock expiry.'
  },
  {
    title: 'Win Streak Fire',
    score: '+3 Pts',
    sub: 'Flame Multiplier',
    desc: 'After 2 consecutive wins, all subsequent victories in the streak grant double points (+3 to +4).'
  },
  {
    title: 'Match Draw',
    score: '+1 Pt',
    sub: 'Shared Result',
    desc: 'Stalemate, threefold repetition, or agreed draw (subject to minimum move requirements).'
  },
  {
    title: 'Berserk Mode',
    score: '+1 Bonus',
    sub: 'Half Clock Risk',
    desc: 'Voluntarily slash your clock by 50% at move 0. If you win, you earn an extra bonus point.'
  }
];

const PARTICIPATING_UNIVERSITIES = [
  {
    name: 'Covenant University',
    short: 'CU',
    color: '#0D9488',
    notable: 'Anuchi Emmanuel (August Champion), Alao David',
    motto: 'Reigning Champions'
  },
  {
    name: 'University of Ilorin',
    short: 'UNILORIN',
    color: '#DB2777',
    notable: 'Kenneth Gilbert (August Runner-Up), Durojaiye B.',
    motto: 'The Better By Far'
  },
  {
    name: 'Bells University of Technology',
    short: 'BELLSTECH',
    color: '#DC2626',
    notable: 'James Henshaw (August Semifinalist), Anietie Ben',
    motto: 'First Private Tech University'
  },
  {
    name: 'Fed. Univ. of Tech. Ikot Abasi',
    short: 'FUTIA',
    color: '#059669',
    notable: 'Emmanuel Michael (August Semifinalist), Thompson E.',
    motto: 'Aerospace & Tech Pride'
  },
  {
    name: 'University of Uyo',
    short: 'UNIUYO',
    color: '#EA580C',
    notable: 'Jesse Edem (June Champion), Esang Uwe',
    motto: 'Unity, Wisdom & Service'
  },
  {
    name: 'Babcock University',
    short: 'BABCOCK',
    color: '#D97706',
    notable: 'Akogo Simon (Elite 8), Adedipe Temini',
    motto: 'Knowledge, Truth & Service'
  },
  {
    name: 'Landmark University',
    short: 'LANDMARK',
    color: '#7C3AED',
    notable: 'Princewill Obi (Elite 8), Mbah Ernest',
    motto: 'Agrarian Revolutionaries'
  },
  {
    name: 'University of Nigeria Nsukka',
    short: 'UNN',
    color: '#0284C7',
    notable: 'Okoli Tochukwu (July Champion), Ugwu Praise',
    motto: 'Restoring The Dignity'
  },
  {
    name: 'University of Calabar',
    short: 'UNICAL',
    color: '#E11D48',
    notable: 'Dean Bassey (Elite 8), Ita Best James',
    motto: 'Knowledge For Service'
  },
  {
    name: "Redeemer's University",
    short: 'RUN',
    color: '#2563EB',
    notable: 'Daniel Daniel, Odukoya Emmanuel',
    motto: 'Running with the Vision'
  },
  {
    name: 'Benson Idahosa University',
    short: 'BIU',
    color: '#B45309',
    notable: 'Akinrogunde Clinton, Jeffrey Obanor',
    motto: 'Academic Excellence'
  }
];

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
    status: 'ACTIVE NOW',
    isLive: true,
    timeControl: '3+0 Blitz • 5+0 Blitz • 10+0 Rapid',
    arenaLink: ARENA_LINK,
    description: 'The official Day 1 kickoff arena on Lichess. All 11 registered university contenders clash for opening season points and leaderboard seeding.',
    highlights: ['Official Lichess Arena', 'Win Streak Multipliers active', 'Open to all registered universities']
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
                        {d.day === 9 ? 'Match 1' : 'Oct'}
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
                  </div>

                  {/* Actions (if arenaLink exists) or Match Day Notice */}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LIVE ARENA CENTER (Interactive Lichess Tournament Frame) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Official Match Arena</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-outfit tracking-tight">
                theBoardGames LeagueMatch 1 Arena
              </h2>
              <p className="text-xs text-slate-400">
                Arena Tournament ID: <code className="text-orange-400 font-mono font-bold">{ARENA_ID}</code> &bull; Hosted on Lichess.org
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={ARENA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black tracking-wide flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Open in Lichess</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
              >
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Embedded Arena Frame */}
          <div className="relative w-full bg-slate-950 min-h-[580px] sm:min-h-[640px] flex items-center justify-center">
            <iframe
              src={ARENA_LINK}
              title="theBoardGames LeagueMatch 1 Live Arena"
              className="w-full h-[580px] sm:h-[680px] border-none"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />

            {/* Quick access overlay fallback banner at the bottom */}
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm shrink-0">
                  ♟️
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Direct Lichess Arena Access</p>
                  <p className="text-[11px] text-slate-400">
                    If browser security prevents direct in-page pairing or chat, launch the full arena in your Lichess app/browser tab.
                  </p>
                </div>
              </div>

              <a
                href={ARENA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-orange-50 text-xs font-black shrink-0 transition-colors cursor-pointer"
              >
                Launch Arena Direct &rarr;
              </a>
            </div>
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

      {/* ── 4. ARENA RULES & SCORING SYSTEM (MD3 Surface System) ── */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-sky-600 mb-2">
              Arena Mechanics
            </p>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-slate-900">
              Scoring System & Streak Multipliers
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Lichess Arena format keeps matches nonstop. Pairings occur automatically as soon as contenders finish a game.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCORING_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{rule.sub}</span>
                    <span className="text-lg font-black font-space text-orange-600">{rule.score}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2 font-outfit">{rule.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PARTICIPATING UNIVERSITIES ROSTER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">
              National Collegiate Field
            </p>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-slate-900">
              11 Premier Nigerian Institutions
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Representing student grandmasters and varsity contenders across federal, state, and private universities.
            </p>
          </div>

          <a
            href="/chess-league/varsity"
            className="text-xs font-black text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View Full Varsity Rosters</span>
            <span>&rarr;</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PARTICIPATING_UNIVERSITIES.map((uni, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span 
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${uni.color}15`, color: uni.color }}
                >
                  {uni.short}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{uni.motto}</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 truncate font-outfit">{uni.name}</h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                  Contenders: {uni.notable}
                </p>
              </div>
            </div>
          ))}
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
