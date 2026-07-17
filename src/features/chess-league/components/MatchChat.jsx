import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../auth-portal/hooks/useAuth';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { toast } from 'react-toastify';

export default function MatchChat({ matchId, playerA, playerB }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('match_messages')
          .select('*, sender:profiles(name)')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching match messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 2. Subscribe to realtime updates for this matchId
    const subscription = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_messages',
          filter: `match_id=eq.${matchId}`
        },
        async (payload) => {
          // Fetch sender name
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.sender_id)
            .maybeSingle();

          const messageWithSender = {
            ...payload.new,
            sender: data || { name: 'Player' }
          };

          setMessages((prev) => [...prev, messageWithSender]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [matchId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('match_messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          message: msgText
        });

      if (error) throw error;
    } catch (err) {
      toast.error('Failed to send message.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#F6F4F0] px-6 py-4 border-b border-gray-150 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-brand-text-dark font-space uppercase tracking-wider">Match Chat</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            Pairing: {playerA?.name || 'Player 1'} vs {playerB?.name || 'Player 2'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Coordination</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs font-semibold text-gray-400 italic">
            Loading chat messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs font-semibold text-gray-400 italic">No messages yet. Coordinate your match schedule here!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {isMe ? 'You' : m.sender?.name} &bull; {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm ${
                  isMe 
                    ? 'bg-brand-primary text-white rounded-tr-none' 
                    : 'bg-brand-bg-cream/70 text-brand-text-dark rounded-tl-none border border-gray-100'
                }`}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
        <Input
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow text-xs"
        />
        <Button 
          type="submit" 
          variant="primary" 
          className="py-2.5 px-6 text-xs bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
