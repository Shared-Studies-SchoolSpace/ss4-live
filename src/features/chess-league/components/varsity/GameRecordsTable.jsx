import React, { useState, useMemo } from 'react';
import { GAME_RECORDS, VARSITY_TEAMS } from '../../data/varsityData';

export const GameRecordsTable = () => {
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return GAME_RECORDS.filter(rec => {
      const matchRound = selectedRound === 'all' || rec.round.toString() === selectedRound;
      const matchResult = selectedResult === 'all' || rec.result === selectedResult;
      const matchTeam = selectedTeam === 'all' || rec.fixture.toLowerCase().includes(selectedTeam.toLowerCase());
      
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        rec.whitePlayer.toLowerCase().includes(q) ||
        rec.blackPlayer.toLowerCase().includes(q) ||
        rec.fixture.toLowerCase().includes(q);

      return matchRound && matchResult && matchTeam && matchSearch;
    });
  }, [selectedRound, selectedResult, selectedTeam, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search player or fixture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Round Filter */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
            <option value="4">Round 4</option>
          </select>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Varsity Teams</option>
            {VARSITY_TEAMS.map(t => (
              <option key={t.id} value={t.shortName}>{t.name}</option>
            ))}
          </select>

          {/* Result Filter */}
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Results</option>
            <option value="1-0">1-0 (White Win)</option>
            <option value="0-1">0-1 (Black Win)</option>
            <option value="1/2-1/2">1/2-1/2 (Draw)</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 w-full md:w-auto text-right">
          Showing {filteredRecords.length} match records
        </div>
      </div>

      {/* Game Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Season & Round</th>
                <th className="py-3.5 px-4">Fixture</th>
                <th className="py-3.5 px-4 text-center">Board</th>
                <th className="py-3.5 px-4">White Player</th>
                <th className="py-3.5 px-4">Black Player</th>
                <th className="py-3.5 px-4 text-center">Result</th>
                <th className="py-3.5 px-4 text-center">External Board</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rec.seasonMonth}</div>
                    <div className="text-[11px] text-slate-500">Round {rec.round}</div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">{rec.fixture}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-slate-100 text-slate-700 font-extrabold text-xs px-2 py-0.5 rounded-md">
                      B{rec.boardNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{rec.whitePlayer}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{rec.blackPlayer}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-md ${
                      rec.result === '1-0'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rec.result === '0-1'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {rec.result}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <a
                      href={rec.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                    >
                      <span>Open</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
