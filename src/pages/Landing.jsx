import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../features/auth-portal/hooks/useAuth';
import { supabase } from '../supabase';
import Button from '../components/Button';
import AuthGate from '../features/auth-portal/components/AuthGate';
import { toast } from "react-toastify";
import mockPlayers from '../features/chess-league/data/playersWithRatings.json';
import { MatchResult } from '../features/chess-league/components/MatchResult';
import { PlayerProfile } from '../features/chess-league/components/PlayerProfile';
import { Hero } from '../components/Hero';
import { fetchCompletePlayerData } from '../features/chess-league/utils/chessService';
import LoadingScreen from '../components/LoadingScreen';
import { FeedContainer } from '../components/feed';

// Fallback results for Daily Friendlies (since start on July 13, 2026)
const FALLBACK_DAILY_FRIENDLIES = [
  // July 13, 2026
  { tournament_date: '2026-07-13', player_username: 'HAKAI026', points: 30, performance: 1981, is_winner: true },
  { tournament_date: '2026-07-13', player_username: 'Tyrannt', points: 14, performance: 1693, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'Act1ve_001', points: 13, performance: 1668, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'Robert_plays_chess', points: 8, performance: 1420, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'karyptus', points: 6, performance: 1487, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'Veek_Austin01', points: 4, performance: 1708, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'iyanamubongabasi', points: 2, performance: 1455, is_winner: false },
  { tournament_date: '2026-07-13', player_username: 'Yaribem05', points: 2, performance: 1404, is_winner: false },

  // July 14, 2026
  { tournament_date: '2026-07-14', player_username: 'oblivion14', points: 22, performance: 2029, is_winner: true },
  { tournament_date: '2026-07-14', player_username: 'Act1ve_001', points: 6, performance: 1584, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Veek_Austin01', points: 14, performance: 1832, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Glorrreeeyy', points: 16, performance: 1868, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'simon25', points: 14, performance: 1570, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Robert_plays_chess', points: 4, performance: 1446, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Laka2142', points: 10, performance: 1663, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Power_101', points: 8, performance: 1611, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'iyanamubongabasi', points: 6, performance: 1547, is_winner: false },
  { tournament_date: '2026-07-14', player_username: 'Jhudex', points: 5, performance: 1366, is_winner: false },

  // July 15, 2026
  { tournament_date: '2026-07-15', player_username: 'simon25', points: 31, performance: 1802, is_winner: true },
  { tournament_date: '2026-07-15', player_username: 'Act1ve_001', points: 5, performance: 1555, is_winner: false },
  { tournament_date: '2026-07-15', player_username: 'Robert_plays_chess', points: 4, performance: 1456, is_winner: false },
  { tournament_date: '2026-07-15', player_username: 'Tyrannt', points: 1, performance: 1580, is_winner: false },
  { tournament_date: '2026-07-15', player_username: 'Weehfhi_Plays', points: 14, performance: 1630, is_winner: false },
  { tournament_date: '2026-07-15', player_username: 'Praisehans', points: 12, performance: 1896, is_winner: false },
  { tournament_date: '2026-07-15', player_username: 'Klaus-Michael', points: 12, performance: 1815, is_winner: false },

  // July 16, 2026
  { tournament_date: '2026-07-16', player_username: 'simon25', points: 1, performance: 1674, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Veek_Austin01', points: 12, performance: 1834, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Act1ve_001', points: 6, performance: 1532, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'oblivion14', points: 4, performance: 1927, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Laka2142', points: 12, performance: 1885, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Robert_plays_chess', points: 6, performance: 1444, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Weehfhi_Plays', points: 6, performance: 1620, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Jhudex', points: 14, performance: 1365, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Power_101', points: 8, performance: 1724, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Klaus-Michael', points: 4, performance: 1647, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Gmpeerless', points: 14, performance: 1905, is_winner: true },
  { tournament_date: '2026-07-16', player_username: 'KeseneNicholas', points: 12, performance: 1786, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'Davidbarakaii', points: 8, performance: 1615, is_winner: false },
  { tournament_date: '2026-07-16', player_username: 'iyanamubongabasi', points: 2, performance: 1568, is_winner: false }
];

const spotlightPlayers = [
  {
    name: "Simon (simon25)",
    school: "University of Lagos",
    detail: "Economics • July 15 Arena Champion",
    metric1Label: "Pts Scored",
    metric1Value: "31 pts",
    metric2Label: "Performance",
    metric2Value: "1802",
    avatarInitial: "S"
  },
  {
    name: "HAKAI026",
    school: "Lichess Competitor",
    detail: "July 13 Arena Champion",
    metric1Label: "Pts Scored",
    metric1Value: "30 pts",
    metric2Label: "Performance",
    metric2Value: "1981",
    avatarInitial: "H"
  },
  {
    name: "oblivion14",
    school: "Bells University of Technology",
    detail: "Mechatronics • July 14 Arena Champion",
    metric1Label: "Pts Scored",
    metric1Value: "22 pts",
    metric2Label: "Performance",
    metric2Value: "2029",
    avatarInitial: "O"
  },
  {
    name: "Gmpeerless",
    school: "University of Ibadan",
    detail: "Mathematics • July 16 Arena Champion",
    metric1Label: "Pts Scored",
    metric1Value: "14 pts",
    metric2Label: "Performance",
    metric2Value: "1905",
    avatarInitial: "G"
  }
];



// Vector SVG Icons
const AnnouncementIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M8 21h8a2 2 0 002-2v-1.5a2.5 2.5 0 00-2.5-2.5h-7A2.5 2.5 0 004 17.5V19a2 2 0 002 2z" />
  </svg>
);

const MatchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CommunityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SchoolIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

// Chess Visual Board Graphic Component
const ChessVisual = () => (
  <div className="relative w-full aspect-square max-w-[280px] md:max-w-[320px] mx-auto bg-white border border-m3-outline-variant rounded-3xl p-4 shadow-sm select-none">
    <div className="grid grid-cols-4 grid-rows-4 h-full w-full rounded-2xl overflow-hidden border border-m3-outline-variant">
      {[...Array(16)].map((_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const isDark = (row + col) % 2 === 1;
        return (
          <div
            key={i}
            className={`w-full h-full relative flex items-center justify-center text-3xl ${
              isDark ? "bg-m3-surface-low" : "bg-m3-surface-variant"
            }`}
          >
            {i === 5 && (
              <span className="text-brand-primary animate-pulse">♞</span>
            )}
            {i === 10 && (
              <span className="text-brand-accent drop-shadow-sm">👑</span>
            )}
            {i === 3 && (
              <span className="text-brand-accent/25">♟</span>
            )}
            {i === 12 && (
              <span className="text-brand-primary/25">♜</span>
            )}
          </div>
        );
      })}
    </div>
    {/* Visual Accent Badge */}
    <div className="absolute -top-3 -right-2 bg-brand-accent text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
      Live Standings
    </div>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [leaderboardTab, setLeaderboardTab] = useState("players");
  const [selectedDivision, setSelectedDivision] = useState("A"); // "A", "Fork", "Pin"
  const [dbAnnouncements, setDbAnnouncements] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [leaderboardSchools, setLeaderboardSchools] = useState([]);
  const [dailyFriendlies, setDailyFriendlies] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [newsSlideIdx, setNewsSlideIdx] = useState(0);
  const [matchSlideIdx, setMatchSlideIdx] = useState(0);

  // Preloading States
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadStatus, setPreloadStatus] = useState("Loading Arena...");

  // 1. Load data from Supabase / SessionStorage Cache
  useEffect(() => {
    // Only use cached announcements/schools for instant paint, but always fetch fresh tournament matches
    const isCached = sessionStorage.getItem('ss4_landing_preloaded_v2');
    if (isCached) {
      try {
        const cached = JSON.parse(isCached);
        setDbAnnouncements(cached.dbAnnouncements || []);
        setAllPlayers(cached.allPlayers || []);
        setLeaderboardSchools(cached.leaderboardSchools || []);
        setDailyFriendlies(cached.dailyFriendlies || []);
      } catch (e) {
        // Cache corrupted or disabled
      }
    }

    const loadAndPreload = async () => {
      try {
        setPreloadStatus("Loading Arena...");
        setPreloadProgress(10);
        
        // Fetch announcements
        const { data: ann } = await supabase
          .from("announcements")
          .select("*, sender:profiles(name)")
          .order("created_at", { ascending: false });
        const finalAnn = ann || [];
        setDbAnnouncements(finalAnn);
        setPreloadProgress(25);

        // Fetch tournaments
        setPreloadStatus("Retrieving match history...");
        const { data: tournaments } = await supabase
          .from("tournaments")
          .select("*");
        
        const now = new Date();
        const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const extractedMatches = [];
        (tournaments || []).forEach(t => {
          const isCurrent = t.month_year === currentMonthYear;
          (t.rounds || []).forEach(r => {
            (r.games || []).forEach(g => {
              const isP1Bye = g.p1?.username?.toLowerCase() === 'bye' || g.p1?.name?.toUpperCase() === 'BYE';
              const isP2Bye = g.p2?.username?.toLowerCase() === 'bye' || g.p2?.name?.toUpperCase() === 'BYE';
              if (isP1Bye || isP2Bye) return;
              // For past months: completed results only. For current month: all pairings.
              if (!isCurrent && !g.winner) return;
              extractedMatches.push({
                id: `${t.id}_${r.roundNum || r.name}_${g.id}`,
                tournamentName: t.name,
                roundName: r.name,
                groupLabel: g.groupLabel || null,
                isGroupStage: r.isGroupStage || false,
                white: g.p1 || g.white,
                black: g.p2 || g.black,
                winner: g.winner || null,
                gameLink: g.gameLink || "",
                date: t.month_year,
                isPending: !g.winner
              });
            });
          });
        });

        // Sort: current month first, within same month completed before pending
        extractedMatches.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          if (a.isPending !== b.isPending) return a.isPending ? 1 : -1;
          return 0;
        });

        const finalMatches = extractedMatches.slice(0, 16);
        setDbMatches(finalMatches);
        setPreloadProgress(45);

        // Fetch profiles
        setPreloadStatus("Loading player records...");
        const { data: profs } = await supabase
          .from("profiles")
          .select("name, university, chess_username, lichess_username, chess_rating, lichess_rating")
          .order("chess_rating", { ascending: false });

        const mergedPlayers = [...(profs || [])];
        mockPlayers.forEach(m => {
          if (!mergedPlayers.find(p => p.chess_username?.toLowerCase() === m.username.toLowerCase())) {
            mergedPlayers.push({
              name: m.name,
              university: m.school,
              chess_username: m.username,
              chess_rating: m.rating || 1200
            });
          }
        });
        setAllPlayers(mergedPlayers);
        setPreloadProgress(55);

        // Fetch daily friendly results from Supabase if table is created
        let finalFriendlies = [];
        try {
          const { data: friendlies, error: friendliesErr } = await supabase
            .from("daily_friendlies")
            .select("*")
            .order("tournament_date", { ascending: true });
          if (!friendliesErr && friendlies) {
            finalFriendlies = friendlies;
          }
        } catch (e) {
          console.warn("Could not load daily friendlies from Supabase:", e);
        }
        setDailyFriendlies(finalFriendlies);
        setPreloadProgress(60);

        // Aggregate top universities
        const schoolMap = {};
        mergedPlayers.forEach(p => {
          if (!p.university) return;
          const school = p.university.trim();
          if (!schoolMap[school]) {
            schoolMap[school] = { name: school, count: 0, totalRating: 0 };
          }
          schoolMap[school].count += 1;
          schoolMap[school].totalRating += (p.chess_rating || 1200);
        });
        const schools = Object.values(schoolMap)
          .map(s => ({
            name: s.name,
            count: s.count,
            avgRating: Math.round(s.totalRating / s.count)
          }))
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 5);
        setLeaderboardSchools(schools);
        setPreloadProgress(70);

        // Preload profiles & avatar pictures
        setPreloadStatus("Caching active profiles & avatar pictures...");
        const activeUsernames = new Set(["Kontor_001"]);
        
        // 1. Preload top 6 players on high ELO leaderboard
        mergedPlayers
          .filter(p => (p.chess_rating || 0) >= 1800)
          .slice(0, 6)
          .forEach(p => { if (p.chess_username) activeUsernames.add(p.chess_username); });

        // 2. Preload players involved in results carousel
        finalMatches.forEach(m => {
          if (m.white?.username) activeUsernames.add(m.white.username);
          if (m.black?.username) activeUsernames.add(m.black.username);
        });

        const listToFetch = Array.from(activeUsernames);
        const batchSize = 5;
        
        for (let idx = 0; idx < listToFetch.length; idx += batchSize) {
          const batch = listToFetch.slice(idx, idx + batchSize);
          setPreloadStatus(`Caching player data (${idx}/${listToFetch.length})...`);
          
          await Promise.all(batch.map(async (uname) => {
            const player = mergedPlayers.find(p => p.chess_username === uname);
            const platform = player?.lichess_username && !player?.username ? 'lichess' : 'chess.com';
            
            // fetchCompletePlayerData checks and writes to sessionStorage
            const details = await fetchCompletePlayerData(uname, platform);
            
            // If details returns an avatar URL, load in browser memory
            if (details?.avatar) {
              await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = details.avatar;
              });
            }
          }));

          const progressStep = 70 + Math.round((idx / listToFetch.length) * 25);
          setPreloadProgress(progressStep);
        }

        // Save preloaded layout states to sessionStorage
        const cachedPayload = {
          dbAnnouncements: finalAnn,
          dbMatches: finalMatches,
          allPlayers: mergedPlayers,
          leaderboardSchools: schools,
          dailyFriendlies: finalFriendlies
        };
        sessionStorage.setItem('ss4_landing_preloaded_v2', JSON.stringify(cachedPayload));
        
        setPreloadProgress(100);
        setPreloadStatus("Ready!");

        setTimeout(() => {
          setIsPreloading(false);
          setLoadingFeed(false);
        }, 500);

      } catch (err) {
        console.error("Error preloading landing data:", err);
        setIsPreloading(false);
        setLoadingFeed(false);
      }
    };

    loadAndPreload();

    // Realtime subscription for tournaments update
    const tourneyTopic = `landing-tournaments-${Date.now()}`;
    const tourneySub = supabase
      .channel(tourneyTopic)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        async () => {
          try {
            const { data: updatedTourneys } = await supabase.from('tournaments').select('*');
            if (updatedTourneys) {
              const freshMatches = [];
              const n = new Date();
              const cMY = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
              updatedTourneys.forEach(t => {
                const isCurr = t.month_year === cMY;
                (t.rounds || []).forEach(r => {
                  (r.games || []).forEach(g => {
                    const isP1Bye = g.p1?.username?.toLowerCase() === 'bye' || g.p1?.name?.toUpperCase() === 'BYE';
                    const isP2Bye = g.p2?.username?.toLowerCase() === 'bye' || g.p2?.name?.toUpperCase() === 'BYE';
                    if (isP1Bye || isP2Bye) return;
                    if (!isCurr && !g.winner) return;
                    freshMatches.push({
                      id: `${t.id}_${r.roundNum || r.name}_${g.id}`,
                      tournamentName: t.name,
                      roundName: r.name,
                      groupLabel: g.groupLabel || null,
                      isGroupStage: r.isGroupStage || false,
                      white: g.p1 || g.white,
                      black: g.p2 || g.black,
                      winner: g.winner || null,
                      gameLink: g.gameLink || '',
                      date: t.month_year,
                      isPending: !g.winner
                    });
                  });
                });
              });
              freshMatches.sort((a, b) => {
                if (a.date !== b.date) return b.date.localeCompare(a.date);
                if (a.isPending !== b.isPending) return a.isPending ? 1 : -1;
                return 0;
              });
              setDbMatches(freshMatches.slice(0, 16));
            }
          } catch (e) {
            console.error('Error refreshing tournaments on realtime change:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tourneySub);
    };
  }, []);

  const leaderboardPlayers = useMemo(() => {
    return allPlayers
      .filter(p => {
        const rating = p.chess_rating || 0;
        if (selectedDivision === "A") return rating >= 1800;
        if (selectedDivision === "Fork") return rating >= 1000 && rating < 1800;
        return rating < 1000;
      })
      .sort((a, b) => (b.chess_rating || 0) - (a.chess_rating || 0))
      .slice(0, 6);
  }, [allPlayers, selectedDivision]);

  // Cumulative Daily Friendlies standings
  const dailyFriendliesLeaderboard = useMemo(() => {
    const data = dailyFriendlies.length > 0 ? dailyFriendlies : FALLBACK_DAILY_FRIENDLIES;
    
    const playerMap = {};
    data.forEach(item => {
      const username = item.player_username;
      if (!playerMap[username]) {
        playerMap[username] = {
          username: username,
          pts: 0,
          perf: 0,
          wins: 0,
          count: 0
        };
      }
      playerMap[username].pts += item.points;
      playerMap[username].perf = item.performance;
      if (item.is_winner) {
        playerMap[username].wins += 1;
      }
      playerMap[username].count += 1;
    });

    return Object.values(playerMap)
      .sort((a, b) => b.pts - a.pts || b.perf - a.perf)
      .map(p => {
        const details = allPlayers.find(
          player => player.chess_username?.toLowerCase() === p.username.toLowerCase() ||
                    player.lichess_username?.toLowerCase() === p.username.toLowerCase()
        );
        return {
          ...p,
          name: details?.name || p.username,
          university: details?.university || "Lichess Competitor"
        };
      });
  }, [dailyFriendlies, allPlayers]);

  // Dynamic daily spotlight (changes every calendar day)
  const dailySpotlightPlayer = useMemo(() => {
    const day = new Date().getDate();
    return spotlightPlayers[day % spotlightPlayers.length];
  }, []);

  const handlePlayerClick = (username) => {
    const player = allPlayers.find(
      ap => ap.chess_username?.toLowerCase() === username.toLowerCase() ||
            ap.lichess_username?.toLowerCase() === username.toLowerCase()
    ) || {
      name: username,
      university: "Lichess Competitor",
      chess_username: username,
      chess_rating: 1500
    };
    setSelectedPlayer(player);
  };

  const isCurrentUser = (p) => {
    if (!profile) return false;
    const pUname = p.chess_username?.toLowerCase() || p.player_username?.toLowerCase() || p.username?.toLowerCase();
    const myUname = profile.chess_username?.toLowerCase() || profile.lichess_username?.toLowerCase();
    return pUname && myUname && pUname === myUname;
  };



  // Decoupled Announcements & Milestones (sorted by date)
  const feedAnnouncements = useMemo(() => {
    const list = [];
    (dbAnnouncements || []).forEach(a => {
      list.push({
        id: `ann_${a.id}`,
        type: "announcement",
        title: a.title,
        content: a.content,
        author: a.sender?.name || "SS4 Admin",
        date: new Date(a.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
        timestamp: new Date(a.created_at).getTime() || Date.now()
      });
    });

    const staticPosts = [
      {
        id: "comm_1",
        type: "community",
        title: "League Milestone Achieved!",
        content: "The SS4 Chess League has officially reached 140+ active players across multiple tertiary and secondary institutions. 100% of registrations came through peer-to-peer student referrals. The academic community is connecting!",
        author: "SS4 Community Manager",
        date: "Jul 10",
        timestamp: Date.now() - 3600000 * 24 * 2
      },
      {
        id: "comm_2",
        type: "community",
        title: "Aspirants Award Prep Starts Now",
        content: "Preparation guides and practice portals for the upcoming SS4 Aspirants Award will release next week. Make sure your academic profiles are up-to-date in your student dashboard to participate.",
        author: "SS4 Academic Director",
        date: "Jul 08",
        timestamp: Date.now() - 3600000 * 24 * 5
      },
      {
        id: "comm_3",
        type: "community",
        title: "Sponsorship Spotlights Open",
        content: "SS4 offers official partners direct visibility into a growing, highly motivated group of Nigerian university students and secondary schools. Support academic excellence and get your organization on the portal map.",
        author: "SS4 Partnerships",
        date: "Jul 05",
        timestamp: Date.now() - 3600000 * 24 * 8
      }
    ];

    list.push(...staticPosts);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [dbAnnouncements]);

  // Decoupled Match Results
  const feedMatches = useMemo(() => {
    return (dbMatches || []).map(m => {
      const winnerName = typeof m.winner === "object" ? m.winner?.name : m.winner;
      const parsedTimestamp = m.date ? Date.parse(`${m.date}-01`) : NaN;
      return {
        id: `match_${m.id}`,
        type: "match",
        tournamentName: m.tournamentName,
        roundName: m.roundName,
        groupLabel: m.groupLabel || null,
        isGroupStage: m.isGroupStage || false,
        white: m.white,
        black: m.black,
        winner: winnerName || null,
        gameLink: m.gameLink,
        date: m.date,
        isPending: m.isPending || false,
        timestamp: isNaN(parsedTimestamp) ? Date.now() : parsedTimestamp
      };
    });
  }, [dbMatches]);

  // Track hover states for slideshow pausing
  const [isNewsHovered, setIsNewsHovered] = useState(false);
  const [isMatchHovered, setIsMatchHovered] = useState(false);

  // Filtered lists based on activeFilter
  const filteredAnnouncements = useMemo(() => {
    if (activeFilter === "results") return [];
    return feedAnnouncements;
  }, [feedAnnouncements, activeFilter]);

  const filteredMatches = useMemo(() => {
    if (activeFilter === "all" || activeFilter === "results") return feedMatches;
    return [];
  }, [feedMatches, activeFilter]);

  // Reset slide indices when filter changes to prevent out-of-bounds errors or flashing
  useEffect(() => {
    setNewsSlideIdx(0);
    setMatchSlideIdx(0);
  }, [activeFilter]);

  const newsSafeIdx = filteredAnnouncements.length ? newsSlideIdx % filteredAnnouncements.length : 0;
  const matchSafeIdx = filteredMatches.length ? matchSlideIdx % filteredMatches.length : 0;

  // Auto-advance news slideshow (paused when hovered)
  useEffect(() => {
    if (filteredAnnouncements.length < 2 || isNewsHovered) return;
    const t = setInterval(() =>
      setNewsSlideIdx(p => (p + 1) % filteredAnnouncements.length), 5000);
    return () => clearInterval(t);
  }, [filteredAnnouncements.length, isNewsHovered]);

  // Auto-advance match slideshow (paused when hovered)
  useEffect(() => {
    if (filteredMatches.length < 2 || isMatchHovered) return;
    const t = setInterval(() =>
      setMatchSlideIdx(p => (p + 1) % filteredMatches.length), 6000);
    return () => clearInterval(t);
  }, [filteredMatches.length, isMatchHovered]);


  if (isPreloading) {
    return <LoadingScreen progress={preloadProgress} status={preloadStatus} />;
  }

  return (
    <>
      <Hero />

      {/* 2. Main Social/Dashboard Grid: 3 Columns */}
      <div className="container mx-auto px-3 sm:px-6 md:px-12 lg:px-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Column 1: Profile Widget & Left Filters (25%)  moved below feed on mobile */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            
            {/* Session Card (M3 Outlined Layout) */}
            {user ? (
              <div className="varsity-card p-5 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                    {profile?.name?.charAt(0) || "P"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-brand-text-dark truncate leading-tight">
                      {profile?.name || "Player Profile"}
                    </h3>
                    <p className="text-xs font-semibold text-gray-650 truncate mt-0.5">
                      {profile?.university || "SS4 Member"}
                    </p>
                  </div>
                </div>
                
                {/* Rating Badge Tonal Chip */}
                <div className="mt-4 pt-3.5 border-t border-m3-outline-variant flex items-center justify-between text-sm">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Chess Rating</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-md mt-1">
                      {profile?.chess_rating || 1200} ELO
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Role</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-black rounded-md mt-1 uppercase">
                      {profile?.role || "Player"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    variant="primary" 
                    className="w-full uppercase tracking-wider text-xs py-2.5 font-black shadow-sm"
                  >
                    My Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-m3-outline-variant rounded-3xl p-5 shadow-sm relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl"></div>
                <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                  Academic League
                </h3>
                <p className="text-sm font-medium text-gray-700 mt-2 leading-relaxed">
                  Join a connected community of student chess players competing, tracking ELO, and striving for excellence.
                </p>
                <div className="mt-5">
                  <AuthGate reason="join the SS4 League" onAction={() => navigate('/dashboard')}>
                    <Button
                      variant="primary"
                      className="w-full uppercase tracking-wider text-xs py-2.5 font-black shadow-sm"
                    >
                      Join SS4 League
                    </Button>
                  </AuthGate>
                </div>
              </div>
            )}

            {/* M3 Filter Chips - Stacked (Proximity & Grouping compliant) */}
            <div className="varsity-card p-4 space-y-1.5 text-left">
              <span className="block text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-2">
                Feed Filter
              </span>
              {[
                { id: "all", label: "All Updates", icon: <CommunityIcon /> },
                { id: "announcements", label: "Announcements", icon: <AnnouncementIcon /> },
                { id: "results", label: "Match Results", icon: <MatchIcon /> }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`m3-filter-chip w-full justify-start text-sm font-bold py-3 min-h-[44px] ${
                    activeFilter === f.id 
                      ? "active-primary" 
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {activeFilter === f.id ? <CheckIcon /> : <span className="text-gray-600 shrink-0">{f.icon}</span>}
                    {f.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Calendar & Upcoming Events Widget (M3 Outlined Card) */}
            <div className="varsity-card p-5 text-left">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-brand-accent"><CalendarIcon /></span>
                <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                  League Calendar
                </h4>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 bg-m3-surface-low rounded-xl border border-m3-outline-variant">
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">Next Tournament</span>
                  <a href="/chess-league/tournament" className="text-sm font-bold text-brand-text-dark block mt-1 hover:text-brand-primary transition-colors">
                    July 2026 Monthly Tournament
                  </a>
                  <span className="text-xs font-semibold text-gray-700 block mt-0.5">
                    Starts <span className="font-black text-xs text-brand-primary">July 25</span> | Secure your bracket
                  </span>
                </div>
                <div className="p-3.5 bg-m3-surface-low rounded-xl border border-m3-outline-variant">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block">Daily League</span>
                  <span class="text-sm font-bold text-brand-text-dark block mt-1">Lichess Tournament</span>
                  <span class="text-xs font-semibold text-gray-700 block mt-0.5">Every night at 8 PM</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Feed Stream (50%)  first on mobile */}
          <div className="lg:col-span-2 space-y-6 text-left order-1 lg:order-2">
            
            {/* Header Feed Title */}
            <div className="flex items-center justify-between pb-3.5 border-b border-m3-outline-variant">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-black font-space text-brand-text-dark uppercase tracking-widest">
                  League & Community Feed
                </h2>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Live
                </span>
              </div>
              <a href="/news" className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">
                Full Feed View →
              </a>
            </div>

            {/* Extracted SAS Feed Display System */}
            <FeedContainer 
              showHeader={false}
              className="w-full"
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              showComposer={true}
            />

            {/* Spotlights Sub-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Featured Player Spotlight (M3 Filled Card style) */}
              <div className="varsity-card p-5 bg-m3-surface-low relative overflow-hidden border-none shadow-none text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-brand-accent"><TrophyIcon /></span>
                  <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                    Player Spotlight
                  </h4>
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-accent to-yellow-400 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {dailySpotlightPlayer.avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-brand-text-dark truncate leading-tight">{dailySpotlightPlayer.name}</h4>
                    <p className="text-[10px] font-semibold text-gray-650 truncate mt-0.5">{dailySpotlightPlayer.detail}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3.5 border-t border-m3-outline-variant/60 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">{dailySpotlightPlayer.metric1Label}</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-black rounded-md mt-1">
                      {dailySpotlightPlayer.metric1Value}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">{dailySpotlightPlayer.metric2Label}</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-md mt-1">
                      {dailySpotlightPlayer.metric2Value} ELO
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Institution Spotlight (M3 Filled Card style) */}
              <div className="varsity-card p-5 bg-m3-surface-low border-none shadow-none text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-brand-primary"><SchoolIcon /></span>
                  <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                    Top Institution
                  </h4>
                </div>
                <div>
                  <h4 className="text-sm font-black text-brand-text-dark leading-tight mt-3">
                    Bells University of Technology
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-600 mt-1">Ota, Ogun State &bull; Mechatronics hub</p>
                </div>
                <div className="mt-4 pt-3.5 border-t border-m3-outline-variant/60 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Registrations</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-md mt-1">
                      45 students
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Avg ELO</span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-black rounded-md mt-1">
                      1540
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Leaderboards Widget (25%)  stacked on mobile, sidebar on large screens */}
          <div className="lg:col-span-1 space-y-6 text-left order-3 block">
            
            {/* Leaderboard Card (M3 Outlined container) */}
            <div className="varsity-card p-5">
              <div className="pb-3 border-b border-m3-outline-variant mb-4">
                <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-widest">
                  Leaderboards
                </h4>
              </div>
              
              {/* Segmented Button (Players vs Friendlies vs Schools) - 48px compliant spacing */}
              <div className="m3-segmented-container w-full mb-4">
                <button
                  onClick={() => setLeaderboardTab("players")}
                  className={`m3-segmented-item ${
                    leaderboardTab === "players" ? "active" : ""
                  }`}
                >
                  Players
                </button>
                <button
                  onClick={() => setLeaderboardTab("friendlies")}
                  className={`m3-segmented-item ${
                    leaderboardTab === "friendlies" ? "active" : ""
                  }`}
                >
                  League
                </button>
                <button
                  onClick={() => setLeaderboardTab("schools")}
                  className={`m3-segmented-item ${
                    leaderboardTab === "schools" ? "active" : ""
                  }`}
                >
                  Schools
                </button>
              </div>

              {/* Sub-segmented Tab Menu for player divisions */}
              {leaderboardTab === "players" && (
                <div className="flex bg-m3-surface-variant border border-m3-outline-variant rounded-xl p-1 mb-4 overflow-x-auto no-scrollbar">
                  {[
                    { id: "A", label: "A (1800+)" },
                    { id: "Fork", label: "Fork" },
                    { id: "Pin", label: "Pin" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedDivision(tab.id)}
                      className={`flex-grow py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer min-h-[32px] whitespace-nowrap px-1 ${
                        selectedDivision === tab.id 
                          ? 'bg-white text-brand-primary shadow-sm border border-m3-outline/20' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Leaderboards List */}
              {leaderboardTab === "players" ? (
                <div className="space-y-2">
                  {leaderboardPlayers.map((p, i) => {
                    // M3/Von Restorff Colored Circle Badges for Top Positions
                    const badgeColors = 
                      i === 0 ? "bg-gold text-gray-900 font-black" : // Gold
                      i === 1 ? "bg-silver text-gray-900 font-black" : // Silver
                      i === 2 ? "bg-bronze text-gray-900 font-black" : // Bronze
                      "bg-m3-surface-variant text-gray-800 font-bold";

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedPlayer(p)}
                        className={`w-full flex items-center justify-between text-sm gap-3 p-2 rounded-xl text-left hover:bg-m3-surface-variant transition-colors duration-50 cursor-default will-change-[background-color] focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2 ${
                          isCurrentUser(p) ? "bg-brand-primary/10 border border-brand-primary/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${badgeColors}`}>
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-brand-text-dark truncate leading-tight" title={p.name}>{p.name}</p>
                            <p className="text-[10px] font-semibold text-gray-650 truncate mt-0.5" title={p.university}>{p.university}</p>
                          </div>
                        </div>
                        <span className="font-black text-brand-primary font-space shrink-0">
                          {p.chess_rating}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : leaderboardTab === "friendlies" ? (
                <div className="space-y-2">
                  {dailyFriendliesLeaderboard.slice(0, 6).map((p, i) => {
                    const badgeColors = 
                      i === 0 ? "bg-gold text-gray-900 font-black" : // Gold
                      i === 1 ? "bg-silver text-gray-900 font-black" : // Silver
                      i === 2 ? "bg-bronze text-gray-900 font-black" : // Bronze
                      "bg-m3-surface-variant text-gray-800 font-bold";

                    return (
                      <button
                        key={i}
                        onClick={() => handlePlayerClick(p.username)}
                        className={`w-full flex items-center justify-between text-sm gap-3 p-2 rounded-xl text-left hover:bg-m3-surface-variant transition-colors duration-50 cursor-default will-change-[background-color] focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2 ${
                          isCurrentUser(p) ? "bg-brand-primary/10 border border-brand-primary/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${badgeColors}`}>
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-brand-text-dark truncate leading-tight" title={p.name}>{p.name}</p>
                            <p className="text-[10px] font-semibold text-gray-650 mt-0.5 truncate" title={p.university}>
                              {p.university} &bull; {p.wins > 0 ? `🏆 ${p.wins} Arena Win${p.wins > 1 ? 's' : ''}` : 'Active'}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-brand-accent font-space shrink-0">
                          {p.pts} pts
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboardSchools.map((s, i) => {
                    const badgeColors = 
                      i === 0 ? "bg-gold text-gray-900 font-black" : 
                      i === 1 ? "bg-silver text-gray-900 font-black" : 
                      i === 2 ? "bg-bronze text-gray-900 font-black" : 
                      "bg-m3-surface-variant text-gray-800 font-bold";

                    return (
                      <div key={i} className="flex items-center justify-between text-sm gap-3 p-2 rounded-xl">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${badgeColors}`}>
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-brand-text-dark truncate leading-tight" title={s.name}>{s.name}</p>
                            <p className="text-[10px] font-semibold text-gray-600 mt-0.5 truncate" title={s.name}>{s.count} competitors</p>
                          </div>
                        </div>
                        <span className="font-black text-brand-accent font-space shrink-0">
                          {s.avgRating}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
      {selectedPlayer && (
        <PlayerProfile 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </>
  );
}
