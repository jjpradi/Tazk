import {
  GET_CHEQUE_BOUNCE,
  CREATE_CHEQUE_BOUNCE,
  TOP_10_OUTSTANDING_REPORT,
  OUTSTANDING_REPORT,
  SALES_MAN_SALE_DETAILS,
  GET_SALES_MAN_VISITS,
  GET_SALES_MAN_DATA,
  UPDATE_SALESMAN_LIST,
  GET_SEARCH_SALESMAN,
  SET_SEARCH_SALESMAN,
  GET_SALES_MAN_PAGINATION,
  GET_SEARCH_CHEQUEBOUNCE,
  SET_SEARCH_CHEQUEBOUNCE,
  TOTAL_OVERDUE_REPORT,
  TO_BE_COLLECTED_TODAY,
  OVERDUE_TO_BE_COLLECTED,
  COLLECTION_STATUS,
  GET_SALES_APPROVAL,
  SET_SEARCH_SALESMAN_COLLECTION,
  GET_SEARCH_SALESMAN_COLLECTION,
  COLLECTION_BY_SALESMAN,
  SALESMAN_COLLECTION_RECONCILIATE,
  GET_CHEQUE_BOUNCE_BY_ID,
  UPDATE_CHEQUE_STATUS,
  GET_ALL_CHEQUE_STATUS
} from '../actionTypes';
import SalesManDashboardService from '../../services/salesMan_services';

import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  successmsg,
  errormsg,
} from './load';

export const getSalesManSaleDetailsAction =
  (empId,headerLocation_id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getSalesManSaleDetails(
        empId,
        headerLocation_id,
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: SALES_MAN_SALE_DETAILS,
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

  export const getSalesManVisitsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getSalesManVisits(
      data
      );
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_MAN_VISITS,
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

export const getTop10OutstandingReportAction =
  (employee_id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getTop10OutstandingReport(
        employee_id,
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: TOP_10_OUTSTANDING_REPORT,
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

export const getChequeBounceAction =
  (emp_id,headerLocationId,data,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getChequeBounce(emp_id,headerLocationId,data);
      if (res.status === 200) {
        dispatch({
          type: GET_CHEQUE_BOUNCE,
          payload: res.data,
        });
        if (response) {
          response(res.data);
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

  export const getChequeBounceByIdAction =
  (id) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getChequeBounceById(id);
      if (res.status === 200) {
        dispatch({
          type: GET_CHEQUE_BOUNCE_BY_ID,
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

    export const getAllChequeStatusAction =
  () => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getAllChequeStatus();
      // console.log("res",res)
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_CHEQUE_STATUS,
          payload: res,
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

    export const updateChequeStatusAction =
  (id,headerLocationId,data,response) => async (dispatch) => {
    try {
      const res = await SalesManDashboardService.updateChequeStatus(id,headerLocationId,data);
      // console.log("res.data",res.data)
      if (res.data.updatecheque.chequedata.affectedRows === 1) {
        dispatch({
          type: UPDATE_CHEQUE_STATUS,
          payload: res.data,
        });
        UpdateAlert(dispatch);
      }
      return  res; 
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

export const getOutstandingReportAction =
  (employee_id,headerLocation_id, setModalTypeHandler, setLoaderStatusHandler,data) =>
  async (dispatch) => {
    try {
      console.log("actionnn")
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getOutstandingReport(
        employee_id,
        headerLocation_id,
        data
      );
      if (res.status === 200) {
        dispatch({
          type: OUTSTANDING_REPORT,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      console.log(err,"errrorroo")
      return Promise.reject("API_FINISHED_ERROR");
    }
    };
  
    export const getTotalOverDueReport =
  (employee_id,headerLocation_id, setModalTypeHandler, setLoaderStatusHandler,data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getTotalOverDueReport(
        employee_id,
        headerLocation_id,
        data
      );
      if (res.status === 200) {
        dispatch({
          type: TOTAL_OVERDUE_REPORT,
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
  
    export const getToBeCollectedToday =
  (employee_id,headerLocation_id, setModalTypeHandler, setLoaderStatusHandler,data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getToBeCollectedToday(
        employee_id,
        headerLocation_id,
        data
      );
      if (res.status === 200) {
        dispatch({
          type: TO_BE_COLLECTED_TODAY,
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
  
    export const getOverDueToBeCollected =
  (employee_id,headerLocation_id, setModalTypeHandler, setLoaderStatusHandler,data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getOverDueToBeCollected(
        employee_id,
        headerLocation_id,
        data
      );
      if (res.status === 200) {
        dispatch({
          type: OVERDUE_TO_BE_COLLECTED,
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
    export const getCollectionStatus =
  (employee_id,headerLocation_id, setModalTypeHandler, setLoaderStatusHandler,data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getCollectionStatus(
        employee_id,
        headerLocation_id,
        data
      );
      if (res.status === 200) {
        dispatch({
          type: COLLECTION_STATUS,
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

export const createChequeBounceAction =
  (id, headerLocationId, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.createChequeBounce(id, headerLocationId, data);
      if (res.status === 200) {
        dispatch({
          type: CREATE_CHEQUE_BOUNCE,
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


  // getSalesmanData

  export const getonlySalesmanDataAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getSalesmanData(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_MAN_DATA,
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

  export const listSalesManPaginateAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.getSalesManByPagination(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_MAN_PAGINATION,
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
  }

  export const listSalesManApprovalReq =
  (shop_id , employee_id) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.salesManApprovalReq(shop_id , employee_id);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_APPROVAL,
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
  }

  export const approveSalesApprovalRequest = (data , approveResponse) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.salesManApprovalApprove(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_APPROVAL,
          payload: res.data,
        });

        if (approveResponse) {
          approveResponse(res.status)
      }

        
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
}
  
  export const rejectSalesApprovalRequest = (data,rejectResponse) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await SalesManDashboardService.salesManApprovalReject(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_APPROVAL,
          payload: res.data,
        });

        if (rejectResponse) {
          rejectResponse(res.status)
      }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }

  //UPDATE SALESMANLIST

  export const updateSalesManlistAction =
  (data, setModalStatusHandler, setselectData) => async (dispatch) => {
    try {
      const res = await SalesManDashboardService.updateSalesManlist(data);
      if (res.data.changedRows === 1) {
        dispatch({
          type: UPDATE_SALESMAN_LIST,
          payload: res.data.data,
        });
        setTimeout(() => {
          UpdateAlert(dispatch);
        }, 0);
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const get_searchSalesManAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_SALESMAN,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchSalesManAction = (data) => {
    return {
      type:SET_SEARCH_SALESMAN,
      payload:data
    }
  };

  ///cheqbouncev search
  export const get_searchChequebounceAction = (body, setModalTypeHandler, setLoaderStatusHandler, response) =>{
    return {
      type:GET_SEARCH_CHEQUEBOUNCE,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler,
      callback: response
    }
  };

  export const set_searchCheqbounceAction = (data) => {
    return {
      type:SET_SEARCH_CHEQUEBOUNCE,
      payload:data
    }
  };

export const getSalesmanCollectionAction = (payload, location_id) => async(dispatch) => {
  try{
    const res = await SalesManDashboardService.getSalesmanCollection(payload, location_id)
    if(res.status === 200){
      dispatch({
        type: SET_SEARCH_SALESMAN_COLLECTION,
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

export const setSearchSalesmanCollectionAction = (data) => {
  return{
    type: SET_SEARCH_SALESMAN_COLLECTION,
    payload: data
  }
}

export const getSearchSalesmanCollectionAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_SALESMAN_COLLECTION,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
}

export const getAllCollectionsBySalesmanAction = (payload, response) => async(dispatch) => {
  try{
    const res = await SalesManDashboardService.getAllCollectionsBySalesman(payload)
    if(res.status === 200){
      dispatch({
        type: COLLECTION_BY_SALESMAN,
        payload: res.data
      })
    }
    if(response){
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const salesmanCollectionReconciliateAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
  try{
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await SalesManDashboardService.salesmanCollectionReconciliate(payload)
    if(res.status === 200){
      dispatch({
        type: SALESMAN_COLLECTION_RECONCILIATE,
        payload: res.data
      })
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const deleteSalesmanCollectionByIdAction = (id, payload) => async(dispatch) => {
  try{
    const res = await SalesManDashboardService.deleteSalesmanCollection(id, payload)
    if(res.status === 200){
      dispatch({
        type: COLLECTION_BY_SALESMAN,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_ERROR")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}