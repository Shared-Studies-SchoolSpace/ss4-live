import React from 'react';
import { STANDINGS_TABLE } from '../../data/varsityData';

export const LeagueStandingsTable = () => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900">Varsity Tournament League Standings</h2>
          <p className="text-xs text-slate-500 font-medium">Official Round-by-Round Standings & Board Points breakdown.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <span>Win: 3 pts</span>
          <span>•</span>
          <span>Draw: 1 pt</span>
          <span>•</span>
          <span>Loss: 0 pts</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">University Team</th>
                <th className="py-3.5 px-4 text-center">MP</th>
                <th className="py-3.5 px-4 text-center">W</th>
                <th className="py-3.5 px-4 text-center">D</th>
                <th className="py-3.5 px-4 text-center">L</th>
                <th className="py-3.5 px-4 text-center">Board Pts</th>
                <th className="py-3.5 px-4 text-center">Total Pts</th>
                <th className="py-3.5 px-4 text-center">Form Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {STANDINGS_TABLE.map(entry => (
                <tr key={entry.teamId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex w-7 h-7 rounded-xl items-center justify-center font-black text-xs ${
                      entry.rank === 1
                        ? 'bg-brand-accent text-white shadow-2xs'
                        : entry.rank === 2 || entry.rank === 3
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <span>{entry.teamName}</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {entry.shortName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700 font-bold">{entry.mp}</td>
                  <td className="py-4 px-4 text-center text-emerald-600 font-bold">{entry.w}</td>
                  <td className="py-4 px-4 text-center text-amber-600 font-bold">{entry.d}</td>
                  <td className="py-4 px-4 text-center text-rose-600 font-bold">{entry.l}</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">{entry.boardPoints}</td>
                  <td className="py-4 px-4 text-center font-black text-brand-primary text-base">{entry.totalPoints}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {entry.form.map((res, idx) => (
                        <span
                          key={idx}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white ${
                            res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-amber-500' : 'bg-rose-500'
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
