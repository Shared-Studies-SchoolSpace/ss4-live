import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Button';
import Input from '../Input';
import { toast } from 'react-toastify';

export default function DirectChat() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Fetch other profiles for contact directory
  useEffect(() => {
    if (!user) return;
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, chess_username, lichess_username')
          .neq('id', user.id);
        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    fetchProfiles();
  }, [user]);

  // 2. Fetch and Subscribe to messages when activeContact changes
  useEffect(() => {
    if (!user || !activeContact) return;
    setLoadingChats(true);

    const fetchDirectMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error loading direct messages:', err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchDirectMessages();

    // Subscribe to realtime messages involving this contact
    const subscription = supabase
      .channel(`direct:${activeContact.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          const newMsg = payload.new;
          // Verify if message belongs to this conversation
          const isFromActive = newMsg.sender_id === activeContact.id && newMsg.receiver_id === user.id;
          const isToActive = newMsg.sender_id === user.id && newMsg.receiver_id === activeContact.id;
          
          if (isFromActive || isToActive) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeContact, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeContact) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: activeContact.id,
          message: msgText
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      toast.error('Failed to send message.');
      console.error(err);
    }
  };

  const filteredContacts = profiles.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm h-[600px]">
      
      {/* Contact List */}
      <div className="md:col-span-1 border-r border-gray-100 flex flex-col h-full bg-gray-50/50">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
        </div>
        <div className="flex-grow overflow-y-auto pr-1 no-scrollbar">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-xs font-semibold text-gray-400 p-6 italic">No players found.</p>
          ) : (
            filteredContacts.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-[#F6F4F0] transition-colors border-b border-gray-50 text-left cursor-pointer ${
                  activeContact?.id === c.id ? 'bg-[#F6F4F0] border-l-4 border-brand-primary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-sm flex items-center justify-center">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-brand-text-dark leading-tight">{c.name}</h4>
                  <p className="text-[9px] font-black text-brand-primary uppercase mt-1 tracking-wider">
                    {c.chess_username ? `@${c.chess_username} (chess.com)` : c.lichess_username ? `@${c.lichess_username} (lichess)` : 'Student'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2 flex flex-col h-full bg-white">
        {activeContact ? (
          <>
            {/* Active Contact Header */}
            <div className="bg-[#F6F4F0] px-6 py-4 border-b border-gray-150 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-xs flex items-center justify-center">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">{activeContact.name}</h3>
                <p className="text-[9px] font-semibold text-gray-400">
                  Direct Conversation
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
              {loadingChats ? (
                <div className="flex items-center justify-center h-full text-xs font-semibold text-gray-400 italic">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-400 italic">Send a message to start direct chat with {activeContact.name}!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {isMe ? 'You' : activeContact.name} &bull; {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                placeholder={`Message ${activeContact.name}...`}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50/20">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider font-space">No Conversation Selected</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 max-w-xs">Select a player from the directory list on the left to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
