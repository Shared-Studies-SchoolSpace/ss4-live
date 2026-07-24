## 2026-07-21T12:47:08Z
You are worker_m3 assigned to Milestone 3: Real-Time DM & Universal Admin Broadcast (R3).

Working Directory: `/home/kami/Desktop/codebase/ss4/.agents/worker_m3/`
Identity: teamwork_preview_worker
Parent Conversation ID: 07d05d7b-82ca-4202-95a5-bb11e9afed3d

Requirements (R3):
1. 1-on-1 Direct Messaging (`DirectChat.jsx`):
   - Real-time message streaming using Supabase Realtime channel (`postgres_changes` listening to `INSERT` and `UPDATE` on `direct_messages`).
   - Read receipts (`read_at` timestamp updated in `direct_messages` when recipient opens/views chat thread; UI indicates read status).
   - Presence tracking: show online status / relative `last_seen` timestamp for contacts using `profiles.last_seen` and Supabase Realtime Presence.
   - Unread badges: display active unread message counts in header/sidebar/chat list.
2. Universal Admin Broadcast (`AdminBroadcastPanel.jsx`):
   - Functional broadcast panel allowing admins to post global announcements (`announcements` table) and dispatch targeted/broadcast notifications (`notifications` table).
   - Accessible and integrated across ALL Admin surfaces, admin page dashboards, and admin drawer views.

Task:
1. Examine `src/components/messaging/DirectChat.jsx`, `src/components/admin/AdminBroadcastPanel.jsx`, admin pages/drawers (`src/pages/admin/` or `src/components/admin/`), `src/components/Header.jsx`, and `src/hooks/useAuth.jsx`.
2. Implement and refine `DirectChat.jsx` for real-time messaging, read receipts (`read_at`), presence (`last_seen`), and unread badges.
3. Ensure `AdminBroadcastPanel.jsx` functions properly and is mounted / integrated into all admin navigation views, panels, and drawer menus.
4. Verify build (`npm run build`) and write node verification scripts testing real-time events, read status updates, and admin panel integration.
5. Log progress in `.agents/worker_m3/progress.md` and handoff report in `.agents/worker_m3/handoff.md`.
