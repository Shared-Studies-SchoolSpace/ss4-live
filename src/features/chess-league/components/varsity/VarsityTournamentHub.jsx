import React, { useState } from 'react';
import { PlayerDirectory } from './PlayerDirectory';
import { TeamCards } from './TeamCards';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { GameRecordsTable } from './GameRecordsTable';

export const VarsityTournamentHub = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'teams' | 'standings' | 'records'

  const tabs = [
    {
      id: 'directory',
      label: 'Players Directory',
      desc: 'Browse university rosters & flip stats cards',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'teams',
      label: 'University Squads',
      desc: 'Varsity team cards, momentum & 5-board lineups',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'standings',
      label: 'League Standings',
      desc: 'Round-by-round points & form guides',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'records',
      label: 'Game Records',
      desc: 'Historical match log & external game board links',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Top Banner (Brand Blue & Brand Orange) */}
      <div className="bg-brand-primary text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-md border border-brand-primary/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-accent/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-brand-accent text-white font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-3 shadow-2xs">
            <span>SS4 Chess League</span>
            <span>•</span>
            <span>Varsity Arena</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Nigerian University Varsity Chess League
          </h1>
          <p className="text-sm text-blue-50 font-medium mt-2 leading-relaxed">
            Central command center for top university chess rosters, standings, match tracking, and board stats from Unilorin, UNICAL, Uniuyo, UNILAG, OAU, and ABU Zaria.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs no-scrollbar">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[200px] text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 font-bold'
              }`}
            >
              <span className={`mt-0.5 ${isActive ? 'text-brand-accent' : 'text-brand-primary'}`}>
                {tab.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-snug">{tab.label}</div>
                <div className={`text-[11px] font-medium mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content Renderer */}
      <div className="transition-all duration-300">
        {activeTab === 'directory' && <PlayerDirectory />}
        {activeTab === 'teams' && <TeamCards />}
        {activeTab === 'standings' && <LeagueStandingsTable />}
        {activeTab === 'records' && <GameRecordsTable />}
      </div>
    </div>
  );
};

export default VarsityTournamentHub;
