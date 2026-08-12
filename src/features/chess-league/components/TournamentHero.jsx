import { useState, useEffect, useMemo } from 'react';
import { getCountdownTarget } from '../utils/tournament';
import { fetchCompletePlayerData } from '../utils/chessService';

function pad(n) { return String(n).padStart(2, '0'); }

function CountdownCell({ value, label, isPulse = false }) {
  return (
    <div className="flex flex-col items-center min-w-[48px] sm:min-w-[56px] flex-1 sm:flex-initial">
      <div className={`bg-white/15 border border-white/20 text-white font-space font-black text-xl sm:text-2xl md:text-3xl w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-sm ${isPulse ? 'animate-pulse text-brand-accent-on-dark' : ''}`}>
        {pad(value)}
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1 sm:mt-1.5">{label}</span>
    </div>
  );
}

export function TournamentHero({ tournament, selectedMonthYear, history, onMonthChange, onTitleDoubleClick }) {
  const [{ days, hours, mins, secs, label }, setClock] = useState({ days: 0, hours: 0, mins: 0, secs: 0, label: '' });
  const [winnerAvatar, setWinnerAvatar] = useState(null);

  // Detect timezone abbreviation (e.g. WAT, BST, EST)
  const tzAbbr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
    } catch { return ''; }
  }, []);

  const formattedTargetTime = useMemo(() => {
    try {
      const { date } = getCountdownTarget(tournament);
      const options = { hour: '2-digit', minute: '2-digit', hour12: false };
      return `${date.toLocaleTimeString('en', options)} ${tzAbbr}`;
    } catch {
      return `18:00 ${tzAbbr}`;
    }
  }, [tournament, tzAbbr]);

  useEffect(() => {
    const tick = () => {
      const { date, label } = getCountdownTarget(tournament);
      const diff = Math.max(0, date - new Date());
      setClock({
        days:  Math.floor(diff / 864e5),
        hours: Math.floor(diff / 36e5) % 24,
        mins:  Math.floor(diff / 6e4) % 60,
        secs:  Math.floor(diff / 1e3) % 60,
        label
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tournament]);

  const status = tournament?.status ?? 'upcoming';

  const winnerObj = useMemo(() => {
    if (!tournament?.winner) return null;
    return typeof tournament.winner === 'object'
      ? tournament.winner
      : { name: String(tournament.winner), username: String(tournament.winner) };
  }, [tournament]);

  const winnerName = winnerObj?.name || winnerObj?.username || 'Champion';

  // Load Champion profile picture / avatar cleanly
  useEffect(() => {
    if (status === 'completed' && winnerObj) {
      const directAvatar = winnerObj.avatar || winnerObj.image || winnerObj.photo || winnerObj.profilePic;
      if (directAvatar) {
        setWinnerAvatar(directAvatar);
      } else if (winnerObj.username) {
        let isMounted = true;
        fetchCompletePlayerData(winnerObj.username, 'lichess').then(data => {
          if (isMounted && data?.avatar) {
            setWinnerAvatar(data.avatar);
          } else {
            setWinnerAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(winnerName)}&background=1A56C4&color=fff&bold=true`);
          }
        }).catch(() => {
          if (isMounted) {
            setWinnerAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(winnerName)}&background=1A56C4&color=fff&bold=true`);
          }
        });
        return () => { isMounted = false; };
      } else {
        setWinnerAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(winnerName)}&background=1A56C4&color=fff&bold=true`);
      }
    }
  }, [status, winnerObj, winnerName]);

  return (
    <section
      className="relative text-white px-4 sm:px-6 md:px-12 lg:px-16 py-10 sm:py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0B193C 0%, #1A56C4 55%, #0C1E54 100%)' }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #0A2A6A 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Overline row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white/70 uppercase">SS4 Chess Network</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: title + timer */}
          <div>
            <h1
              onDoubleClick={onTitleDoubleClick}
              className="font-space font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] sm:leading-[1.05] mb-3 sm:mb-4 cursor-pointer select-none"
            >
              SCL Monthly<br />
              <span className="font-black text-brand-accent-on-dark">Tournament</span>
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-medium max-w-sm mb-6 sm:mb-8 leading-relaxed">
              Single elimination. Last 7 days of the month. One champion claims the prize.
            </p>

            {/* Countdown */}
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/50 uppercase mb-2 sm:mb-3">
              {label} &bull; <span className="text-white/40">{formattedTargetTime}</span>
            </p>
            <div className="flex gap-2 sm:gap-3 max-w-[280px] sm:max-w-none">
              <CountdownCell value={days}  label="Days" />
              <CountdownCell value={hours} label="Hrs" />
              <CountdownCell value={mins}  label="Min" />
              <CountdownCell value={secs}  label="Sec" isPulse={days === 0 && hours < 24} />
            </div>
          </div>

          {/* Right: prize card + cycle selector */}
          <div className="flex flex-col gap-3 sm:gap-4 mt-4 md:mt-0">
            {/* Champion or Prize Card */}
            {status === 'completed' ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 select-none">
                    emoji_events
                  </span>
                  <span>Crowned Champion</span>
                </p>
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Player Profile Picture (No pulsing placeholder) */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-emerald-400/80 overflow-hidden flex-shrink-0 bg-slate-900 shadow-md">
                    {winnerAvatar ? (
                      <img
                        src={winnerAvatar}
                        alt={winnerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(winnerName)}&background=1A56C4&color=fff&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-primary text-white font-black flex items-center justify-center text-lg uppercase">
                        {winnerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-space font-black text-base sm:text-lg leading-tight truncate">
                      {winnerName}
                    </p>
                    <p className="text-emerald-300 text-xs font-semibold mt-0.5">Tournament Winner</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-2.5 sm:mb-3">Grand Prize</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-white select-none">
                      workspace_premium
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-space font-black text-sm sm:text-base leading-tight">1 Month Chess.com</p>
                    <p className="text-white/50 text-[10px] sm:text-xs font-bold">Premium Subscription</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cycle selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
              <p className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">Cycle</p>
              <select
                value={selectedMonthYear}
                onChange={e => onMonthChange(e.target.value)}
                className="bg-transparent text-white font-bold text-sm sm:text-base flex-1 outline-none border-none cursor-pointer focus:ring-0 focus:outline-none"
              >
                {history.map(h => (
                  <option key={h.month_year} value={h.month_year} className="text-[#111111] bg-white">
                    {h.name}{h.status === 'active' ? ' (Live)' : h.status === 'completed' ? ' (Concluded)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
