# Original User Request

## 2026-07-21T11:56:07Z

SS4 Chess League   Real-time Messaging, Automated Fixture Broadcasts, Notifications System, Persistent Auth, Student Signup Pre-flow, and 3-Persona Player Dashboard Synthesis.

Working directory: /home/kami/Desktop/codebase/ss4
Integrity mode: development

## Requirements

### R1. Database Schema Execution & Verification
Ensure all tables (`direct_messages`, `announcements`, `notifications`), indexes, column additions (`last_seen`, `read_at`), and Row-Level Security (RLS) policies are active and verified on the database.

### R2. Automatic Fixture Broadcast & Notifications
Implement an automated event trigger when tournament fixtures/matches are generated:
- Automatically post a global announcement (`announcements` table).
- Automatically create targeted notification records (`notifications` table) for all assigned players containing: Opponent Name, Round Number, Match Link, and Scheduled Time.

### R3. Real-Time Messaging & Universal Admin Broadcast
- Ensure 1-on-1 Direct Messaging (`DirectChat.jsx`) functions with real-time updates, read receipts (`read_at`), last seen presence tracking (`last_seen`), and unread badges.
- Ensure `AdminBroadcastPanel.jsx` functions and is integrated and accessible across all Admin panels and admin drawer views.

### R4. Intuitive Player Dashboard (3-Persona Multi-Agent Debate & Design Synthesis)
Initialize 3 distinct subagent personas, feeding each persona the COMPLETE unabridged skill file content plus the initialization instruction:
"You are a Superior UX/UI Designer/Critique, your task is to optimize UIs and UXs based on the information below: {skill}"

Personas:
1. **Persona 1 (Laws of UX Auditor)**: Instantiated with the entire `/home/kami/Desktop/codebase/ss4/.agents/skills/laws-of-ux/SKILL.md`.
2. **Persona 2 (Impeccable Design Lead)**: Instantiated with the entire `/home/kami/.gemini/config/skills/impeccable/SKILL.md`.
3. **Persona 3 (Frontend Design Master)**: Instantiated with the entire `/home/kami/.gemini/config/skills/frontend-design/SKILL.md`.

Have these 3 personas critique and argue productively until they reach consensus on a unified, high-contrast, academic-prestige Player Dashboard design and layout, then implement the agreed UI in `src/features/auth-portal/pages/DashboardPage.jsx` and related dashboard components.

### R5. Persistent Auth Session Handling
Ensure persistent authentication (`localStorage` proxy when "Remember Me" is enabled, `sessionStorage` fallback when disabled) with auto-token refresh in `src/supabase.js`.

### R6. Flexible Student vs General Signup Pre-flow
Ensure non-mandatory fields (Level, University/School, Faculty, Department) are optional. Maintain the pre-flow modal question ("Are you a student in a Nigerian Secondary or Tertiary institution?") to branch the user into appropriate signup flows.

### R7. Complete 9-Event Notification System & Interface Dream Analysis
Implement a complete notification system covering all 9 event types:
1. Tournament registration opens
2. Registration closes
3. Tournament begins
4. Fixtures released
5. Opponent assigned (with opponent, round, match link, scheduled time)
6. Match reminder
7. Rating update
8. Tournament completed
9. General announcements

Perform an `/interface-dream` analysis to ensure zero state drift, proper RLS scoping, and instant unread count updates.

## Acceptance Criteria

### Database & Automations
- [ ] SQL schema applied for `direct_messages`, `announcements`, `notifications`.
- [ ] Generating fixtures automatically dispatches notifications to paired players with opponent name, round, match link, and scheduled time.

### Messaging & Admin Panels
- [ ] Direct Chat supports real-time message stream, read receipts (`read_at`), and online/last_seen indicators.
- [ ] Admin Broadcast Panel is accessible from all Admin surfaces.

### Dashboard & Personas
- [ ] 3 Personas (Laws of UX, Impeccable, Frontend Design) debate and reach consensus on Dashboard UI.
- [ ] Player Dashboard updated according to synthesized 3-Persona design recommendations.

### Auth & Notifications
- [ ] Persistent login works seamlessly across page reloads and browser sessions.
- [ ] Non-mandatory school/level fields branch cleanly via student pre-flow question.
- [ ] All 9 notification triggers produce correct notification records and live UI updates.

## 2026-07-26T12:31:30Z

Optimize the Chess League Tournament website for mobile devices across all viewports (320px – 768px), ensuring mobile-first responsive layout, Fitts's Law touch targets (≥48px), intuitive gestures/navigation, zero horizontal overflow bugs, and flawless visual polish.

Working directory: /home/kami/Desktop/codebase/ss4

## Requirements

### R1. Mobile Layout & Visual Hierarchy (`/frontend-design` & `/impeccable`)
- Ensure all pages and tabs (`Overview`, `Table`, `Fixtures`, `Standings`, `Bracket`, `Rules`) render with mobile-first layouts without horizontal screen overflow or clipped typography on 320px–768px screens.
- Standardize spacing, card paddings (`px-4 py-4 sm:p-6`), font sizes, and avatar monograms for optimal small-screen density.
- Apply high-contrast brand color tokens (`#0B193C` navy, `#1A56C4` primary, `#FCD34D` amber text) for full legibility under high ambient light.

### R2. Touch Target Acquisition & Mobile Usability (`/laws-of-ux-auditor`)
- **Fitts's Law**: Upgrade all primary touch targets (buttons, tab switches, player links, search inputs, modal triggers) to a minimum target height of `48px` (or `py-3 px-4`) with clear visual focus/active feedback.
- **Hick's Law / Nav Simplicity**: Implement a sticky/fixed mobile tab bar or smooth horizontal swipe pill navigation for tab switching so users never lose context when scrolling down long fixture or standings lists.
- **Thumb Zone Design**: Position primary actions (e.g. "Message Player on SCL", "Search Group", "Join Tournament") within comfortable bottom-half mobile thumb reach.

### R3. Mobile Tables & Bracket Visualizer Touch Optimization
- **Group Tables**: On mobile, stack group cards in single-column layout (`grid-cols-1`) with clean table horizontal overflow indicators and sticky player rank/name column.
- **Knockout Bracket**: Enable touch-friendly horizontal swipe scrolling with visual gradient edge indicators or scale controls for split bracket visualizers on mobile screens.
- **Modals & Drawers**: Adapt `TournamentPlayerModal` and `RulesModal` into bottom-sheet mobile drawers (`rounded-t-3xl sm:rounded-3xl` max height `90vh`) with easy backdrop tap to dismiss.

## Acceptance Criteria

### Mobile Layout & Responsiveness
- [ ] Zero horizontal viewport scrolling (`overflow-x-hidden` on main container) on 375px (iPhone) and 360px (Android) viewports.
- [ ] All primary touch targets (buttons, profile links, navigation pills) meet or exceed `48px` min height.

### Mobile Navigation & Interactivity
- [ ] Sticky or quick-scroll navigation for tournament tabs (`Table | Fixtures | Standings | Bracket | Rules`).
- [ ] Smooth horizontal scrollability for group tables and bracket visualizers with clear swipe cues.

### Build & Code Verification
- [ ] `npm run build` executes with zero compilation errors or missing symbol warnings.
