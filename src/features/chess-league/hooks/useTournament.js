import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../supabase';
import { generateRound1, generateNextRound, getSurvivingPlayersStatus, calculateNextUpcomingMonth, checkFinalsCompletion, evaluateBo3Series, propagateWinners, isBo3Round, initializeBo3SubGames } from '../utils/tournament';
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
  t.rounds.forEach(r => {
    if (r.name === 'Round 2' && (r.roundNum === 4 || r.isKnockout)) {
      r.name = 'Round of 32';
    }
  });
  return t;
};

export function useTournament(monthYear) {
  const [tournament, setTournamentStateRaw] = useState(null);
  const setTournamentState = (t) => setTournamentStateRaw(normalizeRoundNames(t));
  const [history, setHistory] = useState([]);
  const [isDbFallback, setIsDbFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const save = async (t) => {
    const oldStatus = tournament?.status;
    const newStatus = t.status;
    
    setTournamentState(t);
    localStorage.setItem(LS_KEY(t.month_year), JSON.stringify(t));
    try {
      const { error } = await supabase.from('tournaments').upsert({
        id: t.id || t.month_year || '2026-08',
        name: t.name || `${t.month_year || '2026-08'} SCL Tournament`,
        month_year: t.month_year || '2026-08',
        players: t.players || [],
        rounds: t.rounds || [],
        status: t.status || 'active',
        winner: t.winner || null,
        finals_completed_at: t.finals_completed_at || null,
        next_round_start: t.next_round_start || null,
        next_round_label: t.next_round_label || null,
        reg_custom_text: t.reg_custom_text || null,
        show_banner: t.show_banner !== false,
        banner_mode: t.banner_mode || 'auto',
        banner_headline: t.banner_headline || '',
        banner_version: t.banner_version || 1,
        registration_status: t.registration_status || (t.status === 'upcoming' ? 'open' : 'closed'),
        auto_close_registration: t.auto_close_registration !== false
      });
      if (error) throw error;
      setIsDbFallback(false);
    } catch (e) {
      console.warn('Tournament save error:', e.message);
      toast.error('Could not sync tournament with server database. Check network connection.');
      setIsDbFallback(true);
      return; // Stop here — don't attempt notifications if the core save failed
    }

    // ── Post-save side-effects: notifications & announcements ──
    // These run independently; failures are logged but never surface as a sync error.
    try {
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

        if (!adminId) {
          try {
            const { data: adminProf } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
            adminId = adminProf?.id;
          } catch (profErr) {
            console.warn('Could not fetch fallback admin profile ID:', profErr.message);
          }
        }

        // 1. Post a global announcement in public.announcements
        if (adminId) {
          const { error: annErr } = await supabase.from('announcements').insert({
            title: `${roundName} Matchups Released!`,
            content: `${roundName} pairings for ${t.name} are now live. Head over to the tournament screen to view your opponent.`,
            created_by: adminId
          });
          if (annErr) console.warn('Announcement insertion error:', annErr.message);
        }

        // 2. Dispatch targeted opponent notifications to each matched player
        const notifications = [];
        newRound.games.forEach(g => {
          if (!g.p1 || !g.p2 || g.p1.username === 'bye' || g.p2.username === 'bye') return;

          const matchLink = `/chess-league/tournament?tab=fixtures&gameId=${g.id}`;

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
            const { error: notifErr } = await supabase.from('notifications').insert(notifications.slice(i, i + batchSize));
            if (notifErr) console.warn('Opponent notification insertion error:', notifErr.message);
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
          notifTitle = 'Tournament Begun!';
          notifMsg = `The ${t.name} has officially started! Check your pairings and schedule your matches.`;

          // Also broadcast that registration is closed
          try {
            const { data: profiles } = await supabase.from('profiles').select('id');
            if (profiles && profiles.length > 0) {
              const regClosedNotifs = profiles.map(p => ({
                user_id: p.id,
                type: 'registration_closed',
                title: 'Registration Closed',
                message: `Registration for the ${t.name} is now closed. Matches are underway!`,
                link: '/chess-league/tournament'
              }));
              const batchSize = 100;
              for (let i = 0; i < regClosedNotifs.length; i += batchSize) {
                const { error: regErr } = await supabase.from('notifications').insert(regClosedNotifs.slice(i, i + batchSize));
                if (regErr) console.warn('Registration closed notification error:', regErr.message);
              }
            }
          } catch (regClosedErr) {
            console.warn('Could not dispatch registration_closed notification:', regClosedErr.message);
          }

        } else if (newStatus === 'completed') {
          const champName = typeof t.winner === 'object' ? t.winner?.name : t.winner;
          notifType = 'tournament_complete';
          notifTitle = 'Tournament Completed!';
          notifMsg = `The ${t.name} is complete. Congratulations to the Champion: ${champName || 'None'}!`;
        } else if (newStatus === 'upcoming') {
          notifType = 'registration_open';
          notifTitle = 'Registration Open!';
          notifMsg = `Registration is now open for the ${t.name}. Visit the Dashboard to register.`;
        }

        if (notifType) {
          let broadcastAdminId = null;
          try {
            const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
            broadcastAdminId = currentAuthUser?.id;
          } catch (e) {
            console.warn('Could not retrieve current admin ID for status announcement:', e.message);
          }
          if (!broadcastAdminId) {
            try {
              const { data: adminProf } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
              broadcastAdminId = adminProf?.id;
            } catch { /* ignore fallback error */ }
          }

          if (broadcastAdminId) {
            const { error: bcErr } = await supabase.from('announcements').insert({
              title: notifTitle,
              content: notifMsg,
              created_by: broadcastAdminId
            });
            if (bcErr) console.warn('Broadcast announcement error:', bcErr.message);
          }

          const { data: profiles } = await supabase.from('profiles').select('id');
          if (profiles && profiles.length > 0) {
            const notifs = profiles.map(p => ({
              user_id: p.id,
              type: notifType,
              title: notifTitle,
              message: notifMsg,
              link: '/chess-league/tournament'
            }));

            const batchSize = 100;
            for (let i = 0; i < notifs.length; i += batchSize) {
              const { error: batchErr } = await supabase.from('notifications').insert(notifs.slice(i, i + batchSize));
              if (batchErr) console.warn('Global notification batch error:', batchErr.message);
            }
          }
        }
      }
    } catch (sideEffectErr) {
      // Notifications failed but the tournament data was saved — log only, no error toast
      console.warn('Tournament status notification save error:', sideEffectErr.message);
    }
  };

  const fetchHistory = async () => {
    const now = new Date();
    const currentMY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const { data } = await supabase.from('tournaments').select('*').order('month_year', { ascending: false });
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
    if (!monthYear) return; // wait for auto-detect
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('tournaments').select('*').eq('month_year', monthYear).maybeSingle();
        if (error) throw error;
        if (data) { setTournamentState(data); setIsDbFallback(false); setIsLoading(false); return; }
      } catch { setIsDbFallback(true); }
      const local = localStorage.getItem(LS_KEY(monthYear));
      if (local) { setTournamentState(JSON.parse(local)); setIsLoading(false); return; }
      const mock = MOCK_HISTORY.find(m => m.month_year === monthYear);
      setTournamentState(mock || null);
      setIsLoading(false);
    };
    load();

    const channel = supabase
      .channel(`tournament_${monthYear}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `month_year=eq.${monthYear}` }, (payload) => {
        if (payload.new) {
          setTournamentState(payload.new);
          localStorage.setItem(LS_KEY(monthYear), JSON.stringify(payload.new));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [monthYear]);

  // 12-hour Post-Finals Auto-Conclude & Spawn Upcoming
  useEffect(() => {
    if (!tournament || tournament.status !== 'active' || !tournament.finals_completed_at) return;

    const runLifecycleCheck = async () => {
      if (checkFinalsCompletion(tournament)) {
        const completedT = {
          ...tournament,
          status: 'completed'
        };
        setTournamentState(completedT);
        localStorage.setItem(LS_KEY(completedT.month_year), JSON.stringify(completedT));

        try {
          await supabase
            .from('tournaments')
            .update({ status: 'completed' })
            .eq('id', tournament.id);

          const { data: allT } = await supabase.from('tournaments').select('*');
          const nextMY = calculateNextUpcomingMonth(allT || [completedT]);

          // Purge any existing upcoming rows to maintain single-upcoming invariant
          await supabase.from('tournaments').delete().eq('status', 'upcoming');

          // Insert new upcoming tournament
          const autoUpcoming = {
            id: nextMY,
            month_year: nextMY,
            name: `${nextMY} SCL Tournament`,
            status: 'upcoming',
            players: [],
            rounds: [],
            winner: null
          };
          await supabase.from('tournaments').upsert(autoUpcoming);

          toast.success(`Tournament concluded! Registration for ${nextMY} is now OPEN.`, { autoClose: 6000 });
          fetchHistory();
        } catch (err) {
          console.error('Error during 12h tournament conclusion:', err);
        }
      }
    };

    runLifecycleCheck();
    const interval = setInterval(runLifecycleCheck, 30000);
    return () => clearInterval(interval);
  }, [tournament]);

  // Seed Round 1 permanently - called once by admin
  const initialize = async (options = {}) => {
    const [y, m] = monthYear.split('-').map(Number);
    const round1 = generateRound1(tournamentPlayers, y, m, options);

    // Purge any upcoming tournament rows so that NO tournament is upcoming while active
    try {
      await supabase.from('tournaments').delete().eq('status', 'upcoming');
    } catch (e) {
      console.warn('Error purging upcoming row on initialize:', e);
    }

    const t = {
      id: monthYear, name: `${monthYear} SCL Tournament`,
      month_year: monthYear, status: 'active', winner: null,
      players: tournamentPlayers, rounds: [round1],
      finals_completed_at: null
    };
    save(t);
  };

  // Log match result + optional game link
  const logResult = (gameId, winner, gameLink = '', subGameNum = null) => {
    let updatedRounds = tournament.rounds.map(r => ({
      ...r,
      games: r.games.map(g => {
        if (g.id !== gameId) return g;
        
        // If BO3 match
        if (g.bestOf === 3 || (g.subGames && g.subGames.length > 0)) {
          const subGames = g.subGames ? [...g.subGames] : initializeBo3SubGames(g.p1, g.p2);
          
          // Determine which subgame to update
          let targetIndex = -1;
          if (typeof subGameNum === 'number') {
            targetIndex = subGames.findIndex(sg => sg.gameNum === subGameNum);
          }
          if (targetIndex === -1) {
            // Find first uncompleted subGame
            targetIndex = subGames.findIndex(sg => !sg.winner);
          }
          if (targetIndex === -1 && subGames.length > 0) {
            targetIndex = subGames.length - 1; // Fallback to last subgame
          }

          if (targetIndex !== -1) {
            subGames[targetIndex] = {
              ...subGames[targetIndex],
              winner: winner || null,
              gameLink: gameLink || subGames[targetIndex].gameLink || ''
            };
          }

          const evalBo3 = evaluateBo3Series({ ...g, subGames });
          return {
            ...g,
            subGames: evalBo3.subGames,
            winner: evalBo3.winner,
            gameLink: gameLink || g.gameLink || ''
          };
        }

        // Standard BO1 match
        return { ...g, winner: winner || null, gameLink: gameLink || '' };
      })
    }));

    // Auto propagate winners across rounds
    updatedRounds = propagateWinners(updatedRounds);

    const lastRound = updatedRounds[updatedRounds.length - 1];
    const rawWinner = (lastRound && lastRound.games.length === 1) ? lastRound.games[0].winner : null;
    const finalWinner = (rawWinner && rawWinner.username !== 'forfeit') ? rawWinner : null;

    let finalsCompletedAt = tournament?.finals_completed_at || null;
    if (finalWinner && !finalsCompletedAt) {
      finalsCompletedAt = new Date().toISOString();
    }

    const t = {
      ...tournament,
      rounds: updatedRounds,
      winner: finalWinner ? finalWinner.name : (rawWinner === null && lastRound && lastRound.games.length === 1 ? null : tournament.winner),
      status: tournament.status,
      finals_completed_at: finalsCompletedAt
    };

    if (finalWinner && !tournament?.finals_completed_at) {
      toast.success(`${finalWinner.name} is the Champion! Tournament will conclude in 12 hours.`, { autoClose: 6000 });
    }
    save(t);
  };

  // Save only game link without touching winner
  const saveGameLink = (gameId, gameLink) => {
    const updated = tournament.rounds.map(r => ({
      ...r, games: r.games.map(g => g.id === gameId ? { ...g, gameLink } : g)
    }));
    save({ ...tournament, rounds: updated });
  };

  // Generate next round from current winners - admin calls after all results are logged
  const advanceRound = (options = {}) => {
    if (!tournament || !tournament.rounds || tournament.rounds.length === 0) return;
    const [y, m] = monthYear.split('-').map(Number);
    const last = tournament.rounds[tournament.rounds.length - 1];
    const isManual = Array.isArray(options.selectedPlayers);
    const targetRoundName = options.roundName || null;

    if (last?.games?.length === 1 && last?.games[0]?.winner && !isManual) {
      toast.info('Tournament complete. No more rounds to generate.');
      return;
    }

    const survivalCheck = getSurvivingPlayersStatus(tournament, targetRoundName);

    if (!survivalCheck.isComplete && !isManual) {
      toast.error(`Cannot generate round: Previous phase has ${survivalCheck.pendingCount} un-logged match result(s). Log all results first.`);
      return;
    }

    const nextRound = generateNextRound(tournament.rounds, y, m, {
      ...options,
      selectedPlayers: isManual ? options.selectedPlayers : survivalCheck.survivors
    });

    save({ ...tournament, rounds: [...tournament.rounds, nextRound] });
  };

  const deleteRound = (roundNum, options = {}) => {
    if (!tournament || !tournament.rounds || tournament.rounds.length === 0) return;
    const roundToDelete = tournament.rounds.find(r => r.roundNum === roundNum);
    if (!roundToDelete) return;

    const roundName = roundToDelete.name || `Round ${roundNum}`;
    if (!options.skipConfirm && !window.confirm(`Are you sure you want to delete all generated fixtures for "${roundName}"?`)) return;

    const updatedRounds = tournament.rounds.filter(r => r.roundNum !== roundNum);
    save({ ...tournament, rounds: updatedRounds });
    toast.info(`Deleted fixtures for "${roundName}".`);
  };

  const reset = (options = {}) => {
    if (!options.skipConfirm && !window.confirm('Reset? All results will be lost.')) return;
    save({ ...tournament, status: 'upcoming', winner: null, rounds: [] });
  };

  const clearMocks = () => {
    MOCK_HISTORY.forEach(m => localStorage.removeItem(LS_KEY(m.month_year)));
    setTournamentState(null);
    fetchHistory();
  };

  const updateNextRoundStart = (dateTimeStr, nextRoundLabel, extraPayload = {}) => {
    if (!tournament) return;
    const updatedRounds = [...(tournament.rounds || [])];
    if (updatedRounds.length > 0) {
      const lastRound = updatedRounds[updatedRounds.length - 1];
      updatedRounds[updatedRounds.length - 1] = {
        ...lastRound,
        next_round_start: dateTimeStr,
        ...(nextRoundLabel !== undefined ? { next_round_label: nextRoundLabel } : {})
      };
    }
    save({
      ...tournament,
      next_round_start: dateTimeStr,
      next_round_label: nextRoundLabel !== undefined ? nextRoundLabel : tournament.next_round_label,
      ...extraPayload,
      rounds: updatedRounds
    });
  };

  return { tournament, history, isDbFallback, isLoading, initialize, logResult, saveGameLink, advanceRound, deleteRound, reset, clearMocks, updateNextRoundStart };
}
