import React, { useState } from 'react';
import { MultimediaPost } from './MultimediaPost';
import { TextPost } from './TextPost';

export function FeedCard({ post, onPlayVideo, onSelectTag }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(prev => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(prev => !prev);
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleAddComment = (text) => {
    setComments(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        avatar: 'ME',
        avatarBg: '#1A56C4',
        avatarColor: '#FFFFFF',
        authorName: 'You (Contender)',
        time: 'Just now',
        text
      }
    ]);
  };

  const enrichedPost = {
    ...post,
    likesCount,
    commentsCount: comments.length,
    comments
  };

  // If post has multimedia type (video, photo_gallery, banner, poster, image) or postType is multimedia
  const isMultimedia = post.postType === 'multimedia' || 
    ['video', 'photo_gallery', 'banner', 'poster', 'image'].includes(post.mediaType);

  if (isMultimedia) {
    return (
      <MultimediaPost
        post={enrichedPost}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        showComments={showComments}
        onToggleLike={handleToggleLike}
        onToggleBookmark={handleToggleBookmark}
        onToggleComments={handleToggleComments}
        onAddComment={handleAddComment}
        onPlayVideo={onPlayVideo}
        onSelectTag={onSelectTag}
      />
    );
  }

  return (
    <TextPost
      post={enrichedPost}
      isLiked={isLiked}
      isBookmarked={isBookmarked}
      showComments={showComments}
      onToggleLike={handleToggleLike}
      onToggleBookmark={handleToggleBookmark}
      onToggleComments={handleToggleComments}
      onAddComment={handleAddComment}
      onSelectTag={onSelectTag}
    />
  );
}

export { MultimediaPost, TextPost };
