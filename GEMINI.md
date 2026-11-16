# SS4 Project Development Guidelines & Guardrails

## 1. Component Reuse First
- **Check Before Creating**: Before creating any new UI card, badge, modal, or display component for domain entities (matches, fixtures, players, rankings, brackets, institutions), search `src/features/` and `src/components/` for existing components (e.g., `MatchResult`, `PlayerCardSide`, `DailyFriendliesLeaderboard`).
- **Compose, Don't Duplicate**: Reuse, extend, or compose established components to maintain visual and functional consistency across the platform.

## 2. Mechanical Bulk Updates
- For repetitive or mechanical codebase changes (such as stripping specific badges, renaming labels, or regex-based replacements), execute direct search-and-replace operations immediately.
- Do not spend turns over-analyzing or asking trivial clarifying questions when an exact mechanical operation is requested.

## 3. Structured Sequential Execution
- When handling complex or multi-step prompt specifications, immediately organize the work into an ordered sequential checklist.
- Work systematically down the checklist to prevent stalls or missing requirements.

## 4. Strict Data Authenticity
- Display only real, verified records from official match and tournament data.
- Never introduce dummy or placeholder statistics, simulated results, or fictional players. If data for a period is pending, omit or display only verified records.
