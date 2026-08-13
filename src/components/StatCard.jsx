import React from 'react';

/**
 * SS4 Unified StatCard / HeroStatPill Component (DESIGN.md 4 & 5.5)
 * Standardized card for high-level league metrics, arena totals, and tournament statistics.
 *
 * @param {string} label - Micro-label title (e.g., "Arenas Played", "Total Registered")
 * @param {string|number} value - Main numerical stat value (e.g., 42, "128", "82.4%")
 * @param {React.ReactNode} icon - Optional icon node
 * @param {string} trend - Optional trend text (e.g., "+12% this week")
 * @param {string} variant - 'light' | 'dark' | 'patch'
 * @param {string} className - Additional custom classes
 */
export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'light',
  className = '',
  ...props
}) {
  const containerVariants = {
    // Standard Outlined Varsity Card (DESIGN.md 5.5)
    light: 'varsity-card p-5 bg-white border border-[#EAEAEA]',

    // Dark Hero Metric Container
    dark: 'bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md text-white',

    // Stitched Varsity Patch Surface
    patch: 'varsity-patch p-5 rounded-2xl'
  };

  const labelVariants = {
    light: 'text-gray-500',
    dark: 'text-white/60',
    patch: 'text-[#1A56C4]'
  };

  const valueVariants = {
    light: 'text-[#111111]',
    dark: 'text-white',
    patch: 'text-[#111111]'
  };

  return (
    <div className={`${containerVariants[variant] || containerVariants.light} ${className}`} {...props}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] sm:text-xs font-space font-extrabold uppercase tracking-widest ${labelVariants[variant]}`}>
          {label}
        </p>
        {icon && (
          <span className="shrink-0 flex items-center opacity-70">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className={`font-space font-black text-2xl sm:text-3xl ${valueVariants[variant]}`}>
          {value}
        </p>
        {trend && (
          <span className="text-[11px] font-outfit font-bold text-emerald-600">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
