import {
  LIST_PAYMENT_METHOD,
  CREATE_PAYMENT_METHOD,
  GET_ID_PAYMENT_METHOD,
  EDIT_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  LIST_PAYMENT_TYPE,
  GET_SEARCH_PAYMENT_METHOD,
  SET_SEARCH_PAYMENT_METHOD,
  BILL_RECEIVABLES_INVOICE,
  RECEIVABLES_LASTSYNC,
  GET_UNMATCHED_RECORDS,
  SEND_OTP,
  VERIFY_PAYMENTOTP
} from '../actionTypes';
import PaymentMethodservice from '../../services/payment_method_services';
import {
  ErrorAlert,
  FailLoad,
  ListLoad,
  successmsg,
  errormsg,
  CreateAlert,
  ExistAlert,
  CannotDeleteAlert,
  DeleteAlert,
  ExistPaymentNameAlert,
} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const listPaymentMethodAction =
  (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentMethodservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_PAYMENT_METHOD,
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
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPaymentTypeDetails =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await PaymentMethodservice.getPaymentType();
      if (res.status === 200) {
        dispatch({
          type: LIST_PAYMENT_TYPE,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createPaymentMethodAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    setModalStatusHandler,
    setselectData,
  ) =>
  async (dispatch) => {
    // createAction(PaymentMethodservice, CREATE_PAYMENT_METHOD, dispatch, data,  setModalStatusHandler, setselectData, setModalTypeHandler, setLoaderStatusHandler, sample,'paymentMethod')
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentMethodservice.create(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_PAYMENT_METHOD,
          payload: res.data,
        });
        successmsg(sample);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        ExistPaymentNameAlert(dispatch);
        // successmsg(sample)
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
    }
  };

export const getbyidPaymentMethodAction = (id) => async (dispatch) => {
  try {
    const res = await PaymentMethodservice.get(id);
    dispatch({
      type: GET_ID_PAYMENT_METHOD,
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

export const updatePaymentMethodAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    return updateAction(
      PaymentMethodservice,
      EDIT_PAYMENT_METHOD,
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

  export const deletePaymentMethodAction =  (id, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try {
      const res = await PaymentMethodservice.delete(id);

      if(res.data.message && res.data.message === 'CANNOT DELETE'){
        CannotDeleteAlert(dispatch, res.data);
      }
      if (res.status === 200 && res.data.message !== 'CANNOT DELETE') {
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_PAYMENT_METHOD,
          payload: res.data.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const get_searchPaymentMethodAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:GET_SEARCH_PAYMENT_METHOD,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  
  export const set_searchPaymentMethodAction = (data) => {
    return {
      type:SET_SEARCH_PAYMENT_METHOD,
      payload:data
    }
  };

  export const paymentMethodPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await PaymentMethodservice.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_PAYMENT_METHOD,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
export const billReceivablesAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    setModalStatusHandler,
    setselectData,
  ) =>
  async (dispatch) => {
    try {

      const payloadData = {
        ...data, 
        location_id: data.location_id || null,
      };

      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentMethodservice.billReceivables(payloadData);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: BILL_RECEIVABLES_INVOICE,
          payload: {
            ...res.data,
            location_id: payloadData.location_id, 
          },
        });
        successmsg(sample);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        ExistAlert(dispatch);
        // successmsg(sample)
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
    }
    };
  
  
  export const lastSyncAction = (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      const res = await PaymentMethodservice.lastSync();
      if (res.status === 200) {
        dispatch({
          type: RECEIVABLES_LASTSYNC,
          payload: res.data,  
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
export const sendOtpAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PaymentMethodservice.sendOtp(data);
      if (res.status === 200) {
        dispatch({
          type: SEND_OTP,
          payload: res.data,
        });

        if (response) {
          response(res.data)
        }

        console.log('res.data', res.data);

        if (res.data === 'This number is already registered to a company') {
          ErrorAlert(dispatch, {message: "This number is already registered to a company."});
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const verifyOtpAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await PaymentMethodservice.verifyOtp(data);
      console.log("API Response:", res.data); 
      if (res.status === 200) {
        dispatch({
          type: VERIFY_PAYMENTOTP,
          payload: res.data,
        });

        if (response) {
          response(res.data.status)
        }

        if (res.data.status === 'Invalid OTP') {
          ErrorAlert(dispatch, res.data);
        }

       return Promise.resolve(res.data.status);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getUnmatchedRecordsAction = (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      const res = await PaymentMethodservice.getUnmatchedRecords();
      if (res.status === 200) {
        dispatch({
          type: GET_UNMATCHED_RECORDS,
          payload: res.data,  
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};