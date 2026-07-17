---
target: Leaderboard Card
total_score: 21
p0_count: 1
p1_count: 2
timestamp: 2026-07-17T14-03-54Z
slug: src-pages-landing-jsx
---
# UX Heuristics Review: Leaderboard Card on Landing Page
**Target**: `src/pages/Landing.jsx` (Leaderboard Card)
**Date**: July 17, 2026

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Tabs update instantly, but lack hover/focus transitions or loading skeletons for standings updates. |
| 2 | Match System / Real World | 3/4 | Division names fit chess theme nicely, but "Friendlies" tab needs inline explanation. |
| 3 | User Control and Freedom | 1/4 | Users cannot search, filter, paginate, or click rows to open profile modals. |
| 4 | Consistency and Standards | 2/4 | Segmented vs. sub-segmented tabs style mismatch; use of nonexistent classes (`text-gray-750` / `gray-650`). |
| 5 | Error Prevention | 4/4 | Solid error prevention (read-only list, no destructive actions). |
| 6 | Recognition Rather Than Recall | 2/4 | Aggressive name/school truncation; no self-highlighting state for the current user. |
| 7 | Flexibility and Efficiency | 1/4 | Complete lack of keyboard navigation, focus rings, or sorting controls. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Squeezed 25% column layout with stacked tabs is cluttered; text is too small (10px). |
| 9 | Error Recovery | 4/4 | Solid (no forms or error paths possible). |
| 10 | Help and Documentation | 0/4 | No explanation of rating sources or school rankings. |
| **Total** | | **21/40** | **Acceptable (Significant improvements needed)** |

## Anti-Patterns Verdict

### LLM Assessment (Slop Audit)
- **Say-Do Gap**: Comment promises M3-compliant 48px heights, but style definitions use 38px heights.
- **Hallucinated CSS**: Non-existent classes `text-gray-750` and `text-gray-650` fall back to browser defaults.
- **Eyebrow Eyecandy**: Tiny 10px uppercase texts with tracked margins are overused as layout noise.
- **Lazy Truncation**: Rigid `truncate` without hover tooltips or click-expansion.

### Deterministic Scan
- **Findings**: 1 Warning.
- **Rule**: `bounce-easing` (Bounce or elastic easing) on the Varsity Shield container inside the preloader (`Landing.jsx:582`). Real-world decelerations should be exponential.

### Visual Overlays
- No browser canvas mutation occurred; no live overlay injected.

## Overall Impression
The leaderboard card is functional but visually cramped and completely dead. It fails the prestige and varsity-representation goals by aggressively clipping names and hiding the module completely on mobile screens.

## What's Working
1. **Varsity Medals**: Clean gold, silver, bronze circle backgrounds clearly highlight top competitors.
2. **Snappy Filters**: Category switching is instantaneous and does not cause visual reflow stutter.

## Priority Issues

### **[P0] Leaderboard Hidden on Mobile Viewports**
- **Why it matters**: The board is hidden with `hidden md:block` on mobile. Since students browse SCL on mobile, the core competition feature is completely lost to them.
- **Fix**: Remove the hide rule and stack the leaderboard component under the main feed on mobile viewports.
- **Suggested command**: `/impeccable adapt`

### **[P1] Inaccessible Color Contrasts & Hallucinated Colors**
- **Why it matters**: White-on-bronze (#CD7F32) contrast is 3.15:1; orange ratings are 3.35:1 (both fail WCAG AA 4.5:1). Typos like `text-gray-750` fall back to default colors.
- **Fix**: Use `#111` ink text on the bronze badge, darken orange accent rating text to `#B84D00` (4.58:1), and replace invalid tailwind classes.
- **Suggested command**: `/impeccable colorize`

### **[P1] Keyboard Navigation & Non-interactive Rows**
- **Why it matters**: Interactive elements lack focus rings. Rows are dead-ends despite an interactive Player Profile modal existing.
- **Fix**: Add focus outlines to buttons. Bind clicks to leaderboard rows to select and open profiles, adding pointer cursor and background hover fills.
- **Suggested command**: `/impeccable layout`

### **[P2] Visual Overcrowding & Aggressive Truncation**
- **Why it matters**: Double tab navigation stacked in a 25% column pushes layouts, forcing aggressive ellipsis truncation of school names.
- **Fix**: Simplify division sub-tabs or use a compact select menu. Add HTML title attributes to display full names on hover.
- **Suggested command**: `/impeccable distill`

## Persona Red Flags

- **Alex (Power User)**: Dead lists with no search or quick filters to find specific players.
- **Jordan (First-Timer)**: Confusion over nested tab states; no info explaining what "Friendlies" is or how ratings sync.
- **Sam (A11y User)**: Low contrast text, missing focus highlights, and no keyboard accessibility.
- **Riley (Stress Tester)**: Long school names render clipped; no empty state fallback.
- **Casey (Mobile User)**: The leaderboard widget is completely invisible on mobile.
- **Chidi (Student Competitor)**: Truncated university representation ruins the sense of school pride.

## Minor Observations
- Rating font (Space Grotesk) is slightly misaligned vertically compared to body text.
- Bullet separators inside friendlies text lack standard letter margins.

## Questions to Consider
- *Should we display the player's chess avatar next to their badge?*
- *Can we highlight the current user's row to spark engagement?*
- *Would a "Share Card" button help players post their ranking directly to social media?*
