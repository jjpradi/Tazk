---
id: 2026-04-27-code-generator-subashini
feature: Barcode & QR Code Generator (/codes)
severity: P3
area: frontend
status: open
reporter: subashini (AI-assisted Playwright MCP exploratory)
fixed_in_commit: null
---

# Code Generator (/codes) — exploratory pass turns up 2 minor UX/data-integrity gaps

## Session summary

Drove the `/codes` page end-to-end with Playwright MCP using a real Chrome session
logged in as `gd.admin` (company `GD MOBILE CARE M/S`, `company_id=409` per
`/salesservice/api/codeGenerator/registry` rows). Backend served from
`https://server.payroll.tazk.in/salesservice/api/codeGenerator/*` (this is the
remote staging instance — local DB SELECTs not applicable, verified via the
authenticated REST API instead).

All 5 tabs are functional. Core flows pass:

- **Generate**: auto / manual / random modes all create rows; manual-mode duplicate detection fires inline as you type ("Code already exists (status: active)").
- **Bulk Generate**: CSV with 7 rows (5 valid + 1 server-side dup + 1 unknown code_type + 1 manual-without-value) returned 4 Created / 1 Failed (dup) / 2 Invalid. Partial success behaves correctly.
- **Code Registry**: search debounce, status filter, type filter, status toggle (active ↔ inactive) and soft-delete all work and persist.
- **Print Templates**: "Install starter templates" populates 25 templates in one click; star icon flips `is_default` correctly per `code_type`.
- **Settings**: most fields persist on **Save settings** (verified `default_pad_length` 6 → 8 round-tripped via `GET /settings`).
- **Security**: `<img src=x onerror=alert(1)>` stored as `display_name` is rendered as escaped text in the registry table (`innerHTML` shows `&lt;img …&gt;`). Not exploitable.

What I deliberately did NOT cover in this session:

- Actual physical print output (no thermal printer attached locally; `PrintDialog` reachable but not exercised).
- Pixel-level WYSIWYG drag-resize math in the template editor.
- Concurrent multi-tab edits / race conditions.
- Pagination beyond 1 page (only seeded 6 codes; would need ≥ 21 to test page-2).

## 1. Settings — "Server cap is 5000" caption is a lie; backend silently accepts higher values — P3

**Observed**

In Settings → Generation rules, the **Max quantity per bulk batch** field has a
caption directly under it that reads:

> Server cap is 5000

I changed the field to `10000` and clicked **Save settings**. No error, no
warning, no auto-clamp. `GET /salesservice/api/codeGenerator/settings`
afterwards returns:

```json
{ "data": { ..., "max_quantity_per_batch": 10000, ... } }
```

So the user is told "5000 is the max" but the backend silently keeps whatever
they typed. This makes the caption misleading — either the cap is real (and the
backend should reject / clamp on save) or the cap is advisory (and the caption
text should say "recommended" not "cap").

**Expected**

Pick one:

- (a) Hard cap on the backend: `PUT /settings` with `max_quantity_per_batch > 5000` returns 400 with a clear message, OR
- (b) Backend silently clamps to 5000 on save and returns the clamped value, OR
- (c) Caption text changed from "Server cap is 5000" to "Recommended max 5000 (server enforces at runtime)" with a runtime check on `bulkGenerate` that respects the actual server-side hard limit.

**Reproduction**

1. Log in as gd.admin, navigate to `/codes`, click **Settings** tab.
2. In **Max quantity per bulk batch**, replace `5000` with `10000`.
3. Click **Save settings**. Observe no error, no warning.
4. Hard-refresh and return to Settings — the field shows `10000`. Caption still says "Server cap is 5000".

Verified directly via the authenticated REST API after step 3:

```js
fetch('https://server.payroll.tazk.in/salesservice/api/codeGenerator/settings', {
  headers: { Authorization: 'Bearer ' + sessionStorage.login.accessToken }
}).then(r => r.json())
// → { data: { ..., max_quantity_per_batch: 10000, ... } }
```

**Evidence**

- Screenshot: `findings/evidence/code-generator-subashini/13-settings-cap-violation.png` — field shows `10000`, caption directly below still reads "Server cap is 5000".

**Impact**

Low. The caption misleads admins about server behaviour. If a tenant's bulk
generation actually does run unbounded with 10 000 rows, that's a performance /
DOS concern; if the runtime path *does* enforce 5000 anyway, the persisted
setting is a dead value that disagrees with reality. Either way the UI message
needs to match the backend contract.

## 2. Generate tab — auto-mode preview always shows `<prefix>000001`, never the next available — P3

**Observed**

On the Generate tab, the right-hand **Preview** panel shows a QR with the text
`PRD000001` underneath (for the default Product / auto / qrcode combination)
**even after `PRD000001`, `PRD000002`, `PRD000003`, `PRD000004` already exist**
in this tenant.

Clicking **Generate only** with auto mode happily creates the next sequence
number (`PRD000005`) — the *backend* logic is correct. But the user is shown
"PRD000001" as the preview and only learns the actual code value from the
success snackbar after clicking Generate.

**Expected**

Either:

- (a) Auto-mode preview reads from a "next sequence number" hint (e.g. a `GET /codeGenerator/next-sequence?prefix=PRD&pad_length=6` peek endpoint), OR
- (b) Preview shows generic placeholder text like `PRD<auto>` with a tooltip "next sequence number assigned at generate time", OR
- (c) Hide the preview value entirely in auto mode and only show the symbol shape, with a note "Real value assigned on Generate".

The current behaviour — showing a literal `PRD000001` that's already taken —
will confuse users into thinking their next code will collide.

**Root cause** (frontend-only — easy fix)

`src/pages/codeGenerator/tabs/GenerateTab.js:25-35`:

```js
function computePreviewValue(values) {
  if (values.code_format === 'qrcode' && values.qr_payload) {
    const s = buildQrPayloadString(values.qr_payload);
    if (s) return s;
  }
  if (values.mode === 'manual') return values.code_value || '';
  if (values.mode === 'random') return (values.prefix || '') + (values.random_seed || '');
  const padded = String(1).padStart(values.pad_length || 6, '0');   // ← always "1"
  return `${values.prefix || ''}${padded}`;
}
```

The branch for auto mode hard-codes `String(1)`. There's no read of the current
sequence anywhere, and the default `random_seed` is also empty so random mode
shows just the prefix until you generate once.

**Reproduction**

1. Log in as gd.admin, navigate to `/codes`.
2. Click **Generate only** to create `PRD000001`.
3. Observe Preview now reads "Reprint last (PRD000001)" in step 3, but the **right-hand QR preview still shows `PRD000001`** as if that's still the next code.
4. Click **Generate only** a few more times. The preview text never updates — it always says `PRD000001` while the backend keeps incrementing to `PRD000002`, `PRD000003`, …

**Evidence**

- Screenshot: `findings/evidence/code-generator-subashini/01-generate-tab-initial.png` — preview reads `PRD000001` on a fresh tenant. (Same screenshot is also valid evidence after step 4 — the preview never changes.)
- Screenshot: `findings/evidence/code-generator-subashini/03-manual-duplicate-detection.png` — same Generate tab after `PRD000001` was created; the right-hand preview is still showing `PRD000001` even though we know it's taken (the form below is in manual mode and the duplicate hint confirms the code exists).

**Impact**

Low. UX confusion only — generation itself is correct. But for tenants doing
bulk label printing, the misleading preview can lead to wasted print runs
("I expected PRD000001 to come out and I got PRD000005").

## Working features (no bugs filed) — for completeness

| Tab / feature | Verified behaviour |
|---|---|
| Generate / auto | Sequence increments per `code_type`; backend assigns; UI snackbar reports the assigned code |
| Generate / manual | Inline duplicate check fires within ~350 ms of typing; submit disabled while a duplicate is shown |
| Generate / random | `EMPJETG9LZCUU96` (employee, prefix EMP, random_length 12) generated cleanly |
| Bulk validation (client) | Catches unknown `code_type`, missing `code_value` for manual mode, before the server is contacted |
| Bulk submit (server) | Returns per-row success/failure; partial success is supported, dup `PRD000001` rejected with "Code already exists" while siblings created |
| Registry / search | Debounced, matches both code_value and display_name; "Apple" → 3 of 6 rows |
| Registry / status filter | Active filter excludes inactive rows; default view excludes soft-deleted |
| Registry / status toggle | `PATCH /registry/:id/status` flips active ↔ inactive; UI updates without full reload |
| Registry / soft delete | `DELETE /registry/:id` removes row from default list; total decrements |
| Templates / install starters | 25 templates created in one click; covers product / asset / customer / employee / vendor / location / invoice / document / custom + A4 sticker sheets + retail-combo thermal |
| Templates / set default | Star icon mutex within a code_type — set Asset → "Asset — QR 100×50 mm (full)", `is_default` is true on the picked template only |
| Templates / editor | Drag/resize WYSIWYG opens cleanly with element list, sample preview, margins; Cancel works; Create button disabled until name filled |
| Settings / persist | `default_pad_length` 6 → 8 round-trips via PUT then GET correctly |
| XSS | `display_name` containing `<img onerror>` rendered as escaped text in registry (DOM `innerHTML` = `&lt;img src=x onerror=alert(1)&gt;`) |

## Test data left behind in the staging tenant

After this session, tenant `company_id=409` has:

- **Codes**: `PRD000001` (active), `PRD000002` (inactive — XSS payload as display_name, kept deliberately to verify escape), `PRD000003`/`PRD000004` (active, "Bulk Apple A/B"), `EMPJETG9LZCUU96` (active, employee). `AST-LAP-007` was created and then soft-deleted.
- **Templates**: 25 starter templates installed. `Asset — QR 100×50 mm (full)` is currently flagged `is_default: true`.
- **Settings**: restored to factory defaults at end of session (`default_pad_length: 6`, `max_quantity_per_batch: 5000`).

If the dev wants a clean tenant for repro, soft-delete the 5 codes and bulk-DELETE the 25 templates via the registry / templates endpoints respectively.
