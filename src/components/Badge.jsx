import React from 'react';

/**
 * SS4 Unified Badge / Eyebrow / Chip Component (DESIGN.md 5.8)
 * Standardized micro-label tags, category chips, status pills, and ELO badges.
 * Strictly adheres to light-surface contrast guidelines (no neon colors or dark masks).
 *
 * @param {string} variant - 'primary' | 'accent' | 'neutral' | 'secondary' | 'live' | 'elo' | 'success'
 * @param {string} size - 'sm' | 'md'
 * @param {React.ReactNode} children - Badge label content
 * @param {React.ReactNode} icon - Optional leading icon
 * @param {string} className - Additional custom classes
 */
export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-space uppercase tracking-wider select-none font-extrabold whitespace-nowrap';

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 rounded',
    md: 'text-xs px-3 py-1 rounded-md'
  };

  const variants = {
    // Primary Varsity Blue Tag
    primary: 'bg-[#1A56C4] text-white border border-transparent shadow-xs',

    // Soft Primary Tint Tag
    'primary-subtle': 'bg-[#1A56C4]/10 text-[#1A56C4] border border-[#1A56C4]/20',

    // Championship Orange Tag (WCAG AA Safe)
    accent: 'bg-[#B84D00] text-white border border-transparent shadow-xs',

    // Soft Orange Tint Tag
    'accent-subtle': 'bg-[#FFEEDB] text-[#2E0E00] border border-[#B84D00]/30',

    // Neutral Pure White Surface Chip
    neutral: 'bg-white text-[#111111] border border-[#CCCCCC]',

    // Secondary Surface Gray Chip
    secondary: 'bg-[#F0EEEA] text-gray-700 border border-gray-300',

    // Live Indicator Badge (with solid red dot indicator)
    live: 'bg-red-50 text-red-700 border border-red-200 rounded-full',

    // ELO Rating Badge
    elo: 'bg-brand-primary/10 text-[#1A56C4] border border-brand-primary/20 rounded-md text-[10px] py-0.5 px-2 font-bold',

    // Success / Qualified Status Badge
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full'
  };

  const currentStyles = `${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.neutral} ${className}`;

  return (
    <span className={currentStyles} {...props}>
      {variant === 'live' && (
        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
