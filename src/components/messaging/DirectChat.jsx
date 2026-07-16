import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAuthModal } from "../../context/AuthModalContext";
import Input from "../Input";
import Button from "../Button";
import { toast } from "react-toastify";

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

  const chatEndRef = useRef(null);
  const isVerified = user?.email_confirmed_at !== undefined;

  // 1. Fetch directory of players
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

    fetchProfiles();
  }, [user]);

  // Auto-select contact based on location search/state params
  useEffect(() => {
    if (profiles.length === 0) return;
    const params = new URLSearchParams(location.search);
    const targetId = location.state?.contactId || params.get('contactId');
    if (targetId) {
      const contact = profiles.find(p => p.id === targetId);
      if (contact) {
        setActiveContact(contact);
      }
    }
  }, [profiles, location]);

  // 2. Fetch direct messages and mark as read when active contact changes
  useEffect(() => {
    if (!user || !activeContact) {
      setActiveChatContactId(null);
      return;
    }

    // Inform global context of the active chat recipient to suppress duplicate toasts
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
        console.error("Error loading direct messages:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    const markAsRead = async () => {
      try {
        const { error } = await supabase
          .from("direct_messages")
          .update({ read_at: new Date().toISOString() })
          .eq("sender_id", activeContact.id)
          .eq("receiver_id", user.id)
          .is("read_at", null);

        if (error) throw error;
        
        // Remove locally from global unreads list
        setUnreadMessages((prev) => prev.filter(m => m.sender_id !== activeContact.id));
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };

    fetchDirectMessages();
    markAsRead();
  }, [activeContact, user, setActiveChatContactId, setUnreadMessages]);

  // Scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
              setMessages((prev) => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Mark as read immediately since the user is in this active conversation
              if (isFromActive) {
                supabase
                  .from("direct_messages")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", newMsg.id)
                  .then();
              }
            }
          }

          if (payload.eventType === "UPDATE") {
            // Update messages list for read status checkmarks
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

  // Relative last seen timestamp formatter
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

  const filteredContacts = profiles.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h3 className="text-sm font-black text-brand-text-dark uppercase tracking-wider font-space">Direct Messages</h3>
        <p className="text-xs font-semibold text-gray-400 mt-2 max-w-xs leading-relaxed">
          Sign in to message other players directly — no match required.
        </p>
        <button
          onClick={() => openAuthModal("access direct messages", null, 'login')}
          className="mt-5 px-6 py-2.5 rounded-full bg-brand-primary text-white font-bold text-xs hover:bg-brand-accent transition-colors cursor-pointer shadow-md"
        >
          Sign In to Message
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm h-[600px]">
      
      {/* Sidebar Contacts List */}
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
            filteredContacts.map(c => {
              const countUnread = unreadMessages.filter(m => m.sender_id === c.id).length;
              const isOnline = onlineUsers.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveContact(c)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-[#F6F4F0] transition-colors border-b border-gray-50 text-left cursor-pointer ${
                    activeContact?.id === c.id ? "bg-[#F6F4F0] border-l-4 border-brand-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-sm flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      {isOnline ? (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                      ) : (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-300 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-brand-text-dark leading-tight truncate">{c.name}</h4>
                      <p className="text-[9px] font-semibold text-gray-400 mt-1">
                        {isOnline ? "Online" : formatLastSeen(c.last_seen)}
                      </p>
                    </div>
                  </div>
                  {countUnread > 0 && (
                    <span className="bg-brand-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 shadow-sm">
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
      <div className="md:col-span-2 flex flex-col h-full bg-white">
        {activeContact ? (
          <>
            {/* Header Status Row */}
            <div className="bg-[#F6F4F0] px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-xs flex items-center justify-center">
                    {activeContact.name.charAt(0)}
                  </div>
                  {onlineUsers.includes(activeContact.id) ? (
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  ) : (
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-gray-300 ring-2 ring-white" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-brand-text-dark font-space uppercase tracking-wider">{activeContact.name}</h3>
                  <p className="text-[9px] font-semibold text-gray-400">
                    {onlineUsers.includes(activeContact.id) ? "Online" : formatLastSeen(activeContact.last_seen)}
                  </p>
                </div>
              </div>
              <span className="text-[8px] font-black uppercase bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full tracking-wider border border-brand-primary/10">
                Direct
              </span>
            </div>

            {/* Chats Pane */}
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
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {isMe ? "You" : activeContact.name} &bull; {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm ${
                        isMe 
                          ? "bg-brand-primary text-white rounded-tr-none text-left" 
                          : "bg-brand-bg-cream/70 text-brand-text-dark rounded-tl-none border border-gray-100 text-left"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        
                        {isMe && (
                          <div className="flex justify-end items-center gap-0.5 mt-1 text-[8.5px] font-black uppercase text-white/70">
                            {m.read_at ? (
                              <span className="flex items-center text-emerald-300 font-bold">
                                Read ✓✓
                              </span>
                            ) : (
                              <span className="flex items-center text-white/50">
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
              <div ref={chatEndRef} />
            </div>

            {/* Input Composer */}
            {isVerified ? (
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
            ) : (
              <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
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
