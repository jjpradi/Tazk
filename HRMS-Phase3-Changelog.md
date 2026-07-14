# HRMS Phase 3 — Employee Self-Service Enhancement & Document Management

**Date**: 2026-03-15
**Phase**: 3 (ESS & Documents)

---

## Phase 3A: Employee Self-Service Portal

### Level 1 — Database Migration
**File**: `tzk-payroll/src/services/migrations/2026_03_15_004_ess_profile_change.sql`

**New Tables Created:**
| Table | Purpose |
|-------|---------|
| `emp_profile_change_request` | ESS-initiated profile edits requiring HR approval. Tracks field_name, old/new values, proof_url, status (pending/approved/rejected), approver details. |

---

### Level 2 — Backend API Module
**Directory**: `tzk-payroll/src/api/ess_portal/`

**Files Created:**
| File | Description |
|------|-------------|
| `ess_portal.sql.js` | 12 SQL queries — profile change CRUD + approve/reject, salary structure (allowances + deductions via ss_emp_salary_structure JOINs), team view (members by reporting_manager, attendance summary, pending requests UNION), unified request tracker (UNION ALL across leave/permission/profile_change with LIMIT 50) |
| `ess_portal.model.js` | 12 static async model methods with pool connection pattern |
| `ess_portal.controller.js` | 12 controller functions with try/catch/finally + transaction for writes |
| `ess_portal.routes.js` | REST routes for all endpoints |

**Route mounted at**: `/payrollservice/api/essPortal`

**API Endpoints (12):**
- `GET /changeRequests` — My change requests
- `GET /changeRequests/pending` — All pending requests (HR view)
- `POST /changeRequest` — Submit change request
- `POST /changeRequest/approve` — Approve change request
- `POST /changeRequest/reject` — Reject change request
- `DELETE /changeRequest/:id` — Delete pending request
- `GET /salary/structure` — My salary allowances (read-only)
- `GET /salary/deductions` — My salary deductions (read-only)
- `GET /team/members` — My team members (by reporting_manager)
- `GET /team/attendance` — Team attendance summary (current month)
- `GET /team/pendingRequests` — Team's pending leave/permission requests
- `GET /myRequests` — Unified request tracker (leave + permission + profile change)

---

### Level 3 — Frontend (React)

**Redux:**
| File | Description |
|------|-------------|
| `src/redux/actionTypes/index.js` | Added 8 action types: `ESS_MY_CHANGE_REQUESTS`, `ESS_PENDING_CHANGE_REQUESTS`, `ESS_MY_SALARY_STRUCTURE`, `ESS_MY_SALARY_DEDUCTIONS`, `ESS_TEAM_MEMBERS`, `ESS_TEAM_ATTENDANCE`, `ESS_TEAM_PENDING_REQUESTS`, `ESS_MY_REQUESTS` |
| `src/redux/actions/essPortal.actions.js` | 11 action creators for all CRUD + workflow operations |
| `src/redux/reducers/essPortal_reducers.js` | Reducer with 8 state slices |
| `src/redux/reducers/index.js` | Registered `EssPortalReducer` |

**Service:**
| File | Description |
|------|-------------|
| `src/services/essPortal.services.js` | 10 API methods mapped to backend endpoints |
| `src/utils/routesprefix.js` | Added `essPortal` and `documentManagement` prefixes |

**UI Pages:**
| File | Description |
|------|-------------|
| `src/pages/payroll/essPortal/index.js` | Main page with 5-tab layout (Profile Changes, My Salary, My Team, My Requests, HR Approvals) |
| `src/pages/payroll/essPortal/tabs/ProfileChangesTab.js` | Profile change request cards with status chips, create dialog (10 editable fields), view detail dialog, delete pending |
| `src/pages/payroll/essPortal/tabs/MySalaryTab.js` | Read-only salary view with summary cards (Total Earnings, Total Deductions, Net Pay in INR), side-by-side earnings/deductions tables |
| `src/pages/payroll/essPortal/tabs/MyTeamTab.js` | Team member cards with avatar, attendance badges (present/absent/leave/halfday), member detail dialog, pending team requests section |
| `src/pages/payroll/essPortal/tabs/MyRequestsTab.js` | Unified request tracker with type-colored cards (leave/permission/profile_change), status chips |
| `src/pages/payroll/essPortal/tabs/HRApprovalsTab.js` | Pending change request approval cards with employee info, old/new value comparison, proof link, approve/reject with remarks dialog |

**Routing:**
| File | Change |
|------|--------|
| `src/pages/allRoutes.js` | Added lazy imports + routes `/payroll/essPortal` and `/payroll/documentManagement` |
| `src/pages/routesConfig.js` | Added `BadgeIcon`, `FolderSharedIcon` imports; "ESS Portal" menu (id: head_204) and "Document Management" menu (id: head_205) |

---

## Phase 3B: Document Management Enhancement

### Level 4 — Database Migration
**File**: `tzk-payroll/src/services/migrations/2026_03_15_005_document_management.sql`

**New Tables Created:**
| Table | Purpose |
|-------|---------|
| `emp_document_category` | Structured categories (Identity, Address, Education, etc.) with company_id, is_mandatory, sort_order |

**Altered Tables:**
| Table | New Columns |
|-------|-------------|
| `emp_verification` | `category_id` (FK to emp_document_category), `file_url`, `file_name`, `file_size`, `verification_status` (pending/verified/rejected/expired), `verified_by`, `verified_date`, `rejection_reason`, `expiry_date` |

---

### Level 5 — Backend API Module
**Directory**: `tzk-payroll/src/api/document_management/`

**Files Created:**
| File | Description |
|------|-------------|
| `document_management.sql.js` | 15 SQL queries — category CRUD, employee document CRUD with JOINs (verification_type, employee_verification_indextype, emp_document_category), verify/reject workflow, dashboard (per-employee counts with pending/verified/rejected/expired/expiring_soon), expiring documents (configurable days), pending verifications |
| `document_management.model.js` | 15 static async model methods |
| `document_management.controller.js` | 15 controller functions |
| `document_management.routes.js` | REST routes for all endpoints |

**Route mounted at**: `/payrollservice/api/documentManagement`

**API Endpoints (15):**
- `GET /categories` — Document categories
- `POST /category` — Create category
- `PUT /category` — Update category
- `DELETE /category/:id` — Delete category
- `GET /employee/:employee_id` — Employee documents (grouped by category)
- `GET /detail/:id` — Document detail
- `POST /document` — Create document record
- `POST /upload` — Upload/update document file metadata
- `POST /verify` — Verify document
- `POST /reject` — Reject document with reason
- `DELETE /document/:id` — Delete document
- `GET /verificationTypes` — Verification type lookup
- `GET /dashboard` — Document dashboard (per-employee summary)
- `GET /expiring?days=30` — Expiring documents
- `GET /pendingVerifications` — Documents pending verification

---

### Level 6 — Frontend (React)

**Redux:**
| File | Description |
|------|-------------|
| `src/redux/actionTypes/index.js` | Added 7 action types: `DM_CATEGORIES`, `DM_EMPLOYEE_DOCUMENTS`, `DM_DOCUMENT_DETAIL`, `DM_VERIFICATION_TYPES`, `DM_DASHBOARD`, `DM_EXPIRING_DOCUMENTS`, `DM_PENDING_VERIFICATIONS` |
| `src/redux/actions/documentManagement.actions.js` | 15 action creators for all CRUD + workflow operations |
| `src/redux/reducers/documentManagement_reducers.js` | Reducer with 7 state slices |
| `src/redux/reducers/index.js` | Registered `DocumentManagementReducer` |

**Service:**
| File | Description |
|------|-------------|
| `src/services/documentManagement.services.js` | 13 API methods mapped to backend endpoints |

**UI Pages:**
| File | Description |
|------|-------------|
| `src/pages/payroll/documentManagement/index.js` | Main page with 5-tab layout (Dashboard, Employee Documents, Pending Verifications, Expiring Documents, Categories) |
| `src/pages/payroll/documentManagement/tabs/DocDashboardTab.js` | 6 summary stat cards (total/pending/verified/rejected/expired/expiring), per-employee document cards with verification progress bar and status chips |
| `src/pages/payroll/documentManagement/tabs/EmployeeDocsTab.js` | Employee search (Autocomplete), documents grouped by category, add document dialog (type, category, file, expiry), view detail dialog, delete |
| `src/pages/payroll/documentManagement/tabs/PendingVerificationsTab.js` | Pending documents with employee info, file preview link, verify/reject buttons with rejection reason dialog |
| `src/pages/payroll/documentManagement/tabs/ExpiringDocsTab.js` | Urgency-colored cards (Critical <7d, Warning <15d, Upcoming <30d), days-until-expiry chips |
| `src/pages/payroll/documentManagement/tabs/CategoriesConfigTab.js` | Category CRUD with mandatory toggle, sort order, add/edit dialog |

---

## Summary of Changes

| Area | Files Created | Files Modified |
|------|--------------|----------------|
| Database | 2 migration files | — |
| Backend | 8 files (2 modules) | 1 (`routes.js`) |
| Frontend | 20 files | 5 (`routesprefix.js`, `actionTypes/index.js`, `reducers/index.js`, `allRoutes.js`, `routesConfig.js`) |
| **Total** | **30 new files** | **6 modified files** |

## Non-Breaking Confirmation

- All changes are **additive** — no existing tables, columns, or files modified destructively
- New columns on `emp_verification` are nullable — existing queries unaffected
- New tables use same patterns (InnoDB, utf8mb4, soft delete, audit columns)
- Backend uses pool connection pattern consistent with existing modules
- Frontend uses existing Redux/Thunk pattern, MUI v7 Grid, DatePicker, Autocomplete
- ESS salary view is read-only — no write access to salary structure tables
- Team view uses existing `reporting_manager` field — no schema changes needed
- Two new menu items appear in payroll sidebar navigation
