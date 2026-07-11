import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase";
import Button from "../components/Button";
import Input from "../components/Input";
import StudentSignupModal from "../components/StudentSignupModal";
import { toast } from "react-toastify";
import mockPlayers from "../data/playersWithRatings.json";

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

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [leaderboardTab, setLeaderboardTab] = useState("players");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dbAnnouncements, setDbAnnouncements] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);
  const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
  const [leaderboardSchools, setLeaderboardSchools] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // 1. Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch announcements
        const { data: ann } = await supabase
          .from("announcements")
          .select("*, sender:profiles(name)")
          .order("created_at", { ascending: false });
        setDbAnnouncements(ann || []);

        // Fetch matches from active/completed tournaments
        const { data: tournaments } = await supabase
          .from("tournaments")
          .select("*");
        
        const extractedMatches = [];
        (tournaments || []).forEach(t => {
          (t.rounds || []).forEach(r => {
            (r.games || []).forEach(g => {
              if (g.winner) {
                extractedMatches.push({
                  id: `${t.id}_${r.name}_${g.id}`,
                  tournamentName: t.name,
                  roundName: r.name,
                  white: g.white,
                  black: g.black,
                  winner: g.winner,
                  gameLink: g.gameLink || "",
                  date: t.month_year
                });
              }
            });
          });
        });
        setDbMatches(extractedMatches.slice(0, 8));

        // Fetch top registered players from profiles table
        const { data: profs } = await supabase
          .from("profiles")
          .select("name, university, chess_username, lichess_username, chess_rating, lichess_rating")
          .order("chess_rating", { ascending: false })
          .limit(8);

        // Merge with mock players if db is sparse
        const mergedPlayers = [...(profs || [])];
        mockPlayers.slice(0, 10).forEach(m => {
          if (!mergedPlayers.find(p => p.chess_username?.toLowerCase() === m.username.toLowerCase())) {
            mergedPlayers.push({
              name: m.name,
              university: m.school,
              chess_username: m.username,
              chess_rating: m.rating || 1200
            });
          }
        });
        setLeaderboardPlayers(mergedPlayers.sort((a, b) => (b.chess_rating || 0) - (a.chess_rating || 0)).slice(0, 6));

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

      } catch (err) {
        console.error("Error fetching landing feed:", err);
      } finally {
        setLoadingFeed(false);
      }
    };

    loadData();
  }, []);

  // 2. Mix content into a unified social feed
  const buildFeedItems = () => {
    const feed = [];

    // Add Live Announcements
    dbAnnouncements.forEach(a => {
      feed.push({
        id: `ann_${a.id}`,
        type: "announcement",
        title: a.title,
        content: a.content,
        author: a.sender?.name || "SS4 Admin",
        date: new Date(a.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
        timestamp: new Date(a.created_at).getTime()
      });
    });

    // Add Live Match Results
    dbMatches.forEach(m => {
      const winnerName = typeof m.winner === "object" ? m.winner.name : m.winner;
      feed.push({
        id: `match_${m.id}`,
        type: "match",
        tournamentName: m.tournamentName,
        roundName: m.roundName,
        white: m.white,
        black: m.black,
        winner: winnerName,
        gameLink: m.gameLink,
        date: m.date,
        timestamp: new Date(`${m.date}-01`).getTime()
      });
    });

    // Static community items to populate feed
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

    feed.push(...staticPosts);

    // Sort feed items by newest timestamp
    const sortedFeed = feed.sort((a, b) => b.timestamp - a.timestamp);

    // Apply filters
    if (activeFilter === "announcements") {
      return sortedFeed.filter(item => item.type === "announcement");
    }
    if (activeFilter === "results") {
      return sortedFeed.filter(item => item.type === "match");
    }
    if (activeFilter === "community") {
      return sortedFeed.filter(item => item.type === "community");
    }
    return sortedFeed;
  };

  const feedItems = buildFeedItems();

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8">
        
        {/* Main Grid: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Left Navigation & Profile Widget (25%) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Session Card */}
            {user ? (
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-lg flex items-center justify-center shadow-sm">
                    {profile?.name?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-brand-text-dark leading-tight">{profile?.name || "Player Profile"}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{profile?.university || "SS4 Member"}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Chess Rating</span>
                    <span className="font-bold text-brand-primary mt-0.5 block">{profile?.chess_rating || 1200}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Role</span>
                    <span className="font-bold text-brand-accent uppercase mt-0.5 block">{profile?.role || "Player"}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    variant="primary" 
                    className="w-full text-[10px] py-2 rounded-full uppercase tracking-wider font-black shadow-sm"
                  >
                    My Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl"></div>
                <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">Academic League</h3>
                <p className="text-xs font-semibold text-gray-600 mt-2 leading-relaxed">
                  Join a connected community of students competing, chatting, and striving for excellence.
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)} 
                    variant="primary" 
                    className="w-full text-[10px] py-2 rounded-full uppercase tracking-wider font-black shadow-md"
                  >
                    Join SS4 League
                  </Button>
                </div>
              </div>
            )}

            {/* Feed Filters */}
            <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Feed Filter</span>
              {[
                { id: "all", label: "All Updates", icon: <CommunityIcon /> },
                { id: "announcements", label: "Announcements", icon: <AnnouncementIcon /> },
                { id: "results", label: "Match Results", icon: <MatchIcon /> },
                { id: "community", label: "Community Milestones", icon: <TrophyIcon /> }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeFilter === f.id 
                      ? "bg-brand-primary text-white" 
                      : "text-gray-600 hover:bg-brand-bg-cream"
                  }`}
                >
                  <span className={activeFilter === f.id ? "text-white" : "text-gray-400"}>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Calendar & Upcoming Events Widget */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-accent"><CalendarIcon /></span>
                <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">League Calendar</h4>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-brand-bg-cream/40 rounded-xl border border-gray-100">
                  <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest block">Next Tournament</span>
                  <span className="font-bold text-brand-text-dark block mt-1">July 2026 Monthly Cup</span>
                  <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">Starts last 7 days of the month</span>
                </div>
                <div className="p-3 bg-brand-bg-cream/40 rounded-xl border border-gray-100">
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest block">Daily Fixtures</span>
                  <span className="font-bold text-brand-text-dark block mt-1">League Matches</span>
                  <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">Every 2 days (continuous)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Feed Stream (50%) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Feed Title */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-150">
              <h2 className="text-sm font-black font-space text-brand-text-dark uppercase tracking-widest">
                League Feed
              </h2>
              <span className="text-[10px] font-black bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full uppercase tracking-wider">
                Live updates
              </span>
            </div>

            {/* Main Feed Content */}
            {loadingFeed ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400 italic">
                Loading community feed...
              </div>
            ) : feedItems.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xs font-semibold text-gray-400 italic">No posts found matching the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-gray-150">
                {feedItems.map((item, index) => {
                  const paddingClass = index === 0 ? "" : "pt-6";
                  
                  // Feed Card types
                  if (item.type === "announcement") {
                    return (
                      <div key={item.id} className={`${paddingClass} flex gap-4 items-start`}>
                        <div className="w-9 h-9 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <AnnouncementIcon />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                            <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">
                              {item.title}
                            </h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-600 mt-2 leading-relaxed">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-1 mt-3">
                            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                            <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                              Broadcast by {item.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === "match") {
                    const whiteName = item.white?.name || "Player White";
                    const blackName = item.black?.name || "Player Black";
                    
                    return (
                      <div key={item.id} className={`${paddingClass} flex gap-4 items-start`}>
                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <MatchIcon />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1.5">
                            <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">
                              Match Result
                            </h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {item.roundName}
                            </span>
                          </div>
                          
                          {/* Visual match pairing output */}
                          <div className="bg-brand-bg-cream/45 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">White</span>
                              <h4 className="text-xs font-black text-brand-text-dark truncate max-w-full">{whiteName}</h4>
                              <span className="text-[9px] font-semibold text-gray-400 mt-0.5">@{item.white?.username}</span>
                            </div>
                            
                            <div className="text-center font-black font-space text-xs text-gray-400 px-3 py-1 bg-white border border-gray-100 rounded-full select-none shadow-sm">
                              VS
                            </div>

                            <div className="flex-1 flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Black</span>
                              <h4 className="text-xs font-black text-brand-text-dark truncate max-w-full">{blackName}</h4>
                              <span className="text-[9px] font-semibold text-gray-400 mt-0.5">@{item.black?.username}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between mt-3 gap-2.5">
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                              🏆 Winner: {item.winner || "Draw"}
                            </p>
                            {item.gameLink && (
                              <a 
                                href={item.gameLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] font-black text-brand-accent hover:underline uppercase tracking-wider"
                              >
                                View game on board &rarr;
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default community milestone type
                  return (
                    <div key={item.id} className={`${paddingClass} flex gap-4 items-start`}>
                      <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <CommunityIcon />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                          <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">
                            {item.title}
                          </h3>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 mt-2 leading-relaxed">
                          {item.content}
                        </p>
                        <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mt-2">
                          &bull; Published by {item.author}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Column 3: Right Spotlights & Leaderboards Widget (25%) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Dynamic Tabbed Leaderboard */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-widest">
                  Leaderboards
                </h4>
                <div className="flex bg-brand-bg-cream rounded-full p-0.5 border border-gray-100">
                  <button
                    onClick={() => setLeaderboardTab("players")}
                    className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-1 rounded-full cursor-pointer focus:outline-none transition-all ${
                      leaderboardTab === "players" ? "bg-brand-primary text-white shadow-sm" : "text-gray-400"
                    }`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => setLeaderboardTab("schools")}
                    className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-1 rounded-full cursor-pointer focus:outline-none transition-all ${
                      leaderboardTab === "schools" ? "bg-brand-primary text-white shadow-sm" : "text-gray-400"
                    }`}
                  >
                    Schools
                  </button>
                </div>
              </div>

              {leaderboardTab === "players" ? (
                <div className="space-y-3.5">
                  {leaderboardPlayers.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 bg-brand-bg-cream text-[10px] font-black text-brand-text-dark rounded-full flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-brand-text-dark truncate leading-tight">{p.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 truncate mt-0.5">{p.university}</p>
                        </div>
                      </div>
                      <span className="font-black text-brand-primary font-space flex-shrink-0">
                        {p.chess_rating}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {leaderboardSchools.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 bg-brand-bg-cream text-[10px] font-black text-brand-text-dark rounded-full flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-brand-text-dark truncate leading-tight">{s.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5">{s.count} registered players</p>
                        </div>
                      </div>
                      <span className="font-black text-brand-accent font-space flex-shrink-0">
                        {s.avgRating}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Player Spotlight */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-accent"><TrophyIcon /></span>
                <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">Player Spotlight</h4>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-accent to-yellow-400 text-white font-black text-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  K
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-text-dark leading-tight">Kingsley Ekpo</h4>
                  <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Computer Science &bull; UniUyo</p>
                </div>
              </div>
              <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Win Streak</span>
                  <span className="font-bold text-brand-accent mt-0.5 block">6 wins</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Rating (Rapid)</span>
                  <span className="font-bold text-brand-primary mt-0.5 block">1945 ELO</span>
                </div>
              </div>
            </div>

            {/* Featured Institution Spotlight */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-primary"><SchoolIcon /></span>
                <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">Top Institution</h4>
              </div>
              <div>
                <h4 className="text-xs font-black text-brand-text-dark leading-tight mt-3">Bells University of Technology</h4>
                <p className="text-[9px] font-semibold text-gray-400 mt-1">Ota, Ogun State &bull; Mechatronics & CS hubs</p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Registrations</span>
                  <span className="font-bold text-brand-primary mt-0.5 block">45 students</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Avg ELO</span>
                  <span className="font-bold text-brand-accent mt-0.5 block">1540</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Render Authentication Modal if clicked */}
      {isAuthModalOpen && (
        <StudentSignupModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
