import React, { useState } from 'react';
import { MultimediaPost } from './MultimediaPost';
import { TextPost } from './TextPost';

export function FeedCard({ 
  post, 
  onPlayVideo, 
  onSelectTag,
  onToggleLike,
  onToggleBookmark,
  onAddComment
}) {
  const [showComments, setShowComments] = useState(false);

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const isMultimedia = post?.postType === 'multimedia' || 
    ['video', 'photo_gallery', 'banner', 'poster', 'image'].includes(post?.mediaType);

  if (isMultimedia) {
    return (
      <MultimediaPost
        post={post}
        isLiked={post?.isLiked}
        isBookmarked={post?.isBookmarked}
        showComments={showComments}
        onToggleLike={() => onToggleLike && onToggleLike(post.id)}
        onToggleBookmark={() => onToggleBookmark && onToggleBookmark(post.id)}
        onToggleComments={handleToggleComments}
        onAddComment={(text) => onAddComment && onAddComment(post.id, text)}
        onPlayVideo={onPlayVideo}
        onSelectTag={onSelectTag}
      />
    );
  }

  return (
    <TextPost
      post={post}
      isLiked={post?.isLiked}
      isBookmarked={post?.isBookmarked}
      showComments={showComments}
      onToggleLike={() => onToggleLike && onToggleLike(post.id)}
      onToggleBookmark={() => onToggleBookmark && onToggleBookmark(post.id)}
      onToggleComments={handleToggleComments}
      onAddComment={(text) => onAddComment && onAddComment(post.id, text)}
      onSelectTag={onSelectTag}
    />
  );
}

export { MultimediaPost, TextPost };
