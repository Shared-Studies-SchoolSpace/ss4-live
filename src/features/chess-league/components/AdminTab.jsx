import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../supabase';
import { playerLabel } from '../utils/chessUtils';
import AdminBroadcastPanel from '../../../components/announcements/AdminBroadcastPanel';

export const AdminTab = ({
  isAdmin,
  newDivName,
  setNewDivName,
  newDivPlayers,
  setNewDivPlayers,
  handleCreateDivision,
  divisions,
  selectedDivisionId,
  setSelectedDivisionId,
  handleAdminToggle,
  handleCreateFixtures,
  currentDivision,
  handleDeleteRound,
  handleRestoreRound,
  handleSyncPlayers,
  handleUpdatePlayer
}) => {
  if (!isAdmin) return null;

  const [adminSubTab, setAdminSubTab] = useState('roster'); // 'roster' | 'fixtures' | 'timer' | 'divisions'
  const [newRoundDate, setNewRoundDate] = useState('');
  
  // Countdown Timer Config State
  const [nextRoundStartInput, setNextRoundStartInput] = useState('');
  const [nextRoundLabelInput, setNextRoundLabelInput] = useState('Round of 32');
  const [isSavingTimer, setIsSavingTimer] = useState(false);

  // Player CRUD state
  const [newPlayer, setNewPlayer] = useState({ name: '', username: '', department: '', school: '', contact: '' });
  const [editingPlayerUsername, setEditingPlayerUsername] = useState(null);
  const [editPlayerForm, setEditPlayerForm] = useState({ name: '', username: '', department: '', school: '', contact: '' });

  // Fixture CRUD state
  const [expandedRound, setExpandedRound] = useState(null);
  const [newFixture, setNewFixture] = useState({ white: '', black: '' });

  // Modal confirmation dialog state
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });

  const askConfirmation = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const closeConfirmation = () => {
    setConfirmModal({ open: false, title: '', message: '', action: null });
  };

  const handleSaveTimerConfig = async () => {
    if (!nextRoundStartInput) {
      toast.error('Please select a valid date and time');
      return;
    }
    setIsSavingTimer(true);
    try {
      const isoDate = new Date(nextRoundStartInput).toISOString();
      // 1. Update in active division if available
      if (currentDivision && currentDivision.id) {
        const updatedRounds = (currentDivision.rounds || []).map((r, idx, arr) => {
          if (idx === arr.length - 1) {
            return { ...r, next_round_start: isoDate, next_round_label: nextRoundLabelInput };
          }
          return r;
        });
        await supabase.from('divisions').update({ rounds: updatedRounds }).eq('id', currentDivision.id);
      }

      // 2. Update active tournament in tournaments table
      const { data: activeTournaments } = await supabase
        .from('tournaments')
        .select('id, month_year')
        .or('status.eq.active,status.eq.upcoming')
        .order('month_year', { ascending: false })
        .limit(1);

      if (activeTournaments && activeTournaments.length > 0) {
        await supabase
          .from('tournaments')
          .update({
            next_round_start: isoDate,
            next_round_label: nextRoundLabelInput
          })
          .eq('id', activeTournaments[0].id);
      }

      toast.success('Tournament countdown schedule saved!', { theme: 'dark' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to save countdown schedule');
    } finally {
      setIsSavingTimer(false);
    }
  };

  // --- Player Management Handlers ---
  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.username) {
      toast.error('Name and Username are required'); return;
    }
    if (currentDivision.players.some(p => p.username === newPlayer.username)) {
      toast.error('Player with this username already exists'); return;
    }
    const updatedPlayers = [...currentDivision.players, { ...newPlayer }];
    try {
      await supabase.from('divisions').update({ players: updatedPlayers }).eq('id', currentDivision.id);
      setNewPlayer({ name: '', username: '', department: '', school: '', contact: '' });
      toast.success('Player added successfully!', { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to add player');
    }
  };

  const handleDeletePlayer = (username) => {
    askConfirmation(
      'Archive Player',
      `Are you sure you want to archive @${username}? They will be hidden from active standings.`,
      async () => {
        const updatedPlayers = currentDivision.players.map(p => 
          p.username === username ? { ...p, hidden: true } : p
        );
        try {
          await supabase.from('divisions').update({ players: updatedPlayers }).eq('id', currentDivision.id);
          toast.warn('Player archived successfully');
        } catch (e) {
          toast.error('Failed to archive player');
        }
      }
    );
  };

  const handleRestorePlayer = async (username) => {
    const updatedPlayers = currentDivision.players.map(p => 
      p.username === username ? { ...p, hidden: false } : p
    );
    try {
      await supabase.from('divisions').update({ players: updatedPlayers }).eq('id', currentDivision.id);
      toast.success('Player restored successfully!');
    } catch (e) {
      toast.error('Failed to restore player');
    }
  };

  const startEditPlayer = (p) => {
    setEditingPlayerUsername(p.username);
    setEditPlayerForm({ name: p.name, username: p.username, department: p.department || '', school: p.school || '', contact: p.contact || '' });
  };

  const saveEditPlayer = async () => {
    if (!editPlayerForm.name || !editPlayerForm.username) {
      toast.error('Name and Username are required'); return;
    }
    if (!editingPlayerUsername) return;
    try {
      await handleUpdatePlayer(editingPlayerUsername, editPlayerForm);
      setEditingPlayerUsername(null);
    } catch (e) {
      // Errors handled in parent
    }
  };

  // --- Fixture Management Handlers ---
  const handleAddFixture = async (roundNum) => {
    if (!newFixture.white || !newFixture.black) {
      toast.error('Please select both White and Black players'); return;
    }
    if (newFixture.white === newFixture.black) {
      toast.error('A player cannot play against themselves'); return;
    }
    
    const updatedRounds = currentDivision.rounds.map(r => {
      if (r.round === roundNum) {
        const exists = r.games.some(g => (g[0] === newFixture.white && g[1] === newFixture.black) || (g[0] === newFixture.black && g[1] === newFixture.white));
        if (exists) {
          toast.error('Fixture already exists in this round');
          return r;
        }
        return { ...r, games: [...r.games, [newFixture.white, newFixture.black]] };
      }
      return r;
    });

    try {
      await supabase.from('divisions').update({ rounds: updatedRounds }).eq('id', currentDivision.id);
      setNewFixture({ white: '', black: '' });
      toast.success('Fixture added');
    } catch (e) {
      toast.error('Failed to add fixture');
    }
  };

  const handleDeleteFixture = (roundNum, white, black) => {
    askConfirmation(
      'Delete Fixture',
      `Delete match ${white.split(' (')[0]} vs ${black.split(' (')[0]} in Round ${roundNum}? Results for it will be lost.`,
      async () => {
        const updatedRounds = currentDivision.rounds.map(r => {
          if (r.round === roundNum) {
            return { ...r, games: r.games.filter(g => !(g[0] === white && g[1] === black)) };
          }
          return r;
        });

        try {
          await supabase.from('divisions').update({ rounds: updatedRounds }).eq('id', currentDivision.id);
          toast.warn('Fixture removed');
        } catch (e) {
          toast.error('Failed to delete fixture');
        }
      }
    );
  };

  const playerOptions = currentDivision.players.filter(p => !p.hidden).map(p => playerLabel(p));

  const inputClass = "w-full px-4 py-2.5 min-h-[44px] text-sm text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-400 transition-all";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5";

  const activeRoundsList = (currentDivision.rounds || []).filter(r => !r.hidden);
  const archivedRoundsList = (currentDivision.rounds || []).filter(r => r.hidden);

  return (
    <div className="w-full space-y-8">
      
      {/* ── Universal Admin Broadcast Surface ── */}
      <AdminBroadcastPanel />

      {/* Admin Sub-Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-2 border border-gray-100 rounded-2xl shadow-sm select-none">
        <button
          onClick={() => setAdminSubTab('roster')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            adminSubTab === 'roster' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Roster ({currentDivision.players ? currentDivision.players.length : 0})
        </button>
        <button
          onClick={() => setAdminSubTab('fixtures')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            adminSubTab === 'fixtures' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Rounds &amp; Pairings
        </button>
        <button
          onClick={() => setAdminSubTab('timer')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            adminSubTab === 'timer' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          ⏱️ Timer &amp; Schedule
        </button>
        <button
          onClick={() => setAdminSubTab('divisions')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            adminSubTab === 'divisions' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Divisions &amp; System
        </button>
      </div>

      {/* SUB-TAB 1: ROSTER MANAGEMENT */}
      {adminSubTab === 'roster' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm animate-in fade-in duration-150">
          <h3 className="font-space text-lg font-black text-[#111111] mb-6 pb-3 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Manage Division Players</span>
            <span className="text-sm font-bold text-brand-accent bg-brand-accent/5 px-3 py-1 rounded-full w-fit">{currentDivision.name}</span>
          </h3>
          
          {/* Add Player Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" placeholder="e.g. John Doe" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Chess.com Username</label>
              <input type="text" placeholder="e.g. jdoe12" value={newPlayer.username} onChange={e => setNewPlayer({...newPlayer, username: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Contact</label>
              <input type="text" placeholder="e.g. 8139732276" value={newPlayer.contact} onChange={e => setNewPlayer({...newPlayer, contact: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input type="text" placeholder="e.g. Computer Engineering" value={newPlayer.department} onChange={e => setNewPlayer({...newPlayer, department: e.target.value})} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>School Name</label>
              <input type="text" placeholder="e.g. UniUyo" value={newPlayer.school} onChange={e => setNewPlayer({...newPlayer, school: e.target.value})} className={inputClass} />
            </div>
          </div>
          
          <button 
            className="w-full sm:w-auto min-h-[44px] bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer flex items-center justify-center mb-8"
            onClick={handleAddPlayer}
          >
            + Add Player
          </button>

          {/* Player List */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto divide-y divide-gray-50 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            {currentDivision.players.filter(p => !p.hidden).map(p => (
              <div key={p.username} className="p-4 hover:bg-brand-bg-cream/10 transition-colors">
                {editingPlayerUsername === p.username ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <input type="text" value={editPlayerForm.name} onChange={e => setEditPlayerForm({...editPlayerForm, name: e.target.value})} className={inputClass} placeholder="Name" />
                      <input type="text" value={editPlayerForm.username} onChange={e => setEditPlayerForm({...editPlayerForm, username: e.target.value})} className={inputClass} placeholder="Username" />
                      <input type="text" value={editPlayerForm.contact} onChange={e => setEditPlayerForm({...editPlayerForm, contact: e.target.value})} className={inputClass} placeholder="Contact" />
                      <input type="text" value={editPlayerForm.department} onChange={e => setEditPlayerForm({...editPlayerForm, department: e.target.value})} className={inputClass} placeholder="Department" />
                      <input type="text" value={editPlayerForm.school} onChange={e => setEditPlayerForm({...editPlayerForm, school: e.target.value})} className={inputClass} placeholder="School" />
                    </div>
                    <div className="flex gap-2 self-start w-full sm:w-auto">
                      <button className="flex-1 sm:flex-initial min-h-[44px] bg-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center" onClick={saveEditPlayer}>Save</button>
                      <button className="flex-1 sm:flex-initial min-h-[44px] bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center" onClick={() => setEditingPlayerUsername(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-[#111111]">{p.name}</span>
                      <span className="text-xs font-bold text-brand-primary ml-2">@{p.username}</span>
                      <div className="text-[11px] font-bold text-gray-400 mt-1">
                        {p.department && <span>{p.department}</span>}
                        {p.department && p.school && <span> &bull; </span>}
                        {p.school && <span>{p.school}</span>}
                        {p.contact && <span> &bull; WhatsApp: {p.contact}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-initial min-h-[44px] bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center" onClick={() => startEditPlayer(p)}>Edit</button>
                      <button className="flex-1 sm:flex-initial min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center" onClick={() => handleDeletePlayer(p.username)}>Archive</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Archived Players list */}
          {currentDivision.players.some(p => p.hidden) && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Archived Players (Hidden)</h4>
              <div className="border border-dashed border-gray-200 rounded-2xl overflow-hidden max-h-[200px] overflow-y-auto divide-y divide-gray-50 bg-gray-50/20 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                {currentDivision.players.filter(p => p.hidden).map(p => (
                  <div key={p.username} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-gray-400 line-through">{p.name}</span>
                      <span className="text-xs font-bold text-gray-400 ml-2">@{p.username}</span>
                    </div>
                    <button 
                      className="w-full sm:w-auto min-h-[44px] bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center" 
                      onClick={() => handleRestorePlayer(p.username)}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: ROUNDS & FIXTURES */}
      {adminSubTab === 'fixtures' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm animate-in fade-in duration-150">
          <h3 className="font-space text-lg font-black text-[#111111] mb-6 pb-3 border-b border-gray-50">Manage Rounds &amp; Fixtures</h3>
          
          {/* Create Swiss Pairing Round */}
          <div className="bg-brand-bg-cream/40 rounded-3xl p-4 sm:p-6 border border-gray-100 mb-8 space-y-4">
            <p className="text-sm text-gray-700 font-bold">Generate Round Fixtures (Swiss Pairing System)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Automatically generates match fixtures for the next round based on current standings. The Swiss system will pair active players of similar standings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Round Date (optional)</label>
                <input 
                  type="date" 
                  value={newRoundDate}
                  onChange={e => setNewRoundDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <button 
              className="w-full sm:w-auto min-h-[44px] bg-brand-primary text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer flex items-center justify-center" 
              onClick={() => {
                handleCreateFixtures(newRoundDate || undefined);
                setNewRoundDate('');
              }}
            >
              Generate Swiss Round Fixtures
            </button>
          </div>

          {/* Rounds Management */}
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Active Rounds</h4>
          {activeRoundsList.length === 0 ? (
            <p className="text-sm text-gray-400 italic mb-8">No active rounds in this division.</p>
          ) : (
            <div className="space-y-4 mb-8">
              {activeRoundsList.map(r => (
                <div key={r.round} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Accordion Trigger */}
                  <div 
                    className="flex flex-wrap items-center justify-between p-4 min-h-[48px] bg-brand-bg-cream/20 hover:bg-brand-bg-cream/40 transition-colors cursor-pointer select-none gap-2"
                    onClick={() => setExpandedRound(expandedRound === r.round ? null : r.round)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold text-[#111111]">Round {r.round}</span>
                      <span className="text-xs font-black text-brand-primary bg-brand-primary/5 px-2.5 py-0.5 rounded-full">{r.date}</span>
                      <span className="text-xs text-gray-400">({r.games.length} games)</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-xs text-brand-accent">{expandedRound === r.round ? '▲' : '▼'}</span>
                      <button 
                        className="min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          askConfirmation(
                            'Archive Round',
                            `Archive Round ${r.round}? It will be hidden from the public fixtures view.`,
                            () => handleDeleteRound(r.round)
                          );
                        }}
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                  
                  {/* Accordion Content */}
                  {expandedRound === r.round && (
                    <div className="p-4 sm:p-5 bg-white border-t border-gray-50 space-y-6">
                      <div>
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Games List</h5>
                        {r.games.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No games configured in this round.</p>
                        ) : (
                          <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                             {r.games.map(([w, b], idx) => (
                              <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200/40 px-3.5 py-2.5 rounded-xl gap-2">
                                <span className="text-xs font-bold text-gray-600 truncate">
                                  <span className="text-brand-primary font-black">W:</span> {w.split(' (')[0]} <span className="text-gray-300 mx-1.5">vs</span> <span className="text-[#111111] font-black">B:</span> {b.split(' (')[0]}
                                </span>
                                <button 
                                  className="w-9 h-9 min-w-[36px] min-h-[36px] text-red-500 hover:text-red-700 hover:bg-red-50 text-base font-black flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0" 
                                  onClick={() => handleDeleteFixture(r.round, w, b)}
                                  title="Delete fixture"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Add Custom Fixture */}
                      <div className="bg-brand-bg-cream/20 p-4 border border-gray-100 rounded-2xl space-y-3">
                        <span className="block text-xs font-bold text-[#111111]">Add Custom Matchup</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select 
                            value={newFixture.white} 
                            onChange={e => setNewFixture({...newFixture, white: e.target.value})} 
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                          >
                            <option value="">-- Select White --</option>
                            {playerOptions.map(opt => <option key={`w-${opt}`} value={opt}>{opt}</option>)}
                          </select>
                          <select 
                            value={newFixture.black} 
                            onChange={e => setNewFixture({...newFixture, black: e.target.value})} 
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                          >
                            <option value="">-- Select Black --</option>
                            {playerOptions.map(opt => <option key={`b-${opt}`} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <button 
                          className="w-full sm:w-auto min-h-[44px] bg-brand-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center" 
                          onClick={() => handleAddFixture(r.round)}
                        >
                          Add Fixture
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Archived Rounds list */}
          {archivedRoundsList.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Archived Rounds (Hidden)</h4>
              <div className="space-y-3">
                {archivedRoundsList.map(r => (
                  <div key={r.round} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 line-through">Round {r.round}</span>
                      <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">{r.date}</span>
                    </div>
                    <button 
                      className="w-full sm:w-auto min-h-[44px] bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center" 
                      onClick={() => handleRestoreRound(r.round)}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: TIMER & SCHEDULE CONFIGURATION */}
      {adminSubTab === 'timer' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-150">
          <h3 className="font-space text-lg font-black text-[#111111] pb-3 border-b border-gray-50 flex items-center gap-2">
            <span>⏱️ Tournament Countdown &amp; Schedule Config</span>
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Configure the launch timestamp and headline for the countdown timer displayed on site-wide banners and page heroes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-bg-cream/20 p-5 rounded-2xl border border-gray-100">
            <div>
              <label className={labelClass}>Next Round Launch Date &amp; Time</label>
              <input
                type="datetime-local"
                value={nextRoundStartInput}
                onChange={e => setNextRoundStartInput(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Countdown Label / Round Stage</label>
              <input
                type="text"
                placeholder="e.g. Round of 32, Quarterfinals, Final"
                value={nextRoundLabelInput}
                onChange={e => setNextRoundLabelInput(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleSaveTimerConfig}
            disabled={isSavingTimer}
            className="w-full sm:w-auto min-h-[44px] bg-brand-primary hover:bg-brand-primary/95 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all text-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {isSavingTimer ? 'Saving Schedule...' : 'Save Countdown Schedule'}
          </button>
        </div>
      )}

      {/* SUB-TAB 4: DIVISIONS & SYSTEM UTILITIES */}
      {adminSubTab === 'divisions' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-150">
          
          <div>
            <h3 className="font-space text-lg font-black text-[#111111] mb-6 pb-3 border-b border-gray-50">Create New Division</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Division Name</label>
                <input 
                  type="text" 
                  value={newDivName} 
                  onChange={e => setNewDivName(e.target.value)} 
                  placeholder="e.g. Knight Division"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Players (one per line, format: Name (username))</label>
                <textarea 
                  rows={5}
                  value={newDivPlayers} 
                  onChange={e => setNewDivPlayers(e.target.value)} 
                  placeholder={"Magnus (Carlsen)\nHikaru (Nakamura)\nFabiano (Caruana)"}
                  className="w-full px-4 py-3 min-h-[120px] text-sm text-[#111111] bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-400 transition-all"
                />
              </div>
            </div>
            <button 
              className="w-full sm:w-auto min-h-[44px] bg-brand-primary text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer flex items-center justify-center"
              onClick={handleCreateDivision}
            >
              Generate Division &amp; Pairings
            </button>
          </div>

          <div>
            <h3 className="font-space text-base font-black text-[#111111] mb-4">Existing Divisions</h3>
            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
              {divisions.map(d => (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-brand-bg-cream/10 transition-colors">
                  <span className="text-sm font-bold text-gray-700">{d.name} <span className="text-xs text-gray-400 font-semibold ml-1">({d.players.length} players)</span></span>
                  <button 
                    className="w-full sm:w-auto min-h-[44px] bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center" 
                    onClick={() => {
                      if (divisions.length === 1) {
                        toast.error('Cannot delete the last division', { theme: 'dark' });
                        return;
                      }
                      askConfirmation(
                        'Delete Division',
                        `Delete ${d.name}? All standings and fixtures in this division will be permanently removed.`,
                        async () => {
                          try {
                            await supabase.from('divisions').delete().eq('id', d.id);
                            if (selectedDivisionId === d.id) {
                              setSelectedDivisionId(divisions.find(div => div.id !== d.id).id);
                            }
                            toast.warn(`Deleted ${d.name}`, { theme: 'dark' });
                          } catch (e) {
                            toast.error('Failed to delete division');
                          }
                        }
                      );
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-bg-cream/20 rounded-2xl p-4 sm:p-6 border border-gray-100 border-dashed space-y-4">
            <h3 className="font-space text-sm font-black text-[#111111]">Database Seeding &amp; Utilities</h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button 
                className="w-full sm:w-auto min-h-[44px] bg-brand-accent text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center" 
                onClick={() => {
                  askConfirmation(
                    'Sync Players with Local Data',
                    'Sync players with the local codebase data? This will update contacts or players hardcoded in static listings.',
                    handleSyncPlayers
                  );
                }}
              >
                Sync Players with Local Data
              </button>
              <button 
                className="w-full sm:w-auto min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center" 
                onClick={handleAdminToggle}
              >
                Lock Admin Panel
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Reusable Styled Modal Confirmation Dialog */}
      {confirmModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={closeConfirmation}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="font-space text-lg font-black text-[#111111] mb-2">{confirmModal.title}</h3>
            <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3 w-full">
              <button 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                onClick={closeConfirmation}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 rounded-xl shadow-sm transition-all cursor-pointer"
                onClick={async () => {
                  const act = confirmModal.action;
                  closeConfirmation();
                  if (act) await act();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
