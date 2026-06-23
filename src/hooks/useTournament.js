import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import { generateRound1, generateNextRound } from '../utils/tournament';
import tournamentPlayers from '../data/playersWithRatings.json';

const LS_KEY = (my) => `scl_tournament_${my}`;

// ponytail: mock history lives here, cleared by admin clear action
export const MOCK_HISTORY = [
  {
    id: '2026-06',
    month_year: '2026-06',
    name: 'June 2026 SCL Tournament',
    status: 'active',
    winner: null,
    players: tournamentPlayers,
    rounds: [generateRound1(tournamentPlayers, 2026, 6)]
  },
  ...['2026-04', '2026-05'].map(my => ({
    id: my, month_year: my,
    name: `${my === '2026-04' ? 'April' : 'May'} 2026 SCL Tournament`,
    status: 'completed', winner: 'Player Alpha',
    players: [], rounds: []
  }))
];

export function useTournament(monthYear) {
  const [tournament, setTournamentState] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDbFallback, setIsDbFallback] = useState(false);

  const save = async (t) => {
    setTournamentState(t);
    localStorage.setItem(LS_KEY(t.month_year), JSON.stringify(t));
    if (!isDbFallback) {
      const { error } = await supabase.from('tournaments').upsert({
        id: t.id || t.month_year, name: t.name, month_year: t.month_year,
        players: t.players, rounds: t.rounds, status: t.status, winner: t.winner
      });
      if (error) { setIsDbFallback(true); toast.info('Saved locally (offline)'); }
      else toast.success('Saved!', { autoClose: 1000 });
    }
  };

  const fetchHistory = async () => {
    const now = new Date();
    const currentMY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const { data } = await supabase.from('tournaments').select('month_year,name,status');
      const db = data || [];
      const merged = [...db];
      if (!merged.find(x => x.month_year === currentMY))
        merged.push({ month_year: currentMY, name: `${currentMY} SCL Tournament`, status: 'upcoming' });
      MOCK_HISTORY.forEach(m => { if (!merged.find(x => x.month_year === m.month_year)) merged.push(m); });
      setHistory(merged.sort((a, b) => b.month_year.localeCompare(a.month_year)));
    } catch {
      const local = Object.keys(localStorage)
        .filter(k => k.startsWith('scl_tournament_'))
        .map(k => { const t = JSON.parse(localStorage.getItem(k)); return { month_year: t.month_year, name: t.name, status: t.status }; });
      const merged = [...local];
      if (!merged.find(x => x.month_year === currentMY))
        merged.push({ month_year: currentMY, name: `${currentMY} SCL Tournament`, status: 'upcoming' });
      MOCK_HISTORY.forEach(m => { if (!merged.find(x => x.month_year === m.month_year)) merged.push(m); });
      setHistory(merged.sort((a, b) => b.month_year.localeCompare(a.month_year)));
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('tournaments').select('*').eq('month_year', monthYear).maybeSingle();
        if (error) throw error;
        if (data) { setTournamentState(data); setIsDbFallback(false); return; }
      } catch { setIsDbFallback(true); }
      const local = localStorage.getItem(LS_KEY(monthYear));
      if (local) { setTournamentState(JSON.parse(local)); return; }
      const mock = MOCK_HISTORY.find(m => m.month_year === monthYear);
      setTournamentState(mock || null);
      // ponytail: no auto-init — admin explicitly seeds Round 1
    };
    load();
  }, [monthYear]);

  // Seed Round 1 permanently — called once by admin
  const initialize = () => {
    const [y, m] = monthYear.split('-').map(Number);
    const round1 = generateRound1(tournamentPlayers, y, m);
    const t = {
      id: monthYear, name: `${monthYear} SCL Tournament`,
      month_year: monthYear, status: 'active', winner: null,
      players: tournamentPlayers, rounds: [round1]
    };
    save(t);
  };

  // Log match result + optional game link
  const logResult = (gameId, winner, gameLink = '') => {
    const updated = tournament.rounds.map(r => ({
      ...r,
      games: r.games.map(g => g.id === gameId
        ? { ...g, winner, gameLink: gameLink || g.gameLink || '' }
        : g)
    }));
    const finalWinner = updated.at(-1).games[0]?.winner;
    const t = {
      ...tournament, rounds: updated,
      winner: finalWinner?.name ?? tournament.winner,
      status: finalWinner ? 'completed' : tournament.status
    };
    if (finalWinner) toast.success(`${finalWinner.name} is the Champion!`, { autoClose: 4000 });
    save(t);
  };

  // Save only game link without touching winner
  const saveGameLink = (gameId, gameLink) => {
    const updated = tournament.rounds.map(r => ({
      ...r, games: r.games.map(g => g.id === gameId ? { ...g, gameLink } : g)
    }));
    save({ ...tournament, rounds: updated });
  };

  // Generate next round from current winners — admin calls after all results are logged
  const advanceRound = () => {
    const [y, m] = monthYear.split('-').map(Number);
    const last = tournament.rounds[tournament.rounds.length - 1];
    const allDone = last.games.every(g => g.winner);
    if (!allDone) { toast.error('Log all match results before generating the next round.'); return; }
    if (last.games.length === 1) { toast.info('Tournament complete — no more rounds.'); return; }
    const nextRound = generateNextRound(tournament.rounds, y, m);
    save({ ...tournament, rounds: [...tournament.rounds, nextRound] });
  };

  const reset = () => {
    if (!window.confirm('Reset? All results will be lost.')) return;
    save({ ...tournament, status: 'upcoming', winner: null, rounds: [] });
  };

  const clearMocks = () => {
    MOCK_HISTORY.forEach(m => localStorage.removeItem(LS_KEY(m.month_year)));
    setTournamentState(null);
    fetchHistory();
  };

  return { tournament, history, isDbFallback, initialize, logResult, saveGameLink, advanceRound, reset, clearMocks };
}
