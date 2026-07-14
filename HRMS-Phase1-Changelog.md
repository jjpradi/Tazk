# HRMS Phase 1 — Employee Profile & Organization Foundation

**Date**: 2026-03-15
**Phase**: 1 (Foundation)

---

## Phase 1A: Enhanced Employee Profile

### Level 1 — Database Migration
**File**: `tzk-payroll/src/services/migrations/2026_03_15_001_employee_profile_foundation.sql`

**New Tables Created:**
| Table | Purpose |
|-------|---------|
| `emp_grade` | Employee grade/band master (L1, L2, M1, etc.) with level hierarchy |
| `emp_qualifications` | Education, certifications, skills, languages per employee |
| `emp_emergency_contacts` | Structured emergency contact info with primary flag |
| `emp_work_history` | Previous employment records with reference details |

**Altered Tables:**
| Table | New Columns |
|-------|-------------|
| `pos_people` | `blood_group`, `marital_status`, `nationality`, `aadhar_number`, `pan_number`, `father_name`, `spouse_name` |
| `pos_employees` | `grade_id`, `probation_end_date`, `confirmation_date`, `notice_period_days`, `employment_type` |

---

### Level 2 — Backend API Module
**Directory**: `tzk-payroll/src/api/employee_profile/`

**Files Created:**
| File | Description |
|------|-------------|
| `employee_profile.sql.js` | 24 SQL queries (profile, grades, qualifications, emergency contacts, work history CRUD) |
| `employee_profile.model.js` | 18 static async model methods with pool connection pattern |
| `employee_profile.controller.js` | 20 controller functions with try/catch/finally + transaction management |
| `employee_profile.routes.js` | REST routes for all endpoints |

**Route mounted at**: `/payrollservice/api/employeeProfile`

**API Endpoints (20):**
- `GET /employees` — Search all employees with profile summary
- `GET /:employee_id` — Get full employee profile
- `POST /updatePersonalInfo` — Update extended personal fields
- `POST /updateEmployeeProfile` — Update grade, probation, employment type
- `GET/POST/PUT /grade`, `DELETE /grade/:id` — Grades CRUD
- `GET /qualification/:employee_id`, `POST/PUT /qualification`, `DELETE /qualification/:id`
- `GET /emergencyContact/:employee_id`, `POST/PUT /emergencyContact`, `DELETE /emergencyContact/:id`
- `GET /workHistory/:employee_id`, `POST/PUT /workHistory`, `DELETE /workHistory/:id`

---

### Level 3 — Frontend (React)

**Redux:**
| File | Description |
|------|-------------|
| `src/redux/actionTypes/index.js` | Added 6 action types: `EP_SEARCH_EMPLOYEES`, `EP_GET_PROFILE`, `EP_GET_GRADES`, `EP_GET_QUALIFICATIONS`, `EP_GET_EMERGENCY_CONTACTS`, `EP_GET_WORK_HISTORY` |
| `src/redux/actions/employeeProfile.actions.js` | 16 action creators for all CRUD operations |
| `src/redux/reducers/employeeProfile_reducers.js` | Reducer with 6 state slices |
| `src/redux/reducers/index.js` | Registered `EmployeeProfileReducer` |

**Service:**
| File | Description |
|------|-------------|
| `src/services/employeeProfile.services.js` | 16 API methods mapped to backend endpoints |
| `src/utils/routesprefix.js` | Added `employeeProfile` prefix |

**UI Pages:**
| File | Description |
|------|-------------|
| `src/pages/payroll/employeeProfile/index.js` | Employee list with card grid, search filter, click-to-detail navigation |
| `src/pages/payroll/employeeProfile/EmployeeProfileDetail.js` | 6-tab profile detail view with header card |
| `src/pages/payroll/employeeProfile/tabs/PersonalInfoTab.js` | Personal info view/edit with blood group, marital status, nationality, Aadhar, PAN, family names |
| `src/pages/payroll/employeeProfile/tabs/EmploymentInfoTab.js` | Employment details view/edit with grade, probation, confirmation, notice period, employment type |
| `src/pages/payroll/employeeProfile/tabs/QualificationsTab.js` | Qualifications CRUD with card grid, type chips (Education/Certification/Skill/Language), dialog form |
| `src/pages/payroll/employeeProfile/tabs/EmergencyContactsTab.js` | Emergency contacts CRUD with primary contact flag, phone/email/address display |
| `src/pages/payroll/employeeProfile/tabs/WorkHistoryTab.js` | Work history CRUD with timeline visualization, duration calculation, CTC display |
| `src/pages/payroll/employeeProfile/tabs/BankStatutoryTab.js` | Read-only bank & statutory view with masked sensitive fields |

**Routing:**
| File | Change |
|------|--------|
| `src/pages/allRoutes.js` | Added lazy import + route `/payroll/employeeProfile` |
| `src/pages/routesConfig.js` | Added nav menu item "Employee Profile" with `AccountCircleIcon` (id: head_200) |

---

## Phase 1B: Organization Structure Enhancement

### Level 4 — Database Migration
**File**: `tzk-payroll/src/services/migrations/2026_03_15_002_org_structure_foundation.sql`

**Altered Tables:**
| Table | New Columns |
|-------|-------------|
| `departments` | `parent_department_id`, `level`, `sort_order`, `description` |

**New Tables Created:**
| Table | Purpose |
|-------|---------|
| `cost_center` | Cost center master linked to departments for HR analytics |

---

### Level 5 — Backend API Module
**Directory**: `tzk-payroll/src/api/org_structure/`

**Files Created:**
| File | Description |
|------|-------------|
| `org_structure.sql.js` | 10 SQL queries including recursive CTE for department tree, org chart with reporting hierarchy |
| `org_structure.model.js` | 8 static async model methods including tree builder for org chart |
| `org_structure.controller.js` | 8 controller functions |
| `org_structure.routes.js` | REST routes |

**Route mounted at**: `/payrollservice/api/orgStructure`

**API Endpoints (8):**
- `GET /departmentTree` — Recursive department hierarchy with employee counts + heads
- `POST /departmentHierarchy` — Update department parent/level/sort
- `GET /orgChart` — Full reporting structure as tree + flat list
- `GET /departmentStats` — Department-wise employee counts
- `GET/POST/PUT /costCenter`, `DELETE /costCenter/:id` — Cost center CRUD

---

### Level 6 — Frontend (React)

**Redux:**
| File | Description |
|------|-------------|
| `src/redux/actionTypes/index.js` | Added 4 action types: `ORG_DEPARTMENT_TREE`, `ORG_CHART_DATA`, `ORG_COST_CENTERS`, `ORG_DEPARTMENT_STATS` |
| `src/redux/actions/orgStructure.actions.js` | 8 action creators |
| `src/redux/reducers/orgStructure_reducers.js` | Reducer with 4 state slices |
| `src/redux/reducers/index.js` | Registered `OrgStructureReducer` |

**Service:**
| File | Description |
|------|-------------|
| `src/services/orgStructure.services.js` | 8 API methods |
| `src/utils/routesprefix.js` | Added `orgStructure` prefix |

**UI Pages:**
| File | Description |
|------|-------------|
| `src/pages/payroll/orgStructure/index.js` | 3-tab page: Org Chart, Departments, Cost Centers |
| `src/pages/payroll/orgStructure/OrgChartView.js` | Interactive org chart tree with expand/collapse, employee cards, stats summary |
| `src/pages/payroll/orgStructure/DepartmentTreeView.js` | Department hierarchy tree with edit dialog for parent/sort/description |
| `src/pages/payroll/orgStructure/CostCenterView.js` | Cost center CRUD with MaterialTable + dialog form |

**Routing:**
| File | Change |
|------|--------|
| `src/pages/allRoutes.js` | Added lazy import + route `/payroll/orgStructure` |
| `src/pages/routesConfig.js` | Added nav menu item "Organization Structure" with `AccountTreeIcon` (id: head_201) |

---

## Summary of Changes

| Area | Files Created | Files Modified |
|------|--------------|----------------|
| Database | 2 migration files | — |
| Backend | 8 files (2 modules) | 1 (`routes.js`) |
| Frontend | 18 files | 4 (`routesprefix.js`, `actionTypes/index.js`, `reducers/index.js`, `allRoutes.js`, `routesConfig.js`) |
| **Total** | **28 new files** | **5 modified files** |

## Non-Breaking Confirmation

- All changes are **additive** — no existing tables, columns, or files modified
- New columns are nullable — existing queries unaffected
- New tables use same patterns (InnoDB, utf8mb4, soft delete, audit columns)
- Backend uses pool connection pattern consistent with existing modules
- Frontend uses existing Redux/Thunk pattern, MUI v7 Grid, SafeMaterialTable
- Two new menu items appear in payroll sidebar navigation
