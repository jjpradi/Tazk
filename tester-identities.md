# Tester identities

Each tester has their own login, vendor, and test location so parallel sessions don't pollute each other's data.

**Rule**: only use your own identity. Don't test under another tester's vendor — their findings will look wrong.

| Tester | Login | Password | Test Vendor | Test Customer | Test Location |
|---|---|---|---|---|---|
| Amit | `qa.amit` | `<set>` | `QA-Amit Test Vendor` | `QA-Amit Test Customer` | `QA-Amit Branch` |
| Ravi | `qa.ravi` | `<set>` | `QA-Ravi Test Vendor` | `QA-Ravi Test Customer` | `QA-Ravi Branch` |
| Priya | `qa.priya` | `<set>` | `QA-Priya Test Vendor` | `QA-Priya Test Customer` | `QA-Priya Branch` |
| Venkat | `vtr.uv` | `<set>` | `Fangs Technology Pvt Ltd` | *(as needed)* | `VIVO` |

## Setup checklist (one-time, done by a dev with DB access)

- [ ] Create 3 new users (`qa.amit`, `qa.ravi`, `qa.priya`) in Administrator role or an equivalent QA role.
- [ ] Create a dedicated vendor per tester, owned by the same company as the test data.
- [ ] Create a dedicated location per tester (or reuse Nokia / VIVO / add new branches).
- [ ] Seed each vendor with 1-2 test invoices + a few opening-stock products so purchase-return scenarios work end-to-end.

## When telling the AI to test

Include your identity in the prompt:

```
test the purchase return flow as qa.ravi against QA-Ravi Test Vendor at QA-Ravi Branch.
```

The AI will use your credentials and your vendor — no interference with other testers.
