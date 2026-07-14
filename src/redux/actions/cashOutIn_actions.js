import {
  LIST_CASH_OUT_IN,
  CREATE_CASH_OUT_IN,
  GET_ID_CASH_OUT_IN,
  EDIT_CASH_OUT_IN,
  LIST_PAYINOUT_TOTAL,
  DELETE_CASH_OUT_IN,
  CREATE_CONTRA,
  GET_ALL_CASH_OUT_IN_REPORT,
  GET_ALL_PAYMENT_TYPE_REPORT,
  GET_ALL_CASH_OUT_IN_REPORT_CONTRA,
  GET_PAYIN_AMOUNT,
  GET_CASH_OUT_IN_DENOMINATION_VALIDATION,
  UPDATE_CASH_OUT_IN,
  UPDATE_CONTRA,
  GET_PAY_IN_OUT_CONTRA_SEQUENCE,
} from '../actionTypes';
import CashOutInservice from '../../services/cashOutIn_services';
import {createAction, deleteAction, updateAction} from './actions';
import cashOutIn_services from '../../services/cashOutIn_services';
import {
  ErrorAlert,
  FailLoad,
  ListLoad,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
} from './load';

export const listCashOutInAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashOutInservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_CASH_OUT_IN,
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

export const listpayinoutdata =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashOutInservice.getpayinout();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_PAYINOUT_TOTAL,
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

export const createCashOutInAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample, response) =>
  async (dispatch) => {
    return createAction(
      CashOutInservice,
      CREATE_CASH_OUT_IN,
      dispatch,
      data,
      null,
      null,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      null,
      null,
      response,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLocationService.create(data);
    //   if (res.data.affectedRows === 1)
    //    CreateAlert(dispatch)
    //   dispatch({
    //     type: CREATE_STOCK_LOCATION,
    //     payload: res.data.data,
    //   });
    //   successmsg(sample)
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   errormsg(sample)
    //   return Promise.reject(err);
    // }
  };

export const createContraAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await cashOutIn_services.createcontra(data);
      if (response) {
        response(res.status, res.data);
      }
      
      if (res.status === 200 && res.data.status !== 'exists') {
        dispatch({
          type: CREATE_CONTRA,
          payload: res.data.data,
        });
        //FailLoad(setModalTypeHandler, setLoaderStatusHandler)

        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // setTimeout(() => {
        CreateAlert(dispatch);

        // }, 0);
        successmsg(sample);
      } else if (res.data.status === 'exists') {
        ErrorAlert(dispatch, {message: 'Already Exists'});
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      //    return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidCashOutInAction = (id) => async (dispatch) => {
  try {
    const res = await CashOutInservice.get(id);
    dispatch({
      type: GET_ID_CASH_OUT_IN,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateCashOutInAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    updateAction(
      CashOutInservice,
      EDIT_CASH_OUT_IN,
      dispatch,
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    );

    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLocationService.update(id, data);
    //   if (res.data.changedRows === 1)
    //     UpdateAlert(dispatch)
    //   dispatch({
    //     type: EDIT_STOCK_LOCATION,
    //     payload: res.data.data,
    //   });
    //   successmsg(sample)
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   //return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   errormsg(sample)
    //   //return Promise.reject(err);
    //   // }
    // }
  };

export const deleteCashOutInAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    return deleteAction(
      CashOutInservice,
      DELETE_CASH_OUT_IN,
      dispatch,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLocationService.delete(id);
    //   if (res.status === 200 && res.statusText === "OK")
    //   DeleteAlert(dispatch)
    //   dispatch({
    //     type: DELETE_STOCK_LOCATION,
    //     payload: res.data.data,
    //   });
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   // }
    // }
  };

export const getAllReportCashOutInAction =
  (employee_id, location_id, date) => async (dispatch) => {
    try {
      const res = await CashOutInservice.getallreport(
        employee_id,
        location_id,
        date,
      );
      dispatch({
        type: GET_ALL_CASH_OUT_IN_REPORT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

export const getAllPaymentReportAction = (data) => async (dispatch) => {
  try {
    const res = await CashOutInservice.getallpaymentreport(data);
    dispatch({
      type: GET_ALL_PAYMENT_TYPE_REPORT,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
    // }
  }
};

export const getAllReportCashOutInContraAction =
  (employee_id, location_id, date) => async (dispatch) => {
    try {
      const res = await CashOutInservice.getallreportcontra(
        employee_id,
        location_id,
        date,
      );
      dispatch({
        type: GET_ALL_CASH_OUT_IN_REPORT_CONTRA,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

  export const getPayInAmountAction =
  (data) => async (dispatch) => {
    try {
      const res = await CashOutInservice.getpayinamount(data);
      dispatch({
        type: GET_PAYIN_AMOUNT,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getDenominationValidationByIdAction = (id, response) => async (dispatch) => {
    try {
      const res = await CashOutInservice.getdenominationvalidation(id);
      dispatch({
        type: GET_CASH_OUT_IN_DENOMINATION_VALIDATION,
        payload: res.data,
      });
      if(response){
        response(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateCashInOutAction = (data, response) => async (dispatch) => {
  try {
    const res = await CashOutInservice.updateCashOutIn(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_CASH_OUT_IN,
        payload: res.data,
      });
      if (typeof response === 'function') {
        response(res.data);
      }
      if (res?.data?.message === 'Transaction updated successfully') {
        UpdateAlert(dispatch);
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");

  }
};

export const updateContraAction = (data, response) => async (dispatch) => {
  try {
    const res = await CashOutInservice.updatecontra(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_CONTRA,
        payload: res.data,
      });
      if (typeof response === 'function') {
        response(res.data);
      }
      if (res?.data?.message === 'Contra transaction updated successfully') {
        UpdateAlert(dispatch);
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");

  }

};

export const getPayInOutContraSequenceAction = (params) => async(dispatch) => {
  try {
    const res = await CashOutInservice.getPayInOutContraSequence(params)
    if (res.status === 200) {
      dispatch({
        type: GET_PAY_IN_OUT_CONTRA_SEQUENCE,
        payload: res.data.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR")
  }
}