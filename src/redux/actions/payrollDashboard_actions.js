import {
  GET_CHECKEDIN_DATA,
  GET_NOT_CHECKEDIN_DATA,
  GET_LATE_LOGIN_DATA,
  GET_LEAVES_STATUS,
  GET_COMPLETE_LIST_DATA,
  GET_EMPLOYEE_COUNT,
  GET_SEARCH_PAYROLL_CHECK_IN,
  SET_SEARCH_PAYROLL_CHECK_IN,
  GET_SEARCH_PAYROLL_NOTCHECKED_IN,
  SET_SEARCH_PAYROLL_NOTCHECKED_IN,
  GET_SEARCH_PAYROLL_LATE_LOGIN,
  SET_SEARCH_PAYROLL_LATE_LOGIN,
  GET_SEARCH_PAYROLL_COMPLETE_LIST,
  APPROVED_UNAPPROVED,
  UPDATE_TIME_SPENT,
  GET_COMPANY_ADMIN,
  GET_EXPERIENCE_DETAILS,
  SET_SEARCH_PAYROLL_COMPLETE_LIST,
  CURRENT_DAY_DETAILS,
  HOLIDAY_CARD,
  LATE_CHECK_IN_CARD,
  EARLY_CHECK_IN_CARD,
  GET_ALL_PROJECTS,
  GET_TASK_PROJECTS,
  CREATE_PROJECTS,
  CREATE_TASKS,
  TASK_LOGS_REPORT,
  UPDATE_TASKS,
  UPDATE_PROJECTS,
  GET_LATE_EARLY_DETAILS,
  GET_EMPLOYEE_LATE_EARLY_DETAILS,
  GET_LOCATION_WISE_ATTENDANCE,
  GET_LOCATION_WISE_CHECKEDIN,
  GET_LOCATION_WISE_NOT_CHECKEDIN,
  GET_LOCATION_WISE_LATE_CHECKIN,
  GET_LOCATION_WISE_EARLY_CHECKOUT,
  GET_AVERAGE_WORKHOURS_DETAILS,
  GET_TOP_EMP_BY_ATTENDANCE,
  GET_ACTIVITY_LOG,
  GET_SEARCH_TASK_LOG,
  SET_SEARCH_TASK_LOG,
  FILTER_ACTIVITY_LOG,
  GET_EMP_EXPERIENCE_DETAILS,
  GET_ACTIVE_DEVICES_DETAILS,
  START_END_LOG,
  GET_TASK_STATUS,
  CREATE_ANNOUNCEMENT,
  GET_ANNOUNCEMENT,
  GET_TASK_BY_STATUS,
  TASK_BY_STATUS_APPEND_LANE,
  GET_WORKHOURS_LOG,
  GET_COST_SUMMARY,
  GET_TASKS_COMMENTS,
  GET_LOCATION_EMP,
  UPDATE_TASK_STATUS,
  GET_LOCATION_EMP_Active,
  UPDATE_LOCATION_STATUS,
  GET_PROJECT_TYPES,
  GET_TIMESHEET_ENABLE_DISABLE_LIST,
  GET_TASK_DETAILS_COUNT,
  FILTER_TASK_DETAILS,
  GET_FILTER_TASK_DETAILS,
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
  SET_TASK_BY_STATUS,
  DELETE_LANES,
  CREATE_SPRINT,
  GET_SPRINT_DETAILS,
  DELETE_SPRINT,
  UPDATE_SPRINT,
  GET_EMPLOYEE_LIST,
  SET_ALL_PROJECTS,
  GET_TASKS_COUNT,
  GET_TASK_DATA_STATUS,
  GET_TASK_PRIORITY,
  GET_TEAM_WORKLOAD,
  GET_TYPE_OF_WORK,
  GET_EPIC_PROGRESS,
  GET_WORK_LOG_REPORT,
  SET_WORK_LOG_REPORT,
  CREATE_PROJECT,
  PROJECT_SETTINGS,
  COMPLETE_SPRINT,
  DELETE_LOG_DETAIL,
  GET_ACTIVE_STATUS_BY_LANE,
  GET_EPIC_LIST,
  GET_TASK_ID_BY_SEARCH,
  SET_TASK_ID_BY_SEARCH,
  GET_PROJECTS_REPORT_LIST,
  GET_SPRINT_REPORT_LIST,
  GET_CHECK_PROJECT_EXISTS,
  PROJECTS_REPORT_LIST_APPEND
} from '../actionTypes';
import PayrollDashboardServices from '../../services/payrollDashboard_services';
import LoginService from '../../services/login_services';
import {CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert, completeSprint, createSprint, deleteSprint, maxNumberAlert, updateSprint} from './load';
import {OpenalertActions} from './alert_actions';
import payrollDashboard_services from '../../services/payrollDashboard_services';
import { UPDATE_LOG_DETAIL } from 'shared/constants/ActionTypes';

const inferDuplicateField = (body, message) => {
  if (body && body.field) return body.field;
  const lower = String(message || '').toLowerCase();
  if (lower.includes('key')) return 'project_key';
  if (lower.includes('name')) return 'project_name';
  return null;
};

export const checkedInAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getCheckedIn(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CHECKEDIN_DATA,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getCheckedInAndOutAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getCheckedInAndOut(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CHECKED_IN_AND_OUT_DATA,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const notCheckedInAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getNotCheckedIn(data);
      if (res.status === 200) {
        dispatch({
          type: GET_NOT_CHECKEDIN_DATA,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const lateLoginAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getLateLogin();
      if (res.status === 200) {
        dispatch({
          type: GET_LATE_LOGIN_DATA,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const leavesStatusAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getLeavesStatus();
      if (res.status === 200) {
        dispatch({
          type: GET_LEAVES_STATUS,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const completeListAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getCompleteList();
      if (res.status === 200) {
        dispatch({
          type: GET_COMPLETE_LIST_DATA,
          payload: res.data,
        });

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const employeeCountAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PayrollDashboardServices.getEmployeeCount();
      if (res.status === 200) {
        dispatch({
          type: GET_EMPLOYEE_COUNT,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getSearchPayrollCheckinAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PAYROLL_CHECK_IN,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchPayrollCheckinAction = (data) => {
    return {
      type:SET_SEARCH_PAYROLL_CHECK_IN,
      payload:data
    }
  };

  export const getSearchPayrollNotCheckinAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PAYROLL_NOTCHECKED_IN,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchPayrollNotCheckinAction = (data) => {
    return {
      type:SET_SEARCH_PAYROLL_NOTCHECKED_IN,
      payload:data
    }
  };


  
  export const getSearchPayrollLateLoginAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PAYROLL_LATE_LOGIN,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchPayrollLateLoginAction = (data) => {
    return {
      type:SET_SEARCH_PAYROLL_LATE_LOGIN,
      payload:data
    }
  };


  export const getSearchPayrollCompleteListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PAYROLL_COMPLETE_LIST,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchPayrollCompleteListAction = (data) => {
    return {
      type:SET_SEARCH_PAYROLL_COMPLETE_LIST,
      payload:data
    }
  };

export const holidaysCardAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.holidaysCard();
      if (res.status === 200) {
        dispatch({
          type: HOLIDAY_CARD,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const lastCheckInCardAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.lastCheckInCard();
      if (res.status === 200) {
        dispatch({
          type: LATE_CHECK_IN_CARD,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const earlyCheckoutCardAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.earlyCheckoutCard();
      if (res.status === 200) {
        dispatch({
          type: EARLY_CHECK_IN_CARD,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getProjectsAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getProjects(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PROJECTS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const setProjectsAction = (data)=>{
    return{
      type : GET_ALL_PROJECTS,
      payload : data
    }
  }

  export const getProjectsDataAction =(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
      type : SET_ALL_PROJECTS,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

  export const createProjectBoardAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.createBoards(data);
        if(res.status === 200){
          dispatch({
            type : CREATE_PROJECT_BOARD,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }
  export const CreateProject =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.createProjectService(data);
        if(res.status === 200){
          dispatch({
            type : CREATE_PROJECT,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const ProjectSettingsAction = (data) => async(dispatch)=>{
    try{
      const res = await PayrollDashboardServices.ProjectSettings(data)
      dispatch({
        type : PROJECT_SETTINGS,
        payload : res.data

      })
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }

  export const getTasksStatusAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.getTasksStatus(data);
        if(res.status === 200){
          dispatch({
            type : GET_TASKS_COUNT,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }
  export const getTasksStatusDataAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.getTasksDataStatus(data);
        if(res.status === 200){
          dispatch({
            type : GET_TASK_DATA_STATUS,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const getTaskPriorityAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.getTaskPriority(data);
        if(res.status === 200){
          dispatch({
            type : GET_TASK_PRIORITY,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const teamWorkLoadAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.teamWorkLoad(data);
        if(res.status === 200){
          dispatch({
            type : GET_TEAM_WORKLOAD,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }
  export const typesOfWorkAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.typesOfWork(data);
        if(res.status === 200){
          console.log(res.data,'typee888')
          dispatch({
            type : GET_TYPE_OF_WORK,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const epicProgressAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.epicProgress(data);
        if(res.status === 200){
          dispatch({
            type : GET_EPIC_PROGRESS,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const setSearchWorkLogAction = (data)=>{
    return {
      type : GET_WORK_LOG_REPORT,
      payload : data
    }
  }

  export const getSearchWorkLogAction = (body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
      type : SET_WORK_LOG_REPORT,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  }

  export const workLogReportAction=(data)=> async(dispatch)=>{
    try{
      const res = await payrollDashboard_services.workLogReport(data)
      if(res.status === 200){
        dispatch({
          type :GET_WORK_LOG_REPORT,
          payload : res.data
        })
      }
      return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }

  export const getProjectLanesAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.getProjectLanes(data);
        if(res.status === 200){
          dispatch({
            type : GET_PROJECT_LANES,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }
  export const deleteProjectLanesAction =(data)=> async (dispatch)=>{
    try{
        const res = await payrollDashboard_services.deleteProjectLanes(data);
        if(res.status === 200){
          dispatch({
            type : DELETE_LANES,
            payload : res.data
          })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
      ErrorAlert(dispatch,err)
      return Promise.reject("API_FINISHED_ERROR")
    }
  }

  export const showTasklistAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getTasklist(data);
      if (res.status === 200) {
        dispatch({
          type: GET_TASK_PROJECTS,
          payload: res.data,
        });

        if(response){
          response(res.data)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const CreateProjectAction =
  (data) => async (dispatch) => {
    try {
      const res = await payrollDashboard_services.createProjectService(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PROJECTS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      if (err && err.response && err.response.status === 409) {
        const body = err.response.data || {};
        const serverMsg = body.message || 'Duplicate project';
        const field = inferDuplicateField(body, serverMsg);
        return Promise.reject({ code: 'DUPLICATE', field, message: serverMsg });
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const createTaskAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.createtasks(data);
      if (res.status === 200) {
        dispatch({
          type: GET_TASK_PROJECTS,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const createEpicAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.createEpic(data);
      if (res.status === 200) {
        if (data?.project_id) {
          const listRes = await PayrollDashboardServices.getEpicList(data.project_id);
          if (listRes.status === 200) {
            dispatch({
              type: GET_EPIC_LIST,
              payload: listRes.data?.data ?? listRes.data,
            });
          }
        }
        if (response) {
          response(res.status, res.data);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const summaryTasklogAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.taskLogs(data);
      if (res.status === 200) {
        dispatch({
          type: TASK_LOGS_REPORT,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateTaskAction =
  (id,data,response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.updateTask(id,data);
      if (res.status === 200) {
        dispatch({
          type: GET_TASK_PROJECTS,
          payload: res.data,
        });
        if(response){
          response(res.status);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      // Surface optimistic-concurrency conflicts to the caller without a generic error alert.
      if (err?.response?.status === 409 && err?.response?.data?.code === 'STALE_UPDATE') {
        if (response) {
          response(409, err.response.data);
        }
        return Promise.reject('API_FINISHED_CONFLICT');
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getActiveStatusByLaneAction = (id, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getActiveStatusByLane(id);
      if (res.status === 200) {
        dispatch({
          type: GET_ACTIVE_STATUS_BY_LANE,
          payload:res.data
        });
        if(response){
          response(res.data);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getActiveStatusByLane = getActiveStatusByLaneAction;

export const updateLogDataAction = (data,response) => async (dispatch) => {
  try {
      const res = await PayrollDashboardServices.updateLogData(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_LOG_DETAIL,
          payload: res.data,
        });
        if(response){
          response(res.status);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const deleteLogDataAction = (data,response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.deleteLogData(data);
      if (res.status === 200) {
        dispatch({
          type: DELETE_LOG_DETAIL,
          payload: res.data,
        });
        if(response){
          response(res.status);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateProjectsAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.updateProject(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PROJECTS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      if (err && err.response && err.response.status === 409) {
        const body = err.response.data || {};
        const serverMsg = body.message || 'Duplicate project';
        const field = inferDuplicateField(body, serverMsg);
        return Promise.reject({ code: 'DUPLICATE', field, message: serverMsg });
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteProjectsAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.deleteProject(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PROJECTS,
          payload: res.data,
        });

        

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const deleteTaskAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.deleteTask(data);
      if (res.status === 200) {
        dispatch({
          type: GET_TASK_PROJECTS,
          payload: res.data,
        });

        

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const lateLoginEarlyCheckoutAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.lateLoginEarlycheckout();
      if (res.status === 200) {
        dispatch({
          type: GET_LATE_EARLY_DETAILS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationWiseAttendanceAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.locationWiseAttendance();
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_WISE_ATTENDANCE,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationWiseCheckedInAction =
  (location_id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.locationWiseCheckedIn(location_id);
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_WISE_CHECKEDIN,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationWiseNotCheckedInAction =
  (location_id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.locationWiseNotCheckedIn(location_id);
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_WISE_NOT_CHECKEDIN,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationWiseLateCheckInAction =
  (location_id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.locationWiseLateCheckIn(location_id);
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_WISE_LATE_CHECKIN,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationWiseEarlyCheckOutAction =
  (location_id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.locationWiseEarlyCheckOut(location_id);
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_WISE_EARLY_CHECKOUT,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const employeeLateLoginEarlyCheckoutAction =
  (person_id, data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.employeeLateLoginEarlycheckout(person_id, data);
      if (res.status === 200) {
        dispatch({
          type: GET_EMPLOYEE_LATE_EARLY_DETAILS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const currentDayCardDetail =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.currentDayCardDetail();
      if (res.status === 200) {
        dispatch({
          type: CURRENT_DAY_DETAILS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const approvedAndUnapproved =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.approvedAndUnapprovedservice();
      if (res.status === 200) {
        dispatch({
          type: APPROVED_UNAPPROVED,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const averageWorkHourAction =
  (person_id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getAverageWorkHours(person_id);
      if (res.status === 200) {
        dispatch({
          type: GET_AVERAGE_WORKHOURS_DETAILS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  // export const getAverageWorkHoursEmployeeAction =
  // (person_id) => async (dispatch) => {
  //   try {
  //     const res = await PayrollDashboardServices.getAverageWorkHoursEmployee(person_id);
  //     if (res.status === 200) {
  //       dispatch({
  //         type: GET_AVERAGE_WORKHOURS_EMPLOYEE_DETAILS,
  //         payload: res.data,
  //       });

  //       return Promise.resolve("API_FINISHED_SUCCESS");
  //     }
  //   } catch (err) {
  //     ErrorAlert(dispatch, err);
  //     return Promise.reject("API_FINISHED_ERROR");
  //   }
  // };

  export const experienceDetailsAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.experienceDetails();
      const res1 = await PayrollDashboardServices.empexperienceDetails();
      if (res.status === 200) {
        dispatch({
          type: GET_EXPERIENCE_DETAILS,
          payload: res.data,
        });
      }
      if (res1.status === 200) {
        dispatch({
          type: GET_EMP_EXPERIENCE_DETAILS,
          payload: res1.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const activeDevicesList =
  (person_id) => async (dispatch) => {
    try {
      const res = await LoginService.active_devices(person_id);
      if (res.status === 200) {
        dispatch({
          type: GET_ACTIVE_DEVICES_DETAILS,
          payload: res.data,
        });
      }
     
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const topEmpByAttendanceAction =
  (type) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.topEmpByAttendance(type);
      if (res.status === 200) {
        dispatch({
          type: GET_TOP_EMP_BY_ATTENDANCE,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getCompanyAdminAction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getCompanyAdmin();
      if (res.status === 200) {
        dispatch({
          type: GET_COMPANY_ADMIN,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateTimeSpentAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.updateTimeSpent(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_TIME_SPENT,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getActivityAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getlogs(data);
      console.log(res,'res')
      if (res.status === 200) {
        dispatch({
          type: GET_ACTIVITY_LOG,
          payload: res.data.decryptedRes,
        });
        if (res.status === 200) {
          dispatch({
            type: GET_WORKHOURS_LOG,
            payload: res.data.res1,
          });
        if(response){
          response(res.status, res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    }} catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const filterTaskLogAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.filterTaskLog(data);
      if (res.status === 200) {
        dispatch({
          type: FILTER_ACTIVITY_LOG,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getTaskCommentsAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getTaskComments(data);
      if (res.status === 200) {
        dispatch({
          type: GET_TASKS_COMMENTS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const startEndAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.startEnd(data);
      if (res.status === 200) {
        dispatch({
          type: START_END_LOG,
          payload: res.data,
        });

        return Promise.resolve(res);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getTaskLogAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
     try {
          ListLoad(setModalTypeHandler, setLoaderStatusHandler);
          const res = await PayrollDashboardServices.taskLogs(data);
          if (res.status === 200) {
            dispatch({ type: SET_SEARCH_TASK_LOG, payload: res.data });
          }
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          return Promise.resolve('API_FINISHED_SUCCESS');
        } catch (err) {
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          ErrorAlert(dispatch, err);
          return Promise.reject('API_FINISHED_ERROR');
        }
  };

  export const get_searchTaskLogAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_TASK_LOG,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchTaskLogAction = (data) => {
    return {
      type:SET_SEARCH_TASK_LOG,
      payload:data
    };

  };
  
  export const getTaskStatusAction =
(data) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getTaskStatus(data);
    if (res.status === 200) {
      dispatch({
        type: GET_TASK_STATUS,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
  };

  export const updataTaskStatusAction =
  (data) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.statusUpdate(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_TASK_STATUS,
          payload: res.data,
        });
  
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
    };

export const createAnnouncement = (data, response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.createAnnouncement(data);

      if (res.status === 200) {
        if (res.data.status === 'CANNOT_CREATE') {
          maxNumberAlert(dispatch, res.data.message)
          if (response) {
            response({ status: 'FAILED' })
          }
        } else {
         
          dispatch({
            type: GET_ANNOUNCEMENT,
            payload: res.data,
          });

          CreateAlert(dispatch)
          if (response) {
            response({ status: 'SUCCESS' })
          }
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const getAnnouncements = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getAnnouncements();
    if (res.status === 200) {
      dispatch({
        type: GET_ANNOUNCEMENT,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}

export const getTaskByStatusAction = (projectId, opts = {}) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getTaskByStatus(projectId, opts);
    if (res.status === 200) {
      dispatch({
        type: GET_TASK_BY_STATUS,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const loadMoreLaneAction = (projectId, opts = {}) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getTaskByStatus(projectId, opts);
    if (res.status === 200) {
      const rows = Array.isArray(res.data?.[0]) ? res.data[0] : [];
      dispatch({
        type: TASK_BY_STATUS_APPEND_LANE,
        payload: { status: opts.status, rows },
      });
      return Promise.resolve({ rows });
    }
    return Promise.reject("API_FINISHED_ERROR");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const setTaskByStatusAction = (data)=>{
  return{
    type : GET_TASK_BY_STATUS,
    payload : data
  }
}

export const getTasksDataAction = (body,setModalTypeHandler,setLoaderStatusHandler)=>{
  return {
    type : SET_TASK_BY_STATUS,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}

export const getSprintReportAction = (projectId, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getSprintReport(projectId);
    if (res.status === 200) {
      const reportList = Array.isArray(res.data?.data) ? res.data.data : [];
      dispatch({
        type: GET_SPRINT_REPORT_LIST,
        payload: reportList
      })
      if (response) {
        response(reportList, res.data)
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
export const getProjectDetailsAction = (projectId, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getProjectDetails(projectId);
    if (res.status === 200) {
      dispatch({
        type:GET_PROJECT_DETAILS,
        payload:res.data
      })
      if (response) {
        response(res)
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const dragUpdateStatusAction = (taskId, payload, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.dragUpdate(taskId, payload);
    if (res?.status >= 200 && res?.status < 300) {
      if (response) response(res.status);
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    if (response) response(res?.status || 500);
    return Promise.reject("API_FINISHED_ERROR");
  } catch (err) {
    ErrorAlert(dispatch, err);
    if (response) response(err?.response?.status || 500);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


  
export const updateAnnouncement = (data, id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.updateAnnouncement(data, id);
      if (res.status === 200) {
        dispatch({
          type: GET_ANNOUNCEMENT,
          payload: res.data,
        });
        UpdateAlert(dispatch)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
}; 

export const CostSummaryAction = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.CostSummary();
   
    if (res.status === 200) {
      dispatch({
        type: GET_COST_SUMMARY,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateAnnouncementInActive = (id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.updateInactive(id);
      if (res.status === 200) {
        dispatch({
          type: GET_ANNOUNCEMENT,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEmpLocationAction = (id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.get_emp_location(id);
      console.log(res,'res');
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_EMP,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEmpLocationActiveAction = (id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.get_emp_location_active(id);
      console.log(res,'res');
      if (res.status === 200) {
        dispatch({
          type: GET_LOCATION_EMP_Active,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateLocationStatusAction = (id) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.update_location(id);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_LOCATION_STATUS,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const clearTaskLog = () => {
  return {
    type : GET_ACTIVITY_LOG,
    payload: []
  }

};

export const updatepasswordaction = (
  data,
   setModalTypeHandler,
   setLoaderStatusHandler) =>
 async (dispatch) => {
   try {
     ListLoad(setModalTypeHandler, setLoaderStatusHandler);
     const res = await PayrollDashboardServices.update_password(data)
 
     if (res.status === 200 && res.data?.affectedRows) {
      UpdateAlert(dispatch); 
     }
     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
     return Promise.resolve("API_FINISHED_SUCCESS");
   } catch (err) { 
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
     ErrorAlert(dispatch, err);
     return Promise.reject("API_FINISHED_ERROR");
   }
  }; 
 
  export const projectTypesaction =
  () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.getprojectTypes();
      if (res.status === 200) {
        dispatch({
          type: GET_PROJECT_TYPES,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }

  
  };

  export const timeSheetEnableDisableListAction = () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.timeSheetEnableDisableList();
      if (res.status === 200) {
        dispatch({
          type: GET_TIMESHEET_ENABLE_DISABLE_LIST,
          payload: res.data,
        });
  
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const taskDetailsCountAction = () => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.taskDetailsCount();
      if (res.status === 200) {
        dispatch({
          type: GET_TASK_DETAILS_COUNT,
          payload: res.data,
        });
  
        return Promise.resolve("API_FINISHED_SUCCESS");
      }else {
        ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
        return Promise.reject("API_FINISHED_ERROR");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const filterTaskDetailsAction = (data,response) => async (dispatch) => {
    try {
      const res = await PayrollDashboardServices.filterTaskDetails(data);
      if (res.status === 200) {
        dispatch({
          type: FILTER_TASK_DETAILS,
          payload: res.data,
        });
   response(res.data)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getSearchTaskAction= (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_FILTER_TASK_DETAILS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}
 
export const setSearchTaskAction = (data) => {
    return {
      type : SET_FILTER_TASK_DETAILS,
      payload : data
    }
};

export const getCreatedAndResolvedAction = (data,response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getCreatedAndResolved(data);
    if (res.status === 200) {
      dispatch({
        type: CREATED_AND_RESOLVED,
        payload: res.data,
      });
 response(res.data)
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const getWorkLoadAction = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getWorkLoad();

    if (res && res.status === 200 && res.data) {
      const validData = res.data.filter(item => item.empname !== null);

      dispatch({
        type: WORK_LOAD_CHART,
        payload: validData,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } else {
      throw new Error("Unexpected API response");
    }
  } catch (err) {
    console.error("Error", err);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const viewmodeAction = (data) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.viewmode(data);
    if (res.status === 200) {
      dispatch({
        type: GET_PROJECT_VIEW,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const empRankScoreListAction = (id) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.rankScoreCard(id);
    if (res.status === 200) {
      dispatch({
        type: EMP_RANK_SCORE,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getTaskWorkLogAction = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getTaskWorkLog();
    if (res.status === 200) {
      dispatch({
        type: TASK_WORK_LOG,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }else {
      ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getTaskLogReportAction = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getTaskLogReport();
    if (res.status === 200) {
      // console.log("rtgrttyb",res);
      dispatch({
        type: TASK_LOG_REPORT,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }else {
      console.log("33");
      ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const tasksDeleteAction = (data, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.tasksDelete(data);
    if (res.status === 200) {
      if(data.projectid){
        dispatch({
          type: GET_TASK_BY_STATUS,
          payload: res.data,
        });
      }else{
        dispatch({
          type: FILTER_TASK_DETAILS,
          payload: res.data,
        });
      }

      if(response){
        response(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    }else {
      ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const createSprintAction = (data, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.createSprint(data);
    if (res.status === 200) {
      dispatch({
        type: CREATE_SPRINT,
        payload: res.data,
      });

      createSprint(dispatch)
      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } else {
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    const httpStatus = err && err.response && err.response.status;
    if (httpStatus === 400 || httpStatus === 404 || httpStatus === 409) {
      const serverMsg = (err.response.data && err.response.data.message) || 'Operation failed';
      dispatch(OpenalertActions({ msg: serverMsg, severity: 'error' }));
      return Promise.reject({ code: httpStatus, message: serverMsg });
    }
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getSprintDetailsAction = (data) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getSprintDetails(data);
    if (res.status === 200) {
      dispatch({
        type: GET_SPRINT_DETAILS,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleteSprintAction = (data, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.deleteSprint(data);
    if (res.status === 200) {
      dispatch({
        type: DELETE_SPRINT,
        payload: res.data,
      });

      deleteSprint(dispatch)
      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } else {
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateSprintAction = (data, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.updateSprint(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_SPRINT,
        payload: res.data,
      });

      updateSprint(dispatch, res.data)
      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } else {
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const completeSprintAction = (data, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.completeSprint(data);
    if (res.status === 200) {
      dispatch({
        type: COMPLETE_SPRINT,
        payload: res.data,
      });

      completeSprint(dispatch)
      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } else {
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getEmployeeListAction = () => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getEmployeeList();
    if (res.status === 200) {
      dispatch({
        type: GET_EMPLOYEE_LIST,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    } else {
      ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
      return Promise.reject("API_FINISHED_ERROR");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const showEpicListAction = (projectId, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getEpicList(projectId);
    if (res.status === 200) {
      dispatch({ type: GET_EPIC_LIST, payload: res.data?.data ?? res.data });
      if (response) response(res.data?.data ?? res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getTaskIdBySearchAction = (
  body,
  setModalTypeHandler,
  setLoaderStatusHandler,
  response,
) => {
  return {
    type: GET_TASK_ID_BY_SEARCH,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
    response,
  };
};

export const setTaskIdBySearchAction = (data) => {
  return {
    type: SET_TASK_ID_BY_SEARCH,
    payload: data,
  };
};

export const getProjectsReportListAction = (body, response) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getProjectsReportList(body);

    if (res.status === 200) {
      const reportList = Array.isArray(res.data?.data) ? res.data.data : [];
      const numRows = Number(res.data?.numRows ?? reportList.length);

      dispatch({
        type: GET_PROJECTS_REPORT_LIST,
        payload: reportList,
        numRows,
      });

      if (response) {
        response(reportList, res.data);
      }

      return Promise.resolve({ groups: reportList, numRows });
    }

    ErrorAlert(dispatch, new Error(`Unexpected status code: ${res.status}`));
    return Promise.reject("API_FINISHED_ERROR");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const loadMoreProjectsReportListAction = (body) => async (dispatch) => {
  try {
    const res = await PayrollDashboardServices.getProjectsReportList(body);
    if (res.status === 200) {
      const groups = Array.isArray(res.data?.data) ? res.data.data : [];
      dispatch({
        type: PROJECTS_REPORT_LIST_APPEND,
        payload: { groups },
      });
      return Promise.resolve({ groups, numRows: Number(res.data?.numRows ?? 0) });
    }
    return Promise.reject("API_FINISHED_ERROR");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

// Chunked CSV import orchestrator.
// Splits the parsed rows into batches, uploads each to /chunk, then commits.
// onProgress is called after each phase change so the UI can render a bar.
export const importCsvAction = (parsedRows, options, onProgress) => async (dispatch) => {
  const CHUNK_SIZE = 500;
  const chunks = [];
  for (let i = 0; i < parsedRows.length; i += CHUNK_SIZE) {
    chunks.push(parsedRows.slice(i, i + CHUNK_SIZE));
  }

  let sessionId = null;
  try {
    const startRes = await PayrollDashboardServices.startCsvImport();
    sessionId = startRes?.data?.sessionId;
    if (!sessionId) throw new Error('Failed to start import session');

    for (let i = 0; i < chunks.length; i++) {
      await PayrollDashboardServices.uploadCsvChunk(sessionId, i, chunks[i]);
      if (typeof onProgress === 'function') {
        onProgress({ phase: 'upload', done: i + 1, total: chunks.length });
      }
    }

    if (typeof onProgress === 'function') {
      onProgress({ phase: 'commit', done: 0, total: 1 });
    }
    const commitRes = await PayrollDashboardServices.commitCsvImport(sessionId, options || {});
    if (typeof onProgress === 'function') {
      onProgress({ phase: 'done', done: 1, total: 1 });
    }
    return Promise.resolve(commitRes.data);
  } catch (err) {
    if (sessionId) {
      PayrollDashboardServices.abortCsvImport(sessionId).catch(() => {});
    }
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const get_checkProjectExistsAction = (body, res) => ({
  type: GET_CHECK_PROJECT_EXISTS,
  body,
  res,
});
