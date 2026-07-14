import {
  GET_CHECKEDIN_DATA,
  GET_NOT_CHECKEDIN_DATA,
  GET_LATE_LOGIN_DATA,
  GET_COMPLETE_LIST_DATA,
  GET_EMPLOYEE_COUNT,
  SET_SEARCH_PAYROLL_CHECK_IN,
  SET_SEARCH_PAYROLL_NOTCHECKED_IN,
  SET_SEARCH_PAYROLL_LATE_LOGIN,
  SET_SEARCH_PAYROLL_COMPLETE_LIST,
  EARLY_CHECK_IN_CARD,
  HOLIDAY_CARD,
  LATE_CHECK_IN_CARD,
  GET_ALL_PROJECTS,
  GET_TASK_PROJECTS,
  CREATE_PROJECTS,
  CREATE_TASKS,
  TASK_LOGS_REPORT,
  UPDATE_TASKS,
  UPDATE_PROJECTS,
  DELETE_PROJECTS,
  GET_LATE_EARLY_DETAILS,
  GET_EMPLOYEE_LATE_EARLY_DETAILS,
  APPROVED_UNAPPROVED,
  CURRENT_DAY_DETAILS,
  GET_LOCATION_WISE_ATTENDANCE,
  GET_LOCATION_WISE_CHECKEDIN,
  GET_LOCATION_WISE_NOT_CHECKEDIN,
  GET_LOCATION_WISE_LATE_CHECKIN,
  GET_LOCATION_WISE_EARLY_CHECKOUT,
  GET_AVERAGE_WORKHOURS_DETAILS,
  GET_EXPERIENCE_DETAILS,
  GET_TOP_EMP_BY_ATTENDANCE,
  GET_COMPANY_ADMIN,
  GET_ACTIVITY_LOG,
  SET_SEARCH_TASK_LOG,
  FILTER_ACTIVITY_LOG,
  GET_EMP_EXPERIENCE_DETAILS,
  GET_ACTIVE_DEVICES_DETAILS,
  GET_TASK_STATUS,
  GET_ANNOUNCEMENT,
  GET_TASK_BY_STATUS,
  TASK_BY_STATUS_APPEND_LANE,
  GET_WORKHOURS_LOG,
  GET_COST_SUMMARY,
  GET_TASKS_COMMENTS,
  GET_LOCATION_EMP,
  UPDATE_TASK_STATUS,
  GET_LOCATION_EMP_Active,
  GET_PROJECT_TYPES,
  GET_TIMESHEET_ENABLE_DISABLE_LIST,
  GET_TASK_DETAILS_COUNT,
  FILTER_TASK_DETAILS,
  SET_FILTER_TASK_DETAILS,
  CREATED_AND_RESOLVED,
  WORK_LOAD_CHART,
  GET_PROJECT_VIEW,
  EMP_RANK_SCORE,
  TASK_WORK_LOG,
  TASK_LOG_REPORT,
  GET_CHECKED_IN_AND_OUT_DATA,
  TASKS_DELETE,
  GET_PROJECT_DETAILS,
  CREATE_PROJECT_BOARD,
  GET_PROJECT_LANES,
  DELETE_LANES,
  GET_SPRINT_DETAILS,
  GET_EMPLOYEE_LIST,
  GET_TASKS_COUNT,
  GET_TASK_DATA_STATUS,
  GET_TASK_PRIORITY,
  GET_TEAM_WORKLOAD,
  GET_TYPE_OF_WORK,
  GET_EPIC_PROGRESS,
  GET_EPIC_LIST,
  GET_WORK_LOG_REPORT,
  CREATE_PROJECT,
  PROJECT_SETTINGS,
  UPDATE_LOG_DETAIL,
  DELETE_LOG_DETAIL,
  GET_ACTIVE_STATUS_BY_LANE,
  GET_TASK_ID_BY_SEARCH,
  SET_TASK_ID_BY_SEARCH,
  GET_PROJECTS_REPORT_LIST,
  PROJECTS_REPORT_LIST_APPEND,
  GET_SPRINT_REPORT_LIST
} from '../actionTypes';

const initialState = {
  checkedIn: [],
  notCheckedIn: [],
  lateLogin: [],
  completeList: [],
  employeeCount: {},
  search_payroll_checkin: [],
  search_payroll_checkin_count: 0,
  search_payroll_notCheckin: [],
  search_payroll_notCheckin_count: 0,
  search_payroll_lateLogin: [],
  search_payroll_lateLogin_count: 0,
  search_payroll_completeList: [],
  search_payroll_completeList_count: 0,
  holidaysCard: {},
  earlyCheckoutCard: {},
  lastCheckInCard: {},
  get_projects: [],
  get_taskProjects: [],
  create_projects: [],
  create_tasks: [],
  tasklogs_report: [],
  update_edit_task: [],
  update_projects: [],
  get_late_early_checks: [],
  employeeCheckinOutDetails: [],
  currentDayCard: [],
  approvedAndUnapprovedCount: [],
  locationWiseAttendance: [],
  locationWiseCheckedIn: [],
  locationWiseNotCheckedIn: [],
  locationWiseLateCheckIn: [],
  locationWiseEarlyCheckOut: [],
  averageWorkHour: [],
  experienceDetails: [],
  empexperienceDetails: [],
  topEmpByAttendance: [],
  adminName:[],
  tasklogsDetails:[],
  activedeviceslist: [],
  taskStatus:[],
  announcements_list: [],
  taskPriority:[],
  taskByStatus: {},
  tasklogsReportCount: 0,
  taskRepeat:[],
  taskActivityDetails: [],
  costSummary: [],
  taskCommentsList: [],
  emp_location:[],
  updateTaskStatus:[],
  getActiveLocation: [],
  getprojectTypes: [],
  getEmpLocationpModel: [],
  timeSheetEnableDisableList:[],
  taskDetailsCount: [],
  filterTaskDetails:[],
  createAndResolved:{},
  workLoadChart:[],
  taskWorkLog:[],
  taskLogReport:[],
  get_viewmode: [] ,
  rankScore_list: [],
  getCheckedInAndOut:[],
  tasksDelete:[],
  getProjectDetails:{},
  createProjectBoard : [],
  createProject : [],
  getProjectLanes : [],
  deleteProjectLanes : [],
  getSprintDetails:[],
  getEmployeeList:[],
  getTasksCount : [],
  getTaskDataStatus : [],
  getTaskPriority : [],
  getTeamWorkLoad:[],
  getTypeOfWork : [],
  getEpicProgress : [],
  getWorkLogReport : [],
  projectSettings : [],
  updateLogData : [],
  deleteLogData : [],
  getActiveStatusByLane : [],
  get_epicList: [],
  getTaskIdBySearchAction: [],
  getProjectsReportList: [],
  getProjectsReportListTotal: 0,
  getSprintReport: []
};

function PayrolldashboardReducers(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_CHECKEDIN_DATA:
      return { ...state, checkedIn: payload };
      case GET_CHECKED_IN_AND_OUT_DATA:
        return { ...state, getCheckedInAndOut: payload };
    case GET_NOT_CHECKEDIN_DATA:
      return { ...state, notCheckedIn: payload };

    case GET_LATE_LOGIN_DATA:
      return { ...state, lateLogin: payload };

    case GET_COMPLETE_LIST_DATA:
      return { ...state, completeList: payload };

    case GET_EMPLOYEE_COUNT:
      return { ...state, employeeCount: payload };


    case SET_SEARCH_PAYROLL_CHECK_IN:
      return {
        ...state,
        search_payroll_checkin: payload.data,
        search_payroll_checkin_count: payload.numRows
      }

    case SET_SEARCH_PAYROLL_NOTCHECKED_IN:
      return {
        ...state,
        search_payroll_notCheckin: payload.data,
        search_payroll_notCheckin_count: payload.numRows
      }

    case SET_SEARCH_PAYROLL_LATE_LOGIN:
      return {
        ...state,
        search_payroll_lateLogin: payload.data,
        search_payroll_lateLogin_count: payload.numRows
      }


    case SET_SEARCH_PAYROLL_COMPLETE_LIST:
      return {
        ...state,
        search_payroll_completeList: payload.data,
        search_payroll_completeList_count: payload.numRows
      }

    case EARLY_CHECK_IN_CARD:
      return { ...state, earlyCheckoutCard: payload };

    case HOLIDAY_CARD:
      return { ...state, holidaysCard: payload };

    case LATE_CHECK_IN_CARD:
      return { ...state, lastCheckInCard: payload };

    case GET_ALL_PROJECTS:
      return { ...state, get_projects: payload };

    case GET_TASK_PROJECTS:
      return { ...state, get_taskProjects: payload };

    case CREATE_PROJECTS:
      return { ...state, create_projects: payload };

    case CREATE_TASKS:
      return { ...state, create_tasks: payload };

    case TASK_LOGS_REPORT:
      return { ...state, tasklogs_report: payload.data, tasklogsReportCount: payload.numRows };

    case UPDATE_TASKS:
      return { ...state, update_edit_task: payload };

    case UPDATE_PROJECTS:
      return { ...state, update_projects: payload };

    case DELETE_PROJECTS:
      return { ...state, update_projects: payload };

    case GET_LATE_EARLY_DETAILS:
      return { ...state, checkinOut_details: payload };

    case CURRENT_DAY_DETAILS:
      return { ...state, currentDayCard: payload };

    case APPROVED_UNAPPROVED:
      return { ...state, approvedAndUnapprovedCount: payload };
    case GET_LOCATION_WISE_ATTENDANCE:
      return { ...state, locationWiseAttendance: payload };

    case GET_LOCATION_WISE_CHECKEDIN:
      return { ...state, locationWiseCheckedIn: payload };

    case GET_LOCATION_WISE_NOT_CHECKEDIN:
      return { ...state, locationWiseNotCheckedIn: payload };

    case GET_LOCATION_WISE_LATE_CHECKIN:
      return { ...state, locationWiseLateCheckIn: payload };

    case GET_LOCATION_WISE_EARLY_CHECKOUT:
      return { ...state, locationWiseEarlyCheckOut: payload };

    case GET_EMPLOYEE_LATE_EARLY_DETAILS:
      return { ...state, employeeCheckinOutDetails: payload };

    case GET_AVERAGE_WORKHOURS_DETAILS:
      return { ...state, averageWorkHour: payload };

    case GET_EXPERIENCE_DETAILS:
      return { ...state, experienceDetails: payload };

    case GET_EMP_EXPERIENCE_DETAILS:
       return {...state, empexperienceDetails: payload};
      
    case GET_ACTIVE_DEVICES_DETAILS :
       return {...state, activedeviceslist: payload};

    case GET_TOP_EMP_BY_ATTENDANCE:
      return { ...state, topEmpByAttendance: payload };

      case GET_COMPANY_ADMIN:
        return { ...state, adminName: payload };

        case GET_WORKHOURS_LOG:
          return { ...state, tasklogsDetails: payload };

          case GET_ACTIVITY_LOG:
            return { ...state, taskActivityDetails: payload };

          case SET_SEARCH_TASK_LOG:
           return {...state, tasklogs_report: payload.data, tasklogsReportCount: payload.numRows}

           case FILTER_ACTIVITY_LOG:
           return {...state, tasklogs_report: payload.data, tasklogsReportCount: payload.numRows}

           case GET_TASK_STATUS:
      return { ...state, taskStatus: payload.status, taskPriority: payload.priority, taskRepeat: payload.repeat, taskIssueType: payload.issueType , parentList:payload.parentList}

    case GET_ANNOUNCEMENT:
      return { ...state, announcements_list: payload }
    
    case GET_TASK_BY_STATUS:
      return { ...state, taskByStatus: payload }

    case TASK_BY_STATUS_APPEND_LANE: {
      const { rows } = payload || {}
      if (!Array.isArray(rows) || rows.length === 0) return state
      const current = state.taskByStatus
      if (!Array.isArray(current)) return state
      const existingRows = Array.isArray(current[0]) ? current[0] : []
      const existingIds = new Set(existingRows.map((r) => r && r.id))
      const appended = rows.filter((r) => r && !existingIds.has(r.id))
      const nextRows = existingRows.concat(appended)
      return {
        ...state,
        taskByStatus: [nextRows, current[1], current[2], current[3]],
      }
    }

      case UPDATE_TASK_STATUS:
      return { ...state, updateTaskStatus: payload }

      case GET_COST_SUMMARY:
        return { ...state, costSummary: payload }

        case GET_TASKS_COMMENTS:
            return { ...state, taskCommentsList: payload };
            
            case GET_LOCATION_EMP:
          return {...state, getEmpLocationpModel: payload}

          case GET_LOCATION_EMP_Active:
      return { ...state, getActiveLocation: payload }
    
      case GET_PROJECT_TYPES:
        return { ...state, getprojectTypes: payload };

        case GET_TIMESHEET_ENABLE_DISABLE_LIST:
          return{...state, timeSheetEnableDisableList:payload};

          case GET_TASK_DETAILS_COUNT:
            return{...state, taskDetailsCount:payload};

            case FILTER_TASK_DETAILS:
              return{...state, filterTaskDetails:payload};

              case SET_FILTER_TASK_DETAILS:
                return{...state, filterTaskDetails:payload};

                case CREATED_AND_RESOLVED:
                  return{...state, createAndResolved:payload};

                  case WORK_LOAD_CHART:
                    return{...state, workLoadChart : payload }

    case TASK_WORK_LOG:
      return { ...state, taskWorkLog: payload }
    case TASK_LOG_REPORT:
      return { ...state, taskLogReport: payload }
                    
                    case GET_PROJECT_VIEW:
                      return { ...state, get_viewmode: payload };

                      case EMP_RANK_SCORE:
                      return { ...state, rankScore_list: payload };

                      case TASKS_DELETE:
                        return { ...state, tasksDelete: payload };

                        case GET_PROJECT_DETAILS:
                        return { ...state, getProjectDetails: payload }

                        case CREATE_PROJECT_BOARD:
                          return {...state,createProjectBoard: payload}

                        case CREATE_PROJECT:
                          return {...state,createProject: payload}

                        case PROJECT_SETTINGS:
                          return {...state,projectSettings: payload}

                        case GET_TASKS_COUNT:
                          return {...state,getTasksCount: payload}

                        case GET_TASK_DATA_STATUS:
                          return {...state,getTaskDataStatus: payload}

                        case GET_TASK_PRIORITY:
                          return {...state,getTaskPriority: payload}

                        case GET_TEAM_WORKLOAD:
                          return {...state,getTeamWorkLoad: payload}

                        case GET_TYPE_OF_WORK:
                          return {...state,getTypeOfWork: payload}
                          
                        case GET_PROJECT_LANES:
                          return {...state,getProjectLanes: payload}

                        case GET_EPIC_PROGRESS:
                          return {...state,getEpicProgress: payload}

                        case GET_WORK_LOG_REPORT:
                          return {...state,getWorkLogReport: payload}

                        case DELETE_LANES:
                          return {...state,deleteProjectLanes: payload}
    case GET_SPRINT_DETAILS:
      return { ...state, getSprintDetails: payload }
    case GET_EMPLOYEE_LIST:
      return { ...state, getEmployeeList: payload }

    case UPDATE_LOG_DETAIL:
      return { ...state, updateLogData: payload }
    case DELETE_LOG_DETAIL:
      return { ...state, deleteLogData: payload }
    case GET_ACTIVE_STATUS_BY_LANE:
      return {...state, getActiveStatusByLane: payload}
    case GET_EPIC_LIST:
      return { ...state, get_epicList: payload };
    case GET_TASK_ID_BY_SEARCH:
      return { ...state, getTaskIdBySearchAction: payload }
    case GET_PROJECTS_REPORT_LIST:
      return {
        ...state,
        getProjectsReportList: Array.isArray(payload) ? payload : [],
        getProjectsReportListTotal:
          typeof action?.numRows === 'number'
            ? action.numRows
            : Array.isArray(payload)
              ? payload.length
              : 0,
      }

    case PROJECTS_REPORT_LIST_APPEND: {
      const incoming = Array.isArray(payload?.groups) ? payload.groups : []
      if (incoming.length === 0) return state
      const current = Array.isArray(state.getProjectsReportList) ? state.getProjectsReportList : []
      const mergeById = (a = [], b = []) => {
        const seen = new Set((a || []).map((x) => x && x.id).filter((v) => v != null))
        const extras = (b || []).filter((x) => x && x.id != null && !seen.has(x.id))
        return [...(a || []), ...extras]
      }
      const groupKey = (g) => (g && g.id != null ? `id_${g.id}` : `title_${g?.title || ''}`)
      const byKey = new Map()
      for (const g of current) byKey.set(groupKey(g), { ...g })
      for (const g of incoming) {
        const k = groupKey(g)
        const existing = byKey.get(k)
        if (!existing) {
          byKey.set(k, g)
          continue
        }
        byKey.set(k, {
          ...existing,
          stories: mergeById(existing.stories, g.stories),
          tasks: mergeById(existing.tasks, g.tasks),
          directSubtasks: mergeById(existing.directSubtasks, g.directSubtasks),
        })
      }
      return { ...state, getProjectsReportList: Array.from(byKey.values()) }
    }
    case GET_SPRINT_REPORT_LIST:
      return { ...state, getSprintReport: payload }
    default:
      return state;
  }
}

export default PayrolldashboardReducers;
