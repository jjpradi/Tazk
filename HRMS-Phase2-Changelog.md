# HRMS Phase 2 — Employee Lifecycle Management & HR Letters

**Date**: 2026-03-15
**Phase**: 2 (Lifecycle & Letters)

---

## Phase 2A: Employee Lifecycle Management

### Level 1 — Database Migration
**File**: `tzk-payroll/src/services/migrations/2026_03_15_003_employee_lifecycle.sql`

**New Tables Created:**
| Table | Purpose |
|-------|---------|
| `emp_lifecycle_event` | Lifecycle event log — onboarding, confirmation, promotion, transfer, increment, separation, rehire. Tracks from/to department, designation, grade, location, manager, CTC. Includes separation details and approval workflow. |
| `onboarding_checklist_template` | Configurable onboarding items with category (documentation/it_setup/hr_formalities/training/compliance), responsible party (hr/manager/employee/it), sort order, mandatory flag |
| `emp_onboarding_checklist` | Per-employee onboarding tracking with status (pending/in_progress/completed/skipped), completion date and remarks |
| `emp_fnf_settlement` | Full & Final settlement — earnings (salary, leave encashment, bonus, gratuity), deductions (notice recovery, loan, advance, asset), totals, approval & payment tracking |

**Altered Tables:**
| Table | New Columns |
|-------|-------------|
| `pos_employees` | `employee_status` (active/probation/notice_period/separated/absconding), `separation_date` |

---

### Level 2 — Backend API Module
**Directory**: `tzk-payroll/src/api/employee_lifecycle/`

**Files Created:**
| File | Description |
|------|-------------|
| `employee_lifecycle.sql.js` | 28 SQL queries — lifecycle CRUD, probation tracker (with auto-computed status), onboarding dashboard (progress %), FnF CRUD with approval, dashboard stats |
| `employee_lifecycle.model.js` | 26 static async model methods with pool connection pattern, auto-computed FnF totals |
| `employee_lifecycle.controller.js` | 28 controller functions with try/catch/finally + transaction management |
| `employee_lifecycle.routes.js` | REST routes for all endpoints |

**Route mounted at**: `/payrollservice/api/employeeLifecycle`

**API Endpoints (28):**
- `GET /dashboard` — Dashboard stats (pending onboardings, probation due, active separations, pending FnF, monthly counts)
- `GET /events/:employee_id` — Lifecycle events for employee with full JOINs
- `GET /event/:id` — Single event detail
- `GET /eventsByType/:event_type` — Filter events by type
- `POST /event` — Create lifecycle event
- `PUT /event` — Update lifecycle event
- `POST /event/approve` — Approve event
- `POST /event/complete` — Complete event
- `POST /event/cancel` — Cancel event with reason
- `DELETE /event/:id` — Delete draft event
- `GET /probation` — Probation tracker (auto-computed: confirmed/overdue/due_soon/on_probation)
- `GET/POST/PUT /checklistTemplate`, `DELETE /checklistTemplate/:id` — Template CRUD
- `GET /onboardingDashboard` — Progress per employee with % completion
- `GET /checklist/:employee_id` — Employee checklist items
- `POST /checklist/initialize` — Initialize checklist from templates
- `POST /checklist/updateStatus` — Update item status
- `GET /fnf/pending` — All pending FnF settlements
- `GET /fnf/:employee_id` — FnF by employee
- `GET /fnf/detail/:id` — FnF detail
- `POST /fnf` — Create FnF (auto-compute totals)
- `PUT /fnf` — Update FnF amounts
- `POST /fnf/approve` — Approve FnF
- `POST /fnf/markPaid` — Mark FnF paid with payment ref
- `DELETE /fnf/:id` — Delete draft FnF
- `POST /updateStatus` — Update employee lifecycle status

---

### Level 3 — Frontend (React)

**Redux:**
| File | Description |
|------|-------------|
| `src/redux/actionTypes/index.js` | Added 9 action types: `LC_DASHBOARD_STATS`, `LC_LIFECYCLE_EVENTS`, `LC_EVENTS_BY_TYPE`, `LC_PROBATION_EMPLOYEES`, `LC_CHECKLIST_TEMPLATES`, `LC_EMPLOYEE_CHECKLIST`, `LC_ONBOARDING_DASHBOARD`, `LC_PENDING_FNF`, `LC_FNF_DETAIL` |
| `src/redux/actions/employeeLifecycle.actions.js` | 25 action creators for all CRUD + workflow operations |
| `src/redux/reducers/employeeLifecycle_reducers.js` | Reducer with 9 state slices |
| `src/redux/reducers/index.js` | Registered `EmployeeLifecycleReducer` |

**Service:**
| File | Description |
|------|-------------|
| `src/services/employeeLifecycle.services.js` | 22 API methods mapped to backend endpoints |
| `src/utils/routesprefix.js` | Added `employeeLifecycle` prefix |

**UI Pages:**
| File | Description |
|------|-------------|
| `src/pages/payroll/employeeLifecycle/index.js` | Main page with 6-tab layout (Dashboard, Onboarding, Probation, Lifecycle Events, Separation & FnF, Checklist Config) |
| `src/pages/payroll/employeeLifecycle/tabs/LifecycleDashboard.js` | 6 stat cards with counts: pending onboardings, probation due soon, active separations, pending FnF, confirmations & movements this month |
| `src/pages/payroll/employeeLifecycle/tabs/OnboardingTab.js` | Employee onboarding cards with progress bars, checklist detail dialog with category grouping, inline status update per item |
| `src/pages/payroll/employeeLifecycle/tabs/ProbationTab.js` | Probation tracker cards with filter chips (all/overdue/due_soon/on_probation/confirmed), color-coded border, days remaining, confirm dialog with DatePicker |
| `src/pages/payroll/employeeLifecycle/tabs/LifecycleEventsTab.js` | Event type selector with color chips, event list with status workflow buttons (approve/complete/cancel), create dialog with dynamic fields per event type (promotion/transfer/increment/separation) |
| `src/pages/payroll/employeeLifecycle/tabs/SeparationFnfTab.js` | FnF cards with earnings/deductions summary, detail dialog with edit mode for amounts, approve and mark paid workflows |
| `src/pages/payroll/employeeLifecycle/tabs/ChecklistConfigTab.js` | Checklist template management with category grouping, add/edit dialog with category, responsible party, sort order, mandatory toggle |

**Routing:**
| File | Change |
|------|--------|
| `src/pages/allRoutes.js` | Added lazy imports + routes `/payroll/employeeLifecycle` and `/payroll/hrLetters` |
| `src/pages/routesConfig.js` | Added `AssignmentTurnedInIcon` import, "Employee Lifecycle" menu (id: head_202) and "HR Letters" menu (id: head_203) |

---

## Phase 2B: HR Letter Generation

### Level 4 — Backend: Document Type Registration
**Files:**
- `tzk-tazk-ui/src/pages/common/docTemplates/index.js` — Added 16 HR letter types to `DOC_TYPES` dropdown
- `tzk-com-services/docs/migrations/020_hr_letter_placeholders.js` — Placeholder registry migration

**16 HR Letter Types Registered:**
| Category | Letters |
|----------|---------|
| Joining | Offer Letter, Appointment Letter, Internship Letter |
| Confirmation | Confirmation Letter |
| Movement | Promotion Letter, Increment Letter, Transfer Letter |
| Disciplinary | Warning Letter |
| Separation | Termination Letter, Relieving Letter, Experience Letter |
| Certificate | Address Proof Letter, Salary Certificate, Employment Certificate, NOC Letter, Bonafide Letter |

**Placeholder Structure:**
- ~400 placeholders across 16 letter types
- Shared blocks: Company (13 fields), Employee (14 fields), Document (3 fields)
- Letter-specific sections: offer terms, promotion details, salary details, warning details, etc.
- Uses ON DUPLICATE KEY UPDATE for idempotent seeding

---

### Level 5 — Frontend: HR Letters Page
**File**: `src/pages/payroll/hrLetters/index.js`

**Features:**
- 3-step wizard: Select Employee → Choose Letter → Review & Generate
- Employee search with Autocomplete, profile preview card
- Letter type selector grouped by category (Joining, Confirmation, Movement, Disciplinary, Separation, Certificate) with color-coded cards
- Auto-populates employee data from profile into placeholder fields
- Placeholder editor grouped by section (document, employee, company, hr, salary)
- Live preview via existing doc_template render engine
- Print functionality opens new window with rendered HTML
- Integrates with existing doc_template platform — no new backend APIs needed

---

## Summary of Changes

| Area | Files Created | Files Modified |
|------|--------------|----------------|
| Database | 1 migration file | — |
| Backend | 4 files (1 module) | 1 (`routes.js`) |
| Frontend | 13 files | 5 (`routesprefix.js`, `actionTypes/index.js`, `reducers/index.js`, `allRoutes.js`, `routesConfig.js`) |
| Doc Template | 1 migration file | 1 (`docTemplates/index.js`) |
| **Total** | **19 new files** | **7 modified files** |

## Non-Breaking Confirmation

- All changes are **additive** — no existing tables, columns, or files modified destructively
- New columns on `pos_employees` are nullable — existing queries unaffected
- New tables use same patterns (InnoDB, utf8mb4, soft delete, audit columns)
- Backend uses pool connection pattern consistent with existing modules
- Frontend uses existing Redux/Thunk pattern, MUI v7 Grid, DatePicker, Autocomplete
- HR Letters page reuses existing doc_template platform — zero new backend APIs
- Three new menu items appear in payroll sidebar navigation
