import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTournament } from '../hooks/useTournament';
import { tournamentPlayers } from '../data/tournamentPlayers';
import { getTournamentDates, getCountdownTarget } from '../utils/tournament';
import { TournamentHero } from '../components/tournament/TournamentHero';
import { BracketTab } from '../components/tournament/BracketTab';
import { TournamentPlayerModal } from '../components/tournament/TournamentPlayerModal';
import AuthGate from '../components/auth/AuthGate';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../supabase';

const ADMIN_PIN = '1926';

const SCHEDULE = [
  { label: 'Day 1', desc: 'Round 1',  date: 'June 24' },
  { label: 'Day 2', desc: 'Round 2',  date: 'June 25' },
  { label: 'Day 3', desc: 'Round 3',  date: 'June 26' },
  { label: 'Day 4', desc: 'Quarterfinals',date: 'June 27' },
  { label: 'Day 5', desc: 'Semifinals',   date: 'June 28' },
  { label: 'Day 6', desc: 'Rest / Tiebreaks', date: 'June 29' },
  { label: 'Day 7', desc: 'Final',        date: 'June 30' },
];

// ponytail: inline — only ever used in this page
function JoinModal({ mode, onClose, onSignIn, onRegister, clock }) {
  const { days, hours, mins, secs } = clock;
  const CountdownTile = ({ val, unit }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-black text-brand-primary font-space tabular-nums w-14 text-center bg-brand-primary/5 border border-brand-primary/20 rounded-xl py-2">
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{unit}</span>
    </div>
  );

  const backdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={backdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" role="dialog" aria-modal="true">
        {/* X close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {mode === 'gate' && (
          <>
            <div className="text-3xl mb-3">🏆</div>
            <h2 className="text-lg font-black text-brand-text-dark mb-1">Ready to compete?</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to secure your spot in the next SCL Tournament.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onRegister}
                className="w-full py-3 bg-brand-primary text-white font-black text-sm rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
              >
                Create Account
              </button>
              <button
                onClick={onSignIn}
                className="w-full py-3 bg-transparent text-brand-primary font-black text-sm rounded-xl border border-brand-primary/30 hover:bg-brand-primary/5 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </>
        )}

        {mode === 'success' && (
          <>
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-lg font-black text-brand-text-dark mb-1">You're in!</h2>
            <p className="text-sm text-gray-500 mb-5">Your spot is confirmed. The board awaits.</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tournament starts in</p>
            <div className="flex items-start justify-center gap-2 mb-6">
              <CountdownTile val={days} unit="Days" />
              <CountdownTile val={hours} unit="Hrs" />
              <CountdownTile val={mins} unit="Mins" />
              <CountdownTile val={secs} unit="Secs" />
            </div>
            <button onClick={onClose} className="w-full py-3 bg-emerald-600 text-white font-black text-sm rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer">
              Let's Go
            </button>
          </>
        )}

        {mode === 'already-in' && (
          <>
            <div className="text-3xl mb-3">✅</div>
            <h2 className="text-lg font-black text-brand-text-dark mb-1">Your spot is locked in.</h2>
            <p className="text-sm text-gray-500 mb-5">You're already registered. Champions don't queue twice.</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tournament starts in</p>
            <div className="flex items-start justify-center gap-2 mb-6">
              <CountdownTile val={days} unit="Days" />
              <CountdownTile val={hours} unit="Hrs" />
              <CountdownTile val={mins} unit="Mins" />
              <CountdownTile val={secs} unit="Secs" />
            </div>
            <button onClick={onClose} className="w-full py-3 bg-brand-primary/10 text-brand-primary font-black text-sm rounded-xl hover:bg-brand-primary/15 transition-colors cursor-pointer">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AdminMatchRow({ game, onSave }) {
  const [winnerUsername, setWinnerUsername] = useState(game.winner?.username || '');
  const [gameLink, setGameLink] = useState(game.gameLink || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWinnerUsername(game.winner?.username || '');
    setGameLink(game.gameLink || '');
  }, [game]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedWinner = winnerUsername === game.p1?.username 
        ? game.p1 
        : winnerUsername === game.p2?.username 
          ? game.p2 
          : winnerUsername === 'forfeit'
            ? { username: 'forfeit', name: 'Double Forfeit', rating: 0, school: '' }
            : null;
      await onSave(selectedWinner, gameLink);
    } catch (e) {
      toast.error('Failed to save match result');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 varsity-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {game.id}
          </span>
          {game.winner && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Completed
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-[#111111] flex items-center gap-2 flex-wrap mt-1">
          <span className={winnerUsername === game.p1?.username ? 'text-brand-primary font-black underline decoration-2' : ''}>
            {game.p1?.name}
          </span>
          <span className="text-gray-300 font-normal text-xs uppercase tracking-widest">VS</span>
          <span className={winnerUsername === game.p2?.username ? 'text-brand-primary font-black underline decoration-2' : ''}>
            {game.p2?.name}
          </span>
        </div>
        <div className="text-[10px] font-bold text-gray-400 mt-1">
          @{game.p1?.username} ({game.p1?.rating || 'unrated'}) &bull; @{game.p2?.username} ({game.p2?.rating || 'unrated'})
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="w-full sm:w-[220px]">
          <input
            type="url"
            placeholder="Chess.com Game Link"
            value={gameLink}
            onChange={(e) => setGameLink(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111] placeholder-gray-300 transition-all bg-gray-50/50"
          />
        </div>

        <div className="w-full sm:w-[160px]">
          <select
            value={winnerUsername}
            onChange={(e) => setWinnerUsername(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111] transition-all"
          >
            <option value="">-- Select Winner --</option>
            <option value={game.p1?.username}>Winner: {game.p1?.name}</option>
            <option value={game.p2?.username}>Winner: {game.p2?.name}</option>
            <option value="forfeit">Double Forfeit (Both Removed)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-primary text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-brand-primary/95 active:scale-95 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center shrink-0 shadow-sm"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function ChessTournamentPage() {
  const navigate = useNavigate();
  const [selectedMonthYear, setSelectedMonthYear] = useState('2026-06');

  const [activeTab, setActiveTab]   = useState('bracket');
  const [isAdmin, setIsAdmin]       = useState(false);
  const [pinModal, setPinModal]     = useState(false);
  const [pinInput, setPinInput]     = useState('');
  const [pinErr, setPinErr]         = useState('');
  const [showPin, setShowPin]       = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [adminRoundNum, setAdminRoundNum] = useState(1);
  const [adminSubView, setAdminSubView] = useState('main'); // 'main' | 'generate-r1' | 'generate-next'
  const [activeFixtureRound, setActiveFixtureRound] = useState(1);
  const [paramTargetElo, setParamTargetElo] = useState(400);
  const [paramSchoolPenalty, setParamSchoolPenalty] = useState(150);
  const [paramCustomDate, setParamCustomDate] = useState('');

  const handleOpenR1Gen = () => {
    const [y, m] = selectedMonthYear.split('-').map(Number);
    const dates = getTournamentDates(y, m);
    setParamCustomDate(dates[0]);
    setParamTargetElo(400);
    setParamSchoolPenalty(150);
    setAdminSubView('generate-r1');
  };

  const handleOpenNextGen = () => {
    const [y, m] = selectedMonthYear.split('-').map(Number);
    const dates = getTournamentDates(y, m);
    const nextNum = (tournament?.rounds?.length || 0) + 1;
    const dateIdx = Math.min(nextNum - 1, dates.length - 1);
    setParamCustomDate(dates[dateIdx]);
    setParamTargetElo(400);
    setParamSchoolPenalty(150);
    setAdminSubView('generate-next');
  };

  const getSeededPlayersR1 = () => {
    const nonProvisional = tournamentPlayers.filter(p => !p.isProvisional);
    const provisional = tournamentPlayers.filter(p => p.isProvisional);
    nonProvisional.sort((a, b) => b.rating - a.rating);
    const shuffledProvisional = [...provisional].sort((a, b) => {
      const hashA = [...(a.username || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const hashB = [...(b.username || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      return hashA - hashB || a.username.localeCompare(b.username);
    });
    const sorted = [...nonProvisional, ...shuffledProvisional];
    const numByes = 64 - sorted.length;
    const byes = sorted.slice(0, numByes);
    const active = sorted.slice(numByes);
    return { byes, active };
  };

  const getSeededPlayersNext = () => {
    if (!tournament?.rounds?.length) return [];
    const last = tournament.rounds[tournament.rounds.length - 1];
    return last.games.map(g => g.winner).filter(w => w && w.username !== 'forfeit');
  };

  const { tournament, history, isDbFallback, initialize, logResult, saveGameLink, advanceRound, reset, clearMocks, updateNextRoundStart } = useTournament(selectedMonthYear);

  const { user, profile } = useAuth();
  const { openAuthModal } = useAuthModal();

  const [nextRoundStartInput, setNextRoundStartInput] = useState('');
  const [showPastWinnersModal, setShowPastWinnersModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Upcoming tournament states
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [loadingReg, setLoadingReg] = useState(false);

  // Join modal state — 'gate' | 'success' | 'already-in'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalMode, setJoinModalMode] = useState('gate');

  // Fetch upcoming tournament
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        let { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          const targetMY = '2026-08';
          const targetName = 'August 2026 SCL Tournament';
          const newT = {
            id: targetMY,
            name: targetName,
            month_year: targetMY,
            status: 'upcoming',
            players: [],
            rounds: [],
            winner: null
          };
          
          const { data: upsertedData } = await supabase
            .from('tournaments')
            .upsert(newT)
            .select()
            .single();
            
          data = upsertedData;
        }
        setUpcomingTournament(data);
      } catch (err) {
        console.error('Error fetching upcoming tournament:', err);
      }
    };
    fetchUpcoming();
  }, []);

  const isUserRegisteredForUpcoming = React.useMemo(() => {
    if (!user || !upcomingTournament || !upcomingTournament.players) return false;
    return upcomingTournament.players.some(p => 
      p.id === user.id || 
      (p.username && profile?.chess_username && p.username.toLowerCase() === profile.chess_username.toLowerCase())
    );
  }, [user, upcomingTournament, profile]);

  const handleJoinTournament = async () => {
    if (!user) {
      setJoinModalMode('gate');
      setShowJoinModal(true);
      return;
    }

    if (isUserRegisteredForUpcoming) {
      setJoinModalMode('already-in');
      setShowJoinModal(true);
      return;
    }

    if (!profile) {
      toast.error('Player profile not found. Please complete your profile in the Dashboard.');
      return;
    }

    await executeRegistration(user, profile);
  };

  const handleJoinTournamentAfterAuth = async () => {
    try {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (!newUser) {
        toast.error('Authentication failed.');
        return;
      }
      const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', newUser.id).single();
      if (!newProfile) {
        toast.error('Registration successful, but profile could not be loaded. Please configure it in the Dashboard.');
        return;
      }
      await executeRegistration(newUser, newProfile);
    } catch (err) {
      console.error('Registration after auth failed:', err);
    }
  };

  const executeRegistration = async (targetUser, targetProfile) => {
    setLoadingReg(true);
    try {
      const { data: freshT } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .maybeSingle();

      const currentT = freshT || upcomingTournament;
      if (!currentT) {
        toast.error('Upcoming tournament not found.');
        return;
      }

      let chessUsername = targetProfile.chess_username;
      if (!chessUsername) {
        const userInput = window.prompt("To join the tournament, please enter your Chess.com username (required):");
        if (!userInput || !userInput.trim()) {
          toast.error("Chess.com username is required to join the tournament.");
          setLoadingReg(false);
          return;
        }
        chessUsername = userInput.trim();
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ chess_username: chessUsername })
          .eq('id', targetUser.id);
        
        if (profileUpdateError) {
          console.error("Failed to update profile chess_username:", profileUpdateError);
        } else {
          targetProfile.chess_username = chessUsername;
        }
      }

      const regPlayer = {
        id: targetUser.id,
        name: targetProfile.name,
        username: chessUsername,
        rating: Math.max(targetProfile.chess_rating || 0, targetProfile.lichess_rating || 0) || 1200,
        school: targetProfile.university || 'SS4 Member',
        department: targetProfile.department || ''
      };
      
      const updatedPlayers = [
        ...(currentT.players || []).filter(p => p.id !== targetUser.id),
        regPlayer
      ];
      
      const { error } = await supabase
        .from('tournaments')
        .update({ players: updatedPlayers })
        .eq('id', currentT.id);
        
      if (error) throw error;
      
      setUpcomingTournament({ ...currentT, players: updatedPlayers });
      setJoinModalMode('success');
      setShowJoinModal(true);
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Registration failed: ' + err.message);
    } finally {
      setLoadingReg(false);
    }
  };

  // Countdown state for non-active screen
  const [{ days, hours, mins, secs, label }, setClock] = useState({ days: 0, hours: 0, mins: 0, secs: 0, label: '' });

  // Detect timezone abbreviation (e.g. WAT, BST, EST)
  const tzAbbr = React.useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
    } catch { return ''; }
  }, []);

  useEffect(() => {
    const tick = () => {
      const targetT = (tournament?.status === 'active') ? tournament : (upcomingTournament || tournament);
      const { date, label: targetLabel } = getCountdownTarget(targetT);
      const diff = Math.max(0, date - new Date());
      setClock({
        days:  Math.floor(diff / 864e5),
        hours: Math.floor(diff / 36e5) % 24,
        mins:  Math.floor(diff / 6e4) % 60,
        secs:  Math.floor(diff / 1e3) % 60,
        label: targetLabel
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tournament, upcomingTournament]);

  useEffect(() => {
    if (tournament) {
      const latestRound = tournament.rounds && tournament.rounds[tournament.rounds.length - 1];
      if (latestRound && latestRound.next_round_start) {
        try {
          const d = new Date(latestRound.next_round_start);
          const offset = d.getTimezoneOffset();
          const localTime = new Date(d.getTime() - offset * 60 * 1000);
          setNextRoundStartInput(localTime.toISOString().slice(0, 16));
        } catch {
          setNextRoundStartInput('');
        }
      } else {
        setNextRoundStartInput('');
      }
    }
  }, [tournament]);

  const formattedTargetTime = React.useMemo(() => {
    try {
      const { date } = getCountdownTarget(tournament);
      return `${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })} ${tzAbbr}`;
    } catch {
      return `18:00 ${tzAbbr}`;
    }
  }, [tournament, tzAbbr]);

  const googleCalendarUrl = React.useMemo(() => {
    try {
      const { date } = getCountdownTarget(tournament);
      const startStr = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endStr = new Date(date.getTime() + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
      return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + 
        encodeURIComponent("SCL Monthly Chess Tournament") + 
        "&dates=" + startStr + "/" + endStr + 
        "&details=" + encodeURIComponent("Join the monthly SCL Chess Tournament. Single elimination, WAT 18:00 start.");
    } catch {
      return "#";
    }
  }, [tournament]);

  const handleSaveNextRoundStart = async () => {
    if (!nextRoundStartInput) {
      toast.error('Please select a valid date and time.');
      return;
    }
    try {
      const isoStr = new Date(nextRoundStartInput).toISOString();
      await updateNextRoundStart(isoStr);
      toast.success('Next round start time updated!');
    } catch (e) {
      toast.error('Error updating next round start time.');
    }
  };

  const handleClearNextRoundStart = async () => {
    try {
      await updateNextRoundStart(null);
      setNextRoundStartInput('');
      toast.success('Next round start time cleared (using default round date).');
    } catch (e) {
      toast.error('Error clearing next round start time.');
    }
  };

  useEffect(() => {
    if (tournament?.rounds?.length) {
      setAdminRoundNum(tournament.rounds.length);
      setActiveFixtureRound(tournament.rounds.length);
    }
  }, [tournament]);

  const submitPin = () => {
    if (pinInput === ADMIN_PIN) { setIsAdmin(true); setPinModal(false); toast.success('Admin unlocked'); }
    else { setPinErr('Wrong PIN'); setPinInput(''); }
  };

  const TABS = [
    { id: 'bracket',    label: 'Bracket'   },
    { id: 'results',    label: 'Results'   },
    { id: 'fixtures',   label: 'Fixtures'  },
    { id: 'rules',      label: 'Rules & Schedule' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  const isTournamentActive = tournament?.status === 'active';

  return (
    <div className="min-h-screen bg-[#F6F4F0]">
      <ToastContainer position="bottom-right" />

      {!isTournamentActive && !isAdmin ? (
        /* Non-Active View: Big Ass Countdown */
        <div 
          className="relative text-white px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-24 min-h-[85vh] flex flex-col justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0B193C 0%, #1E1B4B 55%, #431407 100%)' }}
        >
          {/* Ambient glow blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)' }} />
            <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px opacity-10"
              style={{ background: 'linear-gradient(90deg, transparent, #fdba74, transparent)' }} />
          </div>

          <div className="max-w-4xl mx-auto w-full text-center relative z-10 space-y-10 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white/50 uppercase mb-4">SS4 Chess Network</p>
              <h1
                onDoubleClick={() => { setPinInput(''); setPinErr(''); setShowPin(false); setPinModal(true); }}
                className="font-space font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-4 cursor-pointer select-none"
              >
                SCL Monthly<br />
                <span className="font-black text-brand-accent">Tournament</span>
              </h1>
              <p className="text-white/60 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
                Single elimination. Last 7 days of the month. One champion claims the prize.
              </p>
            </div>

            {/* Big Ass Countdown */}
            <div className="space-y-4">
              <p className="text-brand-primary font-bold text-xs sm:text-sm tracking-[0.25em] uppercase">
                {label} &bull; <span className="text-white/50">{formattedTargetTime}</span>
              </p>
              
              <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center max-w-xl mx-auto">
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-white/10 border border-white/20 text-white font-space font-black text-2xl sm:text-4xl md:text-6xl w-full aspect-square max-w-[76px] sm:max-w-[112px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    {String(days).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1.5">Days</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-white/10 border border-white/20 text-white font-space font-black text-2xl sm:text-4xl md:text-6xl w-full aspect-square max-w-[76px] sm:max-w-[112px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    {String(hours).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1.5">Hours</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-white/10 border border-white/20 text-white font-space font-black text-2xl sm:text-4xl md:text-6xl w-full aspect-square max-w-[76px] sm:max-w-[112px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    {String(mins).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1.5">Mins</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-white/10 border border-white/20 text-white font-space font-black text-2xl sm:text-4xl md:text-6xl w-full aspect-square max-w-[76px] sm:max-w-[112px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg text-brand-primary animate-pulse">
                    {String(secs).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1.5">Secs</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {isUserRegisteredForUpcoming ? (
                <div className="px-8 py-3.5 bg-emerald-600 border border-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl flex items-center gap-2 shadow-md select-none">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  You have Joined! 🚀
                </div>
              ) : (
                <button
                  onClick={handleJoinTournament}
                  disabled={loadingReg}
                  className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  {loadingReg ? "Joining..." : "Join the next Tournament"}
                </button>
              )}

              <a 
                href={googleCalendarUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-black rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Calendar
              </a>
              <button 
                onClick={() => setShowPastWinnersModal(true)} 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-black rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                View Past Winners
              </button>
              <button 
                onClick={() => setShowRulesModal(true)} 
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs sm:text-sm font-black rounded-xl border border-white/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Rules & Schedule
              </button>
            </div>

          {/* Registered Players List */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 sm:p-8 max-w-2xl mx-auto text-left space-y-4 mt-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-space font-black text-lg text-white">Registered Participants</h3>
                <span className="bg-brand-primary text-white text-xs font-black px-2.5 py-1 rounded-full">
                  {upcomingTournament?.players ? upcomingTournament.players.length : 0} Joined
                </span>
              </div>
              
              {!upcomingTournament?.players || upcomingTournament.players.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-4 text-center">No participants registered yet. Be the first to join!</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {upcomingTournament.players.map((p, idx) => (
                    <div key={p.id || idx} className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:bg-white/10 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{p.school}</p>
                      </div>
                      <div className="bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-lg shrink-0">
                        <span className="text-[10px] font-black text-brand-primary">{p.rating} ELO</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Tournament View (Hero + Tab Layout) */
        <>
          <TournamentHero
            tournament={tournament}
            selectedMonthYear={selectedMonthYear}
            history={history}
            onMonthChange={setSelectedMonthYear}
            onTitleDoubleClick={() => { setPinInput(''); setPinErr(''); setShowPin(false); setPinModal(true); }}
          />

          {/* Tab bar */}
          <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-12 lg:px-16">
            <div className="max-w-5xl mx-auto flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`py-4 text-sm font-black whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeTab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-[#111111]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* DB status pill */}
          {isDbFallback && (
            <div className="bg-amber-50 border-b border-amber-100 text-center py-2 px-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Offline &mdash; changes stored locally</p>
            </div>
          )}

          {/* Tab content wrapper */}
          <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 lg:px-0 py-6 sm:py-10">

        {/* BRACKET */}
        {activeTab === 'bracket' && (
          <BracketTab
            tournament={tournament}
            isAdmin={isAdmin}
            onLogResult={(gameId, winner, link) => logResult(gameId, winner, link)}
            onSaveGameLink={saveGameLink}
            onAdvanceRound={advanceRound}
            onInitialize={initialize}
            onPlayerClick={setSelectedPlayerForModal}
          />
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {!tournament ? (
              <div className="varsity-card p-12 text-center">
                <p className="text-gray-500 py-10 text-base font-bold">No tournament results available.</p>
              </div>
            ) : (() => {
              const roundsWithResults = tournament.rounds.map(r => {
                const completedGames = r.games.filter(g => g.winner && g.p1 && g.p2 && g.p2.username !== 'bye');
                return { ...r, completedGames };
              }).filter(r => r.completedGames.length > 0);

              if (roundsWithResults.length === 0) {
                return (
                  <div className="varsity-card p-12 text-center">
                    <p className="text-gray-500 py-10 text-base font-bold">No matches have been completed yet.</p>
                  </div>
                );
              }

              return roundsWithResults.map(r => (
                <div key={r.roundNum} className="varsity-card p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                    <h3 className="font-space font-black text-lg text-[#111111]">{r.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                      {r.completedGames.length} Completed
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {r.completedGames.map((g) => {
                      const isP1Winner = g.winner?.username === g.p1?.username;
                      const isP2Winner = g.winner?.username === g.p2?.username;
                      const isForfeit = g.winner?.username === 'forfeit';
                      return (
                        <div key={g.id} className="py-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
                              {/* Player 1 */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForModal(g.p1)}
                                className={`flex-1 p-3 rounded-xl border flex items-center justify-between transition-colors w-full text-left focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 outline-none ${
                                  isP1Winner ? 'bg-emerald-50/40 border-emerald-100' :
                                  isForfeit ? 'bg-red-50/40 border-red-100' :
                                  'bg-gray-50/50 border-gray-100'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <p title={g.p1?.name} className="text-sm font-black text-[#111111] hover:underline truncate">
                                    {g.p1?.name}
                                  </p>
                                  <span title={g.p1?.school} className="text-[10px] font-bold text-gray-500 block truncate mt-0.5">
                                    {g.p1?.school} {g.p1?.rating ? `(${g.p1.rating})` : ''}
                                  </span>
                                </div>
                                {isP1Winner && (
                                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded shrink-0 ml-2">
                                    Winner
                                  </span>
                                )}
                                {isForfeit && (
                                  <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-1 rounded shrink-0 ml-2">
                                    Forfeit
                                  </span>
                                )}
                              </button>

                              {/* VS Badge */}
                              <span className="text-[10px] font-black text-brand-accent uppercase tracking-wider shrink-0 select-none bg-brand-primary/5 px-2.5 py-1 rounded-full sm:self-center">
                                VS
                              </span>

                              {/* Player 2 */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForModal(g.p2)}
                                className={`flex-1 p-3 rounded-xl border flex items-center justify-between transition-colors w-full text-left focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 outline-none ${
                                  isP2Winner ? 'bg-emerald-50/40 border-emerald-100' :
                                  isForfeit ? 'bg-red-50/40 border-red-100' :
                                  'bg-gray-50/50 border-gray-100'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <p title={g.p2?.name} className="text-sm font-black text-[#111111] hover:underline truncate">
                                    {g.p2?.name}
                                  </p>
                                  <span title={g.p2?.school} className="text-[10px] font-bold text-gray-500 block truncate mt-0.5">
                                    {g.p2?.school} {g.p2?.rating ? `(${g.p2.rating})` : ''}
                                  </span>
                                </div>
                                {isP2Winner && (
                                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded shrink-0 ml-2">
                                    Winner
                                  </span>
                                )}
                                {isForfeit && (
                                  <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-1 rounded shrink-0 ml-2">
                                    Forfeit
                                  </span>
                                )}
                              </button>
                            </div>

                            {g.gameLink && (
                              <a
                                href={g.gameLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-black text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-4 py-2.5 rounded-xl transition-colors text-center shrink-0 border border-brand-primary/10 w-full md:w-auto"
                              >
                                View Game
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        {/* FIXTURES */}
        {activeTab === 'fixtures' && (
          <div className="space-y-4">
            {!tournament || !tournament.rounds?.length ? (
              <p className="text-center text-gray-500 py-20 text-base font-bold">No fixtures generated yet.</p>
            ) : (() => {
              const currentRound = tournament.rounds.find(r => r.roundNum === activeFixtureRound) || tournament.rounds[tournament.rounds.length - 1];
              const activeGames = currentRound.games.filter(g => g.p1 && g.p2 && g.p2.username !== 'bye');
              return (
                <>
                  {/* Round Selector Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 varsity-card p-3">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {tournament.rounds.map(r => (
                        <button key={r.roundNum} onClick={() => { setActiveFixtureRound(r.roundNum); }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                            activeFixtureRound === r.roundNum ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}>
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Games for the selected round */}
                  <div className="varsity-card p-6">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                      <h3 className="font-space font-black text-lg text-[#111111]">{currentRound.name}</h3>
                      <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-full">
                        {currentRound.date} @ 8:00 PM WAT
                      </span>
                    </div>
                    
                    {!activeGames.length ? (
                      <p className="text-sm text-gray-500 italic py-4 text-center">No active matches in this round (all BYEs / auto-advances).</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {activeGames.map((g, i) => (
                          <div key={g.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => setSelectedPlayerForModal(g.p1)}
                                  className="text-sm md:text-base font-bold text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none flex-1 sm:flex-none"
                                >
                                  {g.p1?.name}
                                </button>
                                <span className="text-[10px] font-black text-gray-400 shrink-0 select-none bg-gray-100 px-1.5 py-0.5 rounded sm:hidden">
                                  @{g.p1?.username}
                                </span>
                              </div>
                              
                              <span className="text-[10px] sm:text-xs font-black text-brand-accent shrink-0 select-none self-center sm:self-auto my-0.5 sm:my-0">VS</span>
                              
                              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => setSelectedPlayerForModal(g.p2)}
                                  className="text-sm md:text-base font-bold text-[#111111] hover:text-brand-primary hover:underline truncate text-left cursor-pointer outline-none flex-1 sm:flex-none"
                                >
                                  {g.p2?.name}
                                </button>
                                <span className="text-[10px] font-black text-gray-400 shrink-0 select-none bg-gray-100 px-1.5 py-0.5 rounded sm:hidden">
                                  @{g.p2?.username}
                                </span>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex justify-end shrink-0 mt-1 sm:mt-0">
                              {g.winner
                                ? <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">Won: {g.winner.name}</span>
                                : <span className="text-xs bg-amber-50 text-amber-600 font-bold px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">Pending</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* RULES & SCHEDULE */}
        {activeTab === 'rules' && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left/Middle Column: Scrollable Rulebook */}
            <div className="lg:col-span-2 varsity-card p-6 md:p-8 lg:max-h-[800px] lg:overflow-y-auto no-scrollbar space-y-6">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-brand-accent uppercase mb-1">Official Rulebook</p>
                <h2 className="font-space font-black text-3xl text-[#111111] mb-2 uppercase">SCL Tournament Rules</h2>
                <p className="text-sm text-gray-500 italic">Read carefully. Ignorance of these rules is not an excuse, but honest mistakes have a fair appeal window.</p>
              </div>

              <div className="space-y-6 divide-y divide-gray-100 text-sm text-gray-600 leading-relaxed">
                {/* SECTION 1 */}
                <div className="pt-5 first:pt-0">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 1: Overview</h3>
                  <p className="mb-2">The SS4 Chess League (SCL) is a monthly inter-institutional chess tournament open to students across multiple universities and colleges. It operates as a single-elimination knockout competition, styled after football cup tournaments.</p>
                  <ul className="space-y-1.5 bg-gray-50 p-3 rounded-xl font-medium">
                    <li>· <strong>Format:</strong> Single Elimination Knockout</li>
                    <li>· <strong>Platform:</strong> Chess.com (all games)</li>
                    <li>· <strong>Duration:</strong> June 24 – 30, 2026</li>
                    <li>· <strong>One round per day</strong></li>
                    <li>· <strong>Kick-off time:</strong> 8:00 PM WAT daily</li>
                  </ul>
                </div>

                {/* SECTION 2 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 2: Eligibility &amp; Registration</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>2.1</strong> Open to students of any institution. Register via the official Google Form before the deadline.</li>
                    <li><strong>2.2</strong> Registration deadline: June 22nd, 11:59 PM. No late registrations.</li>
                    <li><strong>2.3</strong> You must provide a valid, active Chess.com username (yours alone).</li>
                    <li><strong>2.4</strong> Provide correct WhatsApp number, full name, school, and department.</li>
                    <li><strong>2.5</strong> One registration per person. Duplicates = disqualification of both.</li>
                    <li><strong>2.6</strong> By registering, you confirm availability to play June 24–30, 6 PM – 10 PM daily.</li>
                  </ul>
                </div>

                {/* SECTION 3 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 3: Seeding &amp; Bracket</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>3.1</strong> Seeded by Chess.com Rapid rating (minimum 20 rated games).</li>
                    <li><strong>3.2</strong> Provisional (less than 20 games) or unrated players go to bottom of bracket (random order).</li>
                    <li><strong>3.3</strong> Byes go to highest-rated non-provisional players to reach the nearest power of 2.</li>
                    <li><strong>3.4</strong> Same-school players are drawn as far apart as possible; can only meet in later rounds.</li>
                    <li><strong>3.5</strong> Full bracket live on official SCL page from June 23rd (link pinned in group).</li>
                  </ul>
                </div>

                {/* SECTION 4 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 4: Match Rules</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>4.1</strong> All games on Chess.com with your registered username only.</li>
                    <li><strong>4.2</strong> Time control: 10+0 Rapid (10 minutes, no increment).</li>
                    <li><strong>4.3</strong> Colours: White = left side of pairing message · Black = right side. Colours alternate across rounds fairly.</li>
                    <li><strong>4.4</strong> Game must be Standard rated Rapid (not unrated, bullet, or blitz).</li>
                    <li><strong>4.5</strong> White player sends challenge to Black player’s Chess.com username.</li>
                    <li><strong>4.6</strong> Results pulled automatically via Chess.com API; no manual reporting needed.</li>
                  </ul>
                </div>

                {/* SECTION 5 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 5: Draw Rule</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>5.1</strong> If a game ends in a draw, a Best of 3 tiebreak applies immediately.</li>
                    <li><strong>5.2</strong> Best of 3: first to win 2 games advances.</li>
                    <li><strong>5.3</strong> Tiebreak time control: Game 1: original 10+0 · Game 2: 10+0 · Game 3 (if needed): 5+3 (5 minutes, 3-second increment) to prevent endless draws.</li>
                    <li><strong>5.4</strong> Colours alternate: Game 1: original assignment · Game 2: reversed · Game 3 (if needed): original again.</li>
                    <li><strong>5.5</strong> All tiebreak games must be completed by 11:00 PM WAT same night.</li>
                    <li><strong>5.6</strong> If still tied after 3 tiebreak games (extremely rare): Armageddon: White gets 5+0, Black gets 4+0, draw = Black wins (guarantees a winner before 11:15 PM WAT).</li>
                  </ul>
                </div>

                {/* SECTION 6 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 6: Scheduling &amp; Grace Period</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>6.1</strong> Every round starts at 8:00 PM WAT on its assigned date. **Round 1 lasts from 8:00 PM WAT (June 24) to 12:00 PM (noon) tomorrow (June 25)**. Other rounds: R2: June 25 · R3: June 26 · R4: June 27 · QF: June 28 · SF: June 29 · Final: June 30.</li>
                    <li><strong>6.2</strong> When pairings are posted, immediately contact your opponent to agree on a start time. For Round 1, agree on a time between 8:00 PM June 24 and 12:00 PM June 25. For subsequent rounds, agree on a time between 8:00 PM – 11:00 PM WAT same night.</li>
                    <li><strong>6.3</strong> Grace period closes at 11:00 PM WAT (or 12:00 PM tomorrow for Round 1). Both players must be ready.</li>
                    <li><strong>6.4</strong> Early play (before 8:00 PM WAT) allowed only with admin approval requested before 6:00 PM WAT that day.</li>
                  </ul>
                </div>

                {/* SECTION 7 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 7: Forfeit Rules</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>7.1</strong> One player absent: If opponent does not respond to WhatsApp and is not online by 10:30 PM WAT: Screenshot your unanswered message(s) and send to admin immediately. You receive a walkover win.</li>
                    <li><strong>7.2</strong> Both players absent: Both disqualified. Highest-rated first-round loser from same bracket quarter becomes lucky loser. If no eligible player, admin awards a bye.</li>
                    <li><strong>7.3</strong> Responsibility: You must check the group and contact your opponent. "I did not see the message" is not an excuse.</li>
                    <li><strong>7.4</strong> Admin forfeit decisions are final but may be reviewed within the appeal window.</li>
                  </ul>
                </div>

                {/* SECTION 8 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 8: Fair Play &amp; Conduct</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>8.1</strong> Engine use is strictly forbidden. No computer assistance, databases, or analysis tools during games.</li>
                    <li><strong>8.2</strong> Chess.com Fair Play system monitors all games. If flagged: Immediate disqualification, opponent advances, permanent ban from all future SCL tournaments. No warnings. No appeals for engine use.</li>
                    <li><strong>8.3</strong> You must play on your registered Chess.com username. Playing on another account = permanent ban.</li>
                    <li><strong>8.4</strong> Allowing someone else to play on your account = permanent ban for both.</li>
                    <li><strong>8.5</strong> Respectful conduct required in chat, WhatsApp group, and DMs. Offenses lead to warnings or disqualification.</li>
                    <li><strong>8.6</strong> Conduct complaints require screenshots as evidence. No evidence = no action.</li>
                  </ul>
                </div>

                {/* SECTION 9 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 9: School Leaderboard</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>9.1</strong> Every player represents their school. Results contribute to a School Leaderboard.</li>
                    <li><strong>9.2</strong> Performance Above Expected (PAE): Exceeding expectation based on seed = positive PAE for school. Underperforming = negative PAE.</li>
                    <li><strong>9.3</strong> Schools need at least 2 registered players to appear on the leaderboard.</li>
                    <li><strong>9.4</strong> Same-school matchups are PAE-neutral. Both players' expected rounds are extended by one.</li>
                    <li><strong>9.5</strong> Leaderboard link pinned in group; check after every round.</li>
                  </ul>
                </div>

                {/* SECTION 10 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 10: Prizes</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>10.1</strong> Champion: Chess.com Diamond Premium (1 month), Official SCL Champion title, permanent spot on SCL leaderboard.</li>
                    <li><strong>10.2</strong> Runner-up and future tournament prizes announced as SCL grows.</li>
                    <li><strong>10.3</strong> Prize is non-transferable and non-negotiable.</li>
                  </ul>
                </div>

                {/* SECTION 11 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 11: Admin &amp; Disputes</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>11.1</strong> The SCL admin has full authority over all tournament decisions (forfeits, conduct, bracket corrections, prizes).</li>
                    <li><strong>11.2</strong> Dispute window: Within 2 hours of the incident OR before 12:00 AM midnight (whichever is earlier).</li>
                    <li><strong>11.3</strong> Limited appeal: May appeal a non-cheating decision once per tournament with new evidence. Admin decision on appeal is final.</li>
                    <li><strong>11.4</strong> Admin reserves the right to amend rules before the tournament starts.</li>
                    <li><strong>11.5</strong> Admin contact: <strong>07071724882</strong> (WhatsApp)</li>
                  </ul>
                </div>

                {/* SECTION 12 */}
                <div className="pt-5">
                  <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 12: General</h3>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>12.1</strong> Participation = full acceptance of all rules above.</li>
                    <li><strong>12.2</strong> SCL reserves the right to disqualify any player for conduct unbecoming of the competition.</li>
                    <li><strong>12.3</strong> These rules apply from registration confirmation until tournament conclusion.</li>
                  </ul>
                  <p className="mt-4 font-space font-black text-[#111111] tracking-widest text-center">THE BOARD REMEMBERS.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Schedule & Support Panel */}
            <div className="space-y-6">
              <div className="varsity-card p-6">
                <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-2">June 2026</p>
                <h2 className="font-space font-black text-xl text-[#111111] mb-4">Daily Schedule</h2>
                <div className="space-y-2.5">
                  {SCHEDULE.map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3.5 bg-[#F6F4F0] rounded-xl">
                      <div>
                        <p className="text-sm font-black text-[#111111]">{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg shrink-0">{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration CTA — auth-gated */}
              <div className="varsity-card p-6">
                <p className="text-xs font-bold tracking-[0.2em] text-brand-primary uppercase mb-2">Join the Tournament</p>
                <h3 className="font-space font-black text-lg text-[#111111] mb-1.5">Ready to Compete?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Sign in to your SS4 player account to register for the next tournament and access your pairings.
                </p>
                <AuthGate
                  reason="register for this tournament"
                  onAction={() => navigate('/dashboard')}
                >
                  <button className="w-full bg-brand-primary text-white text-sm font-bold px-6 py-3.5 rounded-full hover:bg-brand-accent transition-all shadow-md cursor-pointer">
                    Register for Tournament
                  </button>
                </AuthGate>
              </div>

              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 text-center">
                <p className="text-xs font-bold tracking-[0.2em] text-brand-primary uppercase mb-2">Official Contact</p>
                <h3 className="font-space font-black text-lg text-[#111111] mb-1.5">Need Assistance?</h3>
                <p className="text-sm text-gray-500 mb-4">Contact tournament support directly on WhatsApp.</p>
                <a href="https://wa.me/2347071724882" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white text-sm font-bold px-6 py-3.5 rounded-full w-full hover:bg-brand-primary/95 transition-all shadow-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.48 1.328 5l-1.352 4.938 5.056-1.326c1.472.802 3.128 1.226 4.816 1.226 5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm-3.328 5.766c.228 0 .438.006.63.024.198.018.36.036.528.378.228.468.78 1.902.846 2.04.066.138.108.3.006.504-.102.204-.15.33-.3.504-.15.174-.318.39-.456.522-.15.144-.306.3-.132.6.174.3.774 1.278 1.662 2.064.9.792 1.656 1.038 1.89 1.152.234.114.372.096.51-.06.138-.156.6-1.038.756-1.254.156-.216.312-.18.528-.096.216.084 1.368.648 1.602.768.234.12.39.18.45.282.06.102.06.582-.162 1.218-.222.636-1.296 1.242-1.788 1.296-.492.054-.972.192-3.138-.654-2.61-.99-4.29-3.642-4.422-3.816-.132-.174-1.074-1.428-1.074-2.73 0-1.302.678-1.944.918-2.19.24-.246.48-.306.642-.306z" />
                  </svg>
                  Message Support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && isAdmin && adminSubView === 'main' && (
          <div className="varsity-card p-8 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="font-space font-black text-2xl text-[#111111]">Admin Panel</h2>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">Unlocked</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Initialize Bracket</p>
                <p className="text-sm text-gray-500">Seed {selectedMonthYear} tournament with 53 registered players.</p>
                <button onClick={handleOpenR1Gen} className="bg-brand-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-colors">
                  Generate Bracket
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Advance Tournament</p>
                {/* ponytail: calls advanceRound hook function directly */}
                <p className="text-sm text-gray-500">Generate next round fixtures from current winners.</p>
                <button onClick={handleOpenNextGen} className="bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500 transition-colors">
                  Generate Next Round
                </button>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Reset Bracket</p>
                <p className="text-sm text-gray-500">Wipe all results and reshuffle pairings.</p>
                <button 
                  onClick={() => { 
                    const confirmation = window.prompt(`WARNING: This will permanently wipe the tournament bracket for ${selectedMonthYear}. To confirm, please type "RESET" in all caps:`);
                    if (confirmation === 'RESET') {
                      reset();
                      toast.success('Tournament bracket reset successfully!');
                    } else if (confirmation !== null) {
                      toast.error('Reset aborted: incorrect confirmation text.');
                    }
                  }} 
                  className="bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-red-500 transition-colors"
                >
                  Reset Tournament
                </button>
              </div>
            </div>

            {/* Manage Next Round Start Time */}
            <div className="bg-[#FAF9F5] border border-brand-primary/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-space font-black text-lg text-[#111111]">Manage Next Round Start Time</h3>
              <p className="text-xs text-gray-400">Set the target date and time when the next round is scheduled to begin. This dynamically updates the countdown timer shown to players on this page.</p>
              
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Next Round Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={nextRoundStartInput}
                    onChange={(e) => setNextRoundStartInput(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleSaveNextRoundStart}
                    className="bg-brand-primary text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-brand-primary/95 active:scale-95 transition-all cursor-pointer flex-1 sm:flex-initial text-center shadow-sm"
                  >
                    Save Time
                  </button>
                  <button
                    onClick={handleClearNextRoundStart}
                    className="bg-gray-100 text-gray-600 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all cursor-pointer flex-1 sm:flex-initial text-center"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Update Match Results */}
            <div className="bg-[#FAF9F5] border border-brand-primary/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                <div>
                  <h3 className="font-space font-black text-lg text-[#111111]">Update Match Results</h3>
                  <p className="text-xs text-gray-400">Select a winner and game link for any active match, then click Save to sync directly to Supabase.</p>
                </div>
                {tournament?.rounds && (
                  <select
                    value={adminRoundNum}
                    onChange={(e) => setAdminRoundNum(Number(e.target.value))}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-[#111111] cursor-pointer"
                  >
                    {tournament.rounds.map(r => (
                      <option key={r.roundNum} value={r.roundNum}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {!tournament || !tournament.rounds || tournament.rounds.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-4">No tournament or rounds initialized yet.</p>
              ) : (() => {
                const currentAdminRound = tournament.rounds.find(r => r.roundNum === adminRoundNum);
                if (!currentAdminRound || !currentAdminRound.games || !currentAdminRound.games.length) {
                  return <p className="text-sm text-gray-400 italic py-4">No matches in this round.</p>;
                }
                const gamesToShow = currentAdminRound.games.filter(g => g.p1 && g.p2 && g.p1.username !== 'bye' && g.p2.username !== 'bye');
                if (gamesToShow.length === 0) {
                  return <p className="text-sm text-gray-400 italic py-4">All matches in this round are BYEs / auto-advances.</p>;
                }
                return (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {gamesToShow.map((g) => (
                      <AdminMatchRow
                        key={g.id}
                        game={g}
                        onSave={(winner, gameLink) => {
                          logResult(g.id, winner, gameLink);
                        }}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Test cleanup — user requested */}
            <div className="border border-dashed border-amber-200 bg-amber-50/30 rounded-2xl p-5 space-y-3">
              <p className="font-space font-black text-base text-amber-900">Test Data Cleanup</p>
              <p className="text-sm text-amber-700">Removes April &amp; May 2026 mock archives from local storage after testing.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={clearMocks} className="text-sm font-bold bg-amber-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-500 transition-colors">
                  Clear Mock History
                </button>
                <button onClick={() => { setIsAdmin(false); toast.info('Admin locked'); }} className="text-sm font-bold bg-gray-200 text-gray-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors">
                  Lock Panel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN GENERATE R1 VIEW */}
        {activeTab === 'admin' && isAdmin && adminSubView === 'generate-r1' && (
          <div className="varsity-card p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="font-space font-black text-2xl text-[#111111]">Generate Round 1 Fixtures</h2>
                <p className="text-xs text-gray-400">Configure pairing parameters and verify seeding before bracket generation.</p>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Round Date</label>
                <input 
                  type="text" 
                  value={paramCustomDate}
                  onChange={(e) => setParamCustomDate(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Target Elo Gap</label>
                <input 
                  type="number" 
                  value={paramTargetElo}
                  onChange={(e) => setParamTargetElo(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">School Protection Weight</label>
                <input 
                  type="number" 
                  value={paramSchoolPenalty}
                  onChange={(e) => setParamSchoolPenalty(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
            </div>

            {/* Seeded Players Section */}
            <div className="space-y-3">
              <h3 className="font-space font-black text-lg text-[#111111]">Seeding Preview</h3>
              {(() => {
                const { byes, active } = getSeededPlayersR1();
                return (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* BYEs */}
                    <div className="border border-amber-100 bg-amber-50/20 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-100/50">
                        <span className="font-space font-black text-sm text-amber-900">BYE Seeding ({byes.length})</span>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Auto-Advance</span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {byes.map(p => (
                          <div key={p.username} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-amber-100/50">
                            <div>
                              <p className="font-bold text-amber-950">{p.name}</p>
                              <p className="text-gray-400 text-[10px]">{p.school} &bull; @{p.username}</p>
                            </div>
                            <span className="font-black text-amber-700">{p.rating} ELO</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Matchups */}
                    <div className="border border-brand-primary/10 bg-brand-primary/5 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-brand-primary/10">
                        <span className="font-space font-black text-sm text-[#111111]">Active Matchups Seeding ({active.length})</span>
                        <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full uppercase">Round 1 Opponents</span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {active.map(p => (
                          <div key={p.username} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-gray-100">
                            <div>
                              <p className="font-bold text-[#111111]">{p.name}</p>
                              <p className="text-gray-400 text-[10px]">{p.school} &bull; @{p.username}</p>
                            </div>
                            <span className="font-black text-brand-primary">{p.rating} ELO</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-sm font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  initialize({
                    targetEloGap: paramTargetElo,
                    schoolPenalty: paramSchoolPenalty,
                    customDate: paramCustomDate
                  });
                  setAdminSubView('main');
                  toast.success('Round 1 fixtures generated successfully!');
                }}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
              >
                Generate Bracket
              </button>
            </div>
          </div>
        )}

        {/* ADMIN GENERATE NEXT VIEW */}
        {activeTab === 'admin' && isAdmin && adminSubView === 'generate-next' && (
          <div className="varsity-card p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="font-space font-black text-2xl text-[#111111]">Generate Next Round Fixtures</h2>
                <p className="text-xs text-gray-400">Configure pairing parameters and verify survivors before advancing.</p>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Round Date</label>
                <input 
                  type="text" 
                  value={paramCustomDate}
                  onChange={(e) => setParamCustomDate(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Target Elo Gap</label>
                <input 
                  type="number" 
                  value={paramTargetElo}
                  onChange={(e) => setParamTargetElo(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">School Protection Weight</label>
                <input 
                  type="number" 
                  value={paramSchoolPenalty}
                  onChange={(e) => setParamSchoolPenalty(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
            </div>

            {/* Surviving Players preview */}
            <div className="space-y-3">
              <h3 className="font-space font-black text-lg text-[#111111]">Surviving Players Seeding ({getSeededPlayersNext().length})</h3>
              <div className="border border-brand-accent/10 bg-brand-accent/5 rounded-2xl p-5">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {getSeededPlayersNext().map(p => (
                    <div key={p.username} className="flex justify-between items-center text-xs p-2.5 bg-white rounded-lg border border-gray-100">
                      <div>
                        <p className="font-bold text-[#111111]">{p.name}</p>
                        <p className="text-gray-400 text-[10px]">{p.school} &bull; @{p.username}</p>
                      </div>
                      <span className="font-black text-brand-accent shrink-0 ml-2">{p.rating} ELO</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-sm font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  advanceRound({
                    targetEloGap: paramTargetElo,
                    schoolPenalty: paramSchoolPenalty,
                    customDate: paramCustomDate
                  });
                  setAdminSubView('main');
                  toast.success('Next round fixtures generated successfully!');
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
              >
                Generate Next Round
              </button>
            </div>
          </div>
        )}
          </div>
        </>
      )}

      {/* Past Winners Modal */}
      {showPastWinnersModal && (
        <div className="fixed inset-0 bg-[#111111]/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowPastWinnersModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-space font-black text-2xl text-[#111111] mb-5 flex items-center gap-2">🏆 Past Champions</h3>
            
            <div className="space-y-3">
              {history.filter(h => h.status === 'completed').length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4 text-center">No completed tournaments found yet.</p>
              ) : (
                history.filter(h => h.status === 'completed').map(h => (
                  <div key={h.month_year} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 gap-4">
                    <div 
                      onClick={() => {
                        setSelectedMonthYear(h.month_year);
                        setShowPastWinnersModal(false);
                      }}
                      className="min-w-0 flex-1 cursor-pointer hover:opacity-80 group text-left"
                    >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider group-hover:text-brand-primary transition-colors">{h.month_year}</p>
                      <p className="text-sm font-black text-brand-text-dark mt-0.5 truncate group-hover:text-brand-primary transition-colors">{h.name.replace(" SCL Tournament", "")}</p>
                    </div>
                    {h.winner && h.winner !== 'None' ? (
                      <button
                        onClick={() => {
                          const playerObj = typeof h.winner === 'object' ? h.winner : tournamentPlayers.find(p => p.name.toLowerCase() === String(h.winner).toLowerCase()) || { name: h.winner, username: String(h.winner).toLowerCase().replace(/\s+/g, '') };
                          setSelectedPlayerForModal(playerObj);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 hover:border-emerald-200 shrink-0 cursor-pointer transition-all active:scale-95 text-xs font-black text-emerald-700"
                      >
                        🏆 {typeof h.winner === 'object' ? h.winner?.name : h.winner}
                      </button>
                    ) : (
                      <div className="bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 shrink-0 text-xs font-bold text-gray-400">
                        None
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setShowPastWinnersModal(false)}
              className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-[#111111]/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowRulesModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <h3 className="font-space font-black text-2xl text-[#111111]">📖 SCL Tournament Rules</h3>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto py-6 pr-2 flex-grow space-y-6 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 1: General Rules</h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>1.1</strong> By participating, you agree to all rules listed herein.</li>
                  <li><strong>1.2</strong> Cheating, engine usage, and bad conduct will result in disqualification.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 2: Eligibility &amp; Registration</h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>2.1</strong> Open to students of any institution. Register via the official Google Form before the deadline.</li>
                  <li><strong>2.2</strong> You must provide a valid, active Chess.com username.</li>
                  <li><strong>2.6</strong> By registering, you confirm availability to play June 24–30, 6 PM – 10 PM daily.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 4: Match Rules</h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>4.1</strong> All games on Chess.com with your registered username only.</li>
                  <li><strong>4.2</strong> Time control: 10+0 Rapid (10 minutes, no increment).</li>
                  <li><strong>4.3</strong> Colours: White = left side of pairing message &bull; Black = right side.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 6: Scheduling &amp; Grace Period</h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>6.1</strong> Every round starts at 8:00 PM WAT on its assigned date.</li>
                  <li><strong>6.2</strong> When pairings are posted, immediately contact your opponent to agree on a start time.</li>
                  <li><strong>6.3</strong> Grace period closes at 11:00 PM WAT. Both players must be ready.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-space font-black text-base text-[#111111] uppercase mb-2">Section 8: Fair Play &amp; Conduct</h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>8.1</strong> Engine use is strictly forbidden. No computer assistance or analysis tools.</li>
                  <li><strong>8.2</strong> Chess.com Fair Play system monitors all games. If flagged: Immediate disqualification and permanent ban.</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 shrink-0">
              <button 
                onClick={() => setShowRulesModal(false)}
                className="w-full py-3 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PIN modal */}
      {pinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPinModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center relative" onClick={e => e.stopPropagation()}>
            <p className="font-space font-black text-lg text-[#111111] mb-1">Admin Login</p>
            <p className="text-xs text-gray-400 mb-6">Enter your 4-digit PIN</p>
            <div className="relative flex items-center justify-center w-full">
              <input type={showPin ? "text" : "password"} inputMode="numeric" maxLength={8} autoFocus
                value={pinInput} onChange={e => { setPinInput(e.target.value); setPinErr(''); }}
                onKeyDown={e => e.key === 'Enter' && submitPin()}
                className={`w-36 text-center pl-8 pr-10 py-3 text-xl font-black tracking-[0.4em] bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary mb-2 ${pinErr ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="····"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                style={{ right: 'calc(50% - 66px)', top: '14px' }}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPin ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {pinErr && <p className="text-xs text-red-500 mb-3">{pinErr}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setPinModal(false)} className="flex-1 text-xs font-bold py-2.5 bg-gray-100 text-gray-500 rounded-xl cursor-pointer hover:bg-gray-200">Cancel</button>
              <button onClick={submitPin} className="flex-1 text-xs font-bold py-2.5 bg-brand-primary text-white rounded-xl cursor-pointer hover:bg-brand-primary/90">Unlock</button>
            </div>
          </div>
        </div>
      )}
      {/* Join Tournament modal */}
      {showJoinModal && (
        <JoinModal
          mode={joinModalMode}
          onClose={() => setShowJoinModal(false)}
          onSignIn={() => {
            setShowJoinModal(false);
            openAuthModal('join the next tournament', handleJoinTournamentAfterAuth, 'login');
          }}
          onRegister={() => {
            setShowJoinModal(false);
            openAuthModal('join the next tournament', handleJoinTournamentAfterAuth, 'register');
          }}
          clock={{ days, hours, mins, secs }}
        />
      )}
      {/* Player details modal */}
      {selectedPlayerForModal && (
        <TournamentPlayerModal 
          player={selectedPlayerForModal} 
          onClose={() => setSelectedPlayerForModal(null)} 
        />
      )}
    </div>
  );
}
