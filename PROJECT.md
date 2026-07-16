# Project: Real-time Direct Messaging System

## Architecture
- **Database**: Supabase PostgreSQL. Tables:
  - `profiles`: user profiles, updated with `last_seen` (timestamp with time zone).
  - `direct_messages`: stores conversation history between players, updated with `read_at` (timestamp with time zone).
- **Presence Tracking**: Supabase Realtime Presence handles online/offline status in the client. Disconnect/heartbeat triggers update to `profiles.last_seen`.
- **Read Receipts**: Tracking message status using `read_at` timestamp. Opening a conversation marks all messages from the counterpart to the user as read.
- **Notifications**:
  - Global context or hook to subscribe to all incoming messages.
  - Displays React-Toastify toasts when a message is received from a user other than the active contact.
  - Dynamic badge counters in navigation bars (Sidebar and Header).

## Code Layout
- `src/components/messaging/DirectChat.jsx`: Main interface for direct messaging.
- `src/components/Header.jsx`: Main header navigation, needs unread badge indicator.
- `src/pages/DashboardPage.jsx`: Main user dashboard page, manages tabs (Statistics, Match Chats, Direct Messages, etc.) and sidebar, needs unread badge indicator.
- `src/supabase.js`: Supabase client initialization.
- `docs/db_schema.sql`: Initial schema definitions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database Schema Update | Add `last_seen` to `profiles`, `read_at` to `direct_messages`. Ensure RLS policies and realtime replication. | None | PLANNED |
| 2 | E2E Testing Scaffold | Establish E2E/integration testing framework. Implement Tiers 1-4 tests and publish `TEST_READY.md`. | M1 | PLANNED |
| 3 | Presence & Last Seen | Implement Supabase Presence tracking. Sync `last_seen` on client disconnect/heartbeat, and display online status/relative last seen times. | M2 | PLANNED |
| 4 | Read Receipts | Implement UI message status indicators and update database `read_at` when chat thread is opened/active. | M3 | PLANNED |
| 5 | Notifications & Badges | Integrate global notification subscription, badge counters on header/sidebar tabs, and react-toastify alerts for incoming messages. | M4 | PLANNED |
| 6 | Integration & Verification | Execute E2E tests, perform Tier 5 adversarial testing, and run forensic audit. | M5 | PLANNED |

## Interface Contracts
### Presence Channel
- Realtime Presence Channel: `scl_presence`
- Presence state keys: `user_id`, `online_at`
- Fallback Sync: On tab close or socket disconnect, client updates `profiles.last_seen` via RPC or directly.

### Messaging Realtime Channel
- Realtime DB changes channel: `public:direct_messages`
- Table changes: LISTEN to insert, update.
- Mark as Read payload: update `read_at = now()` where `sender_id = activeContact.id` and `receiver_id = user.id` and `read_at` is null.
