import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../supabase';
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
  ...['2026-05'].map(my => ({
    id: my, month_year: my,
    name: 'May 2026 SCL Tournament',
    status: 'completed', winner: 'Destiny Chilaka',
    players: [], rounds: []
  }))
];

const normalizeRoundNames = (t) => {
  if (!t || !t.rounds) return t;
  const nameMapping = {
    'Round of 64': 'Round 1',
    'Round of 32': 'Round 2',
    'Round of 16': 'Round 3'
  };
  t.rounds.forEach(r => {
    if (nameMapping[r.name]) {
      r.name = nameMapping[r.name];
    }
  });
  return t;
};

export function useTournament(monthYear) {
  const [tournament, setTournamentStateRaw] = useState(null);
  const setTournamentState = (t) => setTournamentStateRaw(normalizeRoundNames(t));
  const [history, setHistory] = useState([]);
  const [isDbFallback, setIsDbFallback] = useState(false);

  const save = async (t) => {
    const oldStatus = tournament?.status;
    const newStatus = t.status;
    
    setTournamentState(t);
    localStorage.setItem(LS_KEY(t.month_year), JSON.stringify(t));
    try {
      const { error } = await supabase.from('tournaments').upsert({
        id: t.id || t.month_year, name: t.name, month_year: t.month_year,
        players: t.players, rounds: t.rounds, status: t.status, winner: t.winner
      });
      if (error) throw error;
      setIsDbFallback(false);
      toast.success('Saved to Database!', { autoClose: 1000 });

      // ── R2 & R7: Check if a new round has been generated/added ──
      const oldRoundsCount = tournament?.rounds?.length || 0;
      const newRoundsCount = t.rounds?.length || 0;

      if (newRoundsCount > oldRoundsCount) {
        const newRound = t.rounds[newRoundsCount - 1];
        const roundName = newRound.name || `Round ${newRound.roundNum}`;

        // Get current admin user ID to associate with the announcement
        let adminId = null;
        try {
          const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
          adminId = currentAuthUser?.id;
        } catch (e) {
          console.warn('Could not retrieve current admin ID for announcement:', e.message);
        }

        // 1. Post a global announcement in public.announcements
        if (adminId) {
          await supabase.from('announcements').insert({
            title: `${roundName} Matchups Released! ♟️`,
            content: `${roundName} pairings for the ${t.name} are now live. Head over to the tournament screen to view your opponent.`,
            created_by: adminId,
            author_id: adminId,
            is_global: true
          }).then();
        }

        // 2. Dispatch targeted opponent notifications to each matched player
        const notifications = [];
        newRound.games.forEach(g => {
          if (!g.p1 || !g.p2 || g.p1.username === 'bye' || g.p2.username === 'bye') return;

          const matchLink = `/chess-league/tournament?tab=fixtures&gameId=${g.id}`;

          // Notification for Player 1
          if (g.p1.id && g.p1.id.length === 36) {
            notifications.push({
              user_id: g.p1.id,
              type: 'opponent_assigned',
              title: `Opponent Assigned: ${roundName}`,
              message: `You are playing against ${g.p2.name} (@${g.p2.username}) in ${roundName}. Scheduled Time: ${newRound.date || 'TBD'}.`,
              link: matchLink,
              metadata: { opponent: g.p2.name, round: roundName, date: newRound.date }
            });
          }

          // Notification for Player 2
          if (g.p2.id && g.p2.id.length === 36) {
            notifications.push({
              user_id: g.p2.id,
              type: 'opponent_assigned',
              title: `Opponent Assigned: ${roundName}`,
              message: `You are playing against ${g.p1.name} (@${g.p1.username}) in ${roundName}. Scheduled Time: ${newRound.date || 'TBD'}.`,
              link: matchLink,
              metadata: { opponent: g.p1.name, round: roundName, date: newRound.date }
            });
          }
        });

        if (notifications.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < notifications.length; i += batchSize) {
            await supabase.from('notifications').insert(notifications.slice(i, i + batchSize)).then();
          }
        }
      }

      // Trigger SCL global notification alerts on status change
      if (oldStatus && oldStatus !== newStatus) {
        let notifType = '';
        let notifTitle = '';
        let notifMsg = '';

        if (newStatus === 'active') {
          notifType = 'tournament_begin';
          notifTitle = 'Tournament Begun! 🏆';
          notifMsg = `The ${t.name} has officially started! Check your pairings and schedule your matches.`;
          
          // Also broadcast that registration is closed
          try {
            const { data: profiles } = await supabase.from('profiles').select('id');
            if (profiles && profiles.length > 0) {
              const regClosedNotifs = profiles.map(p => ({
                user_id: p.id,
                type: 'registration_closed',
                title: 'Registration Closed 🔒',
                message: `Registration for the ${t.name} is now closed. Matches are underway!`,
                link: '/chess-league/tournament'
              }));
              const batchSize = 100;
              for (let i = 0; i < regClosedNotifs.length; i += batchSize) {
                await supabase.from('notifications').insert(regClosedNotifs.slice(i, i + batchSize)).then();
              }
            }
          } catch (regClosedErr) {
            console.warn('Could not dispatch registration_closed notification:', regClosedErr.message);
          }

        } else if (newStatus === 'completed') {
          const champName = typeof t.winner === 'object' ? t.winner?.name : t.winner;
          notifType = 'tournament_complete';
          notifTitle = 'Tournament Completed! 🏆';
          notifMsg = `The ${t.name} is complete. Congratulations to the Champion: ${champName || 'None'}!`;
        } else if (newStatus === 'upcoming') {
          notifType = 'registration_open';
          notifTitle = 'Registration Open! 🏆';
          notifMsg = `Registration is now open for the ${t.name}. Visit the Dashboard to register.`;
        }

        if (notifType) {
          const { data: profiles } = await supabase.from('profiles').select('id');
          if (profiles && profiles.length > 0) {
            const notifs = profiles.map(p => ({
              user_id: p.id,
              type: notifType,
              title: notifTitle,
              message: notifMsg,
              link: '/chess-league/tournament'
            }));

            // Batch insert
            const batchSize = 100;
            for (let i = 0; i < notifs.length; i += batchSize) {
              await supabase.from('notifications').insert(notifs.slice(i, i + batchSize));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Tournament status notification save error:', e.message);
      setIsDbFallback(true);
      toast.info('Saved locally (offline)');
    }
  };

  const fetchHistory = async () => {
    const now = new Date();
    const currentMY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const { data } = await supabase.from('tournaments').select('month_year,name,status,winner');
      const db = data || [];
      const merged = [...db];
      if (!merged.find(x => x.month_year === currentMY))
        merged.push({ month_year: currentMY, name: `${currentMY} SCL Tournament`, status: 'upcoming', winner: null });
      MOCK_HISTORY.forEach(m => { if (!merged.find(x => x.month_year === m.month_year)) merged.push(m); });
      setHistory(merged.sort((a, b) => b.month_year.localeCompare(a.month_year)));
    } catch {
      const local = Object.keys(localStorage)
        .filter(k => k.startsWith('scl_tournament_'))
        .map(k => { const t = JSON.parse(localStorage.getItem(k)); return { month_year: t.month_year, name: t.name, status: t.status, winner: t.winner }; });
      const merged = [...local];
      if (!merged.find(x => x.month_year === currentMY))
        merged.push({ month_year: currentMY, name: `${currentMY} SCL Tournament`, status: 'upcoming', winner: null });
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
  const initialize = (options = {}) => {
    const [y, m] = monthYear.split('-').map(Number);
    const round1 = generateRound1(tournamentPlayers, y, m, options);
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
        ? { ...g, winner: winner || null, gameLink: gameLink || '' }
        : g)
    }));
    const lastRound = updated[updated.length - 1];
    const rawWinner = (lastRound && lastRound.games.length === 1) ? lastRound.games[0].winner : null;
    const finalWinner = (rawWinner && rawWinner.username !== 'forfeit') ? rawWinner : null;
    const t = {
      ...tournament, rounds: updated,
      winner: finalWinner ? finalWinner.name : (rawWinner === null && lastRound && lastRound.games.length === 1 ? null : tournament.winner),
      status: finalWinner ? 'completed' : (rawWinner === null && lastRound && lastRound.games.length === 1 ? 'active' : tournament.status)
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
  const advanceRound = (options = {}) => {
    const [y, m] = monthYear.split('-').map(Number);
    const last = tournament.rounds[tournament.rounds.length - 1];
    const allDone = last.games.every(g => g.winner);
    if (!allDone) { toast.error('Log all match results before generating the next round.'); return; }
    if (last.games.length === 1) { toast.info('Tournament complete — no more rounds.'); return; }
    const nextRound = generateNextRound(tournament.rounds, y, m, options);
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

  const updateNextRoundStart = (dateTimeStr) => {
    if (!tournament || !tournament.rounds || tournament.rounds.length === 0) return;
    const updatedRounds = [...tournament.rounds];
    updatedRounds[updatedRounds.length - 1] = {
      ...updatedRounds[updatedRounds.length - 1],
      next_round_start: dateTimeStr
    };
    save({ ...tournament, rounds: updatedRounds });
  };

  return { tournament, history, isDbFallback, initialize, logResult, saveGameLink, advanceRound, reset, clearMocks, updateNextRoundStart };
}
