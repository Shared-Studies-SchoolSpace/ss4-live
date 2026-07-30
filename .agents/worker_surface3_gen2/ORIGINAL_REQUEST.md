## 2026-07-30T11:27:04Z
Mobile-optimize Surface 3: Admin Dashboard Surface in SS4 (`src/features/auth-portal/pages/DashboardPage.jsx` and associated admin control widgets, cards, and lists).

REQUIREMENTS:
1. Ensure admin widgets, player approval lists, match submission review cards, action buttons, and status tags inside `DashboardPage.jsx` render responsively on mobile screens (<640px down to 360px) without squashing content or causing horizontal body overflow.
2. All interactive touch targets (action buttons, approval/rejection toggles, filter dropdowns, edit buttons) must meet the 44px minimum target height (e.g., `min-h-[44px]` or `py-2.5 px-4`).
3. Grids (widget cards, review item grids, metrics summary) must collapse into single-column layouts (`grid-cols-1`) on screens below 640px.
4. Scrollable areas (e.g., player approval queues, match submission lists) must retain momentum smooth scrolling (`overflow-y-auto`, `-webkit-overflow-scrolling: touch`).
