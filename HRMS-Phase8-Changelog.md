# HRMS Phase 8 — HR Analytics & Reports (Planned Phase 7)

**Date**: 2026-03-15
**Status**: Complete

> Pure analytics module — no new database tables. Queries existing data from Phases 1–7.

---

## Backend (tzk-payroll)

### API Files Created
| File | Purpose |
|------|---------|
| `src/api/hr_analytics/hr_analytics.sql.js` | 22 read-only SQL queries across 7 domains |
| `src/api/hr_analytics/hr_analytics.model.js` | 20 static model methods with param defaults |
| `src/api/hr_analytics/hr_analytics.controller.js` | All controllers use `wrap()` (read-only) |
| `src/api/hr_analytics/hr_analytics.routes.js` | 22 GET endpoints |

### Route Registration
- Mounted at `/payrollservice/api/hrAnalytics` in `src/routes.js`
- Frontend prefix added in `src/utils/routesprefix.js`

### Analytics Domains (22 Endpoints)
1. **Headcount** — summary, by department, by grade, 12-month trend
2. **Attrition** — summary (date-filtered), trend, by department, by tenure band
3. **Demographics** — gender diversity, age distribution, tenure distribution, employment type
4. **Salary Cost** — by department (month/year), trend, by grade (month/year)
5. **Compliance** — probation due, document expiry (90-day window), policy acknowledgment status
6. **Events** — new joiners (date-filtered), upcoming birthdays, work anniversaries
7. **Dashboard KPIs** — 7 combined metrics in a single endpoint

---

## Frontend (tzk-tazk-ui)

### Redux
| File | Details |
|------|---------|
| `src/services/hrAnalytics.services.js` | 23 API methods |
| `src/redux/actionTypes/index.js` | 22 `HA_*` action type constants |
| `src/redux/actions/hrAnalytics.actions.js` | `fetchAction` HOF + explicit parameterized actions |
| `src/redux/reducers/hrAnalytics_reducers.js` | 22 state slices |
| `src/redux/reducers/index.js` | `HrAnalyticsReducer` registered |

### UI Pages (6 Tabs)
| Tab | File | Features |
|-----|------|----------|
| Dashboard | `tabs/HrDashboardTab.js` | KPI cards, joining vs attrition trend, workforce composition, gender diversity, birthdays/anniversaries |
| Headcount & FTE | `tabs/HeadcountTab.js` | KPI cards, employment type breakdown, joining trend, dept/grade tables, new joiners list |
| Attrition & Turnover | `tabs/AttritionTab.js` | Date range filter with dispatch, KPI cards with attrition rate, trend, dept/tenure breakdown |
| Demographics | `tabs/DemographicsTab.js` | Gender, age, tenure, employment type horizontal bar visualizations |
| Salary Cost | `tabs/SalaryCostTab.js` | Month/year selector with dispatch, INR formatted tables, cost trend |
| Compliance Tracker | `tabs/ComplianceTrackerTab.js` | Probation tracker, document expiry alerts, policy acknowledgment, birthdays/anniversaries |

### Routing & Navigation
- Lazy import + route at `/payroll/hrAnalytics` in `allRoutes.js`
- Menu item `head_211` with LeaderboardIcon in `routesConfig.js`

---

## Tables Queried (No New Tables)
- `pos_employees`, `pos_people`, `emp_lifecycle_event`, `emp_grade`, `departments`
- `ss_processed_salary`, `emp_verification`, `hr_policy`, `hr_policy_acknowledgment`
- `training_enrollment`, `training_program` (from Phase 7 bonus module)
