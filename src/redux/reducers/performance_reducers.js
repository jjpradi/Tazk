import {
  PF_CYCLES, PF_TEMPLATES, PF_TEMPLATE_ITEMS, PF_APPRAISALS,
  PF_MY_APPRAISALS, PF_TEAM_APPRAISALS, PF_APPRAISAL_DETAIL,
  PF_KRA_SCORES, PF_GOALS, PF_DASHBOARD, PF_RATING_DISTRIBUTION,
} from '../actionTypes';

const initialState = {
  cycles: [],
  templates: [],
  templateItems: [],
  appraisals: [],
  myAppraisals: [],
  teamAppraisals: [],
  appraisalDetail: null,
  kraScores: [],
  goals: [],
  dashboard: [],
  ratingDistribution: [],
};

const PerformanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case PF_CYCLES: return { ...state, cycles: action.payload };
    case PF_TEMPLATES: return { ...state, templates: action.payload };
    case PF_TEMPLATE_ITEMS: return { ...state, templateItems: action.payload };
    case PF_APPRAISALS: return { ...state, appraisals: action.payload };
    case PF_MY_APPRAISALS: return { ...state, myAppraisals: action.payload };
    case PF_TEAM_APPRAISALS: return { ...state, teamAppraisals: action.payload };
    case PF_APPRAISAL_DETAIL: return { ...state, appraisalDetail: action.payload };
    case PF_KRA_SCORES: return { ...state, kraScores: action.payload };
    case PF_GOALS: return { ...state, goals: action.payload };
    case PF_DASHBOARD: return { ...state, dashboard: action.payload };
    case PF_RATING_DISTRIBUTION: return { ...state, ratingDistribution: action.payload };
    default: return state;
  }
};

export default PerformanceReducer;
