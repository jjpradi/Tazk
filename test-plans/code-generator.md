---
feature: Barcode & QR Code Generator (/codes)
owner: codes module
status: active
last_updated: 2026-04-27
---

# Test Plan: Barcode & QR Code Generator

## Scope

The `/codes` page (`src/pages/codeGenerator/`) is a 5-tab module that lets
admins generate barcodes / QR codes, manage a registry of generated codes, design
print-label templates, and configure per-tenant defaults.

In-scope: all 5 tabs (Generate / Bulk Generate / Code Registry / Print Templates /
Settings), the per-row REST endpoints, multi-tenant scoping, and partial-success
behaviour on bulk uploads.

Out-of-scope: the actual hardware-print job (no thermal printer attached locally),
PDF export, deep WYSIWYG drag-position math.

## Preconditions

- Logged-in role: Administrator (or any role with codes module permissions)
- Backend: `tzk-sales` exposing `/salesservice/api/codeGenerator/*`
- Tenant should have the codes module enabled in `sa_menu_items`
- Companion services not strictly needed for this module

## Happy Path

1. Open `/codes` — defaults to the Generate tab.
2. (Generate) Pick a code type, leave defaults, click **Generate only** → snackbar success, registry counter +1.
3. (Bulk Generate) Click **Download template** → CSV with all standard columns + sample rows.
4. (Bulk Generate) Upload a CSV → preview table classifies rows as Ready / Invalid; submit → server returns Created / Failed per row.
5. (Code Registry) Search by code or display name; toggle status; soft-delete a row.
6. (Print Templates) Click **Install starter templates** → 25 templates appear; click the star on one row → that template becomes the default for its code_type.
7. (Settings) Change a default and click **Save settings** → caption shows "Saved"; reloading shows the new value.

**Expected**: each step completes without console errors, registry stays in sync with backend, soft-deleted rows disappear from the default registry view but remain accessible via DB.

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Manual mode — submit empty `code_value` | Submit button stays disabled; no API call made |
| 2 | Manual mode — type the value of an existing active code | Inline duplicate hint "Code already exists (status: active)"; submit disabled |
| 3 | Display name contains `<img src=x onerror=alert(1)>` | Stored verbatim, rendered as escaped text in registry table |
| 4 | Bulk row with `code_type` not in known set | Marked Invalid client-side with `Invalid code_type "X"` reason |
| 5 | Bulk row in manual mode without `code_value` | Marked Invalid client-side with `code_value is required for manual mode` |
| 6 | Bulk row that duplicates an existing code | Submit succeeds for other rows; this row reported with `Code already exists` (server) |
| 7 | Soft-deleted code no longer appears in default registry list | DB row keeps `deleted_at` timestamp, default `GET /registry` excludes it |
| 8 | Set a template as default → API `is_default: true` only on the picked template, false on all others of same code_type | Mutually exclusive within a code_type |
| 9 | Settings tab — set `max_quantity_per_batch` higher than the documented "Server cap is 5000" | **CURRENTLY FAILS — see [findings/2026-04-27-code-generator-subashini.md](../findings/2026-04-27-code-generator-subashini.md) BUG-1**: backend silently persists the value (e.g. 10000) instead of clamping or rejecting |
| 10 | Generate tab — auto mode preview value | **CURRENTLY MISLEADS — see BUG-2**: always shows `<prefix>000001` regardless of next available sequence number |

## Non-Functional

- Performance target: list of 5000 codes paginates server-side, search debounced 300ms
- Accessibility: all interactive elements reachable by keyboard, MUI default focus rings preserved
- Data integrity: every code row scoped by `company_id`; soft-delete preserves audit trail (does not hard-delete)

## Evidence of last run
- Date: 2026-04-27
- Run by: subashini (AI-assisted, Playwright MCP driving real Chrome)
- Result: partial — 2 P3 issues filed
- Findings filed: [findings/2026-04-27-code-generator-subashini.md](../findings/2026-04-27-code-generator-subashini.md)
