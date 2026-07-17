import React from 'react';
import { getPlayerDisplay } from '../../utils/chessUtils';
import { PlayerCardSide } from './MatchCardHelper';

export const MatchResult = ({ w, b, res, date, round, division, onPlayerSelect, isAdmin, handleSetResult, gameKeyStr, disableHover = false }) => {
  const wP = getPlayerDisplay(w);
  const bP = getPlayerDisplay(b);
  const isBye = w === 'BYE' || b === 'BYE';

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

  // Decide border hover state based on the winner or platforms
  let borderHoverClass = 'hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]';
  if (res === 'white') {
    borderHoverClass = isChessComW 
      ? 'hover:border-[#81b64c]/40 hover:shadow-[0_0_15px_rgba(129,182,76,0.2)]'
      : 'hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
  } else if (res === 'black') {
    borderHoverClass = isChessComB 
      ? 'hover:border-[#81b64c]/40 hover:shadow-[0_0_15px_rgba(129,182,76,0.2)]'
      : 'hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
  } else if (res === 'draw') {
    borderHoverClass = 'hover:border-gray-500/40 hover:shadow-[0_0_15px_rgba(107,114,128,0.2)]';
  }

  const handlePlayerClick = (pObj, label) => {
    if (onPlayerSelect && pObj) {
      onPlayerSelect(pObj);
    } else if (onPlayerSelect) {
      onPlayerSelect({ name: label.split(' (')[0], username: getPlayerDisplay(label).username });
    }
  };

  const handleKeyDown = (e, pObj, label) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayerClick(pObj, label);
    }
  };

  const getScoreDisplay = () => {
    if (isBye) return 'BYE';
    if (res === 'white') return '1 - 0';
    if (res === 'black') return '0 - 1';
    if (res === 'draw') return '½ - ½';
    return 'vs';
  };

  const getWinnerText = () => {
    if (isBye) {
      return w === 'BYE' ? `${bP.name.split(' ')[0]} Win` : `${wP.name.split(' ')[0]} Win`;
    }
    if (res === 'white') return `${wP.name.split(' ')[0]} Won`;
    if (res === 'black') return `${bP.name.split(' ')[0]} Won`;
    if (res === 'draw') return 'Draw';
    return 'Scheduled';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div 
        className={`varsity-card p-4 md:p-5 flex items-center group ${disableHover ? 'no-hover-effects' : ''}`}
      >
        {/* White Player (Left) */}
        <div 
          onClick={() => handlePlayerClick(wObj, w)}
          onKeyDown={(e) => handleKeyDown(e, wObj, w)}
          tabIndex={0}
          role="button"
          aria-label={`View ${wP.name} profile`}
          className={`w-[40%] flex justify-end shrink-0 cursor-pointer ${
            disableHover ? '' : 'hover:bg-brand-bg-cream/40'
          } rounded-xl p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary ${
            res === 'black' ? 'opacity-40' : ''
          } transition-opacity duration-300`}
        >
          <PlayerCardSide 
            name={wP.name} 
            username={wP.username || wObj?.username || ''} 
            playerObj={wObj} 
            align="right" 
            isWinner={res === 'white'}
          />
        </div>

        {/* Score / Center Info */}
        <div className="flex flex-col items-center justify-center w-[20%] px-2 shrink-0 select-none">
          <span className={`font-extrabold text-sm md:text-base tracking-wider transition-colors ${
            res ? 'text-brand-primary' : 'text-gray-400'
          }`}>
            {getScoreDisplay()}
          </span>
          <span className="text-gray-500 text-[9px] md:text-[10px] font-bold mt-0.5 uppercase tracking-wider text-center line-clamp-1">
            {getWinnerText()}
          </span>
        </div>

        {/* Black Player (Right) */}
        <div 
          onClick={() => handlePlayerClick(bObj, b)}
          onKeyDown={(e) => handleKeyDown(e, bObj, b)}
          tabIndex={0}
          role="button"
          aria-label={`View ${bP.name} profile`}
          className={`w-[40%] flex justify-start shrink-0 cursor-pointer ${
            disableHover ? '' : 'hover:bg-brand-bg-cream/40'
          } rounded-xl p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary ${
            res === 'white' ? 'opacity-40' : ''
          } transition-opacity duration-300`}
        >
          <PlayerCardSide 
            name={bP.name} 
            username={bP.username || bObj?.username || ''} 
            playerObj={bObj} 
            align="left" 
            isWinner={res === 'black'}
          />
        </div>
      </div>

      {/* Admin Score Controls */}
      {isAdmin && !isBye && (
        <div className="flex bg-brand-bg-cream border border-m3-outline-variant rounded-xl p-1 gap-1 w-full max-w-sm mx-auto justify-center self-center animate-in slide-in-from-top-1 duration-150 mt-1 shadow-sm">
          <button
            onClick={() => handleSetResult(gameKeyStr, 'white')}
            className={`flex-1 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              res === 'white'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-brand-primary'
            }`}
          >
            {wP.name.split(' ')[0]} Win
          </button>
          <button
            onClick={() => handleSetResult(gameKeyStr, 'draw')}
            className={`flex-1 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              res === 'draw'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-brand-primary'
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => handleSetResult(gameKeyStr, 'black')}
            className={`flex-1 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
              res === 'black'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-brand-primary'
            }`}
          >
            {bP.name.split(' ')[0]} Win
          </button>
        </div>
      )}
    </div>
  );
};
