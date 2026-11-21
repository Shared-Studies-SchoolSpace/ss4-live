import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../features/auth-portal/hooks/useAuth';
import {
  fetchVarsityEvents,
  addOrUpdateMatchDay,
  removeMatchDay,
  extractTournamentId,
} from '../features/chess-league/services/varsityMatchService';

const ADMIN_PIN = '1926';

export default function VarsityAdminPage() {
  const { profile } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [matchDay, setMatchDay] = useState(3);
  const [dayNumber, setDayNumber] = useState(21);
  const [weekday, setWeekday] = useState('Sat');
  const [dateStr, setDateStr] = useState('Sat, 21 Nov');
  const [timeRange, setTimeRange] = useState('8:00–9:00 PM');
  const [timeControl, setTimeControl] = useState('3+0 Blitz');
  const [linkInput, setLinkInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  // Lichess metadata inspection
  const [inspecting, setInspecting] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      setIsUnlocked(true);
    }
  }, [profile?.role]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchVarsityEvents();
      if (isMounted) {
        setEvents(data);
        const nextDayNumber = data.length > 0 ? Math.max(...data.map((e) => e.matchDay)) + 1 : 3;
        setMatchDay(nextDayNumber);
        const nextCalendarDay = data.length > 0 ? Math.max(...data.map((e) => e.day)) + 1 : 21;
        setDayNumber(nextCalendarDay);
        setTitleInput(`SCL Varsity Games · Matchday ${nextDayNumber}`);
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsUnlocked(true);
      setPinError('');
      toast.success('Admin access granted!');
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleInspectLichess = async () => {
    const tourId = extractTournamentId(linkInput);
    if (!tourId) {
      toast.error('Please enter a valid Lichess tournament link or arena ID.');
      return;
    }

    setInspecting(true);
    setInspectedInfo(null);
    try {
      const res = await fetch(`https://lichess.org/api/tournament/${tourId}`);
      if (!res.ok) {
        throw new Error(`Lichess API returned ${res.status}`);
      }
      const data = await res.json();
      setInspectedInfo(data);
      if (data.fullName && !titleInput) {
        setTitleInput(data.fullName);
      }
      if (data.clock) {
        const mins = data.clock.limit / 60;
        setTimeControl(`${mins}+${data.clock.increment} Blitz`);
      }
      toast.success(`Verified: "${data.fullName || data.id}"`);
    } catch (err) {
      toast.warn(`Could not auto-verify on Lichess (${err.message}). You can still save manually.`);
    } finally {
      setInspecting(false);
    }
  };

  const handleSaveMatchDay = async (e) => {
    e.preventDefault();
    const tourId = extractTournamentId(linkInput);
    if (!tourId) {
      toast.error('Please provide a Lichess tournament link or ID.');
      return;
    }

    setSaving(true);
    try {
      const startISO = `2026-11-${String(dayNumber).padStart(2, '0')}T20:00:00+01:00`;
      const endISO = `2026-11-${String(dayNumber).padStart(2, '0')}T21:00:00+01:00`;

      const payload = {
        matchDay: parseInt(matchDay, 10),
        day: parseInt(dayNumber, 10),
        weekday,
        dateStr,
        timeRange,
        timeControl,
        link: linkInput.trim().startsWith('http') ? linkInput.trim() : `https://lichess.org/tournament/${tourId}`,
        id: tourId,
        title: titleInput.trim() || `SCL Varsity Games · Matchday ${matchDay}`,
        description: descriptionInput.trim() || `League Match ${matchDay} on Lichess (${dateStr} · ${timeRange} · ${timeControl}).`,
        startTime: startISO,
        endTime: endISO,
      };

      const updated = await addOrUpdateMatchDay(payload);
      setEvents(updated);
      toast.success(`Matchday ${matchDay} published successfully! It now reflects on the Varsity Hub.`);

      // Reset for subsequent additions
      const nextMatchDay = payload.matchDay + 1;
      setMatchDay(nextMatchDay);
      setDayNumber(payload.day + 1);
      setTitleInput(`SCL Varsity Games · Matchday ${nextMatchDay}`);
      setLinkInput('');
      setDescriptionInput('');
      setInspectedInfo(null);
    } catch (err) {
      toast.error(`Error saving matchday: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mDay) => {
    if (!window.confirm(`Are you sure you want to remove Match Day ${mDay}?`)) return;
    try {
      const updated = await removeMatchDay(mDay);
      setEvents(updated);
      toast.success(`Match Day ${mDay} removed.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-brand-text-dark font-sans py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/chess-league/varsity" className="text-brand-primary hover:underline">
              &larr; Return to Varsity Hub
            </Link>
            <span>/</span>
            <span className="text-slate-700">Match Day Administration</span>
          </div>
          <Link
            to="/chess-league/varsity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-primary hover:underline"
          >
            <span>View Live Hub</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8EFFF] text-[#00194B] text-[10px] font-space font-extrabold uppercase tracking-wider mb-2">
              <span>Varsity Season 2 Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-space text-brand-text-dark">
              Upload Next Match Day Link
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Add or update official Lichess tournament links for upcoming match days. Changes reflect immediately across the Varsity Hub and Navbar.
            </p>
          </div>
          <span className="w-12 h-12 rounded-2xl bg-[#E8EFFF] text-brand-primary flex items-center justify-center text-xl shrink-0">
            ♟
          </span>
        </div>

        {/* PIN Unlock Guard */}
        {!isUnlocked ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.05)] max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mx-auto">
              🔒
            </div>
            <h2 className="text-lg font-black font-space">Admin Authentication Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the admin PIN or sign in with an admin account to manage tournament match days.
            </p>
            <form onSubmit={handleUnlock} className="space-y-3 pt-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin PIN"
                maxLength={8}
                className="w-full text-center tracking-widest text-base font-mono font-bold px-4 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text-dark"
                autoFocus
              />
              {pinError && <p className="text-xs font-bold text-red-600">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Unlock Management Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="space-y-6">
            {/* Active / Confirmed Days Grid */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.05)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black font-space">Confirmed Match Days ({events.length})</h2>
                  <p className="text-xs text-slate-500 font-medium">Currently visible on the platform calendar strip.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  {loading ? 'Refreshing...' : 'Cloud Synced'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {events.map((ev) => (
                  <div
                    key={ev.key || ev.id}
                    className="p-4 rounded-2xl bg-[#F6F4F0] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#E8EFFF] text-[#00194B] text-[10px] font-space font-extrabold uppercase">
                          {ev.shortTitle}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 font-space">
                          Nov {ev.day} &bull; {ev.timeRange}
                        </span>
                      </div>
                      <h3 className="text-sm font-black font-space text-brand-text-dark">{ev.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{ev.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>{ev.id}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {ev.matchDay > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(ev.matchDay)}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Delete Day
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add / Upload Form */}
            <form onSubmit={handleSaveMatchDay} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.05)] space-y-5">
              <div>
                <h2 className="text-lg font-black font-space">Upload Next Match Day Link</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter the details for Match Day {matchDay} to immediately display it in the hub and live broadcaster.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Match Day Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={matchDay}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setMatchDay(val);
                      setTitleInput(`SCL Varsity Games · Matchday ${val}`);
                    }}
                    required
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Calendar Day (Nov)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={30}
                    value={dayNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 18;
                      setDayNumber(val);
                      const dt = new Date(2026, 10, val);
                      const wk = dt.toLocaleDateString('en-US', { weekday: 'short' });
                      setWeekday(wk);
                      setDateStr(`${wk}, ${val} Nov`);
                    }}
                    required
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Time Control
                  </label>
                  <input
                    type="text"
                    value={timeControl}
                    onChange={(e) => setTimeControl(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    required
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Lichess Tournament URL or ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://lichess.org/tournament/CnYWk8AG"
                    required
                    className="flex-1 text-xs font-medium px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text-dark"
                  />
                  <button
                    type="button"
                    onClick={handleInspectLichess}
                    disabled={inspecting}
                    className="px-4 py-2.5 rounded-xl bg-[#E8EFFF] hover:bg-[#dbeafe] text-[#00194B] font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {inspecting ? 'Verifying...' : 'Verify Lichess'}
                  </button>
                </div>
                {inspectedInfo && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center justify-between">
                    <span>Verified: {inspectedInfo.fullName} ({inspectedInfo.nbPlayers || 0} players registered)</span>
                    <span className="font-bold uppercase text-[10px]">{inspectedInfo.system || 'Arena'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-space font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Description / Announcement Note
                </label>
                <textarea
                  rows={2}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="e.g. League Match 3 on Lichess. 15 Institutions battle across 5 boards."
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  {saving ? 'Publishing...' : `Publish Match Day ${matchDay} to Hub`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
