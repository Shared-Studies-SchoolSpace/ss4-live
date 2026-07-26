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
        .limit(5);
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
      toast.error('Failed to dispatch broadcast: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">📢</span>
            <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">
              Universal Admin Broadcast
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            Post global announcements and dispatch targeted or broadcast notifications to players.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleBroadcast} className="space-y-4 text-left">
        
        {/* Target & Broadcast Mode Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Audience Target
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary text-xs font-semibold"
            >
              <option value="all">🌐 All Players (Global Broadcast)</option>
              <option value="specific">🎯 Specific Player</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Dispatch Action
            </label>
            <select
              value={broadcastMode}
              onChange={(e) => setBroadcastMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary text-xs font-semibold"
            >
              <option value="announcement_and_notif">📢 Global Announcement + Notification</option>
              <option value="notif_only">🔔 Direct Notification Only</option>
            </select>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary text-xs font-semibold"
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

        {/* Notification Category & Action Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Notification Category
            </label>
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary text-xs font-semibold"
            >
              <option value="announcement">📢 Announcement</option>
              <option value="admin_alert">🚨 Admin Alert</option>
              <option value="opponent_assigned">♟ Opponent / Match</option>
              <option value="rating_update">📊 Rating Update</option>
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
              className="text-xs"
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
            className="text-xs font-bold"
          />
        </div>

        {/* Announcement Body */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Body Message
          </label>
          <textarea
            placeholder="Write details of the broadcast announcement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary focus:border-brand-primary text-xs h-28 leading-relaxed font-normal"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
        >
          {loading ? 'Dispatching Broadcast...' : '🚀 Dispatch Broadcast'}
        </Button>
      </form>

      {/* History log of recent announcements */}
      <div className="pt-4 border-t border-gray-100 text-left">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Recent Announcements History
        </h4>
        {loadingHistory ? (
          <p className="text-xs text-gray-400 italic">Loading past announcements...</p>
        ) : recentBroadcasts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No broadcast announcements recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
            {recentBroadcasts.map((b) => (
              <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start text-xs">
                <div>
                  <p className="font-black text-brand-text-dark">{b.title}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{b.content}</p>
                </div>
                <span className="text-[8px] font-bold text-gray-400 shrink-0 ml-2">
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
