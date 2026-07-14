---
feature: Manual Debit Note (Purchases)
owner: qa.subashini
status: active
last_updated: 2026-04-13
---

# Test Plan: Manual Debit Note

## Scope

Creating a debit note manually (without referencing a purchase invoice) via
Purchases → Debit Notes → Manual. Covers the full form: vendor/location/date
header, multi-line items table (ledger, description, HSN, amount, GST), TDS,
round-off, and final submission with PDF generation.

Out of scope: purchase-return debit notes (see `test-plans/purchase-return.md`),
manual credit notes, bulk import.

## Preconditions

- Role: Administrator (login `sales.admin` / `admin@123`)
- Tester identity: `qa.subashini` — vendor **QA-Suba Test Vendor**
- Environment: dev stack (frontend http://localhost:3000,
  `tzk-com-services`, MySQL `pos_erp_db_dev`)
- At least one Schemes Ledger of type "Debit" seeded
- At least one location other than "Scrap" exists

## Happy Path

1. Sign in as `sales.admin`.
2. Navigate to **Purchases → Debit Notes**.
3. Click **Manual** (or the + button that opens Manual Debit Note).
4. Verify form header fields: Date (today), Vendor (empty), Location (empty),
   Reference, Comments, Purpose.
5. Type "QA-Suba" in Vendor — autocomplete fires after 2 chars (400 ms debounce).
6. Select **QA-Suba Test Vendor** from dropdown.
7. **Explicitly** change Location dropdown to the desired branch (see Edge Case #1).
8. Optionally fill Reference, Comments, Purpose.
9. In Line Items table, click the ledger autocomplete → select a Schemes Ledger.
10. Enter Amount (e.g. `1000`).
11. Leave GST as W/O or switch to "With" and pick a rate (5 / 12 / 18%).
12. Verify Sub Total = Amount + GST.
13. Verify Summary section: Untaxed Amount, CGST/SGST (or IGST), Grand Total.
14. Click **Create Debit Note** — button enabled only when ledger + amount valid.
15. Confirmation dialog shows grand total — click **Confirm**.
16. **Expected**: success toast "Debit Note created successfully"; PDF preview
    opens; new row appears in Debit Notes list with correct DN#/FY/N.

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | **Location ghost-select** — open form in All-Locations header mode, do NOT touch Location dropdown, fill vendor + item, click Create Debit Note | "Please select a Location" warning toast fires; note NOT created — **currently misleading** because dropdown *visually* shows first location but state is empty (see finding 2026-04-13-manual-debit-note-subashini.md) |
| 2 | Submit with no vendor | "Please select a Vendor" warning toast |
| 3 | Submit with vendor + location but no item ledger | "Create Debit Note" button disabled (isValid = false) |
| 4 | Item ledger selected, Amount = 0 or blank | Button stays disabled |
| 5 | Amount = negative number | `parseFloat` returns negative; button disabled (amount <= 0 check) |
| 6 | Amount = text ("abc") | `parseFloat` returns NaN → treated as 0 → button disabled |
| 7 | GST toggled "With", no rate selected | Button disabled (gst && !gst_id check) |
| 8 | HSN/SAC provided but not `99XXXX` format (e.g. `123456`) | Inline error "Must be 99XXXX"; button disabled |
| 9 | HSN/SAC = `991234` (valid service code) | Accepted; no error |
| 10 | Future date selected | DatePicker `maxDate={moment()}` blocks future dates |
| 11 | **IGST stale closure** — add item with amount, toggle IGST toggle, change amount again | GST recalculation uses old `showIGST` value (stale closure bug — see finding 2026-04-13-mdn-igst-stale-subashini.md) |
| 12 | Double-click Confirm button rapidly | **No guard on Confirm button** — potential duplicate note (see finding 2026-04-13-mdn-double-submit-subashini.md) |
| 13 | Delete row when only 1 row exists | Delete button disabled; row stays |
| 14 | Add 3 rows, same ledger on two rows | Second dropdown filters out already-selected ledger IDs |
| 15 | XSS in Reference / Comments (`<script>alert(1)</script>`) | Stored as text in payload; not executed on form or PDF |
| 16 | TDS — select "Others" category | Manual amount input appears; TDS deducted from Grand Total |
| 17 | Create new ledger via + icon in ledger cell | New Ledger dialog opens; on save, ledger list refreshes and new ledger is selectable |
| 18 | Cancel on confirmation dialog | Dialog closes; note NOT created; form still populated |

## Non-Functional

- Grand Total must equal `untaxedTotal + (CGST+SGST or IGST) - TDS + roundOff`.
- DN# must be unique per company/FY (enforced by backend stored procedure).
- PDF must show: vendor, DN#, date, reference, comments, line items with HSN, GST breakdown, total in words.
- Vendor search must debounce at 400 ms (no request fired for < 2 chars).

## Known limitations (this run)

- Playwright MCP was **not available** in this session — browser tests could not
  be executed live. Findings are based on static code analysis of:
  - `src/pages/sales/manualNotes/ManualDebitNote/index.js`
  - `src/pages/sales/manualNotes/ManualDebitNote/useManualDebitNote.js`
  - `src/pages/sales/manualNotes/ManualDebitNote/DebitNoteItemsTable.js`
- Install Playwright MCP (`claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest`)
  and re-run for browser-verified results with screenshots.

## Evidence of last run

- Date: 2026-04-13
- Run by: qa.subashini (AI exploratory — code analysis, no live browser)
- Result: partial — 3 code-analysis findings filed; happy path not browser-verified
- Findings filed:
  - `findings/2026-04-13-manual-debit-note-subashini.md` (P1 — location ghost)
  - `findings/2026-04-13-mdn-igst-stale-subashini.md` (P2 — IGST stale closure)
  - `findings/2026-04-13-mdn-double-submit-subashini.md` (P2 — double-submit)
