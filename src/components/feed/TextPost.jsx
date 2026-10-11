import React from 'react';
import { FeedCardActions } from './FeedCardActions';
import { FeedCardComments } from './FeedCardComments';
import { AddToCalendarButton } from './AddToCalendarButton';
import { FormattedFeedText } from './FormattedFeedText';
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
    categoryLabel = '',
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
            {(author.isAdmin || author.name === 'SS4' || author.badge === 'OFFICIAL ADMIN') ? (
              <>
                <div className="author-avatar" style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0' }}>
                  <img 
                    src="/ss4_logo_without_text.jpg" 
                    alt="SS4" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} 
                  />
                </div>
                <div className="author-meta">
                  <div className="author-name" style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    SS4
                  </div>
                  {author.time && <div className="author-time">{author.time}</div>}
                </div>
              </>
            ) : (
              <>
                <div 
                  className="author-avatar" 
                  style={{ background: author.avatarBg || '#0F172A', color: author.avatarColor || '#FFFFFF' }}
                >
                  {author.avatarImg ? (
                    <img src={author.avatarImg} alt={author.name} />
                  ) : (
                    author.avatar || 'ME'
                  )}
                </div>
                <div className="author-meta">
                  <div className="author-name">
                    {author.name || 'Contender'}
                    {author.badge && (
                      <span 
                        className="author-badge" 
                        style={author.badgeStyle || { background: '#fef3c7', color: '#b45309' }}
                      >
                        {author.badge}
                      </span>
                    )}
                  </div>
                  {author.time && <div className="author-time">{author.time}</div>}
                </div>
              </>
            )}
          </div>

          {!(author.isAdmin || author.name === 'SS4' || author.badge === 'OFFICIAL ADMIN') && categoryLabel && (
            <div className={`feed-card-category-tag ${categoryClass}`} style={{ position: 'static' }}>
              <span>{categoryLabel}</span>
            </div>
          )}
        </div>

        <h2 className="feed-card-title">{title}</h2>
        <FormattedFeedText text={excerpt} className="feed-card-excerpt" />

        {/* Embed Action Section (Register button + Calendar button) */}
        {embed && (
          <div className="feed-actions-stack">
            {embed.actionLabel && (
              <button 
                onClick={embed.onAction || (() => alert(`Action: ${embed.actionLabel}`))}
                className="feed-embed-action-btn bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
              >
                {embed.actionLabel}
              </button>
            )}

            <AddToCalendarButton event={embed.calendarEvent} />
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
