import {
  ESS_MY_CHANGE_REQUESTS,
  ESS_PENDING_CHANGE_REQUESTS,
  ESS_MY_SALARY_STRUCTURE,
  ESS_MY_SALARY_DEDUCTIONS,
  ESS_TEAM_MEMBERS,
  ESS_TEAM_ATTENDANCE,
  ESS_TEAM_PENDING_REQUESTS,
  ESS_MY_REQUESTS,
} from '../actionTypes';

const initialState = {
  myChangeRequests: [],
  pendingChangeRequests: [],
  mySalaryStructure: [],
  mySalaryDeductions: [],
  teamMembers: [],
  teamAttendance: [],
  teamPendingRequests: [],
  myRequests: [],
};

const EssPortalReducer = (state = initialState, action) => {
  switch (action.type) {
    case ESS_MY_CHANGE_REQUESTS:
      return { ...state, myChangeRequests: action.payload };
    case ESS_PENDING_CHANGE_REQUESTS:
      return { ...state, pendingChangeRequests: action.payload };
    case ESS_MY_SALARY_STRUCTURE:
      return { ...state, mySalaryStructure: action.payload };
    case ESS_MY_SALARY_DEDUCTIONS:
      return { ...state, mySalaryDeductions: action.payload };
    case ESS_TEAM_MEMBERS:
      return { ...state, teamMembers: action.payload };
    case ESS_TEAM_ATTENDANCE:
      return { ...state, teamAttendance: action.payload };
    case ESS_TEAM_PENDING_REQUESTS:
      return { ...state, teamPendingRequests: action.payload };
    case ESS_MY_REQUESTS:
      return { ...state, myRequests: action.payload };
    default:
      return state;
  }
};

export default EssPortalReducer;
