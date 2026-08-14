/**
 * Builds a normalized player record for tournament registration.
 * This is the single source of truth for the player object shape
 * stored inside `tournaments.players[]`.
 *
 * Both ChessTournamentPage (Join button) and DashboardPage (I am Ready)
 * must use this function to guarantee a consistent schema.
 *
 * @param {object} user    - Supabase auth user object (must have `.id`)
 * @param {object} profile - Profile row from `public.profiles`
 * @returns {object} Normalized player record
 */
export function buildPlayerRecord(user, profile) {
  return {
    id: user.id,
    name: profile.name,
    username: profile.chess_username,   // Chess.com only (tournaments run on chess.com)
    rating: Math.max(profile.chess_rating || 0, profile.lichess_rating || 0) || 1200,
    school: profile.university || 'SS4 Member',
    department: profile.department || '',
    phone: profile.phone || profile.whatsapp || ''
  };
}
