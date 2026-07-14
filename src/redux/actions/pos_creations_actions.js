import {
  CREATE_POS_CREATION,
  LIST_POS_CREATION,
  GET_ID_POS_CREATION,
  TOTAL_POS_CREATION_COUNT,
  EDIT_POS_CREATION,
  DELETE_POS_CREATION,
  // LIST_STOCK_LEDGER,
  LIST_STOCK_POS,
  LOCATION_LIST_POS,
  GET_VOUCHER_TYPE,
  POST_VOUCHER_TYPE,
  GETALL_VOUCHER_TYPE,
  DELETE_VOUCHER_TYPE,
  UPDATE_VOUCHER_TYPE,
  SET_SEARCH_POS_CREATION,
  GET_SEARCH_POS_CREATION
} from '../actionTypes';
import PosCreationservice from '../../services/pos_creation_services';
import StockPosService from '../../services/stockpos_services';
import {
  CannotDeleteAlert,
  commonAlert,
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
} from './load';

export const createPosCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, id, datas) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.create(data);
      const ress = await StockPosService.update(id, datas);
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_POS_CREATION,
          payload: res.data,
        });
        dispatch({
          type: LIST_STOCK_POS,
          payload: ress.data.data,
        });
        // if (sample) {
        //   sample(false);
        // }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        
      } else if (res.data.status === 'exists') {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        commonAlert(dispatch, "Already Exists");
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPosCreationAction =
  (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_POS_CREATION,
          payload: res.data,
        });
        dispatch({
          type: TOTAL_POS_CREATION_COUNT,
          payload: res.data.numRows,
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
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const locationposAction =
  (headerLocationId, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.locationpos(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: LOCATION_LIST_POS,
          payload: res.data,
        });
        dispatch({
          type: TOTAL_POS_CREATION_COUNT,
          payload: res.data.numRows,
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
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidPosCreationAction = (id) => async (dispatch) => {
  try {
    const res = await PosCreationservice.get(id);
    dispatch({
      type: GET_ID_POS_CREATION,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if (err.response?.status === 500) {
    //     getbyidToken(PosCreationservice, GET_ID_SCHEMES, dispatch, id)
    // }
    // else {
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updatePosCreationAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    //  updateAction(PosCreationservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.update(id, data);
      if (res.status === 200 && res.data.affectedRows > 0) {
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_POS_CREATION,
          payload: res.data.data,
        });
      } else {
        ErrorAlert(dispatch, {message: 'Not exists'});
      }

      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deletePosCreationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await PosCreationservice.delete(id);
      if (res.status === 200) {
        if (res.data.message && res.data.message === 'CANNOT DELETE') {
          CannotDeleteAlert(dispatch, res.data);
        } else {
          DeleteAlert(dispatch);
          dispatch({
            type: SET_SEARCH_POS_CREATION,
            payload: res.data,
          }); 
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getVouchertypeAction =
  (data) => async (dispatch) => {
    try {
      const res = await PosCreationservice.getType(data);
      if (res.status === 200) {
        dispatch({
          type: GET_VOUCHER_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const insertInvoicetypeAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,sample) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.insert(data);
      if (res.status === 200) {
        CreateAlert(dispatch);

        dispatch({
          type: POST_VOUCHER_TYPE,
          payload: res.data,
        });
        if (sample) {
          sample(true);
        }
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getallInvoicetypeAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.getAllinvoice(data);
      if (res.status === 200) {
        dispatch({
          type: GETALL_VOUCHER_TYPE,
          payload: res.data,
        });
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const UpdateInvoicetypeAction =
  (id,data, setModalTypeHandler, setLoaderStatusHandler,sample) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.Updatenvoice(id,data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: UPDATE_VOUCHER_TYPE,
          payload: res.data,
        });
        if (sample) {
          sample(true);
        }
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const DeletenvoicetypeAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosCreationservice.deleteinvoice(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_VOUCHER_TYPE,
          payload: res.data,
        });
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_searchPoscreateAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_POS_CREATION,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  
  export const set_searchPoscreateAction = (data) => {
    return {
      type:SET_SEARCH_POS_CREATION,
      payload:data
    }
  };

  export const posCreationPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await PosCreationservice.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_POS_CREATION,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };