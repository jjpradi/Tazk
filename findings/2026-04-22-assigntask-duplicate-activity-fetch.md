---
id: 2026-04-22-assigntask-duplicate-activity-fetch
feature: Scrum Board — Task detail dialog
severity: P2
area: frontend
status: fix-in-progress
reporter: AI exploratory
fixed_in_commit: null
---

# Opening a task dispatches `getActivityAction` and `getTaskCommentsAction` twice on every mount

## Observed
Each time `AssignTask` dialog opens for an existing task, two separate `useEffect` blocks fire with the same dependency array (`[taskDataForEdit?.id, open]`) and each dispatches the **same** pair of actions:

- [src/pages/projects/AssignTask.js:1000-1011](src/pages/projects/AssignTask.js#L1000-L1011) dispatches `getActivityAction({ taskId })` and `getTaskCommentsAction({ task_id, type:'GET' })`.
- [src/pages/projects/AssignTask.js:1013-1024](src/pages/projects/AssignTask.js#L1013-L1024) dispatches the exact same two actions again (plus unrelated timer logic).

Network tab shows the `get-activity` and `get-task-comments` endpoints hit twice back-to-back on every task-open. In React 18 StrictMode (dev) that becomes **four** calls.

## Expected
One dispatch per action per open.

## Reproduction
1. Sign in as `qa.sandhiya` / QA-Sandhiya Test Vendor.
2. Open any scrum board with tasks.
3. DevTools → Network, filter `get-activity`.
4. Click any existing task card.
5. Observe: 2× `get-activity` and 2× `get-task-comments` requests fired within the same tick (4× each in dev StrictMode).

## Evidence
- Code reference: [src/pages/projects/AssignTask.js:1000-1024](src/pages/projects/AssignTask.js#L1000-L1024)
- Expected screenshot/HAR: `findings/evidence/` (to be captured on next exploratory pass).

## Root cause (suspected)
The second `useEffect` was added for timer-restore logic but the author left the original activity/comments dispatch inside it instead of removing the duplicate calls (the dispatch lives in the first `useEffect` already). Deps on both effects are effectively identical for these dispatches.

## Fix (developer)
- Remove the duplicate `dispatch(getActivityAction(...))` and `dispatch(getTaskCommentsAction(...))` from the second `useEffect` at lines 1022-1023. Keep the timer-restore logic only.
- Regression spec should assert exactly one `getActivityAction` dispatch per task-open (mock `dispatch` in a unit test, or use `msw` to count the fetch).
