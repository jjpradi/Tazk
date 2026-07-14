---
id: YYYY-MM-DD-<short-slug>
feature: <from test-plans/>
severity: P0 | P1 | P2 | P3
area: frontend | backend | db | infra | pdf | other
status: open | fix-in-progress | fixed | wontfix
reporter: <name or "AI exploratory">
fixed_in_commit: <sha or null>
---

# <One-line headline>

## Observed
What happened. Quote the actual UI text / API response / DB row.

## Expected
What should have happened.

## Reproduction
1. …
2. …

Run via: `npx playwright test tests/e2e/specs/<file>.spec.ts -g "<name>"`

## Evidence
- Screenshot / PDF: `artifacts/...`
- Logs: `artifacts/...`
- DB state:
  ```sql
  SELECT ... FROM ... ;
  ```

## Root cause
One or two sentences after investigation.

## Fix
- Files touched:
- Key change:
- Regression spec added: `tests/e2e/specs/...`
