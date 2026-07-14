import {
  HA_HEADCOUNT_SUMMARY, HA_HEADCOUNT_DEPT, HA_HEADCOUNT_GRADE, HA_HEADCOUNT_TREND,
  HA_ATTRITION_SUMMARY, HA_ATTRITION_TREND, HA_ATTRITION_DEPT, HA_ATTRITION_TENURE,
  HA_GENDER, HA_AGE, HA_TENURE, HA_EMP_TYPE,
  HA_SALARY_DEPT, HA_SALARY_TREND, HA_SALARY_GRADE,
  HA_PROBATION, HA_DOC_EXPIRY, HA_POLICY_ACK,
  HA_NEW_JOINERS, HA_BIRTHDAYS, HA_ANNIVERSARIES, HA_DASHBOARD,
} from '../actionTypes';

const initialState = {
  headcountSummary: {},
  headcountByDept: [],
  headcountByGrade: [],
  headcountTrend: [],
  attritionSummary: {},
  attritionTrend: [],
  attritionByDept: [],
  attritionByTenure: [],
  genderDiversity: [],
  ageDistribution: [],
  tenureDistribution: [],
  employmentType: [],
  salaryCostByDept: [],
  salaryCostTrend: [],
  salaryCostByGrade: [],
  probationDue: [],
  documentExpiry: [],
  policyAck: [],
  newJoiners: [],
  birthdays: [],
  anniversaries: [],
  dashboard: {},
};

const HrAnalyticsReducer = (state = initialState, action) => {
  switch (action.type) {
    case HA_HEADCOUNT_SUMMARY: return { ...state, headcountSummary: action.payload };
    case HA_HEADCOUNT_DEPT: return { ...state, headcountByDept: action.payload };
    case HA_HEADCOUNT_GRADE: return { ...state, headcountByGrade: action.payload };
    case HA_HEADCOUNT_TREND: return { ...state, headcountTrend: action.payload };
    case HA_ATTRITION_SUMMARY: return { ...state, attritionSummary: action.payload };
    case HA_ATTRITION_TREND: return { ...state, attritionTrend: action.payload };
    case HA_ATTRITION_DEPT: return { ...state, attritionByDept: action.payload };
    case HA_ATTRITION_TENURE: return { ...state, attritionByTenure: action.payload };
    case HA_GENDER: return { ...state, genderDiversity: action.payload };
    case HA_AGE: return { ...state, ageDistribution: action.payload };
    case HA_TENURE: return { ...state, tenureDistribution: action.payload };
    case HA_EMP_TYPE: return { ...state, employmentType: action.payload };
    case HA_SALARY_DEPT: return { ...state, salaryCostByDept: action.payload };
    case HA_SALARY_TREND: return { ...state, salaryCostTrend: action.payload };
    case HA_SALARY_GRADE: return { ...state, salaryCostByGrade: action.payload };
    case HA_PROBATION: return { ...state, probationDue: action.payload };
    case HA_DOC_EXPIRY: return { ...state, documentExpiry: action.payload };
    case HA_POLICY_ACK: return { ...state, policyAck: action.payload };
    case HA_NEW_JOINERS: return { ...state, newJoiners: action.payload };
    case HA_BIRTHDAYS: return { ...state, birthdays: action.payload };
    case HA_ANNIVERSARIES: return { ...state, anniversaries: action.payload };
    case HA_DASHBOARD: return { ...state, dashboard: action.payload };
    default: return state;
  }
};

export default HrAnalyticsReducer;
