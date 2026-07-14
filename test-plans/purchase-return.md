---
feature: Purchase Return (debit note creation)
owner: Sales team
status: active
last_updated: 2026-04-13
---

# Test Plan: Purchase Return

## Scope
Creating a debit note by returning goods to a vendor — both from a prior purchase invoice and from opening stock, with serialized and non-serialized SKUs.

Out of scope: manual debit notes (separate flow), credit notes (customer side).

## Preconditions
- Role: Administrator (or any role with "Create Purchase Return" permission)
- Data: at least one vendor with prior purchases; at least one opening-stock SKU
- Environment: dev stack (frontend :3000, tzk-sales, tzk-accounts, MySQL `pos_erp_db_dev`)

## Happy Path

1. Sign in.
2. Navigate to Purchases → Debit Notes.
3. Click "Return" (Add Purchase Return).
4. Select Vendor.
5. (Location auto-selects to first branch.)
6. Optional: fill Reference + Comments.
7. Click "Add item manually".
8. Either pick an invoice + product + serial (from-purchase), or pick a product directly from Opening Stock dropdown (no invoice).
9. Adjust qty if non-serialized.
10. Click "Return" → confirm dialog.
11. Click "Confirm Return".
12. **Expected**: new debit note row appears (DB/FY/N). PDF preview opens. Stock reduces. Ledger posts.

## Edge Cases
| # | Scenario | Expected |
|---|----------|----------|
| 1 | Submit with no vendor + no items | Return button disabled |
| 2 | Vendor selected, no items | Return button disabled |
| 3 | Item row with no product selected | On submit: "Row N: product is not selected" |
| 4 | Qty = 0 or negative | "quantity must be greater than 0" |
| 5 | Qty > available stock | Silently clamped to max (Max: N shown) |
| 6 | Qty = non-numeric ("abc") | Reverted to 0 |
| 7 | Decimal qty (e.g. 3.5) on countable SKU | **[open]** currently accepted — should warn |
| 8 | Future Return Date | "Return Date cannot be in the future" |
| 9 | XSS in Reference/Comments (`<script>...`) | Stored as text, not executed; renders safely on PDF |
| 10 | Double-click "Confirm Return" | Exactly one DN created (guarded by `submittingRef`) |
| 11 | Rapid concurrent submits from 2 sessions | No duplicate DN# (guarded by stored-procedure atomic update) |
| 12 | Change vendor/location after adding items | Confirm prompt; clears items on accept |
| 13 | Multi-line mix: opening stock + from-invoice | Both rows accepted; PDF shows both |

## Non-Functional
- PDF must show: vendor, DN#, Reference (incl. user-entered part), Comments, line items, HSN, CGST/SGST breakdown, total in words.
- DN# must be unique per (company_id, sequence_number, type). Enforced by stored proc.
- Reference column stores `"PRRET/FY/N | <user ref>"` format when user-ref present.

## Automated coverage
- `tests/e2e/specs/purchase-return.spec.ts` — happy path, disabled button, future date, double-click race.

## Evidence of last run
- Date: 2026-04-13
- Run by: exploratory (AI) + codified specs
- Result: pass — all P0 findings fixed
- Findings filed: `findings/2026-04-13-purchase-return.md`
