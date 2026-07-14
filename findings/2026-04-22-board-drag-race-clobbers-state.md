---
id: 2026-04-22-board-drag-race-clobbers-state
feature: Scrum Board — Drag-and-drop between lanes
severity: P1
area: frontend
status: fix-in-progress
reporter: AI exploratory
fixed_in_commit: null
---

# Two or more drops within 1.5s clobber the kanban state — first drop's optimistic move visually reverts

## Observed
`handleDragCard` in [src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js:428-574](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L428-L574) uses a time-based `dragLockRef` (line [136](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L136), set at line [487](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L487)) to block the redux→local-state sync effect at [line 143-153](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L143-L153). But the drop handler itself is a `useCallback` over `[localBoard, sortedBoardDetail, dispatch, id]`.

When a user completes a second drop before React has committed the first drop's `setLocalBoard`, the second invocation still sees the **pre-first-drop** `localBoard` closed over the callback. It then recomputes `optimisticBoard` off that stale base and overwrites state — **losing the first drop's optimistic change from the UI** even though the backend dispatch for the first drop already went out.

Because `dragLockRef` is *also* extended on the second drop, the authoritative redux refresh that would correct the UI is blocked for another 1.5s. Result: card appears in wrong lane until either a manual refresh or the user stops dragging for >1.5s and redux rehydrates.

## Expected
Rapid successive drops should compose: each card ends up in the lane the user dropped it in, regardless of inter-drop timing.

## Reproduction
1. Sign in as `qa.sandhiya` to a board with ≥2 tasks.
2. Drag Task A from "To Do" → "In Progress". Immediately (within ~1 second), drag Task B from "To Do" → "In Progress".
3. Observe: Task A pops back to "To Do" visually. Task B is in "In Progress".
4. Hard-refresh: both tasks are actually in "In Progress" server-side — the optimistic state was desynced, not the persistence.

Variation: do 3 rapid drops; typically only the last one's optimistic change is visible.

## Evidence
- Code reference: [src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js:136](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L136), [:143-153](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L143-L153), [:428-574](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L428-L574).
- Screen recording / network HAR: `findings/evidence/` (to be captured).

## Root cause
Two interacting issues:

1. `previousBoard = localBoard || sortedBoardDetail` at line [434](src/pages/projects/apps/ScrumBoard/BoardDetail/BoardDetailView.js#L434) reads from the stale closure, not from the latest state. React may not have re-created `handleDragCard` yet because `localBoard`'s update hasn't rendered.
2. The 1.5s lock is a lossy stand-in for proper state reconciliation. It suppresses redux corrections but does not protect against drop-handler closure staleness.

## Fix (developer)
- Use the functional `setLocalBoard(prev => …)` form so each drop reads the **latest** base, not the closed-over `localBoard`. Move the optimisticBoard construction inside the updater.
- Replace the time-based lock with a pending-mutations count (ref incremented on dispatch, decremented in callback); only allow redux→local sync when count === 0.
- Regression test: fire two `handleDragCard` calls synchronously and assert both cards end up in their target lanes (unit test on the reducer-shaped logic).
