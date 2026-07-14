import {
  GET_FUEL_PRICE_LIST,
  GET_TRAVEL_DETAILS,
  CREATE_FUEL_PRICE_LIST,
  GET_SALES_MAN_LIST,
  DELETE_FUEL_PRICE_LIST,
  GET_ALLOWANCE_LIST,
  UPDATE_FUEL_PRICE_LIST,
  SALES_MAN_LIVE_TRACKING_DATA,
  GET_FUEL_TYPES,
  GET_FUEL_PRICE_BASED_ON_TYPE,
  GET_SALESMAN_FUEL_DETAILS,
  SEARCH_SALES_MAN_LIST,
  SET_SEARCH_SALES_MAN_LIST,
  GET_SEARCH_SALES_MAN_LIST
} from '../actionTypes';
import FuelAllowanceService from '../../services/fuelAllowance_service';
import {CreateAlert,DeleteAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert} from './load';


export const getFuelPriceListAction =
  (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.getFuelPrice(data);
      if (res.status === 200) {
        dispatch({
          type: GET_FUEL_PRICE_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteFuelPriceListAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.deleteFuelPrice(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch({
          type: DELETE_FUEL_PRICE_LIST,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  export const getAllowanceListAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.getAllowanceList(id);
      if (res.status === 200) {
        dispatch({
          type: GET_ALLOWANCE_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


export const getTravelDetailsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.getTravelDetailsAction(data);
      if (res.status === 200) {
        dispatch({
          type: GET_TRAVEL_DETAILS,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const createFuelPriceAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.createFuelPrice(data);
      // if(res)
      // console.log(res,"dskdnsff");
      // response(res)
      if(res.data.message === "Bike or mileage can't be empty"){
        ErrorAlert(dispatch, res.data);
      }
      else {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_FUEL_PRICE_LIST,
          payload: res.data,
        });
        
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getSalesManListAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.getSalesManList(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SALES_MAN_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const searchSalesManListAction =
  (body,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await FuelAllowanceService.searchSalesManList(body);
      if (res.status === 200) {
        dispatch({
          type: SEARCH_SALES_MAN_LIST,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      console.log(err,"akshbhbesd")
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const setsearchSalesManListAction  = (data) => {
      return {
        type: SET_SEARCH_SALES_MAN_LIST,
        payload: data
      }
    };
    
export const getsearchSalesManListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return async (dispatch) => {
    try {
      if (setLoaderStatusHandler) setLoaderStatusHandler(true);
      const res = await FuelAllowanceService.searchSalesManList(body);

      if (res.status === 200) {
        dispatch({
          type: SEARCH_SALES_MAN_LIST,
          payload: res.data,
        });
      }

      if (setLoaderStatusHandler) setLoaderStatusHandler(false);
    } catch (err) {
      if (setLoaderStatusHandler) setLoaderStatusHandler(false);
      ErrorAlert(dispatch, err);
    }
  };
};



  export const updateFuelPriceAction =
  (fuelPriceId, data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await FuelAllowanceService.updateFuelPrice(fuelPriceId, data);
      response(res)
      if(res.data.message === "Bike or mileage can't be empty"){
        ErrorAlert(dispatch, res.data);
      }
      else {
        CreateAlert(dispatch);
        dispatch({
          type: UPDATE_FUEL_PRICE_LIST,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const setLiveLocationData = (data) => async (dispatch) => {
    dispatch({
      type: SALES_MAN_LIVE_TRACKING_DATA,
      payload:data,
    });
  };

    export const getFuelTypesAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await FuelAllowanceService.getFuelTypes();
      if (res.status === 200) {
        dispatch({
          type: GET_FUEL_TYPES,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const getFuelPriceBasedOnTypeAction = (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await FuelAllowanceService.getFuelPriceBasedOnType(data);
      if (res.status === 200) {
        dispatch({
          type: GET_FUEL_PRICE_BASED_ON_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

    export const getSalesmanFuelDetailsAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await FuelAllowanceService.getSalesmanFuelDetails();
      if (res.status === 200) {
        dispatch({
          type: GET_SALESMAN_FUEL_DETAILS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };