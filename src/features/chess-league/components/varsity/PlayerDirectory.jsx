import React, { useState, useMemo } from 'react';
import { VARSITY_TEAMS } from '../../data/varsityData';

export const PlayerDirectory = () => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState({});

  const allPlayers = useMemo(() => {
    const list = [];
    VARSITY_TEAMS.forEach(team => {
      team.players.forEach(p => {
        list.push({
          ...p,
          universityName: team.name,
          universityShort: team.shortName,
          universityId: team.id
        });
      });
    });
    return list;
  }, []);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(p => {
      const matchUni = selectedUniversity === 'all' || p.universityId === selectedUniversity;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.universityName.toLowerCase().includes(q);
      return matchUni && matchSearch;
    });
  }, [allPlayers, selectedUniversity, searchQuery]);

  const toggleFlip = (playerId) => {
    setFlippedCards(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Board', 'Platform', 'Handle', 'University', 'Rating', 'Played', 'Wins', 'Draws', 'Losses', 'Win Rate %', 'Perf Rating'];
    const rows = filteredPlayers.map(p => [
      `"${p.name}"`,
      p.board,
      p.platform,
      `"${p.handle}"`,
      `"${p.universityName}"`,
      p.rating,
      p.stats.played,
      p.stats.wins,
      p.stats.draws,
      p.stats.losses,
      `${p.stats.winRate}%`,
      p.stats.perfRating
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SS4_Varsity_Players_${selectedUniversity}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 min-w-[220px]">
            <input
              type="text"
              placeholder="Search player name, handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F6F4F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="py-2 px-3 text-sm bg-[#F6F4F0] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Universities ({allPlayers.length})</option>
            {VARSITY_TEAMS.map(t => (
              <option key={t.id} value={t.id}>{t.shortName} ({t.players.length})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="inline-flex bg-[#F0EEEA] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-brand-primary shadow-2xs'
                  : 'text-slate-600 hover:text-brand-text-dark'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Cards View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-brand-primary shadow-2xs'
                  : 'text-slate-600 hover:text-brand-text-dark'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M9 4v16M15 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
              </svg>
              <span>Table View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlayers.map(player => {
            const isFlipped = !!flippedCards[player.id];
            return (
              <div
                key={player.id}
                onClick={() => toggleFlip(player.id)}
                className="perspective-1000 h-[310px] cursor-pointer group"
              >
                <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front Face */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(26,86,196,0.08)] transition-shadow flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-[#E8EFFF] text-brand-primary text-[10px] font-space font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          Board {player.board} &middot; {player.universityShort}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                          {player.status}
                        </span>
                      </div>

                      <h3 className="text-base font-space font-black text-brand-text-dark group-hover:text-brand-primary transition-colors leading-snug">
                        {player.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                        <span className="capitalize text-slate-400 font-semibold">{player.platform}:</span>
                        <span className="font-mono text-slate-700 font-bold">@{player.handle}</span>
                      </div>

                      <div className="mt-4 bg-[#F6F4F0] rounded-2xl p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">University</span>
                          <span className="font-bold text-brand-text-dark text-right truncate max-w-[140px]">{player.universityName}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Rating</span>
                          <span className="font-space font-black text-brand-primary text-sm tabular-nums">{player.rating} Elo</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-brand-primary">
                      <span>Tap card for statistics</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0B192C] text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2.5 mb-3">
                        <span className="text-xs font-space font-bold text-[#93C5FD] uppercase">Player Statistics</span>
                        <span className="text-[10px] text-blue-100 font-mono">@{player.handle}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center mb-3">
                        <div className="bg-white/10 p-2.5 rounded-2xl">
                          <div className="text-[10px] text-blue-100 font-bold uppercase">Games</div>
                          <div className="text-base font-space font-black text-white tabular-nums">{player.stats.played}</div>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-2xl">
                          <div className="text-[10px] text-blue-100 font-bold uppercase">Win Rate</div>
                          <div className="text-base font-space font-black text-emerald-300 tabular-nums">{player.stats.winRate}%</div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between py-0.5">
                          <span className="text-blue-100 font-medium">Record (W-D-L)</span>
                          <span className="font-bold text-white tabular-nums">{player.stats.wins}W - {player.stats.draws}D - {player.stats.losses}L</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-blue-100 font-medium">Performance Rating</span>
                          <span className="font-space font-black text-[#93C5FD] tabular-nums">{player.stats.perfRating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-blue-100">
                      <span>Tap to flip back</span>
                      <svg className="w-3.5 h-3.5 text-[#93C5FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl overflow-hidden border border-[#EAEAEA] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F4F0] border-b border-[#EAEAEA] text-slate-500 text-[11px] font-space font-extrabold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4 text-center w-20">Board</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[160px]">Player</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[180px]">University</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[180px]">Platform &amp; Handle</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Rating</th>
                  <th scope="col" className="py-3.5 px-4 text-center">W-D-L</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEEA] font-medium">
                {filteredPlayers.map(player => (
                  <tr key={player.id} className="hover:bg-[#F6F4F0]/70 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center font-space font-extrabold text-xs px-2.5 py-1 rounded-lg bg-[#E8EFFF] text-brand-primary">
                        B{player.board}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-space font-bold text-brand-text-dark text-sm">
                      {player.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">{player.universityName}</span>
                        <span className="bg-[#F0EEEA] text-slate-600 text-[10px] font-space font-bold px-1.5 py-0.5 rounded uppercase">
                          {player.universityShort}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-slate-400 capitalize font-medium">{player.platform}:</span>
                        <span className="font-bold text-slate-800 bg-[#F6F4F0] px-2 py-0.5 rounded-md">@{player.handle}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-space font-black text-brand-primary text-sm tabular-nums">{player.rating}</span>
                      <span className="text-[10px] font-mono text-slate-400 ml-1">Elo</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-space font-bold text-slate-700 tabular-nums">
                        {player.stats.wins}W - {player.stats.draws}D - {player.stats.losses}L
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-space font-black text-emerald-600 tabular-nums text-sm">
                        {player.stats.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
