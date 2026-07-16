import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";
import { supabase } from "../supabase";
import { PlayerProfile } from "../components/chess/PlayerProfile";

export default function UniversityPage() {
  const location = useLocation();
  const school = location.state?.school;
  const schoolName = school?.name || "King's College";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch registered players from Supabase profiles table
  useEffect(() => {
    if (!schoolName) return;

    const fetchSchoolPlayers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("university", schoolName)
          .order("chess_rating", { ascending: false });

        if (error) throw error;
        setPlayers(data || []);
        
        // Calculate dynamic stats
        await computeSchoolStats(data || []);
      } catch (err) {
        console.error("Error fetching school players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolPlayers();
  }, [schoolName]);

  // Compute school stats based on players list and SCL league matches
  const computeSchoolStats = async (schoolPlayers) => {
    setLoadingStats(true);
    const count = schoolPlayers.length;
    if (count === 0) {
      setStats(null);
      setLoadingStats(false);
      return;
    }

    // Calculate division distribution
    let pinCount = 0, forkCount = 0, aCount = 0;
    let highestPlayer = null;
    let maxRating = -1;

    schoolPlayers.forEach(p => {
      const elo = Math.max(p.chess_rating || 0, p.lichess_rating || 0) || 1200;
      if (elo >= 1800) aCount++;
      else if (elo >= 1000) forkCount++;
      else pinCount++;

      if (elo > maxRating) {
        maxRating = elo;
        highestPlayer = p;
      }
    });

    const ratings = schoolPlayers.map(p => Math.max(p.chess_rating || 0, p.lichess_rating || 0));
    const avgRating = Math.round(ratings.reduce((a, b) => a + b, 0) / count) || 1200;
    const peakRating = maxRating;

    try {
      // 1. Fetch all profiles to calculate SCL ranking of this school
      const { data: allProfiles } = await supabase.from('profiles').select('university, chess_rating, lichess_rating');
      const schoolRatingMap = {};
      (allProfiles || []).forEach(p => {
        if (!p.university) return;
        const sName = p.university.trim();
        if (!schoolRatingMap[sName]) {
          schoolRatingMap[sName] = { total: 0, count: 0 };
        }
        schoolRatingMap[sName].total += Math.max(p.chess_rating || 0, p.lichess_rating || 0) || 1200;
        schoolRatingMap[sName].count += 1;
      });

      const rankedSchools = Object.keys(schoolRatingMap)
        .map(name => ({
          name,
          avg: Math.round(schoolRatingMap[name].total / schoolRatingMap[name].count)
        }))
        .sort((a, b) => b.avg - a.avg);

      const rank = rankedSchools.findIndex(s => s.name.toLowerCase() === schoolName.toLowerCase()) + 1 || 1;

      // 2. Query SCL tournaments to check for wins & appearances
      const { data: tournaments } = await supabase.from('tournaments').select('*');
      
      let tournamentWins = 0;
      let appearances = 0;
      let highestPosition = 'None';

      const playerUsernames = schoolPlayers.map(p => p.chess_username?.toLowerCase()).filter(Boolean);
      const playerEmails = schoolPlayers.map(p => p.email?.toLowerCase()).filter(Boolean);

      (tournaments || []).forEach(t => {
        const hasParticipant = (t.players || []).some(tp => 
          playerEmails.includes(tp.email?.toLowerCase()) || 
          playerUsernames.includes(tp.username?.toLowerCase())
        );
        if (hasParticipant) appearances++;

        if (t.status === 'completed' && t.winner) {
          const winnerUsername = typeof t.winner === 'object' ? t.winner.username : t.winner;
          if (winnerUsername && playerUsernames.includes(winnerUsername.toLowerCase())) {
            tournamentWins++;
            highestPosition = 'Champion 🏆';
          }
        }
      });

      if (highestPosition === 'None' && tournaments) {
        tournaments.forEach(t => {
          (t.rounds || []).forEach((r, rIdx) => {
            const hasPlayerInRound = r.games.some(g => 
              (g.p1 && playerUsernames.includes(g.p1.username?.toLowerCase())) ||
              (g.p2 && playerUsernames.includes(g.p2.username?.toLowerCase()))
            );
            if (hasPlayerInRound) {
              const roundName = r.name || `Round ${rIdx + 1}`;
              if (highestPosition === 'None' || roundName.localeCompare(highestPosition) > 0) {
                highestPosition = roundName;
              }
            }
          });
        });
      }

      // 3. Query SCL division games for W/D/L stats
      const { data: divisions } = await supabase.from('divisions').select('*');
      const { data: resultsData } = await supabase.from('settings').select('data').eq('id', 'gameResults').maybeSingle();
      const gameResults = resultsData?.data || {};

      let played = 0, wins = 0, draws = 0, losses = 0, points = 0;

      (divisions || []).forEach(div => {
        (div.rounds || []).forEach(r => {
          (r.games || []).forEach(([w, b]) => {
            const isW = playerUsernames.includes(w.toLowerCase());
            const isB = playerUsernames.includes(b.toLowerCase());
            if (!isW && !isB) return;

            const key = `${div.id}_${r.round}_${w}_${b}`;
            const res = gameResults[key];
            if (!res) return;

            played++;
            if (res === 'white') {
              if (isW) { wins++; points += 3; } else { losses++; }
            } else if (res === 'draw') {
              draws++; points += 1;
            } else if (res === 'black') {
              if (isB) { wins++; points += 3; } else { losses++; }
            }
          });
        });
      });

      // Active players count (played at least 1 match)
      const activeCount = schoolPlayers.filter(p => {
        const u = p.chess_username?.toLowerCase();
        return u && played > 0;
      }).length || count;

      setStats({
        played, wins, draws, losses, points, avgRating, peakRating,
        highestPlayer: highestPlayer ? `${highestPlayer.name} (${maxRating} ELO)` : 'None',
        distribution: { pin: pinCount, fork: forkCount, a: aCount },
        rank,
        tournamentWins,
        appearances,
        highestPosition,
        activeCount
      });
    } catch (err) {
      console.error("Failed to compute school SCL stats:", err);
      setStats({
        played: 0, wins: 0, draws: 0, losses: 0, points: 0, avgRating, peakRating,
        highestPlayer: 'None',
        distribution: { pin: pinCount, fork: forkCount, a: aCount },
        rank: 1,
        tournamentWins: 0,
        appearances: 0,
        highestPosition: 'None',
        activeCount: count
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Division calculations based on rating
  const getDivisionBadge = (elo) => {
    if (elo >= 1800) {
      return { name: "A Division", color: "bg-red-50 text-red-700 border-red-100" };
    } else if (elo >= 1000) {
      return { name: "Fork Division", color: "bg-blue-50 text-blue-700 border-blue-100" };
    } else {
      return { name: "Pin Division", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
  };

  // School description fallback
  const schoolBio = school?.bio || `${schoolName} is a prestigious educational institution dedicated to intellectual development, moral integrity, and fostering a strong competitive spirit in academic league competitions.`;
  // School anthem fallback
  const schoolAnthem = school?.anthem || "Knowledge is light, honor is strength, united in truth and excellence we conquer.";

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen pb-16">
      <Breadcrumbs 
        parentLabel="Secondary Schools" 
        parentHref="/schools" 
        currentLabel={schoolName} 
      />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto space-y-10">
        <UniversityHeader school={school} registeredCount={players.length} />

        {/* Bio & Anthem Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bio Description (2/3 width) */}
          <div className="lg:col-span-2 varsity-card p-6 sm:p-8 text-left">
            <h2 className="text-[#111111] text-xl font-bold mb-4 font-space uppercase tracking-wider">About the School</h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {schoolBio}
            </p>
          </div>

          {/* Anthem (1/3 width) */}
          <div className="varsity-card p-6 sm:p-8 flex flex-col justify-center text-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">School Anthem / Motto</h3>
            <blockquote className="text-sm font-bold text-gray-600 italic leading-relaxed font-space max-w-sm mx-auto">
              "{schoolAnthem}"
            </blockquote>
          </div>
        </div>

        {/* SCL Stats Section */}
        {loadingStats ? (
          <div className="varsity-card p-6 text-center text-xs font-bold text-gray-400 italic">
            Computing school stats...
          </div>
        ) : stats ? (
          <div className="varsity-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="text-left">
                <h2 className="text-[#111111] text-xl font-black font-space uppercase tracking-wider">Institution Statistics</h2>
                <p className="text-gray-500 text-xs font-medium mt-1 font-semibold">Live aggregated metrics updated automatically after each SCL tournament.</p>
              </div>
              <span className="text-xs font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                Ranked #{stats.rank} in League
              </span>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-brand-bg-cream/40 border border-gray-150 rounded-2xl p-4">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Players</span>
                <span className="block text-xl font-black text-brand-text-dark mt-1 font-space">{stats.activeCount} / {players.length}</span>
              </div>
              <div className="bg-brand-bg-cream/40 border border-gray-150 rounded-2xl p-4">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Average ELO</span>
                <span className="block text-xl font-black text-brand-primary mt-1 font-space">{stats.avgRating} ELO</span>
              </div>
              <div className="bg-brand-bg-cream/40 border border-gray-150 rounded-2xl p-4">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Peak Rating</span>
                <span className="block text-xl font-black text-brand-accent mt-1 font-space">{stats.peakRating} ELO</span>
              </div>
              <div className="bg-brand-bg-cream/40 border border-gray-150 rounded-2xl p-4">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Tournament Wins</span>
                <span className="block text-xl font-black text-brand-text-dark mt-1 font-space">{stats.tournamentWins} Cup{stats.tournamentWins !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Extended SCL Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="varsity-card p-4 flex justify-between items-center">
                <div className="text-left">
                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Highest Finishing Position</span>
                  <span className="block text-sm font-black text-brand-text-dark mt-1">{stats.highestPosition}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Total SCL Appearances</span>
                  <span className="block text-sm font-black text-brand-primary mt-1 font-space">{stats.appearances} Tournament{stats.appearances !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="varsity-card p-4 text-left">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Highest-Rated Player</span>
                <span className="block text-sm font-black text-brand-text-dark mt-1 truncate" title={stats.highestPlayer}>
                  {stats.highestPlayer}
                </span>
              </div>
            </div>

            {/* League Game Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="block text-xl font-black text-emerald-600 font-space">{stats.wins}</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 block">Wins</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center">
                <span className="block text-xl font-black text-amber-600 font-space">{stats.draws}</span>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5 block">Draws</span>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-center">
                <span className="block text-xl font-black text-rose-600 font-space">{stats.losses}</span>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5 block">Losses</span>
              </div>
            </div>

            {/* Division Distribution Progress Bars */}
            <div className="border-t border-gray-100 pt-6 space-y-4 text-left">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Division Distribution</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>🔴 A Division (1800+)</span>
                    <span>{stats.distribution.a} Player{stats.distribution.a !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-500" 
                      style={{ width: `${players.length > 0 ? (stats.distribution.a / players.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>🔵 Fork Division (1000-1799)</span>
                    <span>{stats.distribution.fork} Player{stats.distribution.fork !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ width: `${players.length > 0 ? (stats.distribution.fork / players.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>🟢 Pin Division (0-999)</span>
                    <span>{stats.distribution.pin} Player{stats.distribution.pin !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${players.length > 0 ? (stats.distribution.pin / players.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}

        {/* Registered Players List */}
        <div className="varsity-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4 text-left">
            <h2 className="text-[#111111] text-xl font-black font-space uppercase tracking-wider">Registered Players</h2>
            <p className="text-gray-500 text-xs font-medium mt-1">Students of this school registered and active in the SCL league.</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400 italic">
              Loading registered players...
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16 bg-brand-bg-cream/35 rounded-2xl border border-dashed border-gray-250">
              <span className="text-3xl block mb-2">♟</span>
              <p className="text-xs font-bold text-gray-400 italic">No registered players found for this school yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => {
                const maxRating = Math.max(p.chess_rating || 0, p.lichess_rating || 0) || 1200;
                const divInfo = getDivisionBadge(maxRating);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-[#F6F4F0] rounded-2xl border border-gray-150 hover:border-brand-primary transition-all text-left outline-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-sm flex items-center justify-center shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-brand-text-dark leading-tight group-hover:text-brand-primary transition-colors truncate">
                          {p.name}
                        </h3>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 truncate">
                          {p.department || "Student Player"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${divInfo.color}`}>
                        {divInfo.name}
                      </span>
                      <span className="text-[10px] font-bold text-brand-primary font-space">
                        {maxRating} ELO
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Profile Modal overlay */}
      {selectedPlayer && (
        <PlayerProfile 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
}
