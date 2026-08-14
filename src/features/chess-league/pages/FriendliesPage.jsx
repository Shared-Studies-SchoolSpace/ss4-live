import React, { useState, useCallback, useEffect } from 'react';
import DailyFriendliesLeaderboard from '../components/DailyFriendliesLeaderboard';
import { PlayerProfile } from '../components/PlayerProfile';
import FriendliesAdminModal from '../components/FriendliesAdminModal';

export default function FriendliesPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    document.title = 'League Leaderboard | SS4 Chess League';
  }, []);

  const handleStatsUpdate = useCallback((data) => {
    setStatsData(data);
  }, []);

  const summary = statsData?.summaryMetrics;
  const status = statsData?.arenaStatus || 'live';
  const isLoading = statsData?.loading ?? true;

  return (
    <div className="w-full bg-[#F6F4F0] min-h-screen text-brand-text-dark font-sans">
      {/* ── Hero Section (SS4 Design System: Varsity Blue + Clean Overlines) ── */}
      <div className="relative border-b border-gray-200/80 pt-10 pb-14 px-4 text-white overflow-hidden bg-gradient-to-br from-[#0c1e54] via-[#102a70] to-[#1A56C4]">
        {/* Ambient background bloom */}
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 space-y-6">
          {/* Category Overline (Matching TournamentHero Standard) & Status Pill */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white/70 uppercase">
              SCL Daily League
            </p>

            {isLoading ? (
              <span className="inline-flex items-center gap-2 text-xs bg-white/10 border border-white/10 text-white/80 font-semibold px-3.5 py-1.5 rounded-full animate-pulse">
                <span className="material-symbols-outlined text-[16px] animate-spin select-none">
                  progress_activity
                </span>
                Loading Arena Data
              </span>
            ) : status === 'live' ? (
              <span className="inline-flex items-center gap-2 text-xs bg-rose-500/20 border border-rose-500/20 text-rose-200 font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                Live Arena Battle
              </span>
            ) : status === 'upcoming' ? (
              <span className="inline-flex items-center gap-2 text-xs bg-white/15 border border-white/15 text-white font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] select-none">
                  schedule
                </span>
                Upcoming Arena Scheduled
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs bg-white/10 border border-white/10 text-white/70 font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-white/70 select-none">
                  check_circle
                </span>
                Arena Concluded
              </span>
            )}
          </div>

          {/* Title & Headline */}
          <div className="max-w-3xl space-y-2">
            <h1 
              onDoubleClick={() => setShowAdminModal(true)}
              className="text-3xl md:text-5xl font-black text-white font-space tracking-tight leading-tight cursor-pointer select-none group"
              title="Double-click to open Admin Panel"
            >
              League Leaderboard
            </h1>
            <p className="text-sm md:text-base font-semibold text-white/70 leading-relaxed">
              Daily arena battles &bull; Season standings updated live
            </p>
          </div>

          {/* Embedded Stats Cards (Borders match background tint: bg-white/10 border-white/15) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-white/15">
            {/* Arenas Played */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                  Arenas Played
                </p>
                <span className="material-symbols-outlined text-[18px] text-white/60 select-none">
                  flag
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 bg-white/15 rounded animate-pulse mt-2 w-16" />
              ) : (
                <p className="font-space text-2xl md:text-3xl font-black text-white mt-1">
                  {summary?.arenasCount ?? 0}
                </p>
              )}
            </div>

            {/* Players Tracked */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                  Players Tracked
                </p>
                <span className="material-symbols-outlined text-[18px] text-white/60 select-none">
                  groups
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 bg-white/15 rounded animate-pulse mt-2 w-20" />
              ) : (
                <p className="font-space text-2xl md:text-3xl font-black text-white mt-1">
                  {summary?.playersCount ?? 0}
                </p>
              )}
            </div>

            {/* Current Leader */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                  Current Leader
                </p>
                <span className="material-symbols-outlined text-[18px] text-white/60 select-none">
                  emoji_events
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 bg-white/15 rounded animate-pulse mt-2 w-28" />
              ) : (
                <p className="font-space text-lg md:text-2xl font-black text-white mt-1 break-words">
                  {summary?.leader || '—'}
                </p>
              )}
            </div>

            {/* Top Score */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                  Top Score
                </p>
                <span className="material-symbols-outlined text-[18px] text-white/60 select-none">
                  electric_bolt
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 bg-white/15 rounded animate-pulse mt-2 w-20" />
              ) : (
                <p className="font-space text-2xl md:text-3xl font-black text-white mt-1">
                  {summary?.topScore ? `${summary.topScore} pts` : '—'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <DailyFriendliesLeaderboard
          onPlayerSelect={(p) => setSelectedPlayer(p)}
          onStatsUpdate={handleStatsUpdate}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Player profile modal */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Friendlies Admin Modal */}
      <FriendliesAdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onArenaUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

