import React from 'react';

/**
 * FormattedFeedText component renders Markdown + Rich HTML formatting
 * for feed posts and community updates.
 * - Strips emojis
 * - Formats headings, bold, italic, and bullet lists
 * - Eliminates redundant line breaks around block elements
 * - Ensures tight, readable line spacing
 */
export function FormattedFeedText({ text, className = "feed-card-excerpt" }) {
  if (!text) return null;

  const parseMarkdown = (str) => {
    if (typeof str !== 'string') return '';
    let parsed = str;

    // 1. Strip emojis
    parsed = parsed.replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]/gu, '');
    // Clean trailing/leading spaces on lines left by removed emojis
    parsed = parsed.replace(/^[ \t]+(?=[^\s])/gm, '');

    // 2. Headings
    parsed = parsed.replace(/^### (.*$)/gim, '<h3 class="feed-markdown-h3">$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2 class="feed-markdown-h2">$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1 class="feed-markdown-h1">$1</h1>');

    // 3. Bold & Italic
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 4. Bullet points (tight layout with bullet dot & text)
    parsed = parsed.replace(
      /^\s*[•\-\*]\s+(.*$)/gim,
      '<div class="feed-markdown-bullet"><span class="feed-bullet-point">•</span><span class="feed-bullet-text">$1</span></div>'
    );

    // 5. Replace paragraph breaks (2 or more newlines) with a single controlled tight spacer
    parsed = parsed.replace(/\n{2,}/g, '<div class="feed-markdown-gap"></div>');

    // 6. Clean newlines directly preceding or following block tags to avoid extra spacing
    parsed = parsed.replace(/(<\/(?:h[1-6]|div|p|ul|li)>)\n+/gi, '$1');
    parsed = parsed.replace(/\n+(<(?:h[1-6]|div|p|ul|li)[^>]*>)/gi, '$1');

    // 7. Single newlines within inline text become <br/>
    parsed = parsed.replace(/\n/g, '<br/>');

    // 8. Clean any accidental <br/> tags adjacent to block elements
    parsed = parsed.replace(/(<\/(?:h[1-6]|div|p|ul|li)>)<br\s*\/?>/gi, '$1');
    parsed = parsed.replace(/<br\s*\/?>\s*(<(?:h[1-6]|div|p|ul|li)[^>]*>)/gi, '$1');

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
