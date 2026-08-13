import React, { useEffect } from 'react';

/**
 * SS4 Unified Modal Frame Component (DESIGN.md 5.9)
 * Standardized overlay frame with backdrop blur, rounded-3xl container, and Escape listener.
 *
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {function} onClose - Callback invoked when close button or backdrop is clicked
 * @param {string} title - Main modal title in Space Grotesk ExtraBold
 * @param {string} subtitle - Optional eyebrow / subtitle text
 * @param {string} maxWidth - Tailwind max-width class (default: 'max-w-2xl')
 * @param {React.ReactNode} children - Modal body content
 * @param {string} variant - 'light' | 'dark'
 * @param {string} className - Additional custom classes
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-2xl',
  children,
  variant = 'light',
  className = '',
  ...props
}) {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = variant === 'dark';

  return (
    <div 
      className="fixed inset-0 bg-[#111111]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      <div 
        className={`w-full ${maxWidth} rounded-3xl border shadow-2xl transition-all my-8 ${
          isDark 
            ? 'bg-[#0B192C] border-white/15 text-white' 
            : 'bg-white border-[#EAEAEA] text-[#111111]'
        } ${className}`}
      >
        {/* Header Bar */}
        {(title || subtitle) && (
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-white/10' : 'border-[#EAEAEA]'
          }`}>
            <div>
              {subtitle && (
                <span className={`text-[10px] font-space font-extrabold uppercase tracking-widest block mb-1 ${
                  isDark ? 'text-blue-300' : 'text-[#1A56C4]'
                }`}>
                  {subtitle}
                </span>
              )}
              {title && (
                <h3 className="font-space font-black text-xl sm:text-2xl leading-tight">
                  {title}
                </h3>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-white/10 hover:bg-white/20 text-white/80' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
