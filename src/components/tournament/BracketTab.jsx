import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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

    return (
      <div
        onClick={(e) => {
          if (clickable && onPlayerClick) {
            e.stopPropagation();
            onPlayerClick(p);
          }
        }}
        className={`relative flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 ${
          clickable ? 'cursor-pointer group/row' : ''
        } ${
          isWon
            ? 'bg-brand-primary text-white'
            : isLost
            ? 'opacity-40'
            : 'hover:bg-gray-50'
        }`}
      >
        {/* Winner checkmark */}
        {isWon && (
          <span className="shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white/80">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-tight truncate font-bold ${
            isWon ? 'font-black text-white' : bye ? 'text-gray-400 italic' : 'text-[#111111]'
          } ${clickable ? 'group-hover/row:underline' : ''}`}>
            {p ? (bye ? 'BYE' : p.name) : 'TBD'}
          </p>
          {p && !bye && (
            <p className={`text-xs truncate mt-0.5 ${isWon ? 'text-white/70' : 'text-gray-400'}`}>
              {p.school}{p.rating ? ` · ${p.rating}` : ''}
            </p>
          )}
        </div>

        {p && !bye && (
          <span className={`text-xs font-bold shrink-0 ${isWon ? 'text-white/80' : 'text-brand-primary/50'}`}>
            @{p.username}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={() => isAdmin && game.p1 && game.p2 && !isByeMatch && onClick(game)}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${
        isMatchDone
          ? 'border-transparent shadow-md'
          : 'border-brand-primary/15'
      } ${isAdmin && !isByeMatch ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
    >
      {/* Card header bar */}
      <div className={`flex items-center justify-between px-3 py-2 ${
        isMatchDone ? 'bg-brand-primary/5' : 'bg-gray-50/80'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${isMatchDone ? 'text-brand-primary' : 'text-gray-300'}`}>♟</span>
          <span className={`text-xs font-black uppercase tracking-widest ${isMatchDone ? 'text-brand-primary' : 'text-gray-300'}`}>
            Match {idx + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMatchDone && !isByeMatch && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              game.winner?.username === 'forfeit' ? 'text-red-600 bg-red-100' : 'text-emerald-600 bg-emerald-100'
            }`}>
              {game.winner?.username === 'forfeit' ? 'DOUBLE FORFEIT' : 'DONE'}
            </span>
          )}
          {isByeMatch && (
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
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
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs font-black text-gray-300 px-2 shrink-0">VS</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {playerRow(game.p2, 'bottom')}
    </div>
  );
}

export function BracketTab({ tournament, isAdmin, onLogResult, onSaveGameLink, onAdvanceRound, onInitialize, onPlayerClick }) {
  const [activeRound, setActiveRound] = useState(1);
  const [loggingGame, setLoggingGame] = useState(null);
  const [gameLinkInput, setGameLinkInput] = useState('');

  useEffect(() => {
    if (tournament?.rounds?.length) {
      setActiveRound(tournament.rounds.length);
    }
  }, [tournament?.rounds?.length]);

  const openModal = (game) => { setLoggingGame(game); setGameLinkInput(game.gameLink || ''); };
  const closeModal = () => { setLoggingGame(null); setGameLinkInput(''); };

  if (!tournament || !tournament.rounds?.length) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-gray-300 mx-auto mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-space font-black text-lg text-[#111111] mb-2">Round 1 Not Yet Generated</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
        The admin generates Round 1 pairings once. They are permanent and cannot be re-shuffled.
      </p>
      {isAdmin && (
        <button onClick={onInitialize} className="bg-brand-primary text-white font-bold text-xs px-6 py-3 rounded-full shadow-md hover:bg-brand-primary/90 transition-colors cursor-pointer">
          Generate Round 1 Fixtures
        </button>
      )}
    </div>
  );

  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  const allLastRoundDone = lastRound.games.every(g => g.winner);
  const round = tournament.rounds.find(r => r.roundNum === activeRound) ?? lastRound;

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
            A <strong className="text-brand-primary">BYE</strong> is awarded to a competitor when there is an uneven bracket pairing (e.g., 51 players in a 64-player template). In SCL, BYEs are seeded to the top 13 highest-rated non-provisional players, allowing them to automatically advance to <strong className="text-[#111111]">Round 2</strong> without playing a match.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {tournament.rounds.map(r => (
            <button key={r.roundNum} onClick={() => { setActiveRound(r.roundNum); }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeRound === r.roundNum ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {r.name}
            </button>
          ))}
        </div>
        {/* Advance round — only when last round is fully complete */}
        {isAdmin && allLastRoundDone && lastRound.games.length > 1 && (
          <button onClick={onAdvanceRound}
            className="text-sm font-bold bg-brand-accent text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-brand-accent/90 transition-colors shrink-0">
            Generate {lastRound.roundNum === 5 ? 'Final' : 'Next Round'} →
          </button>
        )}
      </div>

      {/* Round grid */}
      {round && (
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-3">{round.name} · {round.date} @ 6:00 PM</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {round.games.map((g, i) => (
              <MatchCard key={g.id} game={g} idx={i} isAdmin={isAdmin} onClick={openModal} onPlayerClick={onPlayerClick} />
            ))}
          </div>
        </div>
      )}

      {/* Log result modal */}
      {loggingGame && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="font-space font-black text-lg text-[#111111] mb-1">Log Match — {loggingGame.id}</p>
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
