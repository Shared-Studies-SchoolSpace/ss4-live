import React, { useState } from 'react';

export function FeedCardActions({ 
  likes = 0, 
  commentsCount = 0, 
  isLiked = false, 
  isBookmarked = false, 
  onToggleLike, 
  onToggleComments, 
  onToggleBookmark,
  shareTitle = 'SS4 Feed Post'
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="feed-card-footer">
      <div className="action-group">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={onToggleLike}
          aria-label="Like post"
          title={isLiked ? "Unlike" : "Like"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likes}</span>
        </button>

        <button 
          className="action-btn"
          onClick={onToggleComments}
          aria-label="Comments"
          title="Toggle comments"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{commentsCount}</span>
        </button>

        <button 
          className="action-btn" 
          onClick={handleShare}
          aria-label="Share"
          title="Share post"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      <button 
        className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
        onClick={onToggleBookmark}
        aria-label="Bookmark post"
        title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
