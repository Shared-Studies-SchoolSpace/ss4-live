## 2026-07-21T11:59:26Z
You are worker_m1 assigned to Milestone 1: Database Schema Execution & Verification (R1).

Working Directory: `/home/kami/Desktop/codebase/ss4/.agents/worker_m1/`
Identity: teamwork_preview_worker
Parent Conversation ID: 07d05d7b-82ca-4202-95a5-bb11e9afed3d

Task:
1. Examine `docs/db_schema.sql` and the codebase.
2. Verify and create complete SQL migration and schema definition files for:
   - `direct_messages` table (id, sender_id, receiver_id, message, read_at, created_at)
   - `announcements` table (id, title, content, author_id, is_global, created_at, etc.)
   - `notifications` table (id, user_id, type, title, message, link, read_at, metadata, created_at)
   - `profiles` table additions (`last_seen` timestamp)
   - Indexes for performance (profiles.last_seen, direct_messages.read_at, notifications.user_id, etc.)
   - Row-Level Security (RLS) policies for all tables:
     - `profiles`: SELECT by public/all users, UPDATE by self (`auth.uid() = id`).
     - `direct_messages`: SELECT if sender or receiver, INSERT if sender, UPDATE if receiver (`auth.uid() = receiver_id`).
     - `announcements`: SELECT by authenticated/public users, INSERT/UPDATE by admins.
     - `notifications`: SELECT by recipient (`auth.uid() = user_id`), UPDATE by recipient (`auth.uid() = user_id`).
3. Ensure the migration file (e.g. `docs/migrations/01_schema_r1.sql` or updating `docs/db_schema.sql`) is created, valid, and fully documented.
4. Run any existing tests or build commands (`npm test`, `npm run build`, or node verification scripts) to verify syntax and schema compatibility.
5. Record your full progress in `.agents/worker_m1/progress.md` and deliver your handoff report in `.agents/worker_m1/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Send a message to your parent when completed.
