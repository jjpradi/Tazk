import {
  GET_CURRENT_DAY,
  GET_CURRENT_WEEK,
  GET_CURRENT_MONTH,
  GET_CURRENT_YEAR,
  GET_DAY,
  GET_WEEK,
  GET_MONTH,
  GET_YEAR,
  GET_BY_DATE,
  BREAKDOWN_GET_MONTH,
  BREAKDOWN_GET_WEEK,
  BREAKDOWN_GET_DAY,
  BREAKDOWN_GET_YEAR
} from '../actionTypes';
import profitLossDashboard_services from 'services/profitLossDashboard_services';
import {ErrorAlert, FailLoad, ListLoad} from './load';

export const currentDayAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getCurrentDay(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_CURRENT_DAY,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const currentWeekAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getCurrentWeek(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_CURRENT_WEEK,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const currentMonthAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getCurrentMonth(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_CURRENT_MONTH,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const currentYearAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getCurrentYear(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_CURRENT_YEAR,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const dayAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getDay(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_DAY,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const breakdowndayAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.breakdowngetday(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: BREAKDOWN_GET_DAY,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const breakdownweekAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.breakdowngetweek(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: BREAKDOWN_GET_WEEK,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const breakdownmonthAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.breakdowngetmonth(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: BREAKDOWN_GET_MONTH,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const breakdownyearAction =
  (headerLocationId) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.breakdowngetyear(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: BREAKDOWN_GET_YEAR,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  

export const weekAction =
  (headerLocationId, response) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getWeek(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_WEEK,
          payload: res.data,
        });
        if(response) {
          response(res)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const monthAction =
  (headerLocationId, response) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getMonth(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_MONTH,
          payload: res.data,
        });
        if(response) {
          response(res)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const yearAction =
  (headerLocationId, response) => async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getYear(headerLocationId);
      if (res.status === 200) {
        dispatch({
          type: GET_YEAR,
          payload: res.data,
        });
        if(response) {
          response(res)
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getByDateAction =
  (from, to, headerLocationId, data) =>
  async (dispatch) => {
    try {
      const res = await profitLossDashboard_services.getByDate(from, to, headerLocationId, data);
      if (res.status === 200) {
        dispatch({
          type: GET_BY_DATE,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
