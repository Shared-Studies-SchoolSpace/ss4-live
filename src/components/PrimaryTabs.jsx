import React from 'react';

/**
 * Primary Outer Page Tabs Component (DESIGN.md 5.2)
 * Mandatory layout for top-level outer page section navigation across SS4.
 * Example tabs: "Tables | Fixtures | Knockout Bracket | Results | Rules & Schedule | Admin"
 *
 * @param {Array} tabs - Array of tab objects: [{ id: 'table', label: 'Table', icon: <SvgIcon />, badge: 'Live' }]
 * @param {string} activeTab - The currently active tab ID
 * @param {function} onChange - Callback function called with selected tab ID when a tab is clicked
 * @param {string} className - Additional container wrapper classes
 * @param {boolean} sticky - Whether the tab bar should be sticky on scroll (default: true)
 * @param {string} stickyTop - Top offset class for sticky positioning (default: 'top-16 lg:top-20')
 */
export default function PrimaryTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  sticky = true,
  stickyTop = 'top-16 lg:top-20'
}) {
  return (
    <div 
      className={`${sticky ? `sticky ${stickyTop} z-40` : ''} bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-3 sm:px-6 md:px-12 lg:px-16 shadow-xs ${className}`}
    >
      <div className="max-w-5xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar touch-pan-x py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange && onChange(tab.id)}
              className={`min-h-[48px] px-3.5 py-3 font-space font-black whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-2 text-sm sm:text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-t-xl ${
                isActive
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                  : 'border-transparent text-gray-500 hover:text-[#111111] hover:bg-gray-50/50'
              }`}
            >
              {tab.icon && (
                <span className={isActive ? 'text-brand-primary' : 'text-gray-400'}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                  isActive ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
