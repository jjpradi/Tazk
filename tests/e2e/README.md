# E2E Tests

Playwright specs covering critical user flows. Runs against a live dev stack.

## Running

```bash
# Make sure the stack is up (frontend on :3000, backends on their ports, MySQL container running)
npm run start   # frontend, in another shell

# All specs
npm run e2e

# One spec, headed (watch the browser)
npx playwright test tests/e2e/specs/purchase-return.spec.ts --headed

# Debug mode
npx playwright test --debug

# Open the last HTML report
npx playwright show-report tests/e2e/report
```

## Overrides

```bash
BASE_URL=http://staging.example.com TEST_USER=foo TEST_PASS=bar npm run e2e
```

## Layout

```
tests/e2e/
  specs/          # one *.spec.ts per feature area
  helpers/        # reusable page objects / action helpers (auth, nav)
  fixtures/       # test data (users, sample payloads)
  report/         # HTML report (gitignored)
  artifacts/      # screenshots/videos/traces on failure (gitignored)
```

## Conventions

- **Locators**: prefer `getByRole(...)`. Avoid CSS class selectors — MUI classes churn.
- **One flow per spec file**; group related regression tests with `describe`.
- **No `waitForTimeout`** except for network race-testing. Prefer `expect(...).toBeVisible()`.
- **Test data**: use fixtures — don't hard-code usernames/passwords in specs.
- **Failures** drop artifacts into `tests/e2e/artifacts/`.

## When to add a new spec

When an AI exploratory pass (or manual tester) finds a new bug:
1. File a finding in `findings/<short-slug>.md` (template in `findings/TEMPLATE.md`).
2. Fix the bug.
3. Add a regression spec here so the same bug can't ship again.

AI is for **exploration** (unknowns). Specs are for **regression** (knowns). Don't use AI to re-run a codified scenario.
