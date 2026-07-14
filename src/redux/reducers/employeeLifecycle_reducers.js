import {
  LC_DASHBOARD_STATS,
  LC_LIFECYCLE_EVENTS,
  LC_PROBATION_EMPLOYEES,
  LC_CHECKLIST_TEMPLATES,
  LC_EMPLOYEE_CHECKLIST,
  LC_ONBOARDING_DASHBOARD,
  LC_PENDING_FNF,
  LC_FNF_DETAIL,
  LC_EVENTS_BY_TYPE,
} from '../actionTypes';

const initialState = {
  dashboardStats: {},
  lifecycleEvents: [],
  eventsByType: [],
  probationEmployees: [],
  checklistTemplates: [],
  employeeChecklist: [],
  onboardingDashboard: [],
  pendingFnf: [],
  fnfDetail: null,
};

const EmployeeLifecycleReducer = (state = initialState, action) => {
  switch (action.type) {
    case LC_DASHBOARD_STATS:
      return { ...state, dashboardStats: action.payload };
    case LC_LIFECYCLE_EVENTS:
      return { ...state, lifecycleEvents: action.payload };
    case LC_EVENTS_BY_TYPE:
      return { ...state, eventsByType: action.payload };
    case LC_PROBATION_EMPLOYEES:
      return { ...state, probationEmployees: action.payload };
    case LC_CHECKLIST_TEMPLATES:
      return { ...state, checklistTemplates: action.payload };
    case LC_EMPLOYEE_CHECKLIST:
      return { ...state, employeeChecklist: action.payload };
    case LC_ONBOARDING_DASHBOARD:
      return { ...state, onboardingDashboard: action.payload };
    case LC_PENDING_FNF:
      return { ...state, pendingFnf: action.payload };
    case LC_FNF_DETAIL:
      return { ...state, fnfDetail: action.payload };
    default:
      return state;
  }
};

export default EmployeeLifecycleReducer;
