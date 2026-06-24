import React from 'react';

// Helper to format player names for compact bracket cards
function formatName(name) {
  if (!name) return 'TBD';
  if (name === 'BYE') return 'BYE';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  // E.g. Kingsley Ekpo -> K. Ekpo
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function getSchoolInitials(school) {
  if (!school) return '';
  const s = school.toLowerCase();
  if (s.includes('uyo') || s.includes('uniuyo')) return 'UYO';
  if (s.includes('bells')) return 'BEL';
  if (s.includes('aksu')) return 'AKS';
  if (s.includes('unical')) return 'CAL';
  if (s.includes('unizik')) return 'ZIK';
  if (s.includes('mohawk')) return 'MOH';
  if (s.includes('futia')) return 'FUT';
  return school.substring(0, 3).toUpperCase();
}

function CompactMatchCard({ game, onPlayerClick, activeChampUsername }) {
  const isBye = (p) => p?.username === 'bye';
  
  const renderRow = (p) => {
    if (!p) {
      return (
        <div className="h-7 flex items-center px-2 text-[10px] text-gray-300 font-bold italic">
          TBD
        </div>
      );
    }
    
    const bye = isBye(p);
    const won = game.winner && game.winner.username === p.username;
    const lost = game.winner && !won;
    const isChamp = activeChampUsername && p.username === activeChampUsername;
    
    return (
      <div 
        onClick={(e) => {
          if (!bye) {
            e.stopPropagation();
            onPlayerClick(p);
          }
        }}
        className={`h-7 flex items-center justify-between px-2 text-[10px] transition-all select-none ${
          bye ? 'text-gray-300 bg-gray-50/20' : 'cursor-pointer hover:bg-brand-primary/5 group/row'
        } ${won ? 'bg-emerald-50/30 text-emerald-700 font-black' : lost ? 'opacity-40 text-gray-500' : 'text-[#111111] font-bold'}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {!bye && (
            <span className="text-[7px] font-black bg-gray-100 text-gray-400 px-1 py-0.5 rounded shrink-0">
              {getSchoolInitials(p.school)}
            </span>
          )}
          <span className={`truncate ${!bye ? 'group-hover/row:underline' : ''}`}>
            {formatName(p.name)}
          </span>
          {isChamp && (
            <span title="Champion" className="text-amber-500 text-xs shrink-0 select-none">👑</span>
          )}
        </div>
        {!bye && p.rating && (
          <span className="text-[8px] font-bold text-brand-primary/60 shrink-0 ml-1">
            {p.rating}
          </span>
        )}
        {bye && <span className="text-[8px] font-black text-gray-300">BYE</span>}
      </div>
    );
  };

  const isGameOnChampPath = activeChampUsername && 
    ((game.p1 && game.p1.username === activeChampUsername) || 
     (game.p2 && game.p2.username === activeChampUsername));

  return (
    <div className={`w-[170px] bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
      isGameOnChampPath 
        ? 'border-amber-400 ring-1 ring-amber-300 shadow-md' 
        : game.winner 
          ? 'border-gray-100' 
          : 'border-brand-primary/20 hover:border-brand-primary/40'
    }`}>
      {renderRow(game.p1)}
      <div className="h-px bg-gray-100" />
      {renderRow(game.p2)}
    </div>
  );
}

export function SplitBracketVisualizer({ tournament, onPlayerClick }) {
  if (!tournament || !tournament.rounds || !tournament.rounds.length) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="font-space font-black text-lg text-[#111111] mb-1">No Bracket Active</p>
        <p className="text-xs text-gray-400">Initialize the tournament first to view the visualizer.</p>
      </div>
    );
  }

  // Get full 6 rounds of tournament with winners propagated forward
  const ROUND_NAMES = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  const gameCounts = [32, 16, 8, 4, 2, 1];
  
  const rounds = JSON.parse(JSON.stringify(tournament.rounds));
  
  while (rounds.length < 6) {
    const nextRoundNum = rounds.length + 1;
    const prevRound = rounds[rounds.length - 1];
    const nextGamesCount = gameCounts[nextRoundNum - 1];
    
    const games = Array.from({ length: nextGamesCount }, (_, i) => {
      const g1 = prevRound.games[i * 2];
      const g2 = prevRound.games[i * 2 + 1];
      const p1 = g1?.winner ?? null;
      const p2 = g2?.winner ?? null;
      
      let winner = null;
      if (p1 && p1.username === 'bye') winner = p2;
      else if (p2 && p2.username === 'bye') winner = p1;
      
      return {
        id: `R${nextRoundNum}_G${i + 1}`,
        p1, p2, winner, gameLink: ''
      };
    });
    
    rounds.push({
      roundNum: nextRoundNum,
      name: ROUND_NAMES[nextRoundNum - 1],
      date: `Day ${nextRoundNum}`,
      games
    });
  }
  
  // Propagate all winners forward across all 6 rounds
  for (let i = 0; i < rounds.length - 1; i++) {
    const curr = rounds[i];
    const next = rounds[i + 1];
    next.games.forEach((g, gi) => {
      const g1 = curr.games[gi * 2];
      const g2 = curr.games[gi * 2 + 1];
      g.p1 = g1?.winner ?? null;
      g.p2 = g2?.winner ?? null;
      
      if (g.p1 && g.p1.username === 'bye') g.winner = g.p2;
      else if (g.p2 && g.p2.username === 'bye') g.winner = g.p1;
      else if (!g.p1 || !g.p2) g.winner = null;
    });
  }

  const finalGame = rounds[5].games[0];
  const champion = finalGame?.winner;
  const activeChampUsername = champion?.username;

  // Split rounds into left-side, right-side, and center final
  const leftRounds = [];
  const rightRounds = [];

  for (let rIdx = 0; rIdx < 5; rIdx++) {
    const r = rounds[rIdx];
    const totalG = r.games.length;
    
    // Left side games (first half)
    leftRounds.push({
      roundNum: r.roundNum,
      name: r.name,
      games: r.games.slice(0, totalG / 2)
    });
    
    // Right side games (second half, reversed round-ordering so they flow right-to-left)
    rightRounds.push({
      roundNum: r.roundNum,
      name: r.name,
      games: r.games.slice(totalG / 2)
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm overflow-x-auto no-scrollbar">
      <div className="flex items-stretch justify-between gap-4" style={{ minWidth: '1900px', height: '1050px' }}>
        
        {/* LEFT SIDE BRACKET (Flows Left-To-Right) */}
        <div className="flex justify-between flex-1 gap-2">
          {leftRounds.map((r, rIdx) => (
            <div key={r.roundNum} className="flex flex-col justify-around h-full w-[175px]">
              <div className="text-center py-1.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <span className="text-[9px] font-black uppercase text-brand-primary tracking-wider">{r.name}</span>
              </div>
              <div className="flex flex-col justify-around flex-grow py-4">
                {r.games.map((g) => (
                  <CompactMatchCard 
                    key={g.id} 
                    game={g} 
                    onPlayerClick={onPlayerClick} 
                    activeChampUsername={activeChampUsername}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER COLUMN (Final Match, Trophy & Champion display) */}
        <div className="w-[320px] flex flex-col justify-between items-center py-6 px-4 bg-brand-bg-cream/40 rounded-3xl border border-gray-50 text-center shrink-0 mx-2 shadow-inner">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-widest">SCL Cup Final</h4>
            <p className="text-[8px] text-gray-400 font-bold">June 30th · 8:30 PM</p>
          </div>

          {/* Trophy Illustration */}
          <div className="relative group my-4">
            <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-500" />
            <svg 
              viewBox="0 0 24 24" 
              className={`w-36 h-36 relative transition-transform duration-500 group-hover:scale-105 ${champion ? 'text-amber-500 drop-shadow-[0_8px_16px_rgba(245,158,11,0.4)]' : 'text-gray-200'}`}
              fill="currentColor"
            >
              {/* Cup shape */}
              <path d="M19 5H17V3C17 2.45 16.55 2 16 2H8C7.45 2 7 2.45 7 3V5H5C3.9 5 3 5.9 3 7V9C3 10.87 4.31 12.43 6.07 12.87C6.77 14.73 8.39 16.14 10.4 16.44C10.74 17.3 11.33 18.03 12.09 18.52V20H9C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21C16 20.45 15.55 20 15 20H12.09V18.52C12.85 18.03 13.43 17.3 13.78 16.44C15.78 16.14 17.41 14.73 18.11 12.87C19.87 12.43 21 10.87 21 9V7C21 5.9 20.1 5 19 5ZM5 9V7H7V10.24C5.81 9.87 5 9.02 5 9ZM19 9C19 9.02 18.19 9.87 17 10.24V7H19V9Z"/>
              {/* Star details inside the trophy if champion is present */}
              {champion && (
                <circle cx="12" cy="8.5" r="2" fill="#FFF" className="animate-pulse" />
              )}
            </svg>
          </div>

          {/* Champion Display banner */}
          <div className="w-full space-y-4">
            {champion ? (
              <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-2xl p-4 shadow-md border border-amber-300">
                <span className="text-[8px] font-black uppercase tracking-[0.25em] block text-amber-100">Champion</span>
                <p 
                  onClick={() => onPlayerClick(champion)}
                  className="text-base font-black font-space mt-1 hover:underline cursor-pointer truncate"
                >
                  {champion.name}
                </p>
                <p className="text-[10px] font-bold text-amber-50 truncate mt-0.5">{champion.school}</p>
                <span className="inline-block mt-2 bg-white/20 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Rating: {champion.rating}
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl py-4 px-3 text-xs font-semibold">
                Winner receives the SCL Champion Cup & 👑 status
              </div>
            )}

            {/* Final Matchup Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm text-left">
              <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block mb-2 text-center">Grand Final Matchup</span>
              
              {finalGame ? (
                <div className="space-y-1.5">
                  <div 
                    onClick={() => finalGame.p1 && onPlayerClick(finalGame.p1)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer hover:bg-brand-primary/5 ${
                      finalGame.winner?.username === finalGame.p1?.username ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-[#111111]'
                    }`}
                  >
                    <span className="truncate">{finalGame.p1 ? finalGame.p1.name : 'TBD'}</span>
                    {finalGame.p1 && <span className="text-[9px] text-gray-400">@{finalGame.p1.username}</span>}
                  </div>
                  
                  <div className="text-center text-[9px] font-black text-brand-accent">VS</div>
                  
                  <div 
                    onClick={() => finalGame.p2 && onPlayerClick(finalGame.p2)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer hover:bg-brand-primary/5 ${
                      finalGame.winner?.username === finalGame.p2?.username ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-[#111111]'
                    }`}
                  >
                    <span className="truncate">{finalGame.p2 ? finalGame.p2.name : 'TBD'}</span>
                    {finalGame.p2 && <span className="text-[9px] text-gray-400">@{finalGame.p2.username}</span>}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 text-center italic font-semibold">Matches in progress...</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE BRACKET (Flows Right-To-Left) */}
        <div className="flex flex-row-reverse justify-between flex-1 gap-2">
          {rightRounds.map((r, rIdx) => (
            <div key={r.roundNum} className="flex flex-col justify-around h-full w-[175px]">
              <div className="text-center py-1.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <span className="text-[9px] font-black uppercase text-brand-primary tracking-wider">{r.name}</span>
              </div>
              <div className="flex flex-col justify-around flex-grow py-4">
                {r.games.map((g) => (
                  <CompactMatchCard 
                    key={g.id} 
                    game={g} 
                    onPlayerClick={onPlayerClick} 
                    activeChampUsername={activeChampUsername}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
