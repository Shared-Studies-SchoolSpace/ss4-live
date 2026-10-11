import React from 'react';
import { VARSITY_TEAMS } from '../../data/varsityData';

export const TeamCards = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner (Brand Blue & Brand Orange) */}
      <div className="bg-brand-primary text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-brand-primary/20">
        <div>
          <span className="bg-brand-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
            SS4 Varsity League 2026
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-2">University Squad Rosters & Performance</h2>
          <p className="text-xs text-blue-50 mt-1 font-medium">
            Top 5 chess players representing Nigeria's premier academic institutions.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-md text-xs font-bold text-white">
          <span>6 Participating Universities</span>
          <span>•</span>
          <span>30 Varsity Players</span>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VARSITY_TEAMS.map(team => (
          <div
            key={team.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Team Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-snug">{team.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{team.nickname}</p>
                  </div>
                </div>
                <span className="bg-brand-primary/10 text-brand-primary text-xs font-black px-2.5 py-1 rounded-xl uppercase">
                  {team.shortName}
                </span>
              </div>

              {/* Stat Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-5 text-center">
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Points</div>
                  <div className="text-lg font-black text-brand-primary">{team.points}</div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">W - D - L</div>
                  <div className="text-xs font-black text-slate-800 mt-1">
                    {team.record.wins}-{team.record.draws}-{team.record.losses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Avg Rating</div>
                  <div className="text-xs font-black text-slate-800 mt-1">{team.averageRating}</div>
                </div>
              </div>

              {/* Momentum Indicator Dots (Brand Primary & Brand Accent) */}
              <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/20 text-brand-primary p-3 rounded-2xl mb-5">
                <span className="text-xs font-bold text-brand-primary">Recent Momentum</span>
                <div className="flex items-center gap-1.5">
                  {team.recentForm.map((result, idx) => (
                    <span
                      key={idx}
                      title={`Match ${idx + 1}: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                        result === 'W'
                          ? 'bg-emerald-500'
                          : result === 'D'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5-Player Assigned Roster */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
                  Assigned Varsity Roster (5 Boards)
                </h4>
                <div className="space-y-2">
                  {team.players.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-50/80 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center">
                          B{player.board}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{player.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">@{player.handle}</div>
                        </div>
                      </div>
                      <span className="font-black text-brand-primary bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
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
