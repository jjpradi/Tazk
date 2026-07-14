import {LIST_HOLIDAYS, CREATE_HOLIDAYS, GET_BY_ID_HOLIDAYS, UPDATE_HOLIDAYS, DELETE_HOLIDAYS, GET_SEARCH_HOLIDAY, SET_SEARCH_HOLIDAY, CATEGORY_BASED_HOLIDAYS, HOLIDAY_CREATED_YEARS} from '../actionTypes';
import holidays_services from 'services/holidays_services';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert
} from './load';
import { deleteAction} from './actions';

export const Listholidays =
  ( setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_HOLIDAYS,
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


  export const CreateHolidays =
  (
   
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.create(data);
      if (res.data.changedRows === 1) CreateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_HOLIDAY,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };


  export const getbyidholidaysAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.getbyid(id);
      dispatch({
        type: GET_BY_ID_HOLIDAYS,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(holidays_services.getbyid GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateHolidays =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.update(data);
      if (res.data.changedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_HOLIDAY,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };

  export const deleteHolidays =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
   
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.delete(data);
      if (res.data.changedRows === 1) DeleteAlert(dispatch);
      dispatch({
        type: SET_SEARCH_HOLIDAY,
        payload: res.data,
      });
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
 
      return Promise.reject(err);
      // }
    }
  };

  export const setSearchHolidayState = (data) => {
    return {
      type: SET_SEARCH_HOLIDAY,
      payload: data
    }
};
  
export const getByCompanyCategoryHolidaysAction =
  ( setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await holidays_services.getByCompanyCategoryHolidays();
      if (res.status === 200) {
        dispatch({
          type: CATEGORY_BASED_HOLIDAYS,
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
  
  export const getSearchHolidayAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_HOLIDAY,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  

  export const getHolidayCreatedYearsAction =( setModalTypeHandler, setLoaderStatusHandler) =>async (dispatch) => {
    try {
      const res = await holidays_services.getHolidayCreatedYears();
      if (res.status === 200) {
        dispatch({
          type: HOLIDAY_CREATED_YEARS,
          payload: res.data,
        });
        return Promise.resolve(res.data);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };