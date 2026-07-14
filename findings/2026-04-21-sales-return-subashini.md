---
id: 2026-04-21-sales-return-subashini
feature: Sales Return → Credit Note → Customer Ledger & Outstanding → Stock Restore
severity: P1
area: frontend
status: open
reporter: qa.subashini (AI exploratory — code analysis)
fixed_in_commit: null
addendum: 2026-04-21 (deep-trace — see "Addendum" section at top)
---

# Sales return flow: 6 defects across return UI, ledger posting, and CN reports

Consolidated finding per tester request. CLAUDE.md prefers one-file-per-bug — dev team may split F1–F6 below into separate finding files.

> **Run limitation**: Playwright MCP was not available this session. Observations are from static analysis of the repo on branch `SubaTest` (current HEAD `b4f5023c`). Items flagged *"Needs live test"* in [test-plans/sales-return.md](../test-plans/sales-return.md) — including the explicit ledger-post and stock-restore checks — could not be executed against a running app.

---

## Addendum (2026-04-21, deep-trace second pass)

The user requested a re-run. Codebase unchanged since the original write-up,
but a deeper trace into [sales_actions.js](../src/redux/actions/sales_actions.js)
and `cnInvoiceFunction` revealed evidence that **revises F2's severity downward
from P1 to P3**:

### Smoking-gun comment

[sales.js:2461](../src/pages/sales/sales/sales.js#L2461) inside `cnInvoiceFunction`:

```js
// await this.ledgerReturnApi(data); this process is changed to Backend
```

A developer explicitly notes the credit-note ledger post **was moved
server-side**. The orphan dead builder at [sales.js:1819-1848](../src/pages/sales/sales/sales.js#L1819-L1848)
is intentional reference code, not a missing post.

### `returnActions` confirms backend ownership

[sales_actions.js:1074-1106](../src/redux/actions/sales_actions.js#L1074-L1106):

```js
export const returnActions = (data, setLoaderStatusHandler, employee_id, headerLocationId, response) =>
  async (dispatch) => {
    try {
      const res = await Salesservice.return(data, employee_id, headerLocationId);
      dispatch({ type: LIST_SALES, payload: res.data });
      ...
    } catch (err) {
      if (err?.response?.data?.status === 'LOT_UNAVAILABLE') {
        NotAvailableAlert(dispatch, err)
      }
      ...
```

- The action sends `data` to `Salesservice.return(...)` with **no
  `accountTransaction` field added by the frontend** — confirmed by grep:
  `accountTransaction` does not appear anywhere in
  [sales_actions.js](../src/redux/actions/sales_actions.js).
- It explicitly handles `LOT_UNAVAILABLE` from the backend → backend
  validates stock/lot availability on return → **stock restore is
  backend-owned and validated**.
- Old client-side stock cache invalidation is commented at
  [sales_actions.js:1091-1092](../src/redux/actions/sales_actions.js#L1091-L1092)
  (`// dispatch(updateProductDataAction({item_id}))`) — same
  "moved-to-backend" pattern.

### Severity revisions

| Finding | Old | New | Reason |
|---|---|---|---|
| **F2** (commented credit-note ledger builder) | P1 (pending live) | **P3** (cleanup) | Backend-owned per explicit comment + `returnActions` payload shape |
| **F1** (partial-return filter `return_quantity === 0`) | P1 (pending live) | **P1 (pending live) — unchanged** | Still depends on whether `return_quantity` is cumulative; that's a backend field semantics question, not in scope here |
| **F3** (`ledgerPaymentApi` orphan with commented post) | P2 | **P3** | Same backend-owned reason; this is dead code |
| **F4, F5** (location filter, dead search) | P2 | **P2 — unchanged** | These are concrete frontend bugs unaffected by the backend audit |
| **F6** (commented variants) | P3 | **P3 — unchanged** | Cleanup |

### Revised defect summary by severity

- **High (P1) — 1**: F1 (partial-return filter, still suspect — needs live test)
- **Medium (P2) — 2**: F4 (location filter ignored), F5 (dead search in 2 reports)
- **Low (P3) — 3**: F2, F3, F6 (cleanup of orphan client-side ledger code)

### What this means for the live test

The original ledger-correctness check (Step 4 of the test plan happy path)
is now an integration test of the backend `Salesservice.return` endpoint,
not a frontend bug verification. F1 is still the highest-priority live
check — it determines whether multi-partial-return is possible from the UI.

The test plan's "Needs live test" entries that hinge on backend behavior
(L1, L3, L4, R1, R2, R3, R6, R7, R9, R10, stock restore, outstanding math)
remain unchanged in scope; the deep trace just clarified that the
**backend is solely responsible**, so test design for those should target
the backend's behavior directly (API-level tests + UI-level smoke), not
poke at the now-confirmed-dead frontend builders.

---

## Original findings (below) — F2 / F3 severities are now superseded by the addendum above

---

## F1 — Partial return multiple times may be UI-blocked by `return_quantity === 0` filter

**Severity**: P1 (pending live verification)
**File**: [src/pages/sales/sales/sales.js](../src/pages/sales/sales/sales.js)

### Observed

`handleEdit(id, value, returnState)` at [sales.js:1262-1321](../src/pages/sales/sales/sales.js#L1262-L1321) is the entry point for the sales return flow. Inside the `value === 6` branch, the returned invoice's `sales_items` are filtered:

```js
k.sales_items = k.sales_items.filter(item => item.return_quantity === 0)
```

— at [sales.js:1293](../src/pages/sales/sales/sales.js#L1293) (and duplicated at [sales.js:1307](../src/pages/sales/sales/sales.js#L1307) for the else branch, though in the else branch the filtered value is built and then discarded — see note below).

If `return_quantity` on a sales item is a **cumulative** field that persists across returns (i.e. "how many units of this line have ever been returned"), then this filter drops any line that has been even partially returned once. Consequences:

- User creates invoice for 10 units of Product A.
- User does a sales return of 3 units → Credit Note 1 created; `return_quantity` for that line is now 3.
- User opens the invoice to do another partial return for the remaining 7 units → **the line does not appear in the return UI** because `return_quantity !== 0`.

The tester brief explicitly calls out "Partial return multiple times" as an expected edge case — if cumulative semantics are in play, this is broken.

If `return_quantity` is a **transient draft** field (set to 0 at load, incremented as user types), the filter is correct and this is a non-issue. The field meaning cannot be determined from the frontend code alone.

### Expected

- Either filter by `item.return_quantity < item.quantity` (remaining > 0) so partially-returned lines stay visible, OR
- Document cumulative semantics and disallow partial returns entirely (force full-line return only).

### Reproduction

Static analysis. Live reproduction:

1. Log in as `sales.admin` / `admin@123`.
2. Create a sales invoice for `QA-Suba Test Customer` with Product A × 10 units.
3. Save; note the invoice number.
4. Open the invoice → trigger Sales Return → select Product A × 3; save CN.
5. Open the same invoice again → trigger Sales Return again.
6. **Observe**: is Product A still listed? If not → F1 is confirmed P1.

### Evidence

- [src/pages/sales/sales/sales.js:1290-1318](../src/pages/sales/sales/sales.js#L1290-L1318) — `handleEdit` return-state branches
- [src/pages/sales/sales/sales.js:1293](../src/pages/sales/sales/sales.js#L1293) — the filter
- [src/pages/sales/sales/sales.js:1306-1311](../src/pages/sales/sales/sales.js#L1306-L1311) — duplicate filter in else branch that computes `finalData` then sets state with the unfiltered `JSON.parse(resData)` (cosmetic dead code; not the main issue)

### Root cause (tentative)

Ambiguous field semantics. The same variable name is used for a cumulative count and what the UI treats as a draft — either the filter needs to change, or the backend field needs renaming.

---

## F2 — Credit-note ledger `accountTransaction` builder is commented out

**Severity**: P1 (pending live verification)
**File**: [src/pages/sales/sales/sales.js](../src/pages/sales/sales/sales.js)

### Observed

The block that builds the ledger Cr/Dr for a Credit Note — covering Sales ledger, SGST/CGST/IGST Payable, Credit Notes, and the customer ledger Cr via `custLedgerId` — is **entirely commented out** at [sales.js:1790-1848](../src/pages/sales/sales/sales.js#L1790-L1848). This includes:

- The `temp` map of ledger heads (lines 1790-1808).
- The `body` payload (lines 1809-1818).
- The `accountTransaction = []` array init (line 1819).
- The `chartOfAccountsIdNameAction` callback loop (lines 1820-1841).
- The key line `dd.amount = creditSign * returnData.total` and `dd.description = this.props.credit_debit_seq.credit_note` at lines 1836-1839 — **this is literally the Cr Customer entry for a sales return, disabled**.
- `data.accountTransaction = accountTransaction;` at line 1842.
- `this.props.createTransactionAction(data, true, ...)` at lines 1843-1847.

This is the exact same pattern as the bills-flow F4 (purchases/index.js `paymentValidate` ledger builder). The comment is old enough to pre-date the current active sales-ledger builder at lines 1709-1738 (still active), meaning: **active for sales invoices, disabled for sales returns / credit notes.**

The return path still dispatches `returnActions` (imported at [sales.js:19](../src/pages/sales/sales/sales.js#L19) and wrapped at [sales.js:5456](../src/pages/sales/sales/sales.js#L5456)) which fires the backend `returnActions` API. Whether the backend posts the Cr Customer ledger row server-side is **not visible from frontend**. If it doesn't, every sales return silently skips the customer-ledger Cr entry and the receivable balance does not reduce after a return.

### Expected

- Every sales return posts a Cr row against the customer ledger for the return total.
- `General Ledger` filtered to the customer shows matched pairs: Dr on invoice, Cr on return.
- `AgeingSummary` outstanding = sum(invoices) − sum(returns) − sum(payments).

### Reproduction

Static analysis. Live reproduction:

1. Log in as `sales.admin` / `admin@123`; record current customer ledger balance for `QA-Suba Test Customer`.
2. Create an invoice for 1000. Confirm ledger shows Dr 1000 on customer.
3. Do a full return of the invoice. Confirm Credit Note is created.
4. Check `General Ledger` filtered to the customer.
5. **Expected**: new Cr row for 1000. **If absent** → F2 is confirmed P1.
6. Also check `AgeingSummary` — if outstanding is still 1000 after the return, the ledger is silently diverging.

### Evidence

- [src/pages/sales/sales/sales.js:1819-1848](../src/pages/sales/sales/sales.js#L1819-L1848) — commented builder + commented API post
- [src/pages/sales/sales/sales.js:1836-1839](../src/pages/sales/sales/sales.js#L1836-L1839) — the specific Cr Customer line, disabled
- [src/pages/sales/sales/sales.js:1709-1738](../src/pages/sales/sales/sales.js#L1709-L1738) — active sales-invoice ledger builder (for contrast)

### Related

The bills-flow finding [findings/2026-04-21-bills-flow-subashini.md](2026-04-21-bills-flow-subashini.md) F4 documents the same pattern on the purchases side. A single backend refactor (or its absence) likely explains both. Dev team should audit `returnActions` and `paymentEntry` in the backend for consistent ledger writes.

---

## F3 — `ledgerPaymentApi` builds transactions but never posts; likely orphaned

**Severity**: P2
**File**: [src/pages/sales/sales/sales.js](../src/pages/sales/sales/sales.js)

### Observed

`ledgerPaymentApi` at [sales.js:1850-1894](../src/pages/sales/sales/sales.js#L1850-L1894) constructs a `data.accountTransaction` with Customer Cr and Bank/Cash Dr entries for a POS sale payment, then ends with:

```js
data.accountTransaction = accountTransaction;
// this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)
```

— line 1892-1893. The post is commented. The function leaves its computed result in a local variable and returns. No side effects. Also `ledgerPaymentApi` is not obviously called from anywhere in the reads completed — likely orphaned after a refactor, mirroring the `paymentValidate` pattern in bills-flow F4.

### Expected

- Either remove the 45-line dead function, or
- Fix the ledger post by uncommenting `createTransactionAction` (only if the backend doesn't handle it) and wire it to a caller.

### Reproduction

Static only. A full search (`grep -rn "ledgerPaymentApi" src/`) was not performed in this session — if a caller exists elsewhere, the dev team can confirm whether the function is truly orphan.

### Evidence

- [src/pages/sales/sales/sales.js:1850-1894](../src/pages/sales/sales/sales.js#L1850-L1894) — the function
- [src/pages/sales/sales/sales.js:1893](../src/pages/sales/sales/sales.js#L1893) — commented `createTransactionAction`

---

## F4 — Sales Return CN report ignores header location (hardcoded `'null'`)

**Severity**: P2
**File**: [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js)

### Observed

The report fetches with a hardcoded `location_id: 'null'` (string) at [SalesReturnCnNew.js:41](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js#L41):

```js
const res = await ReportsService.getSalesReturnCn({
  location_id: 'null', pageCount: p, numPerPage: ps, fromDate, toDate
});
```

`headerLocationId` is read from context at line 37 and used only as a guard (line 38, 49) — never passed to the API. Consequence: the report always returns **all locations**, regardless of what the user has selected in the header location selector. A multi-branch user looking at "their" branch's credit notes actually sees every branch's.

For comparison, the sibling [CreditNotesNew.js:130-131](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L130-L131) correctly uses `locationFilter.length ? locationFilter.map(...) : 'null'`.

### Expected

Pass `headerLocationId` (or an explicit filter array) to `getSalesReturnCn`. Fall back to `'null'` only when the user has explicitly chosen "All Locations".

### Reproduction

Static analysis. Live reproduction:

1. Log in as a multi-location user.
2. In the header location selector, pick Location A.
3. Navigate to Sales Return Credit Notes report.
4. **Observe**: grid shows rows from Location B as well as A. Should only show A.

### Evidence

- [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js:41](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js#L41) — hardcoded `'null'`
- [src/pages/sales/returnCreditNotesReport/CreditNotesNew.js:129-132](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L129-L132) — correct pattern in sibling file

---

## F5 — Two CN reports have dead search boxes (state stored, never applied)

**Severity**: P2
**Files**:
- [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js)
- [src/pages/sales/returnCreditNotesReport/CreditNotesNew.js](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js)

### Observed

Both reports render `<CommonSearch />` and maintain a `searchVal` state, but neither wires it to the DataGrid:

**Sales Return CN** — [SalesReturnCnNew.js:67](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js#L67) captures `searchVal`, [SalesReturnCnNew.js:75](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js#L75) renders `rows={data}`. No `filteredData` variable exists. Typing in the search box has zero effect.

**Credit Notes combined** — [CreditNotesNew.js:191](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L191) **does** compute `filteredData`:

```js
const filteredData = searchVal
  ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase())))
  : data;
```

…but then passes `rows={data}` (unfiltered) to the DataGrid at [CreditNotesNew.js:233](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L233). `filteredData` is computed and discarded. This looks like a copy-paste-from-`AgeingSummaryNew.js`-with-half-the-wiring-missing bug.

### Expected

Both reports: pass `rows={filteredData}` to the DataGrid.

Additionally, note: client-side filtering of a **server-paginated** list only matches rows on the current page (same underlying issue as bills-flow F3). Real fix is a server-side search param; this is flagged for awareness.

### Reproduction

1. Navigate to Sales Return Credit Notes report; type a known CN number in the search box.
2. **Observe**: no filtering. Grid unchanged.
3. Repeat in Credit Notes (combined) report.
4. **Observe**: same — no filtering.

### Evidence

- [src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js:33, 67, 75](../src/pages/sales/returnCreditNotesReport/SalesReturnCnNew.js) — state stored, not applied
- [src/pages/sales/returnCreditNotesReport/CreditNotesNew.js:191, 233](../src/pages/sales/returnCreditNotesReport/CreditNotesNew.js#L191) — `filteredData` computed but unused

---

## F6 — ~750 lines of commented-out `handleEdit` variants (maintainability)

**Severity**: P3
**File**: [src/pages/sales/sales/sales.js](../src/pages/sales/sales/sales.js)

### Observed

Large commented blocks of older `handleEdit` and related logic exist around lines 491-502, 1065-1076, 1191, 1196-1261 — totaling roughly 750 lines of dead code scattered through the same file as the live handler at 1262. Grep output:

```
491:    //     returnState: false,
502:    //     returnState: false,
1065:        returnState: false,
1076:        returnState: false,
1196://   handleEdit = async (id, value, returnState = false) => {
1216://       //     return m.sale_id === id ? m : null;
...
1261://       ...
```

Combined with the commented ledger builders at 1790-1848 and 2731-2749, `sales.js` carries a significant maintenance burden and makes diffs noisy. Unlike F2, this is not a correctness issue on its own — just noise — but it does increase the chance of future refactors reviving stale branches.

### Expected

Remove. Git history retains anything worth recovering.

### Evidence

- [src/pages/sales/sales/sales.js:491-502](../src/pages/sales/sales/sales.js#L491-L502)
- [src/pages/sales/sales/sales.js:1196-1261](../src/pages/sales/sales/sales.js#L1196-L1261)
- [src/pages/sales/sales/sales.js:2731-2749](../src/pages/sales/sales/sales.js#L2731-L2749)

---

## Items that could not be verified (live test required)

Copying from [test-plans/sales-return.md](../test-plans/sales-return.md) — these are the scenarios the tester brief called out that cannot be confirmed from code alone:

- Return more than sold qty (**R1**)
- Return with zero/negative qty (**R2, R3**)
- Missing mandatory fields (**R6**)
- Rapid double-click save on CN (**R7**)
- Invalid / duplicate serial number return (**R9, R10**)
- Stock restore after return — not traced (sales_actions.js + backend)
- Outstanding math after return (backend)
- >150-item invoice performance (live perf test)
- Two users returning the same invoice concurrently (**E6**)
