import {
  LIST_STOCK_RECONCILATE,
  LIST_RECONCILATE_PRODUCTS,
  LIST_CHECK_RECONCILATE_PRODUCTS,
  LIST_STOCK_LOT_ITEMS,
  LIST_SYSTEM_STOCK_PRODUCTS,
  MOVE_STOCK_RECONCILATE,
  GET_SEARCH_RECONCILATE_DATA,
  SET_SEARCH_RECONCILATE_DATA,
  RECONCILIATE_DETAILS_DATA,
  SAVE_RECONCILATE,
  UPADTE_RECONCILED_DATA
} from '../actionTypes';
import StockReconcilateService from '../../services/stockReconcilate_services';
import {createAction, deleteAction, updateAction} from './actions';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  stockReconciliateUpdateAlert,
  stockReconciliateErrAlert,
  createSalaryUpdateAlert,
} from './load';

//   export const createStockLocationAction = (data,employee_id, headerLocationId,setModalTypeHandler,setLoaderStatusHandler,sample) => async (dispatch) => {
//    // createAction(StockLocationService, CREATE_STOCK_LOCATION, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
//     try {
//       ListLoad(setModalTypeHandler,setLoaderStatusHandler)
//       const res = await StockReconcilateService.create(data, employee_id, headerLocationId);
//       if (res.data.affectedRows === 1)
//        CreateAlert(dispatch)
//       dispatch({
//         type: CREATE_STOCK_LOCATION,
//         payload: res.data.data,
//       });
//       successmsg(sample)
//       FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//       return Promise.resolve(res.data.data);
//     } catch (err) {
//       FailLoad(setModalTypeHandler,setLoaderStatusHandler)
//       ErrorAlert(dispatch,err)
//       errormsg(sample)
//       return Promise.reject(err);
//     }
//   };

export const listStockReconcilateAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockReconcilateService.getAll(
        data
      );
      //   const res = await StockReconcilateService.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_STOCK_RECONCILATE,
          payload: res.data,
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

export const listReconcilateProductsAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await StockReconcilateService.getAll(employee_id,headerLocationId);
      const res = await StockReconcilateService.getReconcilateProducts();
      if (res.status === 200) {
        dispatch({
          type: LIST_RECONCILATE_PRODUCTS,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
    }
  };

export const listCheckReconcilateProductsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await StockReconcilateService.getAll(employee_id,headerLocationId);
      const res = await StockReconcilateService.getCheckReconcilateProductsData(
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_CHECK_RECONCILATE_PRODUCTS,
          payload: res.data,
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

  export const saveReconcilateAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await StockReconcilateService.getAll(employee_id,headerLocationId);
      const res = await StockReconcilateService.saveReconcilate(
        data,
      );
      if (res.status === 200) {
         dispatch({
         type: SAVE_RECONCILATE,
         payload: res.data,
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

export const listStockLotItemsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      // const res = await StockReconcilateService.getAll(employee_id,headerLocationId);
      const res = await StockReconcilateService.getStockLotItemsById();
      if (res.status === 200) {
        dispatch({
          type: LIST_STOCK_LOT_ITEMS,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
    }
  };

export const MoveProducts =
  (data, msg) => async (dispatch) => {
    try {
      const res = await StockReconcilateService.movereconcilation(data);
      if (res.status === 200) {
        stockReconciliateUpdateAlert(dispatch, msg)
        dispatch({
          type: RECONCILIATE_DETAILS_DATA,
          payload: res.data,
        });
      }
      if (res.data === 'Lot Number Exists') {
        createSalaryUpdateAlert(dispatch, res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (msg === "Moved to Scrap Location") {
        stockReconciliateErrAlert(dispatch, "Create Scrap Location")
      } else {
        ErrorAlert(dispatch, err);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

//   export const listStockLocationSequenceAction = (data, setLoaderStatusHandler, employee_id, headerLocationId) => async (dispatch) => {
//     try {
//       ListLoad(true, setLoaderStatusHandler)
//       const res = await StockLocationService.getAllSequence(employee_id, headerLocationId,data);
//       if (res.status === 200) {
//         dispatch({
//           type: LIST_STOCK_LOCATION,
//           payload: res.data,
//         });
//       }
//       FailLoad(true, setLoaderStatusHandler)
//     } catch (err) {
//       FailLoad(true, setLoaderStatusHandler)
//       ErrorAlert(dispatch,err)
//     }
//   };

//   export const getbyidStockLocationAction = (id,setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler)
//       const res = await StockLocationService.get(id);
//       dispatch({
        // type: GET_ID_STOCK_LOCATION,
//         payload: res.data,
//       });
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler)
//       return Promise.resolve(res.data);
//     } catch (err) {
//       // if(err.response?.status === 500) {
//       //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
//       // }
//       // else{
//       FailLoad(setModalTypeHandler. setLoaderStatusHandler)
//       ErrorAlert(dispatch,err)
//       // }
//     }
//   };

//   export const updateStockLocationAction = (id, data,setModalTypeHandler,setLoaderStatusHandler,sample) => async (dispatch) => {

//     updateAction(StockLocationService, EDIT_STOCK_LOCATION, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler,sample )

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
//   };

//   export const deleteStockLocationAction = (id,setModalTypeHandler,setLoaderStatusHandler) => async (dispatch) => {

//     deleteAction(StockLocationService, DELETE_STOCK_LOCATION, dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
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
//   };

//   export const allListStockLocation = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler)
//       const res = await StockLocationService.getAlllist();
//       //  let rem = await res.data.map((m) => {
//       //   return delete m['tableData'] ? m :null
//       // }).filter( (f) => f !==null )
//       if (res.status === 200) {
//         dispatch({
//           type: ALL_LIST_STOCK_LOCATIN,
//           payload: res.data,
//         });
//       }
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler)

//     } catch (err) {
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler)
//       ErrorAlert(dispatch,err)
//       // }
//     }
//   };

export const listSystemStockAction =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockReconcilateService.getSystemStockDetails(
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_SYSTEM_STOCK_PRODUCTS,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const searchreconcilateAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_RECONCILATE_DATA,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  
  export const set_searchreconcilateAction = (data) => {
    return {
      type: SET_SEARCH_RECONCILATE_DATA,
      payload: data
    }
};
  
export const stockReconcilatePaginationAction = (data) => async (dispatch) => {
  try {
    const res = await StockReconcilateService.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_RECONCILATE_DATA,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const reconciliateDetailsAction = (reconciliate_id) => async (dispatch) => {
  try {
    if (reconciliate_id === false) {
      dispatch({
        type: RECONCILIATE_DETAILS_DATA,
        payload: {},
      });
    } else {
      const res = await StockReconcilateService.reconciliateDetails(reconciliate_id);
      if (res.status === 200) {
        dispatch({
          type: RECONCILIATE_DETAILS_DATA,
          payload: res.data,
        });
      }
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateReconciliateDetailsAction = (updatedData, id) => {
  return{
    type: UPADTE_RECONCILED_DATA,
    payload: {
      updatedData,
      id
    }
  }
}

export const checkLotAvailableAction = (payload, response) => async(dispatch) => {
  try{
    const res = await StockReconcilateService.checkLotAvailable(payload)
    if(res.status === 200){
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}
