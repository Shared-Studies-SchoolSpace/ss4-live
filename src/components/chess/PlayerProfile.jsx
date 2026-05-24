import React from 'react';

export const PlayerProfile = ({ player, onClose }) => {
  const winRate = player.P > 0 ? ((player.W / player.P) * 100).toFixed(1) : '0.0';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-6 right-6 text-gray-400 hover:text-[#111111] text-2xl font-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close profile"
        >
          &times;
        </button>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-2xl flex items-center justify-center select-none shadow-sm flex-shrink-0">
            {player.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black font-space text-[#111111] leading-tight mb-1">{player.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a 
                href={`https://www.chess.com/member/${player.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors"
              >
                @{player.username} ↗
              </a>
              {player.contact && (
                <a
                  href={`https://wa.me/234${player.contact.replace(/^0+/, '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#25D366] hover:text-[#1ebd59] transition-colors flex items-center gap-1"
                  title="Chat on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {player.contact}
                </a>
              )}
            </div>
            {(player.department || player.school) && (
              <div className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center gap-1 flex-wrap">
                {player.department && <span>{player.department}</span>}
                {player.department && player.school && <span> &bull; </span>}
                {player.school && <span>{player.school}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-brand-bg-cream/50 rounded-2xl p-4 text-center border border-gray-50">
            <span className="block text-xl font-black text-[#111111]">{player.Pts}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5 block">Points</span>
          </div>
          <div className="bg-brand-bg-cream/50 rounded-2xl p-4 text-center border border-gray-50">
            <span className="block text-xl font-black text-[#111111]">{player.P}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5 block">Played</span>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100/50">
            <span className="block text-xl font-black text-green-600">{player.W}</span>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-wider mt-0.5 block">Wins</span>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100/50">
            <span className="block text-xl font-black text-blue-600">{player.D}</span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider mt-0.5 block">Draws</span>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100/50">
            <span className="block text-xl font-black text-red-600">{player.L}</span>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider mt-0.5 block">Losses</span>
          </div>
          <div className="bg-brand-accent/5 rounded-2xl p-4 text-center border border-brand-accent/10">
            <span className="block text-xl font-black text-brand-accent">{winRate}%</span>
            <span className="text-[10px] font-black text-brand-accent/75 uppercase tracking-wider mt-0.5 block">Win Rate</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Recent Performance</h3>
          <div className="flex flex-wrap gap-2">
            {player.history.length > 0 ? (
              player.history.slice(-10).map((h, i) => (
                <span 
                  key={i} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border ${
                    h === 'W' 
                      ? 'bg-green-500 border-green-600 text-white' 
                      : h === 'D' 
                        ? 'bg-gray-400 border-gray-500 text-white' 
                        : 'bg-red-500 border-red-600 text-white'
                  }`}
                >
                  {h}
                </span>
              ))
            ) : (
              <span className="text-sm font-medium text-gray-400 italic">No games played yet in this division.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
