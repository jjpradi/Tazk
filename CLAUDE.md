# tzk-tazk-ui — AI working agreement

Context + conventions for any AI agent working in this repo, regardless of role. Section 1–4 are universal (everyone reads them); the role blocks (5a / 5b) are specific to the session you're in.

## 1. What this repo is

React UI for **Tazk ERP** — a multi-tenant Indian GST + accounting + inventory product. This repo is the browser-facing UI only. All business logic + persistence lives in sibling microservices under `/Users/venkat/Apps/tzk-*/`.

Companion repos and ports:

| Repo | Purpose | Local URL |
|---|---|---|
| `tzk-tazk-ui` | this repo — React UI | `http://localhost:3000` |
| `tzk-accounts` | accounting, GST, period filing, ledger | `/accountsservice/api` on `:4000` |
| `tzk-sales` | sales orders, invoices, purchases, products | `/salesservice/api` on `:4000` |
| `tzk-com-services` | customers, suppliers, addresses, navigation | `/comservice/api` on `:4000` |
| `tzk-superadmin` | multi-tenant admin, seeding, menu config | separate service |
| `tzk-notifications`, `tzk-reports`, `tzk-payroll`, `tzk-ticketing` | as named | various |

Multi-tenant: every table scoped by `company_id`. Default dev tenant for this environment is `company_id=401`. MySQL at `localhost:3306`, DB `pos_erp_db_dev`, default dev creds `root`/`root`.

## 2. Tech stack

- **React 19.2.4** (uses `createRoot` in `src/index.js`), **Vite 7.3.1** build
- **MUI v7** — `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/system`. No `StyledEngineProvider` (removed in v7). `Grid` uses `size` prop, no `item` / `xs|sm|md|lg|xl`. `Hidden` component gone — use `Box` + `sx` responsive display.
- `@mui/x-date-pickers` v7, `@mui/x-data-grid` v7 — **locked at v7** because `date-fns` v2 and the Vite CommonJS resolver break on v3+
- **date-fns v2** — do not bump without verifying `@mui/x-*` compat
- **Redux 5** + `redux-saga` + `react-redux` 9 + `redux-thunk` 3. Store: `src/redux/store/index.js`, uses `legacy_createStore` and the named import `{thunk}`.
- **React Router v6** with a custom `custWithRouter` HOC at `src/utils/custWithRouter.js`
- `tss-react` for `makeStyles` / `withStyles` compatibility
- Other notables: `@hello-pangea/dnd`, `react-big-calendar`, `react-leaflet`, `notistack` v3, `simplebar-react` v3, `react-dropzone` v14, `react-intl` v6, `@material-table/core` v6.5.2
- **~2200+ JS/JSX files** — large codebase, use `Explore` or ripgrep rather than reading top-down

## 3. Running locally

```
npm install
npm start          # dev server on :3000
```

Prereq: at least `tzk-accounts` on `:4000` and MySQL on `:3306` must be up for the UI to do anything useful. Other microservices as the feature you're touching demands. If the UI loads but every API call 404s, a backend isn't running.

Auth: login at `/signin`, JWT lands in `sessionStorage.login.accessToken`. Every `/api/*` call attaches `Authorization: Bearer <jwt>` via the request interceptor in `src/http-common.js`. `ROUTE_PREFIXES` in `src/utils/routesprefix.js` maps each service short-name (`ledger`, `gstReturnPeriod`, ...) to its `/xxxservice/api/...` mount point.

## 4. Code map

| Path | Purpose |
|---|---|
| `src/index.js` | Entry; React 18+ `createRoot`; wraps with Redux + Theme + Router |
| `src/http-common.js` | Axios instance, JWT interceptor, route-prefix rewrite, base URL |
| `src/utils/routesprefix.js` | `<shortName> → /xxxservice/api/xxx` mapping |
| `src/pages/` | Screen-level components grouped by feature (accounts, sales, common, etc.) |
| `src/redux/` | Store + actions + reducers + sagas; feature-sliced |
| `src/services/` | Per-feature API client wrappers |
| `src/@crema/` | Theme provider + layout shell (inherited from Crema template) |
| `src/utils/` | Helpers: `custWithRouter`, `menuComponentRegistry`, formatters |
| `tests/e2e/specs/` | Playwright regression specs (developer-owned) |
| `findings/`, `test-plans/` | Tester-owned (see §5b) |
| `migrations/` | **Not in this repo** — look under sibling `tzk-*/migrations/` |

Conventions:
- Feature-sliced: new screens go under `src/pages/<area>/<feature>/`, with Redux + services alongside if non-trivial.
- Route registrations centralised in `src/pages/allRoutes.js`.
- Menu items + permissions live in DB tables (`sa_menu_items`, `pos_user_roles`); the UI reads them on bootstrap. Adding a new page usually requires a matching SQL seed in the relevant sibling repo's migrations.

## 5a. If you're a developer in this session

**You can**: edit anything under `src/`, write/update Playwright specs under `tests/e2e/specs/`, bump dependencies, open PRs.

**Hard rules**:
- Don't bump `date-fns`, `@mui/x-date-pickers`, or `@mui/x-data-grid` without also validating the whole stack — they're locked for compat reasons listed in §2.
- Don't remove the `fixPackageExportsPlugin` in `vite.config.*` — it's the compat shim for MUI v7 trailing-slash and date-fns.
- Don't commit with `.env` / credentials staged. Don't commit generated `dist/`.
- Commits usually follow the existing short-prose style ("Fix X so Y"). Co-author trailer is fine when AI-assisted.
- If you're responding to a tester finding, append a "Dev-side fixes — round N" block to the same `findings/YYYY-MM-DD-<slug>.md` file (don't fork) with: files touched, migration names, retest checklist.

**Common pitfalls surfaced by past sessions**:
- `pos_customers.tax_id`, `pos_suppliers.tax_id`, both `company_name` columns, `pos_sales_cus_address.state` are **RSA-OAEP encrypted at rest** (per-tenant private key in `pos_keys.private_key`). Decrypt helpers live in `tzk-accounts/src/helpers/encryption.js`. SQL filters that regex these columns will never match — filter/classify in Node after decrypt.
- `acc_transaction.location_id` is NOT NULL. Users on "All-Location" have no concrete id — backend must resolve one via `resolveLocationId()` in `tzk-accounts/src/helpers/location.js`.
- Period-lock middleware (`tzk-accounts/src/helpers/periodLockValidator.js`) returns 403. Must set both `err.status` and `err.statusCode` — some controllers read one, some the other.
- Some files import `typescript` package erroneously; duplicate-key console warnings are pre-existing, not caused by your change.

## 5b. If you're a tester in this session

Your job: drive the app via Playwright MCP, file bugs in a single finding file per session, hand off to the dev. You don't edit `src/`, don't commit, don't write Playwright specs.

**Primary mechanism**: Playwright MCP driving a real Chrome (headed, 1440×900). Click / type / fill / screenshot / observe network — all via `browser_navigate`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_take_screenshot`, `browser_evaluate`, `browser_network_requests`, `browser_handle_dialog`.

**Fallback for edges the UI doesn't expose**: `fetch()` inside `browser_evaluate` against `http://localhost:4000/<service>/api/...`. Reuses the browser's auth session (JWT in `sessionStorage.login`). Good for malformed payloads, role-scoped endpoints, uniqueness constraints.

**DB verification is required** — the UI lies / caches, the DB tells the truth. Drop a SELECT-only `mysql2` helper at `findings/evidence/<slug>/db.js`. Borrow `mysql2` from a sibling repo via `NODE_PATH=/Users/venkat/Apps/tzk-superadmin/node_modules node db.js "..."` if it's not installed here.

**Credentials**: prefer real logins for multi-role RBAC (no token forging, no audit-log footprints). Ask the user to paste username + password for every role upfront. Without backend repo access you can still do ~85% of the work; escalate to the dev when you need source-reading to interpret an error or a seed fixture you can't create from the UI.

### Tester files you own

| Path | Purpose |
|---|---|
| `test-plans/<feature>.md` | Checklist per feature. Update "Evidence of last run" after each session. |
| `findings/YYYY-MM-DD-<feature-slug>.md` | **One file per session/feature**, bugs as numbered sections. Retest rounds append in place. Models: `findings/2026-04-13-purchase-return.md`, `findings/2026-04-24-gst-returns-e2e.md`. |
| `findings/evidence/<slug>/` | **5–10 curated files**: money-shot screenshots, reusable scripts (`db.js`, `forge-token.js`), fixtures (sample JSONs). Nothing else. |
| `findings/bundle.sh` | Zips finding + evidence into `finding-<slug>.zip` for handoff. |

### Tester session workflow

1. Create `findings/YYYY-MM-DD-<feature-slug>.md` from `findings/TEMPLATE.md`. One file per session/feature; bugs as `## 1. <headline> — P<n>` / `## 2. ...`. Each bug gets **Observed / Root cause / Fix**.
2. Curate evidence into `findings/evidence/<slug>/`. Pass absolute paths under this folder directly to `browser_take_screenshot` — don't leave anything in `.playwright-mcp/` (tool scratch dir). Review and delete intermediate captures before closing. Aim for 5–10 files total.
3. Retests append to the same file as `## 🔁 Retest — YYYY-MM-DD (round N)` with PASS/FAIL per bug. Never fork.
4. Update `test-plans/<feature>.md` — new edge cases in the table; refresh "Evidence of last run".
5. Run `./findings/bundle.sh <slug>` and tell the user to send the zip.

Do this without being asked.

### Severity (frontmatter `severity`)

Use the worst bug's band.

| Band | Meaning | Ship action |
|---|---|---|
| P0 | Feature dead; data loss; posting blocked; security leak | Must-fix before ship |
| P1 | Wrong result but recoverable; wrong HTTP status; schema leak | Must-fix before ship |
| P2 | UX / surface issue; wrong default; confusing state | Fix in current milestone |
| P3 | Cosmetic or nice-to-have | Backlog, ok to ship with follow-up |

"retracted" and "not-a-bug" findings stay in the file (numbered) with a short explanation.

### Tester hard rules

- Don't edit `src/` or any `tzk-*/src/`. If reproduction needs a patch, ask the user first and revert before session end.
- Don't add Playwright specs to `tests/e2e/specs/` — devs write regressions.
- Don't commit.
- Don't create per-bug finding files — one file per session/feature.
- Don't keep parallel reports (e.g. monolithic `<feature>-test-report.md` at repo root alongside the finding). Finding is the single source of truth.
- Don't leave evidence in tool-default dirs (`.playwright-mcp/`, `downloads/`). Save directly to `findings/evidence/<slug>/`.
- Don't over-collect evidence. Prose quoting exact figures / DB rows / HTTP status beats a screenshot of the same thing.

## 5c. The dev ↔ tester loop (how one finding file carries a full session)

A single `findings/YYYY-MM-DD-<slug>.md` is the shared workspace for tester and developer across all retest rounds. Nobody forks it, nobody creates a parallel file. The file grows append-only until the feature is green.

### The three block types that appear in the file

1. **Bug sections** (written by tester when opening the finding):
   ```
   ## 1. <headline> — P<n>
   **Observed**: …
   **Expected**: …
   **Reproduction**: 1. … 2. …
   **Evidence**: findings/evidence/<slug>/foo.png
   ```
   One numbered section per bug. `status` in the frontmatter starts `open`.

2. **Dev-side fix blocks** (written by developer at the top level after patching):
   ```
   # 🛠 Dev-side fix round N — YYYY-MM-DD
   
   ## BUG-3 — <title> ✅ fixed
   Cause: …
   Fix: <what was changed>
   Files: tzk-accounts/src/api/foo/foo.model.js, migrations/xxx.sql
   Retest: 1. POST /foo with … → expect 409. 2. …
   ```
   Addresses one or more of the bugs by id/headline. Closes with a concrete retest checklist the tester can run verbatim. Include migration filenames if any. Never edits the original bug sections — only appends new blocks below them.

3. **Tester retest blocks** (written by tester after the dev fix arrives):
   ```
   # 🔁 Retest — YYYY-MM-DD (round N)
   
   | Bug | Result |
   |---|---|
   | BUG-3 | ✅ PASS — POST /foo now returns 409 with clean message |
   | BUG-5 | 🟡 partial — fixed for UI shape, legacy top-level shape still silently drops |
   
   ### New issues surfaced during retest
   - Sometimes fixing one bug exposes the next. Open new numbered sections at the top in the usual format.
   ```
   Runs the checklist from the dev block, reports PASS / FAIL / partial per bug, flags any new bugs the fix exposed.

### How a developer opens a tester's finding

1. Read the file top-to-bottom. Bug sections tell you what's wrong; any prior retest blocks tell you which are already triaged.
2. Look at the evidence folder `findings/evidence/<slug>/` for the "money shot" screenshots (usually 4–5 files) — they show the symptom visually.
3. Run reproduction steps against the local stack. Use the `db.js` helper and any `forge-token.js` / JSON fixtures shipped in the evidence folder.
4. Patch the code in the relevant sibling repo (`/Users/venkat/Apps/tzk-*/src/`). Stage migrations under that repo's `migrations/`.
5. Apply the migration locally (`mysql … < migrations/xxx.sql`) so the tester doesn't have to.
6. **Append** a dev-side fix block to the finding file (see format above). Do not rewrite tester's original bug descriptions. Do not create a separate `FIX.md` or PR description — this file IS the record.
7. Update the frontmatter: `status: fix-in-progress`. Once the tester confirms retest is green on every bug, flip to `status: fixed` and fill `fixed_in_commit`.

### How a tester consumes a developer's reply

1. Read the fix block to know which bugs were addressed and what files changed.
2. Run the retest checklist verbatim. Add a tester retest block to the file with PASS / FAIL per item.
3. If fresh bugs surface during retest, open new numbered bug sections at the top of the file (same format as round-1 bugs, just with higher numbers).
4. Loop until frontmatter can read `status: fixed`.

### End state

When the feature is fully green:
- Frontmatter `status: fixed`, `fixed_in_commit: <sha>` filled by the dev when they commit.
- The file reads top-to-bottom as: bug sections → dev-fix round 1 → retest round 1 → (dev-fix round 2 → retest round 2 …) → final retest.
- No consolidation needed — the running log IS the handoff artefact. `./findings/bundle.sh <slug>` zips it with the evidence folder for archival or regulatory audit.

### What this avoids

- No "dev writes a private doc, tester never sees the details" — fix rationale + file list + retest steps live in one place.
- No "fix lands but nobody retests" — the retest block is the explicit closure marker.
- No ambiguity about "is this bug still open" — the round log shows exactly when each was introduced, fixed, and verified.

## 6. Glossary

ERP / GST terms that will come up:

- **GSTIN** — 15-char registered taxpayer ID (e.g. `33AAFCV1090B1ZT`).
- **GSTR-1 / GSTR-3B** — monthly GST filings (outward supplies / summary). T4, T5, T7, T9B are numbered tables within GSTR-1.
- **ITC** — Input Tax Credit. Claimed on purchases; can be reversed per Rules 37/42/43/17(5).
- **RCM** — Reverse Charge Mechanism. Buyer books both Receivable and Payable legs.
- **2B** — GSTR-2B, system-generated inbound invoice statement from GSTN.
- **ARN** — Acknowledgement Reference Number, returned after filing.
- **CIN** — Challan Identification Number.
- **B2B / B2CL / B2C** — business-to-business (registered recipient) / large B2C (inter-state unregistered > ₹2.5L) / other B2C.
- **CDNR / CDNRA** — credit/debit note (registered) / amendment.

## 7. Known gotchas

- **Encrypted columns** — listed in §5a. Any new SQL touching customer/supplier identity needs to decrypt in Node, not filter in SQL.
- **`.playwright-mcp/` is not owned** — it's the Playwright MCP tool's scratch dir, shared with other sessions. Don't treat anything there as authoritative; write evidence directly to `findings/evidence/<slug>/`.
- **Menu items are DB-driven** — adding a new `src/pages/<foo>` route without seeding `sa_menu_items` means no one can reach it via the sidebar.
- **Some routes redirect silently** — `/common/settings` and `/accounts/auditDashboard` redirect home if the user lacks menu access; not always a bug, often a RBAC-gate working.
- **Pre-existing console noise** — erroneous `typescript` package imports in some files, duplicate-key warnings. Not caused by your change.
