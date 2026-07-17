import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SS4 Unified Button Component
 * Matches "The Varsity Arena" design system (editorial typographic density, structured corners).
 * Fully accessible (WCAG AA contrast, proper keyboard navigation, ARIA attributes).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  href,
  to,
  type = 'button',
  ...props
}) {
  // Styles based on Varsity Design System (DESIGN.md)
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide select-none active:scale-[0.98] transition-all duration-180 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  // Variant styles
  const variants = {
    // Primary - Varsity Blue
    primary: 'bg-brand-primary text-white hover:bg-[#1545A2] hover:shadow-lg shadow-sm border border-transparent',
    
    // Secondary - Outlined Varsity Blue
    secondary: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-[#1A56C4]/0.06',
    
    // Accent - Championship Orange (WCAG AA safe)
    accent: 'bg-[#B84D00] text-white hover:bg-[#963F00] hover:shadow-lg shadow-sm border border-transparent',
    
    // Emerald / Success - Active/Joined States
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg shadow-sm border border-transparent',
    
    // Dark Minimal / Ghost - Semi-transparent white for dark heroes
    'white-outline': 'bg-white/10 text-white border border-white/25 hover:bg-white/20 hover:border-white/40',
    
    // Light Solid - Solid white for contrast on dark backgrounds
    'white-solid': 'bg-white text-[#111111] hover:bg-gray-100 hover:shadow-lg border border-transparent',
    
    // Minimal / Ghost - Transparent, no border, text changes on hover
    minimal: 'bg-transparent text-[#111111] hover:text-brand-primary min-h-[48px] px-4 border-none shadow-none',
  };

  // Size styles (touch-target friendly min-heights: sm=36px, md=48px, lg=54px)
  const sizes = {
    sm: 'text-xs min-h-[36px] py-1.5 px-4 rounded-lg gap-1.5',
    md: 'text-sm min-h-[48px] py-2.5 px-6 rounded-xl gap-2',
    lg: 'text-base min-h-[54px] py-3.5 px-8 rounded-2xl gap-2.5',
  };

  const currentStyles = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && Icon && iconPosition === 'left' && (
        <span className="shrink-0 flex items-center">{Icon}</span>
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <span className="shrink-0 flex items-center">{Icon}</span>
      )}
    </>
  );

  // Render react-router-dom Link
  if (to && !disabled) {
    return (
      <Link to={to} className={currentStyles} {...props}>
        {content}
      </Link>
    );
  }

  // Render normal HTML anchor
  if (href && !disabled) {
    return (
      <a href={href} className={currentStyles} {...props}>
        {content}
      </a>
    );
  }

  // Render default button
  return (
    <button
      type={type}
      className={currentStyles}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {content}
    </button>
  );
}
