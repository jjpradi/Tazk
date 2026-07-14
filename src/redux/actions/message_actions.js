import {
  GET_INBOX,
  GET_MSG_IN_INBOX,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
  SEND_MESSAGE,
  DELETE_INBOX,
  LIST_EMPLOYEE,
  API_SUCCESS,
  GET_SEEN_READ_MSG,
  UPDATE_UNSEEN_MSG,
  CHAT_LIST_DATA
} from '../actionTypes';
import {ErrorAlert, ListLoad, FailLoad, UpdateAlert} from './load';
import MessageService from '../../services/message_services';

export const getInboxAction = (userId, setModalTypeHandler, setLoaderStatusHandler,) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await MessageService.getInbox(userId);
    if (res.status === 200) {
      dispatch({
        type: GET_INBOX,
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


export const getMsgInInboxAction = (userId, inboxId) => async (dispatch) => {
  try {
    const res = await MessageService.getMsgInInbox(userId, inboxId);
    if (res.status === 200) {
      dispatch({
        type: GET_MSG_IN_INBOX,
        payload: res.data,
      });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


export const sendMsgAction = (userId, data) => async (dispatch) => {
    try {
      const res = await MessageService.sendMsg(userId, data);
      if (res.status === 200) {
        dispatch({
          type: SEND_MESSAGE,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateMsgAction = (userId, inboxId, msgId, data) => async (dispatch) => {
    try {
      const res = await MessageService.updateMsg(userId, inboxId, msgId, data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_MESSAGE,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const deleteMsgAction = (userId, inboxId, msgId, data) => async (dispatch) => {
    try {
      const res = await MessageService.deleteMsg(userId, inboxId, msgId, data);
      if (res.status === 200) {
        dispatch({
          type: DELETE_MESSAGE,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const deleteInboxAction = (userId, inboxId) => async (dispatch) => {
    try {
      const res = await MessageService.deleteInbox(userId, inboxId);
      if (res.status === 200) {
        dispatch({
          type: DELETE_INBOX,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const listEmployeeAction = () => async (dispatch) => {
    try {
      const res = await MessageService.listEmployee();
      if (res.status === 200) {
        dispatch({
          type: LIST_EMPLOYEE,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const chatListDataAction = (data) => async (dispatch) => {
    try {
        dispatch({
          type: CHAT_LIST_DATA,
          payload: data,
        });
      return Promise.resolve(data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const listUnreadAction = ( data) => async (dispatch) => {
    try {
      const res = await MessageService.Readmsg( data);
      if (res.status === 200) {
        dispatch({
          type: GET_SEEN_READ_MSG,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const updateReadmsgAction = (inboxId, data) => async (dispatch) => {
    try {
      const res = await MessageService.seenReadmsg(inboxId, data);
      UpdateAlert(dispatch);
      if (res.status === 200) {
      
        dispatch({
          type: UPDATE_UNSEEN_MSG,
          payload: res.data,
        });
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  
  // export const isApiCallSuccessAction = (successFail) => async (dispatch) => {
    
  //   dispatch({
  //     type: API_SUCCESS,
  //     payload: successFail,
  //   });
  // };

