---
id: 2026-04-22-hardcoded-maptiler-api-key
feature: Cross-cutting — Map tile rendering (Leaflet/MapTiler)
severity: P1
area: frontend
status: open
reporter: AI exploratory
fixed_in_commit: null
---

# MapTiler API key `aVuYEZqt4M8pZrKoN6n3` hardcoded and committed across 7 frontend files

## Observed
The same MapTiler tile-server API key is baked into source in seven files and shipped in every production bundle. Anyone who inspects the built JS (or reads the repo) can extract it and abuse the account's quota/billing.

Occurrences (grep for `aVuYEZqt4M8pZrKoN6n3`):

| File | Line |
|------|------|
| [src/pages/projects/apps/ScrumBoard/BoardDetail/index.js:101](src/pages/projects/apps/ScrumBoard/BoardDetail/index.js#L101) | tile layer config |
| [src/pages/projects/apps/ScrumBoard/BoardDetail/index.js:441](src/pages/projects/apps/ScrumBoard/BoardDetail/index.js#L441) | `<TileLayer url=...>` |
| [src/pages/Payroll/liveLocation/index.js:72](src/pages/Payroll/liveLocation/index.js#L72) | tile layer config |
| [src/pages/Payroll/liveLocation/index.js:299](src/pages/Payroll/liveLocation/index.js#L299) | `<TileLayer url=...>` |
| [src/pages/Payroll/attendance/attendanceMap.js:10](src/pages/Payroll/attendance/attendanceMap.js#L10) | tile layer config |
| [src/pages/sales/salesman/SalesManLiveLocation.js:41](src/pages/sales/salesman/SalesManLiveLocation.js#L41) | tile layer config |
| [src/components/dashboard/AssetManagement/AssetLocationCard.js:27](src/components/dashboard/AssetManagement/AssetLocationCard.js#L27) | tile layer config |
| [src/components/employeeVerification/map/index.js:9](src/components/employeeVerification/map/index.js#L9) | tile layer config |
| [src/@crema/services/db/Chat/ChatContent/ChatViewContainer/MessageList/viewLocation.js:10](src/@crema/services/db/Chat/ChatContent/ChatViewContainer/MessageList/viewLocation.js#L10) | tile layer config |

(There is also a commented-out occurrence at [src/pages/Payroll/liveLocation/index.js:390](src/pages/Payroll/liveLocation/index.js#L390).)

Note: the original report referenced `index.js:101` — the match is `src/pages/projects/apps/ScrumBoard/BoardDetail/index.js:101`, not `src/index.js` (which is only 11 lines long).

## Expected
- No third-party API keys committed to the repo.
- Key read from `process.env.REACT_APP_MAPTILER_KEY` (or equivalent) and injected at build time, documented in `.env.example`.
- A single shared `TileLayer` config helper so the URL template isn't duplicated in 7 places.

## Reproduction
1. `rg aVuYEZqt4M8pZrKoN6n3` at the repo root — 7 source files + 1 comment match.
2. In any production build, open DevTools → Sources or Network → any `*.png` tile request to `api.maptiler.com` — the key appears in the URL query string in plaintext.
3. Anyone with the key can issue map tile requests against this project's MapTiler account until the quota is exhausted or billing is charged.

## Evidence
- grep output: see table above.
- Confirmed full key leaks into `TileLayer`'s rendered `url` prop at runtime (visible in every tile HTTP request).

## Root cause
Convenience during development — the key was pasted inline the first time Leaflet was wired up and then copy-pasted into every subsequent map component. No env-var wiring was ever added.

## Fix (developer)
1. **Rotate the key immediately** in the MapTiler dashboard — the current value is effectively public.
2. Add `REACT_APP_MAPTILER_KEY` to `.env.example` and the deploy environment.
3. Replace all 7 hardcoded occurrences with `process.env.REACT_APP_MAPTILER_KEY` — ideally via a single shared constant or `<TileLayer>` wrapper component so there is one definition.
4. Audit git history: the key has been committed — consider whether a history rewrite or just rotation is acceptable. For a known-public key, rotation alone usually suffices.
5. Optional: add a repo-level secret-scanning pre-commit hook (e.g., `gitleaks`) to prevent recurrence.

## Regression check
- grep for the old literal key across the repo after the change — must return zero hits in `src/`.
- Confirm `TileLayer` URLs at runtime still render tiles with the new env-sourced key.
