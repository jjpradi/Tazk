import {
  CREATE_LEDGER,
  // EDIT_LEDGER,
  LIST_LEDGER,
  // RECEIVED_LEDGER,
  LIST_STOCK_LEDGER,
  TOTAL_LEDGER_COUNT,
  GET_ID_LEDGER,
  EDIT_LEDGER,
  DELETE_LEDGER,
  LIST_PARENT_GROUP_LEDGER,
  GET_ALL_PARENT_LEDGER,
  GET_LEDGER_VOUCHERS,
  UPDATE_PARENT_LEDGER,
  LIST_LEDGER_PAGINATE,
  LIST_MIGRATION,
  LEDGER_MIGRATION,
  UPDATE_MIGRATION,
  CREATE_MIGRATION,
  LIST_ACCOUNT_GROUP,
  EXIST_UPDATE,
  OPENING_BAL_LEDGERS,
  ACCOUNT_GROUP,
  LEDGER_FILTER_DATA
} from '../actionTypes';
import Ledger from '../../services/ledger_services';
import StockLedgerService from '../../services/stockledger_services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  DeleteAlert,
  errormsg,
  UpdateAlert,
  successmsg,
  commonAlert,
  LedgerUsedAlert
} from './load';
import {deleteAction, updateAction} from './actions';

export const listLedgerAction =
  ( setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Ledger.getAll(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_LEDGER,
          payload: res.data,
        });
        dispatch({
          type: TOTAL_LEDGER_COUNT,
          payload: res.data.numRows,
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

export const listLedgerParentGroupAction = () => async (dispatch) => {
  try {
    const res = await Ledger.getParentWithGroupId();
    if (res.status === 200) {
      dispatch({
        type: LIST_PARENT_GROUP_LEDGER,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const createLedgerAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, id, datas) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Ledger.create(data);

      // const ress = await StockLedgerService.update(id,datas);

      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_LEDGER,
          payload: res.data,
        });
        dispatch({
          type: TOTAL_LEDGER_COUNT,
          payload: res.data.numRows,
        });
        // dispatch({
        //     type: LIST_STOCK_LEDGER,
        //     payload: ress.data,
        // });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      } 
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (err.response.status === 409 && err.response.data.status === 'CANNOT CREATE'){
        commonAlert(dispatch, "A new ledger cannot be created under an existing child ledger");
      }else{
        ErrorAlert(dispatch, err);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidLedgerAction = (id) => async (dispatch) => {
  try {
    const res = await Ledger.get(id);
    dispatch({
      type: GET_ID_LEDGER,
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

export const updateLedgerAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // updateAction(Ledger, EDIT_LEDGER, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler,sample )

    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Ledger.update(id, data);
      //   if (res.data.changedRows === 1)
      UpdateAlert(dispatch);
      dispatch({
        type: LIST_LEDGER_PAGINATE,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteLedgerAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    // deleteAction(Ledger, DELETE_LEDGER, dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Ledger.delete(id);
      //   if (res.status === 200 && res.statusText === "OK")
      if(res.data.status === 'ledger_used'){
        LedgerUsedAlert(dispatch)
      }
      else{
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_LEDGER,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_LEDGER_COUNT,
          payload: res.data.numRows,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listAllParentLedgerAction = () => async (dispatch) => {
  try {
    const res = await Ledger.getAllParentLedger();
    if (res.status === 200) {
      dispatch({
        type: GET_ALL_PARENT_LEDGER,
        payload: res.data,
      });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
export const updateAllParentLedgerAction = (data,setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {
  try {
    const res = await Ledger.updateAllParentLedger(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_PARENT_LEDGER,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  }
   catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listAllLedgerVouchersAction = (data,setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Ledger.getAllLedgerVouchers(data);
    if (res.status === 200) {
      dispatch({
        type: GET_LEDGER_VOUCHERS,
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


export const listLedgerPaginateAction = (data) => async (dispatch) => {
  try {
    const res = await Ledger.getPaginate(data);
    if (res.status === 200) {
      dispatch({
        type: LIST_LEDGER_PAGINATE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listMigrationAction = () => async (dispatch) => {
  try {
    const res = await Ledger.getMigration();
    dispatch({
      type: LIST_MIGRATION,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const ledgerMigrationNameAction = (data) => async (dispatch) => {
  try {
    const res = await Ledger.ledgerMigration(data);
    dispatch({
      type: LEDGER_MIGRATION,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateMigrationAction = (data) => async (dispatch) => {
  try {
    const res = await Ledger.updateMigration(data);
    dispatch({
      type: UPDATE_MIGRATION,
      payload: res.data,
    });
    UpdateAlert(dispatch);
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const craeteAccountsMigration = (data) => async (dispatch) => {
  try {
    const res = await Ledger.Createmigration(data);
    dispatch({
      type: CREATE_MIGRATION,
      payload: res.data,
    });
    CreateAlert(dispatch);
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listAccountGroup = (data) => async (dispatch) => {
  try {
    const res = await Ledger.listgroup(data);
    dispatch({
      type: LIST_ACCOUNT_GROUP,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const handleExistupdateAction = (data) => async (dispatch) => {
  try {
    const res = await Ledger.existUpdate(data);
    dispatch({
      type: EXIST_UPDATE,
      payload: res.data,
    });
    // UpdateAlert(dispatch);
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const createSundryAccounts = (data) => async (dispatch) => {
  try {
    const res = await Ledger.createSundry(data);
    dispatch({
      type: CREATE_MIGRATION,
      payload: res.data,
    });
    CreateAlert(dispatch);
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getOpeningBalActions = (type,response) => async (dispatch) => {
  try {
    const res = await Ledger.getOpeningBal(type);
    dispatch({
      type: OPENING_BAL_LEDGERS,
      payload: res.data,
    });
     if (response) {
          response(res.data);
        }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const openingBalPaymentAction = (data, callback) => async (dispatch) => {
  try {
    const res = await Ledger.openingBalPayment(data);
    dispatch({
      type: OPENING_BAL_LEDGERS,
      payload: res.data,
    });
    if(callback){
      callback()
    }
    UpdateAlert(dispatch);
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getAccountGroupAction = () => async(dispatch) => {
  try{
    const res = await Ledger.getAccountGroup()
    if(res.status === 200){
      dispatch({
        type: ACCOUNT_GROUP,
        payload: res.data
      })
    }
    return Promise.resolve(res.data);
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}

export const generalLedgerFilterDataAction = () => async(dispatch) => {
  try{
    const res = await Ledger.generalLedgerFilterData()
    if(res.status === 200){
      dispatch({
        type: LEDGER_FILTER_DATA,
        payload: res.data
      })
    }
    return Promise.resolve(res.data);
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}