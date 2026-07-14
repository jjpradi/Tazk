import {GET_TEMP_LIST, GET_CUSTOMER_LIST, SEND_MSG} from '../actionTypes';
import {ErrorAlert} from './load';
import WhatsappServices from 'services/whatsappServices';

export const tempListAction = () => async (dispatch) => {
  try {
    const res = await WhatsappServices.get();
    if (res.status === 200) {
      dispatch({
        type: GET_TEMP_LIST,
        payload: res.data,
      });
      return Promise.resolve('API_FINISHED_SUCCESS');
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const customerListAction = () => async (dispatch) => {
  try {
    const res = await WhatsappServices.getCustomer();
    if (res.status === 200) {
      dispatch({
        type: GET_CUSTOMER_LIST,
        payload: res.data,
      });
      return Promise.resolve('API_FINISHED_SUCCESS');
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const sendMsgAction = (data) => async (dispatch) => {
  try {
    const res = await WhatsappServices.sendMsg(data);
    if (res.status === 200) {
      dispatch({
        type: SEND_MSG,
        payload: res.data,
      });
      return Promise.resolve('API_FINISHED_SUCCESS');
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};
