import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';

export default function AnnouncementBanner() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial announcements
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, sender:profiles(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // 2. Realtime subscription
    const subscription = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements'
        },
        async (payload) => {
          // Fetch sender details
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.created_by)
            .maybeSingle();

          const announcementWithSender = {
            ...payload.new,
            sender: data || { name: 'Admin' }
          };

          setAnnouncements((prev) => [announcementWithSender, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Latest Announcements</h3>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div 
            key={a.id} 
            className="bg-brand-accent/5 border border-brand-accent/10 rounded-2xl p-4 sm:p-5 flex gap-4 items-start relative overflow-hidden animate-in slide-in-from-top-4 duration-300"
          >
            {/* Design accents */}
            <div className="w-1.5 h-full bg-brand-accent absolute top-0 left-0"></div>
            
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                <h4 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">{a.title}</h4>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-600 mt-1.5 leading-relaxed">{a.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
