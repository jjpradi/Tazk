import {
  GET_PRICE_LIST,
  GET_PRODUCT_PRICE_LIST,
  GET_PRODUCT_LIST,
  CREATE_PRICE_LIST,
  UPDATE_PRICE_LIST,
  DELETE_PRICE_LIST,
  GET_PRICE_LIST_CUSTOMER,
  GET_PRICE_LIST_ALL_CUSTOMER,
  INSERT_PRICELIST_MAPPING_CUSTOMER,
  GET_SEARCH_PRICE_LIST,
  SET_SEARCH_PRICE_LIST
} from '../actionTypes';
import {ErrorAlert, ListLoad, FailLoad, UpdateAlert, CreateAlert, DeleteAlert, ExistAlert} from './load';
import PriceListService from '../../services/priceList_services';

export const getPriceListAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      //  ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.getPriceList();
      if (res.status === 200) {
        dispatch({
          type: GET_PRICE_LIST,
          payload: res.data,
        });
      //  FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
    //  FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getProductPriceListAction =
  (priceListId, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.getProductPriceList(priceListId);
      if (res.status === 200) {
        dispatch({
          type: GET_PRODUCT_PRICE_LIST,
          payload: res.data,
        });
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED");
      }
      
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.resolve("API_FINISHED");
    }
  };

  export const getProductListAction =
  (type, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.getProductList(type,data);
      if (res.status === 200) {
        dispatch({
          type: GET_PRODUCT_LIST,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const createPriceListAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      const res = await PriceListService.createPriceList(data);
      if(res.data.message && res.data.message === 'NAME ALREADY EXISTS'){
        ExistAlert(dispatch, res.data);
      }
      if (res.status === 200 && res.data.message !== 'NAME ALREADY EXISTS') {
        CreateAlert(dispatch);
        dispatch({
          type: SET_SEARCH_PRICE_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updatePriceListAction =
  (data, id) =>
  async (dispatch) => {
    try {
      const res = await PriceListService.updatePriceList(data, id);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        dispatch({
          type: SET_SEARCH_PRICE_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const deletePriceListAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.deletePriceList(data);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch({
          type: SET_SEARCH_PRICE_LIST,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listPriceListAllCustomerAction =
  (setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.getPriceListAllCustomer();
      if (res.status === 200) {
        // CreateAlert(dispatch);
        dispatch({
          type: GET_PRICE_LIST_ALL_CUSTOMER,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listPriceListCustomerAction =
  (pricelist_id,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.getPriceListCustomer(pricelist_id);
      if (res.status === 200) {
        // CreateAlert(dispatch);
        dispatch({
          type: GET_PRICE_LIST_CUSTOMER,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const createPriceListMappingCustomerAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PriceListService.createCustomerMappingPriceList(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch({
          type: INSERT_PRICELIST_MAPPING_CUSTOMER,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
export const searchPriceListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_PRICE_LIST,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const searchPriceListState = (data) => {
  return {
    type: SET_SEARCH_PRICE_LIST,
    payload: data
  }
};

export const priceListPaginationAction = (data) => async (dispatch) => {
  try {
    const res = await PriceListService.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_PRICE_LIST,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};