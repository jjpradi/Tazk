---
id: 2026-04-22-sprint-dropdown-empty-before-hydrate
feature: Scrum Board — Task detail dialog (Sprint field)
severity: P2
area: frontend
status: fix-in-progress
reporter: AI exploratory
fixed_in_commit: null
---

# Sprint dropdown renders empty (or shows sprint id instead of name) on task-open until `getSprintDetails` redux slice hydrates

## Observed
In [src/pages/projects/AssignTask.js:833-844](src/pages/projects/AssignTask.js#L833-L844):

```js
const sprintOptions = useMemo(() => {
  const sprintList = Array.isArray(getSprintDetails) ? getSprintDetails : [];
  return sprintList.filter(...).map(...).filter(sprint => sprint.id);
}, [getSprintDetails]);

const sprintNameById = useMemo(() => {
  return new Map(sprintOptions.map((sprint) => [String(sprint.id), sprint.name]));
}, [sprintOptions]);
```

`getSprintDetailsAction` is only dispatched when the dialog `open` flips true ([line 995-998](src/pages/projects/AssignTask.js#L995-L998)). Between open and first redux commit, `getSprintDetails` is empty/undefined, so `sprintOptions` is `[]` and `sprintNameById` has no entries.

If the currently-edited task has a `sprint_id`, the dropdown either:
- shows blank label (because `sprintNameById.get(String(id))` is `undefined`), or
- displays the raw id depending on the dropdown renderer, or
- appears placeholder-only despite the task *having* a sprint assigned.

The field flashes/corrects itself once `getSprintDetails` hydrates, which users perceive as "the dropdown lost my sprint".

## Expected
Sprint field shows the assigned sprint name from first render, or shows a loading indicator — not an empty selection.

## Reproduction
1. Sign in as `qa.sandhiya`.
2. Navigate to a board and open an existing task that is assigned to a sprint.
3. Throttle network to "Slow 3G" in DevTools to widen the hydration window.
4. Observe: on first render of the dialog, the Sprint dropdown is empty (no name). After ~500ms–1s the correct sprint name appears.

## Evidence
- Code reference: [src/pages/projects/AssignTask.js:833-844](src/pages/projects/AssignTask.js#L833-L844), [:995-998](src/pages/projects/AssignTask.js#L995-L998).
- Throttled-network screenshot: `findings/evidence/` (to be captured).

## Root cause
The initial render reads the redux slice synchronously before the fetch dispatched inside the same mount has resolved. There is no guard that shows a loading state or defers rendering the dropdown until `getSprintDetails` is populated; and there's no optimistic inclusion of `taskDataForEdit.sprint_id/sprint_name` in `sprintOptions` to bridge the gap.

## Fix (developer)
Pick one:
- Seed `sprintOptions` with a synthetic `{ id: taskDataForEdit.sprint_id, name: taskDataForEdit.sprint_name }` when the id is present but not yet in the list.
- Render a disabled placeholder ("Loading sprints…") while `getSprintDetails` is `undefined` / request is in-flight.
- Prefetch `getSprintDetailsAction` at a higher level (on project load) so the slice is warm by the time the dialog opens.

**Note:** Per project memory, do **not** `useEffect`-seed `sprint_id` into form state — leave the field controlled and just make sure the display layer can render the name during the hydration gap.
