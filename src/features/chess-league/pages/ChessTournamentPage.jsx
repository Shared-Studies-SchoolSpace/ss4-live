import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTournament } from '../hooks/useTournament';
import { tournamentPlayers } from '../data/tournamentPlayers';
import { getTournamentDates, getCountdownTarget, getSurvivingPlayers, getSurvivingPlayersStatus, getGroupData, calculateNextUpcomingMonth } from '../utils/tournament';
import { buildPlayerRecord } from '../utils/buildPlayerRecord';
import { TournamentHero } from '../components/TournamentHero';
import { BracketTab } from '../components/BracketTab';
import { GroupStageTable } from '../components/GroupStageTable';
import { TournamentPlayerModal } from '../components/TournamentPlayerModal';
import { PlayerCardSide, usePlayerDetails } from '../components/MatchCardHelper';
import AuthGate from '../../auth-portal/components/AuthGate';
import { useAuth } from '../../auth-portal/hooks/useAuth';
import { useAuthModal } from '../../auth-portal/context/AuthModalContext';
import { supabase } from '../../../supabase';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { fetchCompletePlayerData, searchMutualGames } from '../utils/chessService';
import AdminBroadcastPanel from '../../../components/announcements/AdminBroadcastPanel';

const ADMIN_PIN = '1926';

function getChampionScopedStats(historyItem) {
  const winnerRaw = historyItem?.winner;
  if (!winnerRaw || winnerRaw === 'None') return null;

  const winnerName = typeof winnerRaw === 'object' ? winnerRaw.name : String(winnerRaw);
  const winnerUsername = typeof winnerRaw === 'object'
    ? (winnerRaw.username || String(winnerRaw).toLowerCase().replace(/\s+/g, ''))
    : String(winnerRaw).toLowerCase().replace(/\s+/g, '');

  const playerObj = (tournamentPlayers || []).find(p =>
    p.username?.toLowerCase() === winnerUsername.toLowerCase() ||
    p.name?.toLowerCase() === winnerName.toLowerCase()
  ) || (typeof winnerRaw === 'object' ? winnerRaw : { name: winnerName, username: winnerUsername });

  const rating = playerObj.rating || winnerRaw.rating || 1850;
  const school = playerObj.school || playerObj.university || 'SS4 League';
  const avatar = playerObj.avatar || playerObj.image || `https://unavatar.io/lichess/${winnerUsername}`;

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let runnerUpRaw = historyItem?.runner_up || historyItem?.runnerUp;

  const rounds = historyItem?.rounds || [];
  if (rounds.length > 0) {
    rounds.forEach(r => {
      (r?.games || []).forEach(g => {
        if (!g) return;
        const p1User = (g.p1?.username || g.p1?.name || '').toLowerCase();
        const p1Name = (g.p1?.name || g.p1?.username || '').toLowerCase();
        const p2User = (g.p2?.username || g.p2?.name || '').toLowerCase();
        const p2Name = (g.p2?.name || g.p2?.username || '').toLowerCase();

        const isP1 = g.p1 && (p1User === winnerUsername.toLowerCase() || p1Name === winnerName.toLowerCase());
        const isP2 = g.p2 && (p2User === winnerUsername.toLowerCase() || p2Name === winnerName.toLowerCase());

        if (isP1 || isP2) {
          const winnerUser = (typeof g.winner === 'object' && g.winner ? (g.winner.username || g.winner.name || '') : '').toLowerCase();
          const winnerNameStr = (typeof g.winner === 'object' && g.winner ? (g.winner.name || g.winner.username || '') : '').toLowerCase();
          const isWinner = (winnerUser && winnerUser === winnerUsername.toLowerCase()) || (winnerNameStr && winnerNameStr === winnerName.toLowerCase());
          const isDraw = g.winner === 'draw' || (typeof g.winner === 'object' && g.winner?.username === 'draw');

          if (isWinner) {
            wins++;
            const opponent = isP1 ? g.p2 : g.p1;
            if ((r.name?.toLowerCase().includes('final') || r.roundNum === rounds.length) && opponent && opponent.username !== 'bye') {
              runnerUpRaw = opponent;
            }
          } else if (isDraw) {
            draws++;
          } else if (g.winner) {
            losses++;
          }
        }
      });
    });
  }

  if (!runnerUpRaw && rounds.length > 0) {
    const finalRound = rounds[rounds.length - 1] || rounds.find(r => r.name?.toLowerCase().includes('final'));
    if (finalRound && finalRound.games) {
      const finalGame = finalRound.games.find(g => 
        (g?.p1 && ((g.p1.username || '').toLowerCase() === winnerUsername.toLowerCase() || (g.p1.name || '').toLowerCase() === winnerName.toLowerCase())) ||
        (g?.p2 && ((g.p2.username || '').toLowerCase() === winnerUsername.toLowerCase() || (g.p2.name || '').toLowerCase() === winnerName.toLowerCase()))
      );
      if (finalGame) {
        const isP1 = finalGame.p1 && ((finalGame.p1.username || '').toLowerCase() === winnerUsername.toLowerCase() || (finalGame.p1.name || '').toLowerCase() === winnerName.toLowerCase());
        runnerUpRaw = isP1 ? finalGame.p2 : finalGame.p1;
      }
    }
  }

  const runnerUpName = runnerUpRaw ? (typeof runnerUpRaw === 'object' ? runnerUpRaw.name : String(runnerUpRaw)) : 'Finalist';
  const runnerUpUsername = runnerUpRaw ? (typeof runnerUpRaw === 'object'
    ? (runnerUpRaw.username || String(runnerUpRaw).toLowerCase().replace(/\s+/g, ''))
    : String(runnerUpRaw).toLowerCase().replace(/\s+/g, '')) : 'finalist';

  const runnerUpObj = runnerUpRaw ? ((tournamentPlayers || []).find(p =>
    p.username?.toLowerCase() === runnerUpUsername.toLowerCase() ||
    p.name?.toLowerCase() === runnerUpName.toLowerCase()
  ) || (typeof runnerUpRaw === 'object' ? runnerUpRaw : { name: runnerUpName, username: runnerUpUsername })) : null;

  const totalGames = wins + losses + draws || 6;
  const winRate = Math.round(((wins || 6) / totalGames) * 100);

  return {
    playerObj,
    winnerName,
    winnerUsername,
    rating,
    school,
    avatar,
    wins: wins || 6,
    losses: losses || 0,
    draws: draws || 0,
    totalGames,
    winRate,
    runnerUpObj,
    runnerUpName,
    runnerUpUsername
  };
}

const TrophySvg = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 -960 960 960" fill="currentColor">
    <path d="M280-120v-80h160v-116q-111-8-185.5-84.5T180-590v-90h80v-80h440v80h80v90q0 113-74.5 189.5T520-316v116h160v80H280Zm0-550h-20v90q0 73 47.5 125T420-402v-268H280Zm260 133q65-5 112.5-57t47.5-125v-90H540v272Z" />
  </svg>
);

function ChampionAvatarImg({ playerObj, winnerName, winnerUsername, className = "w-full h-full object-cover" }) {
  const fallbackAvatar = "https://images.chesscomfiles.com/uploads/v1/user/0.2a67e1a3.160x160o.1ce84ef4df63.png";

  const [avatarUrl, setAvatarUrl] = useState(() => {
    return playerObj?.avatar || playerObj?.image || playerObj?.photo || `https://unavatar.io/chess.com/${winnerUsername || 'chess'}`;
  });

  useEffect(() => {
    let isMounted = true;
    const username = winnerUsername || playerObj?.chess_username || playerObj?.username;
    if (username) {
      fetchCompletePlayerData(username, 'chess.com').then(data => {
        if (isMounted && data?.avatar) {
          setAvatarUrl(data.avatar);
        } else if (isMounted) {
          fetchCompletePlayerData(username, 'lichess').then(lData => {
            if (isMounted && lData?.avatar) {
              setAvatarUrl(lData.avatar);
            } else if (isMounted) {
              setAvatarUrl(fallbackAvatar);
            }
          });
        }
      }).catch(() => {
        if (isMounted) setAvatarUrl(fallbackAvatar);
      });
    }
    return () => { isMounted = false; };
  }, [winnerUsername, playerObj]);

  return (
    <img
      src={avatarUrl}
      alt={winnerName || 'Champion'}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackAvatar;
      }}
    />
  );
}

function getChampionPathwayMatches(historyItem, championUsername, championName) {
  const rounds = historyItem?.rounds || [];
  if (!rounds.length) return [];

  const cleanChampUser = (championUsername || '').toLowerCase().trim();
  const cleanChampName = (championName || '').toLowerCase().trim();

  const pathway = [];

  rounds.forEach((r, rIdx) => {
    const roundTitle = r.name || (r.roundNum ? `Round ${r.roundNum}` : `Phase ${rIdx + 1}`);
    const games = r.games || [];

    games.forEach(g => {
      const p1User = (g.p1?.username || '').toLowerCase().trim();
      const p1Name = (g.p1?.name || '').toLowerCase().trim();
      const p2User = (g.p2?.username || '').toLowerCase().trim();
      const p2Name = (g.p2?.name || '').toLowerCase().trim();

      const isP1 = (cleanChampUser && p1User === cleanChampUser) || (cleanChampName && p1Name === cleanChampName);
      const isP2 = (cleanChampUser && p2User === cleanChampUser) || (cleanChampName && p2Name === cleanChampName);

      if (isP1 || isP2) {
        const opponentObj = isP1 ? g.p2 : g.p1;
        let opponentDisplay = 'Opponent';
        if (opponentObj && opponentObj.username !== 'bye') {
          opponentDisplay = opponentObj.name || opponentObj.username || 'Opponent';
        } else if (opponentObj && opponentObj.username === 'bye') {
          opponentDisplay = 'BYE (Automatic Advance)';
        }

        const isWinner = g.winner && typeof g.winner === 'object'
          ? ((cleanChampUser && (g.winner.username || '').toLowerCase() === cleanChampUser) || (cleanChampName && (g.winner.name || '').toLowerCase() === cleanChampName))
          : false;

        const isDraw = g.winner === 'draw';

        pathway.push({
          roundTitle,
          opponentDisplay,
          isWinner,
          isDraw,
          scoreText: isWinner ? `Defeated ${opponentDisplay}` : isDraw ? `Tied ${opponentDisplay}` : `Lost to ${opponentDisplay}`
        });
      }
    });
  });

  return pathway;
}



function AdminMatchRow({ game, onSave }) {
  const getInitialWinner = (w) => {
    if (!w) return '';
    if (typeof w === 'object') {
      if (w.username === 'draw' || w.name === 'Draw') return 'draw';
      if (w.username === 'forfeit' || w.name === 'Double Forfeit') return 'forfeit';
      return w.username || '';
    }
    if (w === 'draw') return 'draw';
    return String(w);
  };

  const [winnerUsername, setWinnerUsername] = useState(() => getInitialWinner(game.winner));
  const [gameLink, setGameLink] = useState(game.gameLink || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWinnerUsername(getInitialWinner(game.winner));
    setGameLink(game.gameLink || '');
  }, [game]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedWinner = winnerUsername === game.p1?.username 
        ? game.p1 
        : winnerUsername === game.p2?.username 
          ? game.p2 
          : winnerUsername === 'draw'
            ? { username: 'draw', name: 'Draw', rating: 0, school: '' }
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

  const isDraw = winnerUsername === 'draw';
  const isForfeit = winnerUsername === 'forfeit';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 varsity-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {game.id}
          </span>
          {game.winner && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isDraw ? 'text-blue-600 bg-blue-50' : isForfeit ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'
            }`}>
              {isDraw ? '🤝 Draw' : isForfeit ? 'Double Forfeit' : 'Completed'}
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
            className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111] placeholder-gray-300 transition-all bg-gray-50/50"
          />
        </div>

        <div className="w-full sm:w-[170px]">
          <select
            value={winnerUsername}
            onChange={(e) => setWinnerUsername(e.target.value)}
            className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111] transition-all cursor-pointer"
          >
            <option value="">-- Select Result --</option>
            <option value={game.p1?.username}>Winner: {game.p1?.name}</option>
            <option value={game.p2?.username}>Winner: {game.p2?.name}</option>
            <option value="draw">🤝 Draw (0.5 Pts Each)</option>
            <option value="forfeit">Double Forfeit (Both Removed)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-primary text-white text-xs font-black px-5 py-3 min-h-[44px] rounded-xl hover:bg-brand-primary/95 active:scale-95 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center shrink-0 shadow-sm flex items-center justify-center"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function ResultFixtureCard({ game, roundName, onSelectPlayer }) {
  const p1Details = usePlayerDetails(game.p1?.username, game.p1);
  const p2Details = usePlayerDetails(game.p2?.username, game.p2);

  const isP1Winner = game.winner?.username === game.p1?.username;
  const isP2Winner = game.winner?.username === game.p2?.username;
  const isDraw = game.winner?.username === 'draw' || game.winner?.name === 'Draw';
  const isForfeit = game.winner?.username === 'forfeit';

  let p1Score = '0';
  let p2Score = '0';
  if (isP1Winner) {
    p1Score = '1';
    p2Score = '0';
  } else if (isP2Winner) {
    p1Score = '0';
    p2Score = '1';
  } else if (isDraw) {
    p1Score = '½';
    p2Score = '½';
  } else if (isForfeit) {
    p1Score = '0';
    p2Score = '0';
  } else if (game.p1Score !== undefined && game.p2Score !== undefined) {
    p1Score = String(game.p1Score);
    p2Score = String(game.p2Score);
  }

  const p1Avatar = game.p1?.avatar || game.p1?.image || p1Details?.avatar;
  const p2Avatar = game.p2?.avatar || game.p2?.image || p2Details?.avatar;

  const p1Initials = (game.p1?.name || '?')
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const p2Initials = (game.p2?.name || '?')
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-full max-w-[780px] mx-auto bg-white border-2 border-brand-primary/20 hover:border-brand-primary/50 rounded-2xl flex items-center justify-between px-3 sm:px-6 py-3 shadow-2xs hover:shadow-xs transition-all duration-200 group my-6 sm:my-8">
      {/* Player 1 Team Block */}
      <button
        type="button"
        onClick={() => onSelectPlayer && onSelectPlayer(game.p1)}
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 focus:outline-none cursor-pointer group/p1 text-left"
      >
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brand-primary/10 border border-brand-primary/30 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover/p1:border-brand-primary transition-colors">
          {p1Avatar ? (
            <img src={p1Avatar} alt={game.p1?.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-space font-black text-xs sm:text-sm text-brand-primary tracking-wider">
              {p1Initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[#111111] font-black text-xs sm:text-sm tracking-tight uppercase leading-tight group-hover/p1:text-brand-primary transition-colors truncate">
            {game.p1?.name || 'Player 1'}
          </div>
          {game.p1?.school && (
            <div className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
              {game.p1.school}
            </div>
          )}
        </div>
      </button>

      {/* Reduced-Width Center Score Box - SS4 Brand Primary Blue (#1A56C4) */}
      <div className="shrink-0 w-24 sm:w-32 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 sm:gap-4 py-1.5 sm:py-2 px-2 mx-3 sm:mx-6 shadow-2xs">
        <span className={`text-xl sm:text-2xl font-black leading-none ${isP1Winner ? 'text-amber-300 drop-shadow-2xs' : 'text-white'}`}>
          {p1Score}
        </span>
        <span className="w-[2px] h-4 sm:h-5 bg-white/40 rounded-full shrink-0" />
        <span className={`text-xl sm:text-2xl font-black leading-none ${isP2Winner ? 'text-amber-300 drop-shadow-2xs' : 'text-white'}`}>
          {p2Score}
        </span>
      </div>

      {/* Player 2 Team Block */}
      <button
        type="button"
        onClick={() => onSelectPlayer && onSelectPlayer(game.p2)}
        className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0 focus:outline-none cursor-pointer group/p2 text-right"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[#111111] font-black text-xs sm:text-sm tracking-tight uppercase leading-tight group-hover/p2:text-brand-primary transition-colors truncate">
            {game.p2?.name || 'Player 2'}
          </div>
          {game.p2?.school && (
            <div className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
              {game.p2.school}
            </div>
          )}
        </div>
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brand-primary/10 border border-brand-primary/30 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover/p2:border-brand-primary transition-colors">
          {p2Avatar ? (
            <img src={p2Avatar} alt={game.p2?.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-space font-black text-xs sm:text-sm text-brand-primary tracking-wider">
              {p2Initials}
            </span>
          )}
        </div>
      </button>

      {/* View Game Link Badge if available */}
      {game.gameLink && (
        <a
          href={game.gameLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 bg-white border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-2xs transition-all flex items-center gap-1 z-10"
        >
          <span>View Game</span>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function ChessTournamentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);

  const { tournament, history, isDbFallback, isLoading, initialize, logResult, saveGameLink, advanceRound, deleteRound, reset, clearMocks, updateNextRoundStart } = useTournament(selectedMonthYear);

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'table';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    const monthParam = params.get('month');
    if (monthParam) {
      setSelectedMonthYear(monthParam);
    } else {
      // Auto-detect the active (or most recent) tournament month
      supabase
        .from('tournaments')
        .select('month_year')
        .eq('status', 'active')
        .order('month_year', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.month_year) {
            setSelectedMonthYear(data.month_year);
          } else {
            // Fallback: most recent tournament of any status
            return supabase
              .from('tournaments')
              .select('month_year')
              .order('month_year', { ascending: false })
              .limit(1)
              .maybeSingle()
              .then(({ data: d }) => {
                const now = new Date();
                setSelectedMonthYear(d?.month_year || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
              });
          }
        })
        .catch(() => {
          const now = new Date();
          setSelectedMonthYear(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        });
    }
  }, [location.search]);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [pinModal, setPinModal]     = useState(false);
  const [pinInput, setPinInput]     = useState('');
  const [pinErr, setPinErr]         = useState('');
  const [showPin, setShowPin]       = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [adminRoundNum, setAdminRoundNum] = useState(1);
  const [adminGroupFilter, setAdminGroupFilter] = useState('ALL');
  const adminRoundInitializedRef = useRef(false);
  const [adminSubView, setAdminSubView] = useState('main'); // 'main' | 'generate-r1' | 'generate-next'
  const [activeFixtureRound, setActiveFixtureRound] = useState(1);
  const [activeGroupFilter, setActiveGroupFilter] = useState('ALL');
  const [isDownloadingFixturesImage, setIsDownloadingFixturesImage] = useState(false);
  useEffect(() => { setActiveGroupFilter('ALL'); }, [activeFixtureRound]);
  const [paramTargetElo, setParamTargetElo] = useState(400);
  const [paramSchoolPenalty, setParamSchoolPenalty] = useState(150);
  const [paramCustomDate, setParamCustomDate] = useState('');
  const [paramRoundName, setParamRoundName] = useState('Group Stage Round 2');
  const [paramUseCustomRoundName, setParamUseCustomRoundName] = useState(false);
  const [paramManualSelection, setParamManualSelection] = useState(false);
  const [selectedSurvivingUsernames, setSelectedSurvivingUsernames] = useState([]);
  const [manualPlayerSearch, setManualPlayerSearch] = useState('');
  const [showSurvivalLogicTooltip, setShowSurvivalLogicTooltip] = useState(false);

  const ASSUMED_NEXT_ROUNDS = [
    'Group Stage Round 1',
    'Group Stage Round 2',
    'Group Stage Round 3',
    'Round of 32',
    'Round of 16',
    'Quarterfinals',
    'Semifinals',
    'Final',
    'Group Stage Round 4',
    'Group Stage Round 5'
  ];

  // Missing handle prompt modal states
  const [showUsernamePromptModal, setShowUsernamePromptModal] = useState(false);
  const [promptUsername, setPromptUsername] = useState('');
  const [verifyingPromptUsername, setVerifyingPromptUsername] = useState(false);
  const [promptError, setPromptError] = useState('');
  const [pendingRegData, setPendingRegData] = useState(null);

  const [isScouring, setIsScouring] = useState(false);
  const [scourProgress, setScourProgress] = useState(null);

  const handleAutoUpdateResults = async () => {
    if (!tournament || !tournament.rounds || tournament.rounds.length === 0) {
      toast.error("No active tournament initialized.");
      return;
    }

    setIsScouring(true);
    setScourProgress("Initializing game history scour...");
    let matchesScoured = 0;
    let resultsUpdated = 0;

    try {
      // Collect all active (uncompleted) matches across all rounds
      const pendingGames = [];
      tournament.rounds.forEach(round => {
        (round.games || []).forEach(game => {
          if (!game.winner && game.p1 && game.p2 && game.p1.username !== 'bye' && game.p2.username !== 'bye') {
            pendingGames.push({ round, game });
          }
        });
      });

      if (pendingGames.length === 0) {
        toast.info("No pending matches found to scour.");
        setIsScouring(false);
        setScourProgress(null);
        return;
      }

      toast.info(`Scouring last 10 matches for ${pendingGames.length} active games...`);

      for (let i = 0; i < pendingGames.length; i++) {
        const { game } = pendingGames[i];
        const p1 = game.p1;
        const p2 = game.p2;

        matchesScoured++;
        setScourProgress(`Checking Match ${i + 1}/${pendingGames.length}: ${p1.name} vs ${p2.name}...`);

        // Scour last 10 games of home player p1 vs away player p2
        const matchData = await searchMutualGames(p1, p2);

        if (matchData && matchData.winner) {
          let winnerObj = null;
          const cleanWinner = String(matchData.winner).toLowerCase().trim();
          const cleanP1User = (p1.username || '').toLowerCase().trim();
          const cleanP1Chess = (p1.chess_username || '').toLowerCase().trim();
          const cleanP1Lichess = (p1.lichess_username || '').toLowerCase().trim();
          const cleanP2User = (p2.username || '').toLowerCase().trim();
          const cleanP2Chess = (p2.chess_username || '').toLowerCase().trim();
          const cleanP2Lichess = (p2.lichess_username || '').toLowerCase().trim();

          if (cleanWinner === cleanP1User || cleanWinner === cleanP1Chess || cleanWinner === cleanP1Lichess) {
            winnerObj = p1;
          } else if (cleanWinner === cleanP2User || cleanWinner === cleanP2Chess || cleanWinner === cleanP2Lichess) {
            winnerObj = p2;
          } else if (cleanWinner === 'draw' || cleanWinner === 'tie') {
            winnerObj = { username: 'draw', name: 'Draw' };
          }

          if (winnerObj) {
            await logResult(game.id, winnerObj, matchData.url);
            resultsUpdated++;
            toast.success(`Auto-updated match ${p1.name} vs ${p2.name}: Winner ${winnerObj.name || winnerObj.username}`);
          }
        }
      }

      toast.success(`Auto update complete! Scoured ${matchesScoured} matches, updated ${resultsUpdated} results.`);
    } catch (err) {
      console.error("Error during auto-update scour:", err);
      toast.error("Auto update failed: " + err.message);
    } finally {
      setIsScouring(false);
      setScourProgress(null);
    }
  };

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
    const defaultRoundName = ASSUMED_NEXT_ROUNDS[nextNum - 1] || `Round ${nextNum}`;
    setParamRoundName(defaultRoundName);
    setParamUseCustomRoundName(false);
    
    // Auto-populate surviving usernames by default
    const autoQualifiers = getSurvivingPlayers(tournament);
    setSelectedSurvivingUsernames(autoQualifiers.map(p => p.username));
    setParamManualSelection(false);
    setManualPlayerSearch('');
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

  const survivalStatus = React.useMemo(() => {
    if (!tournament?.rounds?.length) return { isComplete: true, pendingCount: 0, pendingGames: [], survivors: [] };
    return getSurvivingPlayersStatus(tournament, paramRoundName);
  }, [tournament, paramRoundName]);

  const seededPlayersNext = React.useMemo(() => {
    return survivalStatus.survivors || [];
  }, [survivalStatus]);

  const [selectedManualGroupFilter, setSelectedManualGroupFilter] = useState('ALL');

  const allTournamentPlayers = React.useMemo(() => {
    const staticList = tournamentPlayers || [];
    const dynamicList = tournament?.players || [];
    const map = new Map();
    [...staticList, ...dynamicList].forEach(p => {
      if (p && p.username) {
        map.set(p.username.toLowerCase(), p);
      }
    });
    return Array.from(map.values());
  }, [tournament?.players]);

  const manualGroupsData = React.useMemo(() => {
    return getGroupData(tournament, allTournamentPlayers);
  }, [tournament, allTournamentPlayers]);

  const { user, profile, updatePlayerDivision } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) for admin access (M6: Jakob's Law fix)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setPinInput('');
        setPinErr('');
        setShowPin(false);
        setPinModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVerifyAndJoin = async () => {
    if (!promptUsername.trim()) {
      setPromptError('Chess.com username is required');
      return;
    }
    setVerifyingPromptUsername(true);
    setPromptError('');
    try {
      const data = await fetchCompletePlayerData(promptUsername.trim(), 'chess.com');
      if (data.error || !data.rating) {
        setPromptError('Chess.com username not found. Please try again.');
        setVerifyingPromptUsername(false);
        return;
      }

      // Update profile
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          chess_username: promptUsername.trim(),
          chess_rating: data.rating
        })
        .eq('id', pendingRegData.user.id);

      if (profileUpdateError) {
        setPromptError('Failed to update profile. Please try again.');
        setVerifyingPromptUsername(false);
        return;
      }

      // Sync division
      try {
        const updatedProfile = { 
          ...pendingRegData.profile, 
          chess_username: promptUsername.trim(),
          chess_rating: data.rating
        };
        const maxRating = Math.max(updatedProfile.chess_rating || 0, updatedProfile.lichess_rating || 0);
        await updatePlayerDivision(updatedProfile, maxRating);
      } catch (divErr) {
        console.warn('Division sync failed on modal registration:', divErr.message);
      }

      setShowUsernamePromptModal(false);
      
      const updatedProfile = { 
        ...pendingRegData.profile, 
        chess_username: promptUsername.trim(),
        chess_rating: data.rating
      };
      
      setLoadingReg(true);
      await executeRegistration(pendingRegData.user, updatedProfile);
    } catch (err) {
      setPromptError('Verification failed: ' + err.message);
      setVerifyingPromptUsername(false);
    }
  };

  const [nextRoundStartInput, setNextRoundStartInput] = useState('');
  const [nextRoundLabelInput, setNextRoundLabelInput] = useState('Registration Closes in');
  const [regCustomTextInput, setRegCustomTextInput] = useState('Single elimination. Last 7 days of the month. One champion claims the prize.');
  const [labelDropdownEnabled, setLabelDropdownEnabled] = useState(false);

  const ROUND_LABEL_OPTIONS = [
    'Registration Closes in',
    'Registration Deadline in',
    'Tournament Begins in',
    'Round of 32 starts in',
    'Group Stage Round 1 starts in',
    'Group Stage Round 2 starts in',
    'Group Stage Round 3 starts in',
    'Round of 16 starts in',
    'Quarterfinals start in',
    'Semifinals start in',
    'The Final starts in',
  ];
  const [showPastWinnersModal, setShowPastWinnersModal] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [loadingPathwayId, setLoadingPathwayId] = useState(null);
  const [fetchedPathways, setFetchedPathways] = useState({});

  const handleTogglePathway = async (monthYear, historyItem) => {
    if (expandedHistoryId === monthYear) {
      setExpandedHistoryId(null);
      return;
    }
    setExpandedHistoryId(monthYear);

    const itemToUse = fetchedPathways[monthYear] || historyItem;
    if ((!itemToUse?.rounds || itemToUse.rounds.length === 0) && !fetchedPathways[monthYear]) {
      setLoadingPathwayId(monthYear);
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('*')
          .eq('month_year', monthYear)
          .maybeSingle();
        if (data) {
          setFetchedPathways(prev => ({ ...prev, [monthYear]: data }));
        }
      } catch (err) {
        console.warn('Error fetching tournament history for pathway:', err);
      } finally {
        setLoadingPathwayId(null);
      }
    }
  };
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Upcoming tournament states
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [loadingReg, setLoadingReg] = useState(false);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);



  // Fetch upcoming tournament enforcing state invariants:
  // 1. If an active tournament exists -> NO upcoming tournament exists (purge upcoming rows).
  // 2. If no active tournament exists -> fetch or auto-create the next upcoming tournament based on starting month rule.
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        // Check if an active tournament exists
        const { data: activeRows } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'active')
          .limit(1);

        if (activeRows && activeRows.length > 0) {
          // Rule: When a tournament is active, NO tournament is upcoming!
          await supabase.from('tournaments').delete().eq('status', 'upcoming');
          setUpcomingTournament(null);
          return;
        }

        // Fetch existing upcoming tournament
        const { data: upcomingRows, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .order('month_year', { ascending: true })
          .limit(1);

        if (error) throw error;

        if (upcomingRows && upcomingRows.length > 0) {
          setUpcomingTournament(upcomingRows[0]);
        } else {
          // Auto-create next upcoming tournament using starting month calculation rule
          const { data: allT } = await supabase.from('tournaments').select('*');
          const targetMY = calculateNextUpcomingMonth(allT || []);

          const autoRow = {
            id: targetMY,
            month_year: targetMY,
            name: `${targetMY} SCL Tournament`,
            status: 'upcoming',
            players: [],
            rounds: [],
            winner: null
          };
          const { data: inserted, error: insertErr } = await supabase
            .from('tournaments')
            .upsert(autoRow)
            .select()
            .maybeSingle();

          if (insertErr) {
            console.error('Error auto-creating upcoming tournament:', insertErr);
          } else {
            setUpcomingTournament(inserted || autoRow);
          }
        }
      } catch (err) {
        console.error('Error fetching upcoming tournament:', err);
      }
    };
    fetchUpcoming();
  }, []);

  // Derive registered players from the upcoming tournament's actual player roster.
  // This is the ground truth — not `profiles`. Only people who clicked Join are shown.
  useEffect(() => {
    if (upcomingTournament) {
      setRegisteredPlayers(upcomingTournament.players || []);
    } else {
      setRegisteredPlayers([]);
    }
  }, [upcomingTournament]);

  const isUserRegisteredForUpcoming = React.useMemo(() => {
    if (!user) return false;
    return registeredPlayers.some(p => p.id === user.id);
  }, [user, registeredPlayers]);

  const handleJoinTournament = async () => {
    if (!user) return;

    if (isUserRegisteredForUpcoming) {
      toast.info("You're already registered for this tournament.");
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
      // Fetch the latest tournament state to avoid writing to a stale roster
      const { data: freshT } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .maybeSingle();

      const currentT = freshT || upcomingTournament;

      // Guard: only upcoming tournaments are open for registration
      if (!currentT || currentT.status !== 'upcoming') {
        toast.error('Registration is only available for upcoming tournaments. This tournament is already underway or has ended.');
        setLoadingReg(false);
        return;
      }

      // Guard: require a chess.com username — tournaments run on chess.com
      if (!targetProfile.chess_username) {
        setPendingRegData({ user: targetUser, profile: targetProfile });
        setPromptUsername('');
        setPromptError('');
        setVerifyingPromptUsername(false);
        setShowUsernamePromptModal(true);
        setLoadingReg(false);
        return;
      }

      const regPlayer = buildPlayerRecord(targetUser, targetProfile);

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
      toast.success("Your spot is locked in! The board awaits.");
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Registration could not be completed. Please try again.');
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

  const activeTargetT = useMemo(() => {
    return upcomingTournament || tournament;
  }, [upcomingTournament, tournament]);

  useEffect(() => {
    const tick = () => {
      const { date, label: targetLabel } = getCountdownTarget(activeTargetT);
      const diff = Math.max(0, date ? (new Date(date).getTime() - Date.now()) : 0);
      setClock({
        days:  Math.floor(diff / 864e5),
        hours: Math.floor(diff / 36e5) % 24,
        mins:  Math.floor(diff / 6e4) % 60,
        secs:  Math.floor(diff / 1e3) % 60,
        label: targetLabel || 'Registration Closes in'
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTargetT]);

  useEffect(() => {
    if (activeTargetT) {
      if (activeTargetT.next_round_label) setNextRoundLabelInput(activeTargetT.next_round_label);
      if (activeTargetT.reg_custom_text) setRegCustomTextInput(activeTargetT.reg_custom_text);

      const latestRound = activeTargetT?.rounds && activeTargetT.rounds[activeTargetT.rounds.length - 1];
      const targetDateStr = activeTargetT.next_round_start || latestRound?.next_round_start;
      if (targetDateStr) {
        try {
          const d = new Date(targetDateStr);
          const offset = d.getTimezoneOffset();
          const localTime = new Date(d.getTime() - offset * 60 * 1000);
          setNextRoundStartInput(localTime.toISOString().slice(0, 16));
        } catch {
          setNextRoundStartInput('');
        }
      }
    }
  }, [activeTargetT]);

  const formattedTargetTime = React.useMemo(() => {
    try {
      const { date } = getCountdownTarget(activeTargetT);
      if (!date) return `18:00 ${tzAbbr}`;
      const timeStr = date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${timeStr} ${tzAbbr} (${dateStr})`;
    } catch {
      return `18:00 ${tzAbbr}`;
    }
  }, [activeTargetT, tzAbbr]);

  const googleCalendarUrl = React.useMemo(() => {
    try {
      const { date } = getCountdownTarget(activeTargetT);
      if (!date) return '#';
      const startStr = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endStr = new Date(date.getTime() + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
      return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + 
        encodeURIComponent("SCL Monthly Chess Tournament") + 
        "&dates=" + startStr + "/" + endStr + 
        "&details=" + encodeURIComponent("Join the monthly SCL Chess Tournament. Single elimination, WAT 18:00 start.");
    } catch {
      return "#";
    }
  }, [activeTargetT]);

  const handleSaveNextRoundStart = async () => {
    if (!nextRoundStartInput) {
      toast.error('Please select a valid date and time.');
      return;
    }
    try {
      const isoStr = new Date(nextRoundStartInput).toISOString();

      // 1. Save directly to Supabase tournaments table
      const targetT = activeTargetT;
      if (targetT && targetT.id) {
        const { error } = await supabase
          .from('tournaments')
          .update({
            next_round_start: isoStr,
            next_round_label: nextRoundLabelInput,
            reg_custom_text: regCustomTextInput
          })
          .eq('id', targetT.id);

        if (error) console.error("Supabase update error:", error);
      }

      // 2. Update local upcomingTournament state immediately
      setUpcomingTournament(prev => prev ? ({
        ...prev,
        next_round_start: isoStr,
        next_round_label: nextRoundLabelInput,
        reg_custom_text: regCustomTextInput
      }) : {
        id: selectedMonthYear,
        month_year: selectedMonthYear,
        name: `${selectedMonthYear} SCL Tournament`,
        status: 'upcoming',
        next_round_start: isoStr,
        next_round_label: nextRoundLabelInput,
        reg_custom_text: regCustomTextInput,
        players: [],
        rounds: []
      });

      // 3. Update active tournament hook state if active rounds exist
      if (tournament?.rounds?.length) {
        await updateNextRoundStart(isoStr, nextRoundLabelInput);
      }

      toast.success('Registration countdown & page settings saved!');
    } catch (e) {
      console.error(e);
      toast.error('Error updating countdown settings.');
    }
  };

  const handleClearNextRoundStart = async () => {
    try {
      const targetT = upcomingTournament || tournament;
      if (targetT && targetT.id) {
        await supabase
          .from('tournaments')
          .update({
            next_round_start: null,
            next_round_label: null,
            reg_custom_text: null
          })
          .eq('id', targetT.id);
      }

      if (upcomingTournament) {
        setUpcomingTournament(prev => ({
          ...prev,
          next_round_start: null,
          next_round_label: null,
          reg_custom_text: null
        }));
      }

      if (tournament?.rounds?.length) {
        await updateNextRoundStart(null, undefined);
      }

      setNextRoundStartInput('');
      setRegCustomTextInput('');
      toast.success('Registration countdown & text cleared.');
    } catch (e) {
      toast.error('Error clearing countdown.');
    }
  };

  const handleDownloadFixturesImage = async (roundName) => {
    const element = document.getElementById('fixtures-export-container');
    if (!element) {
      toast.error('Fixtures element not found');
      return;
    }
    const toastId = toast.loading('Generating HD fixtures image...');
    setIsDownloadingFixturesImage(true);

    const originalGetComputedStyle = window.getComputedStyle;
    
    // Patch window.getComputedStyle safely during html2canvas lifecycle to convert oklch/oklab colors
    window.getComputedStyle = function(el, pseudo) {
      const style = originalGetComputedStyle.call(this, el, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          const val = target[prop];
          if (prop === 'cssText' && typeof val === 'string') {
            return val.replace(/oklch\([^)]+\)/g, '#1A56C4').replace(/oklab\([^)]+\)/g, '#1A56C4');
          }
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
            let fallback = '#1A56C4';
            const propStr = prop.toString().toLowerCase();
            if (propStr.includes('background') || propStr.includes('bg')) {
              fallback = '#FFFFFF';
            } else if (propStr.includes('border') || propStr.includes('gray') || propStr.includes('neutral') || propStr.includes('slate') || propStr.includes('ring')) {
              fallback = '#E5E7EB';
            }
            return val.replace(/oklch\([^)]+\)/g, fallback).replace(/oklab\([^)]+\)/g, fallback);
          }
          if (typeof val === 'function') {
            if (prop === 'getPropertyValue') {
              return function(styleProp) {
                const rawVal = target.getPropertyValue(styleProp);
                if (typeof rawVal === 'string' && (rawVal.includes('oklch') || rawVal.includes('oklab'))) {
                  let fallback = '#1A56C4';
                  const stylePropStr = styleProp.toLowerCase();
                  if (stylePropStr.includes('background') || stylePropStr.includes('bg')) {
                    fallback = '#FFFFFF';
                  } else if (stylePropStr.includes('border') || stylePropStr.includes('gray') || stylePropStr.includes('neutral') || stylePropStr.includes('slate') || stylePropStr.includes('ring')) {
                    fallback = '#E5E7EB';
                  }
                  return rawVal.replace(/oklch\([^)]+\)/g, fallback).replace(/oklab\([^)]+\)/g, fallback);
                }
                return rawVal;
              };
            }
            return val.bind(target);
          }
          return val;
        }
      });
    };

    try {
      const html2canvas = (await import('html2canvas')).default;
      const width = element.offsetWidth || element.scrollWidth;
      const height = element.offsetHeight || element.scrollHeight;

      const canvas = await html2canvas(element, {
        backgroundColor: '#FFFFFF',
        scale: 3, // High resolution (3x) for crystal-clear text without distortion
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: width,
        height: height,
        scrollX: 0,
        scrollY: 0
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const formattedRoundName = (roundName || 'Round').replace(/\s+/g, '_');
      link.download = `SCL_Fixtures_${formattedRoundName}.png`;
      link.href = dataUrl;
      link.click();

      toast.update(toastId, {
        render: 'Fixtures image downloaded!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
    } catch (err) {
      console.error('Download error:', err);
      toast.update(toastId, {
        render: 'Failed to generate fixtures image',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setIsDownloadingFixturesImage(false);
    }
  };

  useEffect(() => {
    if (tournament?.rounds?.length) {
      const latestRoundNum = tournament.rounds[tournament.rounds.length - 1].roundNum;
      if (!adminRoundInitializedRef.current) {
        adminRoundInitializedRef.current = true;
        setAdminRoundNum(latestRoundNum);
        setActiveFixtureRound(latestRoundNum);
      } else {
        setActiveFixtureRound(latestRoundNum);
      }
    }
  }, [tournament]);

  const submitPin = () => {
    if (pinInput === ADMIN_PIN) { setIsAdmin(true); setPinModal(false); toast.success('Admin unlocked'); }
    else { setPinErr('Wrong PIN'); setPinInput(''); }
  };

  // M2: Pin current user to the top of registered players list
  const sortedRegisteredPlayers = React.useMemo(() => {
    if (!user) return registeredPlayers;
    return [...registeredPlayers].sort((a, b) => {
      if (a.id === user.id) return -1;
      if (b.id === user.id) return 1;
      return 0;
    });
  }, [user, registeredPlayers]);

  // M1: Differentiate primary 'Bracket' & 'Table' tabs visually
  const TABS = [
    { 
      id: 'table', 
      label: 'Table', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M9 4v16M15 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
        </svg>
      ) 
    },
    { 
      id: 'fixtures', 
      label: 'Fixtures', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      id: 'bracket', 
      label: 'Knockout Bracket', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) 
    },
    { 
      id: 'results', 
      label: 'Results',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'rules', 
      label: 'Rules & Schedule',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    ...(isAdmin ? [{ 
      id: 'admin', 
      label: 'Admin',
      icon: (
         <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    }] : []),
  ];


  const isUpcoming = !tournament || tournament.status === 'upcoming';

  return (
    <div className="min-h-screen bg-[#F6F4F0]">
      <ToastContainer position="bottom-right" />

      {isLoading ? (
        /* Skeleton Loading View (H3: Doherty Threshold Fix) */
        <div className="relative text-white px-4 sm:px-6 md:px-12 py-16 min-h-[70vh] flex flex-col justify-center bg-slate-900 animate-pulse">
          <div className="max-w-4xl mx-auto w-full text-center space-y-8">
            <div className="h-4 bg-white/10 rounded w-32 mx-auto"></div>
            <div className="h-16 bg-white/10 rounded-2xl w-3/4 mx-auto"></div>
            <div className="h-6 bg-white/10 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-4 max-w-md mx-auto">
              <div className="h-20 bg-white/10 rounded-2xl flex-1"></div>
              <div className="h-20 bg-white/10 rounded-2xl flex-1"></div>
              <div className="h-20 bg-white/10 rounded-2xl flex-1"></div>
              <div className="h-20 bg-white/10 rounded-2xl flex-1"></div>
            </div>
            <div className="h-12 bg-white/10 rounded-xl w-48 mx-auto"></div>
          </div>
        </div>
      ) : isUpcoming && !isAdmin ? (
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
                {activeTargetT?.reg_custom_text || regCustomTextInput || 'Single elimination. Last 7 days of the month. One champion claims the prize.'}
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
                <AuthGate reason="join the next tournament" onAction={handleJoinTournamentAfterAuth}>
                  <Button
                    onClick={handleJoinTournament}
                    loading={loadingReg}
                    size="lg"
                    variant="primary"
                    icon={
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    }
                  >
                    Join the next Tournament
                  </Button>
                </AuthGate>
              )}

              <Button
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="white-outline"
                size="lg"
                icon={
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                Add to Calendar
              </Button>
              <Button
                onClick={() => setShowPastWinnersModal(true)}
                variant="white-outline"
                size="lg"
                icon={
                  <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
              >
                View Past Winners
              </Button>
              <Button
                onClick={() => setShowRulesModal(true)}
                variant="white-outline"
                size="lg"
                icon={
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              >
                Rules & Schedule
              </Button>
            </div>

            {/* Registered Players List */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 sm:p-8 max-w-2xl mx-auto text-left space-y-4 mt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-space font-black text-base sm:text-lg text-white">Registered Participants</h3>
                  <span className="bg-white/10 border border-white/10 text-gray-300 text-xs font-black px-2 py-0.5 rounded-lg shrink-0">
                    {sortedRegisteredPlayers.length}
                  </span>
                </div>
                {sortedRegisteredPlayers.length > 8 && (
                  <span className="text-[10px] text-white/50 italic">Scroll to view all participants</span>
                )}
              </div>
              
              {sortedRegisteredPlayers.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-4 text-center">No participants registered yet. Be the first to join!</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {sortedRegisteredPlayers.map((p, idx) => {
                    const isSelf = user && user.id === p.id;
                    return (
                      <div 
                        key={p.id || idx} 
                        className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelf 
                            ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            {p.name}
                            {isSelf && (
                              <span className="text-[9px] font-black uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{p.school}</p>
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-xl shrink-0">
                          <span className="text-[10px] font-black text-blue-200">{p.rating} ELO</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Tournament View (Hero + Tab Layout) */
        <>


          {/* Sticky Mobile-First Tab Bar (Fitts's Law & Hick's Law Fix) */}
          <div className="sticky top-16 lg:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-3 sm:px-6 md:px-12 lg:px-16 shadow-xs">
            <div className="max-w-5xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar touch-pan-x py-1">
              {TABS.map(t => {
                const isPrimary = t.id === 'bracket';
                const isActive = activeTab === t.id;
                return (
                  <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id)}
                    className={`min-h-[48px] px-3.5 py-3 font-black whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-2 text-sm sm:text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-t-xl ${
                      isActive 
                        ? 'border-brand-primary text-brand-primary bg-brand-primary/5' 
                        : 'border-transparent text-gray-500 hover:text-[#111111] hover:bg-gray-50/50'
                    }`}
                  >
                    {t.icon && <span className={isActive ? 'text-brand-primary' : 'text-gray-400'}>{t.icon}</span>}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DB status pill */}
          {isDbFallback && (
            <div className="bg-blue-50 border-b border-blue-100 text-center py-2 px-4">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Offline: changes stored locally</p>
            </div>
          )}

          {/* Tab content wrapper */}
          <div className={`${activeTab === 'table' ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-3 sm:px-6 md:px-8 lg:px-0 py-6 sm:py-10 transition-all duration-300`}>

        {/* TABLE (GROUP STANDINGS) */}
        {activeTab === 'table' && (
          <GroupStageTable
            tournament={tournament}
            currentUser={user}
            onPlayerSelect={setSelectedPlayerForModal}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        )}

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
                <div key={r.roundNum} className="varsity-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-space font-black text-lg sm:text-xl text-[#111111]">{r.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                      {r.completedGames.length} Completed
                    </span>
                  </div>
                  <div className="space-y-6 sm:space-y-8 pt-3">
                    {r.completedGames.map((g) => (
                      <ResultFixtureCard
                        key={g.id}
                        game={g}
                        roundName={r.name}
                        onSelectPlayer={setSelectedPlayerForModal}
                      />
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        {/* FIXTURES */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            {!tournament || !tournament.rounds?.length ? (
              <div className="varsity-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto text-brand-primary mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-space font-black text-xl text-[#111111] mb-2">No Fixtures Generated Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  Fixtures will appear here automatically as rounds are generated by tournament administration.
                </p>
              </div>
            ) : (() => {
              const currentRound = tournament.rounds.find(r => r.roundNum === activeFixtureRound) || tournament.rounds[tournament.rounds.length - 1];
              const allActiveGames = (currentRound.games || []).filter(g => g.p1 && g.p2 && g.p2.username !== 'bye');

              // Collect all distinct group labels in this round for the filter tabs
              const groupLabels = Array.from(new Set(allActiveGames.map(g => g.groupLabel).filter(Boolean))).sort();

              const activeGames = activeGroupFilter === 'ALL'
                ? allActiveGames
                : allActiveGames.filter(g => g.groupLabel === activeGroupFilter);

              // Detect user's game in this round
              const userGame = user && allActiveGames.find(g =>
                user.id === g.p1?.id || user.id === g.p2?.id ||
                user.email?.split('@')[0] === g.p1?.username || user.email?.split('@')[0] === g.p2?.username
              );
              const userIsP1 = userGame && (user.id === userGame.p1?.id || user.email?.split('@')[0] === userGame.p1?.username);
              const opponent = userGame ? (userIsP1 ? userGame.p2 : userGame.p1) : null;
              
              return (
                <div className="space-y-6">
                  {/* Round Selector Bar */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-0.5">
                      {[...tournament.rounds].reverse().map(r => {
                        const isActive = activeFixtureRound === r.roundNum;
                        const formattedName = (r.name || `Round ${r.roundNum}`)
                          .replace(/Group Stage Round /i, 'Group stage ')
                          .replace(/Group Stage /i, 'Group stage ');
                        return (
                          <button 
                            key={r.roundNum} 
                            onClick={() => setActiveFixtureRound(r.roundNum)}
                            className={`text-xs font-black px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                              isActive 
                                ? 'bg-brand-primary text-white shadow-sm' 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                            }`}
                          >
                            <svg className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formattedName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* "Who is My Opponent?" Banner (logged-in users only) */}
                  {user && (
                    <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 animate-in fade-in duration-300 ${
                      userGame
                        ? 'bg-brand-primary/5 border-brand-primary/30 ring-1 ring-brand-primary/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        userGame ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Who is my opponent?</p>
                        {userGame ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <p className="text-sm font-black text-[#111111]">
                              You face <span className="text-brand-primary">{opponent?.name}</span>
                              {userGame.groupLabel && <span className="text-gray-400 font-semibold"> · Group {userGame.groupLabel}</span>}
                            </p>
                            {opponent?.username && (
                              <span className="text-xs font-semibold text-gray-400">@{opponent.username}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-gray-500">You have no match scheduled in this round.</p>
                        )}
                      </div>
                      {userGame?.gameLink && (
                        <a
                          href={userGame.gameLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-black bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-sm"
                        >
                          Watch Game
                        </a>
                      )}
                      {userGame && !userGame.gameLink && (
                        <button
                          onClick={() => {
                            setActiveGroupFilter(userGame.groupLabel || 'ALL');
                            setTimeout(() => {
                              const el = document.getElementById(`fixture-card-${userGame.id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                          }}
                          className="shrink-0 text-xs font-black bg-white border border-brand-primary text-brand-primary px-4 py-2 rounded-xl hover:bg-brand-primary/5 transition-colors"
                        >
                          Find My Match
                        </button>
                      )}
                    </div>
                  )}

                  {/* Group Filter Tabs */}
                  {groupLabels.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        onClick={() => setActiveGroupFilter('ALL')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                          activeGroupFilter === 'ALL'
                            ? 'bg-brand-primary text-white shadow-xs font-black'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                        }`}
                      >
                        All Groups
                      </button>
                      {groupLabels.map(label => (
                        <button
                          key={label}
                          onClick={() => setActiveGroupFilter(label)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                            activeGroupFilter === label
                              ? 'bg-brand-primary text-white shadow-xs font-black'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                          }`}
                        >
                          Group {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Header Summary & Download Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                    <h3 className="font-space font-black text-xl text-[#111111] flex items-center gap-2">
                      <span>{currentRound.name} Pairings</span>
                      {activeGroupFilter !== 'ALL' && (
                        <span className="bg-[#0B193C] text-blue-300 border border-blue-400/30 font-space font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider">Group {activeGroupFilter}</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200/60 px-3 py-1.5 rounded-full shadow-2xs">
                        {activeGames.length} {activeGames.length === 1 ? 'Match' : 'Matches'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadFixturesImage(currentRound?.name)}
                        disabled={isDownloadingFixturesImage}
                        className="inline-flex items-center gap-1.5 text-xs font-black bg-brand-primary hover:bg-brand-primary/95 text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>{isDownloadingFixturesImage ? 'Exporting...' : 'Download Image'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Exportable Fixtures Grid Container */}
                  <div id="fixtures-export-container">

                  {/* Individual Fixture Cards Grid */}
                  {!activeGames.length ? (
                    <div className="varsity-card p-12 text-center">
                      <p className="text-sm text-gray-500 italic py-4">No matches in Group {activeGroupFilter} for this round.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeGames.map((g, gameIdx) => {
                        const isP1Winner = g.winner && (g.winner.username === g.p1?.username || g.winner.id === g.p1?.id);
                        const isP2Winner = g.winner && (g.winner.username === g.p2?.username || g.winner.id === g.p2?.id);
                        const isForfeit = g.winner && (g.winner.username === 'forfeit' || g.winner.name === 'Forfeit');
                        const isDraw = g.winner && (g.winner.username === 'draw' || g.winner.name === 'Draw');
                        const isMatchDone = !!g.winner;
                        const groupLabel = g.groupLabel || (currentRound.isGroupStage ? String.fromCharCode(65 + (gameIdx % 4)) : null);

                        const isUserGame = user && (
                          user.id === g.p1?.id || user.id === g.p2?.id ||
                          user.email?.split('@')[0] === g.p1?.username || user.email?.split('@')[0] === g.p2?.username
                        );

                        return (
                          <div 
                            id={`fixture-card-${g.id}`}
                            key={g.id || gameIdx}
                            className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition-all overflow-hidden ${
                              isUserGame 
                                ? 'border-brand-primary/80 ring-2 ring-brand-primary/20 shadow-blue-50/50' 
                                : 'border-gray-100'
                            }`}
                          >
                            {/* Card Header Bar */}
                            <div className="bg-brand-bg-cream/40 border-b border-gray-100 px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
                                {groupLabel && (
                                  <span className="bg-[#0B193C] text-blue-300 border border-blue-400/30 font-space font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:py-1 rounded-lg uppercase tracking-wider shadow-2xs shrink-0">
                                    Group {groupLabel}
                                  </span>
                                )}
                                <span className="text-[11px] sm:text-xs font-bold text-gray-500 shrink-0">
                                  Match #{gameIdx + 1}
                                </span>
                                {isUserGame && (
                                  <span className="bg-blue-100 border border-blue-300 text-brand-primary text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <span>YOUR MATCH</span>
                                  </span>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className="shrink-0 ml-auto">
                                {isMatchDone && (
                                  <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${
                                    isForfeit 
                                      ? 'bg-red-50 text-red-700 border-red-200' 
                                      : isDraw 
                                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}>
                                    {isForfeit ? 'Double Forfeit' : isDraw ? 'Match Drawn' : `Won by ${g.winner.name}`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Content: Single Line Flex Row (Even on Mobile) */}
                            <div className="p-3 sm:p-5 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
                              
                              {/* Player 1 Card (Left 43%) */}
                              <div 
                                onClick={() => setSelectedPlayerForModal(g.p1)}
                                className={`w-[43%] shrink-0 min-w-0 border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all cursor-pointer hover:bg-gray-50/60 ${
                                  isP1Winner 
                                    ? 'bg-emerald-50/50 border-emerald-200/80 ring-1 ring-emerald-300/50' 
                                    : 'bg-white border-gray-100'
                                }`}
                              >
                                <PlayerCardSide 
                                  name={g.p1?.name || 'TBD'} 
                                  username={g.p1?.username || ''} 
                                  playerObj={g.p1} 
                                  align="left" 
                                  isWinner={isP1Winner}
                                />
                              </div>

                              {/* VS Center Badge (Center 14%) */}
                              <div className="w-[14%] shrink-0 flex flex-col items-center justify-center select-none py-1">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-black text-[10px] sm:text-xs flex items-center justify-center shadow-2xs">
                                  VS
                                </div>
                              </div>

                              {/* Player 2 Card (Right 43%) */}
                              <div 
                                onClick={() => setSelectedPlayerForModal(g.p2)}
                                className={`w-[43%] shrink-0 min-w-0 border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all cursor-pointer hover:bg-gray-50/60 ${
                                  isP2Winner 
                                    ? 'bg-emerald-50/50 border-emerald-200/80 ring-1 ring-emerald-300/50' 
                                    : 'bg-white border-gray-100'
                                }`}
                              >
                                <PlayerCardSide 
                                  name={g.p2?.name || 'TBD'} 
                                  username={g.p2?.username || ''} 
                                  playerObj={g.p2} 
                                  align="right" 
                                  isWinner={isP2Winner}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* RULES & SCHEDULE */}
        {activeTab === 'rules' && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left/Middle Column: Scrollable Rulebook */}
            <div className="lg:col-span-2 varsity-card p-6 md:p-8 lg:max-h-[800px] lg:overflow-y-auto space-y-6">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-brand-accent uppercase mb-1">Official Rulebook</p>
                <h2 className="font-space font-black text-3xl text-[#111111] mb-2 uppercase">SCL Tournament Rules</h2>
                <p className="text-sm text-gray-500 italic mb-4">Read carefully. Ignorance of these rules is not an excuse, but honest mistakes have a fair appeal window.</p>
                
                {/* M5: Miller's Law / Chunking Category Anchor Pills */}
                <div className="flex flex-wrap gap-2 pt-2 pb-4 border-b border-gray-100">
                  <a href="#rules-gameplay" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 22H5v-2h14v2zm-2-3H7v-2h10v1.5zm-5-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm2.8 7.3A4.5 4.5 0 0 0 12 8a4.5 4.5 0 0 0-2.8 1.3C8.1 10.6 7.5 12.7 7.5 15h9c0-2.3-.6-4.4-1.7-5.7z"/></svg>
                    <span>Gameplay &amp; Match Rules</span>
                  </a>
                  <a href="#rules-fairplay" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                    <span>Fair Play &amp; Forfeits</span>
                  </a>
                  <a href="#rules-prizes" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <TrophySvg className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prizes &amp; Leaderboard</span>
                  </a>
                </div>
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
                <div id="rules-gameplay" className="pt-5 scroll-mt-6">
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
                <div id="rules-fairplay" className="pt-5 scroll-mt-6">
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
                <div id="rules-prizes" className="pt-5 scroll-mt-6">
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
                <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-2">
                  {(() => {
                    const [y, m] = (selectedMonthYear || '2026-06').split('-').map(Number);
                    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  })()}
                </p>
                <h2 className="font-space font-black text-xl text-[#111111] mb-1">Daily Schedule</h2>
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  Tournaments always begin 7 days to the end of the month
                </p>
                <div className="space-y-2.5">
                  {(() => {
                    const [y, m] = (selectedMonthYear || '2026-06').split('-').map(Number);
                    const dates = getTournamentDates(y, m);
                    const roundsMeta = [
                      { label: 'Day 1', desc: 'Group Stage — Round 1' },
                      { label: 'Day 2', desc: 'Group Stage — Round 2' },
                      { label: 'Day 3', desc: 'Group Stage — Round 3' },
                      { label: 'Day 4', desc: 'Knockout — Round of 32' },
                      { label: 'Day 5', desc: 'Knockout — Round of 16' },
                      { label: 'Day 6', desc: 'Quarterfinals' },
                      { label: 'Day 7', desc: 'Semifinals' },
                      { label: 'Day 8', desc: 'Grand Final & Rest / Tiebreaks' },
                    ];

                    return roundsMeta.map((meta, i) => {
                      const d = new Date(dates[i]);
                      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={meta.label} className="flex items-center justify-between p-3.5 bg-[#F6F4F0] rounded-xl">
                          <div>
                            <p className="text-sm font-black text-[#111111]">{meta.label}</p>
                            <p className="text-xs text-gray-500">{meta.desc}</p>
                          </div>
                          <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg shrink-0">{dateStr}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Registration CTA  auth-gated */}
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
          <div className="space-y-8">
            <AdminBroadcastPanel />
            <div className="varsity-card p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <h2 className="font-space font-black text-xl sm:text-2xl text-[#111111]">Admin Panel</h2>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 w-fit">Unlocked</span>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 sm:p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Initialize Bracket</p>
                <p className="text-sm text-gray-500">Seed {selectedMonthYear} tournament with 53 registered players.</p>
                <button onClick={handleOpenR1Gen} className="w-full min-h-[44px] bg-brand-primary text-white text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-brand-primary/90 transition-colors flex items-center justify-center">
                  Generate Bracket
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Advance Tournament</p>
                {/* ponytail: calls advanceRound hook function directly */}
                <p className="text-sm text-gray-500">Generate next round fixtures from current winners.</p>
                <button onClick={handleOpenNextGen} className="w-full min-h-[44px] bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-emerald-500 transition-colors flex items-center justify-center">
                  Generate Next Round
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 space-y-3">
                <p className="font-space font-black text-base text-[#111111]">Auto Update Results</p>
                <p className="text-sm text-gray-500">Scour last 10 matches of home players for games vs away players & update DB.</p>
                <button 
                  onClick={handleAutoUpdateResults} 
                  disabled={isScouring}
                  className="bg-brand-primary text-white text-sm font-bold px-4 py-3 min-h-[44px] rounded-xl cursor-pointer hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 w-full disabled:opacity-50"
                >
                  {isScouring ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Scouring...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Auto Update</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-6 space-y-3">
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
                  className="w-full min-h-[44px] bg-red-600 text-white text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-red-500 transition-colors flex items-center justify-center"
                >
                  Reset Tournament
                </button>
              </div>
            </div>

            {scourProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-bold text-brand-primary shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-brand-primary animate-ping shrink-0"></span>
                  <span>{scourProgress}</span>
                </div>
              </div>
            )}

            {/* Manage Next Round Countdown */}
            <div className="bg-[#FAF9F5] border border-brand-primary/10 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-space font-black text-lg text-[#111111]">Manage Countdown</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Controls the live countdown timer and its label shown to all players.</p>
                </div>
              </div>

              {/* Countdown Label Row */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Countdown Label / Text</label>
                  <div className="flex items-center gap-2 min-h-[44px]">
                    <span className="text-[10px] font-bold text-gray-500">Preset Dropdown</span>
                    <button
                      onClick={() => setLabelDropdownEnabled(v => !v)}
                      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                        labelDropdownEnabled ? 'bg-brand-primary' : 'bg-gray-300'
                      }`}
                      title={labelDropdownEnabled ? 'Switch to custom text input' : 'Switch to preset dropdown'}
                      aria-label="Toggle label dropdown"
                      role="switch"
                      aria-checked={labelDropdownEnabled}
                    >
                      <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        labelDropdownEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {labelDropdownEnabled ? (
                  <select
                    value={nextRoundLabelInput}
                    onChange={(e) => setNextRoundLabelInput(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-brand-primary/40 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111] cursor-pointer"
                  >
                    {ROUND_LABEL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={nextRoundLabelInput}
                    onChange={(e) => setNextRoundLabelInput(e.target.value)}
                    placeholder="e.g. Round of 32 starts in"
                    className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                  />
                )}
              </div>

              {/* Registration Hero Subtitle / Copy */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Hero Subtitle / Custom Copy</label>
                <input
                  type="text"
                  value={regCustomTextInput}
                  onChange={(e) => setRegCustomTextInput(e.target.value)}
                  placeholder="e.g. Single elimination. Last 7 days of the month. One champion claims the prize."
                  className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>

              {/* Date + Time Row */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Round Start Date & Time</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setHours(20, 0, 0, 0);
                        const offset = d.getTimezoneOffset();
                        const localTime = new Date(d.getTime() - offset * 60 * 1000);
                        setNextRoundStartInput(localTime.toISOString().slice(0, 16));
                      }}
                      className="text-xs font-bold px-3 py-2 min-h-[44px] bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition-colors cursor-pointer flex items-center"
                    >
                      ⚡ 8:00 PM Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(20, 0, 0, 0);
                        const offset = d.getTimezoneOffset();
                        const localTime = new Date(d.getTime() - offset * 60 * 1000);
                        setNextRoundStartInput(localTime.toISOString().slice(0, 16));
                      }}
                      className="text-xs font-bold px-3 py-2 min-h-[44px] bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition-colors cursor-pointer flex items-center"
                    >
                      ⚡ 8:00 PM Tomorrow
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                  <div className="flex-1 w-full">
                    <input
                      type="datetime-local"
                      value={nextRoundStartInput}
                      onChange={(e) => setNextRoundStartInput(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleSaveNextRoundStart}
                      className="bg-brand-primary text-white text-xs font-black px-5 py-3 min-h-[44px] rounded-xl hover:bg-brand-primary/95 active:scale-95 transition-all cursor-pointer flex-1 sm:flex-initial text-center shadow-sm flex items-center justify-center"
                    >
                      Save Countdown
                    </button>
                    <button
                      onClick={handleClearNextRoundStart}
                      className="bg-gray-100 text-gray-600 text-xs font-black px-4 py-3 min-h-[44px] rounded-xl hover:bg-gray-200 transition-all cursor-pointer flex-1 sm:flex-initial text-center flex items-center justify-center"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Match Results */}
            <div className="bg-[#FAF9F5] border border-brand-primary/10 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
                <div>
                  <h3 className="font-space font-black text-lg text-[#111111]">Update Match Results</h3>
                  <p className="text-xs text-gray-400">Select a winner and game link for any active match, then click Save to sync directly to Supabase.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAutoUpdateResults}
                    disabled={isScouring}
                    className="bg-brand-primary text-white text-xs font-black px-4 py-2.5 min-h-[44px] rounded-xl hover:bg-brand-accent transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isScouring ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span>Scouring...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Auto Update</span>
                      </>
                    )}
                  </button>
                  {tournament?.rounds && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <select
                        value={adminRoundNum}
                        onChange={(e) => setAdminRoundNum(Number(e.target.value))}
                        className="text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-[#111111] cursor-pointer w-full sm:w-auto"
                      >
                        {tournament.rounds.map(r => (
                          <option key={r.roundNum} value={r.roundNum}>{r.name}</option>
                        ))}
                      </select>

                      {(() => {
                        const currentAdminRound = tournament.rounds.find(r => r.roundNum === adminRoundNum);
                        const groupsInRound = [...new Set((currentAdminRound?.games || []).map(g => g.groupLabel).filter(Boolean))].sort();
                        return (
                          <>
                            {groupsInRound.length > 0 && (
                              <select
                                value={adminGroupFilter}
                                onChange={(e) => setAdminGroupFilter(e.target.value)}
                                className="text-xs font-bold px-3.5 py-2.5 min-h-[44px] border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-[#111111] cursor-pointer w-full sm:w-auto"
                              >
                                <option value="ALL">All Groups</option>
                                {groupsInRound.map(grp => (
                                  <option key={grp} value={grp}>Group {grp}</option>
                                ))}
                              </select>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteRound(adminRoundNum)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3.5 py-2.5 min-h-[44px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                              title="Delete all generated fixtures for the selected round"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete Round Fixtures</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              
              {!tournament || !tournament.rounds || tournament.rounds.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-4">No tournament or rounds initialized yet.</p>
              ) : (() => {
                const currentAdminRound = tournament.rounds.find(r => r.roundNum === adminRoundNum);
                if (!currentAdminRound || !currentAdminRound.games || !currentAdminRound.games.length) {
                  return <p className="text-sm text-gray-400 italic py-4">No matches in this round.</p>;
                }
                let gamesToShow = currentAdminRound.games.filter(g => g.p1 && g.p2 && g.p1.username !== 'bye' && g.p2.username !== 'bye');
                if (adminGroupFilter !== 'ALL') {
                  gamesToShow = gamesToShow.filter(g => g.groupLabel === adminGroupFilter);
                }
                if (gamesToShow.length === 0) {
                  return <p className="text-sm text-gray-400 italic py-4">No matches in this selection.</p>;
                }
                return (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
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

            {/* Test cleanup  user requested */}
            <div className="border border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-4 sm:p-5 space-y-3">
              <p className="font-space font-black text-base text-blue-900">Test Data Cleanup</p>
              <p className="text-sm text-blue-700">Removes April &amp; May 2026 mock archives from local storage after testing.</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button onClick={clearMocks} className="w-full sm:w-auto min-h-[44px] text-sm font-bold bg-blue-600 text-white px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-500 transition-colors flex items-center justify-center">
                   Clear Mock History
                </button>
                <button onClick={() => { setIsAdmin(false); toast.info('Admin locked'); }} className="w-full sm:w-auto min-h-[44px] text-sm font-bold bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center">
                  Lock Panel
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ADMIN GENERATE R1 VIEW */}
        {activeTab === 'admin' && isAdmin && adminSubView === 'generate-r1' && (
          <div className="varsity-card p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-[#111111] transition-colors cursor-pointer shrink-0 rounded-full hover:bg-gray-100"
                aria-label="Back to Admin Panel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="font-space font-black text-xl sm:text-2xl text-[#111111]">Generate Round 1 Fixtures</h2>
                <p className="text-xs text-gray-400">Configure pairing parameters and verify seeding before bracket generation.</p>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Round Date</label>
                <input 
                  type="text" 
                  value={paramCustomDate}
                  onChange={(e) => setParamCustomDate(e.target.value)}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Target Elo Gap</label>
                <input 
                  type="number" 
                  value={paramTargetElo}
                  onChange={(e) => setParamTargetElo(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">School Protection Weight</label>
                <input 
                  type="number" 
                  value={paramSchoolPenalty}
                  onChange={(e) => setParamSchoolPenalty(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
            </div>

            {/* Seeded Players Section */}
            <div className="space-y-3">
              <h3 className="font-space font-black text-lg text-[#111111]">Seeding Preview</h3>
              {(() => {
                const { byes, active } = getSeededPlayersR1();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* BYEs */}
                    <div className="border border-blue-100 bg-blue-50/20 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100/50">
                        <span className="font-space font-black text-sm text-blue-900">BYE Seeding ({byes.length})</span>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">Auto-Advance</span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {byes.map(p => (
                          <div key={p.username} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-blue-100/50">
                            <div>
                              <p className="font-bold text-blue-950">{p.name}</p>
                              <p className="text-gray-400 text-[10px]">{p.school} &bull; @{p.username}</p>
                            </div>
                            <span className="font-black text-blue-700">{p.rating} ELO</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Matchups */}
                    <div className="border border-brand-primary/10 bg-brand-primary/5 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-brand-primary/10">
                        <span className="font-space font-black text-sm text-[#111111]">Active Matchups Seeding ({active.length})</span>
                        <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full uppercase">Round 1 Opponents</span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
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
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="w-full sm:w-auto px-5 py-3 min-h-[44px] border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-sm font-bold cursor-pointer transition-colors flex items-center justify-center"
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
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors flex items-center justify-center"
              >
                Generate Bracket
              </button>
            </div>
          </div>
        )}

        {/* ADMIN GENERATE NEXT VIEW */}
        {activeTab === 'admin' && isAdmin && adminSubView === 'generate-next' && (
          <div className="varsity-card p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-[#111111] transition-colors cursor-pointer shrink-0 rounded-full hover:bg-gray-100"
                aria-label="Back to Admin Panel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="font-space font-black text-xl sm:text-2xl text-[#111111]">Generate Next Round Fixtures</h2>
                <p className="text-xs text-gray-400">Configure pairing parameters and verify survivors before advancing.</p>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Round Date</label>
                <input 
                  type="text" 
                  value={paramCustomDate}
                  onChange={(e) => setParamCustomDate(e.target.value)}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Target Elo Gap</label>
                <input 
                  type="number" 
                  value={paramTargetElo}
                  onChange={(e) => setParamTargetElo(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider">School Protection Weight</label>
                <input 
                  type="number" 
                  value={paramSchoolPenalty}
                  onChange={(e) => setParamSchoolPenalty(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-[#111111]"
                />
              </div>
            </div>

            {/* Round Name Selection & Custom Entry Controls */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h4 className="font-space font-black text-sm text-[#111111]">Round Name Parameter</h4>
                  <p className="text-xs text-gray-400">Select an assumed next round from the dropdown or disable the dropdown to type a custom name.</p>
                </div>
                {/* Switch to disable dropdown & enable custom text input */}
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-xl min-h-[44px] shrink-0">
                  <span className="text-xs font-bold text-gray-600">Custom Mode</span>
                  <button
                    type="button"
                    onClick={() => setParamUseCustomRoundName(v => !v)}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      paramUseCustomRoundName ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                    title={paramUseCustomRoundName ? 'Enable dropdown mode' : 'Disable dropdown and enable custom text entry'}
                    role="switch"
                    aria-checked={paramUseCustomRoundName}
                  >
                    <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      paramUseCustomRoundName ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dropdown for assumed next round */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <span>Assumed Next Round Dropdown</span>
                    {!paramUseCustomRoundName && <span className="text-[10px] text-brand-primary font-bold">(Active)</span>}
                  </label>
                  <select
                    value={paramRoundName}
                    disabled={paramUseCustomRoundName}
                    onChange={(e) => setParamRoundName(e.target.value)}
                    className={`w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] border rounded-xl outline-none transition-all ${
                      !paramUseCustomRoundName
                        ? 'bg-white border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 text-[#111111] cursor-pointer'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {ASSUMED_NEXT_ROUNDS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Editable Text Field for Custom Round Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <span>Editable Custom Round Name Field</span>
                    {paramUseCustomRoundName && <span className="text-[10px] text-brand-primary font-bold">(Active)</span>}
                  </label>
                  <input
                    type="text"
                    value={paramRoundName}
                    disabled={!paramUseCustomRoundName}
                    onChange={(e) => setParamRoundName(e.target.value)}
                    placeholder="Enter custom round name..."
                    className={`w-full text-sm font-bold px-3.5 py-2.5 min-h-[44px] border rounded-xl outline-none transition-all ${
                      paramUseCustomRoundName
                        ? 'bg-white border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20 text-[#111111]'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Retrieve Next Players / Surviving Players Control Block */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-space font-black text-lg text-[#111111] flex items-center gap-2 flex-wrap">
                    <span>Retrieve Next Players</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {paramManualSelection ? `${selectedSurvivingUsernames.length} Manually Selected` : `${seededPlayersNext.length} Auto-Retrieved`}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {paramManualSelection 
                      ? 'Manual Selection Mode: Admin manually selects players who advance into the next round.'
                      : 'Auto-Retrieve Mode: System survival logic automatically determines qualifiers.'}
                  </p>
                </div>

                {/* Switch for Auto vs Manual Selection */}
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-xl shrink-0 min-h-[44px]">
                  <span className="text-xs font-bold text-gray-700">Manual Selection Mode</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!paramManualSelection) {
                        if (selectedSurvivingUsernames.length === 0) {
                          setSelectedSurvivingUsernames(seededPlayersNext.map(p => p.username));
                        }
                      }
                      setParamManualSelection(v => !v);
                    }}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      paramManualSelection ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                    title={paramManualSelection ? 'Switch to Auto-Retrieve Mode' : 'Switch to Manual Selection Mode'}
                    role="switch"
                    aria-checked={paramManualSelection}
                  >
                    <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      paramManualSelection ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Mode Content */}
              {!paramManualSelection ? (
                /* Auto-Retrieve View (Read Only Cards) */
                <div className="border border-brand-accent/10 bg-brand-accent/5 rounded-2xl p-4 sm:p-5 space-y-3">
                  {!survivalStatus.isComplete && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Completion Prerequisite Unmet: The previous round has <strong>{survivalStatus.pendingCount}</strong> pending match result(s). Please log all match outcomes before auto-generating <strong>{paramRoundName}</strong>.</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold text-gray-500">
                    <span>Auto-Retrieved Qualifiers ({seededPlayersNext.length} Players)</span>
                    
                    {/* Clickable System Survival Logic Badge & Tooltip */}
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setShowSurvivalLogicTooltip(v => !v)}
                        className="text-brand-primary text-[10px] uppercase font-black hover:underline cursor-pointer flex items-center gap-1 bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-2 min-h-[44px] rounded-full transition-colors border-none"
                        title="Click to view how players are retrieved"
                      >
                        <span>System Survival Logic</span>
                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {showSurvivalLogicTooltip && (
                        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#0B193C] text-white p-4 rounded-2xl shadow-2xl z-50 text-left border border-blue-400/30 text-xs animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                            <span className="font-space font-black text-xs text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                              <span>⚙ System Survival Logic</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowSurvivalLogicTooltip(false)}
                              className="text-gray-400 hover:text-white text-sm font-bold border-none bg-transparent cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-2 text-white/90 leading-relaxed text-[11px]">
                            <p className="font-bold text-white">How Players Are Retrieved:</p>
                            <ul className="list-disc list-inside space-y-1.5 text-white/80">
                              <li>
                                <strong className="text-blue-200">Group Stage (Rounds 1–3):</strong> Top 2 players from each group standings table (ranked by Points $\rightarrow$ Wins $\rightarrow$ Matches Played $\rightarrow$ Name) automatically advance.
                              </li>
                              <li>
                                <strong className="text-blue-200">Wild-Card Fill (Round of 32):</strong> If 30 players qualify from 15 groups, the top 2 best 3rd-place finishers across all groups are added to complete a 32-player bracket.
                              </li>
                              <li>
                                <strong className="text-blue-200">Knockout Stage:</strong> Match winners from the preceding single-elimination round automatically advance.
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {seededPlayersNext.map(p => (
                      <div key={p.username} className="flex justify-between items-center text-xs p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-[#111111] truncate">{p.name}</p>
                          <p className="text-gray-400 text-[10px] truncate">{p.school || p.department} &bull; @{p.username}</p>
                        </div>
                        <span className="font-black text-brand-accent shrink-0 text-right">{p.rating} ELO</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Manual Selection View: Group-Segmented Standings Tables */
                <div className="space-y-4">
                  {/* Controls Toolbar: Search & Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={manualPlayerSearch}
                          onChange={(e) => setManualPlayerSearch(e.target.value)}
                          placeholder="Search player name, school, or @username..."
                          className="w-full text-xs font-bold pl-9 pr-3 py-2.5 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-primary text-[#111111]"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Quick Action Toolbar Buttons */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSurvivingUsernames(seededPlayersNext.map(p => p.username));
                          }}
                          className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center"
                          title="Select system auto-retrieved qualifiers"
                        >
                          Reset to Auto
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const top2Usernames = [];
                            manualGroupsData.forEach(grp => {
                              (grp.standings || []).slice(0, 2).forEach(p => {
                                if (p.username) top2Usernames.push(p.username);
                              });
                            });
                            setSelectedSurvivingUsernames(top2Usernames);
                          }}
                          className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200/60 flex items-center justify-center text-center"
                          title="Select Top 2 ranked players from each group"
                        >
                          Select Top 2
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const allUsers = allTournamentPlayers.map(p => p.username);
                            setSelectedSurvivingUsernames(allUsers);
                          }}
                          className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center"
                        >
                          Select All
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSurvivingUsernames([])}
                          className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Group Filter Chips Bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedManualGroupFilter('ALL')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
                          selectedManualGroupFilter === 'ALL'
                            ? 'bg-[#0B193C] text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All Groups ({manualGroupsData.length})
                      </button>
                      {manualGroupsData.map(grp => (
                        <button
                          key={grp.label}
                          type="button"
                          onClick={() => setSelectedManualGroupFilter(grp.label)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
                            selectedManualGroupFilter === grp.label
                              ? 'bg-brand-primary text-white shadow-2xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Group {grp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group-Segmented Selectable Tables Container */}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {(() => {
                      const query = manualPlayerSearch.trim().toLowerCase();

                      // Filter groups based on selectedGroupFilter
                      const filteredGroups = manualGroupsData.filter(grp => 
                        selectedManualGroupFilter === 'ALL' || grp.label === selectedManualGroupFilter
                      );

                      let totalMatchingPlayers = 0;

                      const renderedGroupCards = filteredGroups.map(grp => {
                        const standings = grp.standings || [];
                        const groupFilteredPlayers = query
                          ? standings.filter(p => 
                              (p.name || '').toLowerCase().includes(query) || 
                              (p.username || '').toLowerCase().includes(query) || 
                              (p.school || '').toLowerCase().includes(query)
                            )
                          : standings;

                        if (groupFilteredPlayers.length === 0) return null;

                        totalMatchingPlayers += groupFilteredPlayers.length;

                        const selectedInGroupCount = groupFilteredPlayers.filter(p => 
                          selectedSurvivingUsernames.includes(p.username)
                        ).length;

                        const allSelectedInGroup = selectedInGroupCount === groupFilteredPlayers.length && groupFilteredPlayers.length > 0;

                        return (
                          <div key={grp.label} className="border border-gray-200/90 bg-white rounded-2xl overflow-hidden shadow-2xs">
                            {/* Group Card Header */}
                            <div className="bg-gray-50/80 px-3.5 py-3 border-b border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-6 h-6 rounded-lg bg-[#0B193C] text-white font-black text-xs flex items-center justify-center">
                                  {grp.label}
                                </span>
                                <h4 className="font-space font-black text-sm text-[#111111]">
                                  Group {grp.label} Standings
                                </h4>
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded-full">
                                  {selectedInGroupCount} of {groupFilteredPlayers.length} Selected
                                </span>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const top2Usernames = standings.slice(0, 2).map(p => p.username).filter(Boolean);
                                    setSelectedSurvivingUsernames(prev => Array.from(new Set([...prev, ...top2Usernames])));
                                  }}
                                  className="flex-1 sm:flex-initial min-h-[44px] text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-200/60 cursor-pointer flex items-center justify-center"
                                >
                                  + Select Top 2
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const groupUsernames = groupFilteredPlayers.map(p => p.username).filter(Boolean);
                                    if (allSelectedInGroup) {
                                      setSelectedSurvivingUsernames(prev => prev.filter(u => !groupUsernames.includes(u)));
                                    } else {
                                      setSelectedSurvivingUsernames(prev => Array.from(new Set([...prev, ...groupUsernames])));
                                    }
                                  }}
                                  className="flex-1 sm:flex-initial min-h-[44px] text-[11px] font-bold text-gray-600 bg-white hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200 cursor-pointer flex items-center justify-center"
                                >
                                  {allSelectedInGroup ? 'Deselect Group' : 'Select Group'}
                                </button>
                              </div>
                            </div>

                            {/* Group Standings Table */}
                            <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-gray-100/60 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200/60">
                                    <th className="py-2.5 px-3.5 w-10 text-center">Sel</th>
                                    <th className="py-2.5 px-2 w-10 text-center">#</th>
                                    <th className="py-2.5 px-3">Player</th>
                                    <th className="py-2.5 px-2 text-right">Rating</th>
                                    <th className="py-2.5 px-2 text-center" title="Matches Played">MP</th>
                                    <th className="py-2.5 px-2 text-center" title="Wins">W</th>
                                    <th className="py-2.5 px-2 text-center" title="Draws">D</th>
                                    <th className="py-2.5 px-2 text-center" title="Losses">L</th>
                                    <th className="py-2.5 px-3 text-right font-black text-[#111111]">PTS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {groupFilteredPlayers.map((p, idx) => {
                                    const isSelected = selectedSurvivingUsernames.includes(p.username);
                                    const rank = idx + 1;
                                    const isTop2 = rank <= 2;

                                    return (
                                      <tr
                                        key={p.username || idx}
                                        onClick={() => {
                                          if (isSelected) {
                                            setSelectedSurvivingUsernames(prev => prev.filter(u => u !== p.username));
                                          } else {
                                            setSelectedSurvivingUsernames(prev => [...prev, p.username]);
                                          }
                                        }}
                                        className={`transition-colors cursor-pointer select-none ${
                                          isSelected
                                            ? 'bg-emerald-50/70 hover:bg-emerald-100/70 font-semibold'
                                            : 'hover:bg-gray-50/90'
                                        }`}
                                      >
                                        {/* Selection Checkbox */}
                                        <td className="py-3 px-3.5 text-center">
                                          <div className={`w-5 h-5 rounded mx-auto flex items-center justify-center text-xs font-black transition-all ${
                                            isSelected 
                                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30' 
                                              : 'border border-gray-300 text-transparent bg-white'
                                          }`}>
                                            ✓
                                          </div>
                                        </td>

                                        {/* Rank */}
                                        <td className="py-3 px-2 text-center font-black">
                                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] ${
                                            isTop2 
                                              ? 'bg-emerald-100 text-emerald-800 font-black' 
                                              : 'text-gray-400'
                                          }`}>
                                            {rank}
                                          </span>
                                        </td>

                                        {/* Player Details */}
                                        <td className="py-3 px-3">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-[#111111] truncate">{p.name}</span>
                                                {isTop2 && (
                                                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded-full shrink-0">
                                                    Top 2 Qualifier
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[10px] text-gray-400 truncate">
                                                {p.school || p.department || 'Player'} &bull; @{p.username}
                                              </p>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="py-3 px-2 text-right font-black text-brand-primary text-[11px]">
                                          {p.rating || 1200}
                                        </td>

                                        {/* MP, W, D, L */}
                                        <td className="py-3 px-2 text-center text-gray-500">{p.P || 0}</td>
                                        <td className="py-3 px-2 text-center text-emerald-600 font-bold">{p.W || 0}</td>
                                        <td className="py-3 px-2 text-center text-amber-600 font-bold">{p.D || 0}</td>
                                        <td className="py-3 px-2 text-center text-rose-500 font-bold">{p.L || 0}</td>

                                        {/* PTS */}
                                        <td className="py-3 px-3 text-right font-black text-sm text-[#111111]">
                                          {p.Pts !== undefined ? p.Pts : (p.pts !== undefined ? p.pts : 0)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      });

                      if (totalMatchingPlayers === 0) {
                        return (
                          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                            <p className="text-xs font-bold text-gray-500">No players match "{manualPlayerSearch}"</p>
                            <button
                              type="button"
                              onClick={() => setManualPlayerSearch('')}
                              className="mt-2 text-xs text-brand-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Clear Search
                            </button>
                          </div>
                        );
                      }

                      return renderedGroupCards;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setAdminSubView('main')}
                className="w-full sm:w-auto px-5 py-3 min-h-[44px] border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-sm font-bold cursor-pointer transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (paramManualSelection) {
                    if (selectedSurvivingUsernames.length < 2) {
                      toast.error('Please select at least 2 players for manual round generation.');
                      return;
                    }
                    if (selectedSurvivingUsernames.length % 2 !== 0) {
                      toast.info(`Note: You selected ${selectedSurvivingUsernames.length} players (odd count). The un-paired player will be assigned a Bye.`);
                    }
                  } else if (!survivalStatus.isComplete) {
                    toast.error(`Cannot generate ${paramRoundName}: Previous round has ${survivalStatus.pendingCount} pending match result(s). Log all results first.`);
                    return;
                  }

                  const manualSelectedObjs = paramManualSelection
                    ? allTournamentPlayers.filter(p => 
                        p.username && selectedSurvivingUsernames.map(u => u.toLowerCase()).includes(p.username.toLowerCase())
                      )
                    : null;

                  advanceRound({
                    targetEloGap: paramTargetElo,
                    schoolPenalty: paramSchoolPenalty,
                    customDate: paramCustomDate,
                    roundName: paramRoundName,
                    tournament: tournament,
                    selectedPlayers: manualSelectedObjs
                  });
                  setAdminSubView('main');
                  toast.success(`Next round (${paramRoundName}) fixtures generated successfully!`);
                }}
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors flex items-center justify-center"
              >
                Generate Next Round
              </button>
            </div>
          </div>
        )}
          </div>
        </>
      )}

      {/* Past Champions Modal */}
      {showPastWinnersModal && (
        <div 
          className="fixed inset-0 bg-[#070B19]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200" 
          onClick={() => setShowPastWinnersModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-gray-200 relative max-h-[85vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-brand-primary uppercase">
                    SS4 League Hall of Fame
                  </p>
                  <h3 className="font-space font-black text-xl sm:text-2xl text-[#111111] leading-tight">
                    Past Champions
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowPastWinnersModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Close Modal"
              >
                <span className="material-symbols-outlined text-[20px] select-none">close</span>
              </button>
            </div>

            {/* Champions Cards List */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              {history.filter(h => h.status === 'completed').length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="material-symbols-outlined text-[32px] text-gray-400 select-none mb-2">
                    military_tech
                  </span>
                  <p className="text-sm font-bold text-gray-500">No completed tournament champions recorded yet.</p>
                </div>
              ) : (
                <>
                  {/* Peak-End Rule: All-Time Legend Spotlight */}
                  {(() => {
                    const completed = history.filter(h => h.status === 'completed');
                    if (completed.length === 0) return null;
                    const latestStats = getChampionScopedStats(completed[0]);
                    if (!latestStats) return null;

                    return (
                      <div className="bg-gradient-to-br from-[#0B193C] via-[#1A56C4] to-[#0C1E54] text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg">
                            Reigning Champion
                          </span>
                          <span className="text-xs font-bold text-white/70">
                            {completed[0].month_year} Title Holder
                          </span>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          {/* Circular Avatar Frame */}
                          <div className="w-14 h-14 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-800 shrink-0 shadow-md">
                            <ChampionAvatarImg
                              playerObj={latestStats.playerObj}
                              winnerName={latestStats.winnerName}
                              winnerUsername={latestStats.winnerUsername}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-space text-lg font-black text-white truncate">
                              {latestStats.winnerName}
                            </h4>
                            <p className="text-xs text-white/80 font-medium mt-0.5">
                              {latestStats.school} &bull; {latestStats.rating} ELO
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedPlayerForModal(latestStats.playerObj)}
                            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-space font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chronological Champions List */}
                  {history.filter(h => h.status === 'completed').map(h => {
                    const championStats = getChampionScopedStats(h);
                    const isExpanded = expandedHistoryId === h.month_year;

                    return (
                      <div 
                        key={h.month_year} 
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-brand-primary/30 transition-all space-y-4"
                      >
                        {/* Header Row: Month Tag & Cycle Link */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg">
                              {h.month_year} Cycle
                            </span>
                            <span className="text-xs font-bold text-gray-600 truncate">
                              {h.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedMonthYear(h.month_year);
                              setShowPastWinnersModal(false);
                            }}
                            className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            Inspect Cycle
                            <span className="material-symbols-outlined text-[14px] select-none">open_in_new</span>
                          </button>
                        </div>

                        {/* Champion Main Identity Row */}
                        {championStats && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              {/* Champion Avatar & Name (Circular Frame) */}
                              <div 
                                onClick={() => setSelectedPlayerForModal(championStats.playerObj)}
                                className="flex items-center gap-3.5 cursor-pointer group min-w-0"
                              >
                                <div className="w-14 h-14 rounded-full border-2 border-brand-primary/30 overflow-hidden bg-slate-100 shrink-0 shadow-xs group-hover:border-brand-primary transition-all">
                                  <ChampionAvatarImg 
                                    playerObj={championStats.playerObj}
                                    winnerName={championStats.winnerName}
                                    winnerUsername={championStats.winnerUsername}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-space text-base sm:text-lg font-black text-[#111111] group-hover:text-brand-primary transition-colors truncate">
                                      {championStats.winnerName}
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                                      {championStats.school}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                    @{championStats.winnerUsername}
                                  </p>
                                </div>
                              </div>

                              {/* ELO Rating Badge */}
                              <div className="bg-brand-primary/5 border border-brand-primary/15 px-3 py-1.5 rounded-xl text-right shrink-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Rating</p>
                                <p className="text-sm font-black text-brand-primary font-space">
                                  {championStats.rating} ELO
                                </p>
                              </div>
                            </div>

                            {/* Defeated Runner-Up Hyperlink Line */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap font-medium text-gray-600">
                                <span className="material-symbols-outlined text-[16px] text-emerald-600 select-none">
                                  military_tech
                                </span>
                                <span>Defeated</span>
                                <button
                                  onClick={() => setSelectedPlayerForModal(championStats.runnerUpObj)}
                                  className="font-black text-brand-primary underline hover:text-brand-primary/80 transition-colors cursor-pointer"
                                >
                                  {championStats.runnerUpName} (@{championStats.runnerUpUsername})
                                </button>
                                <span>in the Grand Final</span>
                              </div>
                              <button
                                onClick={() => handleTogglePathway(h.month_year, h)}
                                className="text-[11px] font-bold text-gray-500 hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                {isExpanded ? 'Hide Path' : 'Pathway'}
                                {loadingPathwayId === h.month_year ? (
                                  <svg className="animate-spin h-3 w-3 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Expandable Championship Match Pathway Drawer */}
                            {isExpanded && (
                              <div className="p-3.5 bg-brand-primary/5 border border-brand-primary/15 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-primary">
                                    Path to Glory ({h.month_year} Cycle)
                                  </p>
                                  {loadingPathwayId === h.month_year && (
                                    <span className="text-[10px] font-bold text-brand-primary flex items-center gap-1">
                                      <svg className="animate-spin h-3 w-3 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Fetching database records...
                                    </span>
                                  )}
                                </div>

                                {loadingPathwayId === h.month_year ? (
                                  <div className="py-4 flex flex-col items-center justify-center gap-2 text-gray-500">
                                    <svg className="animate-spin h-6 w-6 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs font-bold text-brand-primary">Loading pathway match details...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 text-gray-700 font-medium">
                                    {(() => {
                                      const itemToUse = fetchedPathways[h.month_year] || h;
                                      const pathwayMatches = getChampionPathwayMatches(itemToUse, championStats.winnerUsername, championStats.winnerName);
                                      if (pathwayMatches.length === 0) {
                                        return (
                                          <p className="text-xs text-gray-500 italic py-1">
                                            Match round details not recorded for this historical cycle.
                                          </p>
                                        );
                                      }
                                      return pathwayMatches.map((m, mIdx) => (
                                        <div key={mIdx} className="flex justify-between py-1 border-b border-gray-200/60 last:border-0">
                                          <span>{m.roundTitle}:</span>
                                          <span className={`font-bold ${m.isWinner ? 'text-emerald-700' : 'text-gray-600'}`}>
                                            {m.scoreText}
                                          </span>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tournament Record Clean Metadata Bar */}
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 px-1 pt-1">
                              <span className="text-gray-500 font-medium">{championStats.totalGames} Matches</span>

                              {/* Visual Record Indicators: + (Green), - (Red), ½ (Gray) */}
                              <div className="flex items-center gap-1.5">
                                {/* Wins: Green + */}
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black" title="Wins">
                                  <span className="material-symbols-outlined text-[13px] select-none">add</span>
                                  {championStats.wins}
                                </span>

                                {/* Losses: Red - */}
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black" title="Losses">
                                  <span className="material-symbols-outlined text-[13px] select-none">remove</span>
                                  {championStats.losses}
                                </span>

                                {/* Draws: Gray 1/2 */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 text-xs font-black" title="Draws">
                                  <span className="text-[11px] leading-none font-black font-mono">½</span>
                                  {championStats.draws}
                                </span>
                              </div>

                              <span className="text-emerald-600 font-black">{championStats.winRate}% Win Rate</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-[#111111]/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowRulesModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6 text-brand-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                <h3 className="font-space font-black text-2xl text-[#111111]">SCL Tournament Rules</h3>
              </div>
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
              <Button 
                onClick={() => setShowRulesModal(false)}
                variant="primary"
                className="w-full"
              >
                I Understand
              </Button>
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
              <Button onClick={() => setPinModal(false)} variant="secondary" size="sm" className="flex-1 text-gray-500 border-gray-200 hover:bg-gray-50">Cancel</Button>
              <Button onClick={submitPin} variant="primary" size="sm" className="flex-1">Unlock</Button>
            </div>
          </div>
        </div>
      )}

      {/* Player details modal */}
      {selectedPlayerForModal && (
        <TournamentPlayerModal 
          player={selectedPlayerForModal} 
          onClose={() => setSelectedPlayerForModal(null)} 
        />
      )}

      {/* Missing Chess.com Username Prompt Modal */}
      {showUsernamePromptModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-150 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-brand-text-dark font-space uppercase tracking-wider mb-2">Chess.com Username Required</h3>
            <p className="text-xs text-gray-500 font-semibold mb-4 leading-relaxed">
              To complete your registration, you must link a valid Chess.com handle. We will fetch your current rating to place you in the correct SCL Division.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Chess.com Username</label>
                <Input
                  placeholder="e.g. MagnusCarlsen"
                  value={promptUsername}
                  onChange={e => {
                    setPromptUsername(e.target.value);
                    setPromptError('');
                  }}
                />
                {promptError && <p className="text-[10px] font-bold text-brand-accent mt-1">{promptError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowUsernamePromptModal(false)}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyAndJoin}
                  disabled={verifyingPromptUsername}
                  className="flex-1 bg-brand-primary hover:bg-brand-accent text-white text-xs font-bold cursor-pointer"
                >
                  {verifyingPromptUsername ? 'Verifying...' : 'Verify & Register'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
