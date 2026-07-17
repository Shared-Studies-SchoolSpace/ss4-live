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
      <div className={`flex items-center gap-4 w-full ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {align === 'right' && (
          <span className="text-gray-400 font-bold text-sm md:text-base tracking-wide truncate">BYE</span>
        )}
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-xs font-black text-gray-500">BYE</span>
        </div>
        {align === 'left' && (
          <span className="text-gray-400 font-bold text-sm md:text-base tracking-wide truncate">BYE</span>
        )}
      </div>
    );
  }

  // Setup platform colors and labels
  const isChessCom = details.platform === 'chess.com';
  const platformColor = isChessCom ? 'text-[#81b64c]' : 'text-[#3b82f6]';
  const platformBg = isChessCom ? 'bg-[#81b64c]/10 border-[#81b64c]/30' : 'bg-[#3b82f6]/10 border-[#3b82f6]/30';
  const platformLabelText = isChessCom ? 'Chess.com' : 'Lichess';

  return (
    <div className={`flex items-center gap-3 md:gap-4 w-full ${align === 'right' ? 'justify-end' : 'justify-start'} min-w-0`}>
      {align === 'right' && (
        <div className="text-right min-w-0 flex-1">
          <span className="text-brand-text-dark font-bold text-xs sm:text-sm md:text-base tracking-wide truncate block group-hover:text-brand-primary transition-colors">
            {name}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1 mt-0.5">
            {details.title && (
              <span className="bg-red-600 text-white font-black text-[9px] px-1 rounded-sm uppercase tracking-wide">
                {details.title}
              </span>
            )}
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 truncate max-w-[50px] sm:max-w-none">
              @{username}
            </span>
            <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded border ${platformBg} ${platformColor}`}>
              {details.rating}
            </span>
          </div>
        </div>
      )}

      <div className="relative shrink-0">
        {isWinner && (
          <span 
            className="material-symbols-outlined absolute -top-2.5 -right-1.5 text-amber-500 font-black text-[18px] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.7)] select-none z-10"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
          >
            crown
          </span>
        )}
        <div className={`w-10 h-10 md:w-12 md:h-12 bg-gray-100 border border-gray-200 rounded-full overflow-hidden flex items-center justify-center shadow-md`}>
          {details.loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">{name.charAt(0)}</span>
            </div>
          ) : (details.avatar && !imgError) ? (
            <img 
              src={details.avatar} 
              alt={`${name} Avatar`} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-600 text-sm md:text-base select-none">
              {name.charAt(0)}
            </div>
          )}
        </div>
        {/* Tiny platform dot */}
        <span 
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white ${
            isChessCom ? 'bg-[#81b64c]' : 'bg-[#3b82f6]'
          }`}
          title={platformLabelText}
        >
          {isChessCom ? '♙' : '♞'}
        </span>
      </div>

      {align === 'left' && (
        <div className="text-left min-w-0 flex-1">
          <span className="text-brand-text-dark font-bold text-xs sm:text-sm md:text-base tracking-wide truncate block group-hover:text-brand-primary transition-colors">
            {name}
          </span>
          <div className="flex flex-wrap items-center justify-start gap-1 mt-0.5">
            <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded border ${platformBg} ${platformColor}`}>
              {details.rating}
            </span>
            {details.title && (
              <span className="bg-red-600 text-white font-black text-[9px] px-1 rounded-sm uppercase tracking-wide">
                {details.title}
              </span>
            )}
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 truncate max-w-[50px] sm:max-w-none">
              @{username}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
