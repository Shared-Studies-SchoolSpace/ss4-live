import React from 'react';
import { VARSITY_TEAMS } from '../../data/varsityData';

export const TeamCards = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-brand-primary text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white/15 text-white text-[10px] font-space font-black px-3 py-1 rounded-md uppercase tracking-wider">
            SS4 Varsity League &bull; Season 1
          </span>
          <h2 className="text-xl md:text-2xl font-space font-black mt-2">University Squad Rosters &amp; Performance</h2>
          <p className="text-xs text-blue-50 mt-1 font-medium">
            Top 5 chess players representing Nigeria&apos;s academic institutions in Season 1.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/15 px-4 py-2 rounded-2xl text-xs font-bold text-white">
          <span>{VARSITY_TEAMS.length} Participating Universities</span>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VARSITY_TEAMS.map(team => (
          <div
            key={team.id}
            className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(26,86,196,0.08)] transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Team Header */}
              <div className="flex items-start justify-between gap-3 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-12 h-12 rounded-2xl object-cover shadow-2xs"
                  />
                  <div>
                    <h3 className="font-space font-black text-brand-text-dark text-base leading-snug">{team.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{team.nickname}</p>
                  </div>
                </div>
                <span className="bg-[#E8EFFF] text-brand-primary text-xs font-space font-black px-2.5 py-1 rounded-xl uppercase">
                  {team.shortName}
                </span>
              </div>

              {/* Stat Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-[#F6F4F0] p-3 rounded-2xl mb-4 text-center">
                <div>
                  <div className="text-[10px] font-space font-extrabold text-slate-400 uppercase">Points</div>
                  <div className="text-lg font-space font-black text-brand-primary tabular-nums">{team.points}</div>
                </div>
                <div>
                  <div className="text-[10px] font-space font-extrabold text-slate-400 uppercase">W - D - L</div>
                  <div className="text-xs font-space font-black text-brand-text-dark mt-1 tabular-nums">
                    {team.record.wins}-{team.record.draws}-{team.record.losses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-space font-extrabold text-slate-400 uppercase">Avg Rating</div>
                  <div className="text-xs font-space font-black text-brand-text-dark mt-1 tabular-nums">{team.averageRating}</div>
                </div>
              </div>

              {/* Momentum Indicator Dots */}
              <div className="flex items-center justify-between bg-[#E8EFFF] text-brand-primary p-3 rounded-2xl mb-5">
                <span className="text-xs font-bold text-[#00194B]">Recent Momentum</span>
                <div className="flex items-center gap-1.5">
                  {team.recentForm.map((result, idx) => (
                    <span
                      key={idx}
                      title={`Match ${idx + 1}: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                        result === 'W'
                          ? 'bg-emerald-600'
                          : result === 'D'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5-Player Assigned Roster */}
              <div>
                <h4 className="text-xs font-space font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
                  Assigned Varsity Roster (5 Boards)
                </h4>
                <div className="space-y-2">
                  {team.players.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-[#F6F4F0] hover:bg-[#EBE9E4] p-2.5 rounded-xl transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white text-slate-700 font-space font-extrabold text-[10px] flex items-center justify-center">
                          B{player.board}
                        </span>
                        <div>
                          <div className="font-bold text-brand-text-dark">{player.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">@{player.handle}</div>
                        </div>
                      </div>
                      <span className="font-space font-black text-brand-primary bg-white px-2 py-0.5 rounded-md shadow-2xs tabular-nums">
                        {player.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
