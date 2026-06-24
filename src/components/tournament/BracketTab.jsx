import { useState } from 'react';
import { toast } from 'react-toastify';

function MatchCard({ game, idx, isAdmin, onClick, onPlayerClick }) {
  const isBye = (p) => p?.username === 'bye';
  const playerRow = (p) => {
    const won = game.winner && game.winner.username === p?.username;
    const lost = game.winner && !won;
    const clickable = p && !isBye(p);
    return (
      <div 
        onClick={(e) => {
          if (clickable && onPlayerClick) {
            e.stopPropagation();
            onPlayerClick(p);
          }
        }}
        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
          clickable ? 'cursor-pointer hover:bg-brand-primary/5 group/row' : ''
        } ${won ? 'bg-brand-primary/5 text-brand-primary' : lost ? 'opacity-40' : 'text-[#111111]'}`}
      >
        <div className="min-w-0">
          <p className={`text-xs font-bold truncate ${clickable ? 'group-hover/row:underline' : ''}`}>{p ? p.name : 'TBD'}</p>
          {p && !isBye(p) && <p className="text-[9px] text-gray-400 truncate">{p.school}</p>}
        </div>
        {p && !isBye(p) && <span className="text-[9px] font-bold text-brand-primary ml-2 shrink-0">@{p.username}</span>}
        {isBye(p) && <span className="text-[9px] font-bold text-gray-300 ml-2">BYE</span>}
      </div>
    );
  };

  return (
    <div
      onClick={() => isAdmin && game.p1 && game.p2 && onClick(game)}
      className={`bg-white border rounded-xl p-2 shadow-sm transition-all ${game.winner ? 'border-gray-100' : 'border-brand-primary/20'} ${isAdmin ? 'cursor-pointer hover:shadow-md hover:border-brand-primary/40' : ''}`}
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Match {idx + 1}</p>
        {game.gameLink && (
          <a href={game.gameLink} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[8px] font-bold text-brand-primary flex items-center gap-1 hover:underline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Game
          </a>
        )}
      </div>
      {playerRow(game.p1)}
      <div className="h-px bg-gray-50 my-0.5" />
      {playerRow(game.p2)}
    </div>
  );
}

export function BracketTab({ tournament, isAdmin, onLogResult, onSaveGameLink, onAdvanceRound, onInitialize, onPlayerClick }) {
  const [activeRound, setActiveRound] = useState(1);
  const [loggingGame, setLoggingGame] = useState(null);
  const [gameLinkInput, setGameLinkInput] = useState('');

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
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeRound === r.roundNum ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {r.name}
            </button>
          ))}
        </div>
        {/* Advance round — only when last round is fully complete */}
        {isAdmin && allLastRoundDone && lastRound.games.length > 1 && (
          <button onClick={onAdvanceRound}
            className="text-xs font-bold bg-brand-accent text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-brand-accent/90 transition-colors shrink-0">
            Generate {lastRound.roundNum === 5 ? 'Final' : 'Next Round'} →
          </button>
        )}
      </div>

      {/* Round grid */}
      {round && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-brand-accent uppercase mb-3">{round.name} · {round.date}</p>
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
            <p className="font-space font-black text-base text-[#111111] mb-1">Log Match — {loggingGame.id}</p>
            <p className="text-xs text-gray-400 mb-5">Paste the Chess.com game link and select the winner.</p>

            {/* Game link */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Chess.com Game Link</label>
              <input
                type="url"
                placeholder="https://www.chess.com/game/live/..."
                value={gameLinkInput}
                onChange={e => setGameLinkInput(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-[#111111] placeholder-gray-300"
              />
              {gameLinkInput && (
                <button
                  onClick={() => { onSaveGameLink(loggingGame.id, gameLinkInput); toast.success('Link saved'); }}
                  className="mt-1.5 text-[10px] font-bold text-brand-primary hover:underline cursor-pointer">
                  Save link only (no winner yet)
                </button>
              )}
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select Winner</p>
            <div className="space-y-2">
              {[loggingGame.p1, loggingGame.p2].filter(p => p && p.username !== 'bye').map(p => (
                <button key={p.username}
                  onClick={() => { onLogResult(loggingGame.id, p, gameLinkInput); closeModal(); }}
                  className="w-full text-left p-4 border border-gray-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 rounded-xl transition-all cursor-pointer">
                  <p className="text-sm font-black text-[#111111]">{p.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.school} · @{p.username}</p>
                </button>
              ))}
            </div>
            <button onClick={closeModal} className="mt-4 w-full text-xs font-bold text-gray-400 py-2 hover:text-gray-600 cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
