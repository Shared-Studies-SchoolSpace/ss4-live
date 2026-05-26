import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Database & Utilities
import { supabase } from '../supabase';
import { players as initialPlayers, pinPlayers } from '../data/chessData';
import { generateRoundRobin, generateSwissNextRound } from '../utils/pairing';
import { playerLabel, gameKey } from '../utils/chessUtils';

// Modular UI Components
import { StandingsTab } from '../components/chess/StandingsTab';
import { ResultsTab } from '../components/chess/ResultsTab';
import { FixturesTab } from '../components/chess/FixturesTab';
import { AdminTab } from '../components/chess/AdminTab';
import { SearchBar } from '../components/chess/SearchBar';
import { SearchResults } from '../components/chess/SearchResults';
import { PlayerProfile } from '../components/chess/PlayerProfile';

// Parent Page Layout Elements
import SectionWrapper from '../components/SectionWrapper';
import { H1 } from '../components/Typography';

const ADMIN_PIN = '1926';

export default function ChessLeaguePage() {
  const [divisions, setDivisions] = useState([]);
  const [gameResults, setGameResults] = useState({});
  const [selectedDivisionId, setSelectedDivisionId] = useState('default');

  // Search and Profile state
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // General Tabs & Admin Mode state
  const [activeTab, setActiveTab] = useState('standings');
  const [currentRound, setCurrentRound] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Division creation state
  const [newDivName, setNewDivName] = useState('');
  const [newDivPlayers, setNewDivPlayers] = useState('');

  // Sync Divisions from Supabase
  useEffect(() => {
    const fetchDivisions = async () => {
      const { data } = await supabase.from('divisions').select('*');
      const currentDivisions = data || [];

      const forkExists = currentDivisions.find(d => d.id === 'default');
      const pinExists = currentDivisions.find(d => d.id === 'pin');

      if (!forkExists) {
        const defaultDiv = {
          id: 'default',
          name: 'Fork Division',
          players: initialPlayers,
          rounds: []
        };
        await supabase.from('divisions').upsert(defaultDiv);
      }

      if (!pinExists) {
        const pinDiv = {
          id: 'pin',
          name: 'Pin Division',
          players: pinPlayers,
          rounds: []
        };
        await supabase.from('divisions').upsert(pinDiv);
      }

      const { data: updatedData } = await supabase.from('divisions').select('*');
      if (updatedData) {
        setDivisions(updatedData);
      }
    };
    fetchDivisions();

    const channel = supabase
      .channel('divisions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'divisions' }, () => {
        fetchDivisions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync Results from Supabase
  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase.from('settings').select('data').eq('id', 'gameResults').maybeSingle();
      if (data && data.data) {
        setGameResults(data.data);
      }
    };
    fetchResults();

    const channel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchResults();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentDivision = useMemo(() => {
    return divisions.find(d => d.id === selectedDivisionId) || divisions[0] || { id: 'default', name: 'Loading...', players: [], rounds: [] };
  }, [divisions, selectedDivisionId]);

  const standings = useMemo(() => {
    if (!currentDivision || !currentDivision.players || currentDivision.players.length === 0) return [];
    
    const stats = {};
    currentDivision.players.filter(p => !p.hidden).forEach(p => {
      const lbl = playerLabel(p);
      stats[lbl] = { 
        label: lbl, 
        name: p.name, 
        username: p.username, 
        department: p.department, 
        school: p.school, 
        contact: p.contact, 
        P: 0, 
        W: 0, 
        D: 0, 
        L: 0, 
        Pts: 0, 
        h2h: {}, 
        history: []
      };
    });

    if (currentDivision.rounds) {
      currentDivision.rounds.filter(r => !r.hidden).forEach(r => {
        r.games.forEach(([w, b]) => {
          if (w === 'BYE' || b === 'BYE') {
            const player = w === 'BYE' ? b : w;
            if (!stats[player]) return;
            stats[player].P++;
            stats[player].W++;
            stats[player].Pts += 3;
            stats[player].history.push('W');
            return;
          }

          if (!stats[w] || !stats[b]) return;
          
          const key = gameKey(currentDivision.id, r.round, w, b);
          const res = gameResults[key];

          if (!res) return;

          stats[w].P++; stats[b].P++;
          if (res === 'white') {
            stats[w].W++; stats[w].Pts += 3; stats[b].L++;
            stats[w].h2h[b] = (stats[w].h2h[b] || 0) + 3;
            stats[w].history.push('W'); stats[b].history.push('L');
          } else if (res === 'draw') {
            stats[w].D++; stats[w].Pts += 1; stats[b].D++; stats[b].Pts += 1;
            stats[w].h2h[b] = (stats[w].h2h[b] || 0) + 1; stats[b].h2h[w] = (stats[b].h2h[w] || 0) + 1;
            stats[w].history.push('D'); stats[b].history.push('D');
          } else {
            stats[b].W++; stats[b].Pts += 3; stats[w].L++;
            stats[b].h2h[w] = (stats[b].h2h[w] || 0) + 3;
            stats[b].history.push('W'); stats[w].history.push('L');
          }
        });
      });
    }

    return Object.values(stats).sort((a, b) => {
      if (b.Pts !== a.Pts) return b.Pts - a.Pts;
      const aVsB = a.h2h[b.label] || 0;
      const bVsA = b.h2h[a.label] || 0;
      if (bVsA !== aVsB) return bVsA - aVsB;
      if (b.W !== a.W) return b.W - a.W;
      if (a.L !== b.L) return a.L - b.L;
      return a.name.localeCompare(b.name);
    });
  }, [gameResults, currentDivision]);

  const handleSetResult = async (key, result) => {
    if (!isAdmin) return;
    
    const nextResults = { ...gameResults };
    if (nextResults[key] === result) delete nextResults[key];
    else nextResults[key] = result;

    try {
      await supabase.from('settings').upsert({ id: 'gameResults', data: nextResults });
      toast.success('Result updated!', { autoClose: 1000, theme: 'dark' });
    } catch (e) {
      toast.error('Failed to update result');
    }
  };

  const [lastTap, setLastTap] = useState(0);
  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      if (activeTab === 'admin') setActiveTab('standings');
      toast.info('Logged out from admin', { theme: 'dark' });
    } else {
      setPinInput('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handleTouchStart = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleAdminToggle();
    }
    setLastTap(now);
  };

  const submitPin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      toast.success('Admin access granted!', { theme: 'dark' });
    } else {
      setPinError('Incorrect PIN. Try again.');
      setPinInput('');
    }
  };

  const handleCreateDivision = async () => {
    if (!newDivName.trim() || !newDivPlayers.trim()) {
      toast.error('Please enter division name and players', { theme: 'dark' });
      return;
    }

    const playerNames = newDivPlayers.split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (playerNames.length < 2) {
      toast.error('At least 2 players required', { theme: 'dark' });
      return;
    }

    const newPlayers = playerNames.map(name => {
      const match = name.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return { name: match[1].trim(), username: match[2].trim() };
      }
      return { name, username: name.toLowerCase().replace(/\s+/g, '_') };
    });

    const labels = newPlayers.map(p => playerLabel(p));
    const generatedRounds = generateRoundRobin(labels);

    const newId = Date.now().toString();
    const newDiv = {
      id: newId,
      name: newDivName,
      players: newPlayers,
      rounds: generatedRounds
    };

    try {
      await supabase.from('divisions').insert(newDiv);
      setNewDivName('');
      setNewDivPlayers('');
      setSelectedDivisionId(newId);
      toast.success(`Division "${newDivName}" generated!`, { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to create division');
    }
  };

  const handleCreateFixtures = async (dateStr) => {
    if (!isAdmin) return;

    let lastPlayedRound = 0;
    (currentDivision.rounds || []).forEach(r => {
      const anyResult = r.games.some(([w, b]) => gameResults[gameKey(currentDivision.id, r.round, w, b)]);
      if (anyResult) lastPlayedRound = Math.max(lastPlayedRound, r.round);
    });

    const nextRoundNum = lastPlayedRound + 1;
    const playersLabels = currentDivision.players.filter(p => !p.hidden).map(p => playerLabel(p));
    const previousRounds = currentDivision.rounds.filter(r => r.round <= lastPlayedRound);

    const nextGames = generateSwissNextRound(playersLabels, previousRounds, gameResults, currentDivision.id);

    // Determine date: use provided date or 2 days after the last round
    let roundDate = dateStr;
    if (!roundDate) {
      if (currentDivision.rounds && currentDivision.rounds.length > 0) {
        const lastRound = currentDivision.rounds[currentDivision.rounds.length - 1];
        const lastDateRaw = lastRound.date;
        const parsedDate = new Date(lastDateRaw);
        const isValid = !isNaN(parsedDate.getTime());
        if (isValid) {
          parsedDate.setDate(parsedDate.getDate() + 2);
          roundDate = parsedDate.toISOString().split('T')[0];
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          roundDate = d.toISOString().split('T')[0];
        }
      } else {
        roundDate = new Date().toISOString().split('T')[0];
      }
    }

    const newRound = {
      round: nextRoundNum,
      date: roundDate,
      games: nextGames
    };

    const newRounds = [...currentDivision.rounds.filter(r => r.round <= lastPlayedRound), newRound];

    try {
      await supabase.from('divisions').update({ rounds: newRounds }).eq('id', currentDivision.id);
      toast.success(`Round ${nextRoundNum} fixtures created using Swiss system!`, { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to create fixtures');
    }
  };

  const handleSyncPlayers = async () => {
    if (!isAdmin) return;
    try {
      if (currentDivision.id === 'default') {
        await supabase.from('divisions').update({ players: initialPlayers }).eq('id', 'default');
      } else if (currentDivision.id === 'pin') {
        await supabase.from('divisions').update({ players: pinPlayers }).eq('id', 'pin');
      } else {
        toast.error('Can only sync Fork or Pin divisions with local static listings');
        return;
      }
      toast.success('Players synced with local listings successfully!', { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to sync players');
    }
  };

  const handleUpdatePlayer = async (oldUsername, updatedPlayer) => {
    if (!isAdmin) return;
    
    const oldPlayer = currentDivision.players.find(p => p.username === oldUsername);
    if (!oldPlayer) {
      toast.error('Player not found');
      return;
    }
    
    const oldLabel = playerLabel(oldPlayer);
    const newLabel = playerLabel(updatedPlayer);
    
    const updatedPlayers = currentDivision.players.map(p => 
      p.username === oldUsername ? { ...updatedPlayer } : p
    );
    
    const updatedRounds = (currentDivision.rounds || []).map(r => ({
      ...r,
      games: r.games.map(([w, b]) => {
        const newW = w === oldLabel ? newLabel : w;
        const newB = b === oldLabel ? newLabel : b;
        return [newW, newB];
      })
    }));
    
    const nextResults = { ...gameResults };
    let resultsChanged = false;
    (currentDivision.rounds || []).forEach(r => {
      r.games.forEach(([w, b]) => {
        if (w === oldLabel || b === oldLabel) {
          const oldKey = gameKey(currentDivision.id, r.round, w, b);
          const res = nextResults[oldKey];
          if (res !== undefined) {
            const newW = w === oldLabel ? newLabel : w;
            const newB = b === oldLabel ? newLabel : b;
            const newKey = gameKey(currentDivision.id, r.round, newW, newB);
            nextResults[newKey] = res;
            delete nextResults[oldKey];
            resultsChanged = true;
          }
        }
      });
    });
    
    try {
      await supabase.from('divisions').update({ 
        players: updatedPlayers, 
        rounds: updatedRounds 
      }).eq('id', currentDivision.id);
      
      if (resultsChanged) {
        await supabase.from('settings').upsert({ id: 'gameResults', data: nextResults });
      }
      
      toast.success('Player updated and historical games synced!', { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to update player');
      throw e;
    }
  };

  const handleDeleteRound = async (roundNum) => {
    if (!isAdmin) return;

    const newRounds = currentDivision.rounds.map(r => 
      r.round === roundNum ? { ...r, hidden: true } : r
    );

    try {
      await supabase.from('divisions').update({ rounds: newRounds }).eq('id', currentDivision.id);
      
      if (currentRound === roundNum) {
        const activeRounds = newRounds.filter(r => !r.hidden);
        if (activeRounds.length > 0) {
          setCurrentRound(activeRounds[0].round);
        } else {
          setCurrentRound(1);
        }
      }
      
      toast.warn(`Round ${roundNum} hidden`, { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to hide round');
    }
  };

  const handleRestoreRound = async (roundNum) => {
    if (!isAdmin) return;
    const newRounds = currentDivision.rounds.map(r => 
      r.round === roundNum ? { ...r, hidden: false } : r
    );
    try {
      await supabase.from('divisions').update({ rounds: newRounds }).eq('id', currentDivision.id);
      toast.success(`Round ${roundNum} restored`, { theme: 'dark' });
    } catch (e) {
      toast.error('Failed to restore round');
    }
  };

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <ToastContainer position="bottom-right" />
      
      {/* Hero Banner Section */}
      <SectionWrapper variant="default" py="8 md:py-16" className="bg-[#1A56C4]/5 border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none" 
                onDoubleClick={handleAdminToggle} 
                onTouchStart={handleTouchStart}
              >
                <span className="text-xs font-black tracking-[0.25em] uppercase text-brand-accent">SS4 Network League</span>
                <span className="text-[10px] bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              <H1 className="mb-2 tracking-tight">SS4 Chess League</H1>
              <p className="text-sm font-semibold text-gray-500 italic">"Think Deep, Play True &bull; The Board Remembers"</p>
            </div>
            
            <div className="flex items-center gap-4">
              <SearchBar 
                allPlayers={standings} 
                onPlayerSelect={(p) => setSelectedPlayer(p)} 
                onFullSearch={(results) => setSearchResults(results)} 
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Main Core Section */}
      <SectionWrapper variant="default" py="8 md:py-12" className="container mx-auto max-w-6xl px-4 md:px-0">
        
        {!searchResults && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Division Selector */}
            <div className="flex items-center gap-3 bg-white border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Division:</span>
              <select 
                value={selectedDivisionId} 
                onChange={(e) => {
                  setSelectedDivisionId(e.target.value);
                  setCurrentRound(1);
                }}
                className="text-sm font-bold text-[#111111] bg-transparent outline-none border-none pr-6 cursor-pointer"
              >
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Division Info Panel */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-xs font-bold text-gray-400">
                <span className="font-black text-[#111111]">{currentDivision.players ? currentDivision.players.length : 0}</span> Players
              </div>
              <div className="text-xs font-bold text-gray-400">
                <span className="font-black text-[#111111]">{currentDivision.rounds ? currentDivision.rounds.length : 0}</span> Rounds
              </div>
              <div className="text-xs font-bold text-gray-400">
                Win = <span className="font-black text-[#111111]">3</span> &middot; Draw = <span className="font-black text-[#111111]">1</span> &middot; Loss = <span className="font-black text-[#111111]">0</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200/80 gap-6 mb-8 overflow-x-auto select-none">
          <button 
            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'standings' && !searchResults
                ? 'border-brand-primary text-brand-primary font-black' 
                : 'border-transparent text-gray-400 hover:text-[#111111]'
            }`} 
            onClick={() => { setActiveTab('standings'); setSearchResults(null); }}
          >
            Standings
          </button>
          <button 
            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'fixtures' && !searchResults
                ? 'border-brand-primary text-brand-primary font-black' 
                : 'border-transparent text-gray-400 hover:text-[#111111]'
            }`} 
            onClick={() => { setActiveTab('fixtures'); setSearchResults(null); }}
          >
            Fixtures
          </button>
          <button 
            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'results' && !searchResults
                ? 'border-brand-primary text-brand-primary font-black' 
                : 'border-transparent text-gray-400 hover:text-[#111111]'
            }`} 
            onClick={() => { setActiveTab('results'); setSearchResults(null); }}
          >
            Results
          </button>
          {isAdmin && (
            <button 
              className={`pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'admin' && !searchResults
                  ? 'border-brand-primary text-brand-primary font-black' 
                  : 'border-transparent text-gray-400 hover:text-[#111111]'
              }`} 
              onClick={() => { setActiveTab('admin'); setSearchResults(null); }}
            >
              Manage League
            </button>
          )}
        </div>

        {/* Dynamic Sub-tab Views */}
        {searchResults ? (
          <SearchResults 
            results={searchResults} 
            onPlayerSelect={(p) => setSelectedPlayer(p)} 
            onClose={() => setSearchResults(null)} 
          />
        ) : (
          <div className="w-full animate-in fade-in duration-200">
            {activeTab === 'standings' && <StandingsTab standings={standings} onPlayerSelect={(p) => setSelectedPlayer(p)} />}
            {activeTab === 'results' && (
              <ResultsTab 
                isAdmin={isAdmin}
                currentDivision={currentDivision}
                currentRound={currentRound}
                setCurrentRound={setCurrentRound}
                gameResults={gameResults}
                handleSetResult={handleSetResult}
              />
            )}
            {activeTab === 'fixtures' && <FixturesTab currentDivision={currentDivision} gameResults={gameResults} />}
            {activeTab === 'admin' && (
              <AdminTab 
                isAdmin={isAdmin}
                newDivName={newDivName}
                setNewDivName={setNewDivName}
                newDivPlayers={newDivPlayers}
                setNewDivPlayers={setNewDivPlayers}
                handleCreateDivision={handleCreateDivision}
                divisions={divisions}
                selectedDivisionId={selectedDivisionId}
                setSelectedDivisionId={setSelectedDivisionId}
                handleAdminToggle={handleAdminToggle}
                handleCreateFixtures={handleCreateFixtures}
                currentDivision={currentDivision}
                handleDeleteRound={handleDeleteRound}
                handleRestoreRound={handleRestoreRound}
                handleSyncPlayers={handleSyncPlayers}
                handleUpdatePlayer={handleUpdatePlayer}
              />
            )}
          </div>
        )}
      </SectionWrapper>

      {/* Floating Detailed Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}

      {/* Admin Key authentication PIN overlay modal */}
      {showPinModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => setShowPinModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black font-space text-[#111111] mb-2">🔐 Admin Login</h3>
            <p className="text-xs text-gray-500 font-semibold mb-6">Enter your 4-digit PIN to manage pairings and record results.</p>
            
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="&bull; &bull; &bull; &bull;"
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(''); }}
              onKeyDown={e => e.key === 'Enter' && submitPin()}
              autoFocus
              className={`w-40 text-center px-4 py-3 text-lg font-black tracking-[0.4em] bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary mb-2 ${
                pinError ? 'border-red-300 text-red-500 bg-red-50/50' : ''
              }`}
            />
            
            {pinError && <div className="text-xs font-bold text-red-500 mb-4">{pinError}</div>}
            
            <div className="flex gap-3 w-full mt-4">
              <button 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
                onClick={() => setShowPinModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
                onClick={submitPin}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
