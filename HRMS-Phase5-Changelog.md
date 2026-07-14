# HRMS Phase 5 Changelog — Performance Management

**Date:** 2026-03-15
**Branch:** uvdev3

---

## Level 1: DB Migration — Performance Management Tables
**File:** `tzk-payroll/src/services/migrations/2026_03_15_008_performance_management.sql`

- **perf_appraisal_cycle** — Appraisal review cycles with configurable type (annual/half_yearly/quarterly), review phase deadlines (self/manager/HR), status workflow (draft→active→self_review→manager_review→hr_review→completed), rating scale
- **perf_kra_template** — Reusable KRA/KPI templates per role/department/grade
- **perf_kra_template_item** — Template line items: KRA name, KPI name, weightage, target description, measurement type (numeric/percentage/rating/boolean)
- **perf_employee_appraisal** — Per-employee appraisal: self/manager/HR ratings, comments, feedback, outcome (rating_label, increment/promotion recommended), status workflow with submission timestamps. UNIQUE KEY on (company, employee, cycle)
- **perf_appraisal_kra_score** — Per-KRA scores: self_score, manager_score, final_score with comments. UNIQUE KEY on (appraisal, kra_item)
- **perf_goals** — Employee goals: title, description, target/achieved values, weightage, progress percentage, status (not_started/in_progress/completed/deferred), optional cycle linkage

## Level 2: Backend API — Performance Management Module
**Files:**
- `tzk-payroll/src/api/performance/performance.sql.js` — 30 SQL queries
- `tzk-payroll/src/api/performance/performance.model.js` — 30 static async model methods
- `tzk-payroll/src/api/performance/performance.controller.js` — 28 controllers
- `tzk-payroll/src/api/performance/performance.routes.js` — Routes at `/payrollservice/api/performance`
- `tzk-payroll/src/routes.js` — Registered performance routes

**API Endpoints (28):**

*Appraisal Cycles:*
- GET `/cycles` — List all cycles
- GET `/cycle/:id` — Cycle detail
- POST `/cycle` — Create cycle
- PUT `/cycle` — Update cycle
- POST `/cycle/status` — Advance cycle status
- DELETE `/cycle/:id` — Delete cycle

*KRA Templates:*
- GET `/templates` — List templates with item counts
- POST `/template` — Create template
- PUT `/template` — Update template
- DELETE `/template/:id` — Delete template
- GET `/template/items/:id` — Get template KRA items
- POST `/template/item` — Create KRA item
- PUT `/template/item` — Update KRA item
- DELETE `/template/item/:id` — Delete KRA item

*Employee Appraisals:*
- GET `/appraisals/cycle/:cycle_id` — Appraisals by cycle with employee info
- GET `/appraisals/my` — Current employee's appraisals
- GET `/appraisals/team/:cycle_id` — Manager's team appraisals
- GET `/appraisal/:id` — Appraisal detail
- POST `/appraisal` — Create single appraisal
- POST `/appraisals/bulk` — Bulk create appraisals (INSERT IGNORE)
- POST `/appraisal/selfReview` — Submit self review (status→manager_review)
- POST `/appraisal/managerReview` — Submit manager review with recommendations (status→hr_review)
- POST `/appraisal/hrReview` — Submit HR review with final rating (status→completed)

*KRA Scores:*
- GET `/kraScores/:appraisal_id` — KRA scores for an appraisal
- POST `/kraScore` — Upsert KRA score (ON DUPLICATE KEY UPDATE)

*Goals:*
- GET `/goals` — My goals
- GET `/goals/employee/:employee_id` — Employee's goals
- GET `/goals/cycle/:cycle_id` — Goals by cycle
- POST `/goal` — Create goal
- PUT `/goal` — Update goal with progress
- DELETE `/goal/:id` — Delete goal

*Dashboard:*
- GET `/dashboard` — Stats per cycle: total, status breakdown, avg rating
- GET `/dashboard/ratings/:cycle_id` — Rating distribution (Outstanding/Exceeds/Meets/Below/Needs Improvement)

## Level 3: Frontend Redux Infrastructure
**Files:**
- `src/services/performance.services.js` — 20 API methods
- `src/redux/actionTypes/index.js` — Added PF_* (11 action types)
- `src/redux/actions/performance.actions.js` — 24 action creators
- `src/redux/reducers/performance_reducers.js` — 11 state slices
- `src/redux/reducers/index.js` — Registered PerformanceReducer
- `src/utils/routesprefix.js` — Added `performance` prefix

## Level 4: Frontend UI — Performance Management Pages (6 tabs)

**Main Page:** `src/pages/payroll/performance/index.js`

### Tab 1: Appraisal Cycles (HR)
**File:** `tabs/AppraisalCyclesTab.js`
- Cycle cards with status color-coding (draft=grey, active=blue, self_review=orange, manager_review=purple, hr_review=teal, completed=green)
- CRUD dialog with cycle type, date range, review deadlines, rating scale
- Status advance button (draft→active→self_review→...→completed)
- Delete confirmation

### Tab 2: KRA Templates (HR)
**File:** `tabs/KraTemplatesTab.js`
- Template cards showing department/grade/designation, KRA count
- Drill-down dialog showing KRA items table (name, KPI, weightage %, measurement type)
- Full CRUD for both templates and KRA items
- Nested dialog pattern: template list → template items → item editor

### Tab 3: My Appraisal (ESS)
**File:** `tabs/MyAppraisalTab.js`
- Employee's assigned appraisals across cycles
- Self/Manager/Final ratings display with MUI Rating component
- Self review dialog: rating picker + comments textarea
- Increment/promotion recommendation chips
- Status-aware: self review button only when status allows

### Tab 4: Team Appraisals (Manager)
**File:** `tabs/TeamAppraisalsTab.js`
- Cycle selector (active cycles only)
- Team member cards with avatar, employee info, rating breakdown
- Manager review dialog: employee self-assessment preview, rating picker, comments, training recommendations, increment/promotion toggle chips
- Status-aware: review button only in manager_review status

### Tab 5: Goals
**File:** `tabs/GoalsTab.js`
- Goal cards with progress bar (color-coded by progress level)
- Status summary chips in header
- Full CRUD dialog: title, description, target/achieved values, weightage, due date, status, progress slider, optional cycle linkage
- Target vs achieved display, weightage chip

### Tab 6: Performance Dashboard
**File:** `tabs/PerfDashboardTab.js`
- Cycle-wise summary cards: completion progress bar, avg rating, status breakdown chips
- Rating distribution: horizontal bar chart with color-coded labels (Outstanding=green, Exceeds=blue, Meets=orange, Below=red, Needs Improvement=dark red)
- Cycle selector for distribution drill-down

## Level 5: Routing & Navigation
**Files:**
- `src/pages/allRoutes.js` — Lazy import + route `/payroll/performance`
- `src/pages/routesConfig.js` — Menu item: Performance (head_208, Addchart icon)

---

**Summary:** Phase 5 delivers a complete performance management system with multi-phase appraisal cycles (self→manager→HR review workflow), reusable KRA/KPI templates, per-KRA scoring, employee goal tracking with progress visualization, and an analytics dashboard with rating distributions. The module supports all three user personas: HR (cycles, templates, dashboard), Manager (team reviews, recommendations), and Employee (self-review, goals).
