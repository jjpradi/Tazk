---
id: 2026-04-13-manual-debit-note-subashini
feature: Manual Debit Note
severity: P1
area: frontend
status: open
reporter: qa.subashini (AI exploratory — code analysis)
fixed_in_commit: null
---

# Location dropdown ghost-selects first option — validation blocks submission with no clear reason

## Observed

When the Manual Debit Note form opens while the global header is set to
**All Locations** (`headerLocationId` is falsy / "null" / "0"), `locationId`
state is initialised to `''` (empty string):

```js
// index.js line 45
const [locationId, setLocationId] = useState(isAllLocation ? '' : headerLocationId);
```

The Location field renders as a native `<select>` with **no empty placeholder
`<option>`**:

```jsx
// index.js lines 232–239
<TextField select … SelectProps={{ native: true }}
  value={locationId}          // ← still '' after form opens
  onChange={(e) => setLocationId(e.target.value)}>
  {filteredLocations.map(loc => (
    <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>
  ))}
</TextField>
```

Because no `<option value="">` exists, the browser native select **visually
auto-highlights the first location** in the list even though `locationId` is
`''`.  The user sees a location name in the dropdown, believes a location is
selected, fills in vendor + items, and clicks **Create Debit Note** — only to
receive a warning toast:

> "Please select a Location"

The note is not created. The dropdown still shows the first location name.
There is no visual indication that the field is in an invalid empty state.

## Expected

Either:
- Add an empty placeholder option (`<option value="">-- Select Location --</option>`)
  as the first option so the native select truly shows nothing selected, OR
- On form open, auto-select the first location and set `locationId` to its ID
  so the visible selection matches the state.

The user should never face a "Please select a Location" error when the dropdown
visually shows a location name.

## Reproduction

1. Ensure the global location header is set to **All Locations**.
2. Navigate to **Purchases → Debit Notes**.
3. Click **Manual** to open the Manual Debit Note form.
4. Observe: Location dropdown appears to show the first location (e.g.
   "Main Branch") — do NOT change it.
5. Type 2+ chars in Vendor → select **QA-Suba Test Vendor**.
6. In Line Items, select any Schemes Ledger and enter Amount `500`.
7. Click **Create Debit Note**.
8. **Actual**: Toast "Please select a Location" — note not created.
9. **Expected**: Note created, or Location field visually shows it is empty.

## Evidence

- Code extract: `findings/evidence/mdn-location-ghost-code.txt`
- Screenshot: browser test required (Playwright MCP not installed this session)

## Root cause

`locationId` state initialises to `''` when in All-Locations mode.
The native `<select>` has no `<option value="">` entry, so the browser renders
the first real option as selected — but `value=""` in the controlled component
means React never fires `onChange` for that "default" visual selection.
State therefore stays `''` until the user manually changes the dropdown.

## Fix

- **Option A** (minimal): Add `<option value="">Select location…</option>` as
  the first child of the `<select>` so the empty state is visible.
- **Option B** (better UX): When locations load and `locationId` is still `''`,
  auto-set `locationId` to `filteredLocations[0]?.location_id`.
- Files to touch: `src/pages/sales/manualNotes/ManualDebitNote/index.js`
  (lines 232–239 for option A; add a `useEffect` watching `filteredLocations`
  for option B).
- Regression spec to add: `tests/e2e/specs/manual-debit-note.spec.ts`
  — "location field shows empty on All-Locations header; submitting without
  selecting shows error AND field is clearly empty".
