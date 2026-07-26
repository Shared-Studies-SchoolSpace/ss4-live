import React, { useState, useMemo, useEffect } from 'react';
import { fetchCompletePlayerData } from '../utils/chessService';

function getMonogram(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function PlayerAvatar({ player }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!player?.username) return;
    const platform = player.lichess_username && !player.username ? 'lichess' : 'chess.com';
    const targetUsername = platform === 'lichess' ? player.lichess_username : player.username;
    // ponytail: fire-and-forget, no loading state needed at this size
    fetchCompletePlayerData(targetUsername, platform).then(d => { if (d?.avatar) setSrc(d.avatar); });
  }, [player?.username]);

  return src ? (
    <img src={src} alt={player.name} onError={() => setSrc(null)}
      className="w-7 h-7 rounded-full object-cover shrink-0 shadow-2xs border border-gray-200" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs select-none">
      {getMonogram(player?.name)}
    </div>
  );
}

export function GroupStageTable({ tournament, currentUser, onPlayerSelect, onSwitchTab }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'fixtures'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLegend, setActiveLegend] = useState(null);

  const legendDetails = {
    MP: "Matches Played — Total matches completed in the group stage",
    W: "Wins — Total matches won (1 point per win)",
    D: "Draws — Total matches drawn (0.5 points per draw)",
    L: "Losses — Total matches lost (0 points)",
    PTS: "Points — Total accumulated points (Wins × 1 + Draws × 0.5)"
  };

  const handleHeaderClick = (key) => {
    setActiveLegend(prev => prev === key ? null : key);
  };

  // Extract or compute group structures and statistics
  const { groupsData, userGroupLabel } = useMemo(() => {
    if (!tournament) return { groupsData: [], userGroupLabel: null };

    // 1. Get raw players list
    const rawPlayers = tournament.players || [];

    // 2. Identify groups definition
    let groupsMeta = tournament.groups || [];

    // If groups metadata isn't explicitly defined, try constructing from game groupLabels
    if (!groupsMeta.length && tournament.rounds?.length) {
      const discoveredLabels = new Set();
      tournament.rounds.forEach(r => {
        (r.games || []).forEach(g => {
          if (g.groupLabel) discoveredLabels.add(g.groupLabel);
        });
      });

      if (discoveredLabels.size > 0) {
        const sortedLabels = Array.from(discoveredLabels).sort();
        groupsMeta = sortedLabels.map(label => {
          const playersInGroup = new Map();
          tournament.rounds.forEach(r => {
            (r.games || []).forEach(g => {
              if (g.groupLabel === label) {
                if (g.p1 && g.p1.username !== 'bye') playersInGroup.set(g.p1.username, g.p1);
                if (g.p2 && g.p2.username !== 'bye') playersInGroup.set(g.p2.username, g.p2);
              }
            });
          });
          return {
            label,
            players: Array.from(playersInGroup.values())
          };
        });
      }
    }

    // Fallback: If still no groups (e.g. pre-seeded or standard list), divide players into 4-player groups
    if (!groupsMeta.length && rawPlayers.length >= 4) {
      const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const G = Math.floor(rawPlayers.length / 4);
      groupsMeta = Array.from({ length: G }, (_, i) => ({
        label: labels[i % labels.length],
        players: rawPlayers.slice(i * 4, i * 4 + 4)
      }));
    }

    // Collect all games across rounds
    const allGames = [];
    (tournament.rounds || []).forEach(r => {
      (r.games || []).forEach(g => {
        allGames.push(g);
      });
    });

    let currentUserGroup = null;

    // Calculate standings per group
    const computedGroups = groupsMeta.map(grp => {
      const groupLabel = grp.label;
      const groupPlayers = grp.players || [];

      const standings = groupPlayers.map(p => {
        let P = 0; // Played
        let W = 0; // Wins
        let D = 0; // Draws
        let L = 0; // Losses
        const history = [];

        // Find relevant games for this player in this group
        allGames.forEach(g => {
          if (g.groupLabel && g.groupLabel !== groupLabel) return;
          const isP1 = g.p1 && (g.p1.username === p.username || g.p1.id === p.id);
          const isP2 = g.p2 && (g.p2.username === p.username || g.p2.id === p.id);
          
          if ((isP1 || isP2) && g.winner !== null && g.winner !== undefined) {
            P++;
            const isWinner = typeof g.winner === 'object' 
              ? (g.winner.username === p.username || g.winner.id === p.id)
              : false;
            const isDraw = typeof g.winner === 'object'
              ? (g.winner.username === 'draw' || g.winner.name === 'Draw')
              : g.winner === 'draw';

            if (isWinner) {
              W++;
              history.push('W');
            } else if (isDraw) {
              D++;
              history.push('D');
            } else {
              L++;
              history.push('L');
            }
          }
        });

        // Points Calculation Logic: Win = 1 point, Draw = 0.5 points (or precomputed pts if present)
        const computedPts = (W * 1) + (D * 0.5);
        const Pts = typeof p.pts === 'number' ? p.pts : typeof p.Pts === 'number' ? p.Pts : computedPts;

        const isUser = currentUser && (currentUser.id === p.id || currentUser.email?.split('@')[0] === p.username);
        if (isUser) {
          currentUserGroup = groupLabel;
        }

        return {
          ...p,
          P,
          W,
          D,
          L,
          Pts,
          pts: Pts,
          history,
          isUser
        };
      });

      // Sort group standings: Points (Pts) descending, Wins (W) descending, Matches Played (P) descending, then Name
      standings.sort((a, b) => {
        if ((b.Pts || 0) !== (a.Pts || 0)) return (b.Pts || 0) - (a.Pts || 0);
        if ((b.W || 0) !== (a.W || 0)) return (b.W || 0) - (a.W || 0);
        if ((b.P || 0) !== (a.P || 0)) return (b.P || 0) - (a.P || 0);
        return (a.name || '').localeCompare(b.name || '');
      });

      return {
        label: groupLabel,
        avgRating: grp.avgRating || null,
        standings,
        containsUser: standings.some(s => s.isUser)
      };
    });

    return { groupsData: computedGroups, userGroupLabel: currentUserGroup };
  }, [tournament, currentUser]);

  // Clean search query
  const cleanSearchQuery = useMemo(() => searchQuery.trim().toLowerCase().replace(/^@/, ''), [searchQuery]);

  // Find matching player details from search
  const searchResults = useMemo(() => {
    if (!cleanSearchQuery) return [];
    const matches = [];
    groupsData.forEach(g => {
      g.standings.forEach(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(cleanSearchQuery);
        const usernameMatch = (p.username || '').toLowerCase().includes(cleanSearchQuery);
        if (nameMatch || usernameMatch) {
          matches.push({ player: p, groupLabel: g.label });
        }
      });
    });
    return matches;
  }, [groupsData, cleanSearchQuery]);

  // Sets for quick lookup of matching usernames and group labels
  const matchingUsernames = useMemo(() => new Set(searchResults.map(s => s.player.username)), [searchResults]);
  const matchingGroupLabels = useMemo(() => new Set(searchResults.map(s => s.groupLabel)), [searchResults]);

  // Filter groups if a specific group filter is active or search query active
  const filteredGroups = useMemo(() => {
    if (cleanSearchQuery) {
      return groupsData.filter(g => matchingGroupLabels.has(g.label));
    }
    if (selectedGroupFilter === 'ALL') return groupsData;
    if (selectedGroupFilter === 'MY_GROUP') {
      return groupsData.filter(g => g.containsUser);
    }
    return groupsData.filter(g => g.label === selectedGroupFilter);
  }, [groupsData, selectedGroupFilter, cleanSearchQuery, matchingGroupLabels]);

  if (!tournament || groupsData.length === 0) {
    return (
      <div className="varsity-card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto text-brand-primary mb-4">
          <svg className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8h2.8v6h-2.8v-6z"/></svg>
        </div>
        <h3 className="font-space font-black text-xl text-[#111111] mb-2">Group Stage Tables Pending</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Group stage tables will be displayed automatically once the tournament groups and fixtures are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card & View Mode Switcher */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-space font-black text-2xl text-[#111111] uppercase tracking-wide">
              Group Stage Table
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Top 2 players in each group advance to the Knockout Stage. Scoring: <strong className="text-[#111111]">Win = 1 pt</strong> &bull; <strong className="text-[#111111]">Draw = 1 pt</strong> &bull; <strong className="text-[#111111]">Loss = 0 pts</strong>.
          </p>
        </div>

        {/* Sub-tab Toggle: Table | Fixtures */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto border border-gray-200/60">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-500 hover:text-[#111111]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M9 4v16M15 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
            <span>Table</span>
          </button>
          <button
            onClick={() => {
              setViewMode('fixtures');
              if (onSwitchTab) onSwitchTab('fixtures');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'fixtures' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-500 hover:text-[#111111]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Fixtures</span>
          </button>
        </div>
      </div>

      {/* Prominent "Which group am I?" Search Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-space font-black text-lg text-[#111111] uppercase tracking-wide">
                Which group am I in?
              </h3>
              {searchResults.length > 0 && cleanSearchQuery && (
                <span className="bg-[#0B193C] border border-blue-400/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs font-space">
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Found in Group {searchResults[0].groupLabel}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Type your name or @username to quickly find your assigned group table and standings.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-brand-primary flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input
                id="group-player-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or @username..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200/80 focus:border-brand-primary focus:bg-white rounded-2xl text-xs font-bold text-[#111111] placeholder-gray-400 outline-none transition-all shadow-2xs"
              />

              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-[#111111] hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group Navigation Pills & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 border border-gray-100 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              setSelectedGroupFilter('ALL');
              setSearchQuery('');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedGroupFilter === 'ALL' && !cleanSearchQuery
                ? 'bg-brand-primary text-white shadow-xs font-black'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
            }`}
          >
            All Groups ({groupsData.length})
          </button>

          {userGroupLabel && (
            <button
              onClick={() => {
                setSelectedGroupFilter('MY_GROUP');
                setSearchQuery('');
              }}
              className={`text-xs font-black px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedGroupFilter === 'MY_GROUP' && !cleanSearchQuery
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-blue-50 text-brand-primary border border-blue-200/60 hover:bg-blue-100'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
              </svg>
              <span>My Group ({userGroupLabel})</span>
            </button>
          )}

          {groupsData.map(g => (
            <button
              key={g.label}
              onClick={() => {
                setSelectedGroupFilter(g.label);
                setSearchQuery('');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedGroupFilter === g.label && !cleanSearchQuery
                  ? 'bg-brand-primary text-white shadow-xs font-black'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
              }`}
            >
              Group {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search State */}
      {filteredGroups.length === 0 && cleanSearchQuery && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-brand-primary mb-3 text-2xl">
            🔍
          </div>
          <h3 className="font-space font-black text-lg text-[#111111] mb-1">
            No Player Found
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            No player matching "<strong className="text-[#111111]">{searchQuery}</strong>" was found in any group.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="varsity-btn-primary px-4 py-2 text-xs"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Group Tables Grid */}
      {filteredGroups.length > 0 && (
        <div className={`grid grid-cols-1 ${selectedGroupFilter === 'ALL' && !cleanSearchQuery ? 'lg:grid-cols-2 xl:grid-cols-3' : 'max-w-2xl mx-auto'} gap-6`}>
          {filteredGroups.map(grp => {
            const hasSearchMatch = matchingGroupLabels.has(grp.label);

            return (
              <div 
                key={grp.label} 
                id={`group-card-${grp.label}`}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  hasSearchMatch
                    ? 'border-brand-primary ring-2 ring-brand-primary/40 shadow-blue-50'
                    : grp.containsUser 
                    ? 'border-brand-primary/60 ring-2 ring-blue-300/40 shadow-blue-50' 
                    : 'border-gray-100'
                }`}
              >
                {/* Group Header Bar */}
                <div className="bg-brand-bg-cream/50 border-b border-gray-100 px-5 py-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#0B193C] text-blue-300 border border-blue-400/40 font-space font-black text-base flex items-center justify-center shadow-xs shrink-0 select-none">
                      {grp.label}
                    </div>
                    <div>
                      <h3 className="font-space font-black text-base text-[#111111]">
                        Group {grp.label}
                      </h3>
                      {grp.avgRating && (
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Avg Elo: {grp.avgRating}
                        </p>
                      )}
                    </div>
                  </div>

                  {hasSearchMatch && (
                    <span className="bg-[#0B193C] border border-blue-400/40 text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs font-space">
                      <span>🔍</span>
                      <span>MATCH FOUND</span>
                    </span>
                  )}

                  {grp.containsUser && !hasSearchMatch && (
                    <span className="bg-blue-50 border border-blue-200 text-brand-primary text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <svg className="w-3 h-3 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                      </svg>
                      <span>YOUR GROUP</span>
                    </span>
                  )}
                </div>

                {/* Mobile Touch Tooltip Hint Animation (Mobile only) */}
                <div className="sm:hidden px-4 pt-2 pb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-brand-primary bg-blue-50/50 border-y border-blue-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-block animate-bounce shrink-0">👆</span>
                    <span className="truncate">Tap any header (MP, W, D, L, PTS) to find out what it means</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-blue-400 shrink-0">Mobile Tip</span>
                </div>

                {/* Mobile Tap Legend Explanation Popover Banner */}
                {activeLegend && (
                  <div className="mx-4 my-2 p-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-150">
                    <span>💡 <strong>{activeLegend}</strong>: {legendDetails[activeLegend]}</span>
                    <button onClick={() => setActiveLegend(null)} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
                  </div>
                )}

                {/* Group Standings Table List (No horizontal scroll needed on mobile) */}
                <div className="w-full overflow-hidden flex-1">
                  <table className="w-full text-left border-collapse text-xs table-fixed">
                    <thead>
                      <tr className="bg-gray-50/60 border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="py-2.5 px-1 sm:px-2 w-[28px] sm:w-[36px] text-center" title="Group Position / Rank">#</th>
                        <th className="py-2.5 px-1 sm:px-2" title="Player Name & Username">Player</th>
                        <th onClick={() => handleHeaderClick('MP')} className="py-2.5 px-0.5 sm:px-1 text-center w-[22px] sm:w-[30px]" title={legendDetails.MP}>MP</th>
                        <th onClick={() => handleHeaderClick('W')} className="py-2.5 px-0.5 sm:px-1 text-center w-[22px] sm:w-[30px]" title={legendDetails.W}>W</th>
                        <th onClick={() => handleHeaderClick('D')} className="py-2.5 px-0.5 sm:px-1 text-center w-[22px] sm:w-[30px]" title={legendDetails.D}>D</th>
                        <th onClick={() => handleHeaderClick('L')} className="py-2.5 px-0.5 sm:px-1 text-center w-[22px] sm:w-[30px]" title={legendDetails.L}>L</th>
                        <th onClick={() => handleHeaderClick('PTS')} className="py-2.5 px-1 sm:px-2 text-center w-[28px] sm:w-[36px] text-brand-primary font-black" title={legendDetails.PTS}>PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {grp.standings.map((p, idx) => {
                        const rank = idx + 1;
                        const isQualifying = rank <= 2; // Top 2 advance to knockout
                        const isSearchMatch = matchingUsernames.has(p.username);

                        return (
                          <tr 
                            key={p.username || idx}
                            className={`transition-all duration-300 group ${
                              isSearchMatch
                                ? 'bg-blue-50/90 border-l-4 border-[#1A56C4] ring-1 ring-blue-300/60 shadow-xs font-semibold'
                                : p.isUser
                                ? 'bg-blue-500/10 font-medium'
                                : 'hover:bg-brand-bg-cream/30'
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-2.5 px-0.5 sm:px-1 text-center">
                              <span 
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border text-[9px] sm:text-[10px] font-black inline-flex items-center justify-center ${
                                  isQualifying 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs' 
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                                title={isQualifying ? 'Qualifies for Knockout Stage' : 'Group Position'}
                              >
                                {rank}
                              </span>
                            </td>

                            {/* Player / Institution Column */}
                            <td className="py-2.5 px-1 sm:px-2 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <PlayerAvatar player={p} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 min-w-0 flex-wrap">
                                    <button
                                      onClick={() => onPlayerSelect && onPlayerSelect(p)}
                                      className="font-bold text-[#111111] group-hover:text-brand-primary transition-colors cursor-pointer text-xs truncate text-left hover:underline max-w-[85px] xs:max-w-[120px] sm:max-w-none"
                                      title={p.name}
                                    >
                                      {p.name}
                                    </button>
                                    {isSearchMatch && (
                                      <span className="text-[8px] font-black uppercase text-blue-300 bg-[#0B193C] border border-blue-400/40 px-1 py-0.5 rounded-full shrink-0 flex items-center shadow-2xs font-space" title="Match Found">
                                        🔍
                                      </span>
                                    )}
                                    {p.isUser && !isSearchMatch && (
                                      <span className="text-[8px] font-black uppercase text-brand-primary bg-blue-100 border border-blue-300 px-1 py-0.1 rounded shrink-0">
                                        You
                                      </span>
                                    )}
                                    {isQualifying && (
                                      <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-1 py-0.1 rounded shrink-0">
                                        Q
                                      </span>
                                    )}
                                  </div>
                                  {p.rating && (
                                    <div className="text-[10px] font-semibold text-gray-500 leading-none mt-0.5">
                                      {p.rating}
                                    </div>
                                  )}
                                  <div className="text-[10px] text-gray-400 truncate mt-0.5">
                                    <button
                                      onClick={() => onPlayerSelect && onPlayerSelect(p)}
                                      className="hover:text-brand-accent transition-colors truncate"
                                    >
                                      @{p.username}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* MP */}
                            <td className="py-2.5 px-0.5 text-center font-bold text-gray-600 text-[11px] sm:text-xs" title={`Matches Played: ${p.P}`}>
                              {p.P}
                            </td>

                            {/* W */}
                            <td className="py-2.5 px-0.5 text-center font-bold text-emerald-600 text-[11px] sm:text-xs" title={`Wins: ${p.W} (+${p.W * 1} pts)`}>
                              {p.W}
                            </td>

                            {/* D */}
                            <td className="py-2.5 px-0.5 text-center font-bold text-blue-600 text-[11px] sm:text-xs" title={`Draws: ${p.D} (+${p.D * 0.5} pts)`}>
                              {p.D}
                            </td>

                            {/* L */}
                            <td className="py-2.5 px-0.5 text-center font-bold text-gray-400 text-[11px] sm:text-xs" title={`Losses: ${p.L} (0 pts)`}>
                              {p.L}
                            </td>

                            {/* PTS */}
                            <td className="py-2.5 px-0.5 sm:px-1 text-center font-black text-brand-primary text-[11px] sm:text-xs" title={`Total Points: ${p.Pts}`}>
                              {p.Pts}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

