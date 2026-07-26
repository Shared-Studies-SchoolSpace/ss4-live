import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from '../../supabase';
import { useAuth } from '../../features/auth-portal/hooks/useAuth';
import { useAuthModal } from '../../features/auth-portal/context/AuthModalContext';
import { fetchCompletePlayerData } from '../../features/chess-league/utils/chessService';
import Input from '../Input';
import Button from '../Button';
import { toast } from "react-toastify";

function ContactAvatar({ contact, isOnline, size = "md" }) {
  const [avatarUrl, setAvatarUrl] = useState(
    contact?.avatar || contact?.chess_avatar || contact?.avatar_url || null
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (contact?.avatar || contact?.chess_avatar || contact?.avatar_url) {
      setAvatarUrl(contact.avatar || contact.chess_avatar || contact.avatar_url);
      return;
    }
    const username = contact?.chess_username || contact?.lichess_username || contact?.username;
    if (!username) return;
    const platform = contact?.lichess_username && !contact?.chess_username ? 'lichess' : 'chess.com';

    let isMounted = true;
    fetchCompletePlayerData(username, platform).then((data) => {
      if (isMounted && data?.avatar) {
        setAvatarUrl(data.avatar);
      }
    });
    return () => { isMounted = false; };
  }, [contact]);

  const monogram = (contact?.name || '?')
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const dimClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-11 h-11 text-base" : "w-10 h-10 text-sm";

  return (
    <div className={`relative shrink-0 ${dimClass}`}>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200/70 shadow-2xs">
        {avatarUrl && !imgError ? (
          <img 
            src={avatarUrl} 
            alt={contact?.name} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black flex items-center justify-center select-none">
            {monogram}
          </div>
        )}
      </div>
      {isOnline !== undefined && (
        <span className={`absolute bottom-0 right-0 block ${size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'} rounded-full ${isOnline ? 'bg-emerald-500 ring-2 ring-white animate-pulse' : 'bg-gray-300 ring-2 ring-white'}`} />
      )}
    </div>
  );
}

export default function DirectChat() {
  const { 
    user, 
    profile, 
    onlineUsers, 
    unreadMessages, 
    setUnreadMessages, 
    setActiveChatContactId 
  } = useAuth();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();

  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [latestMessageMap, setLatestMessageMap] = useState({});

  const messagesContainerRef = useRef(null);
  const hasAutoSelectedRef = useRef(null);
  const isVerified = user?.email_confirmed_at !== undefined;

  // 1. Fetch directory of players and recent message timestamps
  useEffect(() => {
    if (!user) return;

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .order("name", { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error("Error loading profiles:", err);
      }
    };

    const fetchRecentTimestamps = async () => {
      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .select("sender_id, receiver_id, created_at")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const map = {};
          data.forEach(m => {
            const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
            if (!map[otherId]) {
              map[otherId] = m.created_at;
            }
          });
          setLatestMessageMap(map);
        }
      } catch (err) {
        console.error("Error fetching message timestamps:", err);
      }
    };

    fetchProfiles();
    fetchRecentTimestamps();

    const profilesChannel = supabase
      .channel('dm-profiles-presence')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updatedProf = payload.new;
          setProfiles((prev) =>
            prev.map((p) => (p.id === updatedProf.id ? { ...p, ...updatedProf } : p))
          );
          if (activeContact?.id === updatedProf.id) {
            setActiveContact((prev) => (prev ? { ...prev, ...updatedProf } : prev));
          }
        }
      )
      .subscribe();

    const dmGlobalListener = supabase
      .channel(`dm-sorting:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new;
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (otherId) {
            setLatestMessageMap(prev => ({
              ...prev,
              [otherId]: msg.created_at
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(dmGlobalListener);
    };
  }, [user, activeContact?.id]);

  // Auto-select contact based on location search/state params once per target key
  useEffect(() => {
    if (profiles.length === 0) return;
    const params = new URLSearchParams(location.search);
    const targetId = location.state?.contactId || params.get('contactId');
    const targetUsername = location.state?.username || params.get('username');
    const targetKey = `${targetId || ''}:${targetUsername || ''}`;

    if (!targetId && !targetUsername) return;
    if (hasAutoSelectedRef.current === targetKey) return;

    if (targetId) {
      const contact = profiles.find(p => p.id === targetId);
      if (contact) {
        setActiveContact(contact);
        hasAutoSelectedRef.current = targetKey;
        return;
      }
    }

    if (targetUsername) {
      const lower = targetUsername.toLowerCase();
      const contact = profiles.find(p => 
        (p.chess_username && p.chess_username.toLowerCase() === lower) ||
        (p.lichess_username && p.lichess_username.toLowerCase() === lower) ||
        (p.username && p.username.toLowerCase() === lower) ||
        (p.name && p.name.toLowerCase() === lower)
      );
      if (contact) {
        setActiveContact(contact);
        hasAutoSelectedRef.current = targetKey;
      }
    }
  }, [profiles, location]);

  // 2. Fetch messages and mark as read when active contact changes
  useEffect(() => {
    if (!user || !activeContact) {
      setActiveChatContactId(null);
      return;
    }

    setActiveChatContactId(activeContact.id);
    setLoadingChats(true);

    const fetchDirectMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    const markAsRead = async () => {
      try {
        const nowIso = new Date().toISOString();
        const { error } = await supabase
          .from("direct_messages")
          .update({ read_at: nowIso })
          .eq("sender_id", activeContact.id)
          .eq("receiver_id", user.id)
          .is("read_at", null);

        if (error) throw error;
        
        setUnreadMessages((prev) => prev.filter(m => m.sender_id !== activeContact.id));
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === activeContact.id && m.receiver_id === user.id && !m.read_at
              ? { ...m, read_at: nowIso }
              : m
          )
        );
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };

    fetchDirectMessages();
    markAsRead();
  }, [activeContact, user, setActiveChatContactId, setUnreadMessages]);

  // Scroll inner message container only (does NOT scroll the window)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. Realtime listener for active chat messages
  useEffect(() => {
    if (!user || !activeContact) return;

    const channel = supabase
      .channel(`active-dm-chat:${activeContact.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages"
        },
        (payload) => {
          const newMsg = payload.new;

          if (payload.eventType === "INSERT") {
            const isFromActive = newMsg.sender_id === activeContact.id && newMsg.receiver_id === user.id;
            const isToActive = newMsg.sender_id === user.id && newMsg.receiver_id === activeContact.id;

            if (isFromActive || isToActive) {
              const nowIso = new Date().toISOString();
              const msgToAdd = isFromActive ? { ...newMsg, read_at: nowIso } : newMsg;

              setMessages((prev) => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, msgToAdd];
              });

              if (isFromActive) {
                supabase
                  .from("direct_messages")
                  .update({ read_at: nowIso })
                  .eq("id", newMsg.id)
                  .then();
              }
            }
          }

          if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map(m => m.id === newMsg.id ? newMsg : m)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeContact, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeContact) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      const { data, error } = await supabase
        .from("direct_messages")
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
      toast.error("Failed to send message.");
      console.error(err);
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Offline";
    const diff = new Date() - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Active just now";
    if (minutes < 60) return `Active ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Active ${hours}h ago`;
    return `Last active ${new Date(timestamp).toLocaleDateString()}`;
  };

  const filteredContacts = profiles
    .filter(c => 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const unreadA = unreadMessages.filter(m => m.sender_id === a.id).length;
      const unreadB = unreadMessages.filter(m => m.sender_id === b.id).length;

      // 1. Unread messages priority: contacts with unread messages shoot to top
      if (unreadA !== unreadB) {
        return unreadB - unreadA;
      }

      // 2. Latest message timestamp priority: contacts with newest messages shoot to top
      const timeA = latestMessageMap[a.id] ? new Date(latestMessageMap[a.id]).getTime() : 0;
      const timeB = latestMessageMap[b.id] ? new Date(latestMessageMap[b.id]).getTime() : 0;

      if (timeA !== timeB) {
        return timeB - timeA;
      }

      return (a.name || '').localeCompare(b.name || '');
    });

  // Guest View
  if (!user) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm">
        <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider font-space">Messages</h3>
        <p className="text-xs font-semibold text-gray-400 mt-2 max-w-xs leading-relaxed">
          Sign in to message other players directly. No match required.
        </p>
        <button
          onClick={() => openAuthModal("access messages", null, 'login')}
          className="mt-5 px-6 py-2.5 rounded-full bg-brand-primary text-white font-bold text-xs hover:bg-[#1545A2] transition-colors cursor-pointer shadow-md"
        >
          Sign In to Message
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-170px)] min-h-[480px] max-h-[620px] w-full my-auto">
      
      {/* Sidebar Contacts List */}
      <div className={`md:col-span-1 border-r border-gray-100 flex flex-col h-full bg-gray-50/50 min-h-0 ${
        activeContact ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-brand-text-dark uppercase tracking-wider font-space">
              Messages ({filteredContacts.length})
            </h3>
          </div>
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-white"
          />
        </div>

        {/* Scrollable Player List */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-0 divide-y divide-gray-100/60 no-scrollbar">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-xs font-semibold text-gray-400 p-6 italic">No players found.</p>
          ) : (
            filteredContacts.map(c => {
              const countUnread = unreadMessages.filter(m => m.sender_id === c.id).length;
              const isOnline = onlineUsers.includes(c.id);
              const isActive = activeContact?.id === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveContact(c)}
                  className={`w-full flex items-center justify-between p-3.5 transition-all text-left cursor-pointer ${
                    isActive 
                      ? "bg-blue-50/80 border-l-4 border-brand-primary font-semibold" 
                      : "hover:bg-[#F6F4F0]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ContactAvatar contact={c} isOnline={isOnline} size="md" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-brand-text-dark leading-tight truncate">{c.name}</h4>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5 truncate">
                        {isOnline ? (
                          <span className="text-emerald-600 font-bold">Online</span>
                        ) : (
                          formatLastSeen(c.last_seen)
                        )}
                      </p>
                    </div>
                  </div>
                  {countUnread > 0 && (
                    <span className="bg-brand-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 shadow-xs">
                      {countUnread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className={`md:col-span-2 flex flex-col h-full bg-white min-h-0 ${
        activeContact ? 'flex' : 'hidden md:flex'
      }`}>
        {activeContact ? (
          <>
            {/* Header Status Row */}
            <div className="bg-[#F6F4F0] px-5 py-3.5 border-b border-gray-150 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveContact(null)}
                  className="md:hidden p-1 rounded-lg text-gray-500 hover:text-[#111111] hover:bg-gray-200/60 transition-colors cursor-pointer"
                  title="Back to players list"
                  aria-label="Back to players list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <ContactAvatar contact={activeContact} isOnline={onlineUsers.includes(activeContact.id)} size="sm" />
                <div className="text-left">
                  <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">{activeContact.name}</h3>
                  <p className="text-[10px] font-semibold text-gray-500">
                    {onlineUsers.includes(activeContact.id) ? (
                      <span className="text-emerald-600 font-bold">Active now</span>
                    ) : (
                      formatLastSeen(activeContact.last_seen)
                    )}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full tracking-wider border border-brand-primary/10">
                Direct
              </span>
            </div>

            {/* Chats Pane */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 no-scrollbar">
              {loadingChats ? (
                <div className="flex items-center justify-center h-full text-xs font-semibold text-gray-400 italic">
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="font-space font-black text-sm text-[#111111] mb-1">Start a conversation</h4>
                  <p className="text-xs font-semibold text-gray-400 max-w-xs">Send a message to start chatting with {activeContact.name}.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {isMe ? "You" : activeContact.name} &bull; {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xs ${
                        isMe 
                          ? "bg-brand-primary text-white rounded-tr-none text-left" 
                          : "bg-brand-bg-cream/80 text-brand-text-dark rounded-tl-none border border-gray-100 text-left"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        
                        {isMe && (
                          <div className="flex justify-end items-center gap-0.5 mt-1 text-[8.5px] font-black uppercase text-white/80">
                            {m.read_at ? (
                              <span className="flex items-center text-emerald-300 font-bold">
                                Read ✓✓
                              </span>
                            ) : (
                              <span className="flex items-center text-white/60">
                                Sent ✓
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Composer */}
            {isVerified ? (
              <form onSubmit={handleSend} className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5 shrink-0">
                <Input
                  placeholder={`Message ${activeContact.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow text-xs bg-white"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="py-2.5 px-5 text-xs bg-brand-primary text-white font-bold rounded-xl shadow-xs hover:bg-[#1545A2] transition-colors whitespace-nowrap"
                >
                  Send
                </Button>
              </form>
            ) : (
              <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3 shrink-0">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest text-left">
                  Verify your email to send messages.
                </p>
              </div>
            )}

          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50/30">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider font-space">No Conversation Selected</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 max-w-xs">Select a player from the directory list on the left to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}

