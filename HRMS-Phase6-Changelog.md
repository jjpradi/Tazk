# HRMS Phase 6 — Recruitment / Applicant Tracking System

**Date**: 2026-03-15
**Phase**: 6 of 12

---

## Overview

Full-stack Recruitment / ATS module enabling companies to manage job requisitions, candidate database, applications pipeline, interview scheduling, and recruitment analytics.

---

## Database Migration

**File**: `tzk-payroll/src/services/migrations/2026_03_15_009_recruitment.sql`

| Table | Purpose |
|---|---|
| `recruit_stage` | Configurable pipeline stages (Screening, Technical, HR, etc.) |
| `recruit_job_position` | Job requisitions with department, grade, salary range, status |
| `recruit_candidate` | Candidate database with CTC, experience, source tracking |
| `recruit_application` | Applications linking candidates to jobs, status pipeline |
| `recruit_interview` | Interview rounds with mode, feedback, rating, result |

---

## Backend API

**Service**: `tzk-payroll` — mounted at `/payrollservice/api/recruitment`

### Files Created
- `src/api/recruitment/recruitment.sql.js` — 30 SQL queries
- `src/api/recruitment/recruitment.model.js` — 20 static model methods
- `src/api/recruitment/recruitment.controller.js` — 28 controllers (wrap/wrapMut pattern)
- `src/api/recruitment/recruitment.routes.js` — All route definitions

### Files Modified
- `src/routes.js` — Registered recruitment routes with JWT middleware

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stages` | List pipeline stages |
| POST | `/stage` | Create stage |
| PUT | `/stage` | Update stage |
| DELETE | `/stage/:id` | Delete stage |
| GET | `/jobs` | List job positions (with counts) |
| GET | `/job/:id` | Job position detail |
| POST | `/job` | Create job position |
| PUT | `/job` | Update job position |
| POST | `/job/status` | Update job status |
| DELETE | `/job/:id` | Delete job position |
| GET | `/candidates` | List candidates |
| GET | `/candidate/:id` | Candidate detail |
| POST | `/candidate` | Create candidate |
| PUT | `/candidate` | Update candidate |
| DELETE | `/candidate/:id` | Delete candidate |
| GET | `/applications` | List all applications |
| GET | `/applications/job/:job_id` | Applications by job |
| POST | `/application` | Create application |
| POST | `/application/status` | Update application status |
| DELETE | `/application/:id` | Delete application |
| GET | `/interviews/application/:id` | Interviews by application |
| GET | `/interviews/upcoming` | Upcoming interviews |
| POST | `/interview` | Schedule interview |
| PUT | `/interview` | Update interview |
| POST | `/interview/feedback` | Submit feedback |
| DELETE | `/interview/:id` | Delete interview |
| GET | `/dashboard` | Dashboard KPI stats |
| GET | `/dashboard/pipeline` | Pipeline summary |
| GET | `/dashboard/sources` | Source effectiveness |

---

## Frontend — Redux Infrastructure

### Files Created
- `src/services/recruitment.services.js` — 20 API methods
- `src/redux/actions/recruitment.actions.js` — 30 action creators
- `src/redux/reducers/recruitment_reducers.js` — 12 state slices

### Files Modified
- `src/utils/routesprefix.js` — Added `recruitment` prefix
- `src/redux/actionTypes/index.js` — Added 12 RC_* action types
- `src/redux/reducers/index.js` — Registered RecruitmentReducer

---

## Frontend — UI Pages

### Main Page
- `src/pages/Payroll/recruitment/index.js` — 6-tab layout with data loading and refresh functions

### Tab Components

| Tab | File | Features |
|---|---|---|
| Job Positions | `tabs/JobPositionsTab.js` | Summary cards, CRUD table, status management, salary display (INR), posting switches |
| Candidates | `tabs/CandidatesTab.js` | Source-filtered table, CRUD dialog, CTC display, source chips, summary cards |
| Applications | `tabs/ApplicationsPipelineTab.js` | Pipeline summary bar, multi-filter table, status update dialog with conditional fields, job/status filters |
| Interviews | `tabs/InterviewsTab.js` | Schedule/edit interviews, feedback dialog with rating, mode/result chips, upcoming count |
| Pipeline Stages | `tabs/StagesConfigTab.js` | Stage CRUD, order management, default stage badges |
| Dashboard | `tabs/RecruitDashboardTab.js` | KPI cards, pipeline visualization, source effectiveness table with conversion rates |

### Routing & Navigation
- `src/pages/allRoutes.js` — Added lazy import + route at `/payroll/recruitment`
- `src/pages/routesConfig.js` — Added menu item (head_209, BadgeIcon)

---

## Architecture Notes

- Controller uses `wrap()`/`wrapMut()` helper pattern to reduce boilerplate
- All mutations use database transactions via `wrapMut`
- Soft delete pattern (`isDeleted = 0/1`) consistent with all modules
- Application status enum: applied → screening → shortlisted → interview → offered → accepted/rejected/withdrawn
- Interview modes: in_person, phone, video
- Candidate sources: portal, referral, agency, walk_in, linkedin, naukri, other
