import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../../../supabase';
import { toast } from 'react-toastify';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  onlineUsers: [],
  unreadMessages: [],
  activeChatContactId: null,
  setActiveChatContactId: () => {},
  notifications: [],
  setNotifications: () => {},
  isRecoverySession: false,
  setIsRecoverySession: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
  sendPasswordReset: async () => {},
  refreshProfile: async () => {},
  markNotificationsAsRead: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [activeChatContactId, setActiveChatContactId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const activeUserIdRef = useRef(null);
  const fetchingUidRef = useRef(null);

  const fetchProfile = async (uid) => {
    // If profile is already loaded for this user, do not fetch again
    if (profile && profile.id === uid) return;

    // Deduplicate in-flight fetches for the same user
    if (fetchingUidRef.current === uid) return;
    fetchingUidRef.current = uid;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) throw error;

      // Synchronously verify this is still the active user using refs (zero network requests)
      if (activeUserIdRef.current === uid) {
        if (data) {
          setProfile(data);
        } else if (activeUserIdRef.current === uid) {
          // ponytail: self-healing fallback if profile row was blocked during signup RLS misconfigurations
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id === uid) {
            const meta = sessionData.session.user.user_metadata || {};
            const fallbackProfile = {
              id: uid,
              email: sessionData.session.user.email,
              name: meta.name || sessionData.session.user.email.split('@')[0],
              university: meta.university || '',
              faculty: meta.faculty || '',
              department: meta.department || '',
              level: meta.level || '',
              chess_username: meta.chess_username || '',
              lichess_username: meta.lichess_username || '',
              chess_rating: meta.chess_rating || 0,
              lichess_rating: meta.lichess_rating || 0,
              role: meta.role || 'player'
            };
            const { data: newProfile, error: createErr } = await supabase
              .from('profiles')
              .upsert(fallbackProfile)
              .select()
              .single();
            
            if (!createErr) {
              setProfile(newProfile);
              try {
                const createdProfile = {
                  name: fallbackProfile.name,
                  chess_username: fallbackProfile.chess_username,
                  lichess_username: fallbackProfile.lichess_username,
                  email: fallbackProfile.email,
                  department: fallbackProfile.department,
                  university: fallbackProfile.university
                };
                const maxRating = Math.max(fallbackProfile.chess_rating || 0, fallbackProfile.lichess_rating || 0);
                await updatePlayerDivision(createdProfile, maxRating);
              } catch (divErr) {
                console.warn('Fallback division auto-assignment failed:', divErr.message);
              }
            } else {
              console.error('Fallback profile creation failed:', createErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      if (fetchingUidRef.current === uid) {
        fetchingUidRef.current = null;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check active sessions
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      const u = session?.user ?? null;
      setUser(u);
      activeUserIdRef.current = u?.id;

      if (u) {
        // Restore recovery state from sessionStorage if it survives page refresh
        const isRecovery = sessionStorage.getItem('ss4_recovery_session') === 'true';
        if (isRecovery) {
          setIsRecoverySession(true);
        }
        await fetchProfile(u.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    // ponytail: callback must NOT be async  GoTrue holds AuthLock for its duration,
    // so awaiting anything inside it deadlocks all subsequent auth calls (updateUser, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const u = session?.user ?? null;
      setUser(u);
      activeUserIdRef.current = u?.id;

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
        sessionStorage.setItem('ss4_recovery_session', 'true');
      }

      if (u) {
        fetchProfile(u.id); // fire-and-forget, do NOT await here
      } else {
        setProfile(null);
        setIsRecoverySession(false);
        sessionStorage.removeItem('ss4_recovery_session');
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real-time Presence Heartbeat & Sync
  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      return;
    }

    const updateLastSeen = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Could not update last_seen:', err.message);
      }
    };

    updateLastSeen();
    const heartbeat = setInterval(updateLastSeen, 60000);

    const presenceChannel = supabase.channel('scl-presence', {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  // Global Unread Messages Fetching & Real-time Subscription
  useEffect(() => {
    if (!user) {
      setUnreadMessages([]);
      return;
    }

    const fetchUnread = async () => {
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('id, sender_id, message, created_at, read_at')
          .eq('receiver_id', user.id)
          .is('read_at', null);

        if (!error) {
          setUnreadMessages(data || []);
        }
      } catch (err) {
        console.error("Error loading initial unreads:", err);
      }
    };

    fetchUnread();

    const dmChannel = supabase
      .channel(`global-dm:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages'
        },
        async (payload) => {
          const newMsg = payload.new;

          if (payload.eventType === 'INSERT') {
            const isToMe = newMsg.receiver_id === user.id;
            if (!isToMe) return;

            if (activeChatContactId === newMsg.sender_id) {
              await supabase
                .from('direct_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMsg.id);
            } else {
              setUnreadMessages((prev) => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              try {
                const { data: senderProf } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('id', newMsg.sender_id)
                  .maybeSingle();

                const senderName = senderProf?.name || 'Someone';
                toast.info(`New message from ${senderName}: "${newMsg.message}"`, {
                  position: "bottom-right",
                  autoClose: 4000
                });
              } catch (err) {
                console.error("Error displaying notification toast:", err);
              }
            }
          }

          if (payload.eventType === 'UPDATE') {
            if (newMsg.read_at && newMsg.receiver_id === user.id) {
              setUnreadMessages((prev) => prev.filter(m => m.id !== newMsg.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dmChannel);
    };
  }, [user, activeChatContactId]);

  // Notifications Sync & Subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.warn('Could not load notifications:', err.message);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const notifChannel = supabase
      .channel(`global-notif:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotif = payload.new;

          if (payload.eventType === 'INSERT') {
            if (newNotif.user_id !== user.id) return;
            setNotifications((prev) => {
              if (prev.find(n => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });

            // Trigger a beautiful announcement / notification toast!
            toast.info(`🔔 ${newNotif.title}: ${newNotif.message}`, {
              position: "bottom-right",
              autoClose: 6000
            });
          }

          if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map(n => n.id === newNotif.id ? newNotif : n)
            );
          }

          if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter(n => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, [user]);

  const markNotificationAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const updatePlayerDivision = async (profileObj, ratingVal) => {
    try {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      const { data: currentDivs, error: divErr } = await supabase.from('divisions').select('*');
      if (divErr || !currentDivs) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      const updatePromises = currentDivs.map(async (d) => {
        const playersList = d.players || [];
        const found = playersList.some(p => 
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (d.id === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member'
            };
            const nextList = [...playersList, addedPlayer];
            return supabase.from('divisions').update({ players: nextList }).eq('id', d.id);
          } else {
            let detailChanged = false;
            const nextList = playersList.map(p => {
              const isMatch = matchingUsernames.includes(p.username?.toLowerCase()) ||
                              matchingUsernames.includes(p.name?.toLowerCase());
              if (isMatch) {
                const updatedP = {
                  ...p,
                  name: profileObj.name,
                  username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
                  department: profileObj.department || 'Student Player',
                  school: profileObj.university || 'SS4 Member'
                };
                if (JSON.stringify(p) !== JSON.stringify(updatedP)) {
                  detailChanged = true;
                  return updatedP;
                }
              }
              return p;
            });
            if (detailChanged) {
              return supabase.from('divisions').update({ players: nextList }).eq('id', d.id);
            }
          }
        } else if (found) {
          const nextList = playersList.filter(p => 
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          return supabase.from('divisions').update({ players: nextList }).eq('id', d.id);
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.warn('Could not update player division assignment:', err.message);
    }
  };

  const updatePassword = async (newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  const sendPasswordReset = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/dashboard?tab=settings',
    });
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      if (rpcError) {
        console.warn('RPC deletion failed, falling back to profile deletion:', rpcError.message);
        const { error: profError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profError) throw profError;
      }
      await signOut();
    } catch (err) {
      console.error('Error deleting account:', err);
      throw err;
    }
  };

  const signUp = async (email, password, profileData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: profileData.name,
            university: profileData.university || '',
            faculty: profileData.faculty || '',
            department: profileData.department || '',
            level: profileData.level || '',
            chess_username: profileData.chess_username || '',
            lichess_username: profileData.lichess_username || '',
            chess_rating: profileData.chess_rating || 0,
            lichess_rating: profileData.lichess_rating || 0,
            role: 'player'
          }
        }
      });

      if (error) throw error;
      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email,
            name: profileData.name,
            university: profileData.university || '',
            faculty: profileData.faculty || '',
            department: profileData.department || '',
            level: profileData.level || '',
            chess_username: profileData.chess_username || '',
            lichess_username: profileData.lichess_username || '',
            chess_rating: profileData.chess_rating || 0,
            lichess_rating: profileData.lichess_rating || 0,
            role: 'player'
          });

        if (profileErr) throw profileErr;

        // Auto-assign player division on signup
        try {
          const createdProfile = {
            name: profileData.name,
            chess_username: profileData.chess_username || '',
            lichess_username: profileData.lichess_username || '',
            email,
            department: profileData.department || '',
            university: profileData.university || ''
          };
          const maxRating = Math.max(profileData.chess_rating || 0, profileData.lichess_rating || 0);
          await updatePlayerDivision(createdProfile, maxRating);
        } catch (divErr) {
          console.warn('Division auto-assignment failed:', divErr.message);
        }

        await fetchProfile(data.user.id);
      }
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setLoading(false);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setLoading(false);
      return { data: null, error: err };
    }
  };


  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      onlineUsers, 
      unreadMessages, 
      setUnreadMessages,
      activeChatContactId,
      setActiveChatContactId,
      notifications,
      setNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      updatePlayerDivision,
      signUp, 
      signIn, 
      signOut, 
      refreshProfile,
      setProfile,
      isRecoverySession,
      setIsRecoverySession,
      updatePassword,
      sendPasswordReset,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
