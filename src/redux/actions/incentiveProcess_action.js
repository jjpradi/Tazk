import {CREATE_INCENTIVE,UPDATE_INCENTIVE,UPDATE_AMOUNT_INCENTIVE,GET_INCENTIVE_DATA} from '../actionTypes';
import IncentiveService from '../../services/incentive_services';
import {
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  ExistAlert,
  commonAlert,
} from './load';

export const createIncentiveAction = (data) => async (dispatch) => {
    try {
      const res = await IncentiveService.createIncentive(data);
      if (res.status === 200) {
        dispatch({
          type: CREATE_INCENTIVE,
          payload: res.data?.map((v)=>{return {...v, amount:0}}),
        });
        console.log(res,'res');
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateIncentiveAction = (data) => async (dispatch) => {
  console.log(data,'data');
    dispatch({
      type: UPDATE_INCENTIVE,
      payload: data
    });
  };

export const updateAmountIncentiveAction = (data) => async (dispatch) => {
    try {
      const res = await IncentiveService.updateAmountIncentive(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_AMOUNT_INCENTIVE,
          payload: res.data,
        });
        console.log(res, 'res');
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  export const getIncentiveMonthDataAction = (data) => async (dispatch) => {
    try {
      const res = await IncentiveService.getIncentiveMonthData(data);
      if (res.status === 200) {
        dispatch({
          type: GET_INCENTIVE_DATA,
          payload: res.data,
        });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
