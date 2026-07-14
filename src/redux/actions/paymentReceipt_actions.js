import {
  LIST_PAYMENT_RECEIPT,
  CREATE_PAYMENT_RECEIPT,
  GET_ID_PAYMENT_RECEIPT,
  EDIT_PAYMENT_RECEIPT,
  EDIT_STATUS_PAYMENT_RECEIPT,
  DELETE_PAYMENT_RECEIPT,
  LIST_EXPENSE,
  TOP3,
  LIST_PAYMENT_RECEIPT_GET_ALL,
  GET_PAYMENT_RECEIPT_MONTH_DATA,
  GET_PAYMENT_RECEIPT_TOTAL_AMOUNT,
  SET_SEARCH_PAYMENT_REPORT,
  GET_SEARCH_PAYMENT_REPORT,
  SET_SEARCH_CREDIT_DEBIT,
  GET_SEARCH_CREDIT_DEBIT,
  LIST_MANUAL_NOTES,
  TRIGGER_PAYINOUT_MODAL,
  GET_PAYIN_PAYOUT_BY_ID
} from '../actionTypes';
import PaymentReceiptservice from '../../services/paymentReceipt_services';
import {ErrorAlert, FailLoad, ListLoad, UpdateAlert} from './load';
import {createAction, deleteAction, updateAction} from './actions';

// export const listPaymentReceiptAction = (setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {
//     try {
//         ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//         const res = await PaymentReceiptservice.getAll();
//         //  let rem = await res.data.map((m) => {
//         //   return delete m['tableData'] ? m :null
//         // }).filter( (f) => f !==null )
//         if(res.status===200){
//         dispatch({
//             type: LIST_PAYMENT_RECEIPT,
//             payload: res.data,
//         });
//        }
//        FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//     } catch (err) {
//             FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//             ErrorAlert(dispatch,err)
//          //}
//     }
// };

export const createPaymentReceiptAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    createAction(
      PaymentReceiptservice,
      CREATE_PAYMENT_RECEIPT,
      dispatch,
      data,
      null,
      null,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
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

export const getbyidPaymentReceiptAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentReceiptservice.get(id);
      dispatch({
        type: GET_ID_PAYMENT_RECEIPT,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updatePaymentReceiptAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {

    updateAction(
      PaymentReceiptservice,
      EDIT_PAYMENT_RECEIPT,
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

export const updatePaymentReceiptStatusAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentReceiptservice.updateStatus(id);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_STATUS_PAYMENT_RECEIPT,
          payload: res.data.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
    }
      // successmsg(sample)
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // errormsg(sample)
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deletePaymentReceiptAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    return deleteAction(
      PaymentReceiptservice,
      DELETE_PAYMENT_RECEIPT,
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

//date API

export const listPaymentReceiptAction =
  (from, to, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentReceiptservice.getAll(from, to);
      if (res.status === 200) {
        dispatch({
          type: LIST_PAYMENT_RECEIPT,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

export const listPaymentReceiptdateAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentReceiptservice.getDate(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_PAYMENT_RECEIPT,
          payload: res.data,
          
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
//expense list

export const listexpenseAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      //ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await PaymentReceiptservice.expense();
      if (res.status === 200) {
        dispatch({
          type: LIST_EXPENSE,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      //FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const top3Action =
  (location_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PaymentReceiptservice.top3(location_id);
      if (res.status === 200) {
        dispatch({
          type: TOP3,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPaymentReceiptdataAllAction = () => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await PaymentReceiptservice.getData();
    if (res.status === 200) {
      dispatch({
        type: LIST_PAYMENT_RECEIPT_GET_ALL,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");

    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");

  }
};

export const getPaymentReceiptMonthDataAction =
  (from, to) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await PaymentReceiptservice.getMonthData(from, to);
      if (res.status === 200) {
        dispatch({
          type: GET_PAYMENT_RECEIPT_MONTH_DATA,
          payload: res.data,
        });
      return Promise.resolve("API_FINISHED_SUCCESS");

      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");

    }
  };

export const getPaymentReceiptTotalAmountAction = () => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await PaymentReceiptservice.getTotalAmountData();
    if (res.status === 200) {
      dispatch({
        type: GET_PAYMENT_RECEIPT_TOTAL_AMOUNT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");

    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");

  }
};

export const get_searchPaymentreportAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_PAYMENT_REPORT,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchPaymentreportAction = (data) => {
  return {
    type:SET_SEARCH_PAYMENT_REPORT,
    payload:data
  }
};


export const get_searchCreditdebitAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_CREDIT_DEBIT,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};


export const set_searchCreditdebitAction = (data) => {
  return {
    type:LIST_MANUAL_NOTES,
    payload:data
  }
};

export const triggerPayInOutModal = (shouldOpen) => {
  return {
    type: TRIGGER_PAYINOUT_MODAL,
    payload: shouldOpen,
  }
};

export const getPayinPayoutByIdAction = (id, type) => async (dispatch) => {
  try { 
    const res = await PaymentReceiptservice.getPayinPayoutById(id, type)
    if(res.status === 200) {
      dispatch({
        type : GET_PAYIN_PAYOUT_BY_ID,
        payload : res.data
      })
    }  
    return Promise.resolve("API_FINISHED_SUCCESS") 
  }
  catch(err) { 
    ErrorAlert(dispatch, err)  
    return Promise.resolve("APO_FINISHED_ERROR") 
  }
}
