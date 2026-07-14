import {
    GET_DASHBOARD_ROLE_DATA,
    GETALL_DASHBOARD,
    EDIT_DASHBOARD,
    UPDATE_DASHBOARD_LIST,
    GET_DASHBOARD_LIST_BY_ROLE,
    WIDGETS_DETAILS,
    DASHBOARD_LAYOUTS,
    DASHBOARD_API_POLL_TIMER_IDS,
    RESET_DASHBOARD_API_POLL_TIMER_IDS,
    SALARY_BASED_DEPARTMENT,
    SALARY_BASED_CATEGORY,
    GENDER_PERCENTAGE,
    DEPT_BASED_EMPLOYEE,
    OVERALL_ATT_PERCENTAGE,
    LEAVE_TYPE_DISTRIBUTION,
    ATTENDANCE_BASED_DEPARTMENT,
    ATTENDANCE_STATISTICS,
    DASHBOARD_DATA
  } from '../actionTypes';

  const initialState = {
   dashboardRoleData : [],
   getalldashboarddata : [],
   editdashboarddata : [],
   updateDashboardList : [],
   dashboardListByRole : [],
   widgetsdetails: [],
   dashboardLayouts : {},
   cardVisibility : {},
    dashboardPollTimerIds: [],
    isCardEnabled:[],
    salaryBasedDepartment : [],
    salaryBasedCategory : [],
    genderPercentage :[],
    deptBasedEmployee : [],
    overallAttPercentage : [],
    leaveTypeDistribution : [],
    attBasedDepartment : [],
    attendanceStatistics : [],
    dashboardData: []
  };
  
  function DashboardRoleReducer(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
        case GET_DASHBOARD_ROLE_DATA:
          return {...state, dashboardRoleData: payload};

        case GET_DASHBOARD_LIST_BY_ROLE:
          return {...state, dashboardListByRole: payload};
  
        case GETALL_DASHBOARD:
          return {...state, getalldashboarddata: payload};

        case EDIT_DASHBOARD:
          return {...state, editdashboarddata: payload};

        case UPDATE_DASHBOARD_LIST:
          return {...state, updateDashboardList : payload}

        case WIDGETS_DETAILS:
          return {...state, widgetsdetails: payload};

        case DASHBOARD_LAYOUTS:
          return {
            ...state, 
            dashboardLayouts: payload.layouts, 
            cardVisibility: payload.cardVisibility,
            isCardEnabled : payload.isCardEnabled
        };
      
        case DASHBOARD_API_POLL_TIMER_IDS:
          return {...state, dashboardPollTimerIds: [...state.dashboardPollTimerIds, payload]};

        case RESET_DASHBOARD_API_POLL_TIMER_IDS:
          return {...state, dashboardPollTimerIds: payload};

          case SALARY_BASED_DEPARTMENT:
            return {...state, salaryBasedDepartment: payload};

            case SALARY_BASED_CATEGORY:
              return {...state, salaryBasedCategory: payload};

              case GENDER_PERCENTAGE:
                return {...state, genderPercentage: payload};

                case DEPT_BASED_EMPLOYEE:
                  return {...state, deptBasedEmployee: payload};

                  case OVERALL_ATT_PERCENTAGE:
                    return {...state, overallAttPercentage: payload};

                    case LEAVE_TYPE_DISTRIBUTION:
                    return {...state, leaveTypeDistribution: payload};

                    case ATTENDANCE_BASED_DEPARTMENT:
                    return {...state, attBasedDepartment: payload};

                    case ATTENDANCE_STATISTICS:
                    return {...state, attendanceStatistics: payload};
                       
                    case DASHBOARD_DATA:
                    return {...state, dashboardData: payload};
   
        default:
          return state;  
    }
  }
  
  export default DashboardRoleReducer;
