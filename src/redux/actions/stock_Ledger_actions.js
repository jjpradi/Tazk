import {
  CREATE_STOCK_LEDGER,
  LIST_STOCK_LEDGER,
  GET_ID_STOCK_LEDGER,
  EDIT_STOCK_LEDGER,
  DELETE_STOCK_LEDGER,
  // RECEIVED_LEDGER
} from '../actionTypes';
import StockLedgerService from '../../services/stockledger_services';
import {ListLoad, FailLoad, ErrorAlert} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const createStockLedgerAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    createAction(
      StockLedgerService,
      CREATE_STOCK_LEDGER,
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
    //   const res = await StockLedgerService.create(data);
    //   if (res.data.affectedRows === 1)
    //    CreateAlert(dispatch)
    //   dispatch({
    //     type: CREATE_STOCK_Ledger,
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

export const listStockLedgerAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const ress = await StockLedgerService.LedgerReceived();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (ress.status === 200) {
        dispatch({
          type: LIST_STOCK_LEDGER,
          payload: ress.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidStockLedgerAction = (id) => async (dispatch) => {
  try {
    const res = await StockLedgerService.get(id);
    dispatch({
      type: GET_ID_STOCK_LEDGER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(StockLedgerService, GET_ID_STOCK_Ledger, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateStockLedgerAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    updateAction(
      StockLedgerService,
      EDIT_STOCK_LEDGER,
      dispatch,
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    );

    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLedgerService.update(id, data);
    //   if (res.data.changedRows === 1)
    //     UpdateAlert(dispatch)
    //   dispatch({
    //     type: EDIT_STOCK_Ledger,
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

export const deleteStockLedgerAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    deleteAction(
      StockLedgerService,
      DELETE_STOCK_LEDGER,
      dispatch,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLedgerService.delete(id);
    //   if (res.status === 200 && res.statusText === "OK")
    //   DeleteAlert(dispatch)
    //   dispatch({
    //     type: DELETE_STOCK_Ledger,
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
