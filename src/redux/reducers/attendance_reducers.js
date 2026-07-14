import {LIST_ATTENDANCE,ATTENDANCE_VIEW,GET_EMP_BASECOMPANY,UPDATE_ATTENDANCE,APPROVE_ATTENDANCE,OVER_TIME_REPORT,FILTER_SALARY, SET_ATTENDANCEVIEW, QR_ATTENDANCE, SET_SEARCH_ATTENDANCECOR, ATTENDANCE_VIEW_EXIST, SELFIE_IMAGES, SET_SEARCH_SELFIE_IMAGES, COMPANY_BASED_EMP, COMPANY_BASED_EMP_DETAILS, GET_WORKDURATION_REPORT, GET_WORKDURATION_TOTAL_REPORT, GET_OVERTIME_REPORT, WORK_DURATION_REPORT_DATA, GET_DEPT_BASE_EMP, GET_DEPT_BASE_EMP_FILTER, SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE, LOCATION_BASE_DEP_FILTER, SET_SEARCH_LOCATION_BASED_EMPLOYEE, GET_EMP_BASECOMPANY_FILTER, SET_SEARCH_COMPANY_BASED_EMPLOYEE, GET_ATTENDANCE_PROCESS, SET_ATTENDANCE_PROCESS, APPROVE_ATTENDANCE_EXCEL, EMPLOYEE_VERIFICATION_DETAILS, GET_CATEGORY_BASE_EMP_FILTER, SET_SEARCH_CATEGORY_BASED_EMPLOYEE, GET_CATEGORY_BASE_EMP, WORKDETAILS_LIST, LEAVE_BALANCE, LAST_SIX_MONTH_LEAVE, LATE_LOGIN_EARLY_CHECKOUT_REPORT, PF_REPORT, MANUAL_ENTRY_DATA, SET_SEARCH_LATE_EARLY_REPORT, GET_EMP_BASECOMPANY_FORM, GET_BREAKS_RECORDS, SYNC_CONTACT, CHECK_DEVICE_ATT, GET_DEVICE_ATT, GET_ATTENDANCE_LOG_REPORT, SET_SEARCH_PUNCH_EXCEPTIONS, DELETE_EMP_DOCS, ATTPROCESS_BACKGROUND_JOB, PRIVILEGELEAVEREPORT, CHECK_IN_OUT, SET_ATTENDANCE_EFFICIENCY_REPORT} from '../actionTypes';

const initialState = {
  attendance: [],
  attendance_id_data: [],
  attendance_view : [],
  get_empbasecompany : [],
  getDeptBaseEmp : [],
  attendance_process : [],
  attendance_update: [],
  approve_attendance : [],
  overtime_report: [],
  filter_salary: [],
  attendance_view_count: 0,
  qrAttendance: {},
  searchAttendanceCor: [],
  attendanceViewExist: [],
  selfie_images: [],
  workDurationReport: [],
  workDurationTotalHoursReport: [],
  companyBasedEmp: [],
  companyBasedEmpDetails: [],
  overTimeReport: [],
  workReport: [],
  workReportCount: 0,
  companyBasedEmpCount: 0,
  attendanceProcessCount: 0,
  getDepartmentBasedEmployeeFilter:[],
  searchDepartmentBasedEmployee:[],
  getLocationBasedEmployee:[],
  searchLocationBasedEmployee:[],
  searchCompanyBasedEmployeeFilter:[],
  getCompanyBasedEmployeeFilter:[],
  approve_attendanceCount: 0,
  searchAttendanceCorCount: 0,
  approve_attendance_excel :[],
  employeeVerificationDetails: [],
  getCategoryBasedEmployeeFilter:[],
  searchCategoryBasedEmployee:[],
  getCategoryBaseEmp:[],
  workDetailsList: [],
  leaveBalanceEmp: [],
  lastSixMonthLeaveCount: [],
  lateLoginEarlyCheckoutReport: [],
  punchexceptionreport : [],
  privilegeleavereport : [],
  pfReport:[],
  manualEntryget : [],
  get_empbasecompanyform:[],
  getBreaksDetailsForReport: [],
  getRegisteredUsers : [],
  attendance_log_process : [],
  attendanceLogCount: 0,
  deleteEmpDocs: [],
  attendanceProcessBackgroundJob:[],
  checkInOut: [],
  AttendanceEfficiencyReport:[]
};

function attendanceReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_ATTENDANCE:
      return {...state, attendance: payload};

    case CHECK_IN_OUT:
      return { ...state, checkInOut: payload };

      case ATTENDANCE_VIEW:
        return {...state, attendance_view: payload};

        case GET_EMP_BASECOMPANY:
        return {...state, get_empbasecompany: payload};
        
        case GET_EMP_BASECOMPANY_FORM:
          return {...state, get_empbasecompanyform: payload};

        case GET_DEPT_BASE_EMP:
          return {...state, getDeptBaseEmp: payload};
          case GET_CATEGORY_BASE_EMP:
            return {...state, getCategoryBaseEmp: payload};

        case SET_ATTENDANCE_PROCESS:
        return {...state, attendance_process: payload.data, attendanceProcessCount : payload.numRows};

        case SET_SEARCH_ATTENDANCECOR:
          return { ...state, searchAttendanceCor: payload.data, searchAttendanceCorCount: payload.numRows}

        case UPDATE_ATTENDANCE:
          return {...state, attendance_update: payload};

          case APPROVE_ATTENDANCE:
            return { ...state, searchAttendanceCor: payload.data, searchAttendanceCorCount: payload.numRows}
            // return {...state, approve_attendance: payload.data, approve_attendanceCount: payload.numRows};

            case APPROVE_ATTENDANCE_EXCEL:
              return {...state, approve_attendance_excel: payload.data, approve_attendanceCount: payload.numRows};

            case OVER_TIME_REPORT:
              return {...state, overtime_report: payload};

              
            case EMPLOYEE_VERIFICATION_DETAILS:
              return {...state, employeeVerificationDetails: payload};

              case FILTER_SALARY:
      return { ...state, filter_salary: payload };
    
      case SET_ATTENDANCEVIEW:
        return {
            ...state,
            attendance_view:payload.data, 
            attendance_view_count:payload.data, 
      }
    
      case QR_ATTENDANCE:
        return {...state, qrAttendance: payload};

      case ATTENDANCE_VIEW_EXIST:
        return { ...state, attendanceViewExist: payload }

      case SELFIE_IMAGES:
        return { ...state, selfie_images: payload }

      case SET_SEARCH_SELFIE_IMAGES:
        return { ...state, selfie_images: payload }
 
        case GET_WORKDURATION_REPORT:
      return {...state, workDurationReport: payload};

      case GET_WORKDURATION_TOTAL_REPORT:
        return {...state, workDurationTotalHoursReport: payload}; 

      case COMPANY_BASED_EMP:
        return { ...state, companyBasedEmp: payload.data, companyBasedEmpCount : payload.numRows }

      case COMPANY_BASED_EMP_DETAILS:
        return { ...state, companyBasedEmpDetails: payload }

      case GET_OVERTIME_REPORT:
      return { ...state, overTimeReport: payload }
    
      case WORK_DURATION_REPORT_DATA:
        return { ...state, workReport: payload.data, workReportCount: payload.numRows }

        case GET_DEPT_BASE_EMP_FILTER:
          return { ...state, getDepartmentBasedEmployeeFilter: payload }

          case GET_CATEGORY_BASE_EMP_FILTER:
            return { ...state, getCategoryBasedEmployeeFilter: payload }

            case SET_SEARCH_CATEGORY_BASED_EMPLOYEE:
        return { ...state, searchCategoryBasedEmployee: payload }
      case SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE:
        return { ...state, searchDepartmentBasedEmployee: payload }


        case LOCATION_BASE_DEP_FILTER:
          return { ...state, getLocationBasedEmployee: payload }
           
      case SET_SEARCH_LOCATION_BASED_EMPLOYEE:
        return { ...state, searchLocationBasedEmployee: payload }

        case GET_EMP_BASECOMPANY_FILTER:
          return { ...state, getCompanyBasedEmployeeFilter: payload }
           
      case SET_SEARCH_COMPANY_BASED_EMPLOYEE:
        return { ...state, searchCompanyBasedEmployeeFilter: payload }
  
        case WORKDETAILS_LIST:
        return { ...state, workDetailsList: payload }
      
        case LEAVE_BALANCE:
        return { ...state, leaveBalanceEmp: payload }

        case LAST_SIX_MONTH_LEAVE:
        return { ...state, lastSixMonthLeaveCount: payload }

        case SET_SEARCH_LATE_EARLY_REPORT:
          return { ...state, lateLoginEarlyCheckoutReport: payload }
          
        case SET_SEARCH_PUNCH_EXCEPTIONS:
          return { ...state, punchexceptionreport: payload }
        case PF_REPORT:
          return { ...state, pfReport: payload }
          case MANUAL_ENTRY_DATA:
            return { ...state, manualEntryget: payload }

            case GET_BREAKS_RECORDS:
            return { ...state, getBreaksDetailsForReport: payload }

        case SYNC_CONTACT:
          return {...state,syncContact : payload}

        case CHECK_DEVICE_ATT:
          return {...state,checkDeviceAttStatus : payload}

        case GET_DEVICE_ATT:
          return {...state,getRegisteredUsers : payload}

        case GET_ATTENDANCE_LOG_REPORT:
        return {...state, attendance_log_process: payload.data, attendanceLogCount : payload.numRows};

        case DELETE_EMP_DOCS:
        return {...state, deleteEmpDocs : payload};
        
        case ATTPROCESS_BACKGROUND_JOB:
        return {...state, attendanceProcessBackgroundJob : payload};

          case PRIVILEGELEAVEREPORT:
          return { ...state, privilegeleavereport: payload };
          
          case SET_ATTENDANCE_EFFICIENCY_REPORT:
          return { ...state, attendanceEfficiencyReport: payload }
    default:
      return state;
  }
}

export default attendanceReducer;
