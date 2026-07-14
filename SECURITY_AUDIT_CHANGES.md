# Security Audit & Vulnerability Fixes — 2026-03-13

## Overview

Ran `npm audit fix` (safe, semver-compatible fixes only) across all 12 repos + the UI repo. All tests verified passing after fixes. No breaking changes applied — existing functionality is unaffected.

The UI repo (`tzk-tazk-ui`) was also rebuilt with `npm run build` to confirm successful build.

---

## Repos with Packages Updated

### tzk-tazk-ui (Frontend)
- **Build**: Vite build passes successfully
- **Vulnerabilities before**: 5 (1 low, 1 moderate, 3 high)
- **Vulnerabilities after**: 2 (1 low, 1 high)
- **Fixed**: minimatch 10.2.2→10.2.4, flatted 3.3.3→3.4.1, dompurify 3.3.1→3.3.3
- **Remaining (no fix available)**:
  - `quill@2.0.3` — XSS via HTML export (low). Latest version, no patch exists. Transitive dep of react-quill-new.
  - `xlsx@0.18.5` — Prototype Pollution + ReDoS (high). Last open-source version, no patch. SheetJS moved to closed source.

### tzk-leads
- **Vulnerabilities before**: 22 → **after**: 20
- **Fixed**: firebase-admin 13.6.1→13.7.0
- **Remaining (all require breaking changes)**: sqlite3 chain (@tootallnate/once, http-proxy-agent, node-gyp, tar), html-pdf chain (phantomjs-prebuilt, request, form-data, tough-cookie, qs)

### tzk-assets
- **Vulnerabilities before**: 14 → **after**: 14
- **Updated**: Added fsevents platform dependency
- **Remaining**: All 14 are deep transitive deps in sqlite3/firebase-admin/node-gyp chains requiring major version bumps

### tzk-projects
- **Vulnerabilities before**: 41 → **after**: 14
- **Fixed (27 resolved)**: lodash 4.17.21→4.17.23, qs 6.14.0→6.14.2, minimatch 3.1.2→3.1.5, strnum 2.1.2→2.2.0, firebase-admin updated, glob updated, multiple AWS SDK sub-deps updated
- **Remaining**: 14 deep transitive deps in sqlite3/firebase-admin chains

### tzk-reports
- **Vulnerabilities before**: 8 → **after**: 8
- **Updated**: Added fsevents platform dependency
- **Remaining**: All 8 are deep transitive deps in sqlite3/node-gyp chains

### tzk-gate-way
- **Vulnerabilities**: 0 (clean)
- No action needed

### tzk-userauth
- **Vulnerabilities before**: 16 → **after**: 14
- **Fixed (2 resolved)**: firebase-admin 13.6.1→13.7.0, node-fetch updated
- **Remaining**: 14 deep transitive deps in sqlite3/firebase-admin chains

### tzk-com-services
- **Vulnerabilities before**: 17 → **after**: 14
- **Fixed (3 resolved)**: multer 2.0.2→2.1.1, firebase-admin 13.6.1→13.7.0
- **Remaining**: 14 deep transitive deps in sqlite3/firebase-admin chains

### tzk-payroll
- **Vulnerabilities before**: 16 → **after**: 14
- **Fixed (2 resolved)**: @aws-sdk/xml-builder updated, fast-xml-parser 5.3.6→5.4.1
- **Remaining**: 14 deep transitive deps in sqlite3/firebase-admin chains

### tzk-superadmin
- **Vulnerabilities before**: 8 → **after**: 8
- **Updated**: Multiple @aws-sdk and @smithy packages updated (patch versions)
- **Remaining**: All 8 are deep transitive deps in sqlite3/node-gyp chains

### tzk-sales
- **Vulnerabilities before**: 22 → **after**: 20
- **Fixed (2 resolved)**: firebase-admin 13.6.1→13.7.0, glob/minimatch updated
- **Remaining**: 20 in sqlite3/firebase-admin/html-pdf chains

### tzk-products
- **Vulnerabilities before**: 22 → **after**: 20
- **Fixed (2 resolved)**: firebase-admin 13.6.1→13.7.0, glob/minimatch updated
- **Remaining**: 20 in sqlite3/firebase-admin/html-pdf chains

### tzk-accounts
- **Vulnerabilities before**: 11 → **after**: 9
- **Fixed (2 resolved)**: fast-xml-parser 5.3.6→5.4.1, @aws-sdk/xml-builder updated, strnum 2.1.2→2.2.0
- **Remaining**: 9 deep transitive deps

---

## Remaining Vulnerabilities (Cannot Fix Safely)

All remaining vulnerabilities are in **deep transitive dependencies** that require breaking major version upgrades. Fixing these would risk breaking existing functionality:

| Dependency Chain | Affected Repos | Why Unfixable |
|---|---|---|
| `sqlite3` → `node-gyp` → `tar`, `make-fetch-happen`, `@tootallnate/once` | All backend repos | sqlite3 v5→v6 is a major breaking change (native addon rebuild, API changes) |
| `firebase-admin` → `@google-cloud/storage` → `teeny-request` | leads, assets, projects, userauth, com-services, sales, products | Deep in Google Cloud SDK chain; requires firebase-admin major version or Google SDK restructure |
| `html-pdf` → `phantomjs-prebuilt` → `request` → `form-data`, `tough-cookie`, `qs` | leads, sales, products | html-pdf v2+ depends on deprecated phantomjs. Would need to replace html-pdf entirely (e.g., with puppeteer/playwright) |
| `xlsx@0.18.5` | tzk-tazk-ui | Last open-source version. SheetJS moved to closed-source. Would need to switch to `SheetJS Pro` or alternative like `exceljs` |
| `quill@2.0.3` | tzk-tazk-ui | Latest version. XSS in HTML export feature — no patch yet from maintainers |

---

## Recommendations for Future

1. **Replace `html-pdf`** with `puppeteer` or `@react-pdf/renderer` — eliminates phantomjs dependency chain (affects leads, sales, products)
2. **Replace `xlsx`** with `exceljs` — actively maintained, no known vulnerabilities
3. **Upgrade `sqlite3`** to v6 in a dedicated effort with thorough testing — resolves 6+ transitive vulns per repo
4. **Monitor `quill`** for v2.0.4+ patch addressing XSS

---

## Test Results (All Passing)

| Repo | Suites | Tests | Status |
|---|---|---|---|
| tzk-tazk-ui | - | - | Build OK |
| tzk-leads | 7 | 52 | PASS |
| tzk-assets | 7 | 46 | PASS |
| tzk-projects | 7 | 46 | PASS |
| tzk-reports | 9 | 74 | PASS |
| tzk-gate-way | 3 | 49 | PASS |
| tzk-userauth | 15 | 201 | PASS |
| tzk-com-services | 21 | 195 | PASS |
| tzk-payroll | 49 | 577 | PASS |
| tzk-superadmin | 8 | 90 | PASS |
| tzk-sales | 30 | 571 | PASS |
| tzk-products | 20 | 198 | PASS |
| tzk-accounts | 28 | 545 | PASS |
