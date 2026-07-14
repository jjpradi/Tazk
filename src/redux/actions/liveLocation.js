import liveLocation from 'services/liveLocation';
import {EMP_TRAVEL_TIMELINE, GET_EMP_BASED_TRAVEL_HISTORY, LIVE_LOCATION, PROJECT_LIVE_LOCATION, GET_PROJECT_EMP_BASED_TRAVEL_HISTORY, EMP_PROJECT_TRAVEL_TIMELINE, GET_TASK_LOGS} from '../actionTypes';
import { CreateAlert, ErrorAlert } from './load';

export const liveLocationAction = (data , response) => async (dispatch) => {
    try {
        const res = await liveLocation.getLocation(data);
        if (res.status === 200) {
            CreateAlert (dispatch);
            dispatch({
                type: LIVE_LOCATION,
                payload: res.data,
            });
        }

        
        
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};


export const setLiveLocationAction = (data) => async (dispatch) => {
    dispatch({
        type: LIVE_LOCATION,
        payload: data,
    });
   
};

export const getEmpBasedTravelHistoryAction = (data, response) => async (dispatch) => {
    try {
        const res = await liveLocation.getEmpBasedTravelHistory(data);
        if (res.status === 200) {
            dispatch({
                type: GET_EMP_BASED_TRAVEL_HISTORY,
                payload: res.data,
            });
        }
        if (response) {
            response(res.status, res.data);
          }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getTravelTimeLineAction = (data, callback) => async (dispatch) => {
    try {
        const res = await liveLocation.getTravelTimeLineAction(data);
        if (res.status === 200) {
            dispatch({
                type: EMP_TRAVEL_TIMELINE,
                payload: res.data,
            });
            if (callback) {
                callback(res.data);
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const projectLiveLocationAction = (data , response) => async (dispatch) => {
    try {
        const res = await liveLocation.getProjectLocation(data);
        if (res.status === 200) {
            
            CreateAlert (dispatch);
            dispatch({
                type: PROJECT_LIVE_LOCATION,
                payload: res.data,
            });
        }

        
        
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};


export const setProjectLiveLocationAction = (data) => async (dispatch) => {
    dispatch({
        type: PROJECT_LIVE_LOCATION,
        payload: data,
    });
   
};

export const getProjectEmpBasedTravelHistoryAction = (data, response) => async (dispatch) => {
    try {
        const res = await liveLocation.getProjectEmpBasedTravelHistory(data);
        if (res.status === 200) {
            dispatch({
                type: GET_PROJECT_EMP_BASED_TRAVEL_HISTORY,
                payload: res.data,
            });
        }
        if (response) {
            response(res.status, res.data);
          }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getProjectTravelTimeLineAction = (data, callback) => async (dispatch) => {
    try {
        const res = await liveLocation.getProjectTravelTimeLine(data);
        if (res.status === 200) {
            dispatch({
                type: EMP_PROJECT_TRAVEL_TIMELINE,
                payload: res.data,
            });
            if (callback) {
                callback(res.data);
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const getTaskLogsAction =
() => async (dispatch) => {
  try {
    const res = await liveLocation.getTaskLogs();
    if (res.status === 200) {
      dispatch({
        type: GET_TASK_LOGS,
        payload: res.data,
      });

      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }


};
