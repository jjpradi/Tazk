---
id: 2026-04-21-bills-flow-subashini
feature: Purchase Bills → Payment → Vendor Ledger & Outstanding
severity: P1
area: frontend
status: open
reporter: qa.subashini (AI exploratory — code analysis)
fixed_in_commit: null
---

# Bills flow: 4 defects across payment submit, ledger posting, and outstanding report

Consolidated finding per tester request. CLAUDE.md prefers one-file-per-bug — dev team may split F1–F4 below into separate finding files on their side.

> **Run limitation**: Playwright MCP was not available in this session. All observations below are from static analysis of the repo at commit `b4f5023c` on branch `SubaTest`. Items marked *"Needs live test"* in the test plan at [test-plans/bills-flow.md](../test-plans/bills-flow.md) could not be verified against a running app.

---

## F1 — `newpayment.js` submit is a no-op and two props are invoked on render

**Severity**: P1
**File**: [src/pages/sales/payments/newpayment.js](../src/pages/sales/payments/newpayment.js)

### Observed

Three defects in the same file, all in the vendor-payment wrapper component
(`/payments` route):

1. **`handleSubmit` body is entirely commented out** — [newpayment.js:121-165](../src/pages/sales/payments/newpayment.js#L121-L165). The function exists and is bound to the Submit button (line 329) and passed as a prop to `<PaymentPage>` (line 288), but does nothing when called. No API call, no dispatch, no toast.

2. **Props called on render instead of passed as handlers** — line 288 `handleSubmit={handleSubmit()}` and line 290 `handleClose={props.handleClose()}`. The `()` invokes the function at render time, passing `undefined` as the prop. `handleClose` in particular fires on every mount / re-render — if it closes a dialog or navigates, the user sees unexpected behavior on page load.

3. **Orphan `validationHandler`** at lines 82-115 references `formErrors`, `requiredFields`, `regex`, and `capitalize` — none of which are defined in this file. Calling it would throw `ReferenceError`. The only call site is commented out at line 80, so it's dead code, but maintainability risk if someone un-comments the call.

### Expected

- Clicking Submit with a selected vendor should post a payment.
- Handler props should be passed as function references (`handleSubmit={handleSubmit}`), not invoked at render.
- Dead/broken code either removed or made callable.

### Reproduction

Static analysis — no live env available. If a live env exists:

1. Log in as `sales.admin` / `admin@123`.
2. Navigate to Payables → Payment (the route that mounts `NewPayments` from `newpayment.js`).
3. Open browser DevTools → Network tab.
4. Select `QA-Suba Test Vendor`.
5. Click **Submit**.
6. **Observe**: no API request is made. Submit button does nothing.
7. On mount, observe the `handleClose` prop's action fires unexpectedly (dialog closes, navigation, etc., depending on parent).

### Evidence

- [src/pages/sales/payments/newpayment.js:121-165](../src/pages/sales/payments/newpayment.js#L121-L165) — `handleSubmit` commented body
- [src/pages/sales/payments/newpayment.js:288](../src/pages/sales/payments/newpayment.js#L288) — `handleSubmit={handleSubmit()}`
- [src/pages/sales/payments/newpayment.js:290](../src/pages/sales/payments/newpayment.js#L290) — `handleClose={props.handleClose()}`
- [src/pages/sales/payments/newpayment.js:82-115](../src/pages/sales/payments/newpayment.js#L82-L115) — orphan `validationHandler`
- [src/pages/sales/payments/newpayment.js:217](../src/pages/sales/payments/newpayment.js#L217) — `defaultValue` on controlled Autocomplete (related issue: selection state will not stay in sync with `formValues`)

### Root cause (tentative)

Refactor residue — the payment flow appears to have been moved to `<PaymentPage>` / `<ReceiptPayments>` but the wrapper was not cleaned up. The `()` suffix on props looks like a copy-paste mistake from an `onClick={() => handleSubmit()}` pattern being inlined incorrectly.

---

## F2 — `Math.random()` as `getRowId` across 20 report DataGrids (systemic)

**Severity**: P2
**Files**: 20 files listed below — including the Outstanding report directly used by this flow.

### Observed

MUI DataGrid expects `getRowId` to return a **stable** identifier so React can reconcile rows across renders. 20 reports in this app return `Math.random()` instead — meaning every render produces a new row identity:

```
src/pages/accounts/accountReports/AgeingSummaryNew.js         ← Outstanding (this flow)
src/pages/accounts/accountReports/GroupSummaryNew.js
src/pages/sales/brandReport/BrandMarginNew.js
src/pages/sales/misReports/BillProfitNew.js
src/pages/sales/misReports/CashFlowNew.js
src/pages/sales/misReports/CCCDashboardNew.js
src/pages/sales/misReports/CategoryMarginNew.js
src/pages/sales/misReports/CustomerRevenueNew.js
src/pages/sales/misReports/DailyNetProfitNew.js
src/pages/sales/misReports/DailySalesSummaryNew.js
src/pages/sales/misReports/DataQualityNew.js
src/pages/sales/misReports/InventoryTurnoverNew.js
src/pages/sales/misReports/LocationPLNew.js
src/pages/sales/misReports/MonthlyComparisonNew.js
src/pages/sales/misReports/PaymentModeNew.js
src/pages/sales/misReports/ProfitLeakageNew.js
src/pages/sales/misReports/SalesmanPerfNew.js
src/pages/sales/misReports/SupplierPurchaseNew.js
src/pages/sales/misReports/TaxSummaryNew.js
src/pages/sales/misReports/generateMISPages.js
```

**Consequences**:
- Row selection does not persist across sort / filter / pagination.
- Expanded row state is lost.
- DataGrid memoization is defeated — every parent re-render forces a full row re-render, which at 50–200 rows per page is a perceptible perf hit.
- Accessibility — screen readers lose row identity between focus shifts.

### Expected

`getRowId={(row) => row.id}` (or the natural primary key — `party_id`, `vendor_id`, `bill_id`, etc.). If the backend doesn't return an id, construct a stable composite (e.g. `${row.party_id}-${row.type}-${row.period}`).

### Reproduction

1. Navigate to Reports → Outstanding Ageing Summary.
2. Select a row (when selection is enabled).
3. Change sort order or pagination.
4. **Observe**: selection state is lost even though the row is still visible.
5. DevTools → React profiler shows every row re-mounting on every parent render.

### Evidence

- [src/pages/accounts/accountReports/AgeingSummaryNew.js:68](../src/pages/accounts/accountReports/AgeingSummaryNew.js#L68)
- Grep command to find all instances: `grep -rn "getRowId.*Math\.random" src/`

### Root cause (tentative)

Template-copy: one file (likely `generateMISPages.js`) established the pattern and 19 others copied it. Needs a one-line fix per file plus a lint rule (`no-unstable-row-id`) to prevent regression.

---

## F3 — Outstanding Ageing search filters only current page of server-paginated list

**Severity**: P2
**File**: [src/pages/accounts/accountReports/AgeingSummaryNew.js](../src/pages/accounts/accountReports/AgeingSummaryNew.js)

### Observed

The DataGrid uses `paginationMode="server"` with `pageSize` in `[50, 100, 200]` (line 70–71), but the search bar (`CommonSearch`) filters only the data already loaded on the current page:

```js
const filteredData = searchVal
  ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase())))
  : data;
```

— [AgeingSummaryNew.js:54](../src/pages/accounts/accountReports/AgeingSummaryNew.js#L54).

If the user's vendor lives on page 3 (rows 100–150) and they type the vendor name while viewing page 1, **they see zero matches** and will conclude the vendor has no outstanding — which is incorrect.

This matches test plan scenario **O2**.

### Expected

One of:
- Client-side search triggers a server-side `search=...` query that re-fetches across all pages; OR
- Search is disabled when more than one page exists; OR
- UI clearly communicates "searching current page only — switch pages to find others".

### Reproduction

Static analysis. Live reproduction:
1. Ensure > 50 vendors with outstanding exist (pad `QA-Suba Test Vendor` plus enough others).
2. Open Outstanding Ageing Summary.
3. Observe `QA-Suba Test Vendor` appears on page 2.
4. Stay on page 1; type `QA-Suba` in the search box.
5. **Observe**: no match shown. Vendor is invisible despite being in the dataset.

### Evidence

- [AgeingSummaryNew.js:45-54](../src/pages/accounts/accountReports/AgeingSummaryNew.js#L45-L54) — fetch + filter logic
- [AgeingSummaryNew.js:68-72](../src/pages/accounts/accountReports/AgeingSummaryNew.js#L68-L72) — server-pagination config

### Related (not filed separately)

CSV export at line 64 re-fetches with `numPerPage: 10000` and exports the *raw* data — it does **not** apply the active `searchVal`. So a user who searches and exports gets unfiltered output. Same file; flagging here.

---

## F4 — Ledger post is commented out in orphaned `paymentValidate`; live ledger behavior unverified

**Severity**: P1 (pending live verification — could drop to P3 if `<ReceiptPayments>` posts ledger correctly)
**File**: [src/pages/sales/purchases/index.js](../src/pages/sales/purchases/index.js)

### Observed

The `paymentValidate` method ([purchases/index.js:919-1118](../src/pages/sales/purchases/index.js#L919-L1118)) builds a `ledger` object and was designed to post account transactions. All of the following are commented out:

- Lines 996-1015: `this.props.chartOfAccountsIdNameAction(body, (list) => { … accountTransaction.push(dd) })` — the entire Cr/Dr construction loop.
- Line 1017: `// ledger.accountTransaction = accountTransaction;` — the ledger payload is never given its transactions.
- Line 1019: `// this.props.receivingsPayments(this.state.receiving_id, ledger);` — the ledger-post call.
- Line 1020: `// this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)` — the transaction-create fallback.
- Line 1116: `// this.props.receivingsPayments(this.state.receiving_id, ledger);` — duplicate post-submit call, also commented.

The payment save still proceeds via `this.props.paymentEntry(data, ...)` at line 1051. Whether `paymentEntry` posts ledger rows server-side is **not visible from frontend code**.

Compounding this: `paymentValidate` is **orphaned**. Its only caller is the commented-out `<PaymentDialog>` at [purchases/index.js:2688-2730](../src/pages/sales/purchases/index.js#L2688-L2730). The active payment component is `<ReceiptPayments>` at line 2732, which receives a different prop set (no `handleSubmit`). So:

- If `<ReceiptPayments>` posts ledger entries correctly → F4 is P3 cleanup only (remove 200 lines of dead code).
- If `<ReceiptPayments>` inherits the same commented-out pattern → every vendor payment fails to produce a Dr Vendor ledger entry, which breaks the Accounts Payable reconciliation for the entire app.

Auditing [receiptpayment.js](../src/pages/sales/paymentSalesPurchase/receiptpayment.js) (2,558 lines) to confirm was out of scope for this code-analysis session.

### Expected

- Every vendor payment posts a ledger row: Dr Vendor account, Cr Bank/Cash account.
- Vendor ledger total stays consistent with `bill_total − sum(payments)`.
- No orphan dead code in `purchases/index.js`.

### Reproduction (live — required)

1. Note current ledger for `QA-Suba Test Vendor` in General Ledger.
2. Create a purchase bill for 1000. Confirm ledger now shows Cr 1000 on vendor.
3. Make a payment of 1000 via the active payment UI.
4. Return to General Ledger for the vendor.
5. **Expected**: new row Dr 1000 against vendor ledger. Net balance 0.
6. **If no Dr row appears** → F4 is confirmed P1 and the ledger is silently diverging from bills.

### Evidence

- [src/pages/sales/purchases/index.js:919-1118](../src/pages/sales/purchases/index.js#L919-L1118) — orphan `paymentValidate`
- [src/pages/sales/purchases/index.js:996-1015](../src/pages/sales/purchases/index.js#L996-L1015) — commented accountTransaction build
- [src/pages/sales/purchases/index.js:1019](../src/pages/sales/purchases/index.js#L1019) — commented `receivingsPayments`
- [src/pages/sales/purchases/index.js:2706](../src/pages/sales/purchases/index.js#L2706) — orphan `handleSubmit={this.paymentValidate}` inside a commented `<PaymentDialog>` block
- [src/pages/sales/purchases/index.js:2732](../src/pages/sales/purchases/index.js#L2732) — active `<ReceiptPayments>` (different prop set, actual payment path)

### Root cause (tentative)

Incomplete refactor. The ledger-post logic was disabled during a backend migration (moved server-side?) but the legacy handler was never deleted, and the new handler in `receiptpayment.js` needs to be audited to confirm the ledger is still posted end-to-end.
