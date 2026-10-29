import React, { useState, useRef, useEffect, useMemo, useId } from 'react';

/**
 * FormattedFeedText component renders Markdown + Rich HTML formatting
 * for feed posts and community updates, with an intelligent 'See more'
 * truncation indicator for long posts.
 * - Strips emojis
 * - Formats headings, bold, italic, and bullet lists
 * - Eliminates redundant line breaks around block elements
 * - Ensures tight, readable line spacing
 * - Detects posts longer than threshold and adds an accessible 'See more' / 'Show less' indicator
 */
export function FormattedFeedText({
  text,
  className = "feed-card-excerpt",
  collapsible = true,
  maxCollapsedHeight = 125,
  charThreshold = 240,
  lineThreshold = 3,
  isExpanded: controlledExpanded,
  onToggleExpand
}) {
  const contentId = useId();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const contentRef = useRef(null);
  const containerRef = useRef(null);

  // Heuristic check based on character length or line count
  const isLikelyLong = useMemo(() => {
    if (typeof text !== 'string') return false;
    const lines = (text.match(/\n/g) || []).length;
    return text.length > charThreshold || lines >= lineThreshold;
  }, [text, charThreshold, lineThreshold]);

  const [hasDomOverflow, setHasDomOverflow] = useState(false);

  // Exact DOM measurement for responsiveness across screen sizes
  useEffect(() => {
    if (!collapsible || !contentRef.current) return;

    const checkOverflow = () => {
      if (contentRef.current) {
        const scrollH = contentRef.current.scrollHeight;
        const overflowsHeight = scrollH > maxCollapsedHeight + 18;
        setHasDomOverflow(prev => (prev !== overflowsHeight ? overflowsHeight : prev));
      }
    };

    const rafId = requestAnimationFrame(checkOverflow);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && contentRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [collapsible, maxCollapsedHeight, text]);

  const isOverflowing = collapsible && (isLikelyLong || hasDomOverflow);

  const handleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(true);
    } else {
      setInternalExpanded(true);
    }
  };

  const handleCollapse = () => {
    if (onToggleExpand) {
      onToggleExpand(false);
    } else {
      setInternalExpanded(false);
    }

    // Smart scroll restore: if post header is scrolled out of viewport, glide back to top of post
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 80) {
        const targetY = window.pageYOffset + rect.top - 120;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }
  };

  const parseMarkdown = (str) => {
    if (typeof str !== 'string') return '';
    let parsed = str;

    // 1. Strip emojis safely
    parsed = parsed.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D|\u20E3/gu, '');
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
      /^\s*[•\-*]\s+(.*$)/gim,
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

  if (!text) return null;

  const htmlContent = parseMarkdown(text);
  const shouldTruncate = collapsible && isOverflowing && !isExpanded;

  return (
    <div className="feed-expandable-text-wrapper" ref={containerRef}>
      <div 
        id={contentId}
        ref={contentRef}
        className={`feed-markdown-body ${className} ${shouldTruncate ? 'feed-text-truncated' : ''} ${isExpanded ? 'feed-text-expanded' : ''}`}
        style={shouldTruncate ? { maxHeight: `${maxCollapsedHeight}px` } : undefined}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {shouldTruncate && (
        <div className="feed-see-more-bar">
          <div className="feed-see-more-fade" aria-hidden="true" onClick={handleExpand} />
          <button
            type="button"
            className="feed-see-more-btn"
            onClick={handleExpand}
            aria-expanded="false"
            aria-controls={contentId}
            aria-label="See full post text"
          >
            <span>See more</span>
            <svg 
              className="feed-chevron-icon" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {collapsible && isOverflowing && isExpanded && (
        <div className="feed-show-less-bar">
          <button
            type="button"
            className="feed-show-less-btn"
            onClick={handleCollapse}
            aria-expanded="true"
            aria-controls={contentId}
            aria-label="Collapse post text"
          >
            <span>Show less</span>
            <svg 
              className="feed-chevron-icon" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
