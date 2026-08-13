import React from 'react';

/**
 * Secondary Inner Page Segmented Tabs Component (DESIGN.md 5.3)
 * Mandatory layout for inner view switching inside cards, panels, or nested views.
 * Example tabs: "Tables | Knockout Matrix | Fixtures" or "Move Ledger | Live Chat"
 *
 * @param {Array} tabs - Array of tab items: [{ id: 'table', label: 'Table', icon: <SvgIcon /> }] or ['Table', 'Fixtures']
 * @param {string} activeTab - The currently active tab ID
 * @param {function} onChange - Callback function called with selected tab ID when clicked
 * @param {string} className - Additional container wrapper classes
 * @param {boolean} fullWidth - Whether tabs should expand evenly across the container (default: true)
 */
export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  fullWidth = true
}) {
  return (
    <div className={`m3-segmented-container ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id;
        const label = typeof tab === 'string' ? tab : tab.label;
        const icon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange && onChange(id)}
            className={`m3-segmented-item ${isActive ? 'active' : ''} ${fullWidth ? 'flex-1' : ''}`}
          >
            {icon && <span className="shrink-0 flex items-center">{icon}</span>}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
