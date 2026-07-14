import {GET_USER_ROLE, GET_LOGIN_TOKEN, GET_LOGIN_ROLE, GET_CHILD_MODULES, GET_TOKEN_BY_EMPID, GET_EVENT_NAME, ROUTES_CONFIG,USER_RIGHTS, REPORTS_CONFIG, GET_BANK_REPORT_COLUMNS, UPDATE_BANK_REPORT_COLUMNS} from '../actionTypes';
import UserRoleService from '../../services/userRole_services';
import {ErrorAlert, FailLoad, ListLoad} from './load';
import Roleservice from '../../services/role_services';

export const getUserRoleAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserRoleService.getAll();
      dispatch({
        type: GET_USER_ROLE,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
 
export const getBankReportColumnsAction = () => async (dispatch) => {
  try {
    const res = await UserRoleService.getBankReportColumns();
    dispatch({
      type: GET_BANK_REPORT_COLUMNS,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateBankReportColumnsAction = (data) => async (dispatch) => {
  try {
    const res = await UserRoleService.updateBankReportColumns(data);
    dispatch({
      type: UPDATE_BANK_REPORT_COLUMNS,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    return Promise.reject("API_FINISHED_ERROR");
  }
};

  export const getEventNameAction =
 
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    console.log('actionsssss')
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserRoleService.getevent();
      dispatch({
        type: GET_EVENT_NAME,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const getLoginRoleAction =
  (id, result, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    console.log('notifyData111')
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserRoleService.getUsername(id);
      const res1 = await UserRoleService.getToken();
      const res2 = await Roleservice.notifyData();
      console.log(res, res1, res2, 'notifyData1112')
      dispatch({
        type: GET_LOGIN_ROLE,
        payload: res.data,
      });
      if (result) {
        let token = [];
        res1.data.map((m) => {
          return token.push(m.token);
        });
        result(res.data[0].role_name, token, res2.data);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
    };

export const getTokenByEmpId =
  (empId, result) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await UserRoleService.getUsername(id);
      const res1 = await UserRoleService.getTokenByEmpId(empId);
      const res2 = await Roleservice.notifyData();

      if (res1.status === 200 && res2.status === 200) {
        if (result) {
          let token =  res1.data.map(entry => entry.token);
          result(token, res2.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");  
    }
    };

export const getAdminTokenByCompany =
  (resultAdmin) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await UserRoleService.getUsername(id);
      const res1 = await UserRoleService.getTokenByCompany();
      const res2 = await Roleservice.notifyData();

      if (res1.status === 200 && res2.status === 200) {
        if (resultAdmin) {
          // let token = [res1.data[0].token];
          let token =  res1.data.map(entry => entry.token);
          resultAdmin(token, res2.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
    };
  
//     export const getTokenByEmpId = (tokenByEmpId) => async (dispatch) => {
//       try {
//         const res = await UserRoleService.getTokenByEmpId();
//         if (tokenByEmpId) {
//           tokenByEmpId(res.data);
//         }
//       } catch (err) {
//         ErrorAlert(dispatch, err);
//       }
// };
    

export const getLoginTokenAction = () => async (dispatch) => {
  try {
    const res = await UserRoleService.getToken();
    dispatch({
      type: GET_LOGIN_TOKEN,
      payload: res.data,
    });
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};


export const getchildmoduleAction = (type) => async (dispatch) => {
  try {
    const res = await UserRoleService.getchildModule(type);
    dispatch({
      type: GET_CHILD_MODULES,
      payload: res.data,
    });
  } catch (err) {
    ErrorAlert(dispatch, err);
  }
};

export const getRoutesConfigAction = (data) => async (dispatch) => {
  try {
    const res = await UserRoleService.getRoutesConfigService(data);
    dispatch({
      type: ROUTES_CONFIG,
      payload: res.data,
    });
  } catch (err) {
    if(err?.response?.data?.message === 'Invalid Routes Config'){
      return ErrorAlert(dispatch, { message: `Invalid Routes Config` });
    }
    ErrorAlert(dispatch, err);
  }
};

export const getUserRightsAction = () => async (dispatch) => {
  try {
    const res = await UserRoleService.getUserRightsService();
    dispatch({
      type: USER_RIGHTS,
      payload: res.data,
    });
  } catch (err) {
    if(err?.response?.data?.message === 'Invalid'){
      return ErrorAlert(dispatch, { message: `Invalid` });
    }
    ErrorAlert(dispatch, err);
  }
};

export const getReportsBasedOnCategoryAction = () => async (dispatch) => {
  try {
    const res = await UserRoleService.getReportsBasedOnCategory();
    dispatch({
      type: REPORTS_CONFIG,
      payload: res.data,
    });
  } catch (err) {
    if(err?.response?.data?.message === 'Invalid Routes Config'){
      return ErrorAlert(dispatch, { message: `Invalid Routes Config` });
    }
    ErrorAlert(dispatch, err);
  }
};
