import React from 'react';

/**
 * SCLFixtureCard
 * Standardized competitive sports fixture presentation component.
 * Follows SS4 deep blue (#0B1B3D / #155baa) and vibrant orange (#E8640A) identity.
 * Replaces old ad-hoc flyer graphics with clean, professional sports broadcast fixtures.
 */
export default function SCLFixtureCard({
  tournament = 'SS4 Chess League',
  stage = 'Match Fixture',
  date = '',
  time = '8:00 PM WAT',
  platform = 'Lichess',
  p1 = { name: 'Player 1', username: '', school: '', rating: 1500, score: null },
  p2 = { name: 'Player 2', username: '', school: '', rating: 1500, score: null },
  status = 'completed', // 'completed' | 'live' | 'upcoming'
  winner = null, // 'p1' | 'p2' | 'draw' | null | username
  gameLink = '',
  board = null,
  format = '5+0 Blitz'
}) {
  const p1IsWinner = winner === 'p1' || (typeof winner === 'string' && p1.username && winner.toLowerCase() === p1.username.toLowerCase()) || (p1.score != null && p2.score != null && p1.score > p2.score);
  const p2IsWinner = winner === 'p2' || (typeof winner === 'string' && p2.username && winner.toLowerCase() === p2.username.toLowerCase()) || (p1.score != null && p2.score != null && p2.score > p1.score);
  const isDraw = winner === 'draw' || (p1.score != null && p2.score != null && p1.score === p2.score && status === 'completed');

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all font-sans my-2">
      {/* Top Bar: SS4 Blue Header with Stage & Status */}
      <div className="bg-gradient-to-r from-[#0B1B3D] via-[#102a70] to-[#155baa] px-4 py-2.5 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-outfit font-black tracking-wider uppercase text-[10px] sm:text-xs text-orange-400">
            {tournament}
          </span>
          <span className="text-white/40">•</span>
          <span className="font-bold uppercase tracking-wider text-[10px] text-white/90">
            {stage} {board ? `• Board ${board}` : ''}
          </span>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          {status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Live Match
            </span>
          ) : status === 'upcoming' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[9px] font-bold uppercase tracking-wider">
              {time}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
              Final
            </span>
          )}
        </div>
      </div>

      {/* Main Opponents Arena Grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 sm:gap-2 items-center">
          {/* Player 1 (Blue / Left Side) */}
          <div className={`sm:col-span-5 flex items-center gap-3 p-2.5 rounded-xl transition-all ${
            p1IsWinner ? 'bg-orange-50/70 border border-orange-200' : 'bg-slate-50/80 border border-transparent'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
              p1IsWinner ? 'bg-[#E8640A] text-white shadow-xs' : 'bg-[#155baa] text-white'
            }`}>
              {p1.name ? p1.name.charAt(0).toUpperCase() : 'P1'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-outfit font-black text-sm text-slate-900 truncate">
                  {p1.name}
                </span>
                {p1IsWinner && (
                  <span className="text-amber-500 text-xs shrink-0" title="Winner">👑</span>
                )}
              </div>
              <p className="text-[11px] font-mono font-semibold text-slate-500 truncate">
                @{p1.username || 'player'} {p1.rating ? `• ${p1.rating} ELO` : ''}
              </p>
              {p1.school && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold truncate max-w-full">
                  {p1.school}
                </span>
              )}
            </div>
            {p1.score != null && (
              <span className={`text-xl font-black font-space px-2.5 py-1 rounded-lg ${
                p1IsWinner ? 'text-[#E8640A] bg-orange-100/60' : 'text-slate-600'
              }`}>
                {p1.score}
              </span>
            )}
          </div>

          {/* VS / Score Divider (Center) */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center py-1">
            <span className="text-[11px] font-black font-mono tracking-widest text-slate-400 uppercase">
              VS
            </span>
          </div>

          {/* Player 2 (Right Side) */}
          <div className={`sm:col-span-5 flex items-center gap-3 p-2.5 rounded-xl transition-all ${
            p2IsWinner ? 'bg-orange-50/70 border border-orange-200' : 'bg-slate-50/80 border border-transparent'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 sm:order-last ${
              p2IsWinner ? 'bg-[#E8640A] text-white shadow-xs' : 'bg-slate-800 text-white'
            }`}>
              {p2.name ? p2.name.charAt(0).toUpperCase() : 'P2'}
            </div>
            <div className="min-w-0 flex-1 sm:text-right">
              <div className="flex items-center gap-1.5 sm:justify-end truncate">
                {p2IsWinner && (
                  <span className="text-amber-500 text-xs shrink-0 sm:order-first" title="Winner">👑</span>
                )}
                <span className="font-outfit font-black text-sm text-slate-900 truncate">
                  {p2.name}
                </span>
              </div>
              <p className="text-[11px] font-mono font-semibold text-slate-500 truncate">
                @{p2.username || 'player'} {p2.rating ? `• ${p2.rating} ELO` : ''}
              </p>
              {p2.school && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold truncate max-w-full">
                  {p2.school}
                </span>
              )}
            </div>
            {p2.score != null && (
              <span className={`text-xl font-black font-space px-2.5 py-1 rounded-lg ${
                p2IsWinner ? 'text-[#E8640A] bg-orange-100/60' : 'text-slate-600'
              }`}>
                {p2.score}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Details & Match Link */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          {date && <span>📅 {date}</span>}
          <span>⏱️ {format}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-200/60 font-semibold text-slate-600 text-[10px]">
            {platform}
          </span>
        </div>

        {gameLink && (
          <a
            href={gameLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#E8640A] hover:text-[#c95307] transition-colors"
          >
            <span>View Game on {platform}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
