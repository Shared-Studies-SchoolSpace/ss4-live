import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Button';
import Input from '../Input';
import { toast } from 'react-toastify';

export default function AdminBroadcastPanel() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    if (profile?.role !== 'admin') {
      toast.error('Only administrators can broadcast announcements.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: title.trim(),
          content: content.trim(),
          created_by: user.id
        });

      if (error) throw error;

      // Broadcast notifications to all users
      try {
        const { data: profiles } = await supabase.from('profiles').select('id');
        if (profiles && profiles.length > 0) {
          const notifs = profiles.map(p => ({
            user_id: p.id,
            type: 'announcement',
            title: `New Announcement! 📢`,
            message: title.trim(),
            link: '/news'
          }));

          // Batch insert
          const batchSize = 100;
          for (let i = 0; i < notifs.length; i += batchSize) {
            await supabase.from('notifications').insert(notifs.slice(i, i + batchSize));
          }
        }
      } catch (notifErr) {
        console.warn('Failed to broadcast announcement notifications:', notifErr.message);
      }

      toast.success('Announcement broadcasted successfully!');
      setTitle('');
      setContent('');
    } catch (err) {
      toast.error('Failed to broadcast announcement.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">Broadcast Announcement</h3>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Send a real-time notification to all players in the league.</p>
      </div>

      <form onSubmit={handleBroadcast} className="space-y-4">
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Announcement Title</label>
          <Input
            placeholder="e.g. Round 2 Matchups Released!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Announcement Body</label>
          <textarea
            placeholder="Write details of the announcement here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-brand-primary focus:border-brand-primary text-xs h-28"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer text-xs"
        >
          {loading ? 'Broadcasting...' : 'Broadcast to All Players'}
        </Button>
      </form>
    </div>
  );
}
