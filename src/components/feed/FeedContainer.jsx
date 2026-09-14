import React, { useState } from 'react';
import { FeedCard } from './FeedCard';
import { INITIAL_FEED_POSTS } from './feedData';
import './feedStyles.css';

const FILTER_PILLS = [
  { id: 'all', label: 'All Activity' },
  { id: 'video', label: 'Video Highlights 🎥', mediaType: 'video' },
  { id: 'photo_gallery', label: 'Photo Galleries 📸', mediaType: 'photo_gallery' },
  { id: 'tournament', label: 'Tournaments 🏆', categoryClass: 'tournament' },
  { id: 'release', label: 'Release Notes ⚡', categoryClass: 'text-only' }
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
  const [posts, setPosts] = useState(initialPosts);
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

  // Handle publishing a new post
  const handlePublishPost = (e) => {
    if (e) e.preventDefault();
    if (!composerText.trim()) return;

    let newPost;
    if (composerType === 'challenge') {
      newPost = {
        id: `post_${Date.now()}`,
        postType: 'text',
        categoryLabel: '🎯 Duel Challenge',
        categoryClass: 'announcement',
        isUnread: true,
        author: {
          name: 'You (Contender)',
          avatar: 'ME',
          avatarBg: '#1A56C4',
          avatarColor: '#FFFFFF',
          badge: 'ACTIVE',
          badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
          time: 'Just now'
        },
        title: 'Open 1v1 Challenge Issued!',
        excerpt: composerText,
        tags: ['#ContenderChallenge', '#SS4Duel', '#OpenMatch'],
        likesCount: 1,
        isLiked: true,
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
        id: `post_${Date.now()}`,
        postType: 'multimedia',
        mediaType: 'banner',
        categoryLabel: '🏆 Score Card',
        categoryClass: 'tournament',
        readTime: '1 min read',
        isUnread: true,
        author: {
          name: 'You (Contender)',
          avatar: 'ME',
          avatarBg: '#1A56C4',
          avatarColor: '#FFFFFF',
          badge: 'VERIFIED',
          badgeStyle: { background: '#DCFCE7', color: '#15803D' },
          time: 'Just now'
        },
        title: 'New Personal Best Score Recorded!',
        excerpt: composerText,
        tags: ['#ScoreCard', '#SASMastery', '#Leaderboard'],
        likesCount: 1,
        isLiked: true,
        isBookmarked: false,
        bannerMeta: {
          graphic: '🎯⚡',
          bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200'
        },
        embed: {
          type: 'match',
          metric: '98%',
          title: 'SAS Practice Session Result',
          subtitle: 'Mastery Accuracy: 98% · Speed: 14.2s/Q',
          actionLabel: 'View Breakdown →'
        },
        comments: []
      };
    } else {
      newPost = {
        id: `post_${Date.now()}`,
        postType: 'text',
        categoryLabel: '📢 Community Post',
        categoryClass: 'update',
        isUnread: true,
        author: {
          name: 'You (Contender)',
          avatar: 'ME',
          avatarBg: '#1A56C4',
          avatarColor: '#FFFFFF',
          badge: 'CONTENDER',
          badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
          time: 'Just now'
        },
        title: 'Community Update',
        excerpt: composerText,
        tags: ['#Community', '#SS4League'],
        likesCount: 1,
        isLiked: true,
        isBookmarked: false,
        comments: []
      };
    }

    setPosts([newPost, ...posts]);
    setComposerText('');
    setComposerType('general');
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Filter pill check
    if (activeFilter === 'video' && post.mediaType !== 'video') return false;
    if (activeFilter === 'photo_gallery' && post.mediaType !== 'photo_gallery') return false;
    if (activeFilter === 'tournament' && post.categoryClass !== 'tournament') return false;
    if (activeFilter === 'release' && post.categoryClass !== 'text-only') return false;
    if (activeFilter === 'announcements' && post.categoryClass !== 'announcement' && post.categoryClass !== 'tournament') return false;
    if (activeFilter === 'results' && post.embed?.type !== 'match') return false;

    // Tag filter
    if (selectedTag && !post.tags.includes(selectedTag)) return false;

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

  return (
    <div className={className}>
      {/* Feed Header */}
      {showHeader && (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-outfit flex items-center gap-2.5">
            <span className="text-[#1A56C4]">📰</span> {title}
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
                  ? 'bg-[#1A56C4] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#1A56C4] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {selectedTag && (
            <div className="flex items-center gap-1.5 bg-blue-100 text-[#1A56C4] px-3 py-1.5 rounded-xl text-xs font-bold">
              <span>Filter: {selectedTag}</span>
              <button 
                onClick={() => setSelectedTag(null)}
                className="ml-1 hover:text-blue-900"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Composer Card */}
      {showComposer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A56C4] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
              YOU
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] outline-none focus:border-[#1A56C4] focus:bg-white transition-all"
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
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200'
                }`}
              >
                ⚔️ Challenge Contender
              </button>

              <button
                type="button"
                onClick={() => setComposerType(composerType === 'score' ? 'general' : 'score')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  composerType === 'score'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200'
                }`}
              >
                🎯 Attach Score Card
              </button>
            </div>

            <button
              onClick={handlePublishPost}
              disabled={!composerText.trim()}
              className="w-full sm:w-auto bg-[#1A56C4] hover:bg-[#0F3BA1] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold px-5 py-2 rounded-full text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              Publish Post →
            </button>
          </div>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-base font-extrabold text-[#0F172A]">No feed posts matched your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset filter pills to view all updates.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="px-4 py-2 bg-[#1A56C4] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <FeedCard
              key={post.id}
              post={post}
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
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 cursor-pointer"
              >
                ✕ Close
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
              
              {/* Simulated active player animation */}
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
                  className="bg-[#1A56C4] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
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
