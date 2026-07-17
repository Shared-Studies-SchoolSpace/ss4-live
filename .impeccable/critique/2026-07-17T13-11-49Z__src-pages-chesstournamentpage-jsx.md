---
target: /home/kami/Desktop/codebase/ss4/src/pages/ChessTournamentPage.jsx
total_score: 20
p0_count: 3
p1_count: 2
timestamp: 2026-07-17T13-11-49Z
slug: src-pages-chesstournamentpage-jsx
---
Method: dual-agent (A: a80aae07-1e6c-45f8-a1ac-2d90de860511 · B: 0143a9b2-e765-4a9e-b718-7742a9d2e8b7)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Local fallback database and Supabase updates lack real-time sync indicators in UI. |
| 2 | Match System / Real World | 3/4 | Seeding ELO gap calculation (forcing exactly ~400 gap) is non-standard and confusing. |
| 3 | User Control and Freedom | 2/4 | No undo/rollback for logged scores or tournament resets. |
| 4 | Consistency and Standards | 1/4 | Severe timezone presentation conflict: 6:00 PM in headers vs. 8:00 PM WAT in rules/countdown. |
| 5 | Error Prevention | 1/4 | Crucial: auto-registration uses raw email prefix if chess username is missing, risking disqualification. Destructive "Reset Tournament" next to advance button with single browser prompt. |
| 6 | Recognition Rather Than Recall | 1/4 | Undocumented double-click gesture on H1 title to enter Admin mode. Heavy mobile horizontal panning (2300px). |
| 7 | Flexibility and Efficiency | 2/4 | Lacks bulk logging or CSV results import for admins. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Cluttered with uppercase tracking eyebrows, overlapping card borders, and gradient/glassmorphic tells. |
| 9 | Error Recovery | 2/4 | Error messages (toast) are generic and lack actionable diagnostic advice. |
| 10 | Help and Documentation | 3/4 | Rulebook is a wall of text that is hard to scan. |
| **Total** | | **20/40** | **Acceptable** |

## Anti-Patterns Verdict

### LLM Assessment
The interface exhibits several "AI Slop" tells that make it look machine-generated rather than custom-crafted:
- **Gradient Text:** The title word "Tournament" is styled with a linear gradient mask, violating SCL's explicit design bans (`ChessTournamentPage.jsx:L469` and `TournamentHero.jsx:L95`).
- **Glassmorphism Clichés:** Countdown blocks and visualizer column elements rely heavily on semi-transparent backgrounds with blur effects, creating poor text contrast and rendering lags.
- **Tracked Uppercase Eyebrows:** Pervasive all-caps subheadings with high tracking (e.g. `"SS4 CHESS NETWORK"`, `"OFFICIAL RULEBOOK"`) are placed above sections as visual filler rather than serving a structural purpose.
- **Visual Bug:** A structural layout flaw in `SplitBracketVisualizer.jsx` where parent columns are set to `185px` wide, but the child match cards are hardcoded to `200px` wide, causing cards to overlap column boundaries and connecting SVG lines.

### Deterministic Scan
The automated detector (`detect.mjs`) flagged **17 issues** across the main page and components:
- **Colors Outside DESIGN.md (16 findings):** Hex colors `#0B193C`, `#1E1B4B`, `#431407`, `#fb923c`, `#6366f1`, and `#fdba74` are used directly in `ChessTournamentPage.jsx` and `TournamentHero.jsx` instead of referring to the verified DESIGN.md system variables.
- **Gray text on colored background (1 finding in `TournamentHero.jsx` line 55):** Flagged as `text-gray-500` on `bg-amber-100` (`gray-on-color`).
  - *Agreements:* The detector and the manual review both identified the color system drift and gradient/glassmorphism color overrides.
  - *Disagreements / False Positives:* The warning at `TournamentHero.jsx:L55` is a false positive because the classes `bg-amber-100` and `text-gray-500` are defined in a configuration dictionary for different states (`upcoming` and `completed` respectively) and are never combined on the same element at runtime.

## Overall Impression
The SCL Tournament page successfully creates an engaging, high-contrast varsity athletic environment. However, this is undermined by severe usability conflicts—chiefly the timezone contradiction, a hidden admin panel, auto-registration failures, and bracket card horizontal overflows. Fixing these structural items is the primary lever to establish a high-trust, production-ready experience.

## What's Working
1. **Interactive Tree Snap Navigation:** The mobile buttons ("Left", "Final", "Right") are a brilliant mobile UX pattern to ease horizontal scrolling of the bracket tree.
2. **Stable Seeding Seeding Algorithm:** Text-hash based sorting for provisional players prevents layout shifts and pairing inconsistencies across page refreshes.
3. **Comprehensive Rulebook:** Incorporating full rules on-page ensures a single source of truth for match disputes.

## Priority Issues

### [P0] Critical Layout Alignment Fix (Layout Bug)
- **Why it matters:** Cards physically overflow their columns by 15px, breaking the visual layout and misaligning connecting lines.
- **Fix:** In `SplitBracketVisualizer.jsx:L97`, replace `style={{ width: '200px' }}` with `style={{ width: '100%' }}` (or matching the column width `COL_W`).
- **Suggested command:** `/impeccable layout`

### [P0] Timezone and Schedule Presentation Unification (Consistency / Standards)
- **Why it matters:** Users are highly confused when countdowns tick to 8:00 PM WAT while headers hardcode 6:00 PM.
- **Fix:** Replace the hardcoded string `@ 6:00 PM` in `BracketTab.jsx:L244` and `ChessTournamentPage.jsx:L792` with dynamic or verified string `@ 8:00 PM WAT`.
- **Suggested command:** `/impeccable clarify`

### [P0] Fallback Username Enforcement (Error Prevention)
- **Why it matters:** Players are auto-registered with their email prefix if they lack a Chess.com username on their profile, which violates rules and leads to immediate disqualification.
- **Fix:** In `ChessTournamentPage.jsx:L242-257`, check if `targetProfile.chess_username` is missing. If it is, block registration and show a modal prompt to input their Chess.com username before completing.
- **Suggested command:** `/impeccable harden`

### [P1] Discoverable and Secure Admin Access (Recognition vs Recall)
- **Why it matters:** Admin panel is hidden behind an undocumented double-click gesture on the page header, which requires external recall and blocks keyboard-only admins.
- **Fix:** Introduce a visible "Admin Portal" link/button in the footer or nav bar, gated by the PIN verification screen.
- **Suggested command:** `/impeccable onboard`

### [P1] Safe Administrative Reset Confirmation (Error Prevention)
- **Why it matters:** "Reset Tournament" sits right next to standard actions and can permanently wipe the database with a single accidental click and browser confirm.
- **Fix:** Change the standard confirm modal to require typing `"RESET"` or the month code (`"2026-06"`) to authorize.
- **Suggested command:** `/impeccable clarify`

## Persona Red Flags

- **Alex (Power User / Admin):** Must use an undocumented double-click gesture to access administrative tools. Forced to log matches one-by-one with no keyboard-only shortcuts or batch logging. High risk of accidental tournament wipe due to button placement.
- **Jordan (First-Timer):** Confronted with contradictory match times (6:00 PM vs 8:00 PM). Opponent profiles lack phone details, and the custom chat has no push notification support, making match coordination very difficult.
- **Sam (Accessibility-Dependent):** The absolute-positioned Interactive Tree structure is skipped entirely by screen readers due to a lack of proper roles (`role="grid"` / `role="tree"`). Match cards are built with interactive `div` tags lacking `tabIndex` and focus states.
- **Riley (Stress Tester):** System allows saving non-URL strings as match video links. If Riley's internet drops, local storage caching is used, but there's a high risk of permanent data loss if browser storage is cleared before syncing back.
- **Casey (Distracted Mobile):** Two-dimensional panning causes severe disorientation on mobile browsers. Player name touch targets are too small and cramped, violating Fitts's Law.

## Minor Observations
- **Double Forfeit Layout Propagation:** Propagating `username: 'forfeit'` displays "Double Forfeit" as a player name in the next round instead of bypassing or logging a BYE.
- **WhatsApp Country Code:** The Nigeria prefix `234` is hardcoded, which will break WhatsApp links for international players.

## Questions to Consider
1. *Why are we aiming for an ELO gap of exactly ~400 in matchups during bracket generation instead of matching close ELO scores or standard high-vs-low seeding?*
2. *Since SCL is a live tournament, why use a custom in-app chat that players won't keep open, instead of integrating Discord webhooks or WhatsApp alerts?*
