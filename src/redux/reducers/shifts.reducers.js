import {GET_COMPANY_NAME, CREATE_SHIFT,GET_SHIFT_LIST,GET_SHIFT_HISTORY,GET_LEAVE_HISTORY, GET_REQUEST_HISTORY, SET_SEARCH_HISTORYREPORT, SET_SEARCH_LEAVEREPORT,SET_SEARCH_SHIFTLIST,SET_SEARCH_REQUEST_REPORT, USER_WISE_SELECT, CREATE_SCHEDULE_SHIFT, GET_SCHEDULE_DETAILS, UPDATE_SCHEDULE_SHIFT, GET_SHIFT_DETAILS_BY_EMPLOYEE_ID, SET_MONTH_SHIFT_SCHEDULE,CREATE_POLICY, GET_POLICY, FILTER_LEAVE_HISTORY,LIST_DEPARTMENT, SHIFT_SCHEDULE_FILTER, SHIFT_LIST, LIST_DESIGNATION, SET_DAY_SHIFT, DELETE_DEPARTMENT_ID,ATTENDANCE_POLICY, LEAVE_POLICY, EMPLOYEE_CATEGORY,ADD_DEPARTMENT,ADD_CATEGORY, SET_SEARCH_DEPARTMENT_LIST, SET_SEARCH_CATEGORY_LIST, ASSIGNED_DEPARTMENTS, LOV_UPDATE, GET_CURRENT_SHIFT, GET_LOG_DETAILS} from 'redux/actionTypes';

const initialState = {
  companyName: [],
  shifts: [],
  shiftList:[],
  shiftHistory:[],
  leaveHistory:[],
  requestHistory:[],
  search_shiftlist:[] , 
  search_shiftlist_count:0,
  searchHistoryReportData:[],
  searchHistoryReportCount: 0,
  searchLeaveReportData:[],
  searchLeaveReportCount: 0,
  search_request_report:[],
  userwiseselect:[],
  create_schedule:[],
  getschedule:[],
  shiftDetailsByEmployeeId:[],
  monthShiftSchedule:[],
  policy_data : [],
  policy_list:[],
  filterLeaveHistory:[],
  list_department:[],
  shiftScheduleFilter:[],
  getShiftList:[],
  list_designation:[],
  dayShift:[],
  dayShiftCount: 0,
  attendancePolicyList:[],
  leavePolicyList: [],
  employeeCategoryList:[],
  addDepartment:[],
  deleteDepartmentId:[],
  addCategory:[],
  assigned_departments:[],
  lovData:[],
  currentShift: [],
  currentLogDetail: []
};

function ShiftsReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_COMPANY_NAME:
      return {...state, companyName: payload};
    case CREATE_SHIFT:
      return {...state, shifts: payload};
    case GET_SHIFT_LIST:
      return {...state, shiftList: payload};
    case GET_SHIFT_HISTORY:
      return {...state, shiftHistory: payload};
    case GET_CURRENT_SHIFT:
      return {...state, currentShift: payload};
    case GET_LOG_DETAILS:
      return {...state, currentLogDetail: payload};
    case GET_LEAVE_HISTORY:
        return {...state, leaveHistory: payload};
    case GET_REQUEST_HISTORY:
      return {...state, requestHistory: payload};
   
     case SET_SEARCH_SHIFTLIST:
        return {
          ...state,
          search_shiftlist:payload.data, 
          search_shiftlist_count:payload.numRows
        }
    case SET_SEARCH_HISTORYREPORT:
      return {
        ...state,
        searchHistoryReportData:payload.data, 
        searchHistoryReportCount:payload.numRows
      }
    case SET_SEARCH_LEAVEREPORT:
      return {
        ...state,
        searchLeaveReportData:payload.data, 
        searchLeaveReportCount:payload.numRows
      }
      case SET_SEARCH_REQUEST_REPORT:
        return { ...state, search_request_reportData: payload.data, search_request_reportCount: payload.numRows };
      
    case USER_WISE_SELECT:
      return { ...state, userwiseselect: payload };
    case CREATE_SCHEDULE_SHIFT:
      return { ...state, create_schedule: payload };

    case UPDATE_SCHEDULE_SHIFT:
      return { ...state, create_schedule: payload };

    case GET_SCHEDULE_DETAILS:
      return { ...state, getschedule: payload };

    case GET_SHIFT_DETAILS_BY_EMPLOYEE_ID:
      return { ...state, shiftDetailsByEmployeeId: payload }

    case SET_MONTH_SHIFT_SCHEDULE:
      return { ...state, monthShiftSchedule: payload }

    case SET_DAY_SHIFT:
      console.log({payload})
      return { ...state, dayShift: payload.data, dayShiftCount : payload.numRows }

    case CREATE_POLICY: 
      return { ...state, policy_data: payload } 

    case GET_POLICY:
      return { ...state, policy_list: payload }

      case ASSIGNED_DEPARTMENTS:
        return { ...state, assigned_departments: payload }

      case LIST_DEPARTMENT:
        return { ...state, list_department: payload }
      case SET_SEARCH_DEPARTMENT_LIST:
        return { ...state, list_department: payload }

    case FILTER_LEAVE_HISTORY:
      return {...state, leaveHistory: payload ,leaveHistoryCount: payload.numRows};

    
    case SHIFT_SCHEDULE_FILTER:
      return {...state, getschedule: {...state.getschedule,schedulelist: payload}};

    case SHIFT_LIST:
      return { ...state, getShiftList: payload }

    case LIST_DESIGNATION:
      return { ...state, list_designation: payload }

      case ATTENDANCE_POLICY:
      return { ...state, attendancePolicyList: payload }

      case LEAVE_POLICY:
      return { ...state, leavePolicyList: payload }

      case EMPLOYEE_CATEGORY:
        case SET_SEARCH_CATEGORY_LIST:
        return { ...state, employeeCategoryList: payload }

        case ADD_DEPARTMENT:
        return { ...state, addDepartment: payload }

        case DELETE_DEPARTMENT_ID:
        return { ...state, deleteDepartmentId: payload }

        case ADD_CATEGORY:
        return { ...state, addCategory: payload }

        case LOV_UPDATE:
        return { ...state, lovData: payload }

    default:
      return state;
  }
}
export default ShiftsReducer;
