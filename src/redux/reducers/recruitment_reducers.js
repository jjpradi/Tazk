import {
  RC_STAGES, RC_JOB_POSITIONS, RC_JOB_DETAIL, RC_CANDIDATES, RC_CANDIDATE_DETAIL,
  RC_APPLICATIONS, RC_APPLICATIONS_BY_JOB, RC_INTERVIEWS, RC_UPCOMING_INTERVIEWS,
  RC_DASHBOARD, RC_PIPELINE, RC_SOURCES,
} from '../actionTypes';

const initialState = {
  stages: [],
  jobPositions: [],
  jobDetail: null,
  candidates: [],
  candidateDetail: null,
  applications: [],
  applicationsByJob: [],
  interviews: [],
  upcomingInterviews: [],
  dashboard: {},
  pipeline: [],
  sources: [],
};

const RecruitmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case RC_STAGES: return { ...state, stages: action.payload };
    case RC_JOB_POSITIONS: return { ...state, jobPositions: action.payload };
    case RC_JOB_DETAIL: return { ...state, jobDetail: action.payload };
    case RC_CANDIDATES: return { ...state, candidates: action.payload };
    case RC_CANDIDATE_DETAIL: return { ...state, candidateDetail: action.payload };
    case RC_APPLICATIONS: return { ...state, applications: action.payload };
    case RC_APPLICATIONS_BY_JOB: return { ...state, applicationsByJob: action.payload };
    case RC_INTERVIEWS: return { ...state, interviews: action.payload };
    case RC_UPCOMING_INTERVIEWS: return { ...state, upcomingInterviews: action.payload };
    case RC_DASHBOARD: return { ...state, dashboard: action.payload };
    case RC_PIPELINE: return { ...state, pipeline: action.payload };
    case RC_SOURCES: return { ...state, sources: action.payload };
    default: return state;
  }
};

export default RecruitmentReducer;
