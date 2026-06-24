import { useState, useEffect, useMemo } from 'react';
import { getCountdownTarget } from '../../utils/tournament';

function pad(n) { return String(n).padStart(2, '0'); }

function CountdownCell({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <div className="bg-white/15 border border-white/20 text-white font-space font-black text-2xl md:text-3xl w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center backdrop-blur-sm">
        {pad(value)}
      </div>
      <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1.5">{label}</span>
    </div>
  );
}

export function TournamentHero({ tournament, selectedMonthYear, history, onMonthChange, onTitleDoubleClick }) {
  const [{ days, hours, mins, secs, label }, setClock] = useState({ days: 0, hours: 0, mins: 0, secs: 0, label: '' });

  // Detect timezone abbreviation (e.g. WAT, BST, EST)
  const tzAbbr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
    } catch { return ''; }
  }, []);

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

  const statusColors = { upcoming: 'bg-amber-100 text-amber-700', active: 'bg-emerald-100 text-emerald-700', completed: 'bg-gray-100 text-gray-500' };
  const status = tournament?.status ?? 'upcoming';

  return (
    <section
      className="relative text-white px-6 md:px-12 lg:px-16 py-16 md:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A3A8F 0%, #1e3faa 35%, #c2410c 80%, #ea580c 100%)' }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-right orange bloom */}
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)' }} />
        {/* Bottom-left indigo bloom */}
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        {/* Center accent streak */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px opacity-10"
          style={{ background: 'linear-gradient(90deg, transparent, #fdba74, transparent)' }} />
      </div>
      <div className="max-w-5xl mx-auto">
        {/* Overline row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <p className="text-xs font-bold tracking-[0.25em] text-white/70 uppercase">SS4 Chess Network</p>
          <span className="text-white/30">·</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: title + timer */}
          <div>
            <h1
              onDoubleClick={onTitleDoubleClick}
              className="font-space font-black text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] mb-4 cursor-pointer select-none"
            >
              SCL Monthly<br />
              <span
                className="font-black"
                style={{ background: 'linear-gradient(90deg, #fdba74, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >Tournament</span>
            </h1>
            <p className="text-white/60 text-base font-medium max-w-sm mb-8 leading-relaxed">
              Single elimination. Last 7 days of the month. One champion claims the prize.
            </p>

            {/* Countdown */}
            <p className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase mb-3">
              {label} · <span className="text-white/40">18:00 {tzAbbr}</span>
            </p>
            <div className="flex gap-3">
              <CountdownCell value={days}  label="Days" />
              <CountdownCell value={hours} label="Hrs" />
              <CountdownCell value={mins}  label="Min" />
              <CountdownCell value={secs}  label="Sec" />
            </div>
          </div>

          {/* Right: prize card + cycle selector */}
          <div className="flex flex-col gap-4">
            {/* Prize */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-3">Grand Prize</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.872M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-space font-black text-base leading-tight">1 Month Chess.com</p>
                  <p className="text-white/50 text-xs font-bold">Premium Subscription</p>
                </div>
              </div>
            </div>

            {/* Cycle selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">Cycle</p>
              <select
                value={selectedMonthYear}
                onChange={e => onMonthChange(e.target.value)}
                disabled
                className="bg-transparent text-white font-bold text-base flex-1 outline-none border-none opacity-70 cursor-not-allowed"
              >
                {history.filter(h => h.month_year !== '2026-04').map(h => (
                  <option key={h.month_year} value={h.month_year} className="text-[#111111] bg-white">
                    {h.name}{h.status === 'active' ? ' (Live)' : ''}
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
