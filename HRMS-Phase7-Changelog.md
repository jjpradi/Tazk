# HRMS Phase 7 — Training & Learning Management System

**Date**: 2026-03-15
**Phase**: 7 of 12

---

## Overview

Full-stack Training & LMS module enabling companies to manage training programs, schedule sessions, track employee enrollments and completions, collect post-training feedback, and maintain a skills/competency catalog with employee skill mapping and gap analysis.

---

## Database Migration

**File**: `tzk-payroll/src/services/migrations/2026_03_15_010_training_lms.sql`

| Table | Purpose |
|---|---|
| `training_skill` | Skills/competency catalog (name, category, description) |
| `training_program` | Training programs/courses with category, type, cost, duration |
| `training_session` | Scheduled sessions with venue, mode, capacity, status |
| `training_enrollment` | Employee enrollments with attendance, completion, score tracking |
| `training_feedback` | Post-training feedback with multi-dimension ratings |
| `training_employee_skill` | Employee-skill mapping with proficiency levels |

---

## Backend API

**Service**: `tzk-payroll` — mounted at `/payrollservice/api/training`

### Files Created
- `src/api/training/training.sql.js` — 30+ SQL queries
- `src/api/training/training.model.js` — 25 static model methods
- `src/api/training/training.controller.js` — 30 controllers (wrap/wrapMut pattern)
- `src/api/training/training.routes.js` — All route definitions

### Files Modified
- `src/routes.js` — Registered training routes with JWT middleware

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/skills` | List skills catalog |
| POST | `/skill` | Create skill |
| PUT | `/skill` | Update skill |
| DELETE | `/skill/:id` | Delete skill |
| GET | `/programs` | List programs (with session/enrollment counts) |
| GET | `/program/:id` | Program detail |
| POST | `/program` | Create program |
| PUT | `/program` | Update program |
| DELETE | `/program/:id` | Delete program |
| GET | `/sessions` | List all sessions |
| GET | `/sessions/program/:program_id` | Sessions by program |
| POST | `/session` | Create session |
| PUT | `/session` | Update session |
| POST | `/session/status` | Update session status |
| DELETE | `/session/:id` | Delete session |
| GET | `/enrollments/session/:session_id` | Enrollments by session |
| GET | `/enrollments/employee/:employee_id` | Enrollments by employee |
| POST | `/enrollment` | Enroll employee |
| POST | `/enrollment/bulk` | Bulk enroll employees |
| PUT | `/enrollment` | Update enrollment |
| DELETE | `/enrollment/:id` | Delete enrollment |
| GET | `/feedback/session/:session_id` | Feedback by session |
| POST | `/feedback` | Submit feedback |
| DELETE | `/feedback/:id` | Delete feedback |
| GET | `/employeeSkills` | All employee-skill mappings |
| GET | `/employeeSkills/employee/:employee_id` | Skills by employee |
| POST | `/employeeSkill` | Upsert employee skill |
| DELETE | `/employeeSkill/:id` | Delete employee skill |
| GET | `/dashboard` | Dashboard KPI stats |
| GET | `/dashboard/categories` | Category breakdown |
| GET | `/dashboard/skillGap` | Skill gap analysis |

---

## Frontend — Redux Infrastructure

### Files Created
- `src/services/training.services.js` — 22 API methods
- `src/redux/actions/training.actions.js` — 34 action creators
- `src/redux/reducers/training_reducers.js` — 13 state slices

### Files Modified
- `src/utils/routesprefix.js` — Added `training` prefix
- `src/redux/actionTypes/index.js` — Added 13 TR_* action types
- `src/redux/reducers/index.js` — Registered TrainingReducer

---

## Frontend — UI Pages

### Main Page
- `src/pages/Payroll/training/index.js` — 6-tab layout with data loading and refresh functions

### Tab Components

| Tab | File | Features |
|---|---|---|
| Programs | `tabs/ProgramsTab.js` | CRUD with category/type/status filters, cost display (INR), mandatory flag, session & enrollment counts |
| Sessions | `tabs/SessionsTab.js` | Session scheduling with program select, mode/venue, capacity tracking, status management |
| Enrollments | `tabs/EnrollmentsTab.js` | Session-based enrollment view, attendance/completion tracking, score & certificate, update dialog |
| Feedback | `tabs/FeedbackTab.js` | Multi-dimension ratings (overall, content, trainer, relevance), averages summary, recommendation rate |
| Skills & Competencies | `tabs/SkillsCompetenciesTab.js` | Two-section: Skills catalog CRUD + Employee skill mapping with proficiency levels |
| Dashboard | `tabs/TrainingDashboardTab.js` | KPI cards, category breakdown with completion rates, skill gap analysis with stacked bars |

### Routing & Navigation
- `src/pages/allRoutes.js` — Added lazy import + route at `/payroll/training`
- `src/pages/routesConfig.js` — Added menu item (head_210, SchemaIcon)

---

## Architecture Notes

- Program categories: technical, soft_skills, compliance, leadership, onboarding, safety, domain, other
- Training types: internal, external, online, on_the_job
- Session modes: classroom, virtual, hybrid
- Enrollment tracks attendance (enrolled/attended/absent/partially_attended) and completion (pending/in_progress/completed/failed/exempted)
- Feedback has 4-dimension rating: overall, content, trainer, relevance (1.0-5.0)
- Employee skills use upsert pattern (INSERT ... ON DUPLICATE KEY UPDATE)
- Proficiency levels: beginner, intermediate, advanced, expert
- Skill gap analysis aggregates proficiency distribution per skill
- Training cost calculated as sum(cost_per_head * enrolled_count) across programs
