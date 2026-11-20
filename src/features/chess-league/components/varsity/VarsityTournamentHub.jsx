import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  VARSITY_S2_METADATA,
  VARSITY_S2_STANDINGS,
  VARSITY_S2_STAR_PLAYERS,
  VARSITY_S2_EVENTS,
  VARSITY_S2_CALENDAR_DAYS,
} from '../../data/varsitySeason2Data';
import { PlayerDirectory } from './PlayerDirectory';
import { TeamCards } from './TeamCards';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { GameRecordsTable } from './GameRecordsTable';
import PrimaryTabs from '../../../../components/PrimaryTabs';

const PRIMARY_TABS = [
  { id: 'hub', label: 'Varsity Hub' },
  { id: 'standings', label: 'Overall Standings' },
  { id: 'archive', label: 'Season 1 Archive' },
];

const ARCHIVE_SUBTABS = [
  { id: 'directory', label: 'Players Directory' },
  { id: 'teams', label: 'University Squads' },
  { id: 'standings', label: 'League Standings' },
  { id: 'records', label: 'Game Records' },
];

const STAR_PLAYER_BY_INSTITUTION = VARSITY_S2_STAR_PLAYERS.reduce((acc, player) => {
  acc[player.institutionId] = player;
  return acc;
}, {});

const TabIcon = ({ id, className = 'w-4 h-4' }) => {
  if (id === 'hub') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (id === 'standings') {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
};

const VARSITY_PRIMARY_TABS = [
  { id: 'hub', label: 'Varsity Hub', icon: <TabIcon id="hub" className="w-4 h-4 shrink-0" /> },
  { id: 'standings', label: 'Overall Standings', icon: <TabIcon id="standings" className="w-4 h-4 shrink-0" /> },
  { id: 'archive', label: 'Season 1 Archive', icon: <TabIcon id="archive" className="w-4 h-4 shrink-0" /> },
];

export const VarsityTournamentHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'standings' || rawTab === 'overall'
    ? 'standings'
    : rawTab === 'archive' || rawTab === 'season-1'
      ? 'archive'
      : 'hub';

  const tabRefs = useRef({});
  const trackScrollRef = useRef(null);

  const [selectedDay, setSelectedDay] = useState(() => (
    VARSITY_S2_CALENDAR_DAYS.find((d) => d.hasMatch) || VARSITY_S2_CALENDAR_DAYS[0]
  ));
  const [calendarFilter, setCalendarFilter] = useState('all'); // 'all' | 'matches'
  const [calendarViewMode, setCalendarViewMode] = useState('strip'); // 'strip' | 'grid' on mobile
  const [showStandingsDrawer, setShowStandingsDrawer] = useState(false);

  const [activeArenaMatch, setActiveArenaMatch] = useState(VARSITY_S2_EVENTS[0]);
  const [deckMode, setDeckMode] = useState('arena'); // 'arena' | 'highlights'
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [institutionQuery, setInstitutionQuery] = useState('');
  const [standingsQuery, setStandingsQuery] = useState('');
  const [standingsZoneFilter, setStandingsZoneFilter] = useState('all'); // 'all' | 'qf' | 'chasing'

  const [archiveTab, setArchiveTab] = useState('standings');
  const [copied, setCopied] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleTabChange = (tabKey, focusTab = false) => {
    setSearchParams(tabKey === 'hub' ? {} : { tab: tabKey });
    const tabEl = tabRefs.current[tabKey];
    if (tabEl) {
      tabEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      if (focusTab) tabEl.focus();
    }
  };

  const handleTabKeyDown = (e, currentIdx) => {
    const count = PRIMARY_TABS.length;
    let nextIdx = null;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % count;
    else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + count) % count;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = count - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      handleTabChange(PRIMARY_TABS[nextIdx].id, true);
    }
  };

  useEffect(() => {
    if (!isZoomOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isZoomOpen]);

  const filteredDays = useMemo(() => {
    if (calendarFilter === 'matches') {
      return VARSITY_S2_CALENDAR_DAYS.filter((d) => d.hasMatch);
    }
    return VARSITY_S2_CALENDAR_DAYS;
  }, [calendarFilter]);

  const filteredInstitutions = useMemo(() => {
    const q = institutionQuery.trim().toLowerCase();
    if (!q) return VARSITY_S2_STANDINGS;
    return VARSITY_S2_STANDINGS.filter((inst) => (
      inst.name.toLowerCase().includes(q)
      || inst.shortName.toLowerCase().includes(q)
      || STAR_PLAYER_BY_INSTITUTION[inst.id]?.name.toLowerCase().includes(q)
    ));
  }, [institutionQuery]);

  const filteredStandings = useMemo(() => {
    const q = standingsQuery.trim().toLowerCase();
    return VARSITY_S2_STANDINGS.filter((inst) => {
      if (standingsZoneFilter === 'qf' && !inst.qualifiesQF) return false;
      if (standingsZoneFilter === 'chasing' && inst.qualifiesQF) return false;
      if (!q) return true;
      return inst.name.toLowerCase().includes(q) || inst.shortName.toLowerCase().includes(q);
    });
  }, [standingsQuery, standingsZoneFilter]);

  const handleCopyLink = (linkOverride) => {
    const link = typeof linkOverride === 'string' ? linkOverride : activeArenaMatch.link;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Lichess tournament link copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.info(`Tournament Link: ${link}`);
    });
  };

  const handleShare = (dayOrEvent) => {
    const targetLink = dayOrEvent?.arenaLink || dayOrEvent?.link || activeArenaMatch.link;
    const targetTitle = dayOrEvent?.title || activeArenaMatch.title;
    const shareData = {
      title: `${targetTitle} | SS4 Chess League`,
      text: `${targetTitle}\n${VARSITY_S2_METADATA.tagline}\n${targetLink}`,
      url: targetLink,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyLink(targetLink);
    }
  };

  const jumpToMatchDay1 = () => {
    const md1 = VARSITY_S2_CALENDAR_DAYS.find((d) => d.hasMatch);
    if (md1) setSelectedDay(md1);
  };

  const latestMatch = VARSITY_S2_EVENTS[0];
  const leader = VARSITY_S2_STANDINGS[0];

  return (
    <div className="w-full bg-brand-bg-cream text-brand-text-dark min-h-screen selection:bg-brand-primary selection:text-white font-sans pb-16">
      {/* ── UNIFIED VARSITY COMPETITION TABS ── */}
      <PrimaryTabs
        tabs={VARSITY_PRIMARY_TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
        sticky={true}
        stickyTop="top-16 lg:top-20"
      />

      {/* ── TAB 1: VARSITY HUB ── */}
      {activeTab === 'hub' && (
        <div role="tabpanel" aria-labelledby="varsity-tab-hub">
          {/* ── 0. STICKY QUICK-NAVIGATION SUB-BAR ── */}
          <nav
            aria-label="Varsity Hub Quick Navigation"
            className="sticky top-[120px] lg:top-[136px] z-30 bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(15,23,42,0.05)] py-2.5 px-3 sm:px-6 transition-all"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-space font-black text-sm sm:text-base text-brand-text-dark leading-none tracking-tight">
                  SS4 <span className="text-brand-primary">VARSITY</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#E8EFFF] text-[#00194B] uppercase tracking-wider font-space">
                  {VARSITY_S2_METADATA.editionLabel}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-xs font-bold text-slate-600">
                <a
                  href="#schedule"
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#E8EFFF]/70 hover:text-brand-primary transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule</span>
                </a>
                <a
                  href="#arena-broadcast-deck"
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#E8EFFF]/70 hover:text-brand-primary transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Arena Deck</span>
                </a>
                <a
                  href="#star-players"
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#E8EFFF]/70 hover:text-brand-primary transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="hidden sm:inline">Star Players</span>
                </a>
                <a
                  href="#institutions"
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#E8EFFF]/70 hover:text-brand-primary transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Institutions</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleTabChange('standings')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#E8EFFF] text-[#00194B] hover:bg-[#dbeafe] transition-colors whitespace-nowrap inline-flex items-center gap-1 font-extrabold cursor-pointer"
                >
                  <span>Standings</span>
                </button>
              </div>
            </div>
          </nav>

          {/* ── 1. HERO & TOURNAMENT STATS SECTION ── */}
          <section className="relative bg-white pt-6 sm:pt-8 pb-7 sm:pb-9 px-3 sm:px-6 lg:px-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="max-w-7xl mx-auto space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 bg-[#E8EFFF] text-[#00194B] px-3 py-1 rounded-md text-[11px] font-space font-extrabold uppercase tracking-wider">
                    <span>SS4 Chess League</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{VARSITY_S2_METADATA.season}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{VARSITY_S2_METADATA.dateWindowShort}</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-space tracking-tight text-brand-text-dark leading-tight">
                    SS4 <span className="text-brand-primary">VARSITY</span> Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                    {VARSITY_S2_METADATA.tagline} 15 institutions, teams of 5 players each, 4 league match days on Lichess, with the Top 8 qualifying for the Quarter-Finals.
                  </p>
                </div>

                {/* Quick Primary Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 lg:pt-0 shrink-0">
                  <a
                    href={latestMatch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Match Day 1 on Lichess</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href={latestMatch.highlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#E8EFFF] hover:bg-[#dbeafe] text-[#00194B] text-xs sm:text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Highlights</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#F6F4F0] hover:bg-[#EBE9E4] text-brand-text-dark text-xs sm:text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Poster</span>
                  </button>
                </div>
              </div>

              {/* Key Metrics Strip (Tonal Surface Wells — Zero Wire Borders) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div className="bg-[#F6F4F0] rounded-2xl p-3.5">
                  <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-slate-500 block">
                    Collegiate Field
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">
                    {VARSITY_S2_METADATA.institutionsCount} Institutions
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Teams of {VARSITY_S2_METADATA.playersPerTeam} players each
                  </span>
                </div>
                <div className="bg-[#F6F4F0] rounded-2xl p-3.5">
                  <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-slate-500 block">
                    Tournament Window
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">
                    {VARSITY_S2_METADATA.dateWindowShort}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    4 League Days &bull; Top 8 to QF
                  </span>
                </div>
                <div className="bg-[#E8EFFF] rounded-2xl p-3.5">
                  <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#00194B]/70 block">
                    Day 1 Leader
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-space text-brand-primary block mt-0.5">
                    {leader.shortName}
                  </span>
                  <span className="text-[11px] text-[#00194B] font-semibold">
                    {leader.total} pts &bull; After Day 1 of 4
                  </span>
                </div>
                <div className="bg-[#F6F4F0] rounded-2xl p-3.5">
                  <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-slate-500 block">
                    Match Day 1 Format
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-space text-brand-text-dark block mt-0.5">
                    {latestMatch.timeControl}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Lichess &bull; {latestMatch.timeRange}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. TOURNAMENT CALENDAR & MATCH TRACKER SECTION ── */}
          <section id="schedule" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  <span className="text-xs font-space font-extrabold uppercase tracking-wider text-brand-primary">
                    November 2026 Schedule
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space text-brand-text-dark tracking-tight">
                  Match Schedule &amp; Daily Results
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Select any tournament date to inspect confirmed match day podiums, standings, and official links.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Tabs */}
                <div className="inline-flex bg-[#EBE9E4] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
                  <button
                    type="button"
                    aria-pressed={calendarFilter === 'all'}
                    onClick={() => setCalendarFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      calendarFilter === 'all'
                        ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                        : 'hover:text-brand-text-dark'
                    }`}
                  >
                    All Nov ({VARSITY_S2_CALENDAR_DAYS.length})
                  </button>
                  <button
                    type="button"
                    aria-pressed={calendarFilter === 'matches'}
                    onClick={() => {
                      setCalendarFilter('matches');
                      if (!selectedDay.hasMatch) jumpToMatchDay1();
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      calendarFilter === 'matches'
                        ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                        : 'hover:text-brand-text-dark'
                    }`}
                  >
                    Match Days ({VARSITY_S2_EVENTS.length})
                  </button>
                </div>

                {/* View Mode Toggle on Mobile */}
                <div className="inline-flex lg:hidden bg-[#EBE9E4] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode('strip')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      calendarViewMode === 'strip' ? 'bg-white text-brand-primary shadow-2xs' : 'hover:text-brand-text-dark'
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
                    onClick={() => setCalendarViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      calendarViewMode === 'grid' ? 'bg-white text-brand-primary shadow-2xs' : 'hover:text-brand-text-dark'
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Clickable Date Selector */}
              <div className="lg:col-span-7 flex flex-col space-y-2.5">
                {/* Mobile Strip */}
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
                          onClick={() => setSelectedDay(d)}
                          aria-pressed={isSelected}
                          aria-label={`Select November ${d.day}${d.gridLabel ? ` - ${d.gridLabel}` : ''}`}
                          className={`min-w-[80px] sm:min-w-[88px] shrink-0 snap-start rounded-2xl p-2.5 flex flex-col items-center justify-between transition-all cursor-pointer select-none text-center focus-visible:outline-2 focus-visible:outline-brand-primary ${
                            isSelected
                              ? 'bg-brand-primary text-white shadow-sm'
                              : d.hasMatch
                                ? 'bg-white text-brand-text-dark shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:bg-[#E8EFFF]/60'
                                : 'bg-[#EFECE6] text-slate-500 hover:bg-white/80'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full text-[9px] font-bold uppercase tracking-wider mb-1">
                            <span className={isSelected ? 'text-blue-100' : 'text-slate-400'}>
                              {d.weekday}
                            </span>
                            {d.isCompleted && (
                              <svg
                                className={`w-3 h-3 ${isSelected ? 'text-blue-100' : 'text-brand-primary'}`}
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
                            isSelected ? 'text-white' : d.hasMatch ? 'text-brand-text-dark' : 'text-slate-500'
                          }`}>
                            {d.day}
                          </span>

                          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : d.hasMatch
                                ? 'bg-[#E8EFFF] text-[#00194B]'
                                : 'text-slate-400'
                          }`}>
                            {d.gridLabelShort || 'TBA'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 text-right pr-1 pt-0.5">
                    Scroll dates horizontally
                  </div>
                </div>

                {/* Desktop Responsive Grid (Optional on Mobile) */}
                <div className={`${calendarViewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                    {filteredDays.map((d) => {
                      const isSelected = selectedDay.day === d.day;
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          aria-pressed={isSelected}
                          aria-label={`Select November ${d.day}${d.gridLabel ? ` - ${d.gridLabel}` : ''}`}
                          className={`h-[68px] rounded-2xl flex flex-col items-center justify-between px-2 py-2 transition-all cursor-pointer select-none text-center focus-visible:outline-2 focus-visible:outline-brand-primary ${
                            isSelected
                              ? 'bg-brand-primary text-white shadow-sm'
                              : d.hasMatch
                                ? 'bg-white text-brand-text-dark shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:bg-[#E8EFFF]/70'
                                : 'bg-[#EFECE6] text-slate-500 hover:bg-white/80'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full text-[9.5px] font-bold uppercase tracking-wider">
                            <span className={isSelected ? 'text-blue-100' : 'text-slate-400'}>
                              {d.weekday}
                            </span>
                            {d.isCompleted && (
                              <svg
                                className={`w-3 h-3 ${isSelected ? 'text-blue-100' : 'text-brand-primary'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <span className={`text-lg font-black font-space leading-none ${
                            isSelected ? 'text-white' : d.hasMatch ? 'text-brand-text-dark' : 'text-slate-500 font-semibold'
                          }`}>
                            {d.day}
                          </span>

                          {d.gridLabel ? (
                            <span className={`text-[9.5px] font-extrabold leading-none truncate max-w-full px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#E8EFFF] text-[#00194B]'
                            }`}>
                              {d.gridLabelShort}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              TBA
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-500 font-medium px-1 pt-1">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
                      <span>Completed Match Day</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D8D3CA]" aria-hidden="true" />
                      <span>Upcoming Window (TBA)</span>
                    </span>
                  </div>
                  <span>Click any date to inspect schedule</span>
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
                    className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col justify-between"
                  >
                    {selectedDay.hasMatch ? (
                      <div className="space-y-4">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 pb-3 bg-[#F6F4F0] -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 pt-4 rounded-t-3xl">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                              Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Nov {selectedDay.day} &bull; {selectedDay.timeRange}
                            </span>
                            <span className="text-xs font-space font-extrabold text-brand-primary uppercase tracking-wide block mt-0.5">
                              {selectedDay.phase} &bull; {selectedDay.stage}
                            </span>
                          </div>

                          <span className="text-[10px] font-space font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] inline-flex items-center gap-1 shrink-0">
                            <svg className="w-3 h-3 text-[#059669]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1c1.98-.44 3.49-2.07 3.61-4.06C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                            </svg>
                            <span>Official Results</span>
                          </span>
                        </div>

                        {/* Title & Meta Chips */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-black font-space text-brand-text-dark leading-tight">
                            {selectedDay.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            <span className="text-xs font-bold text-slate-700 bg-[#F6F4F0] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                              </svg>
                              <span>{selectedDay.institutionsCount} Institutions</span>
                            </span>
                            <span className="text-xs font-bold text-slate-700 bg-[#F6F4F0] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{selectedDay.playersPerTeam} Players Each</span>
                            </span>
                            <span className="text-xs font-extrabold text-brand-primary bg-[#E8EFFF] px-2.5 py-1 rounded-lg font-space">
                              {selectedDay.timeControl}
                            </span>
                          </div>
                        </div>

                        {/* Top 3 Institutions Podium */}
                        {selectedDay.podium && selectedDay.podium.length >= 3 && (
                          <div className="bg-[#F6F4F0] rounded-2xl p-3.5">
                            <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5">
                              Match Day {selectedDay.matchDay} Top 3 Institutions
                            </span>

                            <div className="grid grid-cols-3 gap-2">
                              {/* 2nd Place */}
                              <div className="bg-white rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                                <div>
                                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-space font-black mx-auto flex items-center justify-center mb-1.5">
                                    2
                                  </span>
                                  <span className="text-xs font-space font-black text-brand-text-dark block truncate" title={selectedDay.podium[1].name}>
                                    {selectedDay.podium[1].shortName}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <span className="text-sm font-black font-space text-brand-text-dark tabular-nums">
                                    {selectedDay.podium[1].score} pts
                                  </span>
                                </div>
                              </div>

                              {/* 1st Place Leader */}
                              <div className="bg-[#E8EFFF] rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                                <div>
                                  <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-space font-black mx-auto flex items-center justify-center mb-1.5">
                                    1
                                  </span>
                                  <span className="text-xs font-space font-black text-[#00194B] block truncate" title={selectedDay.podium[0].name}>
                                    {selectedDay.podium[0].shortName}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <span className="text-sm font-black font-space text-brand-primary tabular-nums">
                                    {selectedDay.podium[0].score} pts
                                  </span>
                                </div>
                              </div>

                              {/* 3rd Place */}
                              <div className="bg-white rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                                <div>
                                  <span className="w-6 h-6 rounded-full bg-[#FFEEDB] text-[#2E0E00] text-[11px] font-space font-black mx-auto flex items-center justify-center mb-1.5">
                                    3
                                  </span>
                                  <span className="text-xs font-space font-black text-brand-text-dark block truncate" title={selectedDay.podium[2].name}>
                                    {selectedDay.podium[2].shortName}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <span className="text-sm font-black font-space text-brand-text-dark tabular-nums">
                                    {selectedDay.podium[2].score} pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expandable Match Day Standings Drawer */}
                        {selectedDay.standings && selectedDay.standings.length > 0 && (
                          <div className="rounded-2xl overflow-hidden bg-[#F6F4F0]">
                            <button
                              type="button"
                              aria-expanded={showStandingsDrawer}
                              onClick={() => setShowStandingsDrawer(!showStandingsDrawer)}
                              className="w-full px-3.5 py-2.5 hover:bg-[#EBE9E4] text-xs font-extrabold text-brand-text-dark flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="inline-flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Day {selectedDay.matchDay} Institution Scores ({selectedDay.standings.length})</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-500 text-[11px] font-bold">
                                <span>{showStandingsDrawer ? 'Hide' : 'Expand'}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform ${showStandingsDrawer ? 'rotate-180' : ''}`}
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
                              <div className="bg-white overflow-x-auto max-h-60 no-scrollbar text-xs">
                                <table className="w-full text-left">
                                  <thead className="bg-[#F0EEEA] text-[10px] font-space font-extrabold text-slate-500 uppercase tracking-wider sticky top-0">
                                    <tr>
                                      <th className="py-2 px-3 text-center">#</th>
                                      <th className="py-2 px-3">Institution</th>
                                      <th className="py-2 px-3 text-right">D{selectedDay.matchDay} Pts</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F0EEEA] font-medium">
                                    {selectedDay.standings.map((row) => (
                                      <tr
                                        key={row.id}
                                        className={row.rank === 1 ? 'bg-[#E8EFFF]/50' : 'hover:bg-[#F6F4F0]/60'}
                                      >
                                        <td className="py-2 px-3 text-center font-space font-bold text-slate-500">
                                          {row.rank}
                                        </td>
                                        <td className="py-2 px-3 font-bold text-brand-text-dark">
                                          <span className="mr-1.5">{row.shortName}</span>
                                          {row.qualifiesQF && (
                                            <span className="text-[9px] font-space font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#E8EFFF] text-brand-primary">
                                              QF
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-right font-space font-black text-brand-primary tabular-nums">
                                          {row.score}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="p-2.5 bg-[#F6F4F0] text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleTabChange('standings')}
                                    className="text-xs font-extrabold text-brand-primary hover:underline cursor-pointer"
                                  >
                                    Open Full Overall Standings Tab &rarr;
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex flex-col gap-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={selectedDay.arenaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand-primary hover:bg-primary-hover text-white font-bold text-xs shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                            >
                              <span>Open on Lichess</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            {selectedDay.highlightsUrl && (
                              <a
                                href={selectedDay.highlightsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#E8EFFF] hover:bg-[#dbeafe] text-[#00194B] font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>Watch Highlights</span>
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(selectedDay.arenaLink)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[40px] rounded-xl bg-[#F6F4F0] hover:bg-[#EBE9E4] text-slate-700 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>{copied ? 'Copied' : 'Copy Link'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShare(selectedDay)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[40px] rounded-xl bg-[#F6F4F0] hover:bg-[#EBE9E4] text-slate-700 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── UPCOMING / PENDING DAY VIEW ── */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 bg-[#F6F4F0] -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 pt-4 rounded-t-3xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Day {selectedDay.dayIndex} &bull; {selectedDay.weekday}, Nov {selectedDay.day}
                          </span>
                          <span className="text-[10px] font-space font-extrabold text-brand-primary uppercase tracking-wider bg-[#E8EFFF] px-2 py-0.5 rounded-md">
                            Tournament Window
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black font-space text-brand-text-dark">
                            Schedule Pending
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                            {selectedDay.description}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#F6F4F0] text-xs text-slate-600 flex items-start gap-2.5">
                          <svg className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            League Match Day 1 results (Wed, Nov 18) and overall standings are verified and live.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={jumpToMatchDay1}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Inspect Match Day 1 Results</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </Motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ── 3. ARENA BROADCAST DECK & VIDEO HIGHLIGHTS ── */}
          <section id="arena-broadcast-deck" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" aria-hidden="true" />
                  <span className="text-xs font-space font-extrabold uppercase tracking-wider text-brand-primary">
                    Official Arena Archive &amp; Highlights
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space text-brand-text-dark tracking-tight">
                  {activeArenaMatch.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                  <span>Hosted on Lichess.org</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>
                    ID:{' '}
                    <code className="text-brand-primary font-mono font-bold bg-[#E8EFFF] px-1.5 py-0.5 rounded">
                      {activeArenaMatch.id}
                    </code>
                  </span>
                </p>
              </div>

              {/* Deck Mode Switcher (Lichess Arena vs Day 1 Highlights) */}
              <div className="inline-flex bg-[#EBE9E4] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1 self-start lg:self-auto">
                <button
                  type="button"
                  aria-pressed={deckMode === 'arena'}
                  onClick={() => setDeckMode('arena')}
                  className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    deckMode === 'arena'
                      ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                      : 'hover:text-brand-text-dark'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Lichess Arena</span>
                </button>
                <button
                  type="button"
                  aria-pressed={deckMode === 'highlights'}
                  onClick={() => setDeckMode('highlights')}
                  className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    deckMode === 'highlights'
                      ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                      : 'hover:text-brand-text-dark'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Day 1 Highlights</span>
                </button>
              </div>
            </div>

            {/* Match Selector Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-[#EBE9E4] rounded-2xl mb-4">
              {VARSITY_S2_EVENTS.map((match) => {
                const isActive = activeArenaMatch.id === match.id;
                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => {
                      setActiveArenaMatch(match);
                      setIframeLoaded(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span>{match.shortTitle}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}>
                      {match.timeControl}
                    </span>
                  </button>
                );
              })}
              <span className="px-3 py-2 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                Match Days 2–4 upcoming
              </span>
            </div>

            {/* Arena / Highlights Frame Container */}
            <div className="rounded-3xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] overflow-hidden">
              {/* Control Bar */}
              <div className="bg-[#0B192C] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-200">{activeArenaMatch.shortTitle}:</span>
                  <span className="text-[#93C5FD] font-semibold">
                    {activeArenaMatch.dateStr} &bull; {activeArenaMatch.timeRange}
                  </span>
                  <span className="hidden md:inline text-slate-400">
                    &bull; 1st: {leader.shortName} ({leader.total} pts)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {deckMode === 'arena' && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
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
                  )}

                  <a
                    href={activeArenaMatch.highlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-[#93C5FD]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>YouTube Highlights</span>
                  </a>

                  <a
                    href={activeArenaMatch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in Lichess</span>
                  </a>
                </div>
              </div>

              {deckMode === 'arena' ? (
                <div className={`relative w-full bg-[#111827] flex items-center justify-center transition-all duration-300 ${
                  isExpanded
                    ? 'h-[620px] sm:h-[780px] lg:h-[880px]'
                    : 'h-[420px] sm:h-[540px] lg:h-[660px]'
                }`}>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111827] text-white z-10 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-[#93C5FD] mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
              ) : (
                <div className="bg-[#0B192C] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeArenaMatch.highlightsVideoId}`}
                      title="SS4 Varsity Games Match Day 1 Highlights"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="max-w-md text-white space-y-4 text-center md:text-left">
                    <span className="inline-block px-3 py-1 rounded-md bg-brand-primary text-white text-[10px] font-space font-extrabold uppercase tracking-wider">
                      Official Video Recap
                    </span>
                    <h3 className="text-xl sm:text-2xl font-space font-black leading-tight">
                      League Match Day 1 Highlights
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Relive the decisive blitz combinations and top-board clashes from opening night across 15 Nigerian university squads.
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                      <a
                        href={activeArenaMatch.highlightsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition-all"
                      >
                        <span>Watch on YouTube Shorts</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a
                        href={VARSITY_S2_METADATA.youtubeChannel}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                      >
                        <span>SS4 YouTube Channel</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Strip */}
              <div className="bg-[#F6F4F0] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E8EFFF] text-brand-primary flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-brand-text-dark">Direct Lichess Access:</strong> Open directly in Lichess if browser cookie settings restrict embedded views.
                  </span>
                </div>

                <a
                  href={activeArenaMatch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-extrabold text-brand-primary hover:text-primary-hover transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Launch {activeArenaMatch.shortTitle} on Lichess &rarr;</span>
                </a>
              </div>
            </div>
          </section>

          {/* ── 4. STAR PLAYERS — LEAGUE DAY 1 ── */}
          <section id="star-players" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-14 sm:pt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  <p className="text-xs font-space font-extrabold uppercase tracking-wider text-brand-primary">
                    League Day 1 Honors
                  </p>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space tracking-tight text-brand-text-dark">
                  Star Players
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Standout individual performances verified from League Match Day 1.
                </p>
              </div>

              <a
                href={VARSITY_S2_METADATA.youtubeChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-primary hover:text-primary-hover transition-colors whitespace-nowrap"
              >
                {VARSITY_S2_METADATA.youtubeChannelLabel} &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VARSITY_S2_STAR_PLAYERS.map((player, idx) => (
                <div
                  key={player.id}
                  className="rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-space font-extrabold uppercase tracking-wider ${
                        idx === 0
                          ? 'bg-brand-primary text-white'
                          : 'bg-[#0B192C] text-white'
                      }`}>
                        {player.category}
                      </span>
                      <span className="text-[11px] font-space font-extrabold uppercase tracking-wider text-brand-primary bg-[#E8EFFF] px-2.5 py-1 rounded-md">
                        {player.matchDayLabel}
                      </span>
                    </div>

                    <p className="text-xs font-space font-extrabold uppercase tracking-wider text-brand-primary">
                      {player.university}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black font-space text-brand-text-dark tracking-tight mt-0.5">
                      {player.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-slate-500 mt-1">
                      @{player.handle} &middot; <span className="font-bold text-brand-text-dark">{player.rating}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {player.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className={`rounded-2xl p-3 text-center ${
                          metric.highlight ? 'bg-[#E8EFFF]' : 'bg-[#F6F4F0]'
                        }`}
                      >
                        <div className={`text-xl sm:text-2xl font-black font-space tabular-nums ${
                          metric.highlight ? 'text-brand-primary' : 'text-brand-text-dark'
                        }`}>
                          {metric.value}
                        </div>
                        <div className="text-[10px] font-space font-bold uppercase tracking-wider text-slate-500 mt-0.5 leading-tight">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. PARTICIPATING INSTITUTIONS (15 UNIVERSITIES) ── */}
          <section id="institutions" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-14 sm:pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  <p className="text-xs font-space font-extrabold uppercase tracking-wider text-brand-primary">
                    Season 2 Collegiate Field
                  </p>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-space tracking-tight text-brand-text-dark">
                  {VARSITY_S2_METADATA.institutionsCount} Participating Institutions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Live Season 2 ranking snapshot after League Day 1 of 4. {VARSITY_S2_METADATA.qualificationNote}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={institutionQuery}
                    onChange={(e) => setInstitutionQuery(e.target.value)}
                    placeholder="Search university..."
                    aria-label="Search participating universities"
                    className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text-dark placeholder-slate-400"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('standings')}
                  className="text-xs font-extrabold text-brand-primary hover:bg-[#dbeafe] transition-colors inline-flex items-center gap-1 shrink-0 px-3.5 py-2.5 rounded-xl bg-[#E8EFFF] whitespace-nowrap cursor-pointer"
                >
                  <span>Full Overall Standings &rarr;</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredInstitutions.map((inst) => {
                const starPlayer = STAR_PLAYER_BY_INSTITUTION[inst.id];
                return (
                  <div
                    key={inst.id}
                    className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(26,86,196,0.09)] transition-all p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-space font-black tabular-nums ${
                          inst.rank === 1
                            ? 'bg-brand-primary text-white'
                            : inst.qualifiesQF
                              ? 'bg-[#E8EFFF] text-[#00194B]'
                              : 'bg-[#F0EEEA] text-slate-600'
                        }`}>
                          #{inst.rank}
                        </span>

                        {inst.qualifiesQF ? (
                          <span className="text-[10px] font-space font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D1FAE5] text-[#065F46]">
                            QF Zone
                          </span>
                        ) : (
                          <span className="text-[10px] font-space font-bold uppercase tracking-wider text-slate-400">
                            5 Players
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-space font-black uppercase tracking-wide text-brand-text-dark">
                        {inst.shortName}
                      </div>
                      <h3 className="text-xs font-medium text-slate-600 leading-snug mt-0.5 line-clamp-2">
                        {inst.name}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {starPlayer && (
                        <div className="bg-[#E8EFFF] rounded-xl px-3 py-2">
                          <span className="text-[9px] font-space font-extrabold uppercase tracking-wider text-brand-primary block">
                            Day 1 {starPlayer.category}
                          </span>
                          <span className="text-xs font-bold text-[#00194B] block truncate">
                            {starPlayer.name} (@{starPlayer.handle})
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 bg-[#F6F4F0] rounded-xl p-2.5">
                        <div>
                          <span className="text-[9px] font-space font-extrabold uppercase tracking-wider text-slate-400 block">
                            Day 1
                          </span>
                          <span className="text-sm font-black font-space text-brand-text-dark tabular-nums">
                            {inst.d1} pts
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-space font-extrabold uppercase tracking-wider text-slate-400 block">
                            Total
                          </span>
                          <span className={`text-sm font-black font-space tabular-nums ${
                            inst.rank === 1 ? 'text-brand-primary' : 'text-brand-text-dark'
                          }`}>
                            {inst.total} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInstitutions.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl shadow-[0_2px_10px_rgba(15,23,42,0.04)] mt-4">
                <p className="text-sm font-bold text-slate-700">
                  No institutions matched &quot;{institutionQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={() => setInstitutionQuery('')}
                  className="mt-2 text-xs font-extrabold text-brand-primary hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── TAB 2: OVERALL STANDINGS ── */}
      {activeTab === 'standings' && (
        <div role="tabpanel" aria-labelledby="varsity-tab-standings">
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
            {/* Header & Controls */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-[#E8EFFF] text-[#00194B] px-3 py-1 rounded-md text-[11px] font-space font-extrabold uppercase tracking-wider">
                  <span>Varsity Games {VARSITY_S2_METADATA.editionLabel}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>After League Day 1 of 4</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black font-space text-brand-text-dark tracking-tight">
                  Overall Standings
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                  Cumulative institutional arena points across all 4 League Match Days. {VARSITY_S2_METADATA.qualificationNote}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="inline-flex bg-[#F0EEEA] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
                  {[
                    { id: 'all', label: 'All (15)' },
                    { id: 'qf', label: 'Top 8 QF' },
                    { id: 'chasing', label: '9–15' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={standingsZoneFilter === f.id}
                      onClick={() => setStandingsZoneFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        standingsZoneFilter === f.id
                          ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                          : 'hover:text-brand-text-dark'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative sm:w-56">
                  <input
                    type="text"
                    value={standingsQuery}
                    onChange={(e) => setStandingsQuery(e.target.value)}
                    placeholder="Filter institution..."
                    aria-label="Filter institutions in standings"
                    className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text-dark placeholder-slate-400"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Responsive Accessible Standings Table */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div
                tabIndex={0}
                role="region"
                aria-labelledby="varsity-overall-standings-caption"
                className="ss4-standings-table-wrap"
              >
                <table className="ss4-standings-table text-left text-sm">
                  <caption id="varsity-overall-standings-caption" className="sr-only">
                    SS4 Chess League Varsity Games Nov. 26 Overall Standings After League Day 1 of 4
                  </caption>
                  <thead className="bg-[#0B192C] text-white text-[11px] font-space font-extrabold uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-3.5 px-4 text-center w-16">Rank</th>
                      <th scope="col" className="py-3.5 px-4 min-w-[200px]">Institution</th>
                      <th scope="col" className="py-3.5 px-3 text-center text-[#93C5FD]">D1</th>
                      <th scope="col" className="py-3.5 px-3 text-center text-white/50">D2</th>
                      <th scope="col" className="py-3.5 px-3 text-center text-white/50">D3</th>
                      <th scope="col" className="py-3.5 px-3 text-center text-white/50">D4</th>
                      <th scope="col" className="py-3.5 px-4 text-right text-[#93C5FD]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EEEA] font-medium">
                    {filteredStandings.map((team, idx) => {
                      const showCutoffAfter = standingsZoneFilter === 'all'
                        && !standingsQuery.trim()
                        && team.rank === 8
                        && idx < filteredStandings.length - 1;

                      return (
                        <React.Fragment key={team.id}>
                          <tr
                            className={`transition-colors ${
                              team.rank === 1
                                ? 'bg-[#E8EFFF]/65'
                                : 'bg-white hover:bg-[#F6F4F0]/70'
                            } ${team.qualifiesQF ? 'shadow-[inset_4px_0_0_#1A56C4]' : ''}`}
                          >
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex w-8 h-8 rounded-xl items-center justify-center font-space font-black text-xs tabular-nums ${
                                team.rank === 1
                                  ? 'bg-brand-primary text-white shadow-2xs'
                                  : team.qualifiesQF
                                    ? 'bg-[#E8EFFF] text-[#00194B]'
                                    : 'bg-[#F0EEEA] text-slate-600'
                              }`}>
                                {team.rank}
                              </span>
                            </td>
                            <th
                              scope="row"
                              className={`py-3.5 px-4 font-bold text-left ${
                                team.rank === 1 ? 'bg-[#eef4ff]' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-space font-black text-brand-text-dark tracking-tight">
                                  {team.shortName}
                                </span>
                                {team.qualifiesQF && (
                                  <span className="text-[9px] font-space font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D1FAE5] text-[#065F46]">
                                    QF
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-slate-500 truncate max-w-[240px] sm:max-w-none">
                                {team.name}
                              </div>
                            </th>
                            <td className="py-3.5 px-3 text-center font-space font-bold text-brand-text-dark tabular-nums">
                              {team.d1}
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-400 tabular-nums">
                              {team.d2 ?? '—'}
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-400 tabular-nums">
                              {team.d3 ?? '—'}
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-400 tabular-nums">
                              {team.d4 ?? '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className={`inline-flex min-w-[54px] justify-center px-3 py-1 rounded-xl font-space font-black text-sm tabular-nums ${
                                team.rank === 1
                                  ? 'bg-brand-primary text-white shadow-2xs'
                                  : team.qualifiesQF
                                    ? 'bg-[#E8EFFF] text-brand-primary'
                                    : 'bg-[#F0EEEA] text-brand-text-dark'
                              }`}>
                                {team.total}
                              </span>
                            </td>
                          </tr>

                          {showCutoffAfter && (
                            <tr className="bg-[#E8EFFF]/40">
                              <td colSpan={7} className="py-2 px-4 text-center">
                                <span className="text-[10px] font-space font-extrabold uppercase tracking-widest text-brand-primary">
                                  Quarter-Finals Qualification Cutoff &mdash; Top 8 Advance
                                </span>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Standings Footer */}
              <div className="bg-[#F6F4F0] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                <span className="font-semibold text-brand-text-dark">
                  {VARSITY_S2_METADATA.qualificationNote}
                </span>
                <a
                  href={VARSITY_S2_METADATA.youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-primary hover:underline"
                >
                  {VARSITY_S2_METADATA.youtubeChannelLabel}
                </a>
              </div>
            </div>

            {/* Day 1 Star Players Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VARSITY_S2_STAR_PLAYERS.map((player) => (
                <div
                  key={player.id}
                  className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-brand-primary block">
                      {player.matchDayLabel} &bull; {player.category}
                    </span>
                    <div className="text-base font-space font-black text-brand-text-dark truncate mt-0.5">
                      {player.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {player.shortName} &middot; @{player.handle} &middot; {player.rating}
                    </div>
                  </div>
                  <div className="bg-[#E8EFFF] rounded-xl px-3.5 py-2 text-center shrink-0">
                    <div className="text-lg font-space font-black text-brand-primary tabular-nums leading-none">
                      {player.metrics[0].value}
                    </div>
                    <div className="text-[9px] font-space font-bold uppercase tracking-wider text-[#00194B] mt-1">
                      {player.metrics[0].label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 3: SEASON 1 ARCHIVE (SEPTEMBER 2026) ── */}
      {activeTab === 'archive' && (
        <div role="tabpanel" aria-labelledby="varsity-tab-archive">
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block bg-[#F0EEEA] text-slate-700 px-3 py-1 rounded-md text-[10px] font-space font-extrabold uppercase tracking-wider">
                  Historical Record &bull; September 2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-space text-brand-text-dark tracking-tight">
                  Varsity Tournament Season 1 Archive
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Verified rosters, standings, and board records from the inaugural September 2026 Varsity edition.
                </p>
              </div>

              <div className="inline-flex bg-[#F0EEEA] p-1 rounded-xl text-xs font-bold text-slate-600 gap-1 overflow-x-auto no-scrollbar">
                {ARCHIVE_SUBTABS.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    aria-pressed={archiveTab === sub.id}
                    onClick={() => setArchiveTab(sub.id)}
                    className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      archiveTab === sub.id
                        ? 'bg-white text-brand-primary shadow-2xs font-extrabold'
                        : 'hover:text-brand-text-dark'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {archiveTab === 'directory' && <PlayerDirectory />}
              {archiveTab === 'teams' && <TeamCards />}
              {archiveTab === 'standings' && <LeagueStandingsTable />}
              {archiveTab === 'records' && <GameRecordsTable />}
            </div>
          </section>
        </div>
      )}

      {/* ── POSTER FULLSCREEN ZOOM MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="SS4 Varsity Tournament Season 2 Official Poster"
            className="fixed inset-0 z-50 bg-[#0B192C]/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
          >
            <div
              className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={VARSITY_S2_METADATA.posterUrl}
                alt="SS4 Chess League Varsity Tournament Nov. 26 Season 2 Official Poster"
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="mt-4 px-5 py-2.5 min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VarsityTournamentHub;
