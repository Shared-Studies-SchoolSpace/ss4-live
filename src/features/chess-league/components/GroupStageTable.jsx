import React, { useState, useMemo, useEffect } from 'react';
import { fetchCompletePlayerData } from '../utils/chessService';
import { getSurvivingPlayers } from '../utils/tournament';

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
    MP: "Matches Played   Total matches completed in the group stage",
    W: "Wins   Total matches won (1 point per win)",
    D: "Draws   Total matches drawn (0.5 points per draw)",
    L: "Losses   Total matches lost (0 points)",
    PTS: "Points   Total accumulated points (Wins × 1 + Draws × 0.5)"
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

        // Collect any tournament players not assigned to any game-based group yet into their own dedicated group
        const assignedUsernames = new Set();
        groupsMeta.forEach(g => {
          (g.players || []).forEach(p => {
            if (p.username) assignedUsernames.add(p.username.toLowerCase());
          });
        });

        const unassignedPlayers = rawPlayers.filter(p => p.username && !assignedUsernames.has(p.username.toLowerCase()));
        if (unassignedPlayers.length > 0) {
          const lastLabel = sortedLabels[sortedLabels.length - 1] || 'N';
          const nextLabelChar = String.fromCharCode(lastLabel.charCodeAt(0) + 1);
          groupsMeta.push({
            label: nextLabelChar,
            players: unassignedPlayers
          });
        }
      }
    }

    // Fallback: If still no groups (e.g. pre-seeded or standard list), divide players into 4-player groups
    if (!groupsMeta.length && rawPlayers.length >= 4) {
      const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const G = Math.ceil(rawPlayers.length / 4);
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

    // Synthesize round-robin fixtures for any group (e.g. Group O) that has players but no games in allGames
    groupsMeta.forEach(grp => {
      const groupLabel = grp.label;
      const existingGames = allGames.filter(g => g.groupLabel === groupLabel);
      if (existingGames.length === 0 && grp.players && grp.players.length >= 2) {
        const pool = [...grp.players];
        if (pool.length % 2 !== 0) pool.push({ username: 'bye', name: 'BYE', school: '' });
        const n = pool.length;
        const synthesizedGames = [];
        let gameCounter = 1;

        for (let r = 0; r < Math.min(n - 1, 3); r++) {
          for (let i = 0; i < n / 2; i++) {
            const p1 = pool[i];
            const p2 = pool[n - 1 - i];
            if (!p1 || !p2 || p1.username === 'bye' || p2.username === 'bye') continue;
            const white = (r + i) % 2 === 0 ? p1 : p2;
            const black = white === p1 ? p2 : p1;
            synthesizedGames.push({
              id: `G${groupLabel}_R${r + 1}_G${gameCounter++}`,
              groupLabel,
              p1: white,
              p2: black,
              winner: null,
              gameLink: ''
            });
          }
          pool.splice(1, 0, pool.pop());
        }

        allGames.push(...synthesizedGames);

        // Also inject into tournament.rounds so that Fixtures tab and Results tab display Group O games
        if (tournament.rounds && tournament.rounds.length > 0) {
          synthesizedGames.forEach(g => {
            const rNum = parseInt(g.id.split('_R')[1]?.split('_G')[0] || '1', 10);
            const targetRound = tournament.rounds.find(r => r.roundNum === rNum) || tournament.rounds[0];
            if (targetRound && targetRound.games) {
              if (!targetRound.games.some(existing => existing.id === g.id)) {
                targetRound.games.push(g);
              }
            }
          });
        }
      }
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

      // Sort group standings: Points (Pts) descending, Wins (W) descending, Matches Played (P) descending, ELO rating descending, then Name
      standings.sort((a, b) => {
        if ((b.Pts || 0) !== (a.Pts || 0)) return (b.Pts || 0) - (a.Pts || 0);
        if ((b.W || 0) !== (a.W || 0)) return (b.W || 0) - (a.W || 0);
        if ((b.P || 0) !== (a.P || 0)) return (b.P || 0) - (a.P || 0);
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
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

  const isKnockoutActive = useMemo(() => {
    if (!tournament?.rounds?.length) return false;
    return tournament.rounds.some(r => r.isKnockout || (r.name && !r.name.toLowerCase().includes('group')));
  }, [tournament]);

  const survivingUsernames = useMemo(() => {
    if (!tournament) return new Set();
    const survivors = getSurvivingPlayers(tournament);
    return new Set(survivors.map(p => p.username?.toLowerCase()).filter(Boolean));
  }, [tournament]);

  const knockoutMatrixData = useMemo(() => {
    if (!tournament || !tournament.rounds) return { survivors: [], eliminated: [], currentKnockoutRoundName: 'Round of 32' };

    const knockoutRounds = tournament.rounds.filter(r => r.isKnockout || (r.name && !r.name.toLowerCase().includes('group')));
    const currentKnockoutRound = knockoutRounds[knockoutRounds.length - 1];
    const currentKnockoutRoundName = currentKnockoutRound?.name || 'Round of 32';

    const allPlayersMap = new Map();
    groupsData.forEach(g => {
      g.standings.forEach(p => {
        if (p.username) allPlayersMap.set(p.username.toLowerCase(), p);
      });
    });

    const statusMap = new Map();

    knockoutRounds.forEach(r => {
      const roundName = r.name || `Round ${r.roundNum}`;
      (r.games || []).forEach(g => {
        if (g.p1 && g.p1.username !== 'bye') {
          const u1 = g.p1.username.toLowerCase();
          if (!statusMap.has(u1)) statusMap.set(u1, { player: g.p1, highestRound: roundName, isAlive: true, roundNum: r.roundNum });
        }
        if (g.p2 && g.p2.username !== 'bye') {
          const u2 = g.p2.username.toLowerCase();
          if (!statusMap.has(u2)) statusMap.set(u2, { player: g.p2, highestRound: roundName, isAlive: true, roundNum: r.roundNum });
        }

        if (g.winner && typeof g.winner === 'object') {
          const wUser = g.winner.username?.toLowerCase();
          const lUser = g.p1?.username?.toLowerCase() === wUser ? g.p2?.username?.toLowerCase() : g.p1?.username?.toLowerCase();
          
          if (lUser && statusMap.has(lUser)) {
            statusMap.get(lUser).isAlive = false;
            statusMap.get(lUser).eliminatedIn = roundName;
          }
        }
      });
    });

    const survivors = [];
    const eliminated = [];

    allPlayersMap.forEach((player, uname) => {
      const isQualified = survivingUsernames.has(uname);
      const koInfo = statusMap.get(uname);

      if (isQualified || koInfo) {
        survivors.push({
          ...player,
          isAlive: koInfo ? koInfo.isAlive : true,
          highestRound: koInfo ? koInfo.highestRound : currentKnockoutRoundName,
          eliminatedIn: koInfo?.eliminatedIn || null
        });
      } else {
        eliminated.push(player);
      }
    });

    return { survivors, eliminated, currentKnockoutRoundName };
  }, [tournament, groupsData, survivingUsernames]);

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
          <p className="text-xs text-gray-600 mt-1 font-medium">
            Top 2 players in each group advance to the Knockout Stage. Scoring: <strong className="text-[#111111]">Win = 1 pt</strong> &bull; <strong className="text-[#111111]">Draw = 0.5 pts</strong> &bull; <strong className="text-[#111111]">Loss = 0 pts</strong>.
          </p>
        </div>

        {/* Sub-tab Toggle: Tables | Knockout Matrix | Fixtures */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto border border-gray-200/60 flex-wrap gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-600 hover:text-[#111111]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M9 4v16M15 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
            <span>Tables</span>
          </button>
          
          {isKnockoutActive && (
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'matrix' 
                  ? 'bg-white text-brand-primary shadow-sm' 
                  : 'text-gray-600 hover:text-[#111111]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Knockout Matrix</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onSwitchTab) onSwitchTab('fixtures');
            }}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'fixtures' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-600 hover:text-[#111111]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Fixtures</span>
          </button>
        </div>
      </div>

      {/* Knockout Stage Active Banner */}
      {isKnockoutActive && (
        <div className="bg-[#0B193C] text-white p-5 rounded-3xl shadow-sm border border-[#1E295B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-space font-black text-sm uppercase tracking-wider text-white">
                Knockout Stage Active ({knockoutMatrixData.currentKnockoutRoundName})
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed font-medium">
                The Group Stage has concluded. Group tables below are preserved as historical standings. Switch to the <strong>Knockout Matrix</strong> or open the <strong>Bracket View</strong> to follow qualified contenders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'matrix' 
                  ? 'bg-white text-[#0B193C] shadow-sm' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              Knockout Matrix
            </button>
            <button
              onClick={() => onSwitchTab && onSwitchTab('bracket')}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>View Bracket</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Prominent "Which group am I?" Search Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-space font-black text-lg text-[#111111] uppercase tracking-wide">
                Which group am I in?
              </h3>
              {searchResults.length > 0 && cleanSearchQuery && (
                <span className="bg-[#0B193C] border border-brand-primary/40 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs font-space">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Knockout Survival Matrix View */}
      {viewMode === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-space font-black text-xl text-[#111111] uppercase tracking-wide">
                    Knockout Matrix
                  </h3>
                  <span className="text-xs font-bold text-[#0B193C] bg-[#0B193C]/5 border border-[#0B193C]/10 px-3.5 py-1 rounded-xl font-space">
                    {knockoutMatrixData.survivors.length} Contenders
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Chunked view of all {knockoutMatrixData.survivors.length} qualifiers advancing from Group Stage through Knockout rounds.
                </p>
              </div>

              <button
                onClick={() => onSwitchTab && onSwitchTab('bracket')}
                className="px-4 py-2 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <span>Interactive Bracket Tree</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200/70">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Contender</th>
                    <th className="py-3 px-2 text-right">Rating</th>
                    <th className="py-3 px-3 text-center">Group Stage Pts</th>
                    <th className="py-3 px-3">Highest Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {knockoutMatrixData.survivors.map((p, idx) => {
                    return (
                      <tr 
                        key={p.username || idx}
                        className={`transition-colors hover:bg-gray-50/80 ${
                          p.isAlive ? 'bg-emerald-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-black text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PlayerAvatar player={p} />
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => onPlayerSelect && onPlayerSelect(p)}
                                className="font-bold text-[#111111] hover:text-brand-primary transition-colors text-xs text-left truncate block cursor-pointer"
                              >
                                {p.name}
                              </button>
                              <p className="text-[10px] text-gray-400 truncate">
                                {p.school || p.department || 'Player'} &bull; @{p.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-black text-brand-primary text-xs">
                          {p.rating || 1200}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gray-700">
                          {p.Pts !== undefined ? p.Pts : (p.pts !== undefined ? p.pts : 0)} PTS
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/70 inline-block">
                            {p.highestRound}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Group Navigation Pills & Filter (Only rendered when viewMode === 'table') */}
      {viewMode === 'table' && (
        <>
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
                  : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/20'
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
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto text-brand-primary mb-3 text-2xl">
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
                    ? 'border-brand-primary ring-2 ring-brand-primary/40 shadow-xs'
                    : grp.containsUser 
                    ? 'border-brand-primary/60 ring-2 ring-brand-primary/30 shadow-xs' 
                    : 'border-gray-100'
                }`}
              >
                {/* Group Header Bar */}
                <div className="bg-brand-bg-cream/50 border-b border-gray-100 px-5 py-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#0B193C] text-white border border-brand-primary/40 font-space font-black text-base flex items-center justify-center shadow-xs shrink-0 select-none">
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
                    <span className="bg-[#0B193C] border border-brand-primary/40 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs font-space">
                      <span>🔍</span>
                      <span>MATCH FOUND</span>
                    </span>
                  )}

                  {grp.containsUser && !hasSearchMatch && (
                    <span className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <svg className="w-3 h-3 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                      </svg>
                      <span>YOUR GROUP</span>
                    </span>
                  )}
                </div>

                {/* Mobile Touch Tooltip Hint Animation (Mobile only) */}
                <div className="sm:hidden px-4 pt-2 pb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-brand-primary bg-brand-primary/5 border-y border-brand-primary/15">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-block animate-bounce shrink-0">👆</span>
                    <span className="truncate">Tap any header (MP, W, D, L, PTS) to find out what it means</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-brand-primary shrink-0">Mobile Tip</span>
                </div>

                {/* Mobile Tap Legend Explanation Popover Banner */}
                {activeLegend && (
                  <div className="mx-4 my-2 p-2.5 bg-brand-primary text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-150">
                    <span>💡 <strong>{activeLegend}</strong>: {legendDetails[activeLegend]}</span>
                    <button onClick={() => setActiveLegend(null)} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
                  </div>
                )}

                {/* Group Standings Table List (No horizontal scroll needed on mobile) */}
                <div className="w-full overflow-hidden flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/60 border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="py-2.5 px-1 text-center w-7" title="Group Position / Rank">#</th>
                        <th className="py-2.5 px-1 sm:px-2" title="Player Name & Username">Player</th>
                        <th onClick={() => handleHeaderClick('MP')} className="py-2.5 px-1 text-center w-7" title={legendDetails.MP}>MP</th>
                        <th onClick={() => handleHeaderClick('W')} className="py-2.5 px-1 text-center w-7" title={legendDetails.W}>W</th>
                        <th onClick={() => handleHeaderClick('D')} className="py-2.5 px-1 text-center w-7" title={legendDetails.D}>D</th>
                        <th onClick={() => handleHeaderClick('L')} className="py-2.5 px-1 text-center w-7" title={legendDetails.L}>L</th>
                        <th onClick={() => handleHeaderClick('PTS')} className="py-2.5 px-1 text-center w-9 text-brand-primary font-black" title={legendDetails.PTS}>PTS</th>
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
                                ? 'bg-brand-primary/10 border-l-4 border-brand-primary ring-1 ring-brand-primary/30 shadow-xs font-semibold'
                                : p.isUser
                                ? 'bg-brand-primary/10 font-medium'
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
                                      <span className="text-[8px] font-black uppercase text-white bg-[#0B193C] border border-brand-primary/40 px-1 py-0.5 rounded-full shrink-0 flex items-center shadow-2xs font-space" title="Match Found">
                                        🔍
                                      </span>
                                    )}
                                    {p.isUser && !isSearchMatch && (
                                      <span className="text-[8px] font-black uppercase text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1 py-0.1 rounded shrink-0">
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
                            <td className="py-2.5 px-0.5 text-center font-bold text-brand-primary text-[11px] sm:text-xs" title={`Draws: ${p.D} (+${p.D * 0.5} pts)`}>
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
        </>
      )}
    </div>
  );
}

