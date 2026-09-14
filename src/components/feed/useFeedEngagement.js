import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../features/auth-portal/hooks/useAuth';
import { useAuthModal } from '../../features/auth-portal/context/AuthModalContext';
import { toast } from 'react-toastify';

const STORAGE_KEYS = {
  LIKE_COUNTS: 'ss4_feed_like_counts',
  COMMENTS: 'ss4_feed_comments',
  USER_POSTS: 'ss4_feed_user_posts',
  userLikes: (uid) => `ss4_feed_user_likes_${uid || 'guest'}`,
  userBookmarks: (uid) => `ss4_feed_user_bookmarks_${uid || 'guest'}`
};

function readStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn(`[useFeedEngagement] read error for ${key}:`, e);
    return fallback;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[useFeedEngagement] write error for ${key}:`, e);
  }
}

function getAvatarInitials(name) {
  if (!name) return 'SS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#1E3A8A', color: '#FFFFFF' },
  { bg: '#065F46', color: '#FFFFFF' },
  { bg: '#7C2D12', color: '#FFFFFF' },
  { bg: '#7C3AED', color: '#FFFFFF' },
  { bg: '#0369A1', color: '#FFFFFF' },
  { bg: '#0F172A', color: '#FFFFFF' }
];

function getAvatarColor(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// Module-level singleton for Supabase realtime announcements channel
let announcementsChannel = null;
const announcementListeners = new Set();

function registerAnnouncementListener(callback) {
  announcementListeners.add(callback);

  if (!announcementsChannel) {
    try {
      announcementsChannel = supabase
        .channel('feed_realtime_announcements')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'announcements' },
          (payload) => {
            announcementListeners.forEach((fn) => fn(payload));
          }
        );
      announcementsChannel.subscribe();
    } catch (err) {
      console.warn('[useFeedEngagement] Error establishing announcements realtime channel:', err);
    }
  }

  return () => {
    announcementListeners.delete(callback);
    if (announcementListeners.size === 0 && announcementsChannel) {
      try {
        supabase.removeChannel(announcementsChannel);
      } catch (e) {
        // Safe teardown
      }
      announcementsChannel = null;
    }
  };
}

export function useFeedEngagement() {
  const { user, profile } = useAuth();
  const { openAuthModal } = useAuthModal();

  const [likeCounts, setLikeCounts] = useState(() => readStorage(STORAGE_KEYS.LIKE_COUNTS, {}));
  const [userLikes, setUserLikes] = useState(() => readStorage(STORAGE_KEYS.userLikes(user?.id), []));
  const [userBookmarks, setUserBookmarks] = useState(() => readStorage(STORAGE_KEYS.userBookmarks(user?.id), []));
  const [commentsMap, setCommentsMap] = useState(() => readStorage(STORAGE_KEYS.COMMENTS, {}));
  const [userPosts, setUserPosts] = useState(() => readStorage(STORAGE_KEYS.USER_POSTS, []));
  const [dbAnnouncements, setDbAnnouncements] = useState([]);

  // Sync state whenever user changes (switch between logged in / logged out)
  useEffect(() => {
    setUserLikes(readStorage(STORAGE_KEYS.userLikes(user?.id), []));
    setUserBookmarks(readStorage(STORAGE_KEYS.userBookmarks(user?.id), []));
  }, [user?.id]);

  // Listen for cross-tab or cross-component sync events
  useEffect(() => {
    const handleSync = () => {
      setLikeCounts(readStorage(STORAGE_KEYS.LIKE_COUNTS, {}));
      setUserLikes(readStorage(STORAGE_KEYS.userLikes(user?.id), []));
      setUserBookmarks(readStorage(STORAGE_KEYS.userBookmarks(user?.id), []));
      setCommentsMap(readStorage(STORAGE_KEYS.COMMENTS, {}));
      setUserPosts(readStorage(STORAGE_KEYS.USER_POSTS, []));
    };

    window.addEventListener('ss4_feed_engagement_update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ss4_feed_engagement_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user?.id]);

  const notifyUpdate = () => {
    window.dispatchEvent(new Event('ss4_feed_engagement_update'));
  };

  // Fetch real announcements from Supabase & attach single subscription
  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, sender:profiles(name, role)')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) return;
        if (isMounted && data) {
          const transformed = data.map((ann) => {
            const isAdmin = ann.sender?.role === 'admin' || ann.is_global !== false;
            return {
              id: `announcement_${ann.id}`,
              postType: 'text',
              categoryClass: 'announcement',
              isUnread: true,
              author: isAdmin ? {
                name: 'SS4',
                avatarImg: '/ss4_logo_without_text.jpg',
                isAdmin: true
              } : {
                name: ann.sender?.name || 'Contender',
                avatar: getAvatarInitials(ann.sender?.name || 'SS4'),
                avatarBg: '#0F172A',
                avatarColor: '#FFFFFF',
                time: new Date(ann.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })
              },
              title: ann.title,
              excerpt: ann.content,
              tags: ['#Announcement', '#SS4League'],
              likesCount: 0,
              isLiked: false,
              isBookmarked: false,
              comments: []
            };
          });
          setDbAnnouncements(transformed);
        }
      } catch (err) {
        console.warn('Error fetching announcements for feed:', err);
      }
    };

    fetchAnnouncements();

    // Register with singleton announcement listener
    const unsubscribe = registerAnnouncementListener(() => {
      fetchAnnouncements();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 1. Toggle Like (Gated to signed in users)
  const toggleLike = useCallback((postId) => {
    if (!user) {
      openAuthModal('like posts and support contenders', () => toggleLike(postId), 'login');
      return false;
    }

    const currentLikes = readStorage(STORAGE_KEYS.userLikes(user.id), []);
    const counts = readStorage(STORAGE_KEYS.LIKE_COUNTS, {});
    const isLiked = currentLikes.includes(postId);

    let nextLikes;
    let nextCount = counts[postId] ?? 0;

    if (isLiked) {
      nextLikes = currentLikes.filter((id) => id !== postId);
      nextCount = Math.max(0, nextCount - 1);
    } else {
      nextLikes = [...currentLikes, postId];
      nextCount = nextCount + 1;
    }

    counts[postId] = nextCount;
    writeStorage(STORAGE_KEYS.userLikes(user.id), nextLikes);
    writeStorage(STORAGE_KEYS.LIKE_COUNTS, counts);

    setUserLikes(nextLikes);
    setLikeCounts({ ...counts });
    notifyUpdate();
    return true;
  }, [user, openAuthModal]);

  // 2. Toggle Bookmark (Gated to signed in users)
  const toggleBookmark = useCallback((postId) => {
    if (!user) {
      openAuthModal('bookmark posts for later reference', () => toggleBookmark(postId), 'login');
      return false;
    }

    const currentBookmarks = readStorage(STORAGE_KEYS.userBookmarks(user.id), []);
    const isBookmarked = currentBookmarks.includes(postId);

    let nextBookmarks;
    if (isBookmarked) {
      nextBookmarks = currentBookmarks.filter((id) => id !== postId);
      toast.info('Post removed from saved bookmarks');
    } else {
      nextBookmarks = [...currentBookmarks, postId];
      toast.success('Post saved to your bookmarks');
    }

    writeStorage(STORAGE_KEYS.userBookmarks(user.id), nextBookmarks);
    setUserBookmarks(nextBookmarks);
    notifyUpdate();
    return true;
  }, [user, openAuthModal]);

  // 3. Add Comment (Gated to signed in users)
  const addComment = useCallback((postId, text) => {
    if (!text || !text.trim()) return false;

    if (!user) {
      openAuthModal('join the discussion and leave a comment', () => addComment(postId, text), 'login');
      return false;
    }

    const authorName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Contender';
    const avatar = getAvatarInitials(authorName);
    const color = getAvatarColor(user.id);

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName,
      avatar,
      avatarBg: color.bg,
      avatarColor: color.color,
      time: 'Just now',
      text: text.trim(),
      userId: user.id
    };

    const allComments = readStorage(STORAGE_KEYS.COMMENTS, {});
    const postComments = allComments[postId] || [];
    const updated = [...postComments, newComment];
    allComments[postId] = updated;

    writeStorage(STORAGE_KEYS.COMMENTS, allComments);
    setCommentsMap({ ...allComments });
    notifyUpdate();
    toast.success('Comment posted successfully');
    return true;
  }, [user, profile, openAuthModal]);

  // 4. Publish Post (Gated to signed in users)
  const publishPost = useCallback(({ text, composerType }) => {
    if (!text || !text.trim()) return false;

    if (!user) {
      openAuthModal('publish updates, challenges, or score cards', null, 'login');
      return false;
    }

    const isAdmin = profile?.role === 'admin';
    const color = getAvatarColor(user.id);
    const author = isAdmin ? {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true
    } : {
      name: profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Contender',
      avatar: getAvatarInitials(profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Contender'),
      avatarBg: color.bg,
      avatarColor: color.color,
      badge: profile?.institution ? profile.institution.toUpperCase() : 'CONTENDER',
      badgeStyle: { background: '#DBEAFE', color: '#1E40AF', fontWeight: 700 },
      time: 'Just now'
    };

    let newPost;
    const postId = `post_${Date.now()}`;

    if (composerType === 'challenge') {
      newPost = {
        id: postId,
        postType: 'text',
        categoryLabel: '🎯 Duel Challenge',
        categoryClass: 'announcement',
        isUnread: true,
        author,
        title: 'Open 1v1 Challenge Issued!',
        excerpt: text.trim(),
        tags: ['#ContenderChallenge', '#SS4Duel', '#OpenMatch'],
        likesCount: 0,
        isLiked: false,
        isBookmarked: false,
        embed: {
          type: 'challenge',
          badge: 'CHALLENGE',
          title: 'Open Contender Speed Duel',
          subtitle: 'Awaiting Challenger Acceptance',
          actionLabel: 'Accept Challenge ⚔️'
        },
        comments: []
      };
    } else if (composerType === 'score') {
      newPost = {
        id: postId,
        postType: 'multimedia',
        mediaType: 'banner',
        categoryLabel: '🏆 Score Card',
        categoryClass: 'tournament',
        readTime: '1 min read',
        isUnread: true,
        author,
        title: 'New Personal Best Score Recorded!',
        excerpt: text.trim(),
        tags: ['#ScoreCard', '#SASMastery', '#Leaderboard'],
        likesCount: 0,
        isLiked: false,
        isBookmarked: false,
        bannerMeta: {
          graphic: '🎯⚡',
          bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200'
        },
        embed: {
          type: 'match',
          metric: 'VERIFIED',
          title: 'Contender Practice Session Result',
          subtitle: 'Score submitted and verified on SS4',
          actionLabel: 'View Leaderboard →'
        },
        comments: []
      };
    } else {
      newPost = {
        id: postId,
        postType: 'text',
        categoryLabel: '📢 Community Post',
        categoryClass: 'update',
        isUnread: true,
        author,
        title: 'Community Update',
        excerpt: text.trim(),
        tags: ['#Community', '#SS4League'],
        likesCount: 0,
        isLiked: false,
        isBookmarked: false,
        comments: []
      };
    }

    const currentPosts = readStorage(STORAGE_KEYS.USER_POSTS, []);
    const updatedPosts = [newPost, ...currentPosts];
    writeStorage(STORAGE_KEYS.USER_POSTS, updatedPosts);
    setUserPosts(updatedPosts);
    notifyUpdate();
    toast.success('Post published to live feed!');
    return true;
  }, [user, profile, openAuthModal]);

  // Enrich any post with live engagement data
  const enrichPost = useCallback((post) => {
    const customComments = commentsMap[post.id] || [];
    const baseComments = post.comments || [];
    const mergedComments = [...baseComments, ...customComments];

    const isLiked = userLikes.includes(post.id);
    const isBookmarked = userBookmarks.includes(post.id);
    const count = likeCounts[post.id] !== undefined ? likeCounts[post.id] : (post.likesCount || 0);

    return {
      ...post,
      likesCount: count,
      isLiked,
      isBookmarked,
      comments: mergedComments,
      commentsCount: mergedComments.length
    };
  }, [commentsMap, userLikes, userBookmarks, likeCounts]);

  return {
    user,
    profile,
    dbAnnouncements,
    userPosts,
    toggleLike,
    toggleBookmark,
    addComment,
    publishPost,
    enrichPost
  };
}
