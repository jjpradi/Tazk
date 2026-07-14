import {
    GET_ALL_LEAVE_REQUEST,
    CREATE_LEAVE_REQUEST,
    CANCEL_LEAVE_REQUEST,
    APPROVE_LEAVE_REQUEST,
    GET_CONFLICT_LEAVE_REQUEST,
    UPDATE_CONFLICT_LEAVE_REQUEST,
    UPDATE_SEEN,
    GET_EMPLOYEE_LEAVE_HISTORY,
    GET_EMPLOYEE_ID,
    GET_EMPLOYEE_LEAVE_REQUEST,
    GET_PRE_LEAVE_REQUEST,
    LEAVE_TYPE,
    GET_DATE_OF_JOINING,
    GET_PAID_LEAVE_COUNT,
    GET_LEAVE_APPROVAL_CARD,
    GET_PERMISSION_DATA,
    POS_REQUEST_DATA,
    GET_EMPLOYEE_SHIFT_DETAILS,
    GET_EMPLOYEE_ATTENDANCE_DETAILS,
    GET_UNSEEN_COUNT,
    RESTRICTED_HOLIDAYS_DATA,
    NEW_LEAVE_TYPE
  } from '../actionTypes';
  
  const initialState = {
    leave_request: [],
    conflictLeaveRequest: [],
    employeeLeaveHistory: [],
    employeeId: [],
    employeeLeaveRequest: [],
    employeeLeaveRequestCount: 0,
    leaveType: [],
    newLeaveTypeList: [],
    dateOfJoining:[],
    paidleavecount : [],
    getLeaveApproval : [],
    permissiondata:[],
    pos_request : [],
    getUnseenCount:[],
    getEmployeesShift:[],
    getAttendaceDetails:[],
    getRestrictedHolidaysData:[]
  };
  
  function leaveRequestReducer(state = initialState, action) {
    const {type, payload} = action;
    // console.log("getUnseenCount",payload)
  
    switch (type) {
      
      case GET_ALL_LEAVE_REQUEST:
        return {...state, leave_request: payload};

      case POS_REQUEST_DATA:
          return {...state, pos_request: payload};

      case GET_LEAVE_APPROVAL_CARD:
          return {...state, getLeaveApproval: payload};

      case GET_EMPLOYEE_LEAVE_HISTORY:
        return {...state, employeeLeaveHistory: payload};

      case UPDATE_SEEN:
          return {...state, update_seen: payload};

      case GET_UNSEEN_COUNT:
          return {...state, getUnseenCount: payload};

      case GET_EMPLOYEE_SHIFT_DETAILS:
          return {...state, getEmployeesShift: payload};


          case GET_EMPLOYEE_ATTENDANCE_DETAILS:
          return {...state, getAttendaceDetails: payload};
      case CREATE_LEAVE_REQUEST:
        return {...state, create_data: payload};

      case APPROVE_LEAVE_REQUEST:
        return {...state, leave_request: payload}; 

      case GET_CONFLICT_LEAVE_REQUEST:
        return {...state, conflictLeaveRequest: payload}; 

      // case UPDATE_CONFLICT_LEAVE_REQUEST:
      //   return {...state, conflictLeaveRequest: payload}; 
        
      case CANCEL_LEAVE_REQUEST:
        return {...state, leave_request: payload};

      case GET_EMPLOYEE_ID:
        return {...state, employeeId : payload}

      case GET_EMPLOYEE_LEAVE_REQUEST:
        return {...state, employeeLeaveRequest : payload.data || [], employeeLeaveRequestCount: payload.count}
      
      case GET_PRE_LEAVE_REQUEST:
        return { ...state, pre_data: payload}

      case LEAVE_TYPE:
        return { ...state, leaveType: payload}

      case NEW_LEAVE_TYPE:
        return { ...state, newLeaveTypeList: payload}

      case GET_DATE_OF_JOINING:
        return{...state , dateOfJoining :payload }

      case GET_PAID_LEAVE_COUNT:
          return{...state , paidleavecount :payload }
          
        case GET_PERMISSION_DATA:
            return{...state , permissiondata :payload }

        case RESTRICTED_HOLIDAYS_DATA:
            return{...state , getRestrictedHolidaysData :payload }
      default:
        return state;
    }
  }
  
  export default leaveRequestReducer;
  