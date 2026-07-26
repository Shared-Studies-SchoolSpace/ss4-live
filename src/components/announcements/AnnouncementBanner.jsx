import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../features/auth-portal/hooks/useAuth';

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
          .limit(20);

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

          setAnnouncements((prev) => [announcementWithSender, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return null;

  if (announcements.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-xs mb-6">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl text-[#E8640A] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">No Broadcast Announcements Yet</h3>
        <p className="text-xs font-semibold text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
          Official league broadcasts and tournament notices from SCL administrators will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">League Announcements ({announcements.length})</h3>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div 
            key={a.id} 
            className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs flex gap-4 items-start relative overflow-hidden animate-in slide-in-from-top-4 duration-300"
          >
            {/* Design accents */}
            <div className="w-1.5 h-full bg-[#E8640A] absolute top-0 left-0"></div>
            
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E8640A] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1">
                <h4 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">{a.title}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  {new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-700 leading-relaxed whitespace-pre-line">{a.content}</p>
              {a.sender?.name && (
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest block mt-2">
                  Posted by {a.sender.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
