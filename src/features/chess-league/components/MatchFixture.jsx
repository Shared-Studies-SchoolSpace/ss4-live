import React from 'react';
import { getPlayerDisplay } from '../utils/chessUtils';
import { PlayerCardSide } from './MatchCardHelper';

export const MatchFixture = ({ w, b, date, round, division, onPlayerSelect }) => {
  const wP = getPlayerDisplay(w);
  const bP = getPlayerDisplay(b);

  const getPlayerObj = (username) => {
    if (!username || !division?.players) return null;
    return division.players.find(
      p => p.username?.toLowerCase() === username.toLowerCase() ||
           p.lichess_username?.toLowerCase() === username.toLowerCase()
    );
  };

  const wObj = getPlayerObj(wP.username);
  const bObj = getPlayerObj(bP.username);

  // Helper to determine platform classes
  const isChessComW = wObj?.lichess_username && !wObj?.username ? false : true;
  const isChessComB = bObj?.lichess_username && !bObj?.username ? false : true;

  // Choose a high-value border and hover glow based on the platforms playing
  let borderHoverClass = 'hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]';
  if (isChessComW && isChessComB) {
    borderHoverClass = 'hover:border-[#81b64c]/40 hover:shadow-[0_0_15px_rgba(129,182,76,0.2)]';
  } else if (!isChessComW && !isChessComB) {
    borderHoverClass = 'hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
  } else {
    // Mixed platforms - dual glow!
    borderHoverClass = 'hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]';
  }

  const handlePlayerClick = (pObj, label) => {
    if (onPlayerSelect && pObj) {
      onPlayerSelect(pObj);
    } else if (onPlayerSelect) {
      // Fallback
      onPlayerSelect({ name: label.split(' (')[0], username: getPlayerDisplay(label).username });
    }
  };

  const handleKeyDown = (e, pObj, label) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayerClick(pObj, label);
    }
  };

  return (
    <div 
      className="varsity-card p-4 md:p-5 flex items-center group"
    >
      {/* White Player (aligned right) */}
      <div 
        onClick={() => handlePlayerClick(wObj, w)}
        onKeyDown={(e) => handleKeyDown(e, wObj, w)}
        tabIndex={0}
        role="button"
        aria-label={`View ${wP.name} profile`}
        className="w-[40%] flex justify-end shrink-0 cursor-pointer hover:bg-brand-bg-cream/40 rounded-xl p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
      >
        <PlayerCardSide 
          name={wP.name} 
          username={wP.username || wObj?.username || ''} 
          playerObj={wObj} 
          align="right" 
        />
      </div>

      {/* VS / Match Info (Center) */}
      <div className="flex flex-col items-center justify-center w-[20%] px-2 shrink-0 select-none">
        <span className="text-brand-primary font-black font-space text-sm md:text-base tracking-wider uppercase group-hover:scale-105 transition-transform">
          VS
        </span>
        <span className="text-gray-500 text-[9px] md:text-[10px] font-bold mt-0.5 uppercase tracking-wider text-center line-clamp-1">
          {date || `ROUND ${round}`}
        </span>
      </div>

      {/* Black Player (aligned left) */}
      <div 
        onClick={() => handlePlayerClick(bObj, b)}
        onKeyDown={(e) => handleKeyDown(e, bObj, b)}
        tabIndex={0}
        role="button"
        aria-label={`View ${bP.name} profile`}
        className="w-[40%] flex justify-start shrink-0 cursor-pointer hover:bg-brand-bg-cream/40 rounded-xl p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
      >
        <PlayerCardSide 
          name={bP.name} 
          username={bP.username || bObj?.username || ''} 
          playerObj={bObj} 
          align="left" 
        />
      </div>
    </div>
  );
};
