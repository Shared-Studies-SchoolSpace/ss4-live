import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase";
import Button from "../components/Button";
import AuthGate from "../components/auth/AuthGate";
import { toast } from "react-toastify";
import mockPlayers from "../data/playersWithRatings.json";
import { MatchResult } from "../components/chess/MatchResult";
import { PlayerProfile } from "../components/chess/PlayerProfile";
import { Hero } from "../components/Hero";
import { fetchCompletePlayerData } from "../utils/chessService";


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
              isDark ? "bg-[#FAF8F4]" : "bg-m3-surface-variant"
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
    const isCached = sessionStorage.getItem('ss4_landing_preloaded_v2');
    if (isCached) {
      try {
        const cached = JSON.parse(isCached);
        setDbAnnouncements(cached.dbAnnouncements || []);
        setDbMatches(cached.dbMatches || []);
        setAllPlayers(cached.allPlayers || []);
        setLeaderboardSchools(cached.leaderboardSchools || []);
        setIsPreloading(false);
        setLoadingFeed(false);
        return;
      } catch (e) {
        // Cache corrupted or disabled, fetch fresh
      }
    }

    const loadAndPreload = async () => {
      try {
        setPreloadStatus("Connecting to Supabase...");
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
        
        const extractedMatches = [];
        (tournaments || []).forEach(t => {
          (t.rounds || []).forEach(r => {
            (r.games || []).forEach(g => {
              const isP1Bye = g.p1?.username?.toLowerCase() === 'bye' || g.p1?.name?.toUpperCase() === 'BYE';
              const isP2Bye = g.p2?.username?.toLowerCase() === 'bye' || g.p2?.name?.toUpperCase() === 'BYE';
              if (g.winner && !isP1Bye && !isP2Bye) {
                extractedMatches.push({
                  id: `${t.id}_${r.name}_${g.id}`,
                  tournamentName: t.name,
                  roundName: r.name,
                  white: g.p1 || g.white,
                  black: g.p2 || g.black,
                  winner: g.winner,
                  gameLink: g.gameLink || "",
                  date: t.month_year
                });
              }
            });
          });
        });
        const finalMatches = extractedMatches.slice(0, 8);
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
          leaderboardSchools: schools
        };
        sessionStorage.setItem('ss4_landing_preloaded_v2', JSON.stringify(cachedPayload));
        
        setPreloadProgress(100);
        setPreloadStatus("Ready!");

        setTimeout(() => {
          setIsPreloading(false);
          setLoadingFeed(false);
        }, 500);

      } catch (err) {
        console.error("Error preloading feed data:", err);
        setIsPreloading(false);
        setLoadingFeed(false);
      }
    };

    loadAndPreload();
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
      const winnerName = typeof m.winner === "object" ? m.winner.name : m.winner;
      // parse date or fallback to now
      const parsedTimestamp = m.date ? Date.parse(`${m.date}-01`) : NaN;
      return {
        id: `match_${m.id}`,
        type: "match",
        tournamentName: m.tournamentName,
        roundName: m.roundName,
        white: m.white,
        black: m.black,
        winner: winnerName,
        gameLink: m.gameLink,
        date: m.date,
        timestamp: isNaN(parsedTimestamp) ? Date.now() : parsedTimestamp
      };
    });
  }, [dbMatches]);

  const newsSafeIdx = feedAnnouncements.length ? newsSlideIdx % feedAnnouncements.length : 0;
  const matchSafeIdx = feedMatches.length ? matchSlideIdx % feedMatches.length : 0;

  // Auto-advance news slideshow
  useEffect(() => {
    if (feedAnnouncements.length < 2) return;
    const t = setInterval(() =>
      setNewsSlideIdx(p => (p + 1) % feedAnnouncements.length), 5000);
    return () => clearInterval(t);
  }, [feedAnnouncements.length]);

  // Auto-advance match slideshow
  useEffect(() => {
    if (feedMatches.length < 2) return;
    const t = setInterval(() =>
      setMatchSlideIdx(p => (p + 1) % feedMatches.length), 6000);
    return () => clearInterval(t);
  }, [feedMatches.length]);

  if (isPreloading) {
    return (
      <div className="fixed inset-0 bg-[#FAF8F4] z-[9999] flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Varsity Shield */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-white text-5xl font-black font-space select-none">S</span>
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-brand-accent rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs select-none">👑</span>
          </div>
        </div>
        
        {/* Text Details */}
        <h2 className="text-lg font-black text-brand-text-dark font-space uppercase tracking-widest mb-2">
          SS4 League Arena
        </h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 animate-pulse">
          {preloadStatus}
        </p>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-250 rounded-full overflow-hidden border border-gray-300/40">
          <div 
            className="h-full bg-brand-accent transition-all duration-300 rounded-full"
            style={{ width: `${preloadProgress}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-brand-primary mt-2.5 uppercase tracking-widest">
          {preloadProgress}% Preloaded
        </span>
      </div>
    );
  }

  return (
    <>
      <Hero />

      {/* 2. Main Social/Dashboard Grid: 3 Columns */}
      <div className="container mx-auto px-3 sm:px-6 md:px-12 lg:px-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Column 1: Profile Widget & Left Filters (25%) — moved below feed on mobile */}
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
                { id: "results", label: "Match Results", icon: <MatchIcon /> },
                { id: "community", label: "Milestones", icon: <TrophyIcon /> }
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
                <div className="p-3.5 bg-[#FAF8F4] rounded-xl border border-m3-outline-variant">
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">Next Tournament</span>
                  <a href="/chess-league" className="text-sm font-bold text-brand-text-dark block mt-1 hover:text-brand-primary transition-colors">
                    July 2026 Monthly Tournament
                  </a>
                  <span className="text-xs font-semibold text-gray-700 block mt-0.5">
                    Starts <span className="font-black text-xs text-brand-primary">July 25</span> | Secure your bracket
                  </span>
                </div>
                <div className="p-3.5 bg-[#FAF8F4] rounded-xl border border-m3-outline-variant">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block">Daily Fixtures</span>
                  <span className="text-sm font-bold text-brand-text-dark block mt-1">League Matches</span>
                  <span className="text-xs font-semibold text-gray-700 block mt-0.5">Every 2 days (continuous)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Feed Stream (50%) — first on mobile */}
          <div className="lg:col-span-2 space-y-6 text-left order-1 lg:order-2">
            
            {/* Header Feed Title */}
            <div className="flex items-center justify-between pb-3.5 border-b border-m3-outline-variant">
              <h2 className="text-base font-black font-space text-brand-text-dark uppercase tracking-widest">
                League Feed
              </h2>
              <span className="text-xs font-black bg-brand-accent/10 text-brand-accent px-3.5 py-1 rounded-full uppercase tracking-wider">
                Live updates
              </span>
            </div>

            {/* News / Announcements Auto-Sliding Card */}
            {feedAnnouncements.length > 0 && (() => {
              const item = feedAnnouncements[newsSafeIdx];
              return (
                <div className="varsity-card p-5 bg-white overflow-hidden relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                        <AnnouncementIcon />
                      </span>
                      <span className="text-xs font-black text-brand-text-dark uppercase tracking-widest">Announcements</span>
                    </div>
                    {feedAnnouncements.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        {feedAnnouncements.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setNewsSlideIdx(idx)}
                            aria-label={`Announcement ${idx + 1}`}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                              idx === newsSafeIdx ? "bg-brand-accent scale-125" : "bg-brand-accent/30 hover:bg-brand-accent/60"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative min-h-[72px]">
                    <AnimatePresence mode="wait" initial={false}>
                      <Motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1.5">
                          <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">{item.title}</h3>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.date}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.content}</p>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Broadcast by {item.author}</span>
                        </div>
                      </Motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}

            {/* Match Results Sliding Card */}
            {feedMatches.length === 0 ? null : (() => {
              const item = feedMatches[matchSafeIdx];
              const wLabel = `${item.white?.name || ''} (${item.white?.username || ''})`;
              const bLabel = `${item.black?.name || ''} (${item.black?.username || ''})`;
              const resValue = item.winner === item.white?.name ? 'white'
                : item.winner === item.black?.name ? 'black'
                : (item.winner === 'Draw' || item.winner === 'draw') ? 'draw'
                : null;
              return (
                <div className="varsity-card p-5 bg-white space-y-4 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] select-none">sports_esports</span>
                      </div>
                      <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">Match Results</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {feedMatches.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          {feedMatches.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setMatchSlideIdx(idx)}
                              aria-label={`Match ${idx + 1}`}
                              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                                idx === matchSafeIdx ? "bg-brand-primary scale-125" : "bg-brand-primary/30 hover:bg-brand-primary/60"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-650 bg-m3-surface-variant px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.roundName}
                      </span>
                    </div>
                  </div>

                  {/* Sliding content */}
                  <AnimatePresence mode="wait" initial={false}>
                    <Motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    >
                      <MatchResult
                        w={wLabel}
                        b={bLabel}
                        res={resValue}
                        date={item.date}
                        round={item.roundName}
                        division={{ players: allPlayers }}
                        onPlayerSelect={(p) => setSelectedPlayer(p)}
                        isAdmin={false}
                      />
                      {item.gameLink && (
                        <div className="flex justify-end pt-1">
                          <a
                            href={item.gameLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-black text-brand-primary hover:text-brand-accent uppercase tracking-wider inline-flex items-center gap-0.5"
                          >
                            View Game Board <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        </div>
                      )}
                    </Motion.div>
                  </AnimatePresence>
                </div>
              );
            })()}

          </div>

          {/* Column 3: Spotlights & Leaderboards Widget (25%) — hidden on small mobile, visible from md */}
          <div className="lg:col-span-1 space-y-6 text-left order-3 hidden md:block lg:block">
            
            {/* Leaderboard Card (M3 Outlined container) */}
            <div className="varsity-card p-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-m3-outline-variant mb-4">
                <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-widest">
                  Leaderboards
                </h4>
                
                {/* Segmented Button (Players vs Schools) - 48px compliant spacing */}
                <div className="m3-segmented-container">
                  <button
                    onClick={() => setLeaderboardTab("players")}
                    className={`m3-segmented-item px-3 ${
                      leaderboardTab === "players" ? "active" : ""
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => setLeaderboardTab("schools")}
                    className={`m3-segmented-item px-3 ${
                      leaderboardTab === "schools" ? "active" : ""
                    }`}
                  >
                    Schools
                  </button>
                </div>
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
                <div className="space-y-4">
                  {leaderboardPlayers.map((p, i) => {
                    // M3/Von Restorff Colored Circle Badges for Top Positions
                    const badgeColors = 
                      i === 0 ? "bg-[#FFD700] text-gray-900 font-black" : // Gold
                      i === 1 ? "bg-[#C0C0C0] text-gray-900 font-black" : // Silver
                      i === 2 ? "bg-[#CD7F32] text-white font-black" :    // Bronze
                      "bg-m3-surface-variant text-gray-750 font-bold";

                    return (
                      <div key={i} className="flex items-center justify-between text-sm gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${badgeColors}`}>
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-brand-text-dark truncate leading-tight">{p.name}</p>
                            <p className="text-[10px] font-semibold text-gray-600 truncate mt-0.5">{p.university}</p>
                          </div>
                        </div>
                        <span className="font-black text-brand-primary font-space shrink-0">
                          {p.chess_rating}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboardSchools.map((s, i) => {
                    const badgeColors = 
                      i === 0 ? "bg-[#FFD700] text-gray-900 font-black" : 
                      i === 1 ? "bg-[#C0C0C0] text-gray-900 font-black" : 
                      i === 2 ? "bg-[#CD7F32] text-white font-black" : 
                      "bg-m3-surface-variant text-gray-750 font-bold";

                    return (
                      <div key={i} className="flex items-center justify-between text-sm gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${badgeColors}`}>
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-brand-text-dark truncate leading-tight">{s.name}</p>
                            <p className="text-[10px] font-semibold text-gray-600 mt-0.5 truncate">{s.count} competitors</p>
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

            {/* Featured Player Spotlight (M3 Filled Card style) */}
            <div className="varsity-card p-5 bg-[#FAF8F4] relative overflow-hidden border-none shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-accent"><TrophyIcon /></span>
                <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                  Player Spotlight
                </h4>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-accent to-yellow-400 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                  K
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-brand-text-dark truncate leading-tight">Kingsley Ekpo</h4>
                  <p className="text-[10px] font-semibold text-gray-600 truncate mt-0.5">Computer Science &bull; UniUyo</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3.5 border-t border-m3-outline-variant/60 flex items-center justify-between text-sm">
                <div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Win Streak</span>
                  <span className="inline-flex items-center px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-black rounded-md mt-1">
                    6 wins
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Rating (Rapid)</span>
                  <span className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-md mt-1">
                    1945 ELO
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Institution Spotlight (M3 Filled Card style) */}
            <div className="varsity-card p-5 bg-[#FAF8F4] border-none shadow-none">
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
