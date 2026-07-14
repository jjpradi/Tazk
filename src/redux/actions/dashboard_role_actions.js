import {
  GET_DASHBOARD_ROLE_DATA,
  GETALL_DASHBOARD,
  EDIT_DASHBOARD,
  UPDATE_DASHBOARD_LIST,
  GET_DASHBOARD_LIST_BY_ROLE,
  WIDGETS_DETAILS,
  DASHBOARD_LAYOUTS,
  UPDATE_DASHBOARD_LAYOUTS,
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

import DashboardRoleService from '../../services/dashboard_role_services';
import {
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  CreateAlert,
} from './load';


export const getDashboardRoleDataAction = (id, response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await DashboardRoleService.getDashboardRoleData(id);
    if (res?.status === 200) {
      dispatch({
        type: GET_DASHBOARD_ROLE_DATA,
        payload: res?.data,
      });
      if(response){
        response(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listDashboardByRoleAction = (id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await DashboardRoleService.getDashboardListByRole(id);
    if (res.status === 200) {
      dispatch({
        type: GET_DASHBOARD_LIST_BY_ROLE,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateDashboardListAction = (data) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await DashboardRoleService.updateDashboardList(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_DASHBOARD_LIST,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listDashboardAction = () => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await DashboardRoleService.getdashboardlist();
    if (res.status === 200) {
      dispatch({
        type: GETALL_DASHBOARD,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const editDashboardAction = (id, data) => async (dispatch) => {
  try {
    //  if (res.data.changedRows === 1)
    const res = await DashboardRoleService.editdashboarddata(data);
    UpdateAlert(dispatch);
    dispatch({
      type: EDIT_DASHBOARD,
      payload: res.data.data,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const widgetsDetailsAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.widgetsDetails();
    // UpdateAlert(dispatch);
    dispatch({
      type: WIDGETS_DETAILS,
      payload: res.data
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const getDashboardLayoutActions = (data) => async (dispatch) => {
  try {
    const res = await DashboardRoleService.getDashboardLayout(data);
    dispatch({
      type: DASHBOARD_LAYOUTS,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const reset_dashboardLayoutAction = (data, result) => async (dispatch) => {
  try {
    const res = await DashboardRoleService.resetDashboardLayout(data);
    // dispatch({
    //   type: DASHBOARD_LAYOUTS,
    //   payload: res.data
    // });
    if (res.status === 200 ) {
      if (result) {
        result(res.data);
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const update_dashboardLayoutAction = (body) =>{
  return {
    type:UPDATE_DASHBOARD_LAYOUTS,
    body
  }
};

export const set_dashboardLayoutAction = (data) => {
  return {
    type:DASHBOARD_LAYOUTS,
    payload:data
  }
};


export const setDashboardPollingTimerIdsAction = (id) => (dispatch) => {
  dispatch({
    type: DASHBOARD_API_POLL_TIMER_IDS,
    payload: id
  });
}

export const resetDashboardPollingTimerIdsAction = (data=[]) => (dispatch) => {
  dispatch({
    type: RESET_DASHBOARD_API_POLL_TIMER_IDS,
    payload : []
  });
}


export const salaryBasedDepartmentAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.salaryBasedDepartment();
    dispatch({
      type: SALARY_BASED_DEPARTMENT,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const salaryBasedCategoryAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.salaryBasedCategory();
    dispatch({
      type: SALARY_BASED_CATEGORY,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const genderPercentageAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.genderPercentage();
    console.log(res,"kkk");
    dispatch({
      type: GENDER_PERCENTAGE,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const departmentBasedEmpAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.departmentBasedEmp();
    dispatch({
      type: DEPT_BASED_EMPLOYEE,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const overallAttPercentageAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.overallAttPercentage();
    dispatch({
      type: OVERALL_ATT_PERCENTAGE,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const leaveTypePercentageAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.leaveTypePercentage();
    dispatch({
      type: LEAVE_TYPE_DISTRIBUTION,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const attBasedDepartmentAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.attBasedDepartment();
    dispatch({
      type: ATTENDANCE_BASED_DEPARTMENT,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const attendanceStatisticsAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.attendanceStatistics();
    dispatch({
      type: ATTENDANCE_STATISTICS,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getDashboardDataAction = () => async (dispatch) => {
  try {
    const res = await DashboardRoleService.getDashboardData();
    dispatch({
      type: DASHBOARD_DATA,
      payload: res.data
    });

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    console.error("Error details:", err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

// Backward-compatible alias used in older imports
export const salaryByCategoryAction = salaryBasedCategoryAction;

