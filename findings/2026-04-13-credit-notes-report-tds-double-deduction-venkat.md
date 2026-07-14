---
id: 2026-04-13-credit-notes-report-tds-double-deduction-venkat
feature: Sales → Credit Notes → Manual report (Reports → Transactions → Credit Notes)
severity: P0
area: backend (tzk-reports SQL)
status: fixed
reporter: AI exploratory (Venkat session)
fixed_in_commit: <pending — tzk-reports/src/api/reports/reports.sql.js>
---

# Credit Notes report: `taxable_amount` and `cn_amount` wrong for TDS-only manual CNs (double-deducted TDS)

## Observed

Comparing the 5 Manual Credit Note PDFs against the report row-by-row:

| CN | Category | PDF Taxable | **Report Taxable** | PDF Total | **Report CN Amount** |
|---|---|---|---|---|---|
| CN/26-27/4 | TDS-only (10%) | 83,224.00 | **74,901.6** ❌ | 74,902.00 | **66,579.6** ❌ |
| CN/26-27/5 | TDS-only (10%) | 4,161.00 | **3,744.9** ❌ | 3,745.00 | **3,328.9** ❌ |
| CN/26-27/1 | GST 18% | 1,065.25 | ✓ | 1,257.00 | ✓ |
| CN/26-27/2 | GST 18% | 1,001.69 | ✓ | 1,182.00 | ✓ |
| CN/26-27/3 | GST 18% | 50,571.00 | ✓ | 59,674.00 | ✓ |

Pattern: for CNs with TDS only (no GST), the report **subtracts TDS twice** — once from taxable and again from cn_amount. GST-only CNs were correct because TDS was zero.

## Reproduction

1. Sales → Credit Notes → Manual tab (list): verify each PDF by clicking CN#.
2. Reports → Transactions → Credit Notes → Manual tab: observe row values.
3. Compare PDF "Taxable Value" and "Total" against report columns `Taxable` and `CN Amount`.

## Root cause

`tzk-reports/src/api/reports/reports.sql.js`:

- Line 524 (`taxable_amount`): `mcd.amount - gst_amount - rounded_off`. But `mcd.amount` stores the **post-TDS** Total (what the PDF calls "Total"). So for TDS-only CNs the result is `Total - 0 - rounded` which is ~TDS short of the real taxable.
- Line 540 (`cn_amount`): `mcd.amount - tds_amount`. Since TDS is already deducted inside `mcd.amount`, subtracting again gives a value that's off by 1× TDS.

DB proof (CN/26-27/4): `amount = 74902.00, tds_amount = 8322.40, gst_amount = NULL, rounded_off = 0.40`. PDF's "Total" = 74,902 (= amount); PDF's "Taxable Value" = 83,224 (= amount + tds − rounded + 0 gst = 74902 + 8322.40 − 0.40).

## Fix applied

`tzk-reports/src/api/reports/reports.sql.js`:

```diff
-    ROUND(mcd.amount - COALESCE(mcd.gst_amount, 0) - COALESCE(mcd.rounded_off, 0), 2) AS taxable_amount,
+    ROUND(mcd.amount - COALESCE(mcd.gst_amount, 0) - COALESCE(mcd.rounded_off, 0) + COALESCE(mcd.tds_amount, 0), 2) AS taxable_amount,

-    ROUND(mcd.amount - COALESCE(mcd.tds_amount, 0), 2) AS cn_amount,
+    ROUND(mcd.amount, 2) AS cn_amount,
```

Same taxable-formula fix applied to the Debit Notes branch (line 667) for consistency.

## Verification

After nodemon restart + fresh fetch: all 5 CNs' `taxable_amount` and `cn_amount` match their PDFs exactly (₹83,224 / ₹74,902 / ₹4,161 / ₹3,745 / ₹1,065.25 / ₹1,001.69 / ₹50,571 and totals).

## Follow-ups

- Add a regression spec: `tests/e2e/specs/credit-notes-report.spec.ts` — open each CN PDF, extract Total + Taxable Value, assert equality with the report row.
- Consider adding a DB migration doc that canonicalises what `mcd.amount` means (pre- or post-deduction) so the next dev doesn't re-introduce this bug.
