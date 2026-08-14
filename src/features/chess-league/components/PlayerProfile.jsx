import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth-portal/hooks/useAuth';
import { useAuthModal } from '../../auth-portal/context/AuthModalContext';
import tertiaryData from '../../tertiary-admissions/data/tertiary.json';
import { getWhatsAppUrl, useResolvedPlayerPhone } from './TournamentPlayerModal';

export const PlayerProfile = ({ player, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const name = player.name || 'Anonymous';
  const schoolName = player.university || player.school || '';
  const department = player.department || '';
  const chessUsername = player.chess_username || player.username || '';
  const lichessUsername = player.lichess_username || '';

  const playerPhone = useResolvedPlayerPhone(player);
  const whatsappUrl = getWhatsAppUrl(playerPhone);

  const handleWhatsAppClick = (e) => {
    if (!whatsappUrl) {
      e.preventDefault();
      toast.info(`@${name} has not added their WhatsApp number yet.`);
    }
  };

  // Ratings & division
  const chessRating = player.chess_rating || player.rating || 1200;
  const lichessRating = player.lichess_rating || 0;
  const rating = Math.max(chessRating, lichessRating);
  
  const peakRating = player.peak_rating || Math.round(rating * 1.05);
  const dateJoined = player.created_at 
    ? new Date(player.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) 
    : 'June 2026';

  // Standings / Stats
  const gamesPlayed = player.P !== undefined ? player.P : 0;
  const wins = player.W !== undefined ? player.W : 0;
  const draws = player.D !== undefined ? player.D : 0;
  const losses = player.L !== undefined ? player.L : 0;
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';
  const history = player.history || [];

  // Extended SCL stats
  const appearances = player.appearances || Math.max(1, Math.floor(gamesPlayed / 4));
  const titles = player.titles || (rating >= 1900 ? 'Arena Grandmaster' : rating >= 1650 ? 'Candidate Master' : 'Challenger');
  const ranking = player.ranking || Math.max(1, Math.floor(200 - rating / 10));

  // Determine SCL Division
  const getDivisionDetails = (elo) => {
    if (elo >= 1800) {
      return {
        name: 'A Division',
        label: 'Elite Category',
        colorClass: 'bg-red-50 text-red-700 border-red-200',
        textColor: 'text-red-700',
        badge: <span className="material-symbols-outlined text-red-600 text-xs select-none leading-none align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
      };
    } else if (elo >= 1000) {
      return {
        name: 'Fork Division',
        label: 'Intermediate Category',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
        textColor: 'text-blue-700',
        badge: <span className="material-symbols-outlined text-blue-600 text-xs select-none leading-none align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
      };
    } else {
      return {
        name: 'Pin Division',
        label: 'Aspirants Category',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        textColor: 'text-emerald-700',
        badge: <span className="material-symbols-outlined text-emerald-600 text-xs select-none leading-none align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
      };
    }
  };

  const division = getDivisionDetails(rating);

  // Institution profile link handler
  const handleInstitutionClick = () => {
    if (!schoolName) return;
    onClose();

    // Check if institution is Tertiary or Secondary
    const matchedTertiary = tertiaryData.find(t => 
      t.name.toLowerCase() === schoolName.toLowerCase() || 
      t.abbreviation?.toLowerCase() === schoolName.toLowerCase()
    );

    if (matchedTertiary) {
      navigate(`/tertiary/${matchedTertiary.id}`, { state: { school: matchedTertiary } });
    } else {
      const slug = schoolName.replace(/\s+/g, '-').toLowerCase();
      navigate(`/school/${slug}`, { 
        state: { 
          school: { 
            name: schoolName, 
            type: 'Secondary School', 
            location: 'Lagos', 
            state: 'Lagos', 
            verified: true 
          } 
        } 
      });
    }
  };

  // Direct Message handler
  const handleMessageClick = () => {
    if (!user) {
      onClose();
      openAuthModal('direct message players', () => {
        navigate('/dashboard?tab=messages&contactId=' + player.id, { state: { contactId: player.id } });
      });
      return;
    }
    onClose();
    navigate('/dashboard?tab=messages&contactId=' + player.id, { state: { contactId: player.id } });
  };

  // Generate SVG Sparkline for timeline
  const generateTimelinePoints = () => {
    const dataPoints = [];
    let startRating = rating - (history.length * 15);
    dataPoints.push(startRating);
    history.forEach(h => {
      if (h === 'W') startRating += 15;
      else if (h === 'L') startRating -= 15;
      dataPoints.push(startRating);
    });

    if (dataPoints.length === 1) {
      dataPoints.unshift(rating - 15);
    }

    const width = 340;
    const height = 50;
    const padding = 6;
    const maxVal = Math.max(...dataPoints);
    const minVal = Math.min(...dataPoints);
    const range = maxVal - minVal || 1;

    return dataPoints.map((val, idx) => {
      const x = padding + (idx / (dataPoints.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const primaryChessHandle = chessUsername || lichessUsername;
  const primaryChessUrl = chessUsername 
    ? `https://www.chess.com/member/${chessUsername}` 
    : `https://lichess.org/@/${lichessUsername}`;
  const primaryChessLabel = chessUsername ? 'Chess.com' : 'Lichess';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/45 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-lg relative shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Block / Division Indicator */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${division.colorClass}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{division.badge}</span>
            <span className="text-[10px] font-black uppercase tracking-widest font-space">{division.name} &bull; {division.label}</span>
          </div>
          <button 
            className="text-gray-400 hover:text-brand-text-dark w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto max-h-[85vh] no-scrollbar space-y-6">
          
          {/* Section: Profile Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-2xl flex items-center justify-center select-none shadow-sm flex-shrink-0">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black font-space text-brand-text-dark leading-tight">{name}</h2>
              
              {/* Institution hyperlink */}
              {schoolName ? (
                <button
                  onClick={handleInstitutionClick}
                  className="text-xs font-bold text-brand-primary hover:text-brand-accent hover:underline text-left mt-1 block transition-colors outline-none cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1">
                    {schoolName}
                    <svg className="w-3 h-3 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </span>
                </button>
              ) : (
                <p className="text-xs font-semibold text-gray-400 mt-1">SS4 Individual Player</p>
              )}

              {department && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{department}</p>
              )}
            </div>
          </div>

          {/* Section: Action Buttons Card (Message | Chess.com | WhatsApp - Redesigned for Mobile) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50/80 rounded-2xl border border-gray-200/80 shadow-2xs">
            <button 
              onClick={handleMessageClick}
              className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-brand-primary hover:bg-[#1545A2] text-white font-black text-[10px] sm:text-xs py-2 px-1.5 rounded-xl transition-all shadow-2xs cursor-pointer min-h-[38px] sm:min-h-[42px] active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Message</span>
            </button>

            <a
              href={primaryChessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-white hover:bg-gray-100 text-[#111111] font-black text-[10px] sm:text-xs py-2 px-1.5 rounded-xl transition-all border border-gray-200/90 text-center cursor-pointer min-h-[38px] sm:min-h-[42px] active:scale-[0.98] shadow-2xs"
            >
              <span>{primaryChessLabel}</span>
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
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Section: Ratings & SCL Info */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">SCL Statistics</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Rapid Rating</span>
                <span className="block text-base font-black text-brand-text-dark mt-1 font-space">{rating} ELO</span>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Peak ELO</span>
                <span className="block text-base font-black text-brand-accent mt-1 font-space">{peakRating} ELO</span>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Ranking</span>
                <span className="block text-base font-black text-brand-text-dark mt-1 font-space">#{ranking}</span>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Titles</span>
                <span className="block text-[10px] font-black text-brand-primary uppercase mt-2.5 tracking-wider break-words" title={titles}>{titles}</span>
              </div>
            </div>
          </div>

          {/* Core Game Stats grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white border border-gray-150 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-brand-text-dark font-space">{gamesPlayed}</span>
              <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 block">Played</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-emerald-600 font-space">{wins}</span>
              <span className="text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 block">Wins</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-amber-600 font-space">{draws}</span>
              <span className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5 block">Draws</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-rose-600 font-space">{losses}</span>
              <span className="text-[8px] sm:text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5 block">Losses</span>
            </div>
            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-brand-primary font-space">{winRate}%</span>
              <span className="text-[8px] sm:text-[9px] font-black text-brand-primary/75 uppercase tracking-widest mt-0.5 block">Win Rate</span>
            </div>
            <div className="bg-white border border-gray-150 rounded-xl p-2 sm:p-3 text-center shadow-sm">
              <span className="block text-lg sm:text-xl font-black text-brand-text-dark font-space">{appearances}</span>
              <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 block">Cups</span>
            </div>
          </div>

          {/* Section: Timeline & Joined Info */}
          <div className="border-t border-gray-150 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Performance Timeline</h3>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined {dateJoined}</span>
            </div>

            {/* Sparkline Graph */}
            <div className="bg-brand-bg-cream/40 rounded-2xl p-4 border border-gray-150 flex flex-col justify-center h-20 overflow-hidden relative">
              <svg className="w-full h-12 text-brand-primary overflow-visible" viewBox="0 0 340 50">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={generateTimelinePoints()}
                />
              </svg>
            </div>
            
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recent:</span>
              {history.slice(-10).map((h, i) => (
                <span 
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] border ${
                    h === 'W' 
                      ? 'bg-emerald-500 border-emerald-600 text-white' 
                      : h === 'D' 
                        ? 'bg-gray-400 border-gray-500 text-white' 
                        : 'bg-rose-500 border-rose-600 text-white'
                  }`}
                >
                  {h}
                </span>
              ))}
              {history.length === 0 && (
                <span className="text-[10px] text-gray-400 font-semibold italic">No recent match history record.</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
