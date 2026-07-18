import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../../../supabase';

import { fetchChessComStats, fetchLichessStats, searchMutualGames } from '../../chess-league/utils/chessService';
import MatchChat from '../../chess-league/components/MatchChat';
import DirectChat from '../../../components/messaging/DirectChat';
import AnnouncementBanner from '../../../components/announcements/AnnouncementBanner';
import AdminBroadcastPanel from '../../../components/announcements/AdminBroadcastPanel';
import Button from '../../../components/Button';
import { toast } from 'react-toastify';

/**
 * Inline guard shown on restricted tabs for unverified users.
 */
function UnverifiedGuard({ feature }) {
  return (
    <div className="varsity-card p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider font-space">
        Verify Your Email First
      </h3>
      <p className="text-xs font-semibold text-gray-400 mt-2 max-w-xs leading-relaxed">
        <span className="text-brand-primary font-bold">{feature}</span> is only available to verified accounts.
        Check your inbox and click the confirmation link we sent you.
      </p>
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">
        Didn't receive it? Use the banner at the top of the page to resend.
      </p>
    </div>
  );
}


export default function DashboardPage() {
  const { user, profile, refreshProfile, unreadMessages = [], updatePlayerDivision } = useAuth();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const [loadingSync, setLoadingSync] = useState(false);
  const [activePairings, setActivePairings] = useState([]);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const [scanningPairingId, setScanningPairingId] = useState(null);
  const [awards, setAwards] = useState([]);

  // SCL Tournament registration states
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);

  // Fetch upcoming tournament to handle single-click registration.
  // Admin creates tournament rows — we never auto-generate them.
  useEffect(() => {
    if (!user) return;
    const fetchUpcoming = async () => {
      try {
        const nowObj = new Date();
        const curMY = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}`;

        // Delete stale upcoming rows beyond the current month (cleanup for old auto-created rows)
        await supabase
          .from('tournaments')
          .delete()
          .eq('status', 'upcoming')
          .gt('month_year', curMY);

        const { data: rows, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .order('month_year', { ascending: true })
          .limit(1);

        if (error) throw error;
        const data = rows?.[0] ?? null;

        setUpcomingTournament(data);
      } catch (err) {
        console.error('Error loading SCL tournament registration:', err);
      }
    };

    fetchUpcoming();
  }, [user]);

  // Set isRegistered status based on profiles table registration (Logic B)
  useEffect(() => {
    if (profile) {
      setIsRegistered(!!(profile.chess_username || profile.lichess_username));
    }
  }, [profile]);

  const handleRegisterReady = async () => {
    if (!upcomingTournament || !profile) return;
    setLoadingReg(true);
    
    try {
      const regPlayer = {
        id: user.id,
        name: profile.name,
        username: profile.chess_username || profile.lichess_username || user.email.split('@')[0],
        rating: Math.max(profile.chess_rating || 0, profile.lichess_rating || 0) || 1200,
        school: profile.university || 'SS4 Member',
        department: profile.department || ''
      };
      
      const updatedPlayers = [
        ...(upcomingTournament.players || []).filter(p => p.id !== user.id),
        regPlayer
      ];
      
      const { error } = await supabase
        .from('tournaments')
        .update({ players: updatedPlayers })
        .eq('id', upcomingTournament.id);
        
      if (error) throw error;
      
      setUpcomingTournament(prev => ({ ...prev, players: updatedPlayers }));
      setIsRegistered(true);
      toast.success("Ready! You are confirmed for the tournament.");
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Registration failed: ' + err.message);
    } finally {
      setLoadingReg(false);
    }
  };

  // Check query params on mount/location change to switch activeTab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      // Just a check to prevent rendering empty states
    }
  }, [user]);

  // Load pairings and awards
  useEffect(() => {
    if (!user || !profile) return;

    const loadPairings = async () => {
      try {
        // Fetch tournaments
        const { data: tournaments } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'active');

        const activeGames = [];
        (tournaments || []).forEach(t => {
          const rounds = t.rounds || [];
          rounds.forEach(r => {
            const games = r.games || [];
            games.forEach(g => {
              const matchesMyChess = profile.chess_username && (
                g.white?.username?.toLowerCase() === profile.chess_username.toLowerCase() ||
                g.black?.username?.toLowerCase() === profile.chess_username.toLowerCase()
              );
              const matchesMyLichess = profile.lichess_username && (
                g.white?.username?.toLowerCase() === profile.lichess_username.toLowerCase() ||
                g.black?.username?.toLowerCase() === profile.lichess_username.toLowerCase()
              );

              if (matchesMyChess || matchesMyLichess) {
                // Determine opponent
                const isWhite = g.white?.username?.toLowerCase() === profile.chess_username?.toLowerCase() ||
                                g.white?.username?.toLowerCase() === profile.lichess_username?.toLowerCase();
                const opponent = isWhite ? g.black : g.white;

                activeGames.push({
                  id: `${t.id}_${r.name.replace(/\s+/g, '')}_${g.id}`,
                  tournamentId: t.id,
                  roundName: r.name,
                  gameId: g.id,
                  opponent,
                  isWhite,
                  pairing: g
                });
              }
            });
          });
        });

        setActivePairings(activeGames);
      } catch (err) {
        console.error('Error fetching pairings:', err);
      }
    };

    const loadAwards = async () => {
      try {
        const { data, error } = await supabase
          .from('awards')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setAwards(data || []);
      } catch (err) {
        console.error('Error loading awards:', err);
      }
    };

    loadPairings();
    loadAwards();
  }, [user, profile]);

  const handleSyncRatings = async () => {
    if (!profile) return;
    setLoadingSync(true);
    toast.info('Syncing ratings with platforms...');

    try {
      let chessRating = profile.chess_rating || 0;
      let lichessRating = profile.lichess_rating || 0;

      if (profile.chess_username) {
        const stats = await fetchChessComStats(profile.chess_username);
        if (!stats.error) chessRating = stats.rating;
      }

      if (profile.lichess_username) {
        const stats = await fetchLichessStats(profile.lichess_username);
        if (!stats.error) lichessRating = stats.rating;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          chess_rating: chessRating,
          lichess_rating: lichessRating,
          last_rating_sync: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Auto-assign player division on rating sync
      try {
        const maxRating = Math.max(chessRating, lichessRating);
        await updatePlayerDivision(profile, maxRating);
      } catch (divErr) {
        console.warn('Division sync failed during rating update:', divErr.message);
      }

      const ratingChanged = chessRating !== (profile.chess_rating || 0) || lichessRating !== (profile.lichess_rating || 0);
      if (ratingChanged) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'rating_update',
              title: 'Rating Updated! 📊',
              message: `Your ratings have been updated: Chess.com is now ${chessRating} ELO, Lichess is now ${lichessRating} ELO.`,
              link: '/dashboard?tab=profile'
            });
        } catch (notifErr) {
          console.warn('Could not insert rating sync notification:', notifErr.message);
        }
      }

      await refreshProfile();
      toast.success('Ratings synced successfully!');
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setLoadingSync(false);
    }
  };

  // Enforce dynamic scan of games between user and opponent
  const handleScanMatch = async (pairing) => {
    setScanningPairingId(pairing.id);
    toast.info(`Scanning external games against ${pairing.opponent.name || 'opponent'}...`);

    try {
      // Find opponent's full profile
      const { data: oppProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`chess_username.ieq.${pairing.opponent.username},lichess_username.ieq.${pairing.opponent.username},name.ieq.${pairing.opponent.name}`)
        .maybeSingle();

      if (!oppProfile) {
        throw new Error('Opponent has not linked their chess accounts to SS4 profile yet.');
      }

      const mutualGame = await searchMutualGames(profile, oppProfile);
      if (!mutualGame) {
        toast.info('No mutual matches found recently on Chess.com or Lichess.');
        return;
      }

      // Save match result to verified_games
      const { error: dbErr } = await supabase
        .from('verified_games')
        .upsert({
          match_id: pairing.id,
          platform: mutualGame.platform,
          game_url: mutualGame.url,
          winner_username: mutualGame.winner || null,
          is_admin_approved: false, // Default requires admin confirmation
          extracted_stats: mutualGame
        });

      if (dbErr) throw dbErr;

      toast.success(`Found game on ${mutualGame.platform}! Submitted for admin approval.`);
    } catch (err) {
      toast.error(err.message || 'Verification search failed.');
    } finally {
      setScanningPairingId(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="varsity-card p-10 sm:p-14 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black font-space text-brand-text-dark leading-tight">Your Dashboard</h2>
          <p className="text-xs font-semibold text-gray-400 mt-3 leading-relaxed max-w-xs mx-auto">
            Sign in to access your player profile, match pairings, direct messages, awards, and live stats.
          </p>
          <button
            onClick={() => openAuthModal('view your dashboard', null, 'login')}
            className="mt-6 w-full py-3 rounded-full bg-brand-primary text-white font-bold text-sm hover:bg-brand-accent transition-colors cursor-pointer shadow-md"
          >
            Sign In to Continue
          </button>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">
            All public pages — standings, leaderboards, news — are free to browse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-16 py-10">
      
      {/* Header Profile Summary */}
      <div className="varsity-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-2xl flex items-center justify-center shadow-md select-none">
            {profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black font-space text-brand-text-dark leading-tight">{profile?.name || 'Player'}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{profile?.university || 'SS4 Member'}</span>
              {profile?.department && (
                <>
                  <span>&bull;</span>
                  <span>{profile.department}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={handleSyncRatings} 
            disabled={loadingSync}
            className="text-xs"
          >
            {loadingSync ? 'Syncing...' : 'Sync Chess Ratings'}
          </Button>
          {profile?.role === 'admin' && (
            <span className="bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
              Administrator
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'My Statistics', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'pairings', label: 'Match Chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'messages', label: 'Direct Messages', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
            { id: 'announcements', label: 'Announcements', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
            { id: 'awards', label: 'Trophies & Badges', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M8 21h8a2 2 0 002-2v-1.5a2.5 2.5 0 00-2.5-2.5h-7A2.5 2.5 0 004 17.5V19a2 2 0 002 2z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-black transition-colors uppercase tracking-wider text-left cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
                </svg>
                {tab.label}
              </div>
              {tab.id === 'messages' && unreadMessages.length > 0 && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-sm ${
                  activeTab === 'messages' ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'
                }`}>
                  {unreadMessages.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents Panel */}
        <div className="lg:col-span-3">
          
           {activeTab === 'profile' && (
            <div className="space-y-8">
              
              {/* SCL Tournament Registration Card */}
              {upcomingTournament && (
                <div className="varsity-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse"></span>
                      <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">SCL Registration Open</span>
                    </div>
                    <h3 className="text-base font-black font-space text-brand-text-dark">
                      {upcomingTournament.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500">
                      {isRegistered 
                        ? "Your participation is locked and confirmed. Prepare your matches!"
                        : "Sign up is open. Click the button to confirm your slot."
                      }
                    </p>
                  </div>
                  
                  <div>
                    {isRegistered ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-150">
                        ✓ Confirmed Ready
                      </span>
                    ) : (
                      <button
                        onClick={handleRegisterReady}
                        disabled={loadingReg}
                        className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-brand-accent transition-colors shadow-sm disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center"
                      >
                        {loadingReg ? "Registering..." : "I am Ready"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ratings Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="varsity-card p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chess.com Rating</span>
                    <span className="text-3xl font-black text-brand-text-dark block mt-1.5">
                      {profile?.chess_username ? profile.chess_rating || 'Unrated' : 'Not Linked'}
                    </span>
                    {profile?.chess_username && (
                      <span className="text-[10px] font-bold text-brand-primary block mt-1">@{profile.chess_username}</span>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold font-space text-lg">
                    ♟
                  </div>
                </div>

                <div className="varsity-card p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Lichess Rating</span>
                    <span className="text-3xl font-black text-brand-text-dark block mt-1.5">
                      {profile?.lichess_username ? profile.lichess_rating || 'Unrated' : 'Not Linked'}
                    </span>
                    {profile?.lichess_username && (
                      <span className="text-[10px] font-bold text-brand-accent block mt-1">@{profile.lichess_username}</span>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-bold font-space text-lg">
                    ♞
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="varsity-card p-6 sm:p-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Academic & Profile Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">University</span>
                    <span className="font-semibold text-brand-text-dark mt-1 block">{profile?.university || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Faculty</span>
                    <span className="font-semibold text-brand-text-dark mt-1 block">{profile?.faculty || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Department</span>
                    <span className="font-semibold text-brand-text-dark mt-1 block">{profile?.department || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Level</span>
                    <span className="font-semibold text-brand-text-dark mt-1 block">{profile?.level || '—'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'pairings' && (
            user ? (
              <div className="space-y-6">
                <div className="varsity-card p-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Active Pairings</h3>
                  {activePairings.length === 0 ? (
                    <p className="text-xs font-semibold text-gray-400 italic">No active match pairings found for the current round.</p>
                  ) : (
                    <div className="space-y-3">
                      {activePairings.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                          <div>
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{p.roundName}</span>
                            <h4 className="text-xs font-black text-brand-text-dark mt-1">vs {p.opponent.name} (@{p.opponent.username})</h4>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleScanMatch(p)}
                              disabled={scanningPairingId === p.id}
                              className="text-[10px] py-1.5 px-4 rounded-full"
                            >
                              {scanningPairingId === p.id ? 'Scanning...' : 'Scan Result'}
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => setSelectedPairing(p)}
                              className="text-[10px] py-1.5 px-4 rounded-full"
                            >
                              Open Chat
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPairing && (
                  <div className="animate-in fade-in duration-200">
                    <MatchChat
                      matchId={selectedPairing.id}
                      playerA={profile}
                      playerB={selectedPairing.opponent}
                    />
                  </div>
                )}
              </div>
            ) : (
              <UnverifiedGuard feature="Match Chats & Pairings" />
            )
          )}

          {activeTab === 'messages' && (
            user ? (
              <DirectChat />
            ) : (
              <UnverifiedGuard feature="Direct Messages" />
            )
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <AnnouncementBanner />
              {profile?.role === 'admin' && (
                <AdminBroadcastPanel />
              )}
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="varsity-card p-6 sm:p-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Trophy Case</h3>
              {awards.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl">🏆</span>
                  <p className="text-xs font-semibold text-gray-400 mt-3 italic">No badges unlocked yet. Compete in tournaments to earn trophies!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {awards.map(aw => (
                    <div 
                      key={aw.id} 
                      className="bg-brand-bg-cream/40 rounded-3xl p-5 text-center border border-gray-150 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 shadow-sm"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-accent to-yellow-400 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
                        🏆
                      </div>
                      <h4 className="text-xs font-black text-brand-text-dark uppercase tracking-wider font-space">
                        {aw.award_type === 'champion' ? 'Champion' : aw.award_type === 'undefeated' ? 'Undefeated' : 'Honors'}
                      </h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Tournament {aw.tournament_id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
