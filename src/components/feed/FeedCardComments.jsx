import React, { useState } from 'react';
import { useAuth } from '../../features/auth-portal/hooks/useAuth';
import { useAuthModal } from '../../features/auth-portal/context/AuthModalContext';

export function FeedCardComments({ comments = [], onAddComment }) {
  const { user, profile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      openAuthModal('join the discussion and leave a comment', () => {
        if (onAddComment) onAddComment(newComment.trim());
      }, 'login');
      return;
    }

    if (onAddComment) {
      onAddComment(newComment.trim());
    }
    setNewComment('');
  };

  const handleGuestInputClick = () => {
    if (!user) {
      openAuthModal('join the discussion and leave a comment', null, 'login');
    }
  };

  const userInitials = profile?.name
    ? profile.name.trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase()
    : 'YOU';

  return (
    <div className="comments-section">
      {comments.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-2 text-center">
          No comments yet. Be the first contender to share your thoughts!
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((item, idx) => (
            <div key={item.id || idx} className="comment-item">
              <div 
                className="comment-avatar" 
                style={{ backgroundColor: item.avatarBg || '#1E3A8A', color: item.avatarColor || '#FFFFFF' }}
              >
                {item.avatar || 'U'}
              </div>
              <div className="comment-content">
                <div className="flex items-center justify-between gap-2">
                  <span className="comment-author-name">{item.authorName}</span>
                  {item.time && <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>}
                </div>
                <div className="comment-text">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="comment-input-row">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center shrink-0">
            {userInitials}
          </div>
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
      ) : (
        <div className="mt-2 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-center sm:text-left">
            <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Sign in to join the conversation and leave a comment.</span>
          </div>
          <button
            type="button"
            onClick={handleGuestInputClick}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
          >
            Sign In to Comment
          </button>
        </div>
      )}
    </div>
  );
}
