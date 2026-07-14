import {
  LIST_CASH_BOX_DENOMINATION,
  LIST_CASH_BOX,
  CREATE_CASH_BOX,
  EDIT_CASH_BOX,
  LIST_CASH_BOX_SUMMARY_DATA,
  CASH_IN_HAND,
  LIST_CASH_BOX_ADJUSTMENT,
  GET_BANK_ENQUIRY,
  CASH_IN_HAND_MONTH,
  CASH_BOX_LOCATION,
  DELETE_CASH_BOX,
  CASH_BOX_OPENING_CLOSING,
  CASH_BOX_PAYMENT_ENTRY,
  CASH_BOX_RECEIPT_ENTRY,
  LOCATIONCASH_BOX_DENOMINATION,
  LEDGER_AMOUNT_SUMMARY,
  GET_SEARCH_CASHBOX,
  SET_SEARCH_CASHBOX,
  GET_CONTRA_CASHBOX,
  CASH_IN_HAND_DETAILS,
  CASH_IN_HAND_DETAILS_BY_TRANSACTIONS,
  CASH_IN_BANK_CASH,
  CASH_AND_BANK_CONSOLIDATED_TOTALS,
  BANK_AND_CASH_ACCOUNTS,
  CASHBOX_CREDIT_DEBIT_HINT,
  CASH_AND_BANK_TRANSACTION_LIST
} from '../actionTypes';
import CashBox from '../../services/cash_box_services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  ExistAlert,
  CannotDeleteAlert,
  DeleteAlert
} from './load';

export const listCashBoxDenominationAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_CASH_BOX_DENOMINATION,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createCashBoxAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.createCashBox(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_CASH_BOX,
          payload: res.data,
        });
        responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        ExistAlert(dispatch);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createCashBoxAdjustmentAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.createCashBoxAdjustment(data);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_CASH_BOX,
          payload: res.data,
        });
        responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        ExistAlert(dispatch);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listCashBoxAction =
  (headerLocationId, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.getAllCashBoxByHeaderLocationId(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: LIST_CASH_BOX,
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

  export const listCashBoxLocationAction =
  (headerLocationId, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.getCashBoxLocation(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: CASH_BOX_LOCATION,
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

export const listCashBoxAdjustmentAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, headerLocationId) =>
  async (dispatch) => {
    try {
      //ListLoad(setModalTypeHandler,setLoaderStatusHandler)
      const res = await CashBox.getAllCashBoxAdjustment(id, headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: LIST_CASH_BOX_ADJUSTMENT,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      } //FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    } catch (err) {
      ErrorAlert(dispatch, err);
      //FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateCashBoxAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    //  updateAction(PosCreationservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.updateCashBox(id, data);
      if (res.status === 200 && res.data?.affectedRows > 0) {
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_CASH_BOX,
          payload: res.data.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      } else {
        ErrorAlert(dispatch, {message: 'Not exists'});
      }

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listCashBoxSummary = (id) => async (dispatch) => {
  try {
    const res = await CashBox.getCashBoxSummary(id);
    if (res.status === 200) {
      dispatch({
        type: LIST_CASH_BOX_SUMMARY_DATA,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listSessionBasedCashBoxSummary = (id) => async (dispatch) => {
  try {
    const res = await CashBox.getSessionBasedCashBoxSummary(id);
    if (res.status === 200) {
      dispatch({
        type: LIST_CASH_BOX_SUMMARY_DATA,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

//cash in hand

export const cashInHand =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.CashInHand();
      if (res.status === 200) {
        dispatch({
          type: CASH_IN_HAND,
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

    
export const CashInHandDetails =
(data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    // if (setLoaderStatusHandler) setLoaderStatusHandler(true);
    const res = await CashBox.CashInHandDetails(data);
    if (res.status === 200) {
      dispatch({
        type: CASH_IN_HAND_DETAILS,
        payload: res.data,
      });
      if (setLoaderStatusHandler) setLoaderStatusHandler(false);
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
//List balanceopening closing
export const balanceenquiryOpeningclosing =
  (date, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.getbalanceenquiry(date);
      if (res.status === 200) {
        dispatch({
          type: GET_BANK_ENQUIRY,
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

export const CashInHandDetailsByTransactionEntriesAction =
  (data) => async (dispatch) => {
    try {
      const res = await CashBox.CashInHandDetailsByTransactionEntries(data);
      if (res.status === 200) {
        dispatch({
          type: CASH_IN_HAND_DETAILS_BY_TRANSACTIONS,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }

    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const cashInHandMonthAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.cashInHandMonth(payload);
      if (res.status === 200) {
        dispatch({
          type: CASH_IN_HAND_MONTH,
          payload: res.data,
        });
        if(response) {
          response(res)
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

  export const cashInHandFiscalYearAction = (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.cashInHandFiscalYear(data);
      if (res.status === 200) {
        dispatch({
          type: CASH_IN_HAND_MONTH,
          payload: res.data,
        });
        if(response) {
          response(res)
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

  export const deleteCashBoxAction =
  (id, ledgerId, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.deleteCashBox(id, ledgerId);
      if(res.data.message && res.data.message === 'CANNOT DELETE'){
        CannotDeleteAlert(dispatch, res.data);
      }
      if(res.status === 200 && res.data.message !== 'CANNOT DELETE'){
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_CASH_BOX,
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

  export const cashboxOpeningClosing =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.cashboxOpeningClosing(data);
      if (res.status === 200 ) {
        dispatch({
          type: CASH_BOX_OPENING_CLOSING,
          payload: res.data,
        });
        //responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } 
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const cashboxPaymentEntry =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.cashboxPaymentEntry(data);
      if (res.status === 200 ) {
        dispatch({
          type: CASH_BOX_PAYMENT_ENTRY,
          payload: res.data,
        });
        //responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } 
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const cashboxReceiptEntry =
  (data, setModalTypeHandler, setLoaderStatusHandler, responseDialog) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CashBox.cashboxReceiptEntry(data);
      if (res.status === 200 ) {
        dispatch({
          type: CASH_BOX_RECEIPT_ENTRY,
          payload: res.data,
        });
        //responseDialog(true);
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } 
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationcashboxdenomination = (id, date) => async (dispatch) => {
    try {
      const res = await CashBox.locationcashboxdenomination(id, date);
      if (res.status === 200) {
        dispatch({
          type: LOCATIONCASH_BOX_DENOMINATION,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const GetledgerSummaryAction = (data) => async (dispatch) => {
    try {
      const res = await CashBox.GetledgerSummary(data);
      if (res.status === 200) {
        dispatch({
          type: LEDGER_AMOUNT_SUMMARY,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const get_searchCashBoxAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:GET_SEARCH_CASHBOX,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchCashBoxAction = (data) => {
    return {
      type:SET_SEARCH_CASHBOX,
      payload:data
    }
  };

  export const cashBoxPaginationAction = (data, exportDataCallBack) => async (dispatch) => {
    try {
      const res = await CashBox.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_CASHBOX,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data.data);
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
export const listContraCashBox = () => async (dispatch) => {
  try {
    const res = await CashBox.getContraCashBox();
    if (res.status === 200) {
      dispatch({
        type: GET_CONTRA_CASHBOX,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const CashInBankCash =
(data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    // if (setLoaderStatusHandler) setLoaderStatusHandler(true);
    const res = await CashBox.CashInBankCash(data);
    if (res.status === 200) {
      dispatch({
        type: CASH_IN_BANK_CASH,
        payload: res.data,
      });
      if (setLoaderStatusHandler) setLoaderStatusHandler(false);
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getBankAndCashAccountsAction = (payload, response) => async(dispatch) => {
  try{
    const res = await CashBox.getBankAndCashAccounts(payload)
    if(res.status === 200){
      dispatch({
        type: BANK_AND_CASH_ACCOUNTS,
        payload: res.data
      })
    }
    if(response){
      response(res.status)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getCreditDebitHintAction = (payload, response) => async(dispatch) => {
  try{
    const res = await CashBox.getCreditDebitHint(payload)
    if(res.status === 200){
      dispatch({
        type: CASHBOX_CREDIT_DEBIT_HINT,
        payload: res.data
      })
    }
    if(response){
      response(res.status, res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getConsolidatedTotalAmountsAction = (payload) => async(dispatch) => {
  try{
    const res = await CashBox.getConsolidatedTotalAmount(payload)
    if(res.status === 200){
      dispatch({
        type: CASH_AND_BANK_CONSOLIDATED_TOTALS,
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

export const getTransactionListAction = (payload, type, response) => async(dispatch) => {
  try{
    const res = await CashBox.getTransactionList(payload)
    if(res.status === 200){
      if(type !== 'export'){
        dispatch({
          type: CASH_AND_BANK_TRANSACTION_LIST,
          payload: res.data
        })
      }

      if(response){
        response(res.data.data)
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
