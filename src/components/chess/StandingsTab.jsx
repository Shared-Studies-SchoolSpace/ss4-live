import React from 'react';

export const StandingsTab = ({ standings, onPlayerSelect }) => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-brand-bg-cream/40 border-b border-gray-100">
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[60px]">Rank</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[240px]">Player</th>
                <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px]">P</th>
                <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px]">W</th>
                <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px]">D</th>
                <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[50px]">L</th>
                <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[60px]" title="Buchholz score">BH</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center w-[80px]">Pts</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider w-[160px]">Recent Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {standings.map((p, i) => {
                const pos = i + 1;
                let badgeClass = "bg-gray-50 text-gray-500 border-gray-100";
                if (pos === 1) badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
                else if (pos === 2) badgeClass = "bg-slate-100 text-slate-700 border-slate-200 font-bold";
                else if (pos === 3) badgeClass = "bg-amber-600/10 text-amber-800 border-amber-600/20 font-bold";

                const last5 = p.history.slice(-5);
                while (last5.length < 5) last5.unshift(null);

                return (
                  <tr 
                    key={p.label} 
                    className={`hover:bg-brand-bg-cream/20 transition-colors group ${
                      pos === 1 && p.P > 0 ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className={`w-7 h-7 rounded-full border text-xs flex items-center justify-center select-none ${badgeClass}`}>
                        {pos}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span 
                          onClick={() => onPlayerSelect(p)} 
                          className="font-bold text-[#111111] group-hover:text-brand-primary transition-colors cursor-pointer text-sm"
                        >
                          {p.name}
                        </span>
                        <a 
                          href={`https://www.chess.com/member/${p.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-gray-400 hover:text-brand-accent transition-colors self-start mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{p.username}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-600 text-sm">{p.P}</td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-600 text-sm">{p.W}</td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-600 text-sm">{p.D}</td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-600 text-sm">{p.L}</td>
                    <td className="py-4 px-4 text-center font-bold text-gray-400 text-xs">{p.buchholz}</td>
                    <td className="py-4 px-6 text-center font-black text-brand-accent text-base">{p.Pts}</td>
                    <td className="py-4 px-6">
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
