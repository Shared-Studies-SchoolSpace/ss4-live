import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase';
import { playerLabel } from '../../utils/chessUtils';

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

  const [newRoundDate, setNewRoundDate] = useState('');
  
  // Player CRUD state
  const [newPlayer, setNewPlayer] = useState({ name: '', username: '', department: '', school: '', contact: '' });
  const [editingPlayerUsername, setEditingPlayerUsername] = useState(null);
  const [editPlayerForm, setEditPlayerForm] = useState({ name: '', username: '', department: '', school: '', contact: '' });

  // Fixture CRUD state
  const [expandedRound, setExpandedRound] = useState(null);
  const [newFixture, setNewFixture] = useState({ white: '', black: '' });

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

  const handleDeletePlayer = async (username) => {
    if (!window.confirm(`Archive player ${username}? This will soft-delete them from standings.`)) return;
    const updatedPlayers = currentDivision.players.map(p => 
      p.username === username ? { ...p, hidden: true } : p
    );
    try {
      await supabase.from('divisions').update({ players: updatedPlayers }).eq('id', currentDivision.id);
      toast.warn('Player archived successfully');
    } catch (e) {
      toast.error('Failed to archive player');
    }
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
      // Errors are handled in handleUpdatePlayer
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
        // Check if fixture already exists
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

  const handleDeleteFixture = async (roundNum, white, black) => {
    if (!window.confirm('Delete this fixture? Results for it will be lost.')) return;
    
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
  };

  const playerOptions = currentDivision.players.filter(p => !p.hidden).map(p => playerLabel(p));

  const inputClass = "w-full px-4 py-2 text-sm text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-400 transition-all";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5";

  const activeRoundsList = (currentDivision.rounds || []).filter(r => !r.hidden);
  const archivedRoundsList = (currentDivision.rounds || []).filter(r => r.hidden);

  return (
    <div className="w-full space-y-8">
      
      {/* ── Manage Players ── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="font-space text-lg font-black text-[#111111] mb-6 pb-3 border-b border-gray-50 flex items-center justify-between">
          <span>Manage Division Players</span>
          <span className="text-sm font-bold text-brand-accent bg-brand-accent/5 px-3 py-1 rounded-full">{currentDivision.name}</span>
        </h3>
        
        {/* Add Player Form */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer mb-8"
          onClick={handleAddPlayer}
        >
          + Add Player
        </button>

        {/* Player List */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto divide-y divide-gray-50">
          {currentDivision.players.filter(p => !p.hidden).map(p => (
            <div key={p.username} className="p-4 hover:bg-brand-bg-cream/10 transition-colors">
              {editingPlayerUsername === p.username ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <input type="text" value={editPlayerForm.name} onChange={e => setEditPlayerForm({...editPlayerForm, name: e.target.value})} className={inputClass} placeholder="Name" />
                    <input type="text" value={editPlayerForm.username} onChange={e => setEditPlayerForm({...editPlayerForm, username: e.target.value})} className={inputClass} placeholder="Username" />
                    <input type="text" value={editPlayerForm.contact} onChange={e => setEditPlayerForm({...editPlayerForm, contact: e.target.value})} className={inputClass} placeholder="Contact" />
                    <input type="text" value={editPlayerForm.department} onChange={e => setEditPlayerForm({...editPlayerForm, department: e.target.value})} className={inputClass} placeholder="Department" />
                    <input type="text" value={editPlayerForm.school} onChange={e => setEditPlayerForm({...editPlayerForm, school: e.target.value})} className={inputClass} placeholder="School" />
                  </div>
                  <div className="flex gap-2 self-start">
                    <button className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer" onClick={saveEditPlayer}>Save</button>
                    <button className="bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer" onClick={() => setEditingPlayerUsername(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <div className="flex gap-2">
                    <button className="bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer" onClick={() => startEditPlayer(p)}>Edit</button>
                    <button className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer" onClick={() => handleDeletePlayer(p.username)}>Archive</button>
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
            <div className="border border-dashed border-gray-200 rounded-2xl overflow-hidden max-h-[200px] overflow-y-auto divide-y divide-gray-50 bg-gray-50/20">
              {currentDivision.players.filter(p => p.hidden).map(p => (
                <div key={p.username} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-400 line-through">{p.name}</span>
                    <span className="text-xs font-bold text-gray-400 ml-2">@{p.username}</span>
                  </div>
                  <button 
                    className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors" 
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

      {/* ── Manage Rounds & Fixtures ── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="font-space text-lg font-black text-[#111111] mb-6 pb-3 border-b border-gray-50">Manage Rounds &amp; Fixtures</h3>
        
        {/* Create Swiss Pairing Round */}
        <div className="bg-brand-bg-cream/40 rounded-3xl p-6 border border-gray-100 mb-8 space-y-4 animate-in fade-in duration-200">
          <p className="text-sm text-gray-700 font-bold">Generate Round Fixtures (Swiss Pairing System)</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Automatically generates match fixtures for the next round based on current standings. The Swiss system will pair active players of similar standings.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
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
          <p className="text-[11px] text-gray-400">
            If left blank, the date will automatically default to 1 day after the last active round (or today if no rounds exist).
          </p>
          <button 
            className="bg-brand-primary text-white font-bold px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer" 
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
                  className="flex items-center justify-between p-4 bg-brand-bg-cream/20 hover:bg-brand-bg-cream/40 transition-colors cursor-pointer select-none"
                  onClick={() => setExpandedRound(expandedRound === r.round ? null : r.round)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#111111]">Round {r.round}</span>
                    <span className="text-xs font-black text-brand-primary bg-brand-primary/5 px-2.5 py-0.5 rounded-full">{r.date}</span>
                    <span className="text-xs text-gray-400">({r.games.length} games)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-accent">{expandedRound === r.round ? '▲' : '▼'}</span>
                    <button 
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteRound(r.round); }}
                    >
                      Archive
                    </button>
                  </div>
                </div>
                
                {/* Accordion Content */}
                {expandedRound === r.round && (
                  <div className="p-5 bg-white border-t border-gray-50 space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Games List</h5>
                      {r.games.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No games configured in this round.</p>
                      ) : (
                        <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                           {r.games.map(([w, b], idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200/40 px-4 py-2 rounded-xl">
                              <span className="text-xs font-bold text-gray-600">
                                <span className="text-brand-primary font-black">W:</span> {w.split(' (')[0]} <span className="text-gray-300 mx-2">vs</span> <span className="text-[#111111] font-black">B:</span> {b.split(' (')[0]}
                              </span>
                              <button 
                                className="text-red-500 hover:text-red-700 text-xs font-black p-1 transition-colors cursor-pointer" 
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
                      <div className="grid sm:grid-cols-2 gap-3">
                        <select 
                          value={newFixture.white} 
                          onChange={e => setNewFixture({...newFixture, white: e.target.value})} 
                          className="w-full px-3 py-2 text-xs text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                          <option value="">-- Select White --</option>
                          {playerOptions.map(opt => <option key={`w-${opt}`} value={opt}>{opt}</option>)}
                        </select>
                        <select 
                          value={newFixture.black} 
                          onChange={e => setNewFixture({...newFixture, black: e.target.value})} 
                          className="w-full px-3 py-2 text-xs text-[#111111] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                          <option value="">-- Select Black --</option>
                          {playerOptions.map(opt => <option key={`b-${opt}`} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <button 
                        className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer" 
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
                <div key={r.round} className="flex justify-between items-center p-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 line-through">Round {r.round}</span>
                    <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">{r.date}</span>
                  </div>
                  <button 
                    className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors" 
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

      {/* ── Create / Delete Divisions ── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        
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
                className="w-full px-4 py-3 text-sm text-[#111111] bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-400 transition-all"
              />
            </div>
          </div>
          <button 
            className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs cursor-pointer"
            onClick={handleCreateDivision}
          >
            Generate Division &amp; Pairings
          </button>
        </div>

        <div>
          <h3 className="font-space text-base font-black text-[#111111] mb-4">Existing Divisions</h3>
          <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
            {divisions.map(d => (
              <div key={d.id} className="flex justify-between items-center p-4 hover:bg-brand-bg-cream/10 transition-colors">
                <span className="text-sm font-bold text-gray-700">{d.name} <span className="text-xs text-gray-400 font-semibold ml-1">({d.players.length} players)</span></span>
                <button 
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer" 
                  onClick={async () => {
                    if (divisions.length === 1) {
                      toast.error('Cannot delete the last division', { theme: 'dark' });
                      return;
                    }
                    if (window.confirm(`Delete ${d.name}?`)) {
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
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-bg-cream/20 rounded-2xl p-6 border border-gray-100 border-dashed space-y-4">
          <h3 className="font-space text-sm font-black text-[#111111]">Database Seeding &amp; Utilities</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className="bg-brand-accent text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer" 
              onClick={() => {
                if (window.confirm('Sync players with the local codebase data? This will add any new contacts or players hardcoded in data.ts for this division.')) {
                  handleSyncPlayers();
                }
              }}
            >
              Sync Players with Local Data
            </button>
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer" 
              onClick={handleAdminToggle}
            >
              Lock Admin Panel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
