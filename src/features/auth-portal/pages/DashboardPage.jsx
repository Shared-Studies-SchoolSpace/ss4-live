import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../../../supabase';

import { fetchChessComStats, fetchLichessStats, fetchCompletePlayerData, searchMutualGames } from '../../chess-league/utils/chessService';
import MatchChat from '../../chess-league/components/MatchChat';
import DirectChat from '../../../components/messaging/DirectChat';
import AnnouncementBanner from '../../../components/announcements/AnnouncementBanner';
import AdminBroadcastPanel from '../../../components/announcements/AdminBroadcastPanel';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
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
      <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider">
        Verify Your Email First
      </h3>
      <p className="text-xs font-semibold text-gray-600 mt-2 max-w-xs leading-relaxed">
        <span className="text-brand-primary font-bold">{feature}</span> is only available to verified accounts.
        Check your inbox and click the confirmation link we sent you.
      </p>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-4">
        Didn't receive it? Use the banner at the top of the page to resend.
      </p>
    </div>
  );
}


const getMonogram = (schoolName) => {
  if (!schoolName) return "SCL";
  const cleaned = schoolName.replace(/university of /gi, "").trim();
  const words = cleaned.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleaned.substring(0, 3).toUpperCase();
};

const CollegiateCrest = ({ profile, user, onClick }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const monogram = getMonogram(profile?.university);
  const maxElo = Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0);
  const division = maxElo >= 1600 ? "D1" : maxElo >= 1200 ? "D2" : "D3";
  
  const pieceSelector = profile?.name ? (profile.name.charCodeAt(0) % 3) : 0;
  const pieceSymbol = pieceSelector === 0 ? "♘" : pieceSelector === 1 ? "♖" : "♗";
  const pieceName = pieceSelector === 0 ? "Knight" : pieceSelector === 1 ? "Rook" : "Bishop";

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative cursor-pointer transition-transform duration-200 ease-out select-none shrink-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(300px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transformStyle: 'preserve-3d'
      }}
      title="Click to view Intercollegiate Chess Transcript"
    >
      <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <defs>
          <pattern id="crestGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#e5e7eb" opacity="0.3"/>
            <rect x="4" y="4" width="4" height="4" fill="#e5e7eb" opacity="0.3"/>
          </pattern>
        </defs>
        
        <path d="M4 4H68V48C68 68 36 84 36 84C36 84 4 68 4 48V4Z" fill="#111111" stroke="#E8640A" strokeWidth="2.5"/>
        <path d="M7 7H65V46C65 62 36 76 36 76C36 76 7 62 7 46V7Z" fill="#F6F4F0"/>
        <path d="M7 7H65V46C65 62 36 76 36 76C36 76 7 62 7 46V7Z" fill="url(#crestGrid)"/>
        
        <line x1="36" y1="7" x2="36" y2="76" stroke="#111111" strokeWidth="1.5"/>
        <line x1="7" y1="41" x2="65" y2="41" stroke="#111111" strokeWidth="1.5"/>
        
        <text x="21.5" y="27" fill="#1A56C4" fontSize="10" fontWeight="900" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">{monogram}</text>
        <text x="50.5" y="29" fill="#111111" fontSize="20" fontWeight="normal" textAnchor="middle">{pieceSymbol}</text>
        
        <rect x="14" y="49" width="16" height="13" rx="2" fill="#E8640A"/>
        <text x="22" y="59" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">{division}</text>
        
        <text x="50.5" y="59" fill="#111111" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">{maxElo || '0'}</text>
      </svg>
    </div>
  );
};

export default function DashboardPage() {
  const { 
    user, 
    profile, 
    refreshProfile, 
    setProfile,
    unreadMessages = [],
    notifications = [],
    unreadNotificationsCount = 0,
    unreadAnnouncementsCount = 0,
    markAnnouncementsAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePlayerDivision,
    isRecoverySession,
    setIsRecoverySession,
    updatePassword,
    deleteAccount
  } = useAuth();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');

  // Mark announcements as read when viewing announcements tab
  useEffect(() => {
    if (activeTab === 'announcements' && markAnnouncementsAsRead) {
      markAnnouncementsAsRead();
    }
  }, [activeTab, markAnnouncementsAsRead]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [activePairings, setActivePairings] = useState([]);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const [scanningPairingId, setScanningPairingId] = useState(null);
  const [awards, setAwards] = useState([]);

  // Settings Form States
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    university: '',
    faculty: '',
    department: '',
    level: '',
    phone: '',
    chess_username: '',
    lichess_username: ''
  });
  const [settingsErrors, setSettingsErrors] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [chessVerifyStatus, setChessVerifyStatus] = useState('idle'); // 'idle' | 'verifying' | 'valid' | 'invalid'
  const [lichessVerifyStatus, setLichessVerifyStatus] = useState('idle'); // 'idle' | 'verifying' | 'valid' | 'invalid'
  const [verifiedChessRating, setVerifiedChessRating] = useState(0);
  const [verifiedLichessRating, setVerifiedLichessRating] = useState(0);

  // Password Change States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPasswordState, setUpdatingPasswordState] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccountState, setDeletingAccountState] = useState(false);

  // SCL Tournament registration states
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  
  // Custom transcript modal state
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  // Fetch upcoming tournament to handle single-click registration.
  // Admin creates tournament rows  we never auto-generate them.
  useEffect(() => {
    if (!user) return;
    const fetchUpcoming = async () => {
      try {
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

  // Set isRegistered status based on roster check (P0 fix)
  useEffect(() => {
    if (upcomingTournament && user) {
      const registered = (upcomingTournament.players || []).some(p => p.id === user.id);
      setIsRegistered(registered);
    }
  }, [upcomingTournament, user]);

  const handleRegisterReady = async () => {
    if (!upcomingTournament || !profile) return;
    setLoadingReg(true);
    
    try {
      // Fetch latest profile first to avoid registering with stale data
      const { data: latestProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const activeProfile = latestProfile || profile;

      const regPlayer = {
        id: user.id,
        name: activeProfile.name,
        username: activeProfile.chess_username || activeProfile.lichess_username || user.email.split('@')[0],
        rating: Math.max(activeProfile.chess_rating || 0, activeProfile.lichess_rating || 0) || 1200,
        school: activeProfile.university || 'SS4 Member',
        department: activeProfile.department || '',
        phone: activeProfile.phone || activeProfile.whatsapp || ''
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
      setActiveTab(tabParam === 'dm' ? 'messages' : tabParam);
    } else if (location.state?.tab) {
      const targetTab = location.state.tab;
      setActiveTab(targetTab === 'dm' ? 'messages' : targetTab);
    }
  }, [location]);

  // Sync profile details to settings form
  useEffect(() => {
    if (profile) {
      setSettingsForm({
        name: profile.name || '',
        university: profile.university || '',
        faculty: profile.faculty || '',
        department: profile.department || '',
        level: profile.level || '',
        phone: profile.phone || profile.whatsapp || profile.whatsapp_number || '',
        chess_username: profile.chess_username || '',
        lichess_username: profile.lichess_username || ''
      });
      setVerifiedChessRating(profile.chess_rating || 0);
      setVerifiedLichessRating(profile.lichess_rating || 0);
      setChessVerifyStatus(profile.chess_username ? 'valid' : 'idle');
      setLichessVerifyStatus(profile.lichess_username ? 'valid' : 'idle');
    }
  }, [profile]);

  // Redirect / switch to Settings if recovery session is active
  useEffect(() => {
    if (isRecoverySession) {
      setActiveTab('settings');
    }
  }, [isRecoverySession]);

  const handleVerifyChess = async (username) => {
    const trimmed = username?.trim();
    if (!trimmed) {
      setChessVerifyStatus('idle');
      setVerifiedChessRating(0);
      return;
    }
    if (trimmed.toLowerCase() === profile?.chess_username?.toLowerCase()) {
      setChessVerifyStatus('valid');
      setVerifiedChessRating(profile.chess_rating || 0);
      return;
    }
    setChessVerifyStatus('verifying');
    // ponytail: 10s timeout so a hung platform API can't lock the form permanently
    const timeout = setTimeout(() => setChessVerifyStatus('idle'), 10000);
    try {
      const data = await fetchCompletePlayerData(trimmed, 'chess.com');
      clearTimeout(timeout);
      if (data.error || !data.rating) {
        setChessVerifyStatus('invalid');
        setSettingsErrors(prev => ({ ...prev, chess_username: 'Chess.com username not found' }));
      } else {
        setChessVerifyStatus('valid');
        setVerifiedChessRating(data.rating);
        setSettingsErrors(prev => ({ ...prev, chess_username: '' }));
      }
    } catch {
      clearTimeout(timeout);
      setChessVerifyStatus('invalid');
    }
  };

  const handleVerifyLichess = async (username) => {
    const trimmed = username?.trim();
    if (!trimmed) {
      setLichessVerifyStatus('idle');
      setVerifiedLichessRating(0);
      return;
    }
    if (trimmed.toLowerCase() === profile?.lichess_username?.toLowerCase()) {
      setLichessVerifyStatus('valid');
      setVerifiedLichessRating(profile.lichess_rating || 0);
      return;
    }
    setLichessVerifyStatus('verifying');
    // ponytail: 10s timeout so a hung platform API can't lock the form permanently
    const timeout = setTimeout(() => setLichessVerifyStatus('idle'), 10000);
    try {
      const data = await fetchCompletePlayerData(trimmed, 'lichess');
      clearTimeout(timeout);
      if (data.error || !data.rating) {
        setLichessVerifyStatus('invalid');
        setSettingsErrors(prev => ({ ...prev, lichess_username: 'Lichess username not found' }));
      } else {
        setLichessVerifyStatus('valid');
        setVerifiedLichessRating(data.rating);
        setSettingsErrors(prev => ({ ...prev, lichess_username: '' }));
      }
    } catch {
      clearTimeout(timeout);
      setLichessVerifyStatus('invalid');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    console.log("[Profile Update] Save Settings clicked.");
    if (!settingsForm.name?.trim()) {
      console.warn("[Profile Update] Validation failed: Name is required.");
      setSettingsErrors(prev => ({ ...prev, name: 'Full name is required' }));
      return;
    }
    if (!settingsForm.chess_username?.trim() && !settingsForm.lichess_username?.trim()) {
      console.warn("[Profile Update] Validation failed: No chess platform username linked.");
      toast.error('You must link at least one Chess.com or Lichess account');
      return;
    }
    if (chessVerifyStatus === 'verifying' || lichessVerifyStatus === 'verifying') {
      console.warn("[Profile Update] Verification in progress.");
      toast.error('Please wait for username verification to complete before saving');
      return;
    }
    if (chessVerifyStatus === 'invalid' || lichessVerifyStatus === 'invalid') {
      console.warn("[Profile Update] Invalid username status present.");
      toast.error('Please resolve invalid usernames before saving');
      return;
    }

    setSavingSettings(true);
    console.log("[Profile Update] Sending request to save settings...");
    try {
      let finalChessRating = verifiedChessRating;
      let finalLichessRating = verifiedLichessRating;

      if (settingsForm.chess_username?.trim() && chessVerifyStatus !== 'valid') {
        console.log("[Profile Update] Verifying Chess.com handle...");
        const data = await fetchCompletePlayerData(settingsForm.chess_username.trim(), 'chess.com');
        if (data.error || !data.rating) {
          console.warn("[Profile Update] Chess.com username not found on submit.");
          setChessVerifyStatus('invalid');
          setSavingSettings(false);
          toast.error('Invalid Chess.com username');
          return;
        }
        finalChessRating = data.rating;
        setVerifiedChessRating(data.rating);
        setChessVerifyStatus('valid');
      }

      if (settingsForm.lichess_username?.trim() && lichessVerifyStatus !== 'valid') {
        console.log("[Profile Update] Verifying Lichess handle...");
        const data = await fetchCompletePlayerData(settingsForm.lichess_username.trim(), 'lichess');
        if (data.error || !data.rating) {
          console.warn("[Profile Update] Lichess username not found on submit.");
          setLichessVerifyStatus('invalid');
          setSavingSettings(false);
          toast.error('Invalid Lichess username');
          return;
        }
        finalLichessRating = data.rating;
        setVerifiedLichessRating(data.rating);
        setLichessVerifyStatus('valid');
      }

      if (!settingsForm.chess_username?.trim()) finalChessRating = 0;
      if (!settingsForm.lichess_username?.trim()) finalLichessRating = 0;

      const updatedProfile = {
        name: settingsForm.name.trim(),
        university: settingsForm.university.trim(),
        faculty: settingsForm.faculty.trim(),
        department: settingsForm.department.trim(),
        level: settingsForm.level,
        phone: settingsForm.phone.trim(),
        chess_username: settingsForm.chess_username.trim(),
        lichess_username: settingsForm.lichess_username.trim(),
        chess_rating: finalChessRating,
        lichess_rating: finalLichessRating
      };

      console.log("[Profile Update] Updating database profile row:", updatedProfile);
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);

      if (error) throw error;
      console.log("[Profile Update] Database row updated successfully.");

      const maxRating = Math.max(finalChessRating, finalLichessRating);
      const profileWithDetails = {
        ...profile,
        ...updatedProfile
      };
      
      // Optimistically/instantly update the local context profile state (ponytail)
      setProfile(profileWithDetails);

      console.log("[Profile Update] Syncing division assignment...");
      await updatePlayerDivision(profileWithDetails, maxRating);

      console.log("[Profile Update] Triggering background refreshProfile.");
      await refreshProfile();
      toast.success('Profile details saved successfully!');
    } catch (err) {
      console.error("[Profile Update] Save settings failed:", err);
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      console.log("[Profile Update] Flow finished.");
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    console.log("[Password Update] Submit button clicked.");
    if (!newPassword || newPassword.length < 8) {
      console.warn("[Password Update] Validation failed: Password is too short.");
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      console.warn("[Password Update] Validation failed: Passwords do not match.");
      toast.error('Passwords do not match');
      return;
    }
    setUpdatingPasswordState(true);
    console.log("[Password Update] Sending request to update password...");
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      console.log("[Password Update] Request completed successfully.");
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsRecoverySession(false); // ponytail: clear recovery session state instantly on successful password change
      sessionStorage.removeItem('ss4_recovery_session');
    } catch (err) {
      console.error("[Password Update] Request failed with error:", err);
      toast.error('Failed to update password: ' + err.message);
    } finally {
      console.log("[Password Update] Flow finished.");
      setUpdatingPasswordState(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setDeletingAccountState(true);
    try {
      await deleteAccount();
      toast.success('Your account has been deactivated successfully.');
    } catch (err) {
      toast.error('Failed to delete account: ' + err.message);
      setDeletingAccountState(false);
    }
  };

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
      // Fetch latest profile first to avoid stale state from recent saves
      const { data: latestProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !latestProfile) {
        throw new Error(profileErr?.message || 'Could not fetch latest profile details.');
      }

      let chessRating = latestProfile.chess_rating || 0;
      let lichessRating = latestProfile.lichess_rating || 0;

      if (latestProfile.chess_username) {
        const stats = await fetchChessComStats(latestProfile.chess_username);
        if (!stats.error) chessRating = stats.rating;
      }

      if (latestProfile.lichess_username) {
        const stats = await fetchLichessStats(latestProfile.lichess_username);
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

      // Auto-assign player division on rating sync using latest profile
      try {
        const maxRating = Math.max(chessRating, lichessRating);
        const updatedProfile = {
          ...latestProfile,
          chess_rating: chessRating,
          lichess_rating: lichessRating
        };
        await updatePlayerDivision(updatedProfile, maxRating);
      } catch (divErr) {
        console.warn('Division sync failed during rating update:', divErr.message);
      }

      const ratingChanged = chessRating !== (latestProfile.chess_rating || 0) || lichessRating !== (latestProfile.lichess_rating || 0);
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

  const handleRequestReminder = async (pairing) => {
    if (!user) return;
    toast.info('Generating match reminder...');
    try {
      const opponentName = pairing.opponent?.name || 'your opponent';
      const round = pairing.roundName || 'the current round';

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'match_reminder',
          title: 'Match Reminder ♟️',
          message: `Reminder: Your match against ${opponentName} in ${round} is active. Good luck!`,
          link: `/chess-league/tournament?tab=fixtures&gameId=${pairing.gameId}`
        });

      if (error) throw error;
      toast.success('Match reminder notification generated successfully!');
    } catch (err) {
      toast.error('Failed to create match reminder: ' + err.message);
    }
  };

  const handleDownloadTranscript = async () => {
    const element = document.getElementById('chess-transcript-card');
    if (!element) return;
    toast.info('Generating card image...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${profile?.name?.replace(/\s+/g, '_') || 'player'}_chess_transcript.png`;
      link.href = imgData;
      link.click();
      toast.success('Transcript downloaded successfully!');
    } catch (err) {
      console.error('Error generating card image:', err);
      toast.error('Failed to generate image download.');
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
            All public pages (standings, leaderboards, news) are free to browse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-16 py-10">
      
      {/* Header Profile Summary Hero */}
      {(() => {
        const maxElo = Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0);
        const divisionTag = maxElo >= 1800 ? 'A Division • Elite Category' : maxElo >= 1000 ? 'Fork Division • Intermediate' : 'Pin Division • Aspirants';
        const divisionBadgeClass = maxElo >= 1800 ? 'bg-red-500/20 text-red-300 border-red-500/40' : maxElo >= 1000 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

        return (
          <div className="relative rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-[#0B193C] via-[#153472] to-[#1A56C4] text-white shadow-xl border border-white/10 overflow-hidden">
            {/* Background Radial Pattern Accent */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-primary/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-5">
              <CollegiateCrest profile={profile} user={user} onClick={() => setIsTranscriptOpen(true)} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${divisionBadgeClass}`}>
                    {divisionTag}
                  </span>
                  {profile?.role === 'admin' && (
                    <span className="bg-[#E8640A] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs">
                      Administrator
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold font-space text-white leading-tight truncate">
                  {profile?.name || 'Player'}
                </h2>
                
                <p className="text-xs font-medium text-blue-100/80 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 truncate">
                  <span>{profile?.university || 'SS4 Member'}</span>
                  {profile?.department && (
                    <>
                      <span>&bull;</span>
                      <span>{profile.department}</span>
                    </>
                  )}
                  {profile?.level && (
                    <>
                      <span>&bull;</span>
                      <span>{profile.level} Level</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <button 
                onClick={handleSyncRatings} 
                disabled={loadingSync || savingSettings}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm min-h-[44px]"
              >
                {loadingSync ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Sync Chess Ratings</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsTranscriptOpen(true)}
                className="px-4 py-2.5 bg-[#E8640A] hover:bg-[#d05707] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>📜 Digital ID Card</span>
              </button>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'My Statistics', notation: 'A1', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'pairings', label: 'Match Chats', notation: 'B2', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'messages', label: 'Messages', notation: 'C3', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', count: unreadMessages.length },
            { id: 'notifications', label: 'Notifications', notation: 'D4', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', count: unreadNotificationsCount },
            { id: 'announcements', label: 'Announcements', notation: 'E5', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.684A1.001 1.001 0 014.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5c.38 0 .732.214.904.553L8.2 13h-2.764z', count: unreadAnnouncementsCount },
            { id: 'awards', label: 'Trophies & Badges', notation: 'F6', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M8 21h8a2 2 0 002-2v-1.5a2.5 2.5 0 00-2.5-2.5h-7A2.5 2.5 0 004 17.5V19a2 2 0 002 2z' },
            { id: 'settings', label: 'Settings', notation: 'G7', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-black transition-all uppercase tracking-wider text-left cursor-pointer binder-tab focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none ${
                activeTab === tab.id 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 hover:pl-6'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
                </svg>
                {tab.label}
              </div>
              <div className="flex items-center gap-2">
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-sm ${
                    activeTab === tab.id ? 'bg-white text-brand-primary' : 'bg-[#E8640A] text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
                <span className={`text-[8px] font-mono opacity-40 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
                  {tab.notation}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Contents Panel */}
        <div className="lg:col-span-3 relative border border-gray-150 rounded-3xl p-6 bg-white shadow-sm overflow-hidden min-h-[500px]">
          <div className="hidden sm:flex absolute top-1 left-4 right-4 justify-between text-[8px] font-black text-gray-400/25 select-none uppercase tracking-widest pointer-events-none">
            <span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>
          </div>
          <div className="hidden sm:flex absolute bottom-1 left-4 right-4 justify-between text-[8px] font-black text-gray-400/25 select-none uppercase tracking-widest pointer-events-none">
            <span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>
          </div>
          <div className="hidden sm:flex absolute left-1 top-8 bottom-8 flex-col justify-between text-[8px] font-black text-gray-400/25 select-none pointer-events-none">
            <span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
          </div>
          <div className="hidden sm:flex absolute right-1 top-8 bottom-8 flex-col justify-between text-[8px] font-black text-gray-400/25 select-none pointer-events-none">
            <span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
          </div>
          
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
                {/* Chess.com Certification Card */}
                <div className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-white border border-emerald-200/60 shadow-sm transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between relative z-10 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Chess.com Certified</span>
                      </div>
                      <h4 className="text-3xl font-black text-brand-text-dark font-mono mt-1 tracking-tight">
                        {profile?.chess_username ? `[ ${profile.chess_rating || '0000'} ]` : 'NOT LINKED'}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                      ♟
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs relative z-10">
                    <span className="font-semibold text-emerald-900">
                      {profile?.chess_username ? `@${profile.chess_username}` : 'Link in Settings'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
                      {profile?.chess_username ? 'Rapid Elo' : 'Uncertified'}
                    </span>
                  </div>
                </div>

                {/* Lichess Certification Card */}
                <div className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-white border border-orange-200/60 shadow-sm transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between relative z-10 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Lichess Certified</span>
                      </div>
                      <h4 className="text-3xl font-black text-brand-text-dark font-mono mt-1 tracking-tight">
                        {profile?.lichess_username ? `[ ${profile.lichess_rating || '0000'} ]` : 'NOT LINKED'}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#E8640A] text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                      ♞
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-orange-100/80 flex items-center justify-between text-xs relative z-10">
                    <span className="font-semibold text-orange-900">
                      {profile?.lichess_username ? `@${profile.lichess_username}` : 'Link in Settings'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md uppercase">
                      {profile?.lichess_username ? 'Classical Elo' : 'Uncertified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic & Player Information Grid */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Academic & Collegiate Information
                  </h3>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-[10px] font-bold text-brand-primary uppercase hover:underline cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">University</span>
                    <span className="font-bold text-brand-text-dark block truncate" title={profile?.university}>{profile?.university || '-'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Faculty</span>
                    <span className="font-bold text-brand-text-dark block truncate" title={profile?.faculty}>{profile?.faculty || '-'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Department</span>
                    <span className="font-bold text-brand-text-dark block truncate" title={profile?.department}>{profile?.department || '-'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Academic Level</span>
                    <span className="font-bold text-brand-text-dark block">{profile?.level ? `${profile.level} Level` : '-'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'pairings' && (
            user ? (
              <div className="space-y-6">
                <div className="varsity-card p-6 bg-white border-none shadow-none">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Active Pairings</h3>
                  {activePairings.length === 0 ? (
                    <p className="text-xs font-semibold text-gray-400 italic">No active match pairings found for the current round.</p>
                  ) : (
                    <div className="space-y-3">
                      {activePairings.map(p => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors gap-4">
                          <div>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{p.roundName}</span>
                            <h4 className="text-xs font-black text-brand-text-dark mt-1">vs {p.opponent.name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">@{p.opponent.username}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleRequestReminder(p)}
                              className="text-xs py-2.5 px-4 rounded-full focus-visible:ring-2 focus-visible:ring-brand-primary"
                              title="Request a Match Reminder notification"
                            >
                              ⏰ Remind Me
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleScanMatch(p)}
                              disabled={scanningPairingId === p.id}
                              className="text-xs py-2.5 px-4 rounded-full focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              {scanningPairingId === p.id ? 'Scanning...' : 'Scan Result'}
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => setSelectedPairing(p)}
                              className="text-xs py-2.5 px-4 rounded-full focus-visible:ring-2 focus-visible:ring-brand-primary"
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
              <UnverifiedGuard feature="Messages" />
            )
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-150 pb-4">
                <div>
                  <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h3>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    Match updates, rating certifications, and system notifications.
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="px-4 py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold text-xs rounded-full transition-colors cursor-pointer"
                  >
                    Mark All Read ({unreadNotificationsCount})
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xs">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl text-brand-primary flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">All Caught Up!</h3>
                  <p className="text-xs font-semibold text-gray-400 mt-1 max-w-xs mx-auto">
                    You have no unread notifications at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => {
                    const isUnread = !n.read_at;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (isUnread && markNotificationAsRead) markNotificationAsRead(n.id);
                          if (n.link) window.location.href = n.link;
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                          isUnread
                            ? 'bg-blue-50/40 border-brand-primary/30 shadow-xs'
                            : 'bg-white border-gray-150 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                          {n.type === 'opponent_assigned' ? '♟' : n.type === 'rating_update' ? '📊' : n.type === 'reminder' ? '⏰' : '🔔'}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">{n.title}</h4>
                            <span className="text-[9px] font-mono text-gray-400">
                              {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-600 leading-relaxed">{n.message}</p>
                        </div>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#E8640A] shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
            <div className="varsity-card p-6 sm:p-8 bg-white border-none shadow-none">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-6">Trophy Case</h3>
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
                      className="varsity-patch rounded-3xl p-5 text-center flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-sm mb-3 border-2 border-white select-none">
                        🏆
                      </div>
                      <h4 className="text-xs font-black text-brand-text-dark uppercase tracking-wider">
                        {aw.award_type === 'champion' ? '🏆 Champion' : aw.award_type === 'undefeated' ? '⭐ Undefeated' : '🎖️ Honors'}
                      </h4>
                      <p className="text-[9px] font-black text-gray-500 uppercase mt-1">Tournament {aw.tournament_id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="varsity-card p-6 sm:p-8 bg-white border-none shadow-none space-y-8 animate-in fade-in duration-200">
              {isRecoverySession && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-semibold animate-pulse">
                  <span className="material-symbols-outlined">warning</span>
                  <div>
                    <strong className="block font-bold">Password Recovery Session Active</strong>
                    Please set a new password in the "Change Password" section below to secure your account.
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-widest border-b border-gray-150 pb-2 mb-4">Edit Profile Details</h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                      <Input
                        placeholder="Full Name"
                        value={settingsForm.name}
                        onChange={e => {
                          setSettingsForm(prev => ({ ...prev, name: e.target.value }));
                          setSettingsErrors(prev => ({ ...prev, name: '' }));
                        }}
                      />
                      {settingsErrors.name && <p className="text-[10px] font-bold text-brand-accent mt-1">{settingsErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">University / School (Optional)</label>
                      <Input
                        placeholder="e.g. University of Uyo"
                        value={settingsForm.university}
                        onChange={e => setSettingsForm(prev => ({ ...prev, university: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faculty (Optional)</label>
                      <Input
                        placeholder="e.g. Engineering"
                        value={settingsForm.faculty}
                        onChange={e => setSettingsForm(prev => ({ ...prev, faculty: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department (Optional)</label>
                      <Input
                        placeholder="e.g. Computer Science"
                        value={settingsForm.department}
                        onChange={e => setSettingsForm(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Level (Optional)</label>
                      <select
                        value={settingsForm.level}
                        onChange={e => setSettingsForm(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8640A]/40"
                      >
                        <option value="">Select Level</option>
                        {[100, 200, 300, 400, 500].map(l => (
                          <option key={l} value={`${l}`}>{l} Level</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Phone Number</label>
                      <Input
                        placeholder="e.g. 08012345678 or +234..."
                        value={settingsForm.phone}
                        onChange={e => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-6">
                    <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-1">Chess Credentials</h4>
                    <p className="text-[10px] text-gray-400 mb-4 font-semibold">Enter your username on at least one platform to sync your ratings.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chess.com Username</label>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="Chess.com handle"
                            value={settingsForm.chess_username}
                            onChange={e => {
                              setSettingsForm(prev => ({ ...prev, chess_username: e.target.value }));
                              setChessVerifyStatus('idle');
                              setSettingsErrors(prev => ({ ...prev, chess_username: '' }));
                            }}
                            onBlur={e => handleVerifyChess(e.target.value)}
                            className="pr-20"
                          />
                          {chessVerifyStatus === 'verifying' && (
                            <span className="absolute right-3 flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                          )}
                          {chessVerifyStatus === 'valid' && (
                            <span className="absolute right-3 text-xs font-bold text-emerald-650 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              {verifiedChessRating}
                            </span>
                          )}
                          {chessVerifyStatus === 'invalid' && (
                            <span className="absolute right-3 text-xs font-bold text-brand-accent flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </span>
                          )}
                        </div>
                        {settingsErrors.chess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{settingsErrors.chess_username}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lichess Username</label>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="Lichess handle"
                            value={settingsForm.lichess_username}
                            onChange={e => {
                              setSettingsForm(prev => ({ ...prev, lichess_username: e.target.value }));
                              setLichessVerifyStatus('idle');
                              setSettingsErrors(prev => ({ ...prev, lichess_username: '' }));
                            }}
                            onBlur={e => handleVerifyLichess(e.target.value)}
                            className="pr-20"
                          />
                          {lichessVerifyStatus === 'verifying' && (
                            <span className="absolute right-3 flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                          )}
                          {lichessVerifyStatus === 'valid' && (
                            <span className="absolute right-3 text-xs font-bold text-emerald-650 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              {verifiedLichessRating}
                            </span>
                          )}
                          {lichessVerifyStatus === 'invalid' && (
                            <span className="absolute right-3 text-xs font-bold text-brand-accent flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </span>
                          )}
                        </div>
                        {settingsErrors.lichess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{settingsErrors.lichess_username}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={savingSettings}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-full text-xs shadow-md transition-colors cursor-pointer"
                    >
                      {savingSettings ? 'Saving Changes...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-150 pt-6">
                <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-widest border-b border-gray-150 pb-2 mb-4">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">New Password</label>
                    <div className="relative flex items-center">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={updatingPasswordState}
                      className="px-5 py-2 text-xs font-bold cursor-pointer"
                    >
                      {updatingPasswordState ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-150 pt-6">
                <h3 className="text-sm font-black text-brand-accent uppercase tracking-widest border-b border-gray-150 pb-2 mb-3">Deactivate Account</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed font-semibold">
                  Deactivating your account will permanently delete your SCL league record, standings, division assignment, and chat messages. This action is irreversible.
                </p>
                <Button
                  onClick={() => {
                    setDeleteConfirmText('');
                    setShowDeleteModal(true);
                  }}
                  variant="secondary"
                  className="px-5 py-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Account Deactivation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-rose-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-brand-accent font-space uppercase tracking-wider mb-2">Delete Account?</h3>
            <p className="text-xs text-gray-500 font-semibold mb-4 leading-relaxed">
              Are you absolutely sure? This will purge all your profile data and league tournament records. 
              To confirm, please type <strong className="text-brand-accent font-bold">DELETE</strong> below:
            </p>
            <div className="space-y-4">
              <Input
                placeholder="Type DELETE here"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccountState}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  {deletingAccountState ? 'Deactivating...' : 'Confirm Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Transcript Modal */}
      {isTranscriptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-150 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsTranscriptOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg font-black cursor-pointer border-none bg-transparent"
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div 
              id="chess-transcript-card" 
              className="p-6 bg-[#F6F4F0] border-4 double-border border-[#111111] rounded-2xl relative overflow-hidden text-left"
              style={{ minHeight: '380px' }}
            >
              <div className="absolute inset-0 bg-radial-grid opacity-[0.03] pointer-events-none" />
              
              <div className="text-center space-y-1 mb-6 border-b border-[#111111]/25 pb-4">
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest block">Federal Chess Association</span>
                <h3 className="text-sm font-black font-space text-brand-text-dark uppercase tracking-wider">SS4 Intercollegiate League</h3>
                <p className="text-[8px] font-mono text-gray-500">OFFICIAL ATHLETIC TRANSCRIPT</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Student Athlete</span>
                    <h4 className="text-base font-black text-brand-text-dark leading-tight mt-0.5 truncate">{profile?.name || 'Player'}</h4>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5 truncate">{profile?.university || 'SS4 Member'}</p>
                  </div>
                  <div className="border border-[#111111] p-1 bg-white rounded-lg shrink-0">
                    <svg width="36" height="44" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H68V48C68 68 36 84 36 84C36 84 4 68 4 48V4Z" fill="#111111" stroke="#E8640A" strokeWidth="2.5"/>
                      <path d="M7 7H65V46C65 62 36 76 36 76C36 76 7 62 7 46V7Z" fill="#F6F4F0"/>
                      <line x1="36" y1="7" x2="36" y2="76" stroke="#111111" strokeWidth="1.5"/>
                      <line x1="7" y1="41" x2="65" y2="41" stroke="#111111" strokeWidth="1.5"/>
                      <text x="21.5" y="27" fill="#1A56C4" fontSize="10" fontWeight="900" textAnchor="middle">{getMonogram(profile?.university)}</text>
                      <text x="50.5" y="29" fill="#111111" fontSize="20" textAnchor="middle">{profile?.name ? (profile.name.charCodeAt(0) % 3 === 0 ? "♘" : profile.name.charCodeAt(0) % 3 === 1 ? "♖" : "♗") : "♘"}</text>
                      <rect x="14" y="49" width="16" height="13" rx="2" fill="#E8640A"/>
                      <text x="22" y="59" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle">{Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0) >= 1600 ? "D1" : Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0) >= 1200 ? "D2" : "D3"}</text>
                      <text x="50.5" y="59" fill="#111111" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">{Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0) || '0'}</text>
                    </svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-b border-[#111111]/15 py-3 text-xs">
                  <div>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Chess.com ELO</span>
                    <span className="font-mono font-bold text-brand-text-dark mt-0.5 block">{profile?.chess_username ? `[ ${profile.chess_rating || 0} ]` : 'NOT LINKED'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Lichess ELO</span>
                    <span className="font-mono font-bold text-brand-text-dark mt-0.5 block">{profile?.lichess_username ? `[ ${profile.lichess_rating || 0} ]` : 'NOT LINKED'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Department</span>
                    <span className="font-bold text-brand-text-dark mt-0.5 block truncate max-w-[150px]">{profile?.department || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Division</span>
                    <span className="font-bold text-brand-text-dark mt-0.5 block">{Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0) >= 1600 ? "Division I Varsity" : Math.max(profile?.chess_rating || 0, profile?.lichess_rating || 0) >= 1200 ? "Division II Varsity" : "Division III Club"}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Academic Level</span>
                    <span className="font-bold text-brand-text-dark text-xs block">{profile?.level ? `Level ${profile.level}` : '-'}</span>
                  </div>
                  <div className="w-12 h-12 bg-red-800 rounded-full flex items-center justify-center border-2 border-red-700 shadow-md select-none transform rotate-12 shrink-0">
                    <span className="text-white text-[9px] font-black font-mono tracking-widest">SCL</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsTranscriptOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleDownloadTranscript}>
                📥 Download Badge PNG
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
