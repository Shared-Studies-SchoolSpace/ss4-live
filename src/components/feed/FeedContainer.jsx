import React, { useState, useMemo } from 'react';
import { FeedCard } from './FeedCard';
import { INITIAL_FEED_POSTS } from './feedData';
import { useFeedEngagement } from './useFeedEngagement';
import { useAuthModal } from '../../features/auth-portal/context/AuthModalContext';
import './feedStyles.css';

const FILTER_PILLS = [
  { id: 'all', label: 'All Activity' },
  { id: 'tournament', label: 'Tournaments', categoryClass: 'tournament' },
  { id: 'announcements', label: 'Announcements', categoryClass: 'announcement' },
  { id: 'video', label: 'Video Highlights', mediaType: 'video' },
  { id: 'photo_gallery', label: 'Photo Galleries', mediaType: 'photo_gallery' },
  { id: 'release', label: 'Release Notes', categoryClass: 'text-only' }
];

export function FeedContainer({ 
  initialPosts = INITIAL_FEED_POSTS,
  title = "SS4 Assessment & Community Feed",
  subtitle = "Real-time duel highlights, tournament broadcasts, photo galleries, and platform releases",
  showComposer = true,
  defaultFilter = 'all',
  activeFilter: controlledFilter,
  onFilterChange,
  showHeader = true,
  className = "w-full max-w-3xl mx-auto px-4 py-8"
}) {
  const {
    user,
    profile,
    dbAnnouncements,
    userPosts,
    toggleLike,
    toggleBookmark,
    addComment,
    publishPost,
    enrichPost
  } = useFeedEngagement();
  const { openAuthModal } = useAuthModal();

  const [internalFilter, setInternalFilter] = useState(defaultFilter);
  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;
  const setActiveFilter = (val) => {
    setInternalFilter(val);
    if (onFilterChange) onFilterChange(val);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [composerText, setComposerText] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [composerType, setComposerType] = useState('general'); // 'general' | 'challenge' | 'score'

  // Combine user-created posts, real database announcements, and initial posts
  const allRawPosts = useMemo(() => {
    const combined = [...userPosts, ...dbAnnouncements, ...initialPosts];
    const seen = new Set();
    return combined.filter(p => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [userPosts, dbAnnouncements, initialPosts]);

  // Handle publishing a new post
  const handlePublishPost = (e) => {
    if (e) e.preventDefault();
    if (!composerText.trim()) return;

    if (!user) {
      openAuthModal('publish updates or duel challenges', null, 'login');
      return;
    }

    const success = publishPost({
      text: composerText,
      composerType
    });

    if (success) {
      setComposerText('');
      setComposerType('general');
    }
  };

  // Filter and enrich posts
  const filteredPosts = useMemo(() => {
    return allRawPosts
      .map(enrichPost)
      .filter(post => {
        // Filter pill check
        if (activeFilter === 'video' && post.mediaType !== 'video') return false;
        if (activeFilter === 'photo_gallery' && post.mediaType !== 'photo_gallery') return false;
        if (activeFilter === 'tournament' && post.categoryClass !== 'tournament') return false;
        if (activeFilter === 'release' && post.categoryClass !== 'text-only') return false;
        if (activeFilter === 'announcements' && post.categoryClass !== 'announcement' && post.categoryClass !== 'tournament') return false;
        if (activeFilter === 'results' && post.embed?.type !== 'match') return false;

        // Tag filter
        if (selectedTag && !post.tags?.includes(selectedTag)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title?.toLowerCase().includes(q);
          const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
          const matchAuthor = post.author?.name?.toLowerCase().includes(q);
          const matchTags = post.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchExcerpt && !matchAuthor && !matchTags) return false;
        }

        return true;
      });
  }, [allRawPosts, enrichPost, activeFilter, selectedTag, searchQuery]);

  const userInitials = profile?.name
    ? profile.name.trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase()
    : 'YOU';

  return (
    <div className={className}>
      {/* Feed Header */}
      {showHeader && (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-outfit flex items-center gap-2.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Filter Pills & Search Bar */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_PILLS.map(f => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                setSelectedTag(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id && !selectedTag
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-slate-600 border border-border hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input & Active Tag bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search feed by keyword, player, or #hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {selectedTag && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold">
              <span>Filter: {selectedTag}</span>
              <button 
                onClick={() => setSelectedTag(null)}
                className="ml-1 hover:text-primary-dark cursor-pointer p-0.5"
                aria-label="Remove filter"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Composer Card */}
      {showComposer && (
        user ? (
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {userInitials}
              </div>
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePublishPost(e)}
                placeholder={
                  composerType === 'challenge' 
                    ? "Issue an open duel challenge: Specify subject, timer, and rules..."
                    : composerType === 'score'
                    ? "Share a verified test score or leaderboard breakthrough..."
                    : "Share a match update, issue a challenge, or post an institutional announcement..."
                }
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-primary focus:bg-card transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComposerType(composerType === 'challenge' ? 'general' : 'challenge')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    composerType === 'challenge'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-border'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Challenge Contender
                </button>

                <button
                  type="button"
                  onClick={() => setComposerType(composerType === 'score' ? 'general' : 'score')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    composerType === 'score'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-border'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Attach Score Card
                </button>
              </div>

              <button
                onClick={handlePublishPost}
                disabled={!composerText.trim()}
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-extrabold px-5 py-2 rounded-full text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                Publish Post →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-amber-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-base shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 font-outfit">
                  Join the SS4 Contender Stream
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Sign in to post updates, issue 1v1 duel challenges, and react to live tournament broadcasts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('publish posts and issue challenges', null, 'login')}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Sign In to Post →
            </button>
          </div>
        )
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-foreground">No feed posts matched your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset filter pills to view all updates.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <FeedCard
              key={post.id}
              post={post}
              onToggleLike={toggleLike}
              onToggleBookmark={toggleBookmark}
              onAddComment={addComment}
              onPlayVideo={(p) => setActiveVideoModal(p)}
              onSelectTag={(tag) => setSelectedTag(tag)}
            />
          ))
        )}
      </div>

      {/* Interactive Video Playback Modal */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-extrabold text-xs uppercase tracking-wider">
                  HD Stream Replay
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  • {activeVideoModal.videoMeta?.duration || '03:45'}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>

            {/* Video Player Display Area */}
            <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden group">
              {activeVideoModal.videoMeta?.thumbnail && (
                <img 
                  src={activeVideoModal.videoMeta.thumbnail} 
                  alt={activeVideoModal.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[#7C3AED]/90 text-white flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-8 h-8 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-white font-extrabold text-sm sm:text-base max-w-md">
                  {activeVideoModal.title}
                </div>
                <div className="text-xs text-purple-300 font-medium">
                  Streaming {activeVideoModal.videoMeta?.views || '4.8k'} contender views
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4"></div>
              </div>
            </div>

            {/* Video Footer info */}
            <div className="p-4 pt-0 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeVideoModal.excerpt}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Contender Feed • SAS Broadcast Engine</span>
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Done Watching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
