import React from 'react';
import { STANDINGS_TABLE } from '../../data/varsityData';

export const LeagueStandingsTable = () => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-3xl shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-lg font-black font-space text-brand-text-dark">Season 1 League Standings</h2>
          <p className="text-xs text-slate-500 font-medium">Official Round-by-Round Standings &amp; Board Points breakdown (September 2026).</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-[#F6F4F0] px-3.5 py-2 rounded-xl">
          <span>Win: 3 pts</span>
          <span aria-hidden="true">&bull;</span>
          <span>Draw: 1 pt</span>
          <span aria-hidden="true">&bull;</span>
          <span>Loss: 0 pts</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#EAEAEA] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F4F0] border-b border-[#EAEAEA] text-slate-500 text-[11px] font-space font-extrabold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-center">Rank</th>
                <th scope="col" className="py-3.5 px-4">University Team</th>
                <th scope="col" className="py-3.5 px-4 text-center">MP</th>
                <th scope="col" className="py-3.5 px-4 text-center">W</th>
                <th scope="col" className="py-3.5 px-4 text-center">D</th>
                <th scope="col" className="py-3.5 px-4 text-center">L</th>
                <th scope="col" className="py-3.5 px-4 text-center">Board Pts</th>
                <th scope="col" className="py-3.5 px-4 text-center">Total Pts</th>
                <th scope="col" className="py-3.5 px-4 text-center">Form Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEEA] font-medium">
              {STANDINGS_TABLE.map(entry => (
                <tr key={entry.teamId} className="hover:bg-[#F6F4F0]/70 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex w-7 h-7 rounded-xl items-center justify-center font-space font-black text-xs ${
                      entry.rank === 1
                        ? 'bg-brand-primary text-white shadow-2xs'
                        : entry.rank === 2 || entry.rank === 3
                        ? 'bg-[#E8EFFF] text-brand-primary'
                        : 'bg-[#F0EEEA] text-slate-600'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-brand-text-dark">
                    <div className="flex items-center gap-2.5">
                      <span>{entry.teamName}</span>
                      <span className="bg-[#F0EEEA] text-slate-600 text-[10px] font-space font-bold px-2 py-0.5 rounded-md">
                        {entry.shortName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700 font-bold tabular-nums">{entry.mp}</td>
                  <td className="py-4 px-4 text-center text-emerald-600 font-bold tabular-nums">{entry.w}</td>
                  <td className="py-4 px-4 text-center text-amber-600 font-bold tabular-nums">{entry.d}</td>
                  <td className="py-4 px-4 text-center text-rose-600 font-bold tabular-nums">{entry.l}</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 tabular-nums">{entry.boardPoints}</td>
                  <td className="py-4 px-4 text-center font-space font-black text-brand-primary text-base tabular-nums">{entry.totalPoints}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {entry.form.map((res, idx) => (
                        <span
                          key={idx}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white ${
                            res === 'W' ? 'bg-emerald-600' : res === 'D' ? 'bg-amber-600' : 'bg-rose-600'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
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
