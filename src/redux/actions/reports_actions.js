import {
  CREATE_REPORTS,
  GET_ALL_REPORTS,
  GET_BY_ID_REPORTS,
  EDIT_REPORTS,
  DELETE_REPORTS,
  REPORT_VIEW_DATA,
  BRAND_REPORT,
  CHEQUE_REPORT,
  DAILY_REPORT_STATUS,
  GET_DAILY_REPORT_STATUS,
  CASH_BOX_STATUS,
  GET_SEARCH_CHEQUE_REPORT,
  SET_SEARCH_CHEQUE_REPORT,
  SET_SEARCH_BRAND_REPORT,
  GET_SEARCH_BRAND_REPORT,
  CASHBOX_ADJUSTMENT_REPORT,
  RELIEVED_EMPLOYEE,
  GET_SEARCH_RELIEVED_EMPLOYEE_DETAILS,
  SET_SEARCH_RELIEVED_EMPLOYEE_DETAILS,
  MISSING_LOT,
  EXCESS_LOT,
  SET_DEVICE_REGISTER,
  GET_DEVICE_REGISTER,
  SET_DEVICE_DEREGISTER,
  GET_FRAUD_LOGS,
  SET_FRAUD_LOGS,
  GET_LOGIN_AUDIT_LOGS,
  SET_LOGIN_AUDIT_LOGS,
  SET_SEARCH_SCRAP_LOT_REPORT,
  GET_SEARCH_SCRAP_LOT_REPORT
} from '../actionTypes';
import ReportsService from '../../services/reports_services';
import ReportsViewService from '../../services/report_view_services';
import {
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
} from './load';

export const createReportsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.create(data);
      if (res.data.affectedRows === 1 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_REPORTS,
          payload: res.data.data,
        });
      } else if (res.data.status === 'exists') {
        ErrorAlert(dispatch, {message: 'Already Exists'});
      }

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      
      return Promise.resolve(res.data.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   createToken(ReportsService, CREATE_REPORTS, dispatch, data, alertResponce)
      // }
      // else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listReportsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      //const auth = await Jwtservice.create(token1);
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      dispatch({
        type: GET_ALL_REPORTS,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getToken(ReportsService, GET_ALL_REPORTS, dispatch)
      // }else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidReportsAction = (id) => async (dispatch) => {
  try {
    const res = await ReportsService.get(id);
    dispatch({
      type: GET_BY_ID_REPORTS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(ReportsService, GET_BY_ID_REPORTS, dispatch, id, alertResponce)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateReportsAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.update(id, data);
      if (res.data.changedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: EDIT_REPORTS,
        payload: res.data.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   updateToken(ReportsService, EDIT_REPORTS, dispatch, data, id, alertResponce)
      // }
      // else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteReportsAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_REPORTS,
        payload: res.data.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   deleteToken(ReportsService, DELETE_REPORTS, dispatch, id, alertResponce)
      // }
      // else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

export const viewReportsAction =
  (type, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      //const auth = await Jwtservice.create(token1);
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsViewService.get(type);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      dispatch({
        type: REPORT_VIEW_DATA,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getToken(ReportsService, REPORT_VIEW_DATA, dispatch)
      // }else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  // export const brandReportAction =
  // (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  //   try {
  //     //const auth = await Jwtservice.create(token1);
  //     ListLoad(setModalTypeHandler, setLoaderStatusHandler);
  //     const res = await ReportsService.getbrandReport(data);
  //     //  let rem = await res.data.map((m) => {
  //     //   return delete m['tableData'] ? m :null
  //     // }).filter( (f) => f !==null )
  //     dispatch({
  //       type: BRAND_REPORT,
  //       payload: res.data,
  //     });
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  //   } catch (err) {
  //     // if(err.response?.status === 500) {
  //     //   getToken(ReportsService, GET_ALL_REPORTS, dispatch)
  //     // }else{
  //     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  //     // }
 
  export const brandReportAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.getbrandReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: BRAND_REPORT,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const chequeReportAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.getchequeReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: CHEQUE_REPORT,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const createdailyReportStatusAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.dailyreportStatus(data);
      if (res.data.affectedRows === 1 ) {
        CreateAlert(dispatch);
        dispatch({
          type: DAILY_REPORT_STATUS,
          payload: res.data,
        });
      } 

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listdailyReportStatusAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ReportsService.getdailyreportstatus(data);
      if (res.data) {
        // CreateAlert(dispatch);
        dispatch({
          type: GET_DAILY_REPORT_STATUS,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      
    }
  };

  export const cashbox_statusAction =
  (id) => async (dispatch) => {
    try {
      const res = await ReportsService.getcashbox_status(id);
      if (res.data) {
        dispatch({
          type: CASH_BOX_STATUS,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const cashbox_adjustmentReportAction =
  (headerLocationId, date) => async (dispatch) => {
    try {
      const res = await ReportsService.getcashboxadjustmententrydailyreport(headerLocationId, date);
      if (res.data) {
        dispatch({
          type: CASHBOX_ADJUSTMENT_REPORT,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const searchChequeReportState = (data) => {
    return {
      type: SET_SEARCH_CHEQUE_REPORT,
      payload: data
    }
  };
  
  export const searchChequeReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_CHEQUE_REPORT,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  export const setSearchBrandReportState = (data) => {
    return {
      type: SET_SEARCH_BRAND_REPORT,
      payload: data
    }
  };
  
  export const getSearchBrandReportAction = (body) => {
    return {
      type: GET_SEARCH_BRAND_REPORT,
      body
    }
};
  
export const pendingChequeReportPaginationAction =(data) =>async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ReportsService.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_CHEQUE_REPORT,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const BrandReportFinal = (data) => async (dispatch) => {
  try {
    const res = await ReportsService.brandaction(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_BRAND_REPORT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getRelievedEmployeeDetailsAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.getRelievedEmployeeDetails(payload);
      if (res.data) {
        dispatch({
          type: RELIEVED_EMPLOYEE,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getMissingLotAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.getMissingLot(payload);
      if (res.data) {
        dispatch({
          type: MISSING_LOT,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getExcessLotAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.getExcessLot(payload);
      if (res.data) {
        dispatch({
          type: EXCESS_LOT,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const setSearchRelievedEmployeeDetails = (data) => {
    return {
      type: SET_SEARCH_RELIEVED_EMPLOYEE_DETAILS,
      payload: data
    }
  };
  
  export const getSearchRelievedEmployeeDetails = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_RELIEVED_EMPLOYEE_DETAILS,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
};

export const DeviceRegisterReportAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.DeviceRegisterReport(payload);
      if (res.data) {
        dispatch({
          type: GET_DEVICE_REGISTER,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const getDeviceRegisterReportAction = (data) => {
    return {
      type: GET_DEVICE_REGISTER,
      payload: data
    }
  };
  
  export const setDeviceRegisterReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: SET_DEVICE_REGISTER,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
};
export const DeviceDeRegisterAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.DeviceDeRegister(payload);
      if (res.data) {
        dispatch({
          type: SET_DEVICE_DEREGISTER,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
export const fraudLogsAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.fraudLogs(payload);
      if (res.data) {
        dispatch({
          type: GET_FRAUD_LOGS,
          payload: res.data,
        });
      } 
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getfraudLogsAction = (data) => {
    return {
      type: GET_FRAUD_LOGS,
      payload: data
    }
  };
  
  export const setfraudLogsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: SET_FRAUD_LOGS,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
};

export const loginAuditLogsAction =
  (payload) => async (dispatch) => {
    try {
      const res = await ReportsService.loginAuditLogs(payload);
      if (res.data) {
        dispatch({
          type: GET_LOGIN_AUDIT_LOGS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getLoginAuditLogsAction = (data) => {
  return {
    type: GET_LOGIN_AUDIT_LOGS,
    payload: data
  }
};

export const setLoginAuditLogsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: SET_LOGIN_AUDIT_LOGS,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const getScrapLotAction = (payload) => async(dispatch) => {
  try{
    const res = await ReportsService.getScrapLot(payload)
    if(res.status === 200){
      dispatch({
        type: SET_SEARCH_SCRAP_LOT_REPORT,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const setSearchScrapLotsAction = (data) => {
  return{
    type: SET_SEARCH_SCRAP_LOT_REPORT,
    payload: data
  }
}

export const getSearchScrapLotsActions = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return{
    type: GET_SEARCH_SCRAP_LOT_REPORT,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
}