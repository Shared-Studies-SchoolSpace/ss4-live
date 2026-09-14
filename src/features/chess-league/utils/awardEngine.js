// src/utils/awardEngine.js
import { supabase } from '../../../supabase';

/**
 * Automatically computes and inserts awards/badges upon tournament completion
 * @param {object} tournament - The tournament state object from useTournament
 */
export async function calculateAndStoreAwards(tournament) {
  if (!tournament || tournament.status !== 'completed' || !tournament.winner) {
    return { success: false, reason: 'Tournament is not completed or has no winner' };
  }

  const tournamentId = tournament.id || tournament.month_year;
  const awardsToInsert = [];

  try {
    const players = tournament.players || [];

    // Fetch relevant profiles in a single query to prevent N+1 loop and comma parsing bugs
    const { data: profilesList } = await supabase
      .from('profiles')
      .select('id, chess_username, lichess_username, name');

    // Build in-memory lookup maps
    const idMap = new Map();
    const userMap = new Map();
    const nameMap = new Map();

    (profilesList || []).forEach(p => {
      if (p.id) idMap.set(p.id, p.id);
      if (p.chess_username) userMap.set(p.chess_username.toLowerCase(), p.id);
      if (p.lichess_username) userMap.set(p.lichess_username.toLowerCase(), p.id);
      if (p.name) nameMap.set(p.name.toLowerCase().trim(), p.id);
    });

    const resolveProfileId = (ident) => {
      if (!ident) return null;
      if (typeof ident === 'object') {
        return idMap.get(ident.id) ||
               userMap.get(ident.username?.toLowerCase()?.trim()) ||
               nameMap.get(ident.name?.toLowerCase()?.trim()) ||
               null;
      }
      const s = String(ident).toLowerCase().trim();
      return idMap.get(ident) || userMap.get(s) || nameMap.get(s) || null;
    };

    // 1. Champion Award
    const winnerId = resolveProfileId(tournament.winner);
    if (winnerId) {
      awardsToInsert.push({
        user_id: winnerId,
        award_type: 'champion',
        tournament_id: tournamentId
      });
    }

    // 2. Undefeated & Accomplishments
    for (const player of players) {
      const playerId = resolveProfileId(player);
      if (!playerId) continue;

      // Check Undefeated (P > 0, L === 0)
      const played = Number(player.P) || 0;
      const losses = Number(player.L) || 0;
      if (played > 0 && losses === 0) {
        awardsToInsert.push({
          user_id: playerId,
          award_type: 'undefeated',
          tournament_id: tournamentId
        });
      }
    }

    if (awardsToInsert.length > 0) {
      // Bulk upsert/insert awards (ignoring duplicates via unique constraint on user_id, award_type, tournament_id)
      const { error } = await supabase
        .from('awards')
        .upsert(awardsToInsert, { onConflict: 'user_id,award_type,tournament_id' });

      if (error) throw error;
    }

    return { success: true, count: awardsToInsert.length };
  } catch (err) {
    console.error('Error calculating tournament awards:', err);
    return { success: false, error: err.message };
  }
}
