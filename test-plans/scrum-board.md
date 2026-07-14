---
feature: Scrum Board (kanban, task dialog, configuration)
owner: Projects team
status: active
last_updated: 2026-04-22
---

# Test Plan: Scrum Board

## Scope
Kanban board drag-and-drop between lanes, the AssignTask (task detail) dialog including Sprint selection and comments/activity tab, and the Board Configuration sub-menu.

Out of scope: epic list view (covered elsewhere), reporting/burndown.

## Preconditions
- Role: any tester identity from `tester-identities.md`
- Data: project with ≥1 active sprint and ≥2 tasks assigned to distinct lanes
- Environment: dev stack (frontend :3000 + tzk-projects, tzk-common, MySQL `pos_erp_db_dev`)

## Happy Path
1. Sign in.
2. Navigate to Projects → open a scrum project → Board view.
3. Open an existing task → verify Sprint name, Activity, and Comments tabs populate.
4. Drag a task from "To Do" → "In Progress" — lane updates optimistically and persists on refresh.
5. Drag a task into "Testing" — time-log confirm prompt appears if no work logged.
6. Close the dialog; open Board Configuration sub-menu; change a setting; close.

## Edge Cases
| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Open task dialog — inspect Network tab | Exactly 1× `get-activity` + 1× `get-task-comments` per open | **[open]** 2× each (2026-04-22-assigntask-duplicate-activity-fetch) |
| 2 | Open/close Board Configuration sub-menu ~10× | `window` resize-listener count stays constant | **[open]** leaks 1 listener per mount (2026-04-22-configuration-submenu-resize-leak) |
| 3 | Drop task A, then <1.5s later drop task B | Both end up in their target lanes visually and server-side | **[open]** task A visually reverts until refresh (2026-04-22-board-drag-race-clobbers-state) |
| 4 | Open task assigned to a sprint on Slow 3G | Sprint name shown from first render | **[open]** blank until `getSprintDetails` hydrates (2026-04-22-sprint-dropdown-empty-before-hydrate) |
| 5 | Disallowed transition (e.g. Done → To Do) | Alert "workflow transition is not allowed" | pass |
| 6 | Network fail during drag-status dispatch | Optimistic move rolls back | pass |
| 7 | Task dialog timer `useEffect` dep/cleanup review | No dead `clearInterval`, all used values in deps, no unmount leak | **[open]** dead `clearInterval(undefined)` + missing `taskDataForEdit` dep (2026-04-22-assigntask-interval-cleanup-wrong) |

## Non-Functional
- No unbounded listener accumulation across session navigation.
- No duplicate network requests on dialog open.
- Optimistic state must converge with server state within one refresh cycle even under rapid user actions.

## Automated coverage
None yet for this feature.

## Evidence of last run
- Date: 2026-04-22
- Run by: AI exploratory (Sandhiya session)
- Result: 6 open findings (2× P1, 4× P2). Includes one cross-cutting security finding surfaced from the BoardDetail map code (MapTiler key leak).
- Findings filed:
  - `findings/2026-04-22-assigntask-duplicate-activity-fetch.md`
  - `findings/2026-04-22-configuration-submenu-resize-leak.md`
  - `findings/2026-04-22-board-drag-race-clobbers-state.md`
  - `findings/2026-04-22-sprint-dropdown-empty-before-hydrate.md`
  - `findings/2026-04-22-assigntask-interval-cleanup-wrong.md`
  - `findings/2026-04-22-hardcoded-maptiler-api-key.md` (cross-cutting — 7 files, not scrum-board-only)
