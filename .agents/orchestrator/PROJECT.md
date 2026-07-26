# Project: Mobile Optimization & Touch UX Hardening (SS4 Chess League)

## Architecture & Scope
- **Mobile Responsive Layout**: Mobile-first grid/flex layouts across all viewports (320px–768px). Application of `overflow-x-hidden` on main container shell to guarantee zero horizontal viewport scrolling.
- **Visual Hierarchy & Color Tokens**: High-contrast theme tokens (`#0B193C` navy, `#1A56C4` primary, `#FCD34D` amber text), standardized mobile card paddings (`px-4 py-4 sm:p-6`), font sizes, and avatar sizes.
- **Fitts's Law Touch Target Acquisition**: Minimum target height of `48px` (`min-h-[48px]` / `py-3 px-4`) for interactive elements: buttons, tab pills, player profile cards, search inputs, modal triggers, drawer actions.
- **Mobile Navigation**: Sticky/fixed mobile tab bar or smooth horizontal scrollable pill navigation (`Table | Fixtures | Standings | Bracket | Rules`) with active indicator.
- **Mobile Tables**: Group tables stacked in single-column layout (`grid-cols-1`) on mobile, with sticky rank/name column and horizontal swipe indicators.
- **Knockout Bracket Visualizer**: Touch-friendly horizontal swipe scrolling with visual gradient fade edge indicators or zoom/scale controls.
- **Mobile Drawers**: `TournamentPlayerModal` and `RulesModal` adapted into bottom-sheet mobile drawers (`rounded-t-3xl sm:rounded-3xl` max height `90vh`) with backdrop tap-to-dismiss.

## Code Layout
- `src/layouts/MainLayout.jsx` / `src/App.jsx`: Main container wrapper (`overflow-x-hidden`).
- `src/features/tournaments/pages/TournamentDetailPage.jsx`: Main tournament page containing tabs navigation, tab bar, header, and tab content views.
- `src/features/tournaments/components/`:
  - `OverviewTab.jsx`
  - `TableTab.jsx` / `GroupTables.jsx`
  - `FixturesTab.jsx` / `FixtureCard.jsx`
  - `StandingsTab.jsx`
  - `BracketTab.jsx` / `KnockoutBracket.jsx`
  - `RulesTab.jsx`
  - `TournamentPlayerModal.jsx` / `RulesModal.jsx`
- `src/components/common/`: Shared UI buttons, inputs, pills, modal shells.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Mobile Layout Analysis & Codebase Exploration | Read codebase, map tournament components, identify horizontal overflow risks, touch targets <48px, drawer adaptation needs. | None | IN_PROGRESS |
| 2 | Mobile Layout, Visual Hierarchy & Fitts's Law Touch Targets | Mobile-first layouts on 320px–768px, `overflow-x-hidden` container, ≥48px touch targets, sticky tab bar navigation, thumb-zone CTA positioning, high-contrast color tokens. | M1 | PLANNED |
| 3 | Mobile Tables, Knockout Bracket & Bottom-Sheet Drawers | Mobile group cards stacked (`grid-cols-1`), group tables sticky column & swipe cues, bracket touch scrolling & gradient cues, `TournamentPlayerModal` and `RulesModal` bottom-sheet drawers. | M1 | PLANNED |
| 4 | Integration Verification, E2E Build & Forensic Audit | Verification of responsive viewports (320px, 360px, 375px, 768px), `npm run build` zero errors, Reviewer pass, Forensic Auditor CLEAN verdict. | M1-M3 | PLANNED |

## Interface Contracts & Guidelines
- **Touch Target Standard**: `min-h-[48px]` or `py-3 px-4` on all clickable buttons, tabs, links, inputs.
- **Viewport Limit**: `max-w-full overflow-x-hidden` on root container, no element extending past 100vw without horizontal scroll container.
- **Bottom Sheet Drawer**: `fixed inset-x-0 bottom-0 z-50 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto transform transition-transform`.
