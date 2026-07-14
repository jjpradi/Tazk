---
feature: Purchase Bills → Payment → Vendor Ledger & Outstanding
owner: qa.subashini
status: active
last_updated: 2026-04-21
---

# Test Plan: Bills Flow — Happy Path + Negative + Edge

## Scope

Accounts Payable path end-to-end:
- Purchase bill creation (Purchase → Bills)
- Vendor ledger entry on bill save (Cr Vendor / increase payable)
- Vendor payment (Payables → Payment)
- Vendor ledger entry on payment (Dr Vendor / reduce payable)
- Outstanding / Ageing Summary reconciliation (Outstanding = Bill − Payment)
- Multi-bill per vendor, partial payments, search/filter, persistence

Out of scope: Sales receipts (Customer side), Debit Notes, Credit Notes, GRN,
Purchase Orders, Purchase Return.

## Preconditions

- App role: Administrator (login `sales.admin` / `admin@123`)
- Tester identity: `qa.subashini`
- Vendor: `QA-Suba Test Vendor` (must exist)
- Item: `Test Item A` (must exist with a sell-price & purchase-price)
- Environment: dev stack, frontend at `http://localhost:3000`
- At least one stock location assigned to this vendor

## Key Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Bill list / controller | `src/pages/sales/purchases/index.js` | 3158 | List, search, dialogs, payment orchestration |
| Bill create form (header) | `src/pages/sales/purchases/NewPurchaseForm.js` | 440 | Vendor + location + date (items grid is elsewhere) |
| Payment tab wrapper | `src/pages/sales/payments/newpayment.js` | 346 | Customer/Vendor selector + Submit/Cancel wrapper |
| Payment detail / allocation | `src/pages/sales/paymentSalesPurchase/receiptpayment.js` | 2558 | Actual payment entry + ledger post (not fully audited) |
| Payment table | `src/pages/sales/paymentSalesPurchase/index.js` | 1017 | Invoice selection for allocation |
| Vendor ledger (general) | `src/pages/accounts/GeneralLedger/index.js` | 1251 | Cr/Dr entries per account |
| Outstanding ageing | `src/pages/accounts/accountReports/AgeingSummaryNew.js` | 75 | Aging buckets + total outstanding |
| Redux — purchase actions | `src/redux/actions/purchase_actions.js` | 1532 | `paymentview`, `receivingsPayments`, bill CRUD |
| Redux — payment-receipt | `src/redux/actions/paymentReceipt_actions.js` | 405 | Payment entry actions |
| Redux — ledger | `src/redux/actions/ledger_actions.js` | 443 | Ledger fetch/filter |

## Happy Path

### Step 1: Create Purchase Bill

1. Purchase → **Bills** → **Create**.
2. Vendor: `QA-Suba Test Vendor`; Location: pick assigned branch; Date: today.
3. Add `Test Item A` with Qty = 10, Price = 100 (Total = 1000).
4. Click **Save**.
5. **Expected**: Bill created, unique bill number, `purchasesReducer.purchase_outstanding`
   updated, success toast.

### Step 2: Verify Vendor Ledger (post-bill)

1. Accounts → **General Ledger** → filter by `QA-Suba Test Vendor`.
2. **Expected**: one new row with Cr 1000 against Vendor account (payable
   increased).

### Step 3: Make Payment (full)

1. Payables → **Payment** → select vendor `QA-Suba Test Vendor`.
2. Select the bill from Step 1; enter payment amount 1000; pick payment mode.
3. Click **Submit**.
4. **Expected**: Payment saved, bill status = Paid, outstanding for this bill = 0.

### Step 4: Verify Vendor Ledger (post-payment)

1. General Ledger again, same vendor.
2. **Expected**: new row with Dr 1000 against Vendor account. Net balance = 0.

### Step 5: Outstanding / Ageing

1. Reports → **Outstanding Ageing Summary**.
2. **Expected**: vendor line shows outstanding 0; aging buckets all `-`.

## Negative Test Matrix

### Bill Creation (NewPurchaseForm + purchases/index.js save path)

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| B1 | Empty vendor (`supplier_id`) | Block | `requiredFields = ['supplier_id', 'location_id', 'invoice_number']` + `checkerror.supplier_id` flag | PASS |
| B2 | Empty location | Block | `FormHelperText: Location is required!` at [NewPurchaseForm.js:426](src/pages/sales/purchases/NewPurchaseForm.js#L426) | PASS |
| B3 | Empty invoice_number | Block | In `requiredFields` | PASS |
| B4 | Zero-qty line item | Block or total=0 warning | Item grid not in this file — **needs live test** in `purchases/index.js` item-handler | Unknown |
| B5 | Negative qty / negative price | Block | Not visible in NewPurchaseForm — **needs live test** | Unknown |
| B6 | Missing item details (empty item grid) | Block with "Add at least one item" | Not visible — **needs live test** | Unknown |
| B7 | Rapid double-click Save | One bill only | No `isSubmitting` guard visible in NewPurchaseForm; must verify parent submit in `purchases/index.js` — **needs live test** | Unknown |
| B8 | Very long invoice_number (10k) | Truncate or block | No `maxLength` on TextField | Partial |
| B9 | Duplicate invoice_number (same vendor) | Block | Not traced in client — **needs live test** | Unknown |
| B10 | Future-dated receiving_time | Allow or warn | `DatePicker` with no range constraint | Allowed |
| B11 | `Object.keys(value)` on primitive in `validationHandler` line 91 | No error | Guarded by earlier null/''/false checks, but fragile if refactored | Partial |

### Payment Creation (newpayment.js + ReceiptPayments)

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| P1 | Submit with vendor only (no allocation) | Block | Submit button disabled when `supplier_id === null` — PASS at wrapper level | Partial |
| P2 | Click Submit after selecting vendor | Payment saved | **`handleSubmit` body is fully commented** at [newpayment.js:121-165](src/pages/sales/payments/newpayment.js#L121-L165). Button does nothing. | **FAIL — P1 (see F1)** |
| P3 | Mount the newpayment component | UI renders, no side-effects | `handleSubmit={handleSubmit()}` at line 288 and `handleClose={props.handleClose()}` at line 290 — both called on every render | **FAIL — P1 (see F1)** |
| P4 | Pay more than outstanding | Block or warn | Not visible in wrapper — needs audit of `receiptpayment.js` — **needs live test** | Unknown |
| P5 | Pay zero amount | Block | Not visible — **needs live test** | Unknown |
| P6 | Pay negative amount | Block | Not visible — **needs live test** | Unknown |
| P7 | Duplicate payment (same bill, same day) | Warn | Not visible — **needs live test** | Unknown |
| P8 | Vendor autocomplete uses `defaultValue` not `value` | Controlled selection | [newpayment.js:217](src/pages/sales/payments/newpayment.js#L217) uses `defaultValue` — subsequent state changes won't reflect in UI | Suspect |
| P9 | Stale `validationHandler` referencing undefined `formErrors` / `requiredFields` / `regex` / `capitalize` | Never triggers | Dead code since the only call site is commented at line 80 — still a maintainability hazard | Partial |

### Ledger (Cr on Bill / Dr on Payment)

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| L1 | Bill save creates Cr Vendor row | Yes | **Needs live test** — ledger post happens server-side in `receivings` API; no client log | Unknown |
| L2 | Payment save creates Dr Vendor row | Yes | **Suspect**: `paymentValidate` at [purchases/index.js:919-1118](src/pages/sales/purchases/index.js#L919-L1118) has `accountTransaction` build **commented out** (lines 996-1015), `receivingsPayments` call **commented out** (lines 1019 and 1116), and `createTransactionAction` **commented out** (line 1020). This handler is also **orphaned** — wired only to a commented-out `<PaymentDialog>` at line 2706. Active path is `<ReceiptPayments>` ([receiptpayment.js](src/pages/sales/paymentSalesPurchase/receiptpayment.js)); whether that path posts the ledger correctly is **not verified**. | **FAIL — P1 (see F4) + needs live test** |
| L3 | Edit bill amount — ledger reverses + re-posts | Yes | **Needs live test** | Unknown |
| L4 | Delete bill — ledger rows reversed | Yes | **Needs live test** | Unknown |
| L5 | Bill Cr + Payment Dr sum to zero for a fully-paid bill | Yes | **Needs live test** | Unknown |

### Outstanding / Ageing ([AgeingSummaryNew.js](src/pages/accounts/accountReports/AgeingSummaryNew.js))

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| O1 | Outstanding = Bill − Payment for a vendor | Yes | Value comes from `ReportsService.getAgeingSummary` backend; formula not visible client-side. **Needs live test** | Unknown |
| O2 | Search by vendor name across all pages | Finds all matches | **`filteredData = searchVal ? data.filter(...) : data`** at line 54 — filters **only the current page of 50 rows**. Server-paginated list + client-only search = matches on other pages are invisible. | **FAIL — P2 (see F3)** |
| O3 | Row identity stable across re-render (selection, sort) | Yes | `getRowId={(row) => Math.random()}` at line 68 — row id changes every render. Breaks selection, expanded state, MUI-DataGrid memoization. **Same anti-pattern appears in 20 other report files** (misReports/\*, brandReport/\*, accountReports/\*). | **FAIL — P2 (see F2)** |
| O4 | 0-30 / 31-60 / 61-90 / 90+ buckets add up to Outstanding | Yes | Fields populated from backend; no client math. **Needs live test** | Unknown |
| O5 | Negative outstanding (overpayment) | Red styling + alert | Negative is styled red at line 29 (`#C62828`), no explicit alert — UX observation only | Partial |
| O6 | CSV export reflects filtered view | Yes | Export re-fetches with `numPerPage: 10000` — ignores current search/filter; exports raw data | Partial |

### Edge Cases

| # | Scenario | Expected | Code observation | Status |
|---|----------|----------|------------------|--------|
| E1 | Large bill (10^9 total) | Renders; math correct | No numeric cap visible | Partial |
| E2 | Multiple bills, same vendor | All show individually in ledger | **Needs live test** | Unknown |
| E3 | Multiple partial payments → final full | Each row Dr Vendor; final outstanding 0 | **Needs live test** | Unknown |
| E4 | Refresh during Save | Save succeeds or clear error | No draft persistence visible | Data may be lost |
| E5 | Two users pay same bill concurrently | Second fails cleanly | No optimistic locking visible in code | **Missing** |
| E6 | Bill edit impact on existing ledger rows | Reversal + repost | **Needs live test** | Unknown |
| E7 | Bill delete with existing payment allocated | Block or cascade-reverse | **Needs live test** | Unknown |

## Workflow / Validation Issues Highlighted

1. **Ledger posting risk**: the legacy `paymentValidate` path had the entire
   account-transaction construction commented out. The new path via
   `<ReceiptPayments>` (2.5k lines, not fully audited) is the only current
   ledger writer — this must be verified live before any claim that
   "Payment → Dr Vendor" is reliable.
2. **Orphaned `paymentValidate`** in `purchases/index.js` is 200 lines of
   dead code and a cleanup liability.
3. **Widespread `Math.random()` row-id anti-pattern** in 20 reports — not
   confined to bills flow, but directly blocks "select rows in Outstanding
   and take action".
4. **Client-side search on server-paginated tables** — visible in
   AgeingSummaryNew; likely present in the other 20 Math.random reports
   (same template).
5. **`newpayment.js` submit is a no-op** and two props are invoked on
   render instead of passed as handlers — the wrapper can't save a payment
   on its own; only works because `<PaymentPage>` child also binds a
   separate submit path.

## Known Limitations (this run)

- **Playwright MCP not available** — findings are code-analysis-based.
- Files fully read:
  - `src/pages/sales/purchases/NewPurchaseForm.js` (full, 440 lines)
  - `src/pages/sales/payments/newpayment.js` (full, 346 lines)
  - `src/pages/accounts/accountReports/AgeingSummaryNew.js` (full, 75 lines)
- Files partially read:
  - `src/pages/sales/purchases/index.js` lines 2680–2760 and 3000–3059 and 919–1140
- Not examined:
  - `src/pages/sales/paymentSalesPurchase/receiptpayment.js` (2558 lines — contains the **active** payment submit path; most live-test items above hinge on auditing this file)
  - `src/pages/sales/purchases/index.js` bill-save path (items grid handler, submit guard, Save button disabled state)
  - `src/pages/accounts/GeneralLedger/index.js` (1251 lines — Cr/Dr rendering)
  - Redux reducers for purchases / paymentReceipt / ledger
- Backend behavior (bill number sequencing, uniqueness constraints,
  ledger posting, outstanding math, race conditions) requires live
  testing.

## Defect Summary by Severity

### High (P1) — 2

1. **F1**: `newpayment.js` — `handleSubmit` body fully commented (no-op) AND
   `handleSubmit={handleSubmit()}` / `handleClose={handleClose()}` invoke on
   render instead of passing function refs.
2. **F4**: `paymentValidate` in `purchases/index.js` is orphaned (wired only
   to a commented `<PaymentDialog>`) with ledger-post calls commented out.
   Live verification of the active `<ReceiptPayments>` ledger path is
   required before signing off on "Payment → Dr Vendor".

### Medium (P2) — 2

3. **F2**: `Math.random()` used as `getRowId` in 20 DataGrid reports
   (including Outstanding Ageing) — breaks row identity, selection,
   expanded state.
4. **F3**: `AgeingSummaryNew` uses client-only search on a server-paginated
   list — matches on other pages are invisible.

## Evidence of Last Run

- Date: 2026-04-21
- Run by: qa.subashini (AI exploratory — code analysis only; no Playwright MCP)
- Result: 4 findings filed (consolidated into one handoff file per tester request)
- Findings filed:
  - `findings/2026-04-21-bills-flow-subashini.md` (F1 P1, F2 P2, F3 P2, F4 P1)
- Evidence attached: code excerpts embedded; no UI screenshots (no live
  session)
- Note on filing format: CLAUDE.md prefers one-file-per-bug. Dev team may
  split the consolidated file into four separate findings on their side.
