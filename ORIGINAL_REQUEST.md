# Original User Request

## Initial Request — 2026-07-12T19:25:36+01:00

SCL real-time direct messaging system for scheduling tournament matches, displaying online status, last seen, read receipts, and system notifications.

Working directory: /home/kami/Desktop/codebase/ss4
Integrity mode: development

## Requirements

### R1. Direct Messaging
- Players can message each other directly.
- Message history is preserved in database and updates in real time using Supabase realtime channels.

### R2. Presence & Last Seen Tracking
- Real-time online/offline presence tracking using Supabase Realtime Presence.
- Display "Last Seen" timestamp for offline users, backed by a `last_seen` column in `profiles` synced on disconnect/heartbeat.

### R3. Read Receipts
- Display read receipts (read/unread status) for messages.
- Supported by a `read_at` (timestamp with time zone) column in `direct_messages`.

### R4. Notifications & Unread Badges
- Add notification indicators (badge counter) to the "Direct Messages" sidebar tab and header tabs.
- Trigger real-time visual toast notifications (using `react-toastify`) when new messages arrive while the user is active on other tabs.

## Acceptance Criteria

### Database Structure
- [ ] Columns `last_seen` (timestamp with time zone) exists in the `profiles` table.
- [ ] Column `read_at` (timestamp with time zone) exists in the `direct_messages` table.

### Presence Tracking
- [ ] Users show as "Online" (green indicator) when connected.
- [ ] Users show as "Last seen: [relative time]" (e.g. "5m ago") when offline.

### Read Receipts
- [ ] Messages show "Sent" or "Read" indicators based on the `read_at` database state.
- [ ] Opening an unread chat thread updates `read_at` for all unread incoming messages in the database.

### Notifications
- [ ] Receipt of a message from another tab increments the unread badge counter in the header/sidebar.
- [ ] Receipt of a message from another tab displays a temporary visual notification toast.
