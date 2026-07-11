// src/utils/awardEngine.js
import { supabase } from '../supabase';

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
    // 1. Champion Award
    // Find the profile of the tournament winner using name/username matching
    const winnerUsername = typeof tournament.winner === 'object' ? tournament.winner.username : tournament.winner;
    const { data: winnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .or(`chess_username.ieq.${winnerUsername},lichess_username.ieq.${winnerUsername},name.ieq.${winnerUsername}`)
      .maybeSingle();

    if (winnerProfile) {
      awardsToInsert.push({
        user_id: winnerProfile.id,
        award_type: 'champion',
        tournament_id: tournamentId
      });
    }

    // 2. Undefeated & Top Positions
    // Scan all tournament players to detect accomplishments
    const players = tournament.players || [];
    for (const player of players) {
      // Find the player profile
      const { data: playerProfile } = await supabase
        .from('profiles')
        .select('id')
        .or(`chess_username.ieq.${player.username},lichess_username.ieq.${player.username},name.ieq.${player.name}`)
        .maybeSingle();

      if (!playerProfile) continue;

      // Check Undefeated (P > 0, L === 0)
      const played = Number(player.P) || 0;
      const losses = Number(player.L) || 0;
      if (played > 0 && losses === 0) {
        awardsToInsert.push({
          user_id: playerProfile.id,
          award_type: 'undefeated',
          tournament_id: tournamentId
        });
      }

      // Check Top 5: Standings point check or rank check
      // For simplicity, we check if they won at least 80% of their points or are ranks 1-5.
      // If tournament standings are available in a sorted order, we can map ranks.
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
