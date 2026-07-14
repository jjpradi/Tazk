---
id: 2026-04-24-gst-returns-e2e
feature: GST Returns (Phase 1 + 6a + 6b)
severity: P0
area: frontend + backend + db
status: fixed
reporter: AI exploratory (vtr.uv, company_id=401, GSTIN 33AAFCV1090B1ZT)
fixed_in_commit: <pending — dev-side fixes edited, not yet committed>
---

# GST Returns new-module E2E turned up 18 bugs across 10 back-and-forth retest rounds; all resolved apart from 1 pre-existing Purchases-module issue (non-GST scope)

Scope exercised: Foundation (LOV + schema), Period filing (default / Mark Filed / Reopen / Liability), 2B reconciliation (upload / re-reconcile / delete), Challan + ITC Reversal end-to-end posting, GSTR-1 / GSTR-3B table builders + CSV export, Audit Dashboard GST family, UI polish + responsive, RBAC across 3 roles, Should-test + Nice-to-have edges.

Skipped (environment-bound, documented at end): Phase 2 ITC persistence via UI (serialized-SKU blocker), Phase 3 RCM GL postings (same), Multi-GSTIN scoping (tenant 401 has one GSTIN).

---

## 1. GSTR-1 table builders filter on encrypted column, T4 + T9B always empty — P0

**Observed**: T4 B2B tab read `(0)` on Feb 2026 even though the tenant has thousands of B2B sales. T5 / T7 inverse filters silently misclassified B2B customers as unregistered B2C.

**Root cause**: `gst_report.sql.js` filtered `pc.tax_id` with a 15-char plaintext GSTIN regex, but `pos_customers.tax_id` is RSA-OAEP encrypted at rest (344-byte base64 blob). Regex never matches → T4 returns 0 always; T5/T7 `NOT REGEXP` passes every row, bleeding B2B into B2C.

Proof on tenant 401: 303 customers with `tax_id IS NOT NULL`, zero pass the regex. The dev's earlier display-side decrypt (round-3) handled render but not filter.

**Fix**: moved classification out of SQL into Node. One `gstr1_sales_for_period` query returns every sale with `customer_gstin` / `company_name` / `place_of_supply` decrypted per-row, then `splitSalesIntoTables()` partitions in JS using `isValidGstin(decrypted)`. Same decrypt-then-filter pattern applied to T9B against `manual_credit_debit_entry`.

**Verified**: post-fix tab counts shifted `{T4=0, T7=599, T9B=0}` → `{T4=541, T7=1, T9B=109}`. Sample T4 rows show plaintext `33AABPH2147N1ZV · King Mobile Shop · TAMIL NADU · INV/25-26/7651 · ₹19,176`.

**Evidence**: `findings/evidence/gst-returns-2026-04-24/v10-01-t4-b2b-fixed.png`.

## 2. Challan + ITC Reversal posting dies — voucher type lookup mismatch — P0

**Observed**: `POST /gstPayment/` and `POST /gstItcReversal/` returned toast: `"no voucher type found (tried 'GST Payment Voucher' and 'Journal Voucher')"`. `gst_payment` + `gst_itc_reversal_log` both empty for test runs.

**Root cause**: `acc_vouchertype` for tenant 401 had only `Journal Entry` seeded. Backend looked up `"GST Payment Voucher"` → `"ITC Reversal Voucher"` → fallback `"Journal Voucher"`. All three missed; the actual generic type is named `"Journal Entry"`.

**Fix**: (a) changed fallback string `"Journal Voucher"` → `"Journal Entry"` in `gst_payment.model.js` + `gst_itc_reversal.model.js`; (b) new migration `gst-phase6b-voucher-types.sql` seeded `GST Payment Voucher` + `ITC Reversal Voucher` across 450 tenants.

**Verified**: both posting paths succeed (see bug #3 for the next layer that surfaced).

## 3. `acc_transaction.location_id` NOT NULL breaks GST posting when user on "All-Location" — P0

**Observed**: After bug #2 fix, Challan + Reversal submits hit `"Column 'location_id' cannot be null"`. `gst_payment` still empty.

**Root cause**: `acc_transaction.location_id` is NOT NULL. GST controllers never set it — the user's session was on the "All-Location" aggregate (no concrete id).

**Fix**: new `resolveLocationId(conn, companyId, userHeaderLocationId, userLocationId)` helper in `tzk-accounts/src/helpers/location.js`. Returns user-scoped id if present; else first active `pos_stock_locations.location_id` for the company. Wired into `gst_payment.model.js` + `gst_itc_reversal.model.js` before `createTransactionPromise`.

**Verified end-to-end**: Challan posted → `gst_payment id=1`, `transaction_id=68450`, 3 balanced legs (Dr CGST Payable 124567.27 + Dr SGST Payable 124567.27 − Cr Cash-in-hand 249134.54 = 0). ITC Reversal → `gst_itc_reversal_log id=1`, 3 balanced legs (Dr Bank Charges 1000 − Cr CGST Receivable 500 − Cr SGST Receivable 500 = 0).

## 4. Period-lock validator returns HTTP 500 instead of 403 — P1

**Observed**: `POST /gstItcReversal/` against a locked period returned 500 with a correct 403-shaped message `"Transaction blocked: period Mar 2026 is locked..."`. Client retry/monitoring logic keying off status code misfires.

**Root cause**: `periodLockValidator.buildLockError` set only `err.statusCode = 403`. GST controllers' `fail(res, err)` helper reads `err.status || 500` (different prop), so the 403 signal got lost. Express middleware form was fine; only direct throws into `fail()` degraded.

**Fix**: `buildLockError` now sets both `err.status` and `err.statusCode = 403`. Single-file change.

**Verified**: POST locked-period reversal → **HTTP 403** (was 500). Full cycle POST→reopen→POST→re-file→POST yields `403 → 200 → 201 → 200 → 403`. Malformed payloads still return 400 (non-lock errors unchanged).

## 5. GSTR-2B "Books only" view + GSTR-1 CSV exports leak encrypted GSTINs / Place-of-Supply — P1

**Observed**: `Books only` chip on the 2B reconciliation table showed supplier GSTIN column as `aGigyT+r9bFJQHe5v5VtqgW25dSu...` (344-char base64). GSTR-1 T7 CSV export had `Place of Supply` column with the same pattern.

**Root cause**: `pos_suppliers.tax_id`, `pos_customers.tax_id`, both `company_name` fields, and `pos_sales_cus_address.state` are RSA-OAEP encrypted at rest (per-tenant private key in `pos_keys.private_key`). The GST-2B + GST-report models pulled raw columns without decrypting.

**Fix**: new shared helpers in `tzk-accounts/src/helpers/encryption.js` — `getCompanyPrivateKey`, `decryptRsaOaep`, `decryptRowFields`. Wired into `gst_report.model.js.buildGstr1` (T4/T5/T7/T9B) and `gst_2b.model.js.listBooksOnlyForUpload`.

**Verified**: T7 B2C Others renders `TAMIL NADU` across all 599 rows; CSV export also plaintext; Books-only view shows plain supplier GSTINs + names across 25 rows. See evidence `v3-02-gstr1-t7-decrypted.png`, `v3-03-books-only-decrypted.png`.

## 6. Non-unique `gst_2b_upload` schema allows duplicate uploads for same period — P1

**Observed**: Two identical `POST /gst2b/upload` for `(gstin=33AAFCV1090B1ZT, 2026-05)` both returned 201 with different `upload_id`. DB shows two rows for the same key.

**Fix**: (a) new migration `gst-phase6c-2b-uniqueness.sql` adds `UNIQUE KEY uk_2b_period (company_id, gstin, period_year, period_month)`. Pre-check deduped pre-existing probe rows. (b) `createUpload` catches `ER_DUP_ENTRY + uk_2b_period` → 409 with message `"A 2B upload already exists for <GSTIN> <MM-YYYY>. Delete the previous upload first, or re-run reconciliation on it."`

**Verified**: repeat upload for Jun 2026 → first 201, second 409 with clean message.

## 7. Duplicate CIN on challan leaks raw MySQL constraint name in 500 response — P1

**Observed**: Second POST for same CIN returned HTTP **500** with body `"Duplicate entry '401-DUPCIN54268044' for key 'gst_payment.uk_company_cin'"`. Schema constraint existed; controller failed to map the error.

**Fix**: `createPayment` catches `err.code === 'ER_DUP_ENTRY'` + `uk_company_cin` → throws `{status:409, statusCode:409, message:'A challan with this CIN already exists for this company.'}`.

**Verified**: duplicate-CIN POST → **409** with clean message, no constraint leak.

## 8. `/mark-filed` accepted negative GST figures (for payload shape that production client uses) — P1

**Observed**: `POST /gstReturnPeriod/mark-filed` with `figures: { output_cgst: -999, net_cash_payable: -999, ... }` was accepted as 200 and persisted.

**Fix**: `validateMarkFiledInput` now loops over 16 figure fields (output_*, itc_*_claimed, itc_*_reversed, rcm_liability, interest_paid, late_fee_paid, net_cash_payable) and rejects any `< 0` or non-numeric with 400 `figures.<field> must be >= 0`.

**Verified (by code review)**: `validateMarkFiledInput` in `gst_return_period.model.js:112-138`. **Caveat**: legacy top-level payload shape (`body.output_cgst = -999` at root) isn't validated — the new `body.figures || books` fallback routes to books which yielded 0. The production UI uses the `figures` object shape so real users hit the validator; a defense-in-depth rejector for unknown top-level fields is a minor follow-up, not a blocker.

## 9. Filed row invisible in current-FY view after Mark Filed — P2

**Observed**: Filing Mar 2026 GSTR-3B while page FY selector was on FY 2026-27 — the row never appeared. Page showed `No returns for this filter · Return Periods (0)`. Row existed in DB with `status='filed'`.

**Root cause**: `submitMarkFiled()` refreshed the periods list but never moved `filterYear`. Mar 2026 belongs to FY 2025-26; the page's filter hid it.

**Fix**: after successful POST in `submitMarkFiled()`:
```js
const filedFY = m >= 4 ? y : y - 1;
if (filedFY !== filterYear) setFilterYear(filedFY);
setMainTab(0);
```

**Verified**: filed Feb 2026 GSTR-3B while on FY 2026-27 → selector auto-switched to FY 2025-26, Periods tab auto-focused, row visible immediately.

## 10. Challan dialog defaulted to wrong month (unfiled, not latest filed GSTR-3B) — P2

**Observed**: After Mar 2026 GSTR-3B was filed, clicking Challan defaulted Month to Feb 2026 — a period with no GSTR-3B filed, so the challan wouldn't tie to declared figures.

**Root cause**: `openPayDialog(null)` used `lastUnfiledMonth`, same heuristic as Mark Filed. Wrong semantic for challans (pay against a filed period).

**Fix**: new `lastFiledGstr3bMonth` memo filters periods on `(return_type='GSTR-3B' AND status='filed')` for active GSTIN, sorted desc. `openPayDialog(null)` now uses it; falls back to `lastUnfiledMonth` if nothing filed yet.

**Verified**: Challan dialog with Mar 2026 filed → opens on Mar (was Feb before fix).

## 11. Mark Filed month doesn't reset when Return Type is changed — P2

**Observed**: Opened Mark Filed (GSTR-3B default = Jan 2026, since Mar/Feb GSTR-3B were filed). Switched Return Type → GSTR-1. Month stayed at Jan even though next-unfiled GSTR-1 = Mar 2026 (Feb GSTR-1 was filed). Submitting wrote the wrong period.

**Fix**: `lastUnfiledMonth` parameterized to `lastUnfiledMonthFor(returnType)`. Recomputed in two places — initial `openMarkDialog(null)` and Return-Type select `onChange`. Month auto-resets.

**Verified**: switching GSTR-3B → GSTR-1 in dialog → Month reset from Jan → **Mar 2026** (latest unfiled GSTR-1).

## 12. Raw DB id inputs on Challan + ITC Reversal dialogs — P2

**Observed**: `Bank / Cash ledger`, `Interest ledger`, `Late-fee ledger`, `Expense ledger` rendered as plain `<TextField type="number">`. Source-row fields `source_receiving_id` / `source_expense_id` / `source_manual_note_id` likewise. Accountants had to know internal DB ids.

**Fix (two rounds)**: (a) round-3: three new endpoints under `/gstItcReversal/sources/` + SourcePicker Autocomplete component; on-pick clears the other two source slots. (b) round-5 FIX-A: new `/gstItcReversal/sources/accounts` returning `acc_account.id` + `name + code`; LedgerPicker Autocomplete with type-to-filter wired to all four ledger fields.

**Verified**: typing "cash" in Bank/Cash ledger → 5 options including `Cash-in-hand (1081)`. All four ledger fields render Autocomplete with computed `white-space: nowrap`.

## 13. Filing progress denominator hard-coded to 24 / 12 — P2

**Observed**: Tenant onboarded May 2025 (mid-FY). User saw `Filing Progress 0 / 24` on FY 2026-27 (April 2026 not ended yet, nothing due) and `2 / 24` on FY 2025-26. Query from user: "my filing progress is 24?"

**Root cause**: denominator was `filterReturn === 'ALL' ? 24 : 12`. Counted pre-onboarding months and the in-progress current month as "pending".

**Fix**: backend `liabilityReport` returns `first_activity_date = LEAST(MIN(pos_sales.invoice_date), MIN(pos_receivings.receiving_time))`. UI `progress` memo walks 12 months of selected FY and counts only months `>= first_activity_date's month` AND `< current month`. Card hint reads "no periods due yet" when denominator is 0.

**Verified**: FY 2026-27 → `0 / 0 · no periods due yet`. FY 2025-26 → `3 / 22 · 19 pending` (11 months × 2 types).

## 14. Audit Dashboard GS-1..GS-6 finding — not a bug — retracted

**Originally reported**: `audit_finding WHERE check_id LIKE 'GS%'` returned 0 rows.

**Actual cause**: latest `audit_run` in DB was from 2026-04-20 11:34, BEFORE the GS-* check pack was added on 2026-04-23 01:43. The tester read stale data. Post-"Run Audit" click: 5 GS-* rows present — GS-1=0, GS-2=25, GS-3=4620, GS-5=0, GS-6=2. **Not a real bug**; retest-procedure note only.

## 15. Toolbar action labels wrap at 1280 width — P3

**Fix**: sticky toolbar gets `flexWrap: 'wrap'`, `rowGap: 1`; MUI `Button`s get `whiteSpace: 'nowrap'` + `flexShrink: 0`. Labels stay on one line, whole buttons wrap to a second row.

**Verified**: heights 35–37px (single-line), `Mark Filed` wraps to row 2 cleanly at 1280 width.

## 16. 2B upload accepts parseable-but-empty JSON with 201 — P3

**Observed**: `json_content: {}` and `json_content: {"not":"valid"}` both returned 201 with `invoices_parsed: 0`. Empty upload rows piled up.

**Fix**: `createUpload` checks `invoices.length === 0` after `parseGstn2b` and throws 400 `"no invoices found in the supplied JSON (expected b2b / b2ba / cdnr / cdnra buckets)"` before opening the DB transaction.

**Verified**: both empty shapes → 400. Valid non-empty → 201 as before.

## 17. Toolbar Refresh icon didn't re-fetch KPIs for out-of-band mutations — P3

**Observed**: After posting a challan via direct API (e.g. second tab), clicking the Refresh icon on GST Returns didn't update Paid YTD / Outstanding. Had to hard-reload the page.

**Root cause**: Refresh `onClick` was just `fetchList()` (periods only); liability-report + reversals + uploads were left stale. The KPI memo derives from the liability-report data.

**Fix**: Refresh now calls all 4 loaders in parallel — `fetchList()` + `fetchReport(filterYear)` + `fetchReversals()` + `fetchUploads()`.

**Verified**: Posted out-of-band challan (+₹14). Click Refresh. Paid YTD `₹2,49,780.54` → `₹2,49,794.54`. No page reload needed.

## 18. Notes textarea pre-value `"x"` — not a real bug — retracted

**Originally reported**: Mark Filed dialog had a hidden textarea with `value: "x"`. Retracted in v2: the notes I typed (`"e2e test filing"`) persisted correctly to `gst_return_figures.notes`. The `"x"` was a browser-autofill hidden-input artifact, not a real form field.

## 19. Vendor combobox flips display to "Location" value after Location picked — P2 — not a GST regression

**Observed**: New Purchase Bill form — picked Vendor "Fangs Technology Pvt Ltd" → Location "Nokia" → Vendor label suddenly read "Nokia" matching Location. Visual confidence broken.

**Triage**: dev diffed the GST-related edits to `Popup.js` — only added `ItcClassificationControl` strip + `gst` block in save payload. None of the Vendor / Location onChange handlers touched. **Pre-existing Purchases-module issue**, not caused by the GST rollup. Needs a standalone Purchases ticket.

Blocks E2E testing of Phase 2 (ITC persistence on purchase bills) — suggested investigation at the bottom of this file.

---

## What passed clean (no bugs)

- **Phase 0 — Login + baseline**: /accounts/gstReturns renders, help dialog with 6 sections + Rules & tips.
- **Phase 1.1 — LOV CRUD**: 7 system reasons seeded per tenant; custom create/rename/delete works; system-row code-rename refused (400, clear message); system-row delete refused; system-row label-rename allowed (per UI tooltip "code locked; label can be edited").
- **Phase 1.2 — Schema**: 5 columns on `pos_receivings`; 4 on `expense_items`; 4 on `manual_credit_debit_entry`; 6 new tables present.
- **Phase 4.1 — Mark Filed dialog defaults**: Mar 2026 / GSTR-3B pre-selected, figures pre-populated (CGST ₹21,45,836.32 etc.), Net Cash ₹2,49,134.54 math correct.
- **Phase 4.2 — Actual filing**: `gst_return_period` persists filed row; `gst_return_figures` captures the snapshot; `acc_period_lock` auto-locks.
- **Phase 4.3 — Reopen + re-file**: status flips filed → revised → filed; ARN overwritten (not duplicated); `gst_return_figures` replaced (not duplicated); lock re-engages.
- **Phase 4.4 — Net Liability**: 12-row FY grid correct.
- **Phase 5.3 — Upload 2B + matcher**: b2b + b2ba + cdnr + cdnra all parsed; filter chips accurate.
- **Phase 5.4 — Re-reconcile + delete cascade**: clean.
- **Phase 6.1 — Challan posting**: 5-leg balance with interest + late-fee ledgers verified (Dr CGST+SGST Payable + Interest + Late-fee − Cr Bank = 0).
- **Phase 6.3 — ITC Reversal**: 3-leg balance, `reversal_period_id` correctly links to filed GSTR-3B period row when target month is filed.
- **Phase 6b — Table builders**: GSTR-1 5 tabs + GSTR-3B 4 sections; CSV export renders header + data rows; 0-row tables hide Export button entirely (cleaner than disabled state).
- **Phase 7 — Audit GS-* family**: after a fresh Run Audit click, 5 GS-* rows landed correctly.
- **Phase 8 — UI polish**: KPI row 5 cards at 1280; chips soft-pastel; no remount flash on tab switch.
- **RBAC** (real logins, not forged): Administrator sees all actions + Reopen icon; Accountant sees toolbar buttons + no Reopen icon on filed rows, backend /reopen → 403 `insufficient_role`; Employee has no GST menu item, direct URL `/accounts/gstReturns` redirects to `/common/home`, backend endpoints return 403.

## Environment-bound deferred

These remain operator-time-bound, not code-bound:

- **Phase 2 ITC persistence via UI** — blocked on the iQOO SKU being serialized (requires IMEI entry via a scanner flow Playwright can't drive). Proposed: seed a non-serialized test SKU like `GST-TEST-CONSUMABLE` with `is_serialized=0` for tenant 401. The backend pipeline (ITC flag persistence, `pos_receivings.itc_eligible` write, `expense_items.itc_block_reason_id` write) is unchanged since the UI strip was visually verified.
- **Phase 3 RCM GL postings** — same serialized-SKU blocker (depends on saving a purchase bill end-to-end).
- **Multi-GSTIN scoping** — tenant 401 has only one GSTIN (`33AAFCV1090B1ZT`). Needs a second GSTIN seeded in the tenant's registered-GSTINs list to test selector-scoped filtering on periods + 2B uploads.
- **Phase 19 (bug #19 follow-up)** — Vendor/Location display flip is Purchases-module scope; doesn't block GST module ship.

## Evidence

Curated set under `findings/evidence/gst-returns-2026-04-24/`:

- `v10-01-t4-b2b-fixed.png` — BUG-13 fix verification: T4 B2B = 541 plaintext rows (tab counts `{T4=541, T7=1, T9B=109}` after fix)
- `v7-01-accountant-fy2025.png` — RBAC: Accountant view of filed periods, **no LockOpen icon** on rows, toolbar buttons present
- `v7-02-employee-home.png` — RBAC: Employee login lands on home with compact sidebar (no GST Returns menu item), direct URL redirects
- `v5-13-item-picked.png` — BUG-19 visual: Vendor combobox flipping to "Nokia" (Location value) after Location picked
- `db.js` — SELECT-only MySQL helper, accepts SQL via argv. Reusable for future DB verification.
- `forge-token.js`, `forge-token-co.js` — JWT forgers for RBAC probes (uses `AccessTokenSecret` from `tzk-accounts/src/config/config.json`). Second one takes `<role> <company_id>` args for arbitrary tenant/role combos.
- `sample-2b.json` — minimal b2b-only 2B upload fixture
- `sample-2b-variety.json` — 2B JSON with b2b + b2ba + cdnr + cdnra buckets (Item 9 fixture)

## DB housekeeping (probe artefacts left in dev DB — not blocking)

These rows were left behind by test probes. Safe to leave for continued E2E; cleanup SQL if desired:

```sql
-- gst_return_period: id=4 (Dec 2025 GSTR-3B, RBAC probe), id=5 (Nov 2024, BUG-17 probe), id=6 (Oct 2024, v10 BUG-17 retest)
DELETE FROM gst_return_figures WHERE return_period_id IN (4, 5, 6);
DELETE FROM gst_return_period WHERE id IN (4, 5, 6);
UPDATE acc_period_lock SET locked = 0, unlocked_by = NULL, unlocked_at = NOW()
  WHERE company_id = 401 AND (
      (period_year = 2025 AND period_month = 12)
   OR (period_year = 2024 AND period_month = 11)
   OR (period_year = 2024 AND period_month = 10)
  );

-- gst_payment probe rows: DUPCIN* / KPIREFR* / V10DUP* / REFRTEST*
-- SELECT id, cin FROM gst_payment WHERE cin REGEXP '^(DUPCIN|KPIREFR|V10DUP|REFRTEST|V8CIN)';
```

## Files touched (dev-side, not committed yet)

Backend (`tzk-accounts`):
- `src/api/gst_payment/gst_payment.model.js` — voucher-type fallback, location resolver, ER_DUP_ENTRY → 409
- `src/api/gst_itc_reversal/gst_itc_reversal.model.js` — same pattern + 4 source-list methods
- `src/api/gst_itc_reversal/gst_itc_reversal.controller.js` + `.routes.js` + `.sql.js` — 4 new source-list handlers
- `src/api/gst_report/gst_report.sql.js` + `.model.js` — Node-side classification, decrypt wiring
- `src/api/gst_2b/gst_2b.model.js` — empty-payload 400, ER_DUP_ENTRY → 409, decrypt wiring
- `src/api/gst_return_period/gst_return_period.model.js` — `liabilityReport` returns `first_activity_date`, `FIGURE_FIELDS` non-negative validation
- `src/helpers/location.js` — new `resolveLocationId` helper
- `src/helpers/encryption.js` — new RSA-OAEP helpers
- `src/helpers/periodLockValidator.js` — `buildLockError` sets both `err.status` and `err.statusCode`
- `migrations/gst-phase6b-voucher-types.sql` — new, applied locally across 450 tenants
- `migrations/gst-phase6c-2b-uniqueness.sql` — new, applied locally (deduped prior probe rows)

Frontend (`tzk-tazk-ui`):
- `src/pages/accounts/GstReturns/index.js` — per-type month default, FY auto-switch on filed, Challan-month default, ledger + source pickers, `progress` memo rewrite, Refresh 4-loader parallel call, toolbar wrap CSS

Regression specs (to be added by dev): `tests/e2e/specs/gst-returns.spec.ts` covering items 1–17 above.
