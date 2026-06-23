import React from 'react';

export function TournamentPlayerModal({ player, onClose }) {
  if (!player) return null;

  const isBye = player.username === 'bye';
  if (isBye) return null;

  // Format WhatsApp number
  const rawContact = player.contact || '';
  const cleanContact = rawContact.replace(/^0+/, '').replace(/\D/g, '');
  const waLink = cleanContact ? `https://wa.me/234${cleanContact}` : null;
  const chessLink = `https://www.chess.com/member/${player.username}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="absolute top-6 right-6 text-gray-400 hover:text-[#111111] text-2xl font-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close details"
        >
          &times;
        </button>

        {/* Profile Card Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-[#25D366] text-white font-black text-2xl flex items-center justify-center select-none shadow-sm flex-shrink-0">
            {player.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black font-space text-[#111111] leading-tight mb-1 truncate">
              {player.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a 
                href={chessLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
              >
                @{player.username} ↗
              </a>
            </div>
            {(player.department || player.school) && (
              <div className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center gap-1 flex-wrap">
                {player.department && <span className="truncate">{player.department}</span>}
                {player.department && player.school && <span> &bull; </span>}
                {player.school && <span className="truncate font-bold text-gray-500">{player.school}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-brand-bg-cream/50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5">
              <span className="block text-2xl font-black text-[#111111]">
                {player.rating || 'N/A'}
              </span>
              {player.isProvisional && (
                <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Prov
                </span>
              )}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1 block">
              Rapid Rating
            </span>
          </div>

          <div className="bg-brand-bg-cream/50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="block text-2xl font-black text-[#111111]">
              {player.gamesCount ?? 0}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1 block">
              Rated Games
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow text-center cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          ) : (
            <div className="bg-gray-100 text-gray-400 font-bold text-xs py-3 px-4 rounded-xl text-center select-none">
              No WhatsApp
            </div>
          )}

          <a
            href={chessLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow text-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19.467 22H4.533C3.687 22 3 21.313 3 20.467V3.533C3 2.687 3.687 2 4.533 2h14.934C20.313 2 21 2.687 21 3.533v16.934C21 21.313 20.313 22 19.467 22zM12 4.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM18 17.5a6 6 0 00-12 0v1h12v-1z"/>
            </svg>
            Chess.com
          </a>
        </div>
      </div>
    </div>
  );
}
