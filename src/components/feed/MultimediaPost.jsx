import React from 'react';
import { FeedCardActions } from './FeedCardActions';
import { FeedCardComments } from './FeedCardComments';
import { AddToCalendarButton } from './AddToCalendarButton';
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
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 mb-2 border border-white/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
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
              <div className="photo-illustration flex items-center justify-center bg-slate-900 text-slate-400">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="photo-cell side-photo-1" style={{ flex: 1 }}>
              {sideImg1 ? (
                <img src={sideImg1} alt={`${title} 2`} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                  <svg className="w-6 h-6 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
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
        <div className="feed-card-banner-graphic">{bannerMeta.graphic || 'SS4'}</div>
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
