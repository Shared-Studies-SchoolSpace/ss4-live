import React, { useState } from 'react';

export function FeedCardComments({ comments = [], onAddComment }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(newComment.trim());
    }
    setNewComment('');
  };

  return (
    <div className="comments-section">
      {comments.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-1 text-center">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        comments.map((item, idx) => (
          <div key={item.id || idx} className="comment-item">
            <div className="comment-avatar" style={{ backgroundColor: item.avatarBg, color: item.avatarColor }}>
              {item.avatar || 'U'}
            </div>
            <div className="comment-content">
              <div className="flex items-center justify-between">
                <span className="comment-author-name">{item.authorName}</span>
                {item.time && <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>}
              </div>
              <div className="comment-text">{item.text}</div>
            </div>
          </div>
        ))
      )}

      <form onSubmit={handleSubmit} className="comment-input-row">
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="comment-send-btn" disabled={!newComment.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
