# Project: SS4 Mobile Optimization of Admin Surfaces

## Architecture & Scope
- **Admin Mobile Optimization**: Mobile-first responsive layouts for all SS4 Admin surfaces (<640px down to 360px). Zero horizontal viewport scrolling (`overflow-x-hidden`).
- **Touch Target Standard**: All interactive elements (buttons, inputs, switches, selects, tabs, pills, icons) meet or exceed minimum 44px height (`min-h-[44px]` or `py-2.5 px-4`).
- **Grid Layout Collapse**: Grids (player selection grids, parameter inputs, admin widgets, history cards) collapse gracefully into single-column layouts (`grid-cols-1`) on small screens (<640px).
- **Momentum Scrolling**: Scrollable panels (broadcast logs, drawer content, list containers) retain smooth momentum scrolling (`overflow-y-auto`, `-webkit-overflow-scrolling: touch`).

## Code Layout & Target Surfaces
- **Surface 1 (Tournament Admin & Generators)**:
  - `src/features/chess-league/pages/ChessTournamentPage.jsx`
  - `src/features/chess-league/components/AdminTab.jsx`
- **Surface 2 (Admin Broadcast Center)**:
  - `src/components/announcements/AdminBroadcastPanel.jsx`
  - `src/components/admin/AdminDrawer.jsx`
- **Surface 3 (Admin Dashboard Surface)**:
  - `src/features/auth-portal/pages/DashboardPage.jsx`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Surface 1 Mobile Optimization | `ChessTournamentPage.jsx` & `AdminTab.jsx` admin panel/generators mobile responsive stacking, 1-col collapse <640px, ≥44px touch targets. | None | IN_PROGRESS |
| 2 | Surface 2 Mobile Optimization | `AdminBroadcastPanel.jsx` & `AdminDrawer.jsx` drawer frame, tabs, textareas, selectors, logs momentum scrolling, ≥44px touch targets. | None | IN_PROGRESS |
| 3 | Surface 3 Mobile Optimization | `DashboardPage.jsx` admin widgets, player approval lists, match submission review cards, status tags 1-col collapse <640px, ≥44px touch targets. | None | IN_PROGRESS |
| 4 | Verification & E2E Build | Cross-surface mobile review, `npm run build` zero errors, Forensic Auditor verification. | M1, M2, M3 | PLANNED |

## Interface Contracts & Guidelines
- **Touch Target Standard**: `min-h-[44px]` or `py-2.5 px-4` on all interactive buttons, inputs, switches, selects, tabs, pills.
- **Viewport Limit**: `max-w-full overflow-x-hidden` on root container, no element extending past 100vw without horizontal scroll container.
- **Grid Collapse Rule**: On `<640px` (`sm:` breakpoint), use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-...`.
- **Momentum Smooth Scrolling**: Use `overflow-y-auto -webkit-overflow-scrolling-touch` on scrollable areas.
