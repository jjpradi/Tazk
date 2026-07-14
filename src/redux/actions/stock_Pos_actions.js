import {
  CREATE_STOCK_POS,
  LIST_STOCK_POS,
  GET_ID_STOCK_POS,
  EDIT_STOCK_POS,
  DELETE_STOCK_POS,
  // RECEIVED_POS
} from '../actionTypes';
import StockPosService from '../../services/stockpos_services';
import {ListLoad, FailLoad, ErrorAlert} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const createStockPosAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    createAction(
      StockPosService,
      CREATE_STOCK_POS,
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
    //   const res = await StockPosService.create(data);
    //   if (res.data.affectedRows === 1)
    //    CreateAlert(dispatch)
    //   dispatch({
    //     type: CREATE_STOCK_Pos,
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

export const listStockPosAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const ress = await StockPosService.PosReceived();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (ress.status === 200) {
        dispatch({
          type: LIST_STOCK_POS,
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

export const getbyidStockPosAction = (id) => async (dispatch) => {
  try {
    const res = await StockPosService.get(id);
    dispatch({
      type: GET_ID_STOCK_POS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(StockPosService, GET_ID_STOCK_Pos, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateStockPosAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    updateAction(
      StockPosService,
      EDIT_STOCK_POS,
      dispatch,
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    );

    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockPosService.update(id, data);
    //   if (res.data.changedRows === 1)
    //     UpdateAlert(dispatch)
    //   dispatch({
    //     type: EDIT_STOCK_Pos,
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

export const deleteStockPosAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    deleteAction(
      StockPosService,
      DELETE_STOCK_POS,
      dispatch,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockPosService.delete(id);
    //   if (res.status === 200 && res.statusText === "OK")
    //   DeleteAlert(dispatch)
    //   dispatch({
    //     type: DELETE_STOCK_Pos,
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
