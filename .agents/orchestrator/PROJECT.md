# Project: SS4 Chess League Platform Upgrade

## Architecture
- **Database Layer**: Supabase PostgreSQL tables: `profiles`, `direct_messages`, `announcements`, `notifications`. Column additions: `profiles.last_seen`, `direct_messages.read_at`. RLS policies enabled across all 4 tables.
- **Auth Layer**: `src/supabase.js` custom storage engine proxying `localStorage` when "Remember Me" is enabled and `sessionStorage` fallback when disabled. Auto-refresh tokens enabled.
- **Messaging Layer**: `src/components/messaging/DirectChat.jsx` 1-on-1 realtime DM streaming via Supabase Realtime channels, presence tracking (`last_seen`), read receipts (`read_at`), unread count badges.
- **Broadcast Layer**: `src/components/admin/AdminBroadcastPanel.jsx` integrated into all admin panels and admin drawer views for system-wide announcements and notifications.
- **Notification System**: 9 event triggers (registration open/close, tournament start, fixtures released, opponent assigned, match reminder, rating update, tournament complete, general announcements) writing to `notifications` and posting announcements. Instant unread badge updates and zero state drift.
- **Signup Pre-Flow**: Modal prompt ("Are you a student in a Nigerian Secondary or Tertiary institution?") branching users to student vs general flows. Optional fields: level, university, faculty, department.
- **Player Dashboard**: `src/features/auth-portal/pages/DashboardPage.jsx` optimized via 3-Persona Multi-Agent Debate & Synthesis (Laws of UX, Impeccable, Frontend Design Master) for high-contrast academic-prestige UI.

## Code Layout
- `docs/db_schema.sql` & migrations (`01_schema_r1.sql`): Database schema definitions and SQL scripts.
- `src/supabase.js`: Supabase client and auth persistence configuration.
- `src/components/messaging/DirectChat.jsx`: Real-time direct chat component.
- `src/components/admin/AdminBroadcastPanel.jsx`: Universal admin broadcast drawer / component.
- `src/features/auth-portal/pages/DashboardPage.jsx`: Player dashboard page.
- `src/features/auth/`: Auth pre-flow modal and signup components.
- `src/services/notifications.js` / hooks: 9-event notification engine.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database Schema & RLS Execution (R1) | Ensure tables (`direct_messages`, `announcements`, `notifications`), columns (`last_seen`, `read_at`), indexes, and RLS policies are active and verified. | None | DONE |
| 2 | Persistent Auth & Signup Pre-flow (R5, R6) | `localStorage`/`sessionStorage` auth proxy in `src/supabase.js`, auto refresh, optional school fields, pre-flow modal. | M1 | DONE |
| 3 | Real-Time DM & Admin Broadcast (R3) | `DirectChat.jsx` realtime stream, `read_at`, `last_seen`, badges. `AdminBroadcastPanel.jsx` in all admin surfaces. | M1 | IN_PROGRESS |
| 4 | Fixture Broadcasts & 9-Event Notifications (R2, R7) | Automatic fixture broadcast trigger (announcements + targeted notifications with opponent, round, match link, scheduled time), all 9 notification triggers, `/interface-dream` analysis. | M1, M3 | PLANNED |
| 5 | 3-Persona Player Dashboard Synthesis (R4) | 3-Persona debate (Laws of UX, Impeccable, Frontend Design), consensus synthesis, implementation in `DashboardPage.jsx`. | M1 | PLANNED |
| 6 | Integration, Testing & Forensic Audit | Verification of all build/tests, Tier 5 adversarial testing, and clean Forensic Audit. | M1-M5 | PLANNED |

## Interface Contracts
### Presence & Read Status
- Supabase Presence Channel: `scl_presence`
- Direct Messages Table: `public.direct_messages` (`read_at` updated by recipient)
- Profiles Table: `public.profiles` (`last_seen` updated by user heartbeat/disconnect)

### Notification Payload
- Notification fields: `id`, `user_id`, `type` (1..9), `title`, `message`, `link`, `read_at`, `created_at`, `metadata` (opponent_name, round, match_link, scheduled_time).
