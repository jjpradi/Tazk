---
id: 2026-04-22-assigntask-interval-cleanup-wrong
feature: Scrum Board — Task detail dialog timer
severity: P2
area: frontend
status: open
reporter: AI exploratory
fixed_in_commit: null
---

# AssignTask timer `useEffect` has dead `clearInterval(undefined)` and missing `taskDataForEdit` dependency

## Observed
In [src/pages/projects/AssignTask.js:2091-2104](src/pages/projects/AssignTask.js#L2091-L2104):

```js
useEffect(() => {
  if (taskDataForEdit !== null) {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(moment().diff(startTime));
      }, 1000);
    } else {
      clearInterval(interval);      // line 2099 — `interval` is always `undefined` here
    }

    return () => clearInterval(interval);
  }
}, [isTimerRunning, startTime]);     // `taskDataForEdit` read in body but not in deps
```

Two problems:

1. **Dead cleanup on the `else` branch** (line 2099). `interval` is declared inside the effect and assigned only inside the `if (isTimerRunning)` branch. In the `else` branch it is always `undefined`, so `clearInterval(undefined)` is a no-op. The code *looks* like it stops the timer when `isTimerRunning` flips false, but actually the old interval is only stopped by React firing the previous run's returned cleanup — which does work, but is hidden by the misleading-looking else branch.
2. **Missing dep `taskDataForEdit`**. It is read inside the effect but not listed in the dependency array. If `taskDataForEdit` transitions from `null` → non-null while `isTimerRunning` and `startTime` stay unchanged, the effect never re-runs to start the interval. This would be flagged by `react-hooks/exhaustive-deps`.

Per code-review only (no reproduction yet), the happy-path **unmount** case does clear the interval correctly — the returned cleanup at line 2102 captures the current run's `interval` via closure. I was **not** able to confirm a post-unmount leak purely from reading the code; the headline "leaks after unmount" needs a live repro to confirm. What *is* definitely wrong is the dead else-branch and the missing dep.

## Expected
- No dead `clearInterval` calls.
- All values read inside the effect are in the dep array.
- Timer cleanup on unmount regardless of the `isTimerRunning` / `taskDataForEdit` combination that was in effect at mount.

## Reproduction
Code-review finding. To reproduce the dep-array bug at runtime:

1. Sign in as `qa.sandhiya`.
2. Mount `AssignTask` for a task where `taskDataForEdit` starts `null` and later becomes non-null while `isTimerRunning === true` (e.g., open dialog then load task data async).
3. Observe `setElapsedTime` never ticks because the effect didn't re-run when `taskDataForEdit` populated.

To probe for a leak, install a `setInterval`/`clearInterval` spy or use DevTools Performance → `setInterval` count across repeated open/close cycles of the task dialog while timer is running.

## Evidence
- Code reference: [src/pages/projects/AssignTask.js:2091-2104](src/pages/projects/AssignTask.js#L2091-L2104)
- Runtime spy capture: `findings/evidence/` (to be captured on next pass).

## Root cause
Author mixed two patterns: a defensive `clearInterval` inside the body AND a returned cleanup. Only the returned cleanup is meaningful because `interval` is declared fresh on each effect run. The else-branch call references a local `interval` that was never assigned.

## Fix (developer)
- Remove the body-level `else { clearInterval(interval) }` — the returned cleanup already handles the "stop on re-run" case.
- Add `taskDataForEdit` (or a stable `taskDataForEdit?.id`) to the dep array — or lift the `taskDataForEdit !== null` check out of the effect entirely.
- Consider guarding the interval on `startTime != null` so the callback does not call `moment().diff(null)` when started before `startTime` is set.

Suggested shape:

```js
useEffect(() => {
  if (!taskDataForEdit || !isTimerRunning || !startTime) return;
  const interval = setInterval(() => {
    setElapsedTime(moment().diff(startTime));
  }, 1000);
  return () => clearInterval(interval);
}, [isTimerRunning, startTime, taskDataForEdit]);
```
