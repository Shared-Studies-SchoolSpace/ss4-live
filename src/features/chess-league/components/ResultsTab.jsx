import React from 'react';
import { getPlayerDisplay, gameKey } from '../utils/chessUtils';
import { MatchResult } from './MatchResult';

export const ResultsTab = ({
  isAdmin,
  currentDivision,
  currentRound,
  setCurrentRound,
  gameResults,
  handleSetResult,
  onPlayerSelect
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
            <span className="material-symbols-outlined text-[14px] leading-none align-middle mr-1 select-none">
              {isAdmin ? 'lock_open' : 'lock'}
            </span>
            <span>{isAdmin ? 'Admin Edit Mode' : 'View Only'}</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-m3-outline-variant flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold text-brand-text-dark font-space tracking-tight">Round {currentRound} Results</h2>
          {activeRoundData && (
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-m3-outline-variant px-3.5 py-1.5 rounded-full">{activeRoundData.date}</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {activeRoundData?.games.map(([w, b]) => {
            const key = gameKey(currentDivision.id, currentRound, w, b);
            const res = gameResults[key];
            return (
              <MatchResult
                key={key}
                w={w}
                b={b}
                res={res}
                date={activeRoundData.date}
                round={currentRound}
                division={currentDivision}
                onPlayerSelect={onPlayerSelect}
                isAdmin={isAdmin}
                handleSetResult={handleSetResult}
                gameKeyStr={key}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
