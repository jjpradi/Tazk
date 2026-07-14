import {
  CREATE_TAX_RATE,
  LIST_TAX_RATE,
  GET_ID_TAX_RATE,
  EDIT_TAX_RATE,
  DELETE_TAX_RATE,
  SET_SEARCH_TAX_RATE,
  GET_SEARCH_TAX_RATE,
} from '../actionTypes';
import TaxRateservice from '../../services/taxrate_services';
import {ListLoad, FailLoad, ErrorAlert} from './load';
import {createAction, deleteAction, updateAction} from './actions';

// export const createTaxRateAction =
//   (
//     data,
//     setModalStatusHandler,
//     setselectData,
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     sample,
//   ) =>
//   async (dispatch) => {
//     createAction(
//       TaxRateservice,
//       LIST_TAX_RATE,
//       dispatch,
//       data,
//       setModalStatusHandler,
//       setselectData,
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//       sample,
//       'product',
//     );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await TaxRateservice.create(data);
    //   if (res.data.affectedRows === 1) {
    //     dispatch({
    //       type: CREATE_TAX_RATE,
    //       payload: res.data.data,
    //     });
    //     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //     if (setModalStatusHandler) {
    //       setModalStatusHandler(false)
    //       setselectData('product', true)
    //     }
    //     setTimeout(() => {
    //       CreateAlert(dispatch)
    //     }, 0);
    //   } else {
    //     FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //     if (setModalStatusHandler) {
    //       setModalStatusHandler(false)
    //     }
    //     // alertResponce(res.data.status, 'error')
    //   }
    //   return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   return Promise.reject(err);
    // }
  // };

  export const createTaxRateAction =
  ( data,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,) => async (dispatch) => {
    try {
      const res = await TaxRateservice.create(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_TAX_RATE,
          payload: res.data.data,
        });
       
        if(sample){
          sample(false)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listTaxRateAction =
  (setModalTypeHandler, setLoaderStatusHandler, data, exportDataCallBack) => async (dispatch) => {
    try {
      const res = await TaxRateservice.getAll(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_TAX_RATE,
          payload: res.data,
        });
        
        if (exportDataCallBack) {
          exportDataCallBack(res.data.data);
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

export const getbyidTaxRateAction = (id) => async (dispatch) => {
  try {
    const res = await TaxRateservice.get(id);
    dispatch({
      type: GET_ID_TAX_RATE,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");

  }
};

export const updateTaxRateAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    updateAction(
      TaxRateservice,
      LIST_TAX_RATE,
      dispatch,
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await TaxRateservice.update(id, data);
    //   if (res.data.changedRows === 1)
    //     UpdateAlert(dispatch)
    //   dispatch({
    //     type: EDIT_TAX_RATE,
    //     payload: res.data.data,
    //   });
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   return Promise.reject(err);
    // }
  };

export const deleteTaxRateAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
 
      const res = await TaxRateservice.delete(id);
 
      if (res.status === 200) {
        dispatch({
          type: DELETE_TAX_RATE,
          payload: id, 
        });
 
        // DeleteAlert(dispatch);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return true; 
      }
 

      // throw new Error("Delete failed");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await TaxRateservice.delete(id);
    //   if (res.status === 200 && res.statusText === "OK")
    //    DeleteAlert(dispatch)
    //   dispatch({
    //     type: DELETE_TAX_RATE,
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

export const setSearchTaxRatesAction = (data) => {
  return {
    type: SET_SEARCH_TAX_RATE,
    payload: data
  }
};

export const getSearchTaxRatesAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_TAX_RATE,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};