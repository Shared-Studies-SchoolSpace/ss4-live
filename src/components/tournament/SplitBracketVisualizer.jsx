import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

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
    <div 
      data-game-id={game.id}
      className={`w-[170px] bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-300 relative z-10 ${
        isGameOnChampPath 
          ? 'border-amber-400 ring-1 ring-amber-300 shadow-md' 
          : game.winner 
            ? 'border-gray-100' 
            : 'border-brand-primary/20 hover:border-brand-primary/40'
      }`}
    >
      {renderRow(game.p1)}
      <div className="h-px bg-gray-100" />
      {renderRow(game.p2)}
    </div>
  );
}

export function SplitBracketVisualizer({ tournament, onPlayerClick }) {
  const scrollRef = useRef(null);
  const parentRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [downloading, setDownloading] = useState(false);

  if (!tournament || !tournament.rounds || !tournament.rounds.length) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="font-space font-black text-lg text-[#111111] mb-1">No Bracket Active</p>
        <p className="text-xs text-gray-400">Initialize the tournament first to view the visualizer.</p>
      </div>
    );
  }

  // Get full 6 rounds of tournament with winners propagated forward
  const ROUND_NAMES = ['Round 1', 'Round 2', 'Round 3', 'Quarterfinals', 'Semifinals', 'Final'];
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
    leftRounds.push({ roundNum: r.roundNum, name: r.name, games: r.games.slice(0, totalG / 2) });
    rightRounds.push({ roundNum: r.roundNum, name: r.name, games: r.games.slice(totalG / 2) });
  }

  // Draw lines based on bounding rect coordinates
  const calculateLines = () => {
    if (!parentRef.current) return;
    const containerRect = parentRef.current.getBoundingClientRect();
    const newLines = [];

    const getPoint = (gameId, side) => {
      const el = parentRef.current.querySelector(`[data-game-id="${gameId}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = (side === 'left') 
        ? rect.left - containerRect.left 
        : rect.right - containerRect.left;
      const y = rect.top - containerRect.top + rect.height / 2;
      return { x, y };
    };

    for (let r = 1; r < 5; r++) {
      const prevRound = rounds[r - 1];
      const currRound = rounds[r];
      const half = currRound.games.length / 2;

      currRound.games.forEach((game, gi) => {
        const g1 = prevRound.games[gi * 2];
        const g2 = prevRound.games[gi * 2 + 1];
        if (g1 && g2) {
          const side = (gi < half) ? 'left' : 'right';
          const pG1 = getPoint(g1.id, side === 'left' ? 'right' : 'left');
          const pG2 = getPoint(g2.id, side === 'left' ? 'right' : 'left');
          const pCurr = getPoint(game.id, side === 'left' ? 'left' : 'right');

          if (pG1 && pG2 && pCurr) {
            const isG1Champ = g1.winner && g1.winner.username === activeChampUsername;
            const isG2Champ = g2.winner && g2.winner.username === activeChampUsername;
            const isTargetChamp = game.winner && game.winner.username === activeChampUsername;
            
            newLines.push({
              id: `${game.id}_conn`,
              pG1, pG2, pCurr,
              side,
              champPath1: isTargetChamp && isG1Champ,
              champPath2: isTargetChamp && isG2Champ
            });
          }
        }
      });
    }

    // Connect Semifinalists (Round 5) to the Center Finalist box
    const sfLeft = rounds[4].games[0];
    const sfRight = rounds[4].games[1];
    
    const pSFLeft = getPoint(sfLeft.id, 'right');
    const pSFRight = getPoint(sfRight.id, 'left');
    const pFinalLeft = getPoint(finalGame.id, 'left');
    const pFinalRight = getPoint(finalGame.id, 'right');

    if (pSFLeft && pFinalLeft) {
      newLines.push({
        id: 'sf_left_conn',
        pG1: pSFLeft,
        pG2: pSFLeft,
        pCurr: pFinalLeft,
        side: 'left',
        champPath1: activeChampUsername && sfLeft.winner?.username === activeChampUsername && finalGame.winner?.username === activeChampUsername
      });
    }
    if (pSFRight && pFinalRight) {
      newLines.push({
        id: 'sf_right_conn',
        pG1: pSFRight,
        pG2: pSFRight,
        pCurr: pFinalRight,
        side: 'right',
        champPath1: activeChampUsername && sfRight.winner?.username === activeChampUsername && finalGame.winner?.username === activeChampUsername
      });
    }

    setLines(newLines);
  };

  useLayoutEffect(() => {
    calculateLines();
    // Re-calculate after layout shifts or window resizes
    window.addEventListener('resize', calculateLines);
    return () => window.removeEventListener('resize', calculateLines);
  }, [tournament]);

  // Handle Download to Image
  const handleDownload = async () => {
    if (!parentRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(parentRef.current, {
        scale: 2.5, // Retina quality
        useCORS: true,
        backgroundColor: '#F6F4F0',
        logging: false,
        windowWidth: 1950,
        windowHeight: 1100
      });
      const link = document.createElement('a');
      link.download = `scl_tournament_${tournament.month_year}_bracket.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Smooth snap scroll for mobile optimization
  const snapTo = (section) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    if (section === 'left') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (section === 'center') {
      container.scrollTo({ left: (container.scrollWidth - container.clientWidth) / 2, behavior: 'smooth' });
    } else if (section === 'right') {
      container.scrollTo({ left: container.scrollWidth - container.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload} 
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs font-black bg-brand-primary text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-brand-primary/95 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? 'Generating...' : 'Download Image'}
          </button>
        </div>

        {/* Mobile helper navigation */}
        <div className="flex lg:hidden gap-1 bg-gray-50 p-1 rounded-xl">
          <button onClick={() => snapTo('left')} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white text-gray-600 hover:text-brand-primary shadow-sm">
            Left Bracket
          </button>
          <button onClick={() => snapTo('center')} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white text-gray-600 hover:text-brand-primary shadow-sm">
            Final & Trophy
          </button>
          <button onClick={() => snapTo('right')} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white text-gray-600 hover:text-brand-primary shadow-sm">
            Right Bracket
          </button>
        </div>
      </div>

      {/* Swipe notification for mobile users */}
      <div className="lg:hidden text-center bg-brand-primary/5 py-2 px-4 rounded-xl border border-brand-primary/10 select-none">
        <p className="text-[9px] font-black uppercase text-brand-primary tracking-widest animate-pulse">
          👈 Swipe / Pan horizontally to view entire tree 👉
        </p>
      </div>

      {/* Scrollable canvas wrapper */}
      <div 
        ref={scrollRef} 
        className="w-full overflow-x-auto no-scrollbar border border-gray-100 rounded-3xl bg-[#F6F4F0] relative"
      >
        {/* Inner high-resolution canvas container */}
        <div 
          ref={parentRef} 
          className="flex items-stretch justify-between gap-2 p-8 relative overflow-hidden select-none bg-[#F6F4F0]" 
          style={{ minWidth: '1900px', height: '1050px' }}
        >
          {/* SVG Connector Lines Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {lines.map((line) => {
              const { pG1, pG2, pCurr, side, champPath1, champPath2 } = line;
              const midX = (pG1.x + pCurr.x) / 2;

              // Draw path from Game 1 to target
              const path1 = `M ${pG1.x} ${pG1.y} H ${midX} V ${pCurr.y} H ${pCurr.x}`;
              // Draw path from Game 2 to target
              const path2 = `M ${pG2.x} ${pG2.y} H ${midX} V ${pCurr.y} H ${pCurr.x}`;

              return (
                <g key={line.id}>
                  {/* Base paths */}
                  <path 
                    d={path1} 
                    fill="none" 
                    stroke={champPath1 ? '#F59E0B' : '#E5E7EB'} 
                    strokeWidth={champPath1 ? '3' : '1.5'} 
                    strokeOpacity={champPath1 ? '1' : '0.8'}
                    strokeDasharray={champPath1 ? 'none' : '0'}
                  />
                  <path 
                    d={path2} 
                    fill="none" 
                    stroke={champPath2 ? '#F59E0B' : '#E5E7EB'} 
                    strokeWidth={champPath2 ? '3' : '1.5'} 
                    strokeOpacity={champPath2 ? '1' : '0.8'}
                    strokeDasharray={champPath2 ? 'none' : '0'}
                  />
                </g>
              );
            })}
          </svg>

          {/* LEFT SIDE BRACKET */}
          <div className="flex justify-between flex-1 gap-2 relative z-10">
            {leftRounds.map((r, rIdx) => (
              <div key={r.roundNum} className="flex flex-col justify-around h-full w-[175px]">
                <div className="text-center py-1 bg-brand-primary/10 rounded-lg border border-brand-primary/20 shadow-sm">
                  <span className="text-[8px] font-black uppercase text-brand-primary tracking-wider">{r.name}</span>
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

          {/* CENTER TROPHY COLUMN */}
          <div className="w-[300px] flex flex-col justify-between items-center py-8 px-4 bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 text-center shrink-0 mx-4 shadow-xl relative z-20">
            {/* Top: Title & Date */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-widest">SCL Cup Final</h4>
              <p className="text-[8px] text-gray-400 font-bold">June 30th · 8:30 PM</p>
            </div>

            {/* Middle: Grand Final Matchup Box (Centered Vertically) */}
            <div className="w-full flex-1 flex flex-col justify-center my-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left relative z-30">
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block mb-2 text-center">Grand Final Matchup</span>
                
                {finalGame ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => finalGame.p1 && onPlayerClick(finalGame.p1)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer hover:bg-brand-primary/5 ${
                        finalGame.winner?.username === finalGame.p1?.username ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-[#111111]'
                      }`}
                    >
                      <span className="truncate">{finalGame.p1 ? finalGame.p1.name : 'TBD'}</span>
                      {finalGame.p1 && <span className="text-[9px] text-gray-400">@{finalGame.p1.username}</span>}
                    </div>
                    
                    <div className="text-center text-[9px] font-black text-brand-accent">VS</div>
                    
                    <div 
                      onClick={() => finalGame.p2 && onPlayerClick(finalGame.p2)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer hover:bg-brand-primary/5 ${
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

            {/* Bottom: Trophy & Champion Display */}
            <div className="w-full flex flex-col items-center gap-4">
              {champion ? (
                <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-2xl p-4 shadow-md border border-amber-300 w-full">
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
                <div className="bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl py-4 px-3 text-xs font-semibold select-none w-full">
                  Winner receives the SCL Champion Cup & 👑 status
                </div>
              )}

              {/* Smaller compact trophy */}
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-400/10 blur-2xl rounded-full scale-75" />
                <svg 
                  viewBox="0 0 24 24" 
                  className={`w-20 h-20 relative transition-transform duration-500 group-hover:scale-105 ${champion ? 'text-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]' : 'text-gray-200'}`}
                  fill="currentColor"
                >
                  <path d="M19 5H17V3C17 2.45 16.55 2 16 2H8C7.45 2 7 2.45 7 3V5H5C3.9 5 3 5.9 3 7V9C3 10.87 4.31 12.43 6.07 12.87C6.77 14.73 8.39 16.14 10.4 16.44C10.74 17.3 11.33 18.03 12.09 18.52V20H9C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21C16 20.45 15.55 20 15 20H12.09V18.52C12.85 18.03 13.43 17.3 13.78 16.44C15.78 16.14 17.41 14.73 18.11 12.87C19.87 12.43 21 10.87 21 9V7C21 5.9 20.1 5 19 5ZM5 9V7H7V10.24C5.81 9.87 5 9.02 5 9ZM19 9C19 9.02 18.19 9.87 17 10.24V7H19V9Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE BRACKET */}
          <div className="flex flex-row-reverse justify-between flex-1 gap-2 relative z-10">
            {rightRounds.map((r, rIdx) => (
              <div key={r.roundNum} className="flex flex-col justify-around h-full w-[175px]">
                <div className="text-center py-1 bg-brand-primary/10 rounded-lg border border-brand-primary/20 shadow-sm">
                  <span className="text-[8px] font-black uppercase text-brand-primary tracking-wider">{r.name}</span>
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
    </div>
  );
}
