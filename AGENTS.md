# AGENTS.md (Frontend) — tzk-tazk-ui

These instructions govern Codex changes in the **frontend** repo: `tzk-tazk-ui`.

## Scope
- Implement CRM **must-have** features already covered by the v3 schema into the existing UI.
- **Only** create/modify CRM pages under: `tzk-tazk-ui/src/pages/crm/`
- Use existing UI patterns from the “golden” reference:
  - `tzk-tazk-ui/src/pages/crm/leadManagement`
- Authentication is handled elsewhere. Do **not** build login/SSO/permission screens.

## Hard boundaries
- Do **not** modify other workspace projects (`tzk-gate-way`, `tzk-userauth`, etc.) unless explicitly requested.
- Do **not** add new UI libraries or change the design system. Use **MUI + Crema v3.4** only.
- Do **not** create pages outside `src/pages/crm/`.
- Do **not** introduce a new global error/response envelope. Follow existing app patterns.

## UI/Theme rules (Crema v3.4)
- Use existing Crema layout/shell and components from:
  - `tzk-tazk-ui/src/@crema/`
  - Shared components: `tzk-tazk-ui/src/components/`
- Match spacing, typography, button hierarchy, table layout, and dialog patterns used in:
  - `src/pages/crm/leadManagement`
- Prefer existing wrappers/components for:
  - Page headers, breadcrumbs
  - Filters/search toolbars
  - Data tables and pagination
  - Modals/drawers
  - Empty/loading/error states
  - Toast/snackbar notifications (use the app’s existing pattern)

## Data & multi-company constraints
- All CRM data is company-scoped. Every API call must use the currently logged in user context (company_id).
- Do **not** hardcode company_id/employee_id.
- Assume the backend derives identity from access token via middleware; frontend must only send the token as it already does.

## Frontend architecture expectations
- Follow existing patterns in the repo for:
  - Routing (where routes are registered today)
  - Redux usage (`tzk-tazk-ui/src/redux/`) if used by leadManagement
  - API client wrapper (search and reuse existing axios/fetch helper; do not add a new one)
- Components:
  - Prefer composing existing shared components rather than creating new duplicates.
  - New reusable CRM UI components (if truly needed) should live under `src/components/` with clear naming.

## Page requirements (common)
For any CRM page you create:
- Provide:
  - List view with server-side pagination (if existing pattern supports it)
  - Search/filter panel consistent with leadManagement
  - Create/edit dialog or dedicated form screen (use existing pattern)
  - View details screen (if the app uses details routes)
- States:
  - Loading state (skeleton/spinner per existing pattern)
  - Empty state (no data)
  - Error state (non-blocking message consistent with the app)

## Quality requirements
Before finalizing changes:
- Run and report:
  - `npm run lint`
  - `npm test` (or the relevant test command for affected code)
- Keep changes small and reviewable (PR-sized slices).

## Commands (as defined in package.json)
- start: `npm start`
- build: `npm run build`
- test: `npm test`
- lint: `npm run lint`
- lint fix: `npm run lint:fix`
- format: `npm run format`

## Output expectations for Codex (when implementing a feature)
When asked to implement a CRM UI feature, respond with:
- Files changed/added (paths)
- How to run/test
- Any TODOs or assumptions (only if unavoidable)

## New page addition flow (future reference)
Use this flow when a task explicitly asks for end-to-end page registration across services.

1. Subscription mapping (`tzk-com-services`)
- File: `src/api/subscription/leadsSubscriptions.js`
- Add the new page/module name in all required lead plans (`Basic`, `Standard`, `Premium`, `Ultimate`) under `module_name`.
- Keep module naming consistent with route `messageId` and DB module/sub-module names.

2. Role route config (`tzk-com-services`)
- File: `src/api/userRole/routesConfig/leads.js`
- Add route entry for each applicable role (`administrator`, `employee`, `manager`, `salesman`).
- Use `type: 'item'` for landing pages.
- Use `type: 'collapse'` only for parent menu groups, with child entries as `type: 'item'`.
- Ensure `messageId` exactly matches module naming used in subscriptions/DB.

3. Frontend route registration (`tzk-tazk-ui`)
- File: `src/pages/allRoutes.js`
- Add/import the page component and register route config (`path`, `key`, `parentName`, `element`).
- Keep route style aligned with existing CRM entries.

4. DB module seed/migration
- Add SQL migration/seed for:
  - Parent menu in `pos_modules`
  - Landing page entries in `pos_sub_modules`
- Prefer idempotent SQL (`NOT EXISTS`) so scripts are re-runnable safely.
- Company scope pattern (for leads company type): `company_type IN (10)`, active and non-deleted companies only.

5. Verification checklist
- `getRoutesConfig` returns new route for target role.
- Subscription plan payload includes the new module.
- `pos_modules` and `pos_sub_modules` have expected rows for target companies.
- UI shows the menu item and page opens successfully.
