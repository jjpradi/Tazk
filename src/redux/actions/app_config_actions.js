import {GET_APP_CONFIG_DATA, UPDATE_APP_CONFIG_DATA,GET_PREFIX_CONFIG_DATA, SMS_MAIL_CONFIG_UPDATE, GET_APP_CONFIG_WITH_COMPANY_INFO, GET_CHECK_EXISTS, SET_CHECK_EXISTS, UPDATE_APP_CONFIG_WITH_COMPANY_INFO, UPDATE_SMS_DATA, GET_MANUAL_ATT_EMP, UPDATE_INVENTORY_CONFIG, GET_EINVOICE_DETAILS, GET_APP_CONFIG_DATA_BASED_ON_TYPE, GET_SUB_COMPANY_DETAILS, CREATE_SUB_COMPANY_DETAILS, UPDATE_SUB_COMPANY_DETAILS, SHORT_CODE_EXIST, UPDATE_USERNAME} from '../actionTypes';
import AppConfig from '../../services/app_config_sevices';
import {CreateAlert, DeleteAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert} from './load';
import { OpenalertActions } from './alert_actions';

export const getAppConfigDataAction =
  (setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // ListLoad(true, setLoaderStatusHandler)
      const res = await AppConfig.getAppConfig();
      if (res.status === 200) {
        dispatch({
          type: GET_APP_CONFIG_DATA,
          payload: res.data,
        });
        if (response) {
          response(res.data);
        }
        // FailLoad(true, setLoaderStatusHandler)
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // FailLoad(true, setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAppConfigDataBasedOnTypeAction =
  (type,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // ListLoad(true, setLoaderStatusHandler)
      const res = await AppConfig.getAppConfigBasedOnType(type);
      if (res.status === 200) {
        dispatch({
          type: GET_APP_CONFIG_DATA_BASED_ON_TYPE,
          payload: res.data,
        });
        if (response) {
          response(res.data);
        }
        // FailLoad(true, setLoaderStatusHandler)
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // FailLoad(true, setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAppConfigWithCompanyInfoAction =
  (setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // ListLoad(true, setLoaderStatusHandler)
      const res = await AppConfig.getAppConfigWithCompnayInfo();
      if (res.status === 200) {
        dispatch({
          type: GET_APP_CONFIG_WITH_COMPANY_INFO,
          payload: res.data,
        });
        if (response) {
          response(res.data);
        }
        // FailLoad(true, setLoaderStatusHandler)
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // FailLoad(true, setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_checkExistsAction= (body, types,res) =>{
    return {
      type:GET_CHECK_EXISTS,
      body,
      types,
      res
    }
  };

  export const set_checkExistsAction = (data) => {
    return {
      type:SET_CHECK_EXISTS,
      payload:data
    }
  };
  export const createSmsDataAction =
  (data, response, setLoaderStatusHandler, setModalTypeHandler) =>
  async (dispatch) => {
    try {
      const res = await AppConfig.createSms(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: UPDATE_SMS_DATA,
          payload: res.data,
        });
        if (response) {
          response(res.data.token);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const updateAppConfigAction =
  (data, response, setLoaderStatusHandler, setModalTypeHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setLoaderStatusHandler, setModalTypeHandler);
      const res = await AppConfig.updateAppConfig(data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: UPDATE_APP_CONFIG_DATA,
          payload: res.data,
        });
        if (response) {
          response(res.data.token);
        }
      }
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateAppConfigWithCompanyInfoAction =
  (data, response, setLoaderStatusHandler, setModalTypeHandler, type) =>
  async (dispatch) => {
    try {
      // ListLoad(setLoaderStatusHandler, setModalTypeHandler);
      const res = await AppConfig.updateAppConfigWithCompanyInfo(data);
      if (res.status === 200) {
        if (res.data?.success === false) {
          dispatch(
            OpenalertActions({
              msg: res.data.message || "Something went wrong",
              severity: "warning",
            })
          );
          if (response) {
            response(res);
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        }

        if(type !== 'detailpage') {
          UpdateAlert(dispatch);
        }

        dispatch({
          type: UPDATE_APP_CONFIG_WITH_COMPANY_INFO,
          payload: res.data,
        });
        if (response) {
          response(res);
        }
      }
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateInvoiceAction =
  (data, response, setLoaderStatusHandler, setModalTypeHandler, type) =>
  async (dispatch) => {
    try {
      const res = await AppConfig.updateInvoiceDetailInfo(data);
      if (res.status === 200) {
        if(type !== 'detailpage') {
        UpdateAlert(dispatch);
        }
        dispatch({
          type: UPDATE_APP_CONFIG_WITH_COMPANY_INFO,
          payload: res.data,
        });
        if (response) {
          response(res);
        }
      }
      return Promise.resolve(res.status);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateUsernameAction = (data) => async (dispatch) => {
  try {
    const res = await AppConfig.updateUsername(data);

    dispatch({
      type: UPDATE_USERNAME,
      payload: res.data,
    });

    return res.data;

  } catch (err) {
    ErrorAlert(dispatch, err);
    throw err;
  }
};

  export const getprefixAction =
  (data, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setLoaderStatusHandler, setModalTypeHandler);
      const res = await AppConfig.getprefix(data);
      if (res.status === 200) {
        // UpdateAlert(dispatch);
        dispatch({
          type: GET_PREFIX_CONFIG_DATA,
          payload: res.data,
        });
        if (response) {
          response(res.data.token);
        }
      }
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setLoaderStatusHandler, setModalTypeHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const updateMailConfigActions = (data) => async (dispatch) => {
  try {
    const res = data?.id
      ? await AppConfig.updateMailConfig(data)
      : await AppConfig.createMail(data);

    dispatch({
      type: SMS_MAIL_CONFIG_UPDATE,
      payload: res.data,
    });

    return res.data;

  } catch (err) {
    ErrorAlert(dispatch, err);
    throw err;
  }
};


  export const getManualAttendanceEmpActions = (data) => async (dispatch) => {
    try {
      const res = await AppConfig.getManualAttendanceEmp(data);
      dispatch({
        type: GET_MANUAL_ATT_EMP,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateInventoryConfigAction = (data) => async (dispatch) => {
    try {
      const res = await AppConfig.updateInventoryConfig(data);
      dispatch({
        type: UPDATE_INVENTORY_CONFIG,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEinvoiceDetailsAction = (data) => async (dispatch) => {
    try {
      const res = await AppConfig.getEinvoiceDetails(data);
      dispatch({
        type: GET_EINVOICE_DETAILS,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const getSubcompanydetailsAction = (data, response) => async (dispatch) => {
    try {
      const res = await AppConfig.getSubCompanyDetails(data);
      dispatch({
        type: GET_SUB_COMPANY_DETAILS,
        payload: res.data,
      });
      if(response) {
        response(res)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const createSubcompanydetailsAction = (data, response) => async (dispatch) => {
    try {
      const res = await AppConfig.createSubCompanyDetails(data);
     
      dispatch({
        type: CREATE_SUB_COMPANY_DETAILS,
        payload: res.data,
      });
      if(response){
         response(res.status)
      }
      CreateAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateSubcompanydetailsAction = (id, data, response) => async (dispatch) => {
  try {
    const res = await AppConfig.updateSubCompanyDetails(data, id);
    dispatch({
      type: UPDATE_SUB_COMPANY_DETAILS,
      payload: res.data,
    });
    if (response) {
      response(res.status)
    }
    UpdateAlert(dispatch)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleteSubcompanydetailsAction = (id, response) => async (dispatch) => {
  try {
    const res = await AppConfig.deleteSubCompanyDetails(id);
    dispatch({
      type: UPDATE_SUB_COMPANY_DETAILS,
      payload: res.data,
    });
    if (response) {
      response(res.status)
    }
    DeleteAlert(dispatch)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const checkShortCodeExistAction = (data, response) => async (dispatch) => {
  try {
    const res = await AppConfig.checkShortCodeExist(data)
    if(res.status === 200) {
      dispatch({
        type: SHORT_CODE_EXIST,
        payload: res.data
      })
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err) {
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

// Backward-compatible alias used in older imports
export const updateSmsDataAction = createSmsDataAction;
