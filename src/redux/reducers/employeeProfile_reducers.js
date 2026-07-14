import {
  EP_SEARCH_EMPLOYEES,
  EP_GET_PROFILE,
  EP_GET_GRADES,
  EP_GET_QUALIFICATIONS,
  EP_GET_EMERGENCY_CONTACTS,
  EP_GET_WORK_HISTORY,
} from 'redux/actionTypes';

const initialState = {
  employeeList: [],
  currentProfile: null,
  grades: [],
  qualifications: [],
  emergencyContacts: [],
  workHistory: [],
};

function EmployeeProfileReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case EP_SEARCH_EMPLOYEES:
      return { ...state, employeeList: payload };
    case EP_GET_PROFILE:
      return { ...state, currentProfile: payload };
    case EP_GET_GRADES:
      return { ...state, grades: payload };
    case EP_GET_QUALIFICATIONS:
      return { ...state, qualifications: payload };
    case EP_GET_EMERGENCY_CONTACTS:
      return { ...state, emergencyContacts: payload };
    case EP_GET_WORK_HISTORY:
      return { ...state, workHistory: payload };
    default:
      return state;
  }
}

export default EmployeeProfileReducer;
