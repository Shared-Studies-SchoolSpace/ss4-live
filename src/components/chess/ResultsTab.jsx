import React from 'react';
import { getPlayerDisplay, gameKey } from '../../utils/chessUtils';

export const ResultsTab = ({
  isAdmin,
  currentDivision,
  currentRound,
  setCurrentRound,
  gameResults,
  handleSetResult
}) => {
  if (!currentDivision || !currentDivision.rounds || currentDivision.rounds.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">No rounds generated yet. Go to Manage to add a round.</p>
      </div>
    );
  }

  const activeRoundData = currentDivision.rounds.find(r => r.round === currentRound);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Selected Round</span>
          <div className="flex flex-wrap gap-2">
            {currentDivision.rounds.map(r => {
              const allDone = r.games.every(([w, b]) => gameResults[gameKey(currentDivision.id, r.round, w, b)]);
              const isActive = currentRound === r.round;
              return (
                <button
                  key={r.round}
                  onClick={() => setCurrentRound(r.round)}
                  className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                      : allDone 
                        ? 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-50' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  R{r.round}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isAdmin 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <span>{isAdmin ? '🔓' : '🔒'}</span>
            <span>{isAdmin ? 'Admin Edit Mode' : 'View Only'}</span>
          </span>
        </div>
      </div>

      {activeRoundData && (
        <div className="text-center py-2 bg-brand-bg-cream/40 rounded-2xl border border-dashed border-gray-200/50">
          <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{activeRoundData.date}</span>
        </div>
      )}

      <div className="grid gap-6">
        {activeRoundData?.games.map(([w, b]) => {
          const key = gameKey(currentDivision.id, currentRound, w, b);
          const res = gameResults[key];
          const wP = getPlayerDisplay(w);
          const bP = getPlayerDisplay(b);
          const isBye = w === 'BYE' || b === 'BYE';

          return (
            <div key={key} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Matchup Details */}
                <div className="flex items-center justify-between w-full md:flex-grow max-w-xl gap-4">
                  <div className="flex-1 truncate">
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
                  
                  <span className="text-xs font-black text-gray-300 uppercase select-none flex-shrink-0">vs</span>
                  
                  <div className="flex-1 text-right truncate">
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
                </div>

                {/* Score Controls */}
                <div className="w-full md:w-auto flex justify-center flex-shrink-0">
                  {isBye ? (
                    <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100/50 px-4 py-2 rounded-xl uppercase tracking-wider select-none">
                      ⚡ Automatic BYE Win
                    </span>
                  ) : (
                    <div className="flex bg-gray-50 border border-gray-200/60 rounded-2xl p-1 w-full sm:w-auto">
                      <button
                        disabled={!isAdmin}
                        onClick={() => handleSetResult(key, 'white')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition-all ${
                          !isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          res === 'white'
                            ? 'bg-brand-primary text-white shadow-sm font-bold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {wP.name.split(' ')[0]} Win
                      </button>
                      <button
                        disabled={!isAdmin}
                        onClick={() => handleSetResult(key, 'draw')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition-all ${
                          !isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          res === 'draw'
                            ? 'bg-brand-accent text-white shadow-sm font-bold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        Draw
                      </button>
                      <button
                        disabled={!isAdmin}
                        onClick={() => handleSetResult(key, 'black')}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition-all ${
                          !isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          res === 'black'
                            ? 'bg-[#111111] text-white shadow-sm font-bold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {bP.name.split(' ')[0]} Win
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
