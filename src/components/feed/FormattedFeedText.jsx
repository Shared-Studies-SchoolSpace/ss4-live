import React from 'react';

/**
 * FormattedFeedText component renders Markdown + Rich HTML formatting
 * for feed posts and community updates.
 */
export function FormattedFeedText({ text, className = "feed-card-excerpt" }) {
  if (!text) return null;

  const parseMarkdown = (str) => {
    if (typeof str !== 'string') return '';
    let parsed = str;

    // Headings
    parsed = parsed.replace(/^### (.*$)/gim, '<h3 class="feed-markdown-h3">$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2 class="feed-markdown-h2">$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1 class="feed-markdown-h1">$1</h1>');

    // Bold & Italic
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    parsed = parsed.replace(/^\s*•\s*(.*$)/gim, '<div class="feed-markdown-bullet">• $1</div>');

    // Convert newlines outside tags into <br/>
    parsed = parsed.replace(/\n/g, '<br/>');

    return parsed;
  };

  const htmlContent = parseMarkdown(text);

  return (
    <div 
      className={`feed-markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
