import {
  LIST_POS_SALE,
  TOTAL_POSSALE_COUNT,
  GET_POS_SALE_REPORT,
  GET_POS_SALE_GRANDTOTAL,
  POS_SALE_BY_PAGINATION,
  TOTAL_SALE_BY_LOCATION,
  TOP_SALE_BY_BRAND,
  SALE_COMPARISON,
  TOTAL_SALE_BY_MONTH,
  TOTAL_SALE_BY_LOCATION_BAR,
  CANCEL_POS_SALE,
  TOTAL_SALE_BY_DAY,
  LAST_TEN_DAYS_SALES,
  SALES_TILL_DATE_RECORD,
  CUSTOMER_ERP_SALES,
  SET_SEARCH_POS_SALE,
  GET_SEARCH_POS_SALE,
  POS_REPORTS_COLUMNS,
  POS_REPORT_EXPORT_DATA,
  GET_SEARCH_POS_PROMOTIONS,
  SET_SEARCH_POS_PROMOTIONS
} from '../actionTypes';
import PosSale from '../../services/posSale_services';
// import StockLedgerService from '../../services/stockledger_services';
import {ErrorAlert, ListLoad, FailLoad, CancelAlert, CreateAlert, UpdateAlert} from './load';
import posSale_services from '../../services/posSale_services';


export const GetPosSaleDateFilterAction =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      
      
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);

      const res = await PosSale.getDate(data);
      
      if (res.status === 200) {
        dispatch({
          type: POS_SALE_BY_PAGINATION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_POSSALE_COUNT,
          payload: res.data.numRows,
        });
        dispatch({
          type: GET_POS_SALE_GRANDTOTAL,
          payload: res.data.grandTotal,
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

  export const GetCustomerErpSales =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);

      const res = await PosSale.getcustomer_erp_individual(data);
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_ERP_SALES,
          payload: res.data.data,
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
export const listPosSaleReportAction =
  (
    employee_id,
    date,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.getAllReport(
        employee_id,
        date,
        headerLocationId,
      );
      if (res.status === 200) {
        dispatch({
          type: GET_POS_SALE_REPORT,
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


  export const totalSaleByLocationAction = (month, year, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.getTotalSaleByLocation(month, year);
      if (res.status === 200) {
        dispatch({
          type: TOTAL_SALE_BY_LOCATION,
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

  export const getTotalSaleLocationBarAction = (month, year, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.getTotalSaleLocationBar(month, year);
      if (res.status === 200) {
        dispatch({
          type: TOTAL_SALE_BY_LOCATION_BAR,
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

  export const topSaleByBrandAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.topSaleByBrand(data);
      if (res.status === 200) {
        dispatch({
          type: TOP_SALE_BY_BRAND,
          payload: res.data,
        });
        response(res)
        return Promise.resolve("API_FINISHED_SUCCESS");
      }  
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler); 
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler); 
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const saleComparisonAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.saleComparison(data);
      if (res.status === 200) {
        dispatch({
          type: SALE_COMPARISON,
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

  export const lastTenDaysSalesAction = (data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.lastTenDaysSales(data);
      if (res.status === 200) {
        dispatch({
          type: LAST_TEN_DAYS_SALES,
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
  export const totalSaleByDateAction = (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.totalSaleByDate(data);
      if (res.status === 200) {
        dispatch({
          type: TOTAL_SALE_BY_DAY,
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

  export const totalSaleByMonthAction = (data,employee_id, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.totalSaleByMonth(employee_id,data);
      if (res.status === 200) {
        dispatch({
          type: TOTAL_SALE_BY_MONTH,
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

  export const salesTillDateRecordAction = ( setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.salesTillDateRecord();
      if (res.status === 200) {
        dispatch({
          type: SALES_TILL_DATE_RECORD,
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

  export const cancelPosSaleAction = (id,data,setModalTypeHandler,setLoaderStatusHandler,sample) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSale.cancel(id,data);
      if (res.status === 200) {
        dispatch({
          type: CANCEL_POS_SALE,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
        CancelAlert(dispatch);
        if (sample) {
          sample(true);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }  
    } catch (err) {
      // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const posSalePaginationAction = (data) => async (dispatch) => {
    try {
      const res = await PosSale.pagination(data);
      if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_POS_SALE,
            payload: res.data,
          });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };




  export const get_searchPosSaleAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_POS_SALE,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchPosSaleAction = (data) => {
    return {
      type:SET_SEARCH_POS_SALE,
      payload:data
    }
};
  
export const updateColumnAction = (data) => async (dispatch) => {
  try {
    const res = await PosSale.updateColumn(data);
    if (res.status === 200) {
      dispatch({
        type: POS_REPORTS_COLUMNS,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getColumnAction = () => async (dispatch) => {
  try {
    const res = await PosSale.getColumn();
    if (res.status === 200) {
      dispatch({
        type: POS_REPORTS_COLUMNS,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const posSaleExportDataAction = (data, employee_id) => async (dispatch) => {
  try {
    const res = await PosSale.export(data, employee_id);
    if (res.status === 200) {
        dispatch({
          type: POS_REPORT_EXPORT_DATA,
          payload: res.data,
        });
      return Promise.resolve(res.data);
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const posSalePromotionAction = (data) => async (dispatch) => {
  try {
    const res = await PosSale.promotion(data);
    if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_POS_PROMOTIONS,
          payload: res.data,
        });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const get_searchPosPromotionAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_POS_PROMOTIONS,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchPosPromotionAction = (data) => {
  return {
    type:SET_SEARCH_POS_PROMOTIONS,
    payload:data
  }
};


export const updatePosSalePromotionAction = (data) => async (dispatch) => {
  try {
    const res = await PosSale.updatePromotion(data);
    if (res.status === 200) {
        // dispatch({
        //   type: SET_SEARCH_POS_PROMOTIONS,
        //   payload: res.data,
        // });
      UpdateAlert(dispatch)
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

// Backward-compatible alias used in older imports
export const listPosSaleActionlistPosSaleReportAction = listPosSaleReportAction;
