# Project Plan: SS4 Mobile Optimization of Admin Surfaces

## Mission
Mobile-optimize all pages and surfaces directly accessible from the admin section in SS4 (`ChessTournamentPage.jsx` admin panel/generators, `AdminBroadcastPanel.jsx` drawer/tab, and `DashboardPage.jsx` admin controls). Ensure touch targets are at least 44px, grids collapse gracefully on small screens (<640px), and scrollable areas retain momentum smooth scrolling. Assign one specialized worker per page/surface to execute in parallel.

## Target Surfaces & File Breakdown

### Surface 1: Admin Tournament Control & Generator Views
- **Primary Files**: `src/features/chess-league/pages/ChessTournamentPage.jsx`, `src/features/chess-league/components/AdminTab.jsx`
- **Key Focus**:
  - Admin Control Panel layout adaptation for mobile (<640px).
  - World Cup Generator view (`generate-r1`) inputs, player selection grids, button stacks.
  - Generate Next Round view (`generate-next`) action bars, round parameter forms, status badges.
  - Graceful grid collapse to 1-column on screens <640px (`grid-cols-1`).
  - Interactive touch targets ≥44px height (`min-h-[44px]` / `py-2.5 px-4`).

### Surface 2: Universal Admin Broadcast Center
- **Primary Files**: `src/components/announcements/AdminBroadcastPanel.jsx`, `src/components/admin/AdminDrawer.jsx`
- **Key Focus**:
  - Admin Broadcast drawer frame & embedded tab container optimization for mobile screens.
  - Audience target selection pills/selects and tab bar controls meet 44px min touch target.
  - Broadcast message textarea & submit button stack responsively on small viewports.
  - Broadcast history logs retain momentum smooth scrolling (`overflow-y-auto`, `-webkit-overflow-scrolling: touch`).

### Surface 3: Admin Dashboard Surface
- **Primary Files**: `src/features/auth-portal/pages/DashboardPage.jsx` (and associated admin control widgets/cards)
- **Key Focus**:
  - Admin widgets, player approval lists, match submission review cards, and status tags.
  - Responsive stacking and 1-column collapse under 640px.
  - Action buttons (approve/reject, edit, filter switches) upgraded to ≥44px touch targets.
  - Prevention of content squashing or horizontal overflow on 360px viewports.

---

## Execution Phases

### Phase 1: Parallel Dispatch of Specialized Workers
- **Worker 1 (`worker_surface1`)**: Execute mobile optimization for `ChessTournamentPage.jsx` & `AdminTab.jsx`.
- **Worker 2 (`worker_surface2`)**: Execute mobile optimization for `AdminBroadcastPanel.jsx` & `AdminDrawer.jsx`.
- **Worker 3 (`worker_surface3`)**: Execute mobile optimization for `DashboardPage.jsx` admin controls.

### Phase 2: Code Review, Build Verification & Integrity Audit
- **Reviewer (`reviewer_admin`)**: Review all modified files for mobile UX compliance, zero horizontal overflow at 360px, 44px touch targets, momentum scrolling, and build success (`npm run build`).
- **Forensic Auditor (`auditor_admin`)**: Perform static and integrity checks to ensure authentic implementation.

---

## Acceptance Criteria Checklist
- [ ] Zero horizontal overflow / page body scrolling at 360px viewport width across all admin views.
- [ ] All interactive buttons, switches, and selects meet 44px minimum touch target size on mobile.
- [ ] Grids collapse into single-column layouts (`grid-cols-1`) on screens below 640px.
- [ ] Scrollable logs/lists retain momentum smooth scrolling.
- [ ] Production build (`npm run build`) completes with 0 compilation errors.
