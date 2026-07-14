---
feature: <short name>
owner: <team or person>
status: draft | active | deprecated
last_updated: YYYY-MM-DD
---

# Test Plan: <feature>

## Scope
One paragraph. What's covered, what's explicitly out.

## Preconditions
- Logged-in role:
- Data required (vendor, invoice, etc.):
- Environment:

## Happy Path
Numbered steps. Observable result per step.

1. …
2. …

**Expected**: …

## Edge Cases
| # | Scenario | Expected |
|---|----------|----------|
| 1 | Empty form submit | Button stays disabled OR clear error |
| 2 | Invalid qty (0, negative, > max, decimal, text) | Clear validation message |
| 3 | Future date | Rejected with specific error |
| 4 | Double-click submit | Exactly one record created |
| 5 | XSS in text fields | Stored as text, never executed |
| 6 | Network failure mid-submit | User can retry, no duplicate |

## Non-Functional
- Performance target:
- Accessibility target:
- Data integrity invariants:

## Evidence of last run
- Date: YYYY-MM-DD
- Run by: <tester>
- Result: pass | partial | fail
- Findings filed: `findings/...md`
