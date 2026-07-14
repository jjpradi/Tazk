---
id: 2026-04-13-mdn-igst-stale-subashini
feature: Manual Debit Note
severity: P2
area: frontend
status: open
reporter: qa.subashini (AI exploratory — code analysis)
fixed_in_commit: null
---

# IGST toggle does not recalculate GST on existing rows — stale closure in useCallback

## Observed

In `useManualDebitNote.js`, `updateItem` is memoised with an **empty dependency
array** but reads `showIGST` from its closure:

```js
// useManualDebitNote.js lines 74–113
const updateItem = useCallback((index, field, value) => {
  setItems(prev => prev.map((item, i) => {
    // …
    if (['amount', 'gst', 'gst_id'].includes(field)) {
      // …
      if (updated.gst && gstRate > 0) {
        if (showIGST) {          // ← captured at first render, never refreshed
          updated.gst_amount = round2((amt * gstRate) / 100);
        } else {
          const halfTax = round2((amt * (gstRate / 2)) / 100);
          updated.gst_amount = round2(halfTax + halfTax);
        }
      }
    }
    return updated;
  }));
}, []);              // ← showIGST missing from deps
```

`showIGST` defaults to `false` (CGST/SGST split mode). If a user:

1. Adds a row, enables GST With 18%, enters Amount 1000  
   → `gst_amount` correctly = 180 (CGST 90 + SGST 90).
2. Toggles the IGST switch (sets `showIGST = true`).
3. Changes the Amount field (e.g. to 2000).

Step 3 triggers `updateItem`, which still has `showIGST = false` in its stale
closure. Result: `gst_amount` is still calculated as CGST+SGST split (360),
but the summary shows IGST mode. The row sub-total and grand total are
numerically the same in this case, but CGST/SGST vs IGST tax-head attribution
is wrong — which affects accounting ledger posting.

The `addRow` dependency on `showIGST` (line 66) shows the intent was to be
IGST-aware, but `updateItem` was missed.

## Expected

When `showIGST` is toggled after rows already exist, any subsequent edits to
those rows should use the current IGST mode. The grand total is unaffected, but
the CGST/SGST vs IGST split recorded in the payload and PDF must match the
selected mode.

## Reproduction

1. Open Manual Debit Note form, select vendor + location.
2. In Line Items: select any Schemes Ledger, Amount = `1000`, GST = With 18%.
3. Verify Summary shows CGST ₹90 + SGST ₹90.
4. Toggle IGST switch ON in the summary panel.
5. Change Amount in the row to `2000`.
6. **Actual**: `gst_amount` on the row is still calculated as CGST+SGST (360),
   but summary shows IGST. The tax split in the submitted payload is wrong.
7. **Expected**: row recalculates as IGST 18% = 360 (single head).

## Evidence

- Code extract: `findings/evidence/mdn-igst-stale-code.txt`
- Screenshot / network payload: browser test required (Playwright MCP not
  installed this session)

## Root cause

`useCallback` at line 74 of `useManualDebitNote.js` has `[]` as its dependency
array. `showIGST` is a `useState` value defined at line 61. Because it is not
listed in deps, the callback captures the value from the first render and never
updates even when the IGST toggle state changes.

## Fix

- Add `showIGST` to the `useCallback` dependency array:
  ```js
  }, [showIGST]);
  ```
- File: `src/pages/sales/manualNotes/ManualDebitNote/useManualDebitNote.js`
  line 113.
- Regression spec: `tests/e2e/specs/manual-debit-note.spec.ts`
  — "toggle IGST after entering amount → payload gst_amount matches IGST
  calculation, not CGST+SGST split".
