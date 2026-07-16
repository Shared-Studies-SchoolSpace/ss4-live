# BRIEFING — 2026-07-12T19:25:52+01:00

## Mission
Orchestrate the design and implementation of real-time direct messaging, presence, read receipts, and notification systems.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/kami/Desktop/codebase/ss4/.agents/orchestrator/
- Original parent: Sentinel
- Original parent conversation ID: 32e6d3f3-d3bb-4aa6-9d96-93f4c5d62bd4

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/kami/Desktop/codebase/ss4/PROJECT.md
1. **Decompose**: Split implementation into database setup, presence & last seen, read receipts, notifications, and E2E testing.
2. **Dispatch & Execute** (pick ONE):
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones or tracks.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  - E2E Testing Track [pending]
  - Implementation Track [pending]
- **Current phase**: 1
- **Current focus**: Initialize PROJECT.md and spawn Explorer to investigate database and codebase context.

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself.
- Forensic Auditor verifications must be CLEAN for milestone approval.
- Follow the workflow protocol strictly.

## Current Parent
- Conversation ID: 32e6d3f3-d3bb-4aa6-9d96-93f4c5d62bd4
- Updated: 2026-07-12T19:25:52+01:00

## Key Decisions Made
- Use Project Pattern with Dual Track structure: one E2E Testing Track and one Implementation Track.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_m1 | teamwork_preview_explorer | DB and Codebase Investigation | in-progress | 2c717897-39a1-4932-b720-a52b5a73bc54 |

## Succession Status
- Succession required: no
- Spawn count: 1 / 16
- Pending subagents: [2c717897-39a1-4932-b720-a52b5a73bc54]
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: d24bace0-1877-4b77-8392-446cbacdbce2/task-63
- Safety timer: none

## Artifact Index
- /home/kami/Desktop/codebase/ss4/PROJECT.md — Global index, architecture, milestones, interfaces
- /home/kami/Desktop/codebase/ss4/ORIGINAL_REQUEST.md — Verbatim user request
- /home/kami/Desktop/codebase/ss4/.agents/orchestrator/progress.md — Internal orchestrator progress heartbeat
