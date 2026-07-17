import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModal } from '../../context/AuthModalContext';
import tertiaryData from '../../data/tertiary.json';

export const PlayerProfile = ({ player, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const name = player.name || 'Anonymous';
  const schoolName = player.university || player.school || '';
  const department = player.department || '';
  const chessUsername = player.chess_username || player.username || '';
  const lichessUsername = player.lichess_username || '';

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
                  {schoolName} ↗
                </button>
              ) : (
                <p className="text-xs font-semibold text-gray-400 mt-1">SS4 Individual Player</p>
              )}

              {department && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{department}</p>
              )}
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="bg-brand-bg-cream/40 rounded-2xl p-4 border border-gray-150 flex flex-wrap gap-x-6 gap-y-3">
            <div>
              <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Chess.com Handle</span>
              <a 
                href={`https://www.chess.com/member/${chessUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-text-dark hover:text-brand-primary transition-colors flex items-center gap-1 mt-0.5"
              >
                @{chessUsername} ↗
              </a>
            </div>

            {lichessUsername && (
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Lichess Handle</span>
                <a 
                  href={`https://lichess.org/@/${lichessUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-text-dark hover:text-brand-primary transition-colors flex items-center gap-1 mt-0.5"
                >
                  @{lichessUsername} ↗
                </a>
              </div>
            )}

            <div className="ml-auto flex items-center">
              {player.id && player.id !== user?.id && (
                <button 
                  onClick={handleMessageClick}
                  className="px-4 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-accent transition-colors shadow-sm cursor-pointer"
                >
                  Message
                </button>
              )}
            </div>
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
                <span className="block text-[10px] font-black text-brand-primary uppercase mt-2.5 tracking-wider truncate" title={titles}>{titles}</span>
              </div>
            </div>
          </div>

          {/* Core Game Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-150 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-brand-text-dark font-space">{gamesPlayed}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 block">Played</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-emerald-600 font-space">{wins}</span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 block">Wins</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-amber-600 font-space">{draws}</span>
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5 block">Draws</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-rose-600 font-space">{losses}</span>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5 block">Losses</span>
            </div>
            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-brand-primary font-space">{winRate}%</span>
              <span className="text-[9px] font-black text-brand-primary/75 uppercase tracking-widest mt-0.5 block">Win Rate</span>
            </div>
            <div className="bg-white border border-gray-150 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-xl font-black text-brand-text-dark font-space">{appearances}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 block">Cups</span>
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
