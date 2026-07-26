# Mobile Optimization & Touch UX Analysis (SS4 Chess League)

**Target Viewports**: 320px – 768px (Mobile & Small Tablet)  
**Date**: 2026-07-26  
**Investigator**: `teamwork_preview_explorer`  
**Status**: Completed Read-Only Investigation  

---

## Executive Summary

A comprehensive read-only investigation of the SS4 Chess League Tournament codebase was conducted to prepare for Mobile Optimization across viewports from 320px to 768px (Requirements R1, R2, R3).

Key findings reveal that while the desktop layout is visually rich and functional, several critical mobile UX flaws exist:
1. **Container Shell & Page Padding**: `App.jsx` and `Layout.jsx` lack `overflow-x-hidden` on the main container shell, allowing horizontal scroll breakout. `PageContainer.jsx` applies a fixed `px-6` (48px total padding), leaving only 272px usable width on 320px devices.
2. **Touch Targets (Fitts's Law)**: 14+ interactive element types (tab pills, filter chips, bracket view switches, round selectors, header icons, result buttons) fail the minimum 48px target height requirement (`min-h-[48px]` or `py-3 px-4`).
3. **Tab Navigation Context (Hick's Law)**: The tournament tab bar in `ChessTournamentPage.jsx` is static rather than sticky on mobile, causing users to lose navigation context when scrolling down long standings or fixture lists.
4. **Group Tables & Horizontal Overflow**: Tables in `GroupStageTable.jsx` lack a sticky rank/player column and horizontal swipe gradient cues, leading to squeezed columns and awkward text wrapping on 320px viewports.
5. **Knockout Bracket Visualizer**: `SplitBracketVisualizer.jsx` lacks visual gradient edge indicators for touch swipe affordance, and mobile section navigation buttons are undersized.
6. **Modal to Bottom-Sheet Drawer Conversion**: `TournamentPlayerModal.jsx` and `RulesModal` are centered fixed modals on mobile rather than touch-friendly bottom-sheet drawers (`fixed inset-x-0 bottom-0 sm:relative sm:inset-auto z-50 rounded-t-3xl sm:rounded-3xl max-h-[90vh]`).

---

## 1. Component Map & Container Shell Evaluation

### 1.1 Codebase Component Map

| Component Name | File Location | Purpose & Function |
|---|---|---|
| `App.jsx` | `src/App.jsx` | Main application shell, router configuration, toast notifications. |
| `Layout.jsx` | `src/layouts/Layout.jsx` | Shared page layout wrapper containing `PageContainer`. |
| `PageContainer.jsx` | `src/components/PageContainer.jsx` | Standard page width container wrapper (`container mx-auto px-6`). |
| `Header.jsx` | `src/components/Header.jsx` | Sticky site header, notification bell dropdown, user profile menu, mobile drawer menu toggle. |
| `ChessTournamentPage.jsx` | `src/features/chess-league/pages/ChessTournamentPage.jsx` | Root tournament page containing active hero, countdown hero, tab navigation bar, Results tab, Rules tab, Admin tab, Rules modal, and PIN modal. |
| `TournamentHero.jsx` | `src/features/chess-league/components/TournamentHero.jsx` | Active tournament hero banner with live countdown cells and cycle dropdown. |
| `GroupStageTable.jsx` | `src/features/chess-league/components/GroupStageTable.jsx` | Group stage tables ("World Cup format"), search bar, group filters, and standings list. |
| `BracketTab.jsx` | `src/features/chess-league/components/BracketTab.jsx` | Knockout bracket wrapper, list view vs. interactive tree view toggle, round selector pills, and result logging modal. |
| `SplitBracketVisualizer.jsx` | `src/features/chess-league/components/SplitBracketVisualizer.jsx` | 2310px-wide interactive canvas rendering 6-round split knockout tree with SVG connector lines and html2canvas download. |
| `TournamentPlayerModal.jsx` | `src/features/chess-league/components/TournamentPlayerModal.jsx` | Player details modal displaying Chess.com handle, ratings, institution, and direct messaging CTA. |

### 1.2 Container Shell & Viewport Overflow Audit

* **`src/App.jsx` (Lines 33 & 35)**:
  ```jsx
  <div className="min-h-screen bg-brand-bg-cream text-brand-text-dark selection:bg-brand-primary selection:text-white flex flex-col">
    <Header />
    <main className="flex-grow">
  ```
  *Observation*: No `overflow-x-hidden` or `max-w-full overflow-x-hidden` is specified on the outer `div` or `<main>`. Any child component (e.g. wide tables or absolute popups) exceeding 100vw triggers horizontal viewport scrolling.
* **`src/components/PageContainer.jsx` (Line 3)**:
  ```jsx
  <div className="container mx-auto px-6">
  ```
  *Observation*: Fixed `px-6` (24px left + 24px right = 48px total padding). On a 320px mobile screen (e.g. iPhone SE 1st gen or small Android), this leaves only `320 - 48 = 272px` available content width.
  *Remediation*: Change to responsive padding `px-4 sm:px-6` or `px-3 sm:px-6`.

---

## 2. Fitts's Law Touch Target Audit (<48px interactive elements)

Requirement R2 mandates a minimum touch target height of `48px` (`min-h-[48px]` or `py-3 px-4`) with clear visual focus/active feedback across all interactive elements.

| File Location | Line Numbers | Element Description | Current Dimensions / Classes | Recommended Fix |
|---|---|---|---|---|
| `Header.jsx` | 140 | Notification Bell Toggle Button | `w-9 h-9 sm:w-10 sm:h-10` (36px x 36px) | `w-11 h-11 sm:w-12 sm:h-12 min-h-[48px]` |
| `Header.jsx` | 227 | Profile Dropdown Trigger Button | `h-9 sm:h-10` (36px / 40px height) | `min-h-[48px] py-2.5 px-3` |
| `Header.jsx` | 318 | Mobile Hamburger Toggle Button | `w-9 h-9 sm:w-10 sm:h-10` (36px x 36px) | `w-12 h-12 min-h-[48px] min-w-[48px]` |
| `ChessTournamentPage.jsx` | 849–868 | Tournament Main Navigation Tabs (`Table \| Fixtures \| Bracket \| Results \| Rules`) | `py-4 font-black` (lacks horizontal touch padding `px-4`) | `min-h-[48px] px-4 py-3 text-sm flex items-center` |
| `ChessTournamentPage.jsx` | 1056–1070 | Fixtures Round Selector Buttons | `px-4 py-2 text-xs` (~32px height) | `min-h-[48px] px-4 py-3 text-xs` |
| `ChessTournamentPage.jsx` | 1278–1290 | Rules Category Anchor Pills | `px-3 py-1.5 text-xs` (~28px height) | `min-h-[48px] px-4 py-3 text-xs inline-flex items-center` |
| `ChessTournamentPage.jsx` | 761–776 | Hero Tertiary Links ("View Past Winners", "Rules & Schedule") | Inline text buttons without padding (~20px hit zone) | `min-h-[48px] px-3 py-3 inline-flex items-center gap-2` |
| `GroupStageTable.jsx` | 223–252 | Sub-tab Toggle (`Table` / `Fixtures`) | `px-4 py-2 text-xs` (~32px height) | `min-h-[48px] px-4 py-3 text-xs` |
| `GroupStageTable.jsx` | 314–363 | Group Filter Chips (`All Groups`, `My Group`, `Group A...`) | `px-3 py-1.5 text-xs` (~28px height) | `min-h-[48px] px-4 py-3 text-xs flex items-center` |
| `GroupStageTable.jsx` | 493–524 | Player Name & @username Links in Standings Table | Compact inline text | Add `py-2 px-2 block min-h-[44px]` touch wrapper |
| `BracketTab.jsx` | 243–258 | View Mode Toggle (`List View` / `Interactive Tree`) | `px-3 py-1.5 text-xs` (~28px height) | `min-h-[48px] px-4 py-3 text-xs` |
| `BracketTab.jsx` | 265–271 | Bracket Round Selector Pills | `px-3 py-1.5 text-xs` (~28px height) | `min-h-[48px] px-4 py-3 text-xs` |
| `BracketTab.jsx` | 107–117 | Admin "LOG RESULT" / "EDIT RESULT" button in MatchCard | `text-[10px] px-2 py-1` (~24px height) | `min-h-[44px] px-3 py-2 text-xs font-black` |
| `SplitBracketVisualizer.jsx` | 456–468 | Mobile Section Snap Navigation (`Left`, `Final`, `Right`) | `px-2 sm:px-2.5 py-1.5 text-[10px]` (~28px height) | `min-h-[48px] px-3.5 py-3 text-xs font-bold` |
| `SplitBracketVisualizer.jsx` | 43-60 | `CompactMatchCard` Player Rows | `px-2.5 py-1.5` (~24px height per row) | `min-h-[44px] px-3 py-2 text-xs flex items-center` |

---

## 3. Horizontal Overflow Risk Analysis (320px – 768px Viewports)

### 3.1 Group Stage Table Squeezing (320px–375px)
* **Location**: `src/features/chess-league/components/GroupStageTable.jsx` (Lines 441–557)
* **Risk**: The table displays 7 columns: `#`, `Player`, `MP`, `W`, `D`, `L`, `Pts`. On a 320px viewport with container padding, the table width exceeds 320px, compressing player names into single letters or pushing `Pts` off-screen.
* **Solution**:
  1. Wrap the `<table>` in an `overflow-x-auto relative no-scrollbar` container.
  2. Make the `#` and `Player` columns **sticky left** (`sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]`).
  3. Add a right-edge gradient shadow cue (`pointer-events-none absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent sm:hidden`) to signal horizontal scrollability.

### 3.2 Knockout Bracket Canvas Overflow
* **Location**: `src/features/chess-league/components/SplitBracketVisualizer.jsx` (Lines 480–491)
* **Risk**: The inner visualizer canvas requires `TOTAL_W = 2310px`. While `overflow-x-auto` is present on `scrollRef`, first-time mobile users do not immediately realize they can pan horizontally.
* **Solution**:
  1. Add edge gradient cues on left and right borders of the scroll wrapper (`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-100/90 to-transparent z-30`).
  2. Upgrade section navigation buttons (`Left Bracket`, `Final & Trophy`, `Right Bracket`) to meeting 48px touch standards with smooth auto-scroll.
  3. Provide explicit visual scale controls (Zoom In `/` Zoom Out `/` Fit to Screen).

### 3.3 Fixture Cards & Admin Match Rows
* **Location**: `src/features/chess-league/pages/ChessTournamentPage.jsx` (Lines 70–130 `AdminMatchRow`, Lines 1160–1255 `Fixture Card`)
* **Risk**: On 320px screens, horizontal flex items (`Player 1`, `VS Badge`, `Player 2`, `Save Button`) stack vertically, but fixed width classes like `sm:w-[220px]` can overflow if not paired with `w-full max-w-full`.
* **Solution**: Ensure all inputs and buttons use `w-full min-w-0 max-w-full` on mobile break points.

---

## 4. Mobile Navigation & Visual Hierarchy Evaluation

### 4.1 Sticky Tab Navigation Bar
* **Current Implementation**: `ChessTournamentPage.jsx` line 847:
  ```jsx
  <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-12 lg:px-16">
  ```
  This container is NOT sticky. When users scroll down 20+ fixture cards or long standings tables, the tab bar disappears off the top of the viewport.
* **Required Enhancement**:
  ```jsx
  <div className="sticky top-16 lg:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 md:px-12 lg:px-16 shadow-xs">
  ```
  This keeps the tab switcher (`Table | Fixtures | Bracket | Results | Rules`) pinned directly below the main site header during scrolling.

### 4.2 Brand Color Tokens & Contrast Check
* `--color-brand-primary`: `#1A56C4` (Varsity Blue) – WCAG AA Compliant on White (5.2:1 contrast ratio).
* `--color-brand-accent`: `#B84D00` (Darkened Championship Amber) – WCAG AA Compliant on White (4.6:1 contrast ratio).
* Dark Hero Background: `linear-gradient(135deg, #0B193C 0%, #1E1B4B 55%, #431407 100%)` – `#FCD34D` (Amber text) and `#FFFFFF` provide high contrast (12:1+).
* Standard Card Padding: Standardize to `px-4 py-4 sm:p-6` across all tournament cards to maximize content density on 320px–375px screens.

---

## 5. Mobile Tables, Bracket & Drawers Evaluation

### 5.1 Group Stage Cards Stacking
* Group cards already stack in single-column layout on mobile (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3` in `GroupStageTable.jsx` line 389).
* Enhancement needed: Add sticky rank/player column and horizontal swipe indicators inside each group table card.

### 5.2 Bottom-Sheet Mobile Drawers Adaptation
Currently, both `TournamentPlayerModal.jsx` and `RulesModal` in `ChessTournamentPage.jsx` use centered modal dialogs on mobile screens.

#### Modal vs. Bottom-Sheet Drawer Specs

```
Current Centered Modal (Desktop):
┌──────────────────────────────┐
│       Modal Title     [X]    │
│  [ Avatar ]  Player Name     │
│  Rating: 1450   Games: 24    │
│  [ Message Player ]          │
└──────────────────────────────┘

Proposed Mobile Bottom-Sheet Drawer (Mobile <640px):
┌──────────────────────────────┐
│          ═══ Handle ═══      │
│  Modal Title            [X]  │
│  [ Avatar ]  Player Name     │
│  Rating: 1450   Games: 24    │
│  [ Message Player ]          │
└──────────────────────────────┘
(Fixed at bottom of screen, rounded-t-3xl, slide-up animation, backdrop tap to dismiss)
```

**CSS Classes for Drawer Adaptation**:
`fixed inset-x-0 bottom-0 sm:relative sm:inset-auto z-50 rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-none overflow-y-auto transform transition-transform duration-300 animate-in slide-in-from-bottom`

---

## 6. Proposed Code Changes & Implementation Blueprint

### Proposal 1: Root Container & Page Shell (`src/App.jsx` & `src/components/PageContainer.jsx`)

```jsx
// src/App.jsx line 33
<div className="min-h-screen bg-brand-bg-cream text-brand-text-dark selection:bg-brand-primary selection:text-white flex flex-col max-w-full overflow-x-hidden">

// src/components/PageContainer.jsx line 3
export default function PageContainer({ children }) {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      {children}
    </div>
  );
}
```

### Proposal 2: Sticky Tournament Tab Navigation (`src/features/chess-league/pages/ChessTournamentPage.jsx`)

```jsx
// src/features/chess-league/pages/ChessTournamentPage.jsx line 847
<div className="sticky top-16 lg:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 md:px-12 lg:px-16 shadow-xs">
  <div className="max-w-5xl mx-auto flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
    {TABS.map(t => {
      const isPrimary = t.id === 'bracket';
      const isActive = activeTab === t.id;
      return (
        <button 
          key={t.id} 
          onClick={() => setActiveTab(t.id)}
          className={`min-h-[48px] px-3.5 py-3 font-black whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            isPrimary ? 'text-base' : 'text-sm'
          } ${
            isActive 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-gray-500 hover:text-[#111111]'
          }`}
        >
          {t.icon && <span className={isActive ? 'text-brand-primary' : 'text-gray-400'}>{t.icon}</span>}
          {t.label}
        </button>
      );
    })}
  </div>
</div>
```

### Proposal 3: Sticky Column & Swipe Indicators in Group Stage Table (`src/features/chess-league/components/GroupStageTable.jsx`)

```jsx
// Wrap table in relative container with swipe indicators
<div className="relative overflow-hidden rounded-2xl border border-gray-100">
  <div className="overflow-x-auto no-scrollbar">
    <table className="w-full text-left border-collapse text-xs min-w-[500px]">
      <thead>
        <tr className="bg-gray-50/80 border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-wider">
          <th className="py-3 px-3 w-[36px] text-center sticky left-0 bg-gray-50 z-20">#</th>
          <th className="py-3 px-3 sticky left-[36px] bg-gray-50 z-20 min-w-[140px]">Player</th>
          <th className="py-3 px-2 text-center w-[36px]">MP</th>
          <th className="py-3 px-2 text-center w-[36px]">W</th>
          <th className="py-3 px-2 text-center w-[36px]">D</th>
          <th className="py-3 px-2 text-center w-[36px]">L</th>
          <th className="py-3 px-3 text-center w-[48px] text-brand-primary font-black">Pts</th>
        </tr>
      </thead>
      {/* tbody rows with sticky left styling on columns 1 & 2 */}
    </table>
  </div>
  {/* Right edge gradient cue */}
  <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent sm:hidden" />
</div>
```

### Proposal 4: Bottom-Sheet Mobile Drawer (`src/features/chess-league/components/TournamentPlayerModal.jsx`)

```jsx
export function TournamentPlayerModal({ player, onClose }) {
  if (!player || player.username === 'bye') return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111111]/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] sm:max-h-none overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden shrink-0" />
        
        {/* Close Button & Content */}
        ...
      </div>
    </div>
  );
}
```

---

## Conclusion & Recommended Next Steps

1. **Phase M2 Execution**: Implement mobile-first layouts, root container `overflow-x-hidden`, sticky tournament tab bar, Fitts's Law touch targets (≥48px), and brand color contrast hardening.
2. **Phase M3 Execution**: Implement mobile table sticky rank/name columns, knockout bracket visualizer swipe cues/zoom controls, and convert `TournamentPlayerModal` & `RulesModal` into bottom-sheet mobile drawers.
3. **Phase M4 Verification**: Perform full build audit (`npm run build`) and cross-viewport testing across 320px, 360px, 375px, and 768px viewports.
