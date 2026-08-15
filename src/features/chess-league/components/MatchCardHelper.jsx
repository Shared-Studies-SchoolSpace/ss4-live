import React, { useState, useEffect } from 'react';
import { fetchCompletePlayerData } from '../utils/chessService';

export function usePlayerDetails(username, playerObj) {
  const [details, setDetails] = useState({
    avatar: null,
    rating: playerObj?.chess_rating || playerObj?.rating || 1200,
    title: null,
    loading: true,
    platform: playerObj?.lichess_username && !playerObj?.username ? 'lichess' : 'chess.com'
  });

  useEffect(() => {
    if (!username || username === 'BYE') {
      setDetails(prev => ({ ...prev, loading: false }));
      return;
    }

    let isMounted = true;
    const platform = playerObj?.lichess_username && !playerObj?.username ? 'lichess' : 'chess.com';
    const targetUsername = platform === 'lichess' ? playerObj?.lichess_username : username;

    async function loadData() {
      const data = await fetchCompletePlayerData(targetUsername, platform);
      if (isMounted && data) {
        setDetails({
          avatar: data.avatar,
          rating: data.rating || details.rating,
          title: data.title,
          loading: false,
          platform
        });
      } else if (isMounted) {
        setDetails(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [username, playerObj]);

  return details;
}

export function PlayerCardSide({ name, username, playerObj, align = 'left', isWinner = false }) {
  const isBye = name === 'BYE' || username === 'BYE';
  const details = usePlayerDetails(username, playerObj);
  const [imgError, setImgError] = useState(false);
  
  if (isBye) {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 w-full ${align === 'right' ? 'justify-end' : 'justify-start'} min-w-0`}>
        {align === 'right' && (
          <span className="text-gray-400 font-bold text-xs sm:text-sm tracking-wide truncate">BYE</span>
        )}
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center shrink-0 shadow-xs">
          <span className="text-[10px] font-black text-gray-500">BYE</span>
        </div>
        {align === 'left' && (
          <span className="text-gray-400 font-bold text-xs sm:text-sm tracking-wide truncate">BYE</span>
        )}
      </div>
    );
  }

  const isChessCom = details.platform === 'chess.com';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 w-full ${align === 'right' ? 'flex-row-reverse justify-start text-right' : 'flex-row justify-start text-left'} min-w-0`}>
      {/* Avatar Container */}
      <div className="relative shrink-0">
        {isWinner && (
          <span 
            className="material-symbols-outlined absolute -top-2.5 -right-1 text-amber-500 font-black text-[16px] sm:text-[18px] drop-shadow-xs select-none z-10"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
          >
            crown
          </span>
        )}
        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-100 border border-gray-200 rounded-full overflow-hidden flex items-center justify-center shadow-xs">
          {details.loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">{name.charAt(0)}</span>
            </div>
          ) : (details.avatar && !imgError) ? (
            <img 
              src={details.avatar} 
              alt={`${name} Avatar`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-black text-brand-primary text-xs sm:text-sm select-none">
              {name.charAt(0)}
            </div>
          )}
        </div>
        {/* Tiny platform indicator dot */}
        <span 
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white ${
            isChessCom ? 'bg-brand-primary' : 'bg-brand-accent'
          }`}
          title={isChessCom ? 'Chess.com' : 'Lichess'}
        >
          {isChessCom ? '♙' : '♞'}
        </span>
      </div>

      {/* Player Meta Info */}
      <div className="min-w-0 flex-1">
        <span className="text-brand-text-dark font-bold text-xs sm:text-sm tracking-tight truncate block group-hover:text-brand-primary transition-colors cursor-pointer leading-snug">
          {name}
        </span>
        <div className={`flex items-center gap-1 mt-0.5 flex-wrap ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          {details.title && (
            <span className="bg-brand-accent text-white font-black text-[8px] sm:text-[9px] px-1 rounded uppercase tracking-wide shrink-0">
              {details.title}
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 truncate max-w-[65px] sm:max-w-none">
            @{username}
          </span>
          <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded border border-m3-outline-variant bg-brand-bg-cream text-brand-primary shrink-0">
            {details.rating}
          </span>
        </div>
      </div>
    </div>
  );
}
