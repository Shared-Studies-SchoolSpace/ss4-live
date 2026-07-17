# UX Critique: Leaderboard Card (src/pages/Landing.jsx)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Instantly updates on click, but lacks hover/focus transitions or loading state skeletons. |
| 2 | Match System / Real World | 3 | Chess jargon ("Fork"/"Pin") is appropriate, but "Friendlies" is ambiguous without context. |
| 3 | User Control and Freedom | 1 | Cannot search, filter, paginate, or click rows to open profiles (dead-end lists). |
| 4 | Consistency and Standards | 2 | Segmented vs. sub-segmented tabs style mismatch. Non-existent gray-750/gray-650 colors. |
| 5 | Error Prevention | 4 | Read-only card with zero forms or inputs, preventing user errors. |
| 6 | Recognition Rather Than Recall | 2 | Aggressive truncation of names/universities forces guessing. No highlight for "You". |
| 7 | Flexibility and Efficiency | 1 | Complete lack of keyboard navigation, focus indicators, search, or sorting. |
| 8 | Aesthetic and Minimalist Design | 2 | Cramped 25% column layout with stacked tabs is cluttered. Text sizes are too small (10px). |
| 9 | Error Recovery | 4 | N/A (no error states possible). |
| 10 | Help and Documentation | 0 | No help or explanation of how ratings are calculated or synchronized. |
| **Total** | | **21/40** | **Acceptable (Significant improvements needed)** |

### Anti-Patterns Verdict

**LLM assessment**:
- **Verdict**: Fail — clear AI slop indicators present.
- **Tells**:
  - **Say-Do Gap**: The code comment explicitly claims a "48px compliant spacing" segmented button, but the style `height: 38px` defined in `index.css` contradicts this.
  - **Hallucinated CSS**: Uses non-existent Tailwind utility classes `text-gray-750` and `text-gray-650` which fall back to browser default black/dark-gray or style anomalies.
  - **Eyebrow Trope & Tiny text**: Card header uses `text-sm font-black uppercase tracking-widest` while list names and labels use `text-[10px]` tracking and casing that mimics AI grammar reflexes.
  - **Lazy Truncation**: Relies on rigid `truncate` on every layout item without hover tooltips or expansion, creating a mock-up look rather than a polished functional interface.
  - **Fragmented Code Styles**: Sub-segmented tabs are manually restyled with individual Tailwind classes instead of reusing the `.m3-segmented-container` class, displaying styling inconsistency.

**Deterministic scan**:
- Automated detector found 1 warning in `src/pages/Landing.jsx`:
  - `animate-bounce` on line 582 (outside the Leaderboard widget range, but indicates minor animation slop elsewhere in the file).

### Overall Impression
The Leaderboard Card visually fits the varsity scholastic style at a glance, but functions like a rigid static mock-up rather than a real-time responsive component. The narrow 25% column width combined with stacked nested tab bars forces excessive name truncation, while the complete lack of mobile visibility, contrast failures, and zero keyboard access make it a low-usability widget.

### What's Working
1. **Clean Varsity Colors**: The use of gold, silver, and bronze circles for the top three ranks visually highlights leaders clearly.
2. **Tab Responsiveness**: Instantly toggles between Players, Friendlies, and Schools without noticeable lag.

### Priority Issues

* **[P0] Mobile Hidden Viewport**:
  * **Why it matters**: Hiding the leaderboards on mobile (`hidden md:block`) locks out mobile-first secondary/tertiary students, defeating the goal of active competition.
  * **Fix**: Make it visible on mobile by reflowing columns, placing it below games, or using a dashboard tab switcher.
  * **Suggested command**: `/impeccable adapt`

* **[P1] Low Color Contrast and Invalid Classes**:
  * **Why it matters**: Bronze text contrast is 3.15:1 and Orange accent ratings are 3.35:1 (both fail WCAG AA 4.5:1). Invalid gray classes cause styling bugs.
  * **Fix**: Use darker bronze background/ink text, darken the orange accent text, and replace `text-gray-750`/`text-gray-650` with standard gray utilities.
  * **Suggested command**: `/impeccable colorize`

* **[P1] Broken Keyboard Navigation and Interactive States**:
  * **Why it matters**: Tabs cannot be tabbed through or focused with outlines. Rows are dead-ends despite having a detail modal component.
  * **Fix**: Add `:focus-visible` outlines, ARIA roles/tab states, and map `onClick` events on list rows to launch player profiles.
  * **Suggested command**: `/impeccable layout`

* **[P2] Aggressive Truncation & Overloaded Tabs**:
  * **Why it matters**: Double stacked tabs inside a 25% column clutter layout and truncate player and school names severely, undermining scholastic representation pride.
  * **Fix**: Consolidate filter layers (use a simple dropdown for division) and add HTML `title` attributes for tooltips on truncated text.
  * **Suggested command**: `/impeccable distill`

### Persona Red Flags

* **Alex (Impatient Power User)**:
  * **Red Flags**: Cannot navigate the rankings with a keyboard. No search bar to quickly check if a peer is on the list.
* **Jordan (Confused First-Timer)**:
  * **Red Flags**: Stacked tabs create confusion on how categories and divisions interact. No explanation of "Friendlies" scoring. Truncated names look broken.
* **Sam (Accessibility-Dependent User)**:
  * **Red Flags**: Bronze badge text (`#CD7F32`) and Orange text (`#E8640A`) on white fail contrast tests. Inactive tabs have poor contrast. No screen reader announcements or keyboard focus states.
* **Riley (Deliberate Stress Tester)**:
  * **Red Flags**: Long university names (e.g. "Federal University of Technology, Akure") are truncated to "Federal Univ..." with no way to see the full text. If a division list is empty, there is no empty-state handler.
* **Casey (Distracted Mobile User)**:
  * **Red Flags**: The card is completely hidden on mobile screens. Touch targets for tabs (38px height) and sub-tabs (32px height) violate the 44px touch target guidelines.
* **Chidi (Scholastic Competitor - Project Persona)**:
  * **Red Flags**: Cannot brag or share standings to WhatsApp since the card is hidden on his Android phone and lacks share actions.

### Minor Observations
- Rating numbers use `font-space` (Space Grotesk), which looks athletic and distinct, but the alignment with names could be tightened.
- Bullet points (`&bull;`) in Friendlies details are closely spaced, making them look slightly cluttered.

### Questions to Consider
- What if the Leaderboard was placed in its own collapsible panel or sidebar tab to give player names more horizontal breathing room?
- How could we highlight the active user's row (e.g. yellow border or pulsing active dot) to increase emotional engagement?
- Could we fetch and display the player's chess avatar next to their rank badge?
