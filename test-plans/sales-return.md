---
feature: Sales Return (Credit Notes, Customer Ledger, Stock Restore)
owner: qa.subashini
status: active
last_updated: 2026-04-21
---

# Test Plan: Sales Return — Happy Path + Negative + Edge

## Scope

Accounts Receivable / return path end-to-end:
- Sales invoice creation (with many line items, including >150)
- Serialized / non-serialized product handling on returns
- Sales return flow → credit note creation
- Customer ledger entry on return (Cr Customer)
- Outstanding reduction on return
- Stock restore (returned items added back)
- Partial return (once, then multiple times)
- Credit Notes report and Sales Return CN report

Out of scope: Manual Credit Notes (independent from sales), Purchase Returns,
Debit Notes, Delivery Challan returns (`dcreturnActions`).

## Preconditions

- App role: Administrator (login `sales.admin` / `admin@123`)
- Tester identity: `qa.subashini`
- Customer: `QA-Suba Test Customer` (must exist)
- Products: at least one serialized and one non-serialized; stock on hand
- Environment: dev stack, frontend at `http://localhost:3000`

## Key Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Sales master / invoice / return trigger | [src/pages/sales/sales/sales.js](src/pages/sales/sales/sales.js) | 5693 | List, create, edit; **return dispatched via `handleEdit(id, value, returnState=true)`** |
| Invoice print template | [src/pages/sales/sales/cn_invoice/Invoice.js](src/pages/sales/sales/cn_invoice/Invoice.js) | 1374 | Render invoice PDF |
| Sales Return CN report | [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js](src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js) | 87 | KPI + grid of sales-return CNs |
| Credit Notes combined report | [src/pages/sales/returnCreditNotesReport/CreditNotesNew.js](src/pages/sales/returnCreditNotesReport/CreditNotesNew.js) | 259 | Sales Return + Manual CN; `return` vs `manual` chips |
| CN filter component | [src/pages/sales/returnCreditNotesReport/FilterCreditNotes.js](src/pages/sales/returnCreditNotesReport/FilterCreditNotes.js) | 143 | Date / customer / location filters |
| Customer master | [src/pages/sales/customer/index.js](src/pages/sales/customer/index.js) | 1056 | Customer list + edit |
| General Ledger | [src/pages/accounts/GeneralLedger/index.js](src/pages/accounts/GeneralLedger/index.js) | 1251 | Cr/Dr entries |
| Outstanding Ageing | [src/pages/accounts/accountReports/AgeingSummaryNew.js](src/pages/accounts/accountReports/AgeingSummaryNew.js) | 75 | Receivable totals + aging buckets |
| Redux — sales | [src/redux/actions/sales_actions.js](src/redux/actions/sales_actions.js) | 2852 | `returnActions`, `dcreturnActions`, invoice CRUD |
| Redux — CN/DN report | [src/redux/actions/cndn_report_actions.js](src/redux/actions/cndn_report_actions.js) | 65 | `returnCnReportAction` |
| Redux — customer | [src/redux/actions/customer_actions.js](src/redux/actions/customer_actions.js) | 1447 | Customer fetch, invoices |
| Redux — stock ledger | [src/redux/actions/stock_Ledger_actions.js](src/redux/actions/stock_Ledger_actions.js) | 150 | Stock balance per location |

## Happy Path

### Step 1: Create Sales Invoice (with >150 items)

1. Sales → **New Invoice**.
2. Customer: `QA-Suba Test Customer`; Location: your branch.
3. Add 150+ line items — mix of serialized (enter serial numbers per unit)
   and non-serialized products.
4. Click **Save**.
5. **Expected**: Invoice saved; unique invoice number; Cr Sales / Dr
   Customer posted to ledger; stock reduced by sold qty; success toast.

### Step 2: Verify Customer Ledger (post-invoice)

1. Accounts → **General Ledger** → filter by `QA-Suba Test Customer`.
2. **Expected**: new Dr row against Customer (payable from customer
   increased).

### Step 3: Start Sales Return

1. Open the saved invoice from Step 1.
2. Change status / click the return action (triggers
   `handleEdit(id, 6, true)`).
3. The return UI opens; select a subset of items (partial return),
   enter return qty < original qty on some lines.
4. Click **Save** / Create Credit Note.
5. **Expected**: Credit note created, credit_note_number generated,
   customer ledger Cr-posted (reduces receivable), stock restored for
   the returned items.

### Step 4: Verify Ledger + Outstanding + Stock

1. General Ledger filtered to `QA-Suba Test Customer`: new Cr row for
   return amount.
2. Reports → Outstanding Ageing: receivable reduced by return amount.
3. Reports → Sales Return Credit Notes: new row with the CN just created.
4. Stock ledger: returned qty added back at the location.

### Step 5: Multiple Partial Returns

1. Open the same invoice again; trigger return flow again.
2. Select the same line item that was partially returned; try to
   return more.
3. **Expected**: line item still available with `remaining = original − already_returned`.

## Negative / Boundary Matrix

### Sales Return trigger (sales.js)

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| R1 | Return more than sold qty | Block | Filter at [sales.js:1293](src/pages/sales/sales/sales.js#L1293) `item.return_quantity === 0` — semantics of `return_quantity` ambiguous (cumulative vs current-draft). Per-line max-qty guard not visible in this file. **Needs live test.** | Unknown |
| R2 | Return with zero qty | Block | Not visible in this file — **needs live test** | Unknown |
| R3 | Return with negative qty | Block | Not visible — **needs live test** | Unknown |
| R4 | Return without invoice reference | Block | Return is triggered only via `handleEdit(id, ...)` against an existing sale_id; direct-to-CN creation uses `manualNotes/CreditNotesDetails.js` — separate flow, out of scope here | N/A (routes prevent it) |
| R5 | Second partial return on the same line | Row visible with remaining qty | **Suspect**: filter `return_quantity === 0` at [sales.js:1293](src/pages/sales/sales/sales.js#L1293) & [sales.js:1307](src/pages/sales/sales/sales.js#L1307) removes any line with prior returns. If `return_quantity` is cumulative, the second partial return is **impossible from UI**. **Needs live test** — could be **P1 (see F1)**. | **Suspect** |
| R6 | Missing mandatory fields (no line selected) | Block | Not visible — **needs live test** | Unknown |
| R7 | Rapid double-click Save on CN | One CN only | No `isSubmitting` guard visible — **needs live test** | Unknown |
| R8 | Invalid product selection (deleted product) | Block | Not visible — backend-gated | Unknown |
| R9 | Duplicate serial number return | Block | **No client-side serial-number handling visible in [sales.js](src/pages/sales/sales/sales.js)** for the return flow — `serial_number` appears only as a column in the Credit Notes report. Serial validation must be backend. **Needs live test** | Unknown |
| R10 | Invalid serial selection (serial not on invoice) | Block | Same as R9 | Unknown |

### Ledger / Credit Note posting (sales.js)

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| L1 | Sales Return creates Cr Customer row | Yes | **Suspect**: the entire credit-note `accountTransaction` builder is **commented out** at [sales.js:1790-1848](src/pages/sales/sales/sales.js#L1790-L1848) including `this.props.createTransactionAction(...)` at line 1843. If backend `returnActions` doesn't post the ledger server-side, Credit Notes silently skip the Cr Customer entry. **Needs live test** — if confirmed, **P1 (see F2)**. | **Suspect** |
| L2 | `ledgerPaymentApi` posts transaction on sale payment | Yes | `createTransactionAction` at [sales.js:1893](src/pages/sales/sales/sales.js#L1893) is **commented out**; the function builds `accountTransaction` but never posts. Also not obviously called from anywhere — likely orphan. **Needs live test** for the active payment flow. | **Suspect (see F3)** |
| L3 | Outstanding reduces by CN amount | Yes | Backend-computed from AgeingSummary; not verifiable client-side — **needs live test** | Unknown |
| L4 | Round-tripping: Invoice total = CN + remaining outstanding | Yes | Backend math — **needs live test** | Unknown |

### Sales Return CN report ([SalesReturnCnNew.js](src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js))

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| C1 | Location filter via header selector | Grid scoped to selected location | **Broken**: line 41 hardcodes `location_id: 'null'` (string) — fetch always scoped to ALL locations regardless of `headerLocationId`. | **FAIL — P2 (see F4)** |
| C2 | Typing in search box filters visible rows | Yes | **Broken**: `searchVal` state stored (line 33) but never applied — DataGrid uses `rows={data}` at line 75, no `filteredData` construct. Search box is UI-only dead. | **FAIL — P2 (see F5)** |
| C3 | Date-range filter | Rows in range | `fromDate` / `toDate` wired correctly to fetch (line 41, 49); appears functional. | PASS |
| C4 | CSV export reflects filter | Yes | Export call at line 69 re-fetches with same date range but ignores search term (moot since search is broken). | Partial |
| C5 | `getRowId` stable | Yes | Line 75 uses `row.return_id` — stable. | PASS |

### Credit Notes combined report ([CreditNotesNew.js](src/pages/sales/returnCreditNotesReport/CreditNotesNew.js))

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| CN1 | Search filters current page | Yes | **Broken (dead wiring)**: `filteredData = searchVal ? data.filter(...) : data` computed at [CreditNotesNew.js:191](src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L191) but DataGrid on line 233 passes `rows={data}` — `filteredData` is never consumed. Typing in search does nothing. | **FAIL — P2 (see F5)** |
| CN2 | Chip switching (return vs manual) | Refetches | `handleChipChange` at line 145 resets page + refetches — PASS | PASS |
| CN3 | `getRowId` stable | Yes | Composite at line 171 — PASS | PASS |
| CN4 | Adjustment-status chip | Color-coded | Green for "Adjusted" else amber — fine | PASS |

### Edge Cases

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| E1 | Invoice with >150 line items | Saves; no UI freeze | [sales.js](src/pages/sales/sales/sales.js) line-items grid not verifiably virtualized from this read; expected perceptible lag at 150+. **Needs live test**. | Unknown |
| E2 | Partial return then another partial return on same line | Both succeed | See R5 — likely blocked by client filter. **Needs live test**. | Suspect |
| E3 | Duplicate serial number return | Block | No client-side serial check visible. **Needs live test** | Unknown |
| E4 | Return without invoice reference | Block / route-prevented | Flow requires sale_id; direct-CN-to-customer uses manualNotes (separate flow). | PASS (by routing) |
| E5 | Refresh during CN save | Save succeeds or clean error | No draft persistence visible | Data may be lost |
| E6 | Two users returning same invoice concurrently | Second fails cleanly | No optimistic locking visible | **Missing** |
| E7 | Return qty > 0 but invoice already fully paid | Credit note + refund path | Interaction with payments not traced — **needs live test** | Unknown |
| E8 | Large CN value (≥ 10^8) | Renders + math holds | No client cap visible | Partial |

## Workflow / Validation Issues Highlighted

1. **Ledger posting risk (return side)** — commented-out credit-note
   `accountTransaction` block at [sales.js:1790-1848](src/pages/sales/sales/sales.js#L1790-L1848). If the backend `returnActions` API does not post the Cr Customer row server-side, the ledger is silently diverging from sales returns. This is the most important live check.
2. **`ledgerPaymentApi` is a no-op** — builds transactions but
   `createTransactionAction` commented at [sales.js:1893](src/pages/sales/sales/sales.js#L1893); also appears to be an uncalled function. Same pattern as the bills-flow F4 dead `paymentValidate`.
3. **Partial-return semantics** — `return_quantity === 0` filter in
   `handleEdit` is ambiguous. If cumulative, second partial return on the same line is UI-blocked. Decide the field meaning and either (a) relax the filter to `remaining_qty > 0`, or (b) prevent partial returns entirely and require full.
4. **Serial-number handling on returns** not visible client-side — if
   business requires preventing duplicate-serial returns, this must be
   enforced server-side and surfaced in UI.
5. **Report wiring defects** — Sales Return CN report and Credit Notes
   report both have dead search boxes; Sales Return CN also ignores
   header location filter.

## Known Limitations (this run)

- **Playwright MCP not available** — findings are code-analysis-based.
- Files read in full:
  - [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js](src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js) (87 lines)
  - [src/pages/sales/returnCreditNotesReport/CreditNotesNew.js](src/pages/sales/returnCreditNotesReport/CreditNotesNew.js) (259 lines)
- Files read in part (5693-line file, targeted):
  - `sales.js` — `handleEdit` at 1262-1321; ledger-post areas at 1709-1738, 1790-1894, 2731-2749, 2861-2879; mapDispatchToProps at 5440-5490
- Not examined:
  - `sales_actions.js` `returnActions` implementation (2852 lines)
  - Sales line-items grid rendering path inside `sales.js`
  - Stock-restore server-side contract
  - `manualNotes/CreditNotesDetails.js` (direct-CN flow)
- Backend behavior (CN number sequencing, ledger post, stock restore,
  serial validation, concurrency) requires live testing.

## Defect Summary by Severity (revised 2026-04-21 deep-trace)

### High (P1) — 1 (pending live verification)

1. **F1**: `handleEdit` return-flow filters items by
   `return_quantity === 0` at [sales.js:1293](src/pages/sales/sales/sales.js#L1293)
   and [sales.js:1307](src/pages/sales/sales/sales.js#L1307). If
   `return_quantity` is cumulative (not a draft field), **partial return
   multiple times is impossible from the UI** — the line disappears
   after the first partial.

### Medium (P2) — 2

2. **F4**: [SalesReturnCnNew.js:41](src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js#L41)
   hardcodes `location_id: 'null'` — report ignores header location
   selector, always all-locations.
3. **F5**: Dead search UI in two reports:
   - [SalesReturnCnNew.js](src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js) — `searchVal` not applied to DataGrid rows
   - [CreditNotesNew.js:191 vs 233](src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L191) — `filteredData` computed but `rows={data}` used

### Low (P3) — 3 (cleanup; was P1/P2 before deep-trace)

4. **F2**: Credit-note `accountTransaction` builder commented at
   [sales.js:1790-1848](src/pages/sales/sales/sales.js#L1790-L1848).
   **Downgraded from P1**: explicit comment at [sales.js:2461](src/pages/sales/sales/sales.js#L2461)
   ("this process is changed to Backend") confirms the ledger post is
   now backend-owned. The orphan UI builder is dead reference code.
5. **F3**: `ledgerPaymentApi` at [sales.js:1850-1894](src/pages/sales/sales/sales.js#L1850-L1894)
   builds `data.accountTransaction` but the `createTransactionAction`
   call on line 1893 is commented. **Downgraded from P2**: same
   "moved-to-backend" pattern as F2.
6. **F6**: ~750 lines of commented-out handler variants around
   `handleEdit` in `sales.js` (lines 491-1262) — maintainability risk.

### Deep-trace evidence supporting the F2/F3 downgrade

- [sales.js:2461](src/pages/sales/sales/sales.js#L2461) — explicit comment
  "// await this.ledgerReturnApi(data); this process is changed to Backend"
- [sales_actions.js:1074-1106](src/redux/actions/sales_actions.js#L1074-L1106)
  `returnActions` calls `Salesservice.return(data, ...)` — sends raw `data`
  with no `accountTransaction` field; backend builds the ledger.
- `accountTransaction` does not appear anywhere in
  [sales_actions.js](src/redux/actions/sales_actions.js) — confirmed
  via grep.
- `returnActions` explicitly handles `LOT_UNAVAILABLE` from the backend —
  backend validates stock/lot availability on return, so stock restore
  is backend-owned.

## Evidence of Last Run

- Date: 2026-04-21 (initial pass + same-day deep-trace addendum)
- Run by: qa.subashini (AI exploratory — code analysis only; no Playwright MCP)
- Result: 6 findings consolidated into one handoff file per tester request;
  severities revised after deep-trace
- Findings filed:
  - [findings/2026-04-21-sales-return-subashini.md](../findings/2026-04-21-sales-return-subashini.md)
    — revised severities: F1 **P1**, F4 **P2**, F5 **P2**, F2 **P3**
    (was P1), F3 **P3** (was P2), F6 **P3**
- Evidence attached: code excerpts embedded as file:line refs; no UI
  screenshots (no live session). Deep-trace evidence in the
  "Addendum" section at the top of the findings file.
- Note on filing format: CLAUDE.md prefers one-file-per-bug. Dev team
  may split F1–F6 on their side.
