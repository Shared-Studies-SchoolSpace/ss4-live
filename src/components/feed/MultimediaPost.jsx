import React from 'react';
import { FeedCardActions } from './FeedCardActions';
import { FeedCardComments } from './FeedCardComments';
import './feedStyles.css';

export function MultimediaPost({
  post,
  isLiked,
  isBookmarked,
  showComments,
  onToggleLike,
  onToggleBookmark,
  onToggleComments,
  onAddComment,
  onPlayVideo,
  onSelectTag
}) {
  const {
    mediaType = 'banner', // 'video' | 'photo_gallery' | 'banner'
    readTime,
    author = {},
    title,
    excerpt,
    tags = [],
    likesCount = 0,
    commentsCount = 0,
    comments = [],
    isUnread = false,
    videoMeta = {},
    photoMeta = {},
    bannerMeta = {},
    embed = null
  } = post;

  const handleVideoClick = () => {
    if (onPlayVideo) {
      onPlayVideo(post);
    } else {
      alert(`Playing: ${title}`);
    }
  };

  const renderMedia = () => {
    if (mediaType === 'video') {
      return (
        <div className="video-container" onClick={handleVideoClick} role="button" tabIndex={0}>
          {videoMeta.thumbnail && (
            <img src={videoMeta.thumbnail} alt={title} className="video-bg-img" />
          )}

          <div className="video-thumbnail-graphic">
            {!videoMeta.thumbnail && (
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚔️🎓</div>
            )}
            <div className="play-button-ring">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <div className="video-views-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {videoMeta.views || '4.8k'} views
          </div>

          <div className="video-duration-badge">
            <span>{videoMeta.duration || '03:45'}</span>
          </div>

          <div className="video-progress-bar">
            <div className="video-progress-fill" style={{ width: videoMeta.progress || '45%' }} />
          </div>
        </div>
      );
    }

    if (mediaType === 'photo_gallery') {
      const images = photoMeta.images || [];
      const mainImg = images[0] || photoMeta.mainImage;
      const sideImg1 = images[1] || photoMeta.sideImage1;
      const sideImg2 = images[2] || photoMeta.sideImage2;

      return (
        <div className="photo-grid-container">
          <div className="photo-cell main-photo">
            {mainImg ? (
              <img src={mainImg} alt={`${title} 1`} />
            ) : (
              <div className="photo-illustration">🏛️🥇</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="photo-cell side-photo-1" style={{ flex: 1 }}>
              {sideImg1 ? (
                <img src={sideImg1} alt={`${title} 2`} />
              ) : (
                <span style={{ fontSize: '28px' }}>🏆</span>
              )}
            </div>
            <div className="photo-cell side-photo-2" style={{ flex: 1 }}>
              {sideImg2 ? (
                <img src={sideImg2} alt={`${title} 3`} />
              ) : (
                <div style={{ background: '#1e293b', width: '100%', height: '100%' }} />
              )}
              <div className="photo-overlay-count">{photoMeta.remainingCount || '+4'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (mediaType === 'poster' || mediaType === 'image') {
      const posterSrc = post.imageUrl || post.posterImage || (post.posterMeta && post.posterMeta.src);
      return (
        <div 
          className="feed-card-poster-container"
          onClick={() => posterSrc && window.open(posterSrc, '_blank')}
          title="Click to view full poster"
        >
          {posterSrc && (
            <img src={posterSrc} alt={title} className="feed-card-poster-img" />
          )}
          {readTime && <div className="feed-card-readtime">{readTime}</div>}
        </div>
      );
    }

    // Default banner mode
    return (
      <div className="feed-card-banner">
        {bannerMeta.bgImage && (
          <img src={bannerMeta.bgImage} alt={title} className="feed-card-banner-bg" />
        )}
        <div className="feed-card-banner-graphic">{bannerMeta.graphic || '🏆⚔️'}</div>
        {readTime && <div className="feed-card-readtime">{readTime}</div>}
      </div>
    );
  };

  return (
    <article className={`feed-card ${isUnread ? 'unread' : ''}`}>
      {renderMedia()}

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
                </div>
              </>
            ) : (
              <>
                <div className="author-avatar" style={{ background: author.avatarBg || '#1A56C4', color: author.avatarColor || '#FFFFFF' }}>
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
                      <span className="author-badge" style={author.badgeStyle}>
                        {author.badge}
                      </span>
                    )}
                  </div>
                  {author.time && <div className="author-time">{author.time}</div>}
                </div>
              </>
            )}
          </div>
        </div>

        <h2 className="feed-card-title">{title}</h2>
        <p className="feed-card-excerpt">{excerpt}</p>

        {/* Optional Embed Section (Match result, Lobby, or Challenge) */}
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
