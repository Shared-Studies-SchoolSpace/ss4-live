import React from 'react';
import { getPlayerDisplay } from '../utils/chessUtils';
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

  // Clean SS4 border hover state
  let borderHoverClass = 'hover:border-brand-primary/40 hover:shadow-xs';
  if (res === 'white' || res === 'black') {
    borderHoverClass = 'hover:border-brand-primary/60 hover:shadow-sm';
  } else if (res === 'draw') {
    borderHoverClass = 'hover:border-gray-400 hover:shadow-xs';
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
    return 'VS';
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
    <div className="flex flex-col gap-2 w-full max-w-full overflow-hidden">
      <div 
        className={`varsity-card p-3 sm:p-4 flex items-center justify-between gap-1.5 sm:gap-3 group ${disableHover ? 'no-hover-effects' : ''} ${borderHoverClass}`}
      >
        {/* White Player (Left) */}
        <div 
          onClick={() => handlePlayerClick(wObj, w)}
          onKeyDown={(e) => handleKeyDown(e, wObj, w)}
          tabIndex={0}
          role="button"
          aria-label={`View ${wP.name} profile`}
          className={`flex-1 min-w-0 flex justify-end cursor-pointer ${
            disableHover ? '' : 'hover:bg-brand-primary/5'
          } rounded-xl p-1 sm:p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary ${
            res === 'black' ? 'opacity-50' : ''
          } transition-opacity duration-200`}
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
        <div className="flex flex-col items-center justify-center shrink-0 px-1 sm:px-2 select-none min-w-[50px] sm:min-w-[65px]">
          <span className={`font-space font-black text-xs sm:text-sm tracking-wider px-2 py-0.5 rounded-lg border ${
            res ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-bg-cream text-gray-500 border-m3-outline-variant'
          }`}>
            {getScoreDisplay()}
          </span>
          <span className="text-gray-500 text-[8px] sm:text-[9px] font-black mt-1 uppercase tracking-wider text-center truncate max-w-[60px] sm:max-w-none">
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
          className={`flex-1 min-w-0 flex justify-start cursor-pointer ${
            disableHover ? '' : 'hover:bg-brand-primary/5'
          } rounded-xl p-1 sm:p-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary ${
            res === 'white' ? 'opacity-50' : ''
          } transition-opacity duration-200`}
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
        <div className="flex bg-brand-bg-cream border border-m3-outline-variant rounded-xl p-1 gap-1 w-full max-w-sm mx-auto justify-center self-center animate-in slide-in-from-top-1 duration-150 shadow-xs">
          <button
            onClick={() => handleSetResult(gameKeyStr, 'white')}
            className={`flex-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer border-none ${
              res === 'white'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-brand-primary'
            }`}
          >
            {wP.name.split(' ')[0]} Win
          </button>
          <button
            onClick={() => handleSetResult(gameKeyStr, 'draw')}
            className={`flex-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer border-none ${
              res === 'draw'
                ? 'bg-brand-accent text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-brand-primary'
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => handleSetResult(gameKeyStr, 'black')}
            className={`flex-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer border-none ${
              res === 'black'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-brand-primary'
            }`}
          >
            {bP.name.split(' ')[0]} Win
          </button>
        </div>
      )}
    </div>
  );
};
