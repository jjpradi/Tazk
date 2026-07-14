import {
  EM_POLICIES, EM_CLAIMS, EM_VIOLATION_CLAIMS,
  EM_SUMMARY_STATS, EM_BY_CATEGORY, EM_BY_DEPARTMENT, EM_BY_EMPLOYEE,
} from '../actionTypes';

const initialState = {
  policies: [],
  claims: [],
  violationClaims: [],
  summaryStats: {},
  byCategory: [],
  byDepartment: [],
  byEmployee: [],
};

const ExpenseManagementReducer = (state = initialState, action) => {
  switch (action.type) {
    case EM_POLICIES: return { ...state, policies: action.payload };
    case EM_CLAIMS: return { ...state, claims: action.payload };
    case EM_VIOLATION_CLAIMS: return { ...state, violationClaims: action.payload };
    case EM_SUMMARY_STATS: return { ...state, summaryStats: action.payload };
    case EM_BY_CATEGORY: return { ...state, byCategory: action.payload };
    case EM_BY_DEPARTMENT: return { ...state, byDepartment: action.payload };
    case EM_BY_EMPLOYEE: return { ...state, byEmployee: action.payload };
    default: return state;
  }
};

export default ExpenseManagementReducer;
