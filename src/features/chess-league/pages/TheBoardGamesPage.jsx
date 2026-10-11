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

export default function TheBoardGamesPage() {
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
      
      {/* ── 1. HERO SECTION (Material 3 Expressive Tonal Hero) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#101D42] to-[#0D152F] text-white pt-10 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        {/* Subtle chess board grid background texture */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.7) 0% 25%, transparent 0% 50%)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs & Live Signal Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <span className="text-slate-500">/</span>
              <a href="/league" className="hover:text-white transition-colors">Chess League</a>
              <span className="text-slate-500">/</span>
              <span className="text-orange-400 font-bold">theBOARDGAMES</span>
            </div>

            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Day 1 &bull; LeagueMatch 1
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Specs & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-black uppercase tracking-widest">
                  <span>SS4 CHESS LEAGUE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span>OCTOBER 2026</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-outfit leading-[1.02]">
                  <span className="text-sky-400">the</span>
                  <span className="text-orange-500">BOARDGAMES</span>
                </h1>

                <p className="text-lg sm:text-xl font-bold text-slate-200">
                  📣 theBoardGames LeagueMatch 1
                </p>

                <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed">
                  Featuring the best chess players from top universities in Nigeria. 
                  High-stakes blitz and rapid battles hosted online on Lichess across 23 days of inter-collegiate rivalry.
                </p>
              </div>

              {/* Tournament Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Dates</span>
                  <span className="text-xs sm:text-sm font-black text-white">9th – 31st Oct 2026</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Platform</span>
                  <span className="text-xs sm:text-sm font-black text-orange-400 flex items-center gap-1">
                    Lichess.org
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Time Controls</span>
                  <span className="text-xs sm:text-sm font-black text-sky-300">3+0 &bull; 5+0 &bull; 10+0</span>
                </div>
              </div>

              {/* Action Buttons Cluster */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={ARENA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Join LeagueMatch 1 on Lichess</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Arena Link'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md active:scale-[0.98] transition-all cursor-pointer"
                  title="Share match details"
                >
                  <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share Match</span>
                </button>
              </div>

              {/* Slogan */}
              <p className="text-xs font-bold text-slate-400 tracking-wider pt-2">
                &ldquo;The Board Remembers.&rdquo; &bull; SS4 Competitive Platform
              </p>
            </div>

            {/* Right Column: Poster Preview Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                {/* Glow ring behind poster */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>

                <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/20 shadow-2xl">
                  <img
                    src="/october-tournament-poster.png"
                    alt="SS4 Chess League theBOARDGAMES Poster"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Poster Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">Day 1 Poster</span>
                      <span className="text-xs font-bold text-white">theBOARDGAMES LeagueMatch 1</span>
                    </div>

                    <button
                      onClick={() => setIsZoomOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Zoom
                    </button>
                  </div>
                </div>
              </div>
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
