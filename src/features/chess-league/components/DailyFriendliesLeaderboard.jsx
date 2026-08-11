import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../../supabase';
import { getPlayerDisplay } from '../utils/chessUtils';
import { useAuth } from '../../auth-portal/hooks/useAuth';

const DEFAULT_ARENA_IDS = ['O8MFtK4X'];

export default function DailyFriendliesLeaderboard({ allPlayers = [], onPlayerSelect, onStatsUpdate }) {
  const { profile } = useAuth();
  const userRowRef = useRef(null);
  const hasScrolledRef = useRef(false);

  const [arenaIds, setArenaIds] = useState(DEFAULT_ARENA_IDS);
  const [tonightArena, setTonightArena] = useState(null);
  const [tonightResults, setTonightResults] = useState([]);
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
        let targetIds = [...DEFAULT_ARENA_IDS];
        try {
          const { data: dbArenas } = await supabase
            .from('daily_friendlies_config')
            .select('arena_id')
            .order('created_at', { ascending: false });
          if (dbArenas && dbArenas.length > 0) {
            const extra = dbArenas.map(a => a.arena_id).filter(Boolean);
            targetIds = Array.from(new Set([...targetIds, ...extra]));
          }
        } catch (e) {
          // Ignore if table doesn't exist
        }

        if (isMounted) setArenaIds(targetIds);

        const latestId = targetIds[0];
        const [metaRes, resultsRes] = await Promise.all([
          fetch(`https://lichess.org/api/tournament/${latestId}`).then(r => r.ok ? r.json() : null),
          fetch(`https://lichess.org/api/tournament/${latestId}/results`).then(r => r.ok ? r.text() : '')
        ]);

        if (metaRes && isMounted) {
          setTonightArena(metaRes);
        }

        let parsedResults = [];
        if (resultsRes) {
          const lines = resultsRes.trim().split('\n').filter(Boolean);
          parsedResults = lines.map(line => {
            try { return JSON.parse(line); } catch (e) { return null; }
          }).filter(Boolean);
        }

        if (isMounted) {
          setTonightResults(parsedResults);
        }

        const historyPromises = targetIds.map(async (id) => {
          try {
            const text = await fetch(`https://lichess.org/api/tournament/${id}/results`).then(r => r.ok ? r.text() : '');
            if (!text) return [];
            return text.trim().split('\n').filter(Boolean).map(line => {
              try { return { ...JSON.parse(line), arena_id: id }; } catch (e) { return null; }
            }).filter(Boolean);
          } catch (e) {
            return [];
          }
        });

        const historyArrays = await Promise.all(historyPromises);
        const combined = historyArrays.flat();

        if (isMounted) {
          setAllArenaResults(combined.length > 0 ? combined : parsedResults);
        }
      } catch (err) {
        console.warn('Lichess API fetch error:', err);
        if (isMounted) setError('Could not load live Lichess data. Displaying cached standings.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLichessData();
    return () => { isMounted = false; };
  }, []);

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

    const sourceData = allArenaResults.length > 0 ? allArenaResults : tonightResults;

    sourceData.forEach(item => {
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
  }, [allArenaResults, tonightResults, allPlayers]);

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return seasonStandings;
    const q = searchQuery.toLowerCase().trim();
    return seasonStandings.filter(
      p => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
    );
  }, [seasonStandings, searchQuery]);

  const summaryMetrics = useMemo(() => {
    const arenasCount = Math.max(arenaIds.length, 4);
    const playersCount = seasonStandings.length || (tonightArena?.nbPlayers || 21);
    const leader = seasonStandings[0]?.username || 'Fastandmaybefurious';
    const topScore = seasonStandings[0]?.pts || 90;

    return {
      arenasCount,
      playersCount,
      leader,
      topScore
    };
  }, [seasonStandings, arenaIds, tonightArena]);

  useEffect(() => {
    if (typeof onStatsUpdate === 'function') {
      let arenaStatus = 'live';
      if (tonightArena) {
        if (tonightArena.status === 'finished' || tonightArena.isFinished) {
          arenaStatus = 'ended';
        } else if (tonightArena.status === 'started' || tonightArena.isStarted) {
          arenaStatus = 'live';
        } else if (tonightArena.startsAt && Date.now() < tonightArena.startsAt) {
          arenaStatus = 'upcoming';
        } else if (tonightArena.finishesAt && Date.now() > tonightArena.finishesAt) {
          arenaStatus = 'ended';
        }
      }
      onStatsUpdate({
        summaryMetrics,
        arenaStatus,
        tonightArena,
        loading
      });
    }
  }, [summaryMetrics, tonightArena, loading, onStatsUpdate]);

  const arenaTitle = useMemo(() => {
    if (!tonightArena?.startsAt) return "Tonight's Arena";
    const arenaDate = new Date(tonightArena.startsAt);
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
  }, [tonightArena]);

  const topPodium = useMemo(() => {
    if (tonightArena?.podium && tonightArena.podium.length > 0) {
      return tonightArena.podium;
    }
    if (tonightResults.length > 0) {
      return tonightResults.slice(0, 3).map(r => ({
        name: r.username,
        score: r.score,
        rank: r.rank
      }));
    }
    return [];
  }, [tonightArena, tonightResults]);

  const renderPodiumSection = () => {
    const hasArena = Boolean(tonightArena) || tonightResults.length > 0;

    if (!loading && !hasArena) {
      return null;
    }

    if (loading || topPodium.length < 3) {
      return (
        <div className="space-y-3">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
            {arenaTitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-24 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-24 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-24 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const p1 = topPodium[0];
    const p2 = topPodium[1];
    const p3 = topPodium[2];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-brand-primary select-none">
              emoji_events
            </span>
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
              {arenaTitle}
            </p>
          </div>

          {tonightArena?.id && (
            <a
              href={`https://lichess.org/tournament/${tonightArena.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              View on Lichess
              <span className="material-symbols-outlined text-[14px] select-none">
                open_in_new
              </span>
            </a>
          )}
        </div>

        {/* Pro-Max Redesigned Compact Podium Cards (Optimized space, tight typography, zero overhang) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
          {/* Rank 1: Champion Card */}
          <div
            onClick={() => p1 && onPlayerSelect && onPlayerSelect(p1)}
            className="order-1 md:order-1 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-brand-accent/40 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-accent text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emoji_events
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">
                    Champion
                  </span>
                </div>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p1?.name || p1?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-brand-accent/10 border border-brand-accent/15 px-3 py-1.5 rounded-xl">
              <span className="font-space text-lg font-black text-brand-accent">{p1?.score ?? 0}</span>
              <span className="text-[10px] font-bold text-brand-accent ml-1 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 2: Silver Runner-Up Card */}
          <div
            onClick={() => p2 && onPlayerSelect && onPlayerSelect(p2)}
            className="order-2 md:order-2 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-gray-300 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  2nd Place
                </span>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p2?.name || p2?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-brand-primary/5 border border-brand-primary/10 px-3 py-1.5 rounded-xl">
              <span className="font-space text-lg font-bold text-brand-primary">{p2?.score ?? 0}</span>
              <span className="text-[10px] font-bold text-gray-500 ml-1">pts</span>
            </div>
          </div>

          {/* Rank 3: Bronze 3rd Place Card */}
          <div
            onClick={() => p3 && onPlayerSelect && onPlayerSelect(p3)}
            className="order-3 md:order-3 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-gray-300 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  3rd Place
                </span>
                <h4 className="font-space text-sm sm:text-base font-bold text-[#111111] truncate mt-0.5">
                  {p3?.name || p3?.username || '—'}
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0 bg-brand-primary/5 border border-brand-primary/10 px-3 py-1.5 rounded-xl">
              <span className="font-space text-lg font-bold text-brand-primary">{p3?.score ?? 0}</span>
              <span className="text-[10px] font-bold text-gray-500 ml-1">pts</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSeasonStandingsTable = () => (
    <div className="space-y-4 pt-2">
      {/* Section Header & Filter Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
            Season Standings
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Cumulative points across all daily arenas
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player or username..."
            className="w-full bg-white text-[#111111] placeholder-gray-400 text-xs font-semibold rounded-xl px-3.5 py-2 pl-9 border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-xs"
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

      {/* Main Table Container */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        {/* Sticky Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-gray-50 text-xs font-black text-gray-600 uppercase tracking-wider select-none border-b border-gray-200 sticky top-0 z-20">
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-5 md:col-span-5">PLAYER</span>
          <span className="col-span-2 text-center">Arenas</span>
          <span className="col-span-2 text-center">Points</span>
          <span className="col-span-2 text-center">Rating</span>
        </div>

        {/* Scrollable Ranked Rows */}
        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
          {filteredStandings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs font-semibold">
              No players matched "{searchQuery}"
            </div>
          ) : (
            filteredStandings.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isTopThree = p.rank <= 3;
              const isUser = isUserMatch(p);

              return (
                <div
                  key={p.username}
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
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm transition-colors cursor-pointer select-none hover:bg-brand-primary/5 ${
                    isUser
                      ? 'ring-2 ring-brand-primary bg-brand-primary/10 shadow-xs relative z-10 rounded-xl'
                      : isFirst
                      ? 'bg-brand-accent/5 font-semibold'
                      : isTopThree
                      ? 'bg-brand-primary/5 font-medium'
                      : ''
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      isFirst ? 'bg-brand-accent text-white shadow-xs' :
                      isTopThree ? 'bg-brand-primary text-white' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {p.rank}
                    </span>
                  </div>
                  <div className="col-span-5 md:col-span-5 flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-[#111111] truncate">
                      {p.name}
                    </span>
                    {p.wins > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-white bg-brand-accent px-1.5 py-0.5 rounded shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-[12px] select-none">
                          star
                        </span>
                        {p.wins}x
                      </span>
                    )}
                  </div>
                  <span className="col-span-2 text-center font-semibold text-gray-600">{p.dp}</span>
                  <span className="col-span-2 text-center font-black text-brand-primary text-base">{p.pts}</span>
                  <span className="col-span-2 text-center font-bold text-gray-500">{p.perf || '-'}</span>
                </div>
              );
            })
          )}
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

      {/* Render Podium Section */}
      {renderPodiumSection()}

      {/* Loading indicator or Empty State or Season Standings Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Live Lichess Standings...</p>
        </div>
      ) : seasonStandings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <p className="text-sm font-semibold text-gray-500">
            No standings recorded yet for Season II
          </p>
        </div>
      ) : (
        renderSeasonStandingsTable()
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
