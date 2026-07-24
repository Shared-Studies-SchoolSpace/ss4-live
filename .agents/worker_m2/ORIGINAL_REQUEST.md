## 2026-07-21T13:23:19Z
You are worker_m2 assigned to Milestone 2: Persistent Auth & Flexible Signup Pre-flow (R5, R6).

Working Directory: `/home/kami/Desktop/codebase/ss4/.agents/worker_m2/`
Identity: teamwork_preview_worker
Parent Conversation ID: 07d05d7b-82ca-4202-95a5-bb11e9afed3d

Requirements:
- R5. Persistent Auth Session Handling:
  - Custom storage proxy in `src/supabase.js` using `localStorage` when "Remember Me" is enabled, and `sessionStorage` when disabled.
  - Configure `autoRefreshToken: true` and `persistSession: true` in Supabase client options.
  - Ensure login session persists across page reloads and browser restarts when Remember Me is active, and clears on browser exit when Remember Me is disabled.

- R6. Flexible Student vs General Signup Pre-flow:
  - Ensure non-mandatory fields (`level`, `university`/`school`, `faculty`, `department`) are optional during registration.
  - Maintain/implement the pre-flow modal question ("Are you a student in a Nigerian Secondary or Tertiary institution?") to branch the user into appropriate signup flows (Student flow vs General/Open flow).

Task:
1. Examine `src/supabase.js`, `src/hooks/useAuth.jsx`, and auth components in `src/features/auth/` or `src/components/auth/`.
2. Modify `src/supabase.js` to implement the dynamic storage engine proxy for Supabase auth that checks Remember Me preference (`localStorage` proxy when enabled, `sessionStorage` fallback when disabled) and auto-token refresh.
3. Update auth components/schemas to make school/level/faculty/department non-mandatory and support the student pre-flow branching modal.
4. Verify code changes by building (`npm run build`) and running tests / writing a node verification script for storage proxy behavior and field optionality.
5. Log progress in `.agents/worker_m2/progress.md` and deliver handoff report in `.agents/worker_m2/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Send a message to your parent when completed.
