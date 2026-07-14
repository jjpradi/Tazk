---
id: 2026-04-13-mdn-double-submit-subashini
feature: Manual Debit Note
severity: P2
area: frontend
status: open
reporter: qa.subashini (AI exploratory — code analysis)
fixed_in_commit: null
---

# Confirm button in dialog has no disabled/guard state — rapid clicks can create duplicate debit notes

## Observed

The confirmation dialog's **Confirm** button has no disabled state and no
in-flight guard:

```jsx
// index.js lines 308–320
<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
  <DialogTitle>Confirm Debit Note</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Create debit note for ₹{grandTotal.toFixed(2)}? …
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleSubmit}>Confirm</Button>
    {/* ↑ no disabled={submitting} and no ref guard */}
  </DialogActions>
</Dialog>
```

`handleSubmit` (lines 145–182) calls `setConfirmOpen(false)` and
`setSubmitting(true)` as the first two lines, but both are async React state
updates. Before React re-renders and closes the dialog, a second rapid click on
**Confirm** can invoke `handleSubmit` a second time — at that instant
`submitting` is still `false` and `confirmOpen` is still `true` in the DOM.

Compare with Purchase Return (as noted in `test-plans/purchase-return.md`):
> *"Double-click 'Confirm Return' — Exactly one DN created (guarded by
> `submittingRef`)"*

The Manual Debit Note flow has no such `useRef` guard, unlike Purchase Return.

## Expected

The Confirm button should be disabled after the first click (or a `useRef`
guard should prevent `handleSubmit` from executing a second time while a
request is already in-flight), ensuring exactly one debit note is created per
user confirmation.

## Reproduction

1. Fill the Manual Debit Note form completely (vendor, location, ledger, amount).
2. Click **Create Debit Note** → confirmation dialog opens.
3. Double-click **Confirm** as fast as possible (or use browser devtools to
   throttle the network so the first POST takes > 200 ms).
4. **Actual** (risk): two POST `/manualNotes` requests may be sent — two
   duplicate debit notes created with consecutive DN#s.
5. **Expected**: exactly one note created regardless of click speed.

## Evidence

- Code extract: `findings/evidence/mdn-double-submit-code.txt`
- Network trace showing duplicate POST: browser test required (Playwright MCP
  not installed this session)

## Root cause

`handleSubmit` (index.js line 145) does not set a `useRef` guard before the
async `ManualNotesService.create()` call. React state updates (`setSubmitting`,
`setConfirmOpen`) are batched and applied on the next render, so there is a
window between the first click and re-render during which the button remains
clickable and `handleSubmit` can be invoked again.

## Fix

Add a `submittingRef` guard, same pattern as Purchase Return:

```js
const submittingRef = useRef(false);

const handleSubmit = async () => {
  if (submittingRef.current) return;   // guard
  submittingRef.current = true;
  setConfirmOpen(false);
  setSubmitting(true);
  // … rest of existing code …
  // in finally:
  submittingRef.current = false;
};
```

Also disable the Confirm button while submitting:
```jsx
<Button variant="contained" onClick={handleSubmit} disabled={submitting}>
  Confirm
</Button>
```

- File: `src/pages/sales/manualNotes/ManualDebitNote/index.js`
  (add ref near line 59; update `handleSubmit` at line 145; update button at
  line 318).
- Regression spec: `tests/e2e/specs/manual-debit-note.spec.ts`
  — "rapid double-click Confirm → exactly one DN row in DB".
