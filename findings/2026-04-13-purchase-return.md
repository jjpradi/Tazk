---
id: 2026-04-13-purchase-return
feature: Purchase Return
severity: P0
area: frontend + backend + db
status: fixed
reporter: AI exploratory
fixed_in_commit: <pending commit>
---

# Purchase Return had 5 critical issues: duplicate DN on double-click, Location state init bug, dropped user Reference, dropped Comments, and PDF rounding inconsistencies

## 1. Duplicate debit note on double-click of "Confirm Return" — P0
**Observed**: Rapid double-click created 2 rows with the *same* DN# (DB/26-27/5 × 2).
**Root cause**: React state (`submitting`) is async — the button stayed clickable until the next render. Additionally, the `creditNote` stored procedure had a read-then-update race so two concurrent calls got the same sequence.
**Fix**:
- Frontend `submittingRef` synchronous guard + disabled button (`PurchaseReturn/index.js`).
- Rewrote `creditNote` SP to use atomic `UPDATE ... SET current_seq = LAST_INSERT_ID(current_seq + 1)`.
- Regression spec: `tests/e2e/specs/purchase-return.spec.ts` — "rapid double-click on Confirm Return creates only one DN".

## 2. Location dropdown shows VIVO but state is empty — P1
**Observed**: First submit always failed with "Please select a Location" even though VIVO was visibly selected.
**Root cause**: Initial state was `''` under All-Location context. Native `<select>` displayed the first option without firing onChange.
**Fix**: `useEffect` seeds `locationId` from the first non-Scrap location when the list loads.

## 3. User-entered Reference overwritten by auto-generated PRRET/ on PDF — P2
**Root cause**: `transaction.model.js` wrote `Reference: data.invoice_number` (PRRET/N), ignoring `data.reference`.
**Fix**: Combined to `"PRRET/N | <user ref>"`. PDF template reads `props[0].Reference` as primary.

## 4. User-entered Comments dropped silently — P2
**Root cause**: Accounts service never persisted `data.comment`. PDF template read `sales_items[0].comments` (which was undefined for purchase return).
**Fix**: Persist `data.comment` into `manual_credit_debit_entry.comments`. PDF template reads `props[0].comments`.

## 5. PDF rounding inconsistency — P3
**Observed**: Item-table "Total" row shows `33869.00` while "Amount in words" says `33,868.71`.
**Status**: Open — left for a future pass (cosmetic, no data loss).

## Minor open items
- Decimal qty accepted on countable SKUs.
- Silent qty clamping (no toast when "999" → 168).
- Pre-existing historical duplicates in `manual_credit_debit_entry` block a blanket UNIQUE constraint; stored-proc fix is the mitigation.

## Evidence
- Golden PDF (post-fix, Reference + Comments correct): `findings/evidence/purchase-return-golden.pdf` — use as visual baseline when regression-testing.
