import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { toast } from 'react-toastify';

const ADMIN_PIN = '1926';

export function extractLichessArenaId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // Match URLs like https://lichess.org/tournament/O8MFtK4X or https://lichess.org/tournament/O8MFtK4X/results
  const urlMatch = trimmed.match(/lichess\.org\/tournament\/([a-zA-Z0-9_-]{8,12})/);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  
  // Or match raw 8-12 char alphanumeric string
  const idMatch = trimmed.match(/^([a-zA-Z0-9_-]{8,12})$/);
  if (idMatch && idMatch[1]) return idMatch[1];

  return trimmed;
}

export function formatInferredDate(startsAtISO) {
  if (!startsAtISO) return 'Unknown Date';
  try {
    const d = new Date(startsAtISO);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(d);
  } catch {
    return startsAtISO;
  }
}

export function extractLichessHostUsername(input) {
  if (!input) return '';
  const trimmed = input.trim();
  const profileMatch = trimmed.match(/lichess\.org\/@\/([a-zA-Z0-9_-]+)/);
  if (profileMatch && profileMatch[1]) return profileMatch[1];
  
  const atMatch = trimmed.match(/^@([a-zA-Z0-9_-]+)$/);
  if (atMatch && atMatch[1]) return atMatch[1];

  return trimmed;
}

export default function FriendliesAdminModal({ isOpen, onClose, onArenaUpdated }) {
  const [pinInput, setPinInput] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Mode: 'single' | 'host'
  const [activeTab, setActiveTab] = useState('single');

  // Single arena form states
  const [arenaInput, setArenaInput] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [inspectedMeta, setInspectedMeta] = useState(null);
  const [inspectErr, setInspectErr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Host profile importer states
  const [hostInput, setHostInput] = useState('https://lichess.org/@/Jhudex/tournaments');
  const [fetchingHost, setFetchingHost] = useState(false);
  const [hostTournaments, setHostTournaments] = useState([]);
  const [hostErr, setHostErr] = useState('');
  const [isImportingHost, setIsImportingHost] = useState(false);

  // Stored arenas list state
  const [storedArenas, setStoredArenas] = useState([]);
  const [loadingArenas, setLoadingArenas] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPinInput('');
      setPinErr('');
      setIsUnlocked(false);
      setArenaInput('');
      setInspectedMeta(null);
      setInspectErr('');
      setHostTournaments([]);
      setHostErr('');
    }
  }, [isOpen]);

  const handleUnlockPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsUnlocked(true);
      setPinErr('');
      toast.success('Friendlies Admin Unlocked!');
      fetchStoredArenas();
    } else {
      setPinErr('Incorrect PIN');
      setPinInput('');
    }
  };

  const fetchStoredArenas = async () => {
    setLoadingArenas(true);
    try {
      const { data, error } = await supabase
        .from('daily_friendlies_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStoredArenas(data || []);
    } catch (err) {
      console.warn('Could not load stored arenas:', err.message);
    } finally {
      setLoadingArenas(false);
    }
  };

  const handleFetchHostTournaments = async () => {
    const username = extractLichessHostUsername(hostInput);
    if (!username) {
      setHostErr('Please enter a valid Lichess user profile URL or username.');
      return;
    }

    setFetchingHost(true);
    setHostErr('');
    setHostTournaments([]);

    try {
      const res = await fetch(`https://lichess.org/api/user/${username}/tournament/created`);
      if (!res.ok) {
        throw new Error(`Could not fetch tournaments for user @${username}. (Status: ${res.status})`);
      }
      const text = await res.text();
      if (!text.trim()) {
        setHostErr(`No created tournaments found for host @${username}.`);
        return;
      }
      const lines = text.trim().split('\n').filter(Boolean);
      const parsed = lines.map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);

      setHostTournaments(parsed);
      toast.info(`Found ${parsed.length} tournaments created by @${username}`);
    } catch (err) {
      console.warn('Error fetching host tournaments:', err);
      setHostErr(err.message || 'Failed to fetch tournaments from Lichess.');
    } finally {
      setFetchingHost(false);
    }
  };

  const handleImportAllHostTournaments = async () => {
    if (hostTournaments.length === 0) return;

    setIsImportingHost(true);
    try {
      const payloads = hostTournaments.map(t => ({
        arena_id: t.id,
        name: t.fullName || t.name || `Arena #${t.id}`,
        starts_at: t.startsAt ? new Date(t.startsAt).toISOString() : null
      }));

      // Try bulk inserting
      let { error } = await supabase.from('daily_friendlies_config').insert(payloads);

      // Fallback if extra columns not present in table schema
      if (error && error.code === 'PGRST204') {
        const simplePayloads = hostTournaments.map(t => ({ arena_id: t.id }));
        const { error: simpleErr } = await supabase.from('daily_friendlies_config').insert(simplePayloads);
        error = simpleErr;
      }

      if (error) throw error;

      toast.success(`Successfully imported ${hostTournaments.length} tournaments!`);
      setHostTournaments([]);
      fetchStoredArenas();
      if (onArenaUpdated) onArenaUpdated();
    } catch (err) {
      console.error('Error importing host tournaments:', err);
      toast.error('Import failed: ' + err.message);
    } finally {
      setIsImportingHost(false);
    }
  };

  const handleInspectArena = async (rawInput) => {
    const cleanId = extractLichessArenaId(rawInput || arenaInput);
    if (!cleanId) {
      setInspectedMeta(null);
      setInspectErr('Please enter a valid Lichess tournament link or ID.');
      return;
    }

    setInspecting(true);
    setInspectErr('');
    try {
      const res = await fetch(`https://lichess.org/api/tournament/${cleanId}`);
      if (!res.ok) {
        throw new Error(`Lichess API returned status ${res.status}. Check tournament ID.`);
      }
      const data = await res.json();
      setInspectedMeta({
        id: cleanId,
        name: data.fullName || data.name || `Arena #${cleanId}`,
        startsAt: data.startsAt || null,
        finishesAt: data.finishesAt || null,
        status: data.isFinished ? 'Finished' : (data.isStarted ? 'Live' : 'Upcoming'),
        playersCount: data.nbPlayers || 0
      });
    } catch (err) {
      console.warn('Error inspecting arena:', err);
      setInspectErr(err.message || 'Could not fetch tournament data from Lichess.');
      setInspectedMeta(null);
    } finally {
      setInspecting(false);
    }
  };

  const handleSaveArena = async () => {
    const cleanId = extractLichessArenaId(arenaInput);
    if (!cleanId) {
      toast.error('Please enter a valid Lichess tournament URL or ID.');
      return;
    }

    setIsSaving(true);
    try {
      let metaName = inspectedMeta?.name;
      let metaStartsAt = inspectedMeta?.startsAt;

      // If user hasn't inspected yet, fetch metadata on the fly
      if (!inspectedMeta || inspectedMeta.id !== cleanId) {
        try {
          const res = await fetch(`https://lichess.org/api/tournament/${cleanId}`);
          if (res.ok) {
            const data = await res.json();
            metaName = data.fullName || data.name;
            metaStartsAt = data.startsAt;
          }
        } catch { /* ignore fallback errors */ }
      }

      // Try inserting into Supabase daily_friendlies_config
      const payload = {
        arena_id: cleanId,
        ...(metaName ? { name: metaName } : {}),
        ...(metaStartsAt ? { starts_at: metaStartsAt } : {})
      };

      let { error } = await supabase.from('daily_friendlies_config').insert([payload]);
      
      // Fallback: if extra columns failed, insert just arena_id
      if (error && error.code === 'PGRST204') {
        const { error: simpleErr } = await supabase
          .from('daily_friendlies_config')
          .insert([{ arena_id: cleanId }]);
        error = simpleErr;
      }

      if (error) throw error;

      toast.success(`Arena #${cleanId} added successfully! Date inferred: ${formatInferredDate(metaStartsAt)}`);
      setArenaInput('');
      setInspectedMeta(null);
      fetchStoredArenas();
      if (onArenaUpdated) onArenaUpdated();
    } catch (err) {
      console.error('Error saving arena:', err);
      toast.error('Failed to save arena: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMultiImport = async (e) => {
    e.preventDefault();
    if (!multiInput.trim()) return;

    const lines = multiInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setMultiLoading(true);
    toast.info(`Processing ${lines.length} arenas...`);

    const payloads = [];
    for (const rawLine of lines) {
      const cleanId = extractLichessArenaId(rawLine);
      if (cleanId) {
        payloads.push({
          arena_id: cleanId,
          created_at: new Date().toISOString()
        });
      }
    }

    try {
      let { error } = await supabase.from('daily_friendlies_config').insert(payloads);
      if (error) {
        // Fallback single-column batch insert
        const simplePayloads = payloads.map(p => ({ arena_id: p.arena_id }));
        const { error: simpleErr } = await supabase.from('daily_friendlies_config').insert(simplePayloads);
        if (simpleErr) throw simpleErr;
      }

      toast.success(`Successfully imported ${payloads.length} arenas!`);
      setMultiInput('');
      loadConfiguredArenas();
      if (onArenaUpdated) onArenaUpdated();
    } catch (err) {
      console.error('Error bulk importing arenas:', err);
      toast.error(`Bulk import failed: ${err.message}`);
    } finally {
      setMultiLoading(false);
    }
  };

  const handleRemoveArena = async (arenaId) => {
    try {
      const { error } = await supabase
        .from('daily_friendlies_config')
        .delete()
        .eq('arena_id', arenaId);

      if (error) throw error;

      toast.info(`Removed arena ${arenaId}`);
      setConfiguredArenas(prev => prev.filter(item => item.arena_id !== arenaId));
      if (onArenaUpdated) onArenaUpdated();
    } catch (err) {
      console.error('Error deleting arena:', err);
      toast.error(`Failed to remove arena: ${err.message}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="League Admin"
      subtitle="Admin Surface"
      maxWidth="max-w-xl"
      variant="dark"
    >
        {!isUnlocked ? (
          /* PIN Entry Form */
          <form onSubmit={handleUnlockPin} className="space-y-4 py-4">
            <p className="text-sm text-white/70">Enter the Admin PIN to manage League Leaderboards &amp; Arenas.</p>
            <Input
              type="password"
              placeholder="Enter Admin PIN"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinErr(''); }}
              error={pinErr}
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="white-outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Unlock Admin</Button>
            </div>
          </form>
        ) : (
          /* Admin Control Panel */
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'single'
                    ? 'border-brand-accent text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                Single Arena Link
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('host')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'host'
                    ? 'border-brand-accent text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                Host Profile Bulk Importer (e.g. Jhudex)
              </button>
            </div>

            {activeTab === 'single' ? (
              /* Section 1: Upload / Add Single Arena */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-accent text-sm">add_link</span>
                  Add Single Lichess Arena Link
                </h4>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider">
                    Lichess Arena URL or ID
                  </label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="text"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-primary"
                      placeholder="https://lichess.org/tournament/O8MFtK4X or O8MFtK4X"
                      value={arenaInput}
                      onChange={(e) => {
                        setArenaInput(e.target.value);
                        setInspectErr('');
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="white-outline" 
                      size="sm" 
                      onClick={() => handleInspectArena()} 
                      loading={inspecting}
                    >
                      Inspect
                    </Button>
                  </div>
                  {inspectErr && <p className="text-xs text-rose-300 font-semibold">{inspectErr}</p>}
                </div>

                {/* Inferred Metadata Preview Card */}
                {inspectedMeta && (
                  <div className="bg-white/10 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-300 select-none">check_circle</span>
                        Automatically Inferred Metadata
                      </span>
                      <span className="text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                        {inspectedMeta.status}
                      </span>
                    </div>

                    <p className="font-space font-bold text-sm text-white">{inspectedMeta.name}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase">Start Date &amp; Time</span>
                        <span className="font-semibold text-white">{formatInferredDate(inspectedMeta.startsAt)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase">Tournament ID</span>
                        <span className="font-mono text-white/90">#{inspectedMeta.id}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={handleSaveArena}
                  loading={isSaving}
                >
                  + Save Arena to Leaderboard
                </Button>
              </div>
            ) : (
              /* Section 2: Host Profile Importer */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-accent text-sm">cloud_download</span>
                  Bulk Import Host Profile Tournaments
                </h4>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider">
                    Lichess Host Profile URL or Username
                  </label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="text"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-primary font-mono text-xs"
                      placeholder="https://lichess.org/@/Jhudex/tournaments or Jhudex"
                      value={hostInput}
                      onChange={(e) => {
                        setHostInput(e.target.value);
                        setHostErr('');
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="white-outline" 
                      size="sm" 
                      onClick={handleFetchHostTournaments} 
                      loading={fetchingHost}
                    >
                      Fetch Tournaments
                    </Button>
                  </div>
                  {hostErr && <p className="text-xs text-rose-300 font-semibold">{hostErr}</p>}
                </div>

                {/* Host Tournaments Preview List */}
                {hostTournaments.length > 0 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl">
                      <div>
                        <p className="font-bold text-xs text-emerald-200">
                          Found {hostTournaments.length} Tournaments
                        </p>
                        <p className="text-[10px] text-white/60">
                          Created by host @{extractLichessHostUsername(hostInput)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="success"
                        size="sm"
                        onClick={handleImportAllHostTournaments}
                        loading={isImportingHost}
                      >
                        Import All ({hostTournaments.length})
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar border border-white/10 rounded-xl p-2 bg-black/20">
                      {hostTournaments.map((t, idx) => (
                        <div key={t.id || idx} className="text-xs flex items-center justify-between py-1 px-2 hover:bg-white/5 rounded">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-white">{t.fullName || t.name || `Arena #${t.id}`}</span>
                            <span className="text-[10px] text-white/50 ml-2 font-mono">#{t.id}</span>
                          </div>
                          <span className="text-[10px] text-white/60 shrink-0 ml-2">
                            {formatInferredDate(t.startsAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Manage Configured Arenas */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="font-space font-bold text-sm text-white flex items-center justify-between">
                <span>Configured Arenas in Database</span>
                <span className="text-xs text-white/50 font-normal">Total: {storedArenas.length}</span>
              </h4>

              {loadingArenas ? (
                <p className="text-xs text-white/50 italic py-2">Loading stored arenas</p>
              ) : storedArenas.length === 0 ? (
                <p className="text-xs text-white/50 italic py-2">No custom arenas stored yet. Add one above!</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {storedArenas.map((item) => (
                    <div 
                      key={item.id || item.arena_id}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white break-words">{item.name || `Arena #${item.arena_id}`}</p>
                        <p className="text-[10px] text-white/50">
                          ID: <span className="font-mono text-white/80">{item.arena_id}</span>
                          {item.starts_at && ` ${formatInferredDate(item.starts_at)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteArena(item.id, item.arena_id)}
                        className="text-rose-300 hover:text-rose-100 font-bold px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Global Link Information */}
            <div className="bg-brand-primary/15 border border-brand-primary/30 rounded-2xl p-4 text-xs text-white/80 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-brand-primary">info</span>
                Global Lichess Tournament Archives
              </p>
              <p className="leading-relaxed">
                To view all tournaments played across a Lichess team, visit your team URL on Lichess: <br />
                <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">https://lichess.org/team/&lt;your-team-id&gt;/tournaments</code>
              </p>
            </div>
          </div>
        )}
    </Modal>
  );
}
