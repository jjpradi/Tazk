import {
  TR_SKILLS, TR_PROGRAMS, TR_PROGRAM_DETAIL, TR_SESSIONS, TR_SESSIONS_BY_PROGRAM,
  TR_ENROLLMENTS, TR_ENROLLMENTS_BY_EMP, TR_FEEDBACK, TR_EMPLOYEE_SKILLS,
  TR_SKILLS_BY_EMP, TR_DASHBOARD, TR_CATEGORY_BREAKDOWN, TR_SKILL_GAP,
} from '../actionTypes';

const initialState = {
  skills: [],
  programs: [],
  programDetail: null,
  sessions: [],
  sessionsByProgram: [],
  enrollments: [],
  enrollmentsByEmployee: [],
  feedback: [],
  employeeSkills: [],
  skillsByEmployee: [],
  dashboard: {},
  categoryBreakdown: [],
  skillGap: [],
};

const TrainingReducer = (state = initialState, action) => {
  switch (action.type) {
    case TR_SKILLS: return { ...state, skills: action.payload };
    case TR_PROGRAMS: return { ...state, programs: action.payload };
    case TR_PROGRAM_DETAIL: return { ...state, programDetail: action.payload };
    case TR_SESSIONS: return { ...state, sessions: action.payload };
    case TR_SESSIONS_BY_PROGRAM: return { ...state, sessionsByProgram: action.payload };
    case TR_ENROLLMENTS: return { ...state, enrollments: action.payload };
    case TR_ENROLLMENTS_BY_EMP: return { ...state, enrollmentsByEmployee: action.payload };
    case TR_FEEDBACK: return { ...state, feedback: action.payload };
    case TR_EMPLOYEE_SKILLS: return { ...state, employeeSkills: action.payload };
    case TR_SKILLS_BY_EMP: return { ...state, skillsByEmployee: action.payload };
    case TR_DASHBOARD: return { ...state, dashboard: action.payload };
    case TR_CATEGORY_BREAKDOWN: return { ...state, categoryBreakdown: action.payload };
    case TR_SKILL_GAP: return { ...state, skillGap: action.payload };
    default: return state;
  }
};

export default TrainingReducer;
