import {
  CREATE_INVENTORY,
  LIST_INVENTORY,
  LIST_INVENTORY_BY_ID,
  GET_ID_INVENTORY,
  DELETE_INVENTORY,
  TOTAL_INVENTORY_COUNT,
  //stock transfer
  GET_ID_STOCKTRANSFER,
  EDIT_STOCKTRANSFER,
  STOCK_TRANSFER_LIST,
  FILTER_STOCK_TRANSFER_LIST,
  //stock receiver
  STOCK_RECEIVER_LIST,
  GET_ID_STOCK_RECEIVER,
  GET_DATE_INVENTORY,
  GET_INVENTORY_GRANDTOTAL,
  GET_INVENTORY_NONMOVE,
  GET_INVENTORY_LOCATE,
  DELETE_STOCK_TRANSFER,
  GET_AVAILABLE_STOCK,
  STOCK_AGEING_REPORT,
  TOTAL_STOCK_AGEING_COUNT,
  GET_SEARCH_DATA,
  SET_SEARCH_INVENTORY,
  GET_SEARCH_DATA_STOCK_TRANSFER,
  SET_SEARCH_STOCKTRANSFER,
  GET_SEARCH_STOCK_RECEIVE,
  SET_SEARCH_STOCK_RECEIVE,
  SET_SEARCH_CLOSING_STOCK,
  GET_SEARCH_CLOSING_STOCK,
  GET_SEARCH_AGEING_REPORT,
  SET_SEARCH_AGEING_REPORT_STOCK,
  TRANSFER_RECEIVER_DAILYREPORT,
  INVENTORY_EXPORT_DATA,
  FILTER_STOCK_RECEIVE_LIST,
  SUPPLIER_INVOICE_LIST,
  EXPORT_SCRAB,
} from '../actionTypes';
import Inventoryservice from '../../services/inventory_services';
// import { ListLoad, FailLoad, UpdateAlert, ErrorAlert , CreateAlert , DeleteAlert } from './load';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert,
  NotAvailableAlert,
  stockTransferWarning,
} from './load';

export const createInventoryAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    response,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.create(
        data,
        employee_id,
        headerLocationId,
      );
      // if (res.data.affectedRows === 1)
      //

      if (res.data.status === 'Lot ID or Lot Number cannot be null for stock transfer') {
        stockTransferWarning(dispatch, res.data.status)

      }
      else if(res.data.responsecode === 500 && res.data.status ==='Some Product Not Available'){
        NotAvailableAlert(dispatch)
        if (response) {
          response(500);
        }
      }else{
      dispatch({
        type: SET_SEARCH_STOCKTRANSFER,
        payload: res.data,
      });
      if (response) {
        response(res.status);
      }
      CreateAlert(dispatch);
      successmsg(sample);
      }
      // if (setModalStatusHandler) {
      //   setselectData(type, true)
      // }
      // FailLoad(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   setModalStatusHandler,
      // );
     
      //  return Promise.resolve(res.data.data);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      // FailLoad(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   setModalStatusHandler,
      // );
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const listInventoryByIdAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.postById(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_INVENTORY_BY_ID,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_INVENTORY_COUNT,
          payload: res.data.numRows,
        });
        dispatch({
          type: GET_INVENTORY_GRANDTOTAL,
          payload: res.data.grandTotal,
        });

        return Promise.resolve('API_FINISHED');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.resolve('API_FINISHED');
      //}
    }
  };

export const listInventoryAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportCallBack,
  ) =>
  async (dispatch) => {
    try {
      //  ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getAll(employee_id, headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: LIST_INVENTORY,
          payload: res.data,
        });
        if (exportCallBack) {
          exportCallBack(res.data);
        }

        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      //  FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportCallBack) {
        exportCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
      //}
    }
  };

export const transferreceiverDailyreport =
  (headerLocationId, date, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getdailyreporttransferreceiver(
        headerLocationId,
        date,
      );
      if (res.status === 200) {
        dispatch({
          type: TRANSFER_RECEIVER_DAILYREPORT,
          payload: res.data,
        });

        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);

      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
      //}
    }
  };

export const listClosingStockDateAction =
  (
    date,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getDate(
        date,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: GET_DATE_INVENTORY,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }

        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getbyidInventoryAction = (id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.getInventory(id);
    dispatch({
      type: GET_ID_INVENTORY,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const updateInventoryAction =
  (id, data, resCallback) => async (dispatch) => {
    try {
      const res = await Inventoryservice.update(id, data);
      //  if (res.data.changedRows === 1)
      UpdateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_STOCK_RECEIVE,
        payload: res.data,
      });
      dispatch({
        type: TOTAL_INVENTORY_COUNT,
        payload: res.data.numRows,
      });
      if (resCallback) {
        resCallback(res.status);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const deleteInventoryAction = (id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.delete(id);
    if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
    dispatch({
      type: DELETE_INVENTORY,
      payload: res.data.data,
    });
    dispatch({
      type: TOTAL_INVENTORY_COUNT,
      payload: res.data.numRows,
    });
    return Promise.resolve(res.data.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject('API_FINISHED_ERROR');
  }
};

///STOCK TRANSFER

export const liststocktransferAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getStocktransfer(
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: STOCK_TRANSFER_LIST,
          payload: res.data,
        });
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const filterStocktransferAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.filterStocktransfer(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: FILTER_STOCK_TRANSFER_LIST,
          payload: res.data,
        });
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const filterStockReceiveAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.filterStocktransfer(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: FILTER_STOCK_RECEIVE_LIST,
          payload: res.data,
        });
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updatestocktransferAction = (id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.update(id);
    if (res.data.changedRows === 1) UpdateAlert(dispatch);
    dispatch({
      type: EDIT_STOCKTRANSFER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject(err);
  }
};

export const getbyidstocktransferAction = (id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.get(id);
    dispatch({
      type: GET_ID_STOCKTRANSFER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
  }
};

///STOCK receiver

export const liststockreceiverAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getStockreceive();
      if (res.status === 200) {
        dispatch({
          type: STOCK_RECEIVER_LIST,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
    }
  };

export const getbyidStockReceiverAction = (id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.getStockreceiveId(id);
    dispatch({
      type: GET_ID_STOCK_RECEIVER,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
  }
};

export const listInvManageAction =
  (payload, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getNonmoveCategory(payload);
      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_NONMOVE,
          payload: res.data,
        });
        response(res)
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const listlocateproductAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportCallBack,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getlocateproduct(
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: GET_INVENTORY_LOCATE,
          payload: res.data,
        });
        if (exportCallBack) {
          exportCallBack(res.data);
        }
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportCallBack) {
        exportCallBack([]);
      }
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const deleteStocktransferAction =
  (id, data, employee_id, headerLocationId) => async (dispatch) => {
    try {
      const res = await Inventoryservice.deleteStocktransfer(
        id,
        data,
        employee_id,
        headerLocationId,
      );

      if (res.data.changedRows === 1) dispatch;

      if (res.data.changedRows === 1) dispatch;
      const data1 = {
        searchString: '',
        rowsPerPage: 25,
        pageNum: 0,
        employeeId: employee_id,
        locationId: headerLocationId,
        tempData : {
          initiatedFromDate:'',
          initiatedToDate:'',
          receivedToDate:'',
          receivedFromDate:'',
          destination_locationId:'',
          source_locationId:'',
          product_id: ''
        }
     }
      const res1 = await Inventoryservice.paginate(data1, employee_id, headerLocationId);
      // dispatch({
      //   type: DELETE_STOCK_TRANSFER,
      //   payload: res.data,
      // });
      dispatch({
        type: SET_SEARCH_STOCKTRANSFER,
        payload: res1.data,
      });
      return Promise.resolve(res1.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

export const getAvailableStockAction = (headerLocationId, employee_id) => async (dispatch) => {
  try {
    const res = await Inventoryservice.getAvailableStock(headerLocationId, employee_id);
    dispatch({
      type: GET_AVAILABLE_STOCK,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const getStockAgeingReportAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getStockAgeingReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: STOCK_AGEING_REPORT,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_STOCK_AGEING_COUNT,
          payload: res.data.numRows,
        });
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const exportstockagingAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Inventoryservice.getStockAgeingReport(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

// export const searchinventoryAction = (employee_id,headerLocationId,data,setModalTypeHandler,setLoaderStatusHandler,result) => async (dispatch) => {
//   try {
//     const res = await Inventoryservice.getsearchdata(employee_id,headerLocationId,data);
//     dispatch({
//       type: GET_SEARCH_DATA,
//       payload: res.data,
//     });
//     result(res.data)
//     return Promise.resolve(res.data);
//   } catch (err) {
//     ErrorAlert(dispatch, err);
//     // }
//     return Promise.reject("API_FINISHED_ERROR");
//   }
// };

export const paginationinventoryAction =
  (
    employee_id,
    headerLocationId,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    result,
  ) =>
  async (dispatch) => {
    try {
      const res = await Inventoryservice.getsearchdata(
        employee_id,
        headerLocationId,
        data,
      );
      dispatch({
        type: SET_SEARCH_INVENTORY,
        payload: res.data,
      });
      if (result) {
      result(res.data.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  
export const supplierInvoiceListAction =
(
  data,response
) =>
async (dispatch) => {
  try {
    const res = await Inventoryservice.supplierInvoiceList(
      data,
    );
    
    if (res.status === 200) {
      dispatch({
        type: SUPPLIER_INVOICE_LIST,
        payload: res.data,
      });
    }
  

    if (response) {
      // console.log("ress",res.data)
      response(res.data)
    }
    // result(res.data)
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const searchinventoryAction = (
  data,
  setModalTypeHandler,
  setLoaderStatusHandler,
) => {
  return {
    type: GET_SEARCH_DATA,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

export const set_searchinventoryAction = (data) => {
  return {
    type: SET_SEARCH_INVENTORY,
    payload: data,
  };
};

export const set_searchstocktransferAction = (data) => {
  return {
    type: SET_SEARCH_STOCKTRANSFER,
    payload: data,
  };
};

export const searchstocktransferAction = (
  val,
  setModalTypeHandler,
  setLoaderStatusHandler,
) => {
  return {
    type: GET_SEARCH_DATA_STOCK_TRANSFER,
    data: val,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};
// stock receive.........................................................................

//action
export const getSearchStockReceiveAction = (
  body,
  setModalTypeHandler,
  setLoaderStatusHandler,
) => {
  return {
    type: GET_SEARCH_STOCK_RECEIVE,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

//state
export const setSearchStockReceiveAction = (data) => {
  return {
    type: SET_SEARCH_STOCK_RECEIVE,
    payload: data,
  };
};

// closing stock
export const getSearchClosingStockAction = (
  body
) => {
  return {
    type: GET_SEARCH_CLOSING_STOCK,
    body
  };
};

export const setSearchClosingStockAction = (data) => {
  return {
    type: SET_SEARCH_CLOSING_STOCK,
    payload: data,
  };
};
//stock agingreport
export const getSearchAgeingReportAction = (
  body,
  setModalTypeHandler,
  setLoaderStatusHandler,
) => {
  return {
    type: GET_SEARCH_AGEING_REPORT,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

export const setSearchAgeingReportAction = (data) => {
  return {
    type: SET_SEARCH_AGEING_REPORT_STOCK,
    payload: data,
  };
};

export const inventoryExportAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportCallBack,
  ) =>
  async (dispatch) => {
    try {
      const res = await Inventoryservice.inventoryExport(
        data,
        employee_id,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: INVENTORY_EXPORT_DATA,
          payload: res.data,
        });
        if (exportCallBack) {
          exportCallBack(res.data);
        }
        return Promise.resolve('API_FINISHED_SUCCESS');
      }
    } catch (err) {
      if (exportCallBack) {
        exportCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
    

    export const stockAgeingReportPaginationAction =(data) =>async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Inventoryservice.pagination(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_AGEING_REPORT_STOCK,
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

    export const ClosingStockFinalAction = (data) => async (dispatch) => {
      try {
        const res = await Inventoryservice.closingaction(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_CLOSING_STOCK,
            payload: res.data,
          });
          return Promise.resolve("API_FINISHED_SUCCESS");
        }
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
};
    
    export const stockTransferPaginateAction = (data, employeeId, headerLocationId) => async (dispatch) => {
      try {
        const res = await Inventoryservice.paginate(data, employeeId, headerLocationId);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_STOCKTRANSFER,
            payload: res.data,
          });
          return Promise.resolve("API_FINISHED_SUCCESS");
        }
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
};
    
    export const stockReceivePaginateAction = (data) => async (dispatch) => {
      try {
        const res = await Inventoryservice.getSearchStockReceive(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_STOCK_RECEIVE,
            payload: res.data,
          });
          return Promise.resolve("API_FINISHED_SUCCESS");
        }
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

  export const scrabExportAction = (data,response) => async (dispatch) => {
      try {
        const res = await Inventoryservice.scrabExport(data);
        if (res.status === 200) {
          dispatch({
            type: EXPORT_SCRAB,
            payload: res.data,
          });
        if(response){
          response(res.data); 
        }
      
          return Promise.resolve("API_FINISHED_SUCCESS");
        }
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
};

// Backward-compatible alias used in older imports
export const listclosingstocklimitdata = listClosingStockDateAction;
