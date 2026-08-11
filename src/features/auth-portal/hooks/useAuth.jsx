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
  markNotificationsAsRead: async () => {},
  updatePlayerDivision: async () => {},
  updateUserPhoneInDivisions: async () => {}
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
    // Deduplicate in-flight fetches for the same user.
    // NOTE: Do NOT short-circuit on `profile.id === uid` here — that stale closure
    // guard defeats explicit refreshProfile() calls made after profile updates.
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
          // Resolve phone number from user metadata or divisions table contact field
          let userPhone = '';
          const { data: sessionData } = await supabase.auth.getSession();
          const meta = sessionData?.session?.user?.user_metadata || {};
          userPhone = meta.phone || meta.whatsapp || '';

          try {
            const { data: divisions } = await supabase.from('divisions').select('players');
            if (divisions) {
              const matchTerms = [
                data.chess_username?.toLowerCase(),
                data.lichess_username?.toLowerCase(),
                data.email?.toLowerCase(),
                data.name?.toLowerCase()
              ].filter(Boolean);

              for (const d of divisions) {
                const found = (d.players || []).find(p =>
                  matchTerms.includes(p.username?.toLowerCase()) ||
                  matchTerms.includes(p.name?.toLowerCase())
                );
                if (found && (found.contact || found.phone || found.whatsapp)) {
                  userPhone = found.contact || found.phone || found.whatsapp;
                  break;
                }
              }
            }
          } catch (divErr) {
            console.warn('Failed resolving phone from divisions:', divErr);
          }

          setProfile({
            ...data,
            // phone/whatsapp are virtual fields resolved from divisions   not stored in profiles table
            phone: userPhone,
            whatsapp: userPhone,
          });
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
              phone: meta.phone || meta.whatsapp || '',
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

  // Global Announcements Tracking & Real-time Subscription
  const [announcements, setAnnouncements] = useState([]);
  const [lastSeenAnnouncementTime, setLastSeenAnnouncementTime] = useState(() => {
    try {
      return localStorage.getItem('ss4_last_seen_announcements') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, sender:profiles(name)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.warn('Could not fetch announcements in useAuth:', err);
      }
    };

    fetchAnnouncements();

    const annSub = supabase
      .channel('useauth-announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.created_by)
            .maybeSingle();

          const item = { ...payload.new, sender: data || { name: 'Admin' } };
          setAnnouncements(prev => [item, ...prev]);

          toast.info(`📢 ${payload.new.title}`, {
            position: 'bottom-right',
            autoClose: 6000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(annSub);
    };
  }, []);

  const markAnnouncementsAsRead = () => {
    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem('ss4_last_seen_announcements', nowIso);
    } catch {}
    setLastSeenAnnouncementTime(nowIso);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read_at).length;
  const unreadAnnouncementsCount = announcements.filter(a => {
    if (!lastSeenAnnouncementTime) return true;
    return new Date(a.created_at) > new Date(lastSeenAnnouncementTime);
  }).length;

  const updatePlayerDivision = async (profileObj, ratingVal) => {
    try {
      let targetDivId = 'pin';
      if (ratingVal >= 1800) targetDivId = 'a_division';
      else if (ratingVal >= 1000) targetDivId = 'default';

      // Fix 5: Fetch only division IDs first, then process each division sequentially.
      // The previous Promise.all concurrent read-modify-write created a race: two concurrent
      // signups would both read the same players[] snapshot, then overwrite each other's write.
      const { data: divIds, error: divErr } = await supabase.from('divisions').select('id');
      if (divErr || !divIds) return;

      const matchingUsernames = [
        profileObj.chess_username?.toLowerCase(),
        profileObj.lichess_username?.toLowerCase(),
        profileObj.email?.toLowerCase(),
        profileObj.name?.toLowerCase()
      ].filter(Boolean);

      for (const { id: divId } of divIds) {
        // Fresh read per division — minimises the window where a concurrent write gets clobbered
        const { data: divData } = await supabase
          .from('divisions')
          .select('players')
          .eq('id', divId)
          .single();

        if (!divData) continue;

        const playersList = divData.players || [];
        const found = playersList.some(p =>
          matchingUsernames.includes(p.username?.toLowerCase()) ||
          matchingUsernames.includes(p.name?.toLowerCase())
        );

        if (divId === targetDivId) {
          if (!found) {
            const addedPlayer = {
              name: profileObj.name,
              username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
              department: profileObj.department || 'Student Player',
              school: profileObj.university || 'SS4 Member',
              contact: profileObj.phone || profileObj.whatsapp || profileObj.contact || ''
            };
            await supabase.from('divisions').update({ players: [...playersList, addedPlayer] }).eq('id', divId);
          } else {
            let detailChanged = false;
            const nextList = playersList.map(p => {
              const isMatch =
                matchingUsernames.includes(p.username?.toLowerCase()) ||
                matchingUsernames.includes(p.name?.toLowerCase());
              if (isMatch) {
                const updatedP = {
                  ...p,
                  name: profileObj.name,
                  username: profileObj.chess_username || profileObj.lichess_username || profileObj.email,
                  department: profileObj.department || 'Student Player',
                  school: profileObj.university || 'SS4 Member',
                  contact: profileObj.phone || profileObj.whatsapp || profileObj.contact || p.contact || ''
                };
                if (JSON.stringify(p) !== JSON.stringify(updatedP)) {
                  detailChanged = true;
                  return updatedP;
                }
              }
              return p;
            });
            if (detailChanged) {
              await supabase.from('divisions').update({ players: nextList }).eq('id', divId);
            }
          }
        } else if (found) {
          const nextList = playersList.filter(p =>
            !matchingUsernames.includes(p.username?.toLowerCase()) &&
            !matchingUsernames.includes(p.name?.toLowerCase())
          );
          await supabase.from('divisions').update({ players: nextList }).eq('id', divId);
        }
      }
    } catch (err) {
      console.warn('Could not update player division assignment:', err.message);
    }
  };

  const updateUserPhoneInDivisions = async (profileObj, phoneNum) => {
    try {
      const matchTerms = [
        profileObj?.chess_username?.toLowerCase(),
        profileObj?.lichess_username?.toLowerCase(),
        profileObj?.email?.toLowerCase(),
        profileObj?.name?.toLowerCase()
      ].filter(Boolean);

      // Fetch only the IDs first so we know which divisions to touch
      const { data: divList } = await supabase.from('divisions').select('id');
      if (divList) {
        // Process each division independently   fresh read per division minimises
        // the race window where a concurrent admin/match-score update gets clobbered
        await Promise.all(divList.map(async ({ id }) => {
          const { data: div } = await supabase
            .from('divisions')
            .select('players')
            .eq('id', id)
            .single();

          if (!div) return;

          let changed = false;
          const nextPlayers = (div.players || []).map(p => {
            const isMatch =
              matchTerms.includes(p.username?.toLowerCase()) ||
              matchTerms.includes(p.name?.toLowerCase());
            if (isMatch) {
              changed = true;
              return { ...p, contact: phoneNum, phone: phoneNum, whatsapp: phoneNum };
            }
            return p;
          });

          if (changed) {
            await supabase.from('divisions').update({ players: nextPlayers }).eq('id', id);
          }
        }));
      }

      // Sync auth user metadata (source of truth for re-login hydration)
      await supabase.auth.updateUser({
        data: { phone: phoneNum, whatsapp: phoneNum }
      });

      // Update local profile state   phone/whatsapp are virtual fields resolved
      // from divisions; profiles table has no contact/phone column
      setProfile(prev => prev ? ({
        ...prev,
        phone: phoneNum,
        whatsapp: phoneNum,
      }) : null);
    } catch (err) {
      console.error('Failed updating phone in divisions:', err);
      throw err;
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
            phone: profileData.phone || profileData.whatsapp || '',
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
            phone: profileData.phone || profileData.whatsapp || '',
            chess_username: profileData.chess_username || '',
            lichess_username: profileData.lichess_username || '',
            chess_rating: profileData.chess_rating || 0,
            lichess_rating: profileData.lichess_rating || 0,
            role: 'player'
          });

        // Fix 3: Do NOT throw on profileErr. The auth user already exists in auth.users.
        // Throwing here creates a split-brain: user gets "Signup failed" toast but their
        // email is permanently locked. The self-heal fallback in fetchProfile will create
        // the profile row on first login if it's missing due to this failure.
        if (profileErr) {
          console.error('[signUp] Profile row upsert failed after auth user created — self-heal will run on next login:', profileErr.message);
          toast.warn('Account created! Finalizing your profile on first login...');
        } else {
          // Only auto-assign division if profile write succeeded
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
        }
        // Fix 2: Do NOT call fetchProfile explicitly here.
        // onAuthStateChange fires SIGNED_IN immediately after signUp and calls fetchProfile
        // via the listener. Calling it here too creates a non-deterministic race where
        // fetchingUidRef deduplication silently skips one of the two calls.
      }
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setLoading(false);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    // Fix 1: Do NOT call setLoading here. Global `loading` is only for session hydration.
    // The modal manages its own `submitting` state independently (orthogonal concerns).
    // Calling setLoading(true) here forces a global re-render that fights the modal's
    // local spinner, creating a double-flash race on slow connections.
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
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
      unreadMessagesCount: unreadMessages.length,
      setUnreadMessages,
      activeChatContactId,
      setActiveChatContactId,
      notifications,
      unreadNotificationsCount,
      setNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      announcements,
      unreadAnnouncementsCount,
      markAnnouncementsAsRead,
      updatePlayerDivision,
      updateUserPhoneInDivisions,
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
