import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthGate from '../../auth-portal/components/AuthGate';
import { usePlayerDetails } from './MatchCardHelper';

export function TournamentPlayerModal({ player, onClose }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // Load avatar and extended details from platform
  const details = usePlayerDetails(player?.username, player);

  if (!player) return null;

  const isBye = player.username === 'bye';
  if (isBye) return null;

  const isChessCom = details.platform === 'chess.com';
  const platformName = isChessCom ? 'Chess.com' : 'Lichess';
  const platformProfileUrl = isChessCom 
    ? `https://www.chess.com/member/${encodeURIComponent(player.username)}`
    : `https://lichess.org/@/${encodeURIComponent(player.username)}`;

  const monogram = (player.name || '?')
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleMessagePlayer = () => {
    onClose();
    navigate(`/dashboard?tab=dm&username=${encodeURIComponent(player.username)}`, {
      state: { tab: 'dm', username: player.username, contactId: player.id }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B193C]/60 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Dialog Shell (M3 28px corners, clean shadow, width 440px) */}
      <div 
        className="bg-white rounded-t-[28px] sm:rounded-[28px] max-w-[440px] w-full relative shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Hero Banner Header */}
        <div className="relative h-36 bg-gradient-to-r from-[#0B193C] via-[#153472] to-[#1A56C4] px-5 py-4 flex justify-between items-start select-none shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
          
          {/* Platform Tag */}
          <span className={`relative z-10 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
            isChessCom 
              ? 'bg-[#81b64c]/20 text-[#a3e635] border-[#81b64c]/40' 
              : 'bg-[#3b82f6]/20 text-[#93c5fd] border-[#3b82f6]/40'
          }`}>
            <span>{isChessCom ? '♙' : '♞'}</span>
            <span>{platformName}</span>
          </span>

          {/* Close Button */}
          <button 
            className="relative z-10 text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 4cm x 4cm Square Image Badge */}
        <div className="absolute left-6 top-10 z-20 pointer-events-none">
          <div className="relative pointer-events-auto">
            <div className="w-[4cm] h-[4cm] bg-white overflow-hidden flex items-center justify-center rounded-2xl shadow-xl border-2 border-white">
              {details.avatar && !imgError ? (
                <img 
                  src={details.avatar} 
                  alt={player.name} 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black text-2xl flex items-center justify-center select-none">
                  {monogram}
                </div>
              )}
            </div>
            {/* Platform Icon Badge */}
            <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-md ${
              isChessCom ? 'bg-[#81b64c]' : 'bg-[#3b82f6]'
            }`}>
              {isChessCom ? '♙' : '♞'}
            </span>
          </div>
        </div>

        {/* Dialog Content Body */}
        <div className="px-6 pb-6 pt-24 relative flex-1 overflow-y-auto">
          {/* Header Row: Title badge aligned to right */}
          {details.title && (
            <div className="flex justify-end mb-2">
              <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                {details.title}
              </span>
            </div>
          )}

          {/* Player Name and Username */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold font-space text-[#111111] leading-tight">
              {player.name}
            </h2>
            
            <a 
              href={platformProfileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline transition-all mt-1"
            >
              <span>@{player.username}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {(player.department || player.school) && (
              <div className="text-xs font-medium text-gray-600 mt-2.5 flex items-center gap-1.5 flex-wrap bg-[#F6F4F0] px-3 py-2 rounded-xl border border-gray-200/60">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {player.department && <span className="text-gray-700 font-semibold">{player.department}</span>}
                {player.department && player.school && <span className="text-gray-300">•</span>}
                {player.school && <span className="font-bold text-gray-800">{player.school}</span>}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#F6F4F0] rounded-2xl p-3 border border-gray-200/60 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1">
                <span className="block text-xl font-bold font-space text-[#111111]">
                  {details.rating || player.rating || 'N/A'}
                </span>
                {player.isProvisional && (
                  <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[8px] font-bold px-1 py-0.2 rounded uppercase">
                    Prov
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 block">
                {platformName} Rating
              </span>
            </div>

            <div className="bg-[#F6F4F0] rounded-2xl p-3 border border-gray-200/60 flex flex-col items-center justify-center text-center">
              <span className="block text-xl font-bold font-space text-[#111111]">
                {player.gamesCount ?? player.P ?? 0}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 block">
                Rated Games
              </span>
            </div>
          </div>

          {/* Side-by-side Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <AuthGate reason="message this player directly" onAction={handleMessagePlayer}>
              <button
                type="button"
                onClick={handleMessagePlayer}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-[#1545A2] text-white font-bold text-xs py-3 px-3 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Message Player</span>
              </button>
            </AuthGate>

            <a
              href={platformProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs py-3 px-3 rounded-xl transition-all border border-gray-200 text-center cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <span>{platformName} Profile</span>
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


