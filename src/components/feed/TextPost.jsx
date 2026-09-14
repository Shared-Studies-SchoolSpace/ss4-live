import React from 'react';
import { FeedCardActions } from './FeedCardActions';
import { FeedCardComments } from './FeedCardComments';
import './feedStyles.css';

export function TextPost({
  post,
  isLiked,
  isBookmarked,
  showComments,
  onToggleLike,
  onToggleBookmark,
  onToggleComments,
  onAddComment,
  onSelectTag
}) {
  const {
    categoryLabel = 'System Release',
    categoryClass = 'text-only',
    author = {},
    title,
    excerpt,
    tags = [],
    likesCount = 0,
    commentsCount = 0,
    comments = [],
    isUnread = false,
    embed = null
  } = post;

  return (
    <article className={`feed-card ${isUnread ? 'unread' : ''}`}>
      <div className="feed-card-body">
        <div className="feed-card-author">
          <div className="author-info">
            <div 
              className="author-avatar" 
              style={{ background: author.avatarBg || '#0F172A', color: author.avatarColor || '#FFFFFF' }}
            >
              {author.avatarImg ? (
                <img src={author.avatarImg} alt={author.name} />
              ) : (
                author.avatar || 'DEV'
              )}
            </div>
            <div className="author-meta">
              <div className="author-name">
                {author.name || 'Engineering Team'}
                {author.badge && (
                  <span 
                    className="author-badge" 
                    style={author.badgeStyle || { background: '#fef3c7', color: '#b45309' }}
                  >
                    {author.badge}
                  </span>
                )}
              </div>
              <div className="author-time">{author.time || 'Yesterday at 4:30 PM'}</div>
            </div>
          </div>

          <div className={`feed-card-category-tag ${categoryClass}`} style={{ position: 'static' }}>
            <span>{categoryLabel}</span>
          </div>
        </div>

        <h2 className="feed-card-title">{title}</h2>
        <p className="feed-card-excerpt">{excerpt}</p>

        {/* Optional Embed Section */}
        {embed && (
          <div className={`feed-embed-card ${
            embed.type === 'match' ? 'feed-embed-match' :
            embed.type === 'lobby' ? 'feed-embed-lobby' : 'feed-embed-challenge'
          }`}>
            <div className="flex items-center gap-3">
              {embed.metric && (
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                  {embed.metric}
                </div>
              )}
              {embed.badge && (
                <span className="font-mono text-xs font-black bg-foreground text-white px-2.5 py-1 rounded-md shrink-0">
                  {embed.badge}
                </span>
              )}
              <div>
                <div className="font-extrabold text-xs text-foreground">{embed.title}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{embed.subtitle}</div>
              </div>
            </div>
            {embed.actionLabel && (
              <button 
                onClick={embed.onAction || (() => alert(`Action: ${embed.actionLabel}`))}
                className="feed-embed-action-btn bg-primary hover:bg-primary-hover text-primary-foreground shrink-0"
              >
                {embed.actionLabel}
              </button>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="feed-card-tags">
            {tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="tag-chip" 
                onClick={() => onSelectTag && onSelectTag(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <FeedCardActions
          postId={post.id || id}
          likes={likesCount}
          commentsCount={commentsCount}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          onToggleLike={onToggleLike}
          onToggleComments={onToggleComments}
          onToggleBookmark={onToggleBookmark}
          shareTitle={title}
        />
      </div>

      {showComments && (
        <FeedCardComments comments={comments} onAddComment={onAddComment} />
      )}
    </article>
  );
}
