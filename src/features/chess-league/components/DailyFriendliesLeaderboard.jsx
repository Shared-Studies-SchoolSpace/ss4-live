import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth-portal/hooks/useAuth';
import { fetchAllFriendliesData } from '../utils/friendliesService';

const DEFAULT_ARENA_IDS = ['O8MFtK4X'];

export default function DailyFriendliesLeaderboard({ allPlayers = [], onPlayerSelect, onStatsUpdate, refreshTrigger = 0 }) {
  const { profile } = useAuth();
  const userRowRef = useRef(null);
  const hasScrolledRef = useRef(false);

  const [arenaIds, setArenaIds] = useState(DEFAULT_ARENA_IDS);
  const [selectedArenaId, setSelectedArenaId] = useState(DEFAULT_ARENA_IDS[0]);
  const [tableMode, setTableMode] = useState('season'); // 'season' | 'arena'
  const [arenaDetailsMap, setArenaDetailsMap] = useState({});
  const [allArenaResults, setAllArenaResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchLichessData = async () => {
      setLoading(true);
      setError(null);
      hasScrolledRef.current = false;

      try {
        // Auto-fetch all host tournaments directly from Lichess without database dependency
        const data = await fetchAllFriendliesData(['Jhudex']);
        
        if (isMounted) {
          const ids = data.tournaments.map(t => t.id);
          setArenaIds(ids.length > 0 ? ids : DEFAULT_ARENA_IDS);
          if (ids.length > 0 && (!selectedArenaId || !ids.includes(selectedArenaId))) {
            setSelectedArenaId(ids[0]);
          }
          setArenaDetailsMap(data.arenaDetailsMap);
          setAllArenaResults(data.allArenaResults);
        }
      } catch (err) {
        console.warn('Lichess API auto-fetch error:', err);
        if (isMounted) setError('Could not load live Lichess data. Displaying cached standings.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLichessData();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  // Currently selected arena details
  const selectedArena = useMemo(() => {
    return arenaDetailsMap[selectedArenaId] || null;
  }, [arenaDetailsMap, selectedArenaId]);

  const selectedArenaMeta = selectedArena?.meta;
  const selectedArenaResults = useMemo(() => selectedArena?.results || [], [selectedArena]);

  // Helper for computing dynamic arena title
  const getArenaLabel = (startsAt, fullName) => {
    if (fullName && !fullName.includes("Arena")) {
      return fullName;
    }
    if (!startsAt) return "Daily Arena";
    const arenaDate = new Date(startsAt);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const targetDate = new Date(arenaDate.getFullYear(), arenaDate.getMonth(), arenaDate.getDate());

    if (targetDate.getTime() === today.getTime()) {
      return "Tonight's Arena";
    } else if (targetDate.getTime() === yesterday.getTime()) {
      return "Last Night's Arena";
    } else {
      const weekday = arenaDate.toLocaleDateString('en-US', { weekday: 'short' });
      const month = arenaDate.toLocaleDateString('en-US', { month: 'short' });
      const day = arenaDate.getDate();
      return `Arena — ${weekday}, ${month} ${day}`;
    }
  };

  const selectedArenaTitle = useMemo(() => {
    return getArenaLabel(selectedArenaMeta?.startsAt, selectedArenaMeta?.fullName);
  }, [selectedArenaMeta]);

  // Available Arenas dropdown options
  const arenaOptions = useMemo(() => {
    return arenaIds.map(id => {
      const item = arenaDetailsMap[id];
      const startsAt = item?.meta?.startsAt;
      const title = getArenaLabel(startsAt, item?.meta?.fullName);
      const name = item?.meta?.fullName || item?.meta?.name || `Arena #${id.slice(0, 6)}`;
      return {
        id,
        title,
        name,
        startsAt
      };
    });
  }, [arenaIds, arenaDetailsMap]);

  // Derive Recent 5 Arenas vs Older Arenas for Quick-Select Tabs
  const recentArenas = useMemo(() => {
    return arenaOptions.slice(0, 5);
  }, [arenaOptions]);

  const olderArenas = useMemo(() => {
    return arenaOptions.slice(5);
  }, [arenaOptions]);

  const isOlderArenaSelected = useMemo(() => {
    return olderArenas.some(opt => opt.id === selectedArenaId);
  }, [olderArenas, selectedArenaId]);

  // Signed-in user rank matching helper
  const isUserMatch = useMemo(() => {
    if (!profile) return () => false;
    const userLichess = profile.lichess_username?.toLowerCase()?.trim();
    const userChess = profile.chess_username?.toLowerCase()?.trim();
    if (!userLichess && !userChess) return () => false;

    return (player) => {
      if (!player) return false;
      const pUsername = player.username?.toLowerCase()?.trim();
      const pName = player.name?.toLowerCase()?.trim();
      const pLichess = player.profile?.lichess_username?.toLowerCase()?.trim();
      const pChess = player.profile?.chess_username?.toLowerCase()?.trim();

      return Boolean(
        (userLichess && (pUsername === userLichess || pName === userLichess || pLichess === userLichess || pChess === userLichess)) ||
        (userChess && (pUsername === userChess || pName === userChess || pLichess === userChess || pChess === userChess))
      );
    };
  }, [profile]);

  // Compute Season Cumulative Standings across all tournaments
  const seasonStandings = useMemo(() => {
    const playerMap = {};

    allArenaResults.forEach(item => {
      const uname = item.username || item.name;
      if (!uname) return;
      
      const key = uname.toLowerCase();
      if (!playerMap[key]) {
        playerMap[key] = {
          username: uname,
          pts: 0,
          dp: new Set(),
          perfList: [],
          wins: 0,
          highestSingle: 0,
        };
      }

      playerMap[key].pts += item.score || 0;
      if (item.arena_id) playerMap[key].dp.add(item.arena_id);
      if (item.performance) playerMap[key].perfList.push(item.performance);
      if (item.rank === 1) playerMap[key].wins += 1;
      if ((item.score || 0) > playerMap[key].highestSingle) {
        playerMap[key].highestSingle = item.score || 0;
      }
    });

    const sorted = Object.values(playerMap).map(p => {
      const avgPerf = p.perfList.length > 0 
        ? Math.round(p.perfList.reduce((a, b) => a + b, 0) / p.perfList.length)
        : 1500;

      const matchedProfile = allPlayers.find(ap => 
        ap.lichess_username?.toLowerCase() === p.username.toLowerCase() ||
        ap.chess_username?.toLowerCase() === p.username.toLowerCase() ||
        ap.username?.toLowerCase() === p.username.toLowerCase()
      );

      return {
        username: p.username,
        name: matchedProfile?.name || p.username,
        dp: Math.max(p.dp.size, 1),
        pts: p.pts,
        perf: avgPerf,
        wins: p.wins,
        profile: matchedProfile
      };
    });

    sorted.sort((a, b) => b.pts - a.pts || b.perf - a.perf || b.wins - a.wins);

    return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [allArenaResults, allPlayers]);

  // Format Standings for Selected Arena specifically
  const selectedArenaStandings = useMemo(() => {
    return selectedArenaResults.map((item, idx) => {
      const uname = item.username || item.name || 'Anonymous';
      const matchedProfile = allPlayers.find(ap => 
        ap.lichess_username?.toLowerCase() === uname.toLowerCase() ||
        ap.chess_username?.toLowerCase() === uname.toLowerCase() ||
        ap.username?.toLowerCase() === uname.toLowerCase()
      );

      return {
        username: uname,
        name: matchedProfile?.name || uname,
        dp: 1,
        pts: item.score || 0,
        perf: item.performance || 1500,
        wins: item.rank === 1 ? 1 : 0,
        rank: item.rank || idx + 1,
        profile: matchedProfile
      };
    });
  }, [selectedArenaResults, allPlayers]);

  // Active view standings based on tableMode
  const activeStandingsRaw = useMemo(() => {
    return tableMode === 'season' ? seasonStandings : selectedArenaStandings;
  }, [tableMode, seasonStandings, selectedArenaStandings]);

  // Filtered standings by search query
  const activeStandings = useMemo(() => {
    if (!searchQuery.trim()) return activeStandingsRaw;
    const q = searchQuery.toLowerCase().trim();
    return activeStandingsRaw.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.profile?.university?.toLowerCase().includes(q)
    );
  }, [activeStandingsRaw, searchQuery]);

  // Summary Metrics calculation
  const summaryMetrics = useMemo(() => {
    const arenasCount = arenaIds.length;
    const playersCount = seasonStandings.length;
    const leader = seasonStandings[0]?.name || seasonStandings[0]?.username || '—';
    const topScore = seasonStandings[0]?.pts || 0;

    return {
      arenasCount,
      playersCount,
      leader,
      topScore
    };
  }, [arenaIds, seasonStandings]);

  // Determine current live arena status
  const currentArenaStatus = useMemo(() => {
    if (!selectedArenaMeta) return 'live';
    if (selectedArenaMeta.status === 30 || selectedArenaMeta.isFinished) return 'finished';
    if (selectedArenaMeta.status === 20 || selectedArenaMeta.isStarted) return 'live';
    return 'upcoming';
  }, [selectedArenaMeta]);

  // Emit summary metrics up to parent
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate({
        summaryMetrics,
        arenaStatus: currentArenaStatus,
        loading
      });
    }
  }, [summaryMetrics, currentArenaStatus, loading, onStatsUpdate]);

  // Top 3 Podium Winners
  const topPodium = useMemo(() => {
    const source = tableMode === 'season' ? seasonStandings : selectedArenaStandings;
    return source.slice(0, 3);
  }, [tableMode, seasonStandings, selectedArenaStandings]);

  // Render Podium Section
  const renderPodiumSection = () => {
    const hasArena = selectedArenaId && arenaDetailsMap[selectedArenaId];

    if (!loading && !hasArena && tableMode === 'arena') {
      return null;
    }

    const p1 = topPodium[0];
    const p2 = topPodium[1];
    const p3 = topPodium[2];

    return (
      <div className="space-y-3">
        {/* Arena Subheader & External Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-500 select-none">
              workspace_premium
            </span>
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase font-space">
              {tableMode === 'season' ? 'All-Time Season Podium' : `${selectedArenaTitle} Podium`}
            </p>
          </div>

          {selectedArenaMeta?.id && (
            <a
              href={`https://lichess.org/tournament/${selectedArenaMeta.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1A56C4] hover:text-[#1545A2] transition-colors"
            >
              View Tournament on Lichess
              <span className="material-symbols-outlined text-[14px] select-none">
                open_in_new
              </span>
            </a>
          )}
        </div>

        {/* Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
          {/* Rank 1: Champion Card */}
          <div
            onClick={() => p1 && onPlayerSelect && onPlayerSelect(p1)}
            className="order-1 md:order-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-space text-lg font-black">
                🥇
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  1st Champion
                </span>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p1?.name || p1?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-white/90 border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="font-space text-lg font-black text-amber-700">{p1?.score ?? p1?.pts ?? 0}</span>
              <span className="text-[10px] font-bold text-amber-600 ml-1 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 2: Silver Runner-Up Card */}
          <div
            onClick={() => p2 && onPlayerSelect && onPlayerSelect(p2)}
            className="order-2 md:order-2 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-300/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-400 text-white flex items-center justify-center shrink-0 shadow-sm font-space text-lg font-black">
                🥈
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  2nd Place
                </span>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p2?.name || p2?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="font-space text-lg font-bold text-slate-700">{p2?.score ?? p2?.pts ?? 0}</span>
              <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 3: Bronze 3rd Place Card */}
          <div
            onClick={() => p3 && onPlayerSelect && onPlayerSelect(p3)}
            className="order-3 md:order-3 bg-gradient-to-br from-orange-50/60 to-amber-50/60 border border-amber-700/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-amber-700/50 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-sm font-space text-lg font-black">
                🥉
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  3rd Place
                </span>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p3?.name || p3?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-white/90 border border-amber-700/20 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="font-space text-lg font-bold text-amber-900">{p3?.score ?? p3?.pts ?? 0}</span>
              <span className="text-[10px] font-bold text-amber-800 ml-1 uppercase">pts</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStandingsTable = () => (
    <div className="space-y-4 pt-2">
      {/* ── TOURNAMENT QUICK-SELECT TAB BAR & DROPDOWN ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 font-space flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#1A56C4]">tune</span>
            Select Tournament Arena View
          </label>

          {/* Live Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player or handle..."
              className="w-full bg-white text-[#111111] placeholder-gray-400 text-xs font-semibold rounded-xl px-3.5 py-2 pl-9 border border-gray-200 focus:outline-none focus:border-[#1A56C4] focus:ring-1 focus:ring-[#1A56C4] transition-all shadow-xs"
            />
            <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-2.5 top-2 pointer-events-none select-none">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px] select-none">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Select Tabs (Season + Recent 5 Arenas + Older Arenas Dropdown) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x">
          {/* Season Standings Tab */}
          <button
            onClick={() => setTableMode('season')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 outline-none ${
              tableMode === 'season'
                ? 'bg-[#0c1e54] text-white shadow-md font-black ring-2 ring-[#0c1e54]/30'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/90'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400 select-none">
              emoji_events
            </span>
            <span>Season Standings (All-Time)</span>
          </button>

          {/* Recent 5 Arenas Quick-Select Pills */}
          {recentArenas.map((opt, idx) => {
            const isSelected = tableMode === 'arena' && selectedArenaId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedArenaId(opt.id);
                  setTableMode('arena');
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border outline-none ${
                  isSelected
                    ? 'bg-[#1A56C4] text-white border-transparent shadow-md font-black ring-2 ring-[#1A56C4]/30'
                    : 'bg-white text-gray-700 border-gray-200/90 hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] opacity-80 select-none">
                  {idx === 0 ? 'bolt' : 'sports_esports'}
                </span>
                <span>{opt.title}</span>
              </button>
            );
          })}

          {/* Older Arenas Dropdown (if more than 5 arenas exist) */}
          {olderArenas.length > 0 && (
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={isOlderArenaSelected && tableMode === 'arena' ? selectedArenaId : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedArenaId(e.target.value);
                    setTableMode('arena');
                  }
                }}
                className={`text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 border transition-all cursor-pointer shadow-xs appearance-none focus:outline-none ${
                  isOlderArenaSelected && tableMode === 'arena'
                    ? 'bg-[#1A56C4] text-white border-transparent font-black ring-2 ring-[#1A56C4]/30'
                    : 'bg-white text-gray-700 border-gray-200/90 hover:bg-gray-50'
                }`}
              >
                <option value="" disabled className="text-gray-400">
                  More Arenas ({olderArenas.length}) ▼
                </option>
                {olderArenas.map(opt => (
                  <option key={opt.id} value={opt.id} className="text-[#111111] bg-white font-semibold py-1">
                    {opt.title} ({opt.name})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[16px] absolute right-2.5 pointer-events-none select-none opacity-80">
                expand_more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── ENHANCED STANDINGS TABLE (SS4 Varsity Design System) ── */}
      <div className="border border-gray-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
        {/* Sticky Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 text-xs font-black text-gray-600 uppercase tracking-wider select-none border-b border-gray-200 sticky top-0 z-20 font-space">
          <span className="col-span-2 sm:col-span-1 text-center">RANK</span>
          <span className="col-span-6 sm:col-span-5">PLAYER &amp; HANDLE</span>
          <span className="col-span-2 text-center">{tableMode === 'season' ? 'ARENAS' : 'ARENA'}</span>
          <span className="col-span-2 text-center">POINTS</span>
          <span className="hidden sm:block sm:col-span-2 text-center">RATING</span>
        </div>

        {/* Scrollable Ranked Rows */}
        <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-100">
          {activeStandings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs font-semibold space-y-2">
              <span className="material-symbols-outlined text-3xl text-gray-300">search_off</span>
              <p>{searchQuery ? `No players matched "${searchQuery}"` : 'No standings recorded for this view'}</p>
            </div>
          ) : (
            activeStandings.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isSecond = p.rank === 2;
              const isThird = p.rank === 3;
              const isTopThree = p.rank <= 3;
              const isUser = isUserMatch(p);

              return (
                <div
                  key={p.username || idx}
                  ref={isUser ? (el => {
                    if (el && !hasScrolledRef.current) {
                      userRowRef.current = el;
                      setTimeout(() => {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }, 100);
                      hasScrolledRef.current = true;
                    }
                  }) : null}
                  role="button"
                  aria-label={`${p.name} — view profile`}
                  tabIndex={0}
                  onClick={() => onPlayerSelect && onPlayerSelect(p.profile || { username: p.username, name: p.name })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPlayerSelect && onPlayerSelect(p.profile || { username: p.username, name: p.name });
                    }
                  }}
                  style={{ animationDelay: `${Math.min(idx, 15) * 30}ms` }}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm transition-all cursor-pointer select-none group hover:bg-[#1A56C4]/5 ${
                    isUser
                      ? 'ring-2 ring-[#1A56C4] bg-[#1A56C4]/10 shadow-sm relative z-10 rounded-xl'
                      : isFirst
                      ? 'bg-amber-500/5 border-l-4 border-l-amber-500 hover:bg-amber-500/10'
                      : isSecond
                      ? 'bg-slate-500/5 border-l-4 border-l-slate-400 hover:bg-slate-500/10'
                      : isThird
                      ? 'bg-amber-700/5 border-l-4 border-l-amber-700 hover:bg-amber-700/10'
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* RANK COLUMN */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-space shadow-xs ${
                      isFirst ? 'bg-amber-500 text-white ring-2 ring-amber-300' :
                      isSecond ? 'bg-slate-400 text-white' :
                      isThird ? 'bg-amber-700 text-white' :
                      'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                    }`}>
                      {isFirst ? '👑' : p.rank}
                    </span>
                  </div>

                  {/* PLAYER COLUMN */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 truncate pr-2">
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#111111] truncate group-hover:text-[#1A56C4] transition-colors">
                          {p.name}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                            You
                          </span>
                        )}
                        {p.wins > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded shrink-0">
                            ⭐ {p.wins} {p.wins === 1 ? 'Win' : 'Wins'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <span>@{p.username}</span>
                        {p.profile?.university && (
                          <>
                            <span>&bull;</span>
                            <span className="text-gray-500">{p.profile.university}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* ARENAS PLAYED */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[13px] text-gray-400">flag</span>
                      {p.dp}
                    </span>
                  </div>

                  {/* TOTAL POINTS */}
                  <div className="col-span-2 text-center">
                    <span className="font-space text-base sm:text-lg font-black text-[#1A56C4]">
                      {p.pts} <span className="text-[10px] font-bold text-gray-400 uppercase">pts</span>
                    </span>
                  </div>

                  {/* PERFORMANCE RATING */}
                  <div className="hidden sm:block sm:col-span-2 text-center">
                    <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg">
                      {p.perf ? `${p.perf} ELO` : '—'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderSkeletonWireframe = () => (
    <div className="space-y-6 animate-pulse" aria-label="Loading League Data">
      {/* Podium Cards Wireframe */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200/80 rounded w-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 h-20 shadow-xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </div>
              <div className="w-14 h-8 bg-gray-200 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Table & Controls Wireframe */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-200 rounded w-64" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded-xl w-36" />
            <div className="h-10 bg-gray-200 rounded-xl w-48" />
          </div>
        </div>

        {/* Table Rows Wireframe */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <span className="col-span-1 text-center">Rank</span>
            <span className="col-span-5">Player</span>
            <span className="col-span-2 text-center">Played</span>
            <span className="col-span-2 text-center">Points</span>
            <span className="col-span-2 text-center">Perf</span>
          </div>

          {[1, 2, 3, 4, 5, 6, 7].map((row) => (
            <div key={row} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center border border-gray-100 rounded-xl bg-gray-50/50">
              <div className="col-span-1 flex justify-center">
                <div className="w-7 h-7 bg-gray-200 rounded-lg" />
              </div>
              <div className="col-span-5 flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-36" />
              </div>
              <div className="col-span-2 flex justify-center"><div className="h-4 bg-gray-200 rounded w-8" /></div>
              <div className="col-span-2 flex justify-center"><div className="h-4 bg-gray-200 rounded w-10" /></div>
              <div className="col-span-2 flex justify-center"><div className="h-4 bg-gray-200 rounded w-12" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {loading ? (
        renderSkeletonWireframe()
      ) : (
        <>
          {/* Render Podium Section */}
          {renderPodiumSection()}

          {activeStandings.length === 0 && !searchQuery ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
              <p className="text-sm font-semibold text-gray-500">
                No standings recorded yet for Season II
              </p>
            </div>
          ) : (
            renderStandingsTable()
          )}
        </>
      )}

      {/* Aesthetic Footer Watermark */}
      <div className="text-center pt-8 border-t border-gray-200 flex flex-col items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-[22px] text-gray-400 select-none">
          grid_view
        </span>
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-gray-400 uppercase select-none">
          The Board Remembers
        </p>
      </div>
    </div>
  );
}
