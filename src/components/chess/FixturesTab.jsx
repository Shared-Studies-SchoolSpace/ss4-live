import React from 'react';
import { getPlayerDisplay, gameKey } from '../../utils/chessUtils';

export const FixturesTab = ({ currentDivision, gameResults }) => {
  if (!currentDivision || !currentDivision.rounds || currentDivision.rounds.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">No rounds or fixtures generated yet for this division.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {currentDivision.rounds.map((r) => (
        <div key={r.round} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4">
            <span className="text-lg font-black font-space text-[#111111]">Round {r.round}</span>
            <span className="text-xs font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1.5 rounded-full">{r.date}</span>
          </div>
          
          <div className="divide-y divide-gray-50">
            {r.games.map(([w, b]) => {
              const isBye = w === 'BYE' || b === 'BYE';
              const res = gameResults[gameKey(currentDivision.id, r.round, w, b)];
              const wP = getPlayerDisplay(w);
              const bP = getPlayerDisplay(b);
              
              return (
                <div 
                  key={`${r.round}_${w}_${b}`} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${
                    res || isBye ? 'opacity-85' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-gray-100 text-[#111111] border border-gray-200 text-[10px] font-black flex items-center justify-center flex-shrink-0 select-none" title="Plays White">W</span>
                    <div className="truncate">
                      <span className="text-sm font-bold text-[#111111] block truncate">{wP.name}</span>
                      {wP.username && (
                        <a 
                          href={`https://www.chess.com/member/${wP.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-gray-400 hover:text-brand-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{wP.username}
                        </a>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:px-2 select-none self-center">vs</span>

                  <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
                    <div className="truncate">
                      <span className="text-sm font-bold text-[#111111] block truncate">{bP.name}</span>
                      {bP.username && (
                        <a 
                          href={`https://www.chess.com/member/${bP.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-gray-400 hover:text-brand-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{bP.username}
                        </a>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-md bg-[#111111] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 select-none" title="Plays Black">B</span>
                  </div>

                  {/* Results Badge */}
                  <div className="flex items-center justify-start sm:justify-end min-w-[120px]">
                    {isBye ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                        BYE Win
                      </span>
                    ) : res ? (
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none border ${
                        res === 'white' 
                          ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/10' 
                          : res === 'black' 
                            ? 'bg-[#111111]/5 text-[#111111] border-[#111111]/10' 
                            : 'bg-brand-accent/5 text-brand-accent border-brand-accent/10'
                      }`}>
                        {res === 'white' && `Winner: ${wP.name.split(' ')[0]}`}
                        {res === 'black' && `Winner: ${bP.name.split(' ')[0]}`}
                        {res === 'draw' && "Match Draw"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
