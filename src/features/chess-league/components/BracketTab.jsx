import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SplitBracketVisualizer } from './SplitBracketVisualizer';

function MatchCard({ game, idx, isAdmin, onClick, onPlayerClick }) {
  const isBye = (p) => p?.username === 'bye';
  const won = (p) => game.winner && game.winner.username === p?.username;
  const lost = (p) => game.winner && !won(p);
  const isMatchDone = !!game.winner;
  const isByeMatch = isBye(game.p1) || isBye(game.p2);

  const playerRow = (p, side) => {
    const isWon = won(p);
    const isLost = lost(p);
    const clickable = p && !isBye(p);
    const bye = isBye(p);

    const handleRowAction = (e) => {
      if (clickable && onPlayerClick) {
        e.stopPropagation();
        onPlayerClick(p);
      }
    };

    return (
      <button
        type="button"
        onClick={handleRowAction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowAction(e);
          }
        }}
        disabled={!clickable}
        role="button"
        tabIndex={clickable ? 0 : -1}
        className={`w-full text-left relative flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 outline-none border-none ${
          clickable ? 'cursor-pointer group/row' : 'cursor-default'
        } ${
          isWon
            ? 'bg-emerald-50 text-emerald-800'
            : isLost
            ? 'opacity-40 bg-white'
            : 'hover:bg-gray-50 bg-white'
        }`}
      >
        {/* Winner checkmark */}
        {isWon && (
          <span className="shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-600">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        
        <div className="min-w-0 flex-1">
          <p 
            title={p ? (bye ? 'BYE' : p.name) : 'TBD'} 
            className={`text-sm leading-tight truncate font-bold ${
              isWon ? 'font-black text-emerald-800' : bye ? 'text-gray-400 italic' : 'text-[#111111]'
            } ${clickable ? 'group-hover/row:underline' : ''}`}
          >
            {p ? (bye ? 'BYE' : p.name) : 'TBD'}
          </p>
          {p && !bye && (
            <p 
              title={p.school} 
              className={`text-xs truncate mt-0.5 ${isWon ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              {p.school}{p.rating ? ` · ${p.rating}` : ''}
            </p>
          )}
        </div>

        {p && !bye && (
          <span className={`text-xs font-bold shrink-0 ${isWon ? 'text-emerald-700' : 'text-brand-primary/50'}`}>
            @{p.username}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${
        isByeMatch
          ? 'opacity-65 border-dashed border-gray-300'
          : isMatchDone
          ? 'border-transparent shadow-md'
          : 'border-brand-primary/15'
      }`}
    >
      {/* Card header bar */}
      <div className={`flex items-center justify-between px-3 py-2 ${
        isMatchDone ? 'bg-brand-primary/5' : 'bg-gray-50/80'
      }`}>
        <div className="flex items-center gap-1.5">
          <svg className={`w-3.5 h-3.5 ${isMatchDone ? 'text-brand-primary' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M19 22H5v-2h14v2zm-2-3H7v-2h10v1.5zm-5-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm2.8 7.3A4.5 4.5 0 0 0 12 8a4.5 4.5 0 0 0-2.8 1.3C8.1 10.6 7.5 12.7 7.5 15h9c0-2.3-.6-4.4-1.7-5.7z"/></svg>
          <span className={`text-xs font-black uppercase tracking-widest ${isMatchDone ? 'text-brand-primary' : 'text-gray-300'}`}>
            Match {idx + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !isByeMatch && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick(game);
              }}
              className="text-[10px] font-black px-2 py-1 rounded bg-brand-primary text-white hover:bg-brand-primary/95 transition-all focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:ring-offset-1 outline-none cursor-pointer border-none"
            >
              {isMatchDone ? 'EDIT RESULT' : 'LOG RESULT'}
            </button>
          )}
          {isMatchDone && !isByeMatch && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              game.winner?.username === 'forfeit' ? 'text-red-600 bg-red-100' : 'text-emerald-600 bg-emerald-100'
            }`}>
              {game.winner?.username === 'forfeit' ? 'DOUBLE FORFEIT' : 'DONE'}
            </span>
          )}
          {isByeMatch && (
            <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded-full">
              AUTO-ADVANCE
            </span>
          )}
          {game.gameLink && (
            <a
              href={game.gameLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-0.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Game
            </a>
          )}
        </div>
      </div>

      {/* Players */}
      {playerRow(game.p1, 'top')}
      
      {/* VS divider */}
      <div className="relative flex items-center">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] font-black text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-widest select-none">VS</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {playerRow(game.p2, 'bottom')}
    </div>
  );
}

export function BracketTab({ tournament, isAdmin, onLogResult, onSaveGameLink, onAdvanceRound, onInitialize, onPlayerClick }) {
  const [activeRound, setActiveRound] = useState(1);
  const [loggingGame, setLoggingGame] = useState(null);
  const [gameLinkInput, setGameLinkInput] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'tree';
    }
    return 'list';
  });

  useEffect(() => {
    if (tournament?.rounds?.length) {
      setActiveRound(tournament.rounds.length);
    }
  }, [tournament?.rounds?.length]);

  const openModal = (game) => { setLoggingGame(game); setGameLinkInput(game.gameLink || ''); };
  const closeModal = () => { setLoggingGame(null); setGameLinkInput(''); };

  if (!tournament || !tournament.rounds?.length) return (
    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto text-brand-primary">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 22H5v-2h14v2zm-1.5-4H6.5l.8-2h9.4l.8 2zm-1.1-4H7.6l.8-2h7.2l.8 2zM12 2a3.5 3.5 0 00-3.5 3.5c0 1.25.66 2.35 1.65 2.96L9.5 10h5l-.65-1.54A3.49 3.49 0 0015.5 5.5 3.5 3.5 0 0012 2z"/>
        </svg>
      </div>
      <div>
        <p className="font-space font-black text-xl text-[#111111] mb-1">Bracket Pairings Pending</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Round 1 pairings will be officially seeded and published once registration closes.
        </p>
      </div>

      {/* Teaser Bracket Skeleton (L2: Peak-End Empty State Teaser) */}
      <div className="max-w-lg mx-auto p-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl space-y-3 opacity-60">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b pb-2">
          <span>SAMPLE ROUND 1 PAIRING</span>
          <span>10+0 RAPID</span>
        </div>
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <span className="text-[10px] font-black text-gray-300">VS</span>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
      </div>

      {isAdmin && (
        <button onClick={onInitialize} className="bg-brand-primary text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:bg-brand-primary/95 transition-all cursor-pointer">
          Generate Round 1 Fixtures
        </button>
      )}
    </div>
  );

  const knockoutRounds = (tournament.rounds || []).filter(
    r => r.isKnockout || (r.name && !r.name.toLowerCase().includes('group'))
  );
  const displayRounds = knockoutRounds.length > 0 ? knockoutRounds : [];
  const lastRound = displayRounds.length > 0 ? displayRounds[displayRounds.length - 1] : tournament.rounds[tournament.rounds.length - 1];
  const allLastRoundDone = lastRound?.games ? lastRound.games.every(g => g.winner) : false;
  const round = displayRounds.find(r => r.roundNum === activeRound) ?? lastRound;

  return (
    <div className="space-y-4">
      {/* BYE Explanation Note */}
      <div className="bg-[#FAF9F5] border border-brand-primary/10 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-brand-primary/5 rounded-xl text-brand-primary shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.04m-2.137.082a.75.75 0 111.085-1.085l.04.04m-4.5 1.25V18.75A2.25 2.25 0 008.25 21h7.5A2.25 2.25 0 0018 18.75V11.25m-12 0A2.25 2.25 0 018.25 9h7.5A2.25 2.25 0 0118 11.25M3 9h18" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-brand-primary uppercase tracking-wider">Tournament Note: What is a "BYE"?</p>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            A <strong className="text-brand-primary">BYE</strong> is awarded to a competitor when there is an uneven bracket pairing (e.g., 30 qualifiers in a Round of 32 bracket). BYEs allow players to automatically advance to <strong className="text-[#111111]">Round of 16</strong> without playing a match.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-50 border border-gray-200/50 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                viewMode === 'tree' ? 'bg-white text-brand-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Interactive Tree
            </button>
          </div>

          {viewMode === 'list' && displayRounds.length > 0 && (
            <>
              <div className="h-4 w-px bg-gray-200 hidden sm:block" />
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {displayRounds.map(r => (
                  <button key={r.roundNum} onClick={() => { setActiveRound(r.roundNum); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeRound === r.roundNum ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Advance round  only when last round is fully complete */}
        {isAdmin && allLastRoundDone && lastRound.games.length > 1 && (
          <button onClick={onAdvanceRound}
            className="text-sm font-bold bg-brand-accent text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-brand-accent/90 transition-colors shrink-0 w-full sm:w-auto text-center">
            Generate {lastRound.roundNum === 5 ? 'Final' : 'Next Round'} →
          </button>
        )}
      </div>

      {/* Round layout */}
      {viewMode === 'tree' ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-2 sm:p-6 shadow-sm">
          <SplitBracketVisualizer tournament={tournament} onPlayerClick={onPlayerClick} />
        </div>
      ) : (
        round && (
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-3">{round.name}</p>

            {/* Group stage: cluster matches by group with styled headers */}
            {round.isGroupStage && round.games.some(g => g.groupLabel) ? (
              <div className="space-y-6">
                {(() => {
                  // Collect unique group labels in order of first appearance
                  const seen = new Set();
                  const groupOrder = [];
                  round.games.forEach(g => {
                    if (g.groupLabel && !seen.has(g.groupLabel)) {
                      seen.add(g.groupLabel);
                      groupOrder.push(g.groupLabel);
                    }
                  });

                  return groupOrder.map(label => {
                    const groupGames = round.games.filter(g => g.groupLabel === label);
                    const completedCount = groupGames.filter(g => g.winner).length;
                    const allDone = completedCount === groupGames.length;

                    return (
                      <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Group header */}
                        <div className="bg-brand-primary px-4 sm:px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-xs font-black text-white">
                              {label}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                              Group {label}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              allDone
                                ? 'bg-emerald-400/20 text-emerald-200'
                                : 'bg-white/10 text-white/60'
                            }`}>
                              {completedCount}/{groupGames.length} played
                            </span>
                          </div>
                        </div>

                        {/* Group matches */}
                        <div className="p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupGames.map((g, i) => (
                              <MatchCard key={g.id} game={g} idx={i} isAdmin={isAdmin} onClick={openModal} onPlayerClick={onPlayerClick} />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* Non-group-stage: flat grid (knockout rounds) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {round.games.map((g, i) => (
                  <MatchCard key={g.id} game={g} idx={i} isAdmin={isAdmin} onClick={openModal} onPlayerClick={onPlayerClick} />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Log result modal */}
      {loggingGame && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="font-space font-black text-lg text-[#111111] mb-1">Log Match - {loggingGame.id}</p>
            <p className="text-sm text-gray-400 mb-5">Paste the Chess.com game link and select the winner.</p>

            {/* Game link */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Chess.com Game Link</label>
              <input
                type="url"
                placeholder="https://www.chess.com/game/live/..."
                value={gameLinkInput}
                onChange={e => setGameLinkInput(e.target.value)}
                className="w-full text-sm font-bold px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-[#111111] placeholder-gray-300"
              />
              {gameLinkInput && (
                <button
                  onClick={() => { onSaveGameLink(loggingGame.id, gameLinkInput); toast.success('Link saved'); }}
                  className="mt-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer">
                  Save link only (no winner yet)
                </button>
              )}
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Winner</p>
            <div className="space-y-2">
              {[loggingGame.p1, loggingGame.p2].filter(p => p && p.username !== 'bye').map(p => (
                <button key={p.username}
                  onClick={() => { onLogResult(loggingGame.id, p, gameLinkInput); closeModal(); }}
                  className="w-full text-left p-4 border border-gray-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 rounded-xl transition-all cursor-pointer">
                  <p className="text-base font-black text-[#111111]">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.school} · @{p.username}</p>
                </button>
              ))}
              <button
                onClick={() => { 
                  onLogResult(loggingGame.id, { username: 'forfeit', name: 'Double Forfeit', rating: 0, school: '' }, gameLinkInput); 
                  closeModal(); 
                }}
                className="w-full text-left p-4 border border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                <p className="text-base font-black text-red-600">Double Forfeit</p>
                <p className="text-xs text-red-400 mt-0.5">Eliminates both players from tournament</p>
              </button>
            </div>
            <button onClick={closeModal} className="mt-4 w-full text-sm font-bold text-gray-400 py-2 hover:text-gray-600 cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
