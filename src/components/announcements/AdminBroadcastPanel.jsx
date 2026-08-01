import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../features/auth-portal/hooks/useAuth';
import Button from '../Button';
import Input from '../Input';
import { toast } from 'react-toastify';

export default function AdminBroadcastPanel({ onClose }) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' | 'specific'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [broadcastMode, setBroadcastMode] = useState('announcement_and_notif'); // 'announcement_and_notif' | 'notif_only'
  const [notifType, setNotifType] = useState('announcement');
  const [customLink, setCustomLink] = useState('/news');
  const [profiles, setProfiles] = useState([]);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'global' | 'targeted'
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const sanitizeLink = (rawLink) => {
    const trimmed = (rawLink || '').trim();
    if (!trimmed) return '/news';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  // Load user profiles for targeted broadcast
  useEffect(() => {
    if (!user) return;
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .order('name', { ascending: true });
        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error('Error loading profiles for broadcast panel:', err);
        toast.error('Could not load player profiles for targeted broadcast.');
      }
    };
    fetchProfiles();
  }, [user]);

  // Load recent announcements/broadcasts history
  const fetchRecentBroadcasts = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setRecentBroadcasts(data || []);
    } catch (err) {
      console.error('Error fetching recent broadcasts:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecentBroadcasts();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    if (profile?.role !== 'admin') {
      toast.error('Only administrators can broadcast announcements.');
      return;
    }

    if (targetType === 'specific' && !selectedUserId) {
      toast.error('Please select a specific recipient player.');
      return;
    }

    setLoading(true);

    try {
      const sanitizedLink = sanitizeLink(customLink);

      // 1. Post to announcements table if mode includes announcement
      if (broadcastMode === 'announcement_and_notif') {
        const { error: annErr } = await supabase
          .from('announcements')
          .insert({
            title: title.trim(),
            content: content.trim(),
            created_by: user.id,
            author_id: user.id,
            is_global: targetType === 'all'
          });

        if (annErr) throw annErr;
      }

      // 2. Dispatch targeted/broadcast notifications table
      let targetUserIds = [];
      if (targetType === 'all') {
        const { data: allProfs, error: profErr } = await supabase.from('profiles').select('id');
        if (profErr) throw profErr;
        targetUserIds = (allProfs || []).map(p => p.id);
      } else {
        targetUserIds = [selectedUserId];
      }

      if (targetUserIds.length > 0) {
        const notifs = targetUserIds.map(uid => ({
          user_id: uid,
          type: notifType,
          title: title.trim(),
          message: content.trim(),
          link: sanitizedLink
        }));

        // Batch insert in chunks of 100
        const batchSize = 100;
        for (let i = 0; i < notifs.length; i += batchSize) {
          const { error: notifBatchErr } = await supabase.from('notifications').insert(notifs.slice(i, i + batchSize));
          if (notifBatchErr) throw notifBatchErr;
        }
      }

      toast.success(
        targetType === 'all'
          ? `Broadcast sent successfully to all ${targetUserIds.length} players!`
          : `Targeted notification sent to recipient!`
      );

      setTitle('');
      setContent('');
      fetchRecentBroadcasts();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Unable to send broadcast. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = recentBroadcasts.filter((b) => {
    if (historyFilter === 'global') return b.is_global;
    if (historyFilter === 'targeted') return !b.is_global;
    return true;
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-5 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-brand-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.684A1.761 1.761 0 013 12c0-.68.384-1.272.954-1.564l4.63-2.316m9.852.196L21 6.5" />
            </svg>
            <h3 className="text-xs sm:text-sm font-black text-brand-text-dark font-space uppercase tracking-wider truncate">
              Universal Admin Broadcast
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-snug">
            Post global announcements and dispatch targeted or broadcast notifications to players.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            aria-label="Close panel"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleBroadcast} className="space-y-4 text-left">
        
        {/* Audience Target Option Controls (Collapses to 1-column on <640px) */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Audience Target
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('all')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                targetType === 'all'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V8.082M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All Players (Global)</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('specific')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                targetType === 'specific'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Specific Player</span>
            </button>
          </div>
        </div>

        {/* Dispatch Action Option Controls (Collapses to 1-column on <640px) */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Dispatch Action
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBroadcastMode('announcement_and_notif')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                broadcastMode === 'announcement_and_notif'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              <span>Announcement + Notif</span>
            </button>
            <button
              type="button"
              onClick={() => setBroadcastMode('notif_only')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                broadcastMode === 'notif_only'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Direct Notification Only</span>
            </button>
          </div>
        </div>

        {/* Specific Player Select dropdown if targeted */}
        {targetType === 'specific' && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Select Recipient Player
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-xs font-semibold shadow-xs"
            >
              <option value="">-- Choose Player --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email}) {p.role === 'admin' ? '[Admin]' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notification Category & Action Link (Collapses to 1-column on <640px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Notification Category
            </label>
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-xs font-semibold shadow-xs"
            >
              <option value="announcement">Announcement</option>
              <option value="admin_alert">Admin Alert</option>
              <option value="opponent_assigned">Opponent / Match</option>
              <option value="rating_update">Rating Update</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Action Link / Destination
            </label>
            <Input
              placeholder="/news or /chess-league or /dashboard"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              className="text-xs min-h-[44px] py-2.5 px-3.5 rounded-xl border-gray-300 shadow-xs"
            />
          </div>
        </div>

        {/* Announcement Title */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Title / Headline
          </label>
          <Input
            placeholder="e.g. Round 2 Pairings & Schedule Announced!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-xs font-bold min-h-[44px] py-2.5 px-3.5 rounded-xl border-gray-300 shadow-xs"
          />
        </div>

        {/* Announcement Body Message */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Body Message
          </label>
          <textarea
            placeholder="Write details of the broadcast announcement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 min-h-[110px] rounded-2xl border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-xs leading-relaxed font-normal touch-manipulation resize-y outline-none shadow-xs"
          />
        </div>

        {/* Submit Broadcast Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
        >
          {loading ? 'Dispatching Broadcast...' : 'Dispatch Broadcast'}
        </Button>
      </form>

      {/* Broadcast History Log with Filter Toggles & Momentum Scrolling */}
      <div className="pt-4 border-t border-gray-100 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Recent Announcements History
          </h4>
          
          {/* Filter Toggles (Min height 44px on mobile) */}
          <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                historyFilter === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Logs
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('global')}
              className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                historyFilter === 'global'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('targeted')}
              className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                historyFilter === 'targeted'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Targeted
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <p className="text-xs text-gray-400 italic">Loading past announcements...</p>
        ) : filteredHistory.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No matching broadcast history found.</p>
        ) : (
          <div 
            className="space-y-2 max-h-52 overflow-y-auto overscroll-contain pr-1 scroll-smooth [-webkit-overflow-scrolling:touch]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredHistory.map((b) => (
              <div 
                key={b.id} 
                className="p-3 bg-gray-50/90 rounded-xl border border-gray-150 flex justify-between items-start text-xs min-h-[44px]"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      b.is_global ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.is_global ? 'Global' : 'Targeted'}
                    </span>
                    <p className="font-black text-brand-text-dark truncate">{b.title}</p>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-normal">{b.content}</p>
                </div>
                <span className="text-[9px] font-bold text-gray-400 shrink-0 ml-1">
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
