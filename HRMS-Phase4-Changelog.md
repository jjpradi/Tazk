# HRMS Phase 4 Changelog — Expense & Reimbursement Enhancement + HR Policies

**Date:** 2026-03-15
**Branch:** uvdev3

---

## Level 1: DB Migration — Expense Policy & Claims Enhancement
**File:** `tzk-payroll/src/services/migrations/2026_03_15_006_expense_policy.sql`

- Created `expense_policy` table with fields: policy_name, category_id, grade_id, department_id, max_amount, max_monthly, max_yearly, requires_receipt, requires_approval, auto_approve_below, effective_from/to, is_active
- Altered existing `claims` table to add: receipt_urls (JSON), expense_date (DATE), policy_id (INT FK), violation_flag (TINYINT), violation_reason (VARCHAR 500)
- Idempotent migration using `SET @ddl := IF(EXISTS(...))` pattern

## Level 2: DB Migration — HR Policies & Acknowledgment Tracking
**File:** `tzk-payroll/src/services/migrations/2026_03_15_007_hr_policies.sql`

- Created `hr_policy` table with: policy_name, policy_code, policy_category (10-value ENUM), description, content_html (LONGTEXT), document_url, version, effective_date, expiry_date, status (draft/active/archived), requires_acknowledgment, acknowledgment_deadline, applicable_departments/grades (JSON)
- Created `hr_policy_acknowledgment` table with: policy_id, employee_id, acknowledged_at, ip_address, user_agent, policy_version, UNIQUE KEY (policy_id, employee_id)

## Level 3: Backend API — Expense Management Module
**Files:**
- `tzk-payroll/src/api/expense_management/expense_management.sql.js` — 16 SQL queries
- `tzk-payroll/src/api/expense_management/expense_management.model.js` — 16 model methods
- `tzk-payroll/src/api/expense_management/expense_management.controller.js` — 14 controllers
- `tzk-payroll/src/api/expense_management/expense_management.routes.js` — Routes at `/payrollservice/api/expenseManagement`

**API Endpoints:**
- GET `/policies` — List all expense policies
- GET `/policy/:id` — Get policy by ID
- POST `/policy` — Create expense policy
- PUT `/policy` — Update expense policy
- DELETE `/policy/:id` — Delete expense policy
- POST `/validate` — Validate claim against policy (checks per-claim, monthly, yearly limits)
- GET `/claims` — Claims with policy info joined
- GET `/claims/employee/:employee_id` — Claims by employee
- GET `/claims/violations` — Violation claims only
- POST `/claims/updatePolicy` — Update claim with policy linkage
- GET `/report/summary` — Summary stats (date range)
- GET `/report/byCategory` — Expense by category (date range)
- GET `/report/byDepartment` — Expense by department (date range)
- GET `/report/byEmployee` — Expense by employee (date range)

**Key Feature:** Most-specific-wins policy matching — queries ORDER BY category_id, grade_id, department_id specificity with LIMIT 1.

## Level 4: Backend API — HR Policies Module
**Files:**
- `tzk-payroll/src/api/hr_policies/hr_policies.sql.js` — 14 SQL queries
- `tzk-payroll/src/api/hr_policies/hr_policies.model.js` — 14 model methods
- `tzk-payroll/src/api/hr_policies/hr_policies.controller.js` — 14 controllers
- `tzk-payroll/src/api/hr_policies/hr_policies.routes.js` — Routes at `/payrollservice/api/hrPolicies`

**API Endpoints:**
- GET `/list` — All policies
- GET `/active` — Active policies only
- GET `/detail/:id` — Policy detail
- POST `/policy` — Create policy (draft)
- PUT `/policy` — Update policy (increments version)
- POST `/publish` — Publish policy (draft → active)
- POST `/archive` — Archive policy
- DELETE `/policy/:id` — Soft delete
- POST `/acknowledge` — Acknowledge policy (ON DUPLICATE KEY UPDATE)
- GET `/acknowledgments/:policy_id` — Get policy acknowledgments with employee info
- GET `/myAcknowledged` — Employee's own acknowledged policies
- GET `/pendingAcknowledgments` — Policies pending employee acknowledgment (NOT IN subquery)
- GET `/compliance` — Compliance dashboard with urgency (overdue/due_soon/on_track)
- GET `/unacknowledged/:policy_id` — Unacknowledged employees for a policy

## Level 5: Frontend — Redux Infrastructure
**Files:**
- `tzk-tazk-ui/src/services/expenseManagement.services.js` — 15 API methods
- `tzk-tazk-ui/src/services/hrPolicies.services.js` — 14 API methods
- `tzk-tazk-ui/src/redux/actionTypes/index.js` — Added EM_* (7) and HP_* (8) action types
- `tzk-tazk-ui/src/redux/actions/expenseManagement.actions.js` — 10 action creators
- `tzk-tazk-ui/src/redux/reducers/expenseManagement_reducers.js` — 7 state slices
- `tzk-tazk-ui/src/redux/actions/hrPolicies.actions.js` — 14 action creators
- `tzk-tazk-ui/src/redux/reducers/hrPolicies_reducers.js` — 8 state slices
- `tzk-tazk-ui/src/redux/reducers/index.js` — Registered both reducers
- `tzk-tazk-ui/src/utils/routesprefix.js` — Added `expenseManagement`, `hrPolicies` prefixes

## Level 6: Frontend — Expense Management UI Pages
**Files:**
- `src/pages/payroll/expenseManagement/index.js` — Main page with 4 tabs
- `src/pages/payroll/expenseManagement/tabs/PoliciesConfigTab.js` — Expense policy CRUD with INR formatting, limit chips, active/inactive status, add/edit dialog with category/grade/department targeting, receipt/approval toggles, auto-approve threshold
- `src/pages/payroll/expenseManagement/tabs/ClaimsOverviewTab.js` — Claims list with policy info, 5 summary stat cards, status chips, violation highlighting, policy name badges
- `src/pages/payroll/expenseManagement/tabs/ViolationsTab.js` — Policy violation cards with red-accent styling, violation reason display, policy limit comparison
- `src/pages/payroll/expenseManagement/tabs/ExpenseReportsTab.js` — Date range filters, 6 summary stat cards, reports by category (with progress bars), by department, by employee (top spenders)

## Level 7: Frontend — HR Policies UI Pages
**Files:**
- `src/pages/payroll/hrPolicies/index.js` — Main page with 4 tabs
- `src/pages/payroll/hrPolicies/tabs/PoliciesListTab.js` — Full policy CRUD with status filters (all/draft/active/archived), publish/archive workflow buttons, HTML content preview dialog, category/version display, acknowledgment settings, applicable departments/grades JSON input
- `src/pages/payroll/hrPolicies/tabs/ComplianceDashboardTab.js` — 4 urgency summary cards, per-policy acknowledgment progress bars, urgency color-coding (overdue=red, due_soon=orange, on_track=green), unacknowledged employees drill-down dialog
- `src/pages/payroll/hrPolicies/tabs/MyPoliciesTab.js` — ESS view: pending acknowledgments with acknowledge button, acknowledged policies list with date/version info
- `src/pages/payroll/hrPolicies/tabs/AcknowledgmentTrackingTab.js` — Policy selector dropdown, acknowledgment table with employee avatar, code, department, timestamp, version

## Level 8: Routing & Navigation
**Files:**
- `src/pages/allRoutes.js` — Added lazy imports and routes for `/payroll/expenseManagement` and `/payroll/hrPolicies`
- `src/pages/routesConfig.js` — Added menu items: Expense Management (head_206, AccountBalanceWallet icon), HR Policies (head_207, Wysiwyg icon)

---

**Summary:** Phase 4 adds enterprise-grade expense policy management with automated policy matching and violation detection, plus a comprehensive HR policy lifecycle system with versioned policies, employee acknowledgment tracking, and compliance dashboards. Both modules follow existing codebase patterns (Redux thunk, CreateNewButtonContext, MUI v7 Grid API, INR formatting).
