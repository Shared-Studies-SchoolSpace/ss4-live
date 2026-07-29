import React, { useState } from 'react';

export const StandingsTab = ({ standings, onPlayerSelect }) => {
  const [activeLegend, setActiveLegend] = useState(null);

  const legendDetails = {
    MP: "Matches Played   Total matches completed by the player",
    W: "Wins   Total matches won (1 point per win)",
    D: "Draws   Total matches drawn (0.5 points per draw)",
    L: "Losses   Total matches lost (0 points)",
    PTS: "Points   Total accumulated score (Wins × 1 + Draws × 0.5)"
  };

  const handleHeaderClick = (key) => {
    setActiveLegend(prev => prev === key ? null : key);
  };

  return (
    <div className="w-full space-y-3">
      {/* Mobile Touch Tooltip Hint Animation (Mobile only) */}
      <div className="sm:hidden px-4 py-2 flex items-center justify-between gap-2 text-[10px] font-bold text-brand-primary bg-blue-50/70 border border-blue-150 rounded-2xl">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-block animate-bounce shrink-0">👆</span>
          <span className="truncate">Tap any header (MP, W, D, L, PTS) to find out what it means</span>
        </div>
        <span className="text-[9px] font-black uppercase text-blue-500 shrink-0">Mobile Tip</span>
      </div>

      {/* Mobile Legend Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] sm:text-xs">
        <span className="font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
          Table Legend (Tap for details):
        </span>
        <div className="flex flex-wrap items-center gap-2 font-mono font-bold">
          {Object.keys(legendDetails).map(key => (
            <button
              key={key}
              onClick={() => handleHeaderClick(key)}
              className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                activeLegend === key 
                  ? 'bg-[#0B193C] text-white border-[#0B193C]' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Tap Explanation Popover Banner */}
      {activeLegend && (
        <div className="p-3 bg-blue-600 text-white rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <span>💡 <strong>{activeLegend}</strong>: {legendDetails[activeLegend]}</span>
          <button onClick={() => setActiveLegend(null)} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 sm:min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-brand-bg-cream/40 border-b border-gray-100">
                <th className="py-5 px-4 sm:px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[50px] sm:w-[60px]" title="Tournament Rank Position">Rank</th>
                <th className="py-5 px-4 sm:px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider" title="Player Name & Username">Player</th>
                <th 
                  onClick={() => handleHeaderClick('MP')} 
                  className="py-5 px-3 sm:px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[40px] sm:w-[50px]" 
                  title={legendDetails.MP}
                >
                  MP
                </th>
                <th 
                  onClick={() => handleHeaderClick('W')} 
                  className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px] hidden sm:table-cell" 
                  title={legendDetails.W}
                >
                  W
                </th>
                <th 
                  onClick={() => handleHeaderClick('D')} 
                  className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px] hidden sm:table-cell" 
                  title={legendDetails.D}
                >
                  D
                </th>
                <th 
                  onClick={() => handleHeaderClick('L')} 
                  className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px] hidden sm:table-cell" 
                  title={legendDetails.L}
                >
                  L
                </th>
                <th 
                  onClick={() => handleHeaderClick('PTS')} 
                  className="py-5 px-4 sm:px-6 text-[10px] font-black text-brand-primary uppercase tracking-wider text-center w-[60px] sm:w-[80px]" 
                  title={legendDetails.PTS}
                >
                  PTS
                </th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[160px] hidden md:table-cell" title="Recent match outcomes (W = Win, D = Draw, L = Loss)">Recent Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {standings.map((p, i) => {
                const pos = i + 1;
                let badgeClass = "bg-gray-50 text-gray-500 border-gray-100";
                if (pos === 1) badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
                else if (pos === 2) badgeClass = "bg-slate-100 text-slate-700 border-slate-200 font-bold";
                else if (pos === 3) badgeClass = "bg-amber-600/10 text-amber-800 border-amber-600/20 font-bold";

                const last5 = (p.history || []).slice(-5);
                while (last5.length < 5) last5.unshift(null);

                return (
                  <tr 
                    key={p.label || p.username || i} 
                    className={`hover:bg-brand-bg-cream/20 transition-colors group ${
                      pos === 1 && p.P > 0 ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <span className={`w-7 h-7 rounded-full border text-xs flex items-center justify-center select-none ${badgeClass}`}>
                        {pos}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex flex-col min-w-0">
                        <span 
                          onClick={() => onPlayerSelect && onPlayerSelect(p)} 
                          className="font-bold text-[#111111] group-hover:text-brand-primary transition-colors cursor-pointer text-sm truncate"
                        >
                          {p.name}
                        </span>
                        <a 
                          href={`https://www.chess.com/member/${p.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs font-semibold text-gray-400 hover:text-brand-accent transition-colors self-start mt-0.5 truncate max-w-[120px] sm:max-w-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{p.username}
                        </a>
                      </div>
                    </td>
                    <td onClick={() => handleHeaderClick('MP')} className="py-4 px-3 sm:px-4 text-center font-semibold text-gray-600 text-sm" title={`Matches Played: ${p.P}`}>{p.P}</td>
                    <td onClick={() => handleHeaderClick('W')} className="py-4 px-4 text-center font-semibold text-gray-600 text-sm hidden sm:table-cell" title={`Wins: ${p.W}`}>{p.W}</td>
                    <td onClick={() => handleHeaderClick('D')} className="py-4 px-4 text-center font-semibold text-gray-600 text-sm hidden sm:table-cell" title={`Draws: ${p.D}`}>{p.D}</td>
                    <td onClick={() => handleHeaderClick('L')} className="py-4 px-4 text-center font-semibold text-gray-600 text-sm hidden sm:table-cell" title={`Losses: ${p.L}`}>{p.L}</td>
                    <td onClick={() => handleHeaderClick('PTS')} className="py-4 px-4 sm:px-6 text-center font-black text-brand-primary text-base" title={`Total Points: ${p.Pts}`}>{p.Pts}</td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex gap-1.5">
                        {last5.map((res, idx) => (
                          res ? (
                            <span 
                              key={idx} 
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] select-none shadow-sm border ${
                                res === 'W' 
                                  ? 'bg-green-500 border-green-600 text-white' 
                                  : res === 'D' 
                                    ? 'bg-gray-400 border-gray-500 text-white' 
                                    : 'bg-red-500 border-red-600 text-white'
                              }`}
                              title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                            >
                              {res === 'W' ? '✓' : res === 'D' ? '−' : '✕'}
                            </span>
                          ) : (
                            <span key={idx} className="w-6 h-6 rounded-md border border-dashed border-gray-100 bg-gray-50/20"></span>
                          )
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
