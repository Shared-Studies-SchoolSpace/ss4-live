import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthGate from '../../auth-portal/components/AuthGate';
import { useAuth } from '../../auth-portal/hooks/useAuth';
import { usePlayerDetails } from './MatchCardHelper';
import { tournamentPlayers } from '../data/tournamentPlayers';
import { players as initialPlayers } from '../data/chessData';
import { supabase } from '../../../supabase';

export const getWhatsAppUrl = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // 1. Full E.164 with international country code (≥ 12 digits, e.g. 2348139732276)
  if (digits.length >= 12) {
    return `https://wa.me/${digits}`;
  }

  // 2. Nigerian local format with leading zero (11 digits starting with 0)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
    return `https://wa.me/${digits}`;
  }

  // 3. Nigerian short local format without leading zero (10 digits starting with 7, 8, 9)
  const nigerianPrefixes = ['70', '71', '80', '81', '90', '91'];
  if (digits.length === 10 && nigerianPrefixes.some(p => digits.startsWith(p))) {
    digits = '234' + digits;
    return `https://wa.me/${digits}`;
  }

  // 4. Fallback pass through
  return `https://wa.me/${digits}`;
};

export function useResolvedPlayerPhone(player) {
  const { user, profile: authProfile } = useAuth();
  const [phone, setPhone] = useState(() =>
    player?.phone || player?.whatsapp || player?.whatsapp_number || player?.contact || null
  );

  useEffect(() => {
    const direct = player?.phone || player?.whatsapp || player?.whatsapp_number || player?.contact;
    if (direct) {
      setPhone(direct);
      return;
    }

    const usernameKey = player?.username?.toLowerCase() || player?.chess_username?.toLowerCase();
    const nameKey = player?.name?.toLowerCase();
    const playerId = player?.id;

    // 1. Match logged-in user profile
    const isCurrentUser =
      (user && (
        (playerId && user.id === playerId) ||
        (usernameKey && user.email?.split('@')[0]?.toLowerCase() === usernameKey)
      )) ||
      (authProfile && (
        (playerId && authProfile.id === playerId) ||
        (usernameKey && authProfile.chess_username?.toLowerCase() === usernameKey) ||
        (nameKey && authProfile.name?.toLowerCase() === nameKey)
      ));

    if (isCurrentUser) {
      const userPhone = authProfile?.phone || authProfile?.whatsapp || authProfile?.contact || user?.user_metadata?.phone || user?.user_metadata?.whatsapp;
      if (userPhone) {
        setPhone(userPhone);
        return;
      }
    }

    // 2. Static dataset lookups
    const staticMatch =
      (tournamentPlayers || []).find(p => (usernameKey && p.username?.toLowerCase() === usernameKey) || (nameKey && p.name?.toLowerCase() === nameKey)) ||
      (initialPlayers || []).find(p => (usernameKey && p.username?.toLowerCase() === usernameKey) || (nameKey && p.name?.toLowerCase() === nameKey));

    if (staticMatch?.contact || staticMatch?.phone || staticMatch?.whatsapp) {
      setPhone(staticMatch.contact || staticMatch.phone || staticMatch.whatsapp);
      return;
    }

    // 3. Supabase divisions table lookup
    let isMounted = true;
    async function fetchFromDivisions() {
      try {
        const { data: divData } = await supabase.from('divisions').select('players');
        if (divData && isMounted) {
          for (const d of divData) {
            const match = (d.players || []).find(p =>
              (usernameKey && p.username?.toLowerCase() === usernameKey) ||
              (nameKey && p.name?.toLowerCase() === nameKey)
            );
            if (match && (match.contact || match.phone || match.whatsapp)) {
              setPhone(match.contact || match.phone || match.whatsapp);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Divisions phone lookup failed:', err);
      }
    }

    fetchFromDivisions();
    return () => { isMounted = false; };
  }, [player, user, authProfile]);

  return phone;
}

export function TournamentPlayerModal({ player, onClose }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // Load avatar and extended details from platform
  const details = usePlayerDetails(player?.username, player);
  const playerPhone = useResolvedPlayerPhone(player);

  if (!player) return null;

  const isBye = player.username === 'bye';
  if (isBye) return null;

  const isChessCom = details.platform === 'chess.com';
  const platformName = isChessCom ? 'Chess.com' : 'Lichess';
  const platformProfileUrl = isChessCom 
    ? `https://www.chess.com/member/${encodeURIComponent(player.username)}`
    : `https://lichess.org/@/${encodeURIComponent(player.username)}`;

  const whatsappUrl = getWhatsAppUrl(playerPhone);

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

  const handleWhatsAppClick = (e) => {
    if (!whatsappUrl) {
      e.preventDefault();
      toast.info(`@${player.name || player.username} has not added their WhatsApp number yet.`);
    }
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
              ? 'bg-brand-primary/20 text-white border-brand-primary/40' 
              : 'bg-brand-accent/20 text-white border-brand-accent/40'
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
                  referrerPolicy="no-referrer"
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
              isChessCom ? 'bg-brand-primary' : 'bg-brand-accent'
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
                  <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[8px] font-bold px-1 py-0.2 rounded uppercase">
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

          {/* 3 Action Buttons Card: Message | Chess.com | WhatsApp (Redesigned for Mobile) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50/80 rounded-2xl border border-gray-200/80 shadow-2xs my-4">
            <AuthGate reason="message this player directly" onAction={handleMessagePlayer}>
              <button
                type="button"
                onClick={handleMessagePlayer}
                className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-brand-primary hover:bg-[#1545A2] text-white font-black text-[10px] sm:text-xs py-2 px-1.5 rounded-xl transition-all shadow-2xs cursor-pointer min-h-[38px] sm:min-h-[42px] active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">Message</span>
              </button>
            </AuthGate>

            <a
              href={platformProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-white hover:bg-gray-100 text-[#111111] font-black text-[10px] sm:text-xs py-2 px-1.5 rounded-xl transition-all border border-gray-200/90 text-center cursor-pointer min-h-[38px] sm:min-h-[42px] active:scale-[0.98] shadow-2xs"
            >
              <span className="truncate">{platformName}</span>
              <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <a
              href={whatsappUrl || '#'}
              target={whatsappUrl ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 font-black text-[10px] sm:text-xs py-2 px-1.5 rounded-xl transition-all text-center cursor-pointer min-h-[38px] sm:min-h-[42px] active:scale-[0.98] ${
                whatsappUrl 
                  ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xs' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span className="truncate">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


