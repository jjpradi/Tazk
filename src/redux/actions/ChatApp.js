import {
  ADD_NEW_MESSAGE,
  CHAT_LIST_DATA,
  DELETE_MESSAGE,
  DELETE_USER_MESSAGES,
  EDIT_MESSAGE,
  FETCH_ERROR,
  FETCH_START,
  FETCH_SUCCESS,
  GET_CONNECTIONS_LIST,
  GET_USER_MESSAGES,
  SELECT_USER,
  TOGGLE_CHAT_DRAWER,
} from '../actionTypes/index';
import {appIntl} from '@crema/utility/helper/Utils';
import jwtAxios from '@crema/services/auth/jwt-auth';

export const getConnectionList = () => {
  const {messages} = appIntl();
  return (dispatch) => {
    dispatch({type: FETCH_START});
    jwtAxios
      .get('/api/chatApp/connections')
      .then((data) => {
        if (data.status === 200) {
          dispatch({type: FETCH_SUCCESS});
          dispatch({type: GET_CONNECTIONS_LIST, payload: data.data});
        } else {
          dispatch({
            type: FETCH_ERROR,
            payload: messages['message.somethingWentWrong'],
          });
        }
      })
      .catch((error) => {
        dispatch({type: FETCH_ERROR, payload: error.message});
      });
  };
};

export const getConnectionMessages = (data) => {
  // console.log("getConnectionMessages",data)
  return (dispatch) => {
    dispatch({type: GET_USER_MESSAGES, payload: data});
    dispatch({type: FETCH_SUCCESS});
  };
};

export const onSendMessage = (message) => {
  // console.log("message",message)
  const {messages} = appIntl();
  return (dispatch, getState) => {
    dispatch({type: FETCH_SUCCESS});
    const oldMessages = getState().chatReducer?.userMessages?.messageData;
    // console.log("oldMessages",oldMessages)
    if (oldMessages?.length > 0) {
      dispatch({
        type: ADD_NEW_MESSAGE,
        payload: {
          data: {
            userMessages: {
              messageData: oldMessages.concat([message]),
            },
          },
        },
      });
    } else {
      dispatch({
        type: ADD_NEW_MESSAGE,
        payload: {
          data: {
            userMessages: {
              messageData: [message],
            },
          },
        },
      });
    }
  };
};

export const onEditMessage = (data) => {
  // console.log("111",data.msg_id)
  return (dispatch, getState) => {
    dispatch({type: FETCH_SUCCESS});
    const messageData = getState().chatReducer.userMessages.messageData.map(
      (i) => {
        return i.msg_id === data.msg_id ? data : i;
      },
    );

    const chatList = getState().messageReducer.chatListData.map((i) => {
      return i.inbox_id === data.inbox_id && i.latest_msg_id === data.msg_id
        ? {...i, latest_msg: data.msg_content}
        : i;
    });

    dispatch({type: GET_USER_MESSAGES, payload: {messageData}});

    dispatch({
      type: CHAT_LIST_DATA,
      payload: chatList,
    });
  };
};

export const updateNewMessageId = (data) => {
  return (dispatch, getState) => {
    dispatch({type: FETCH_SUCCESS});
    const messageData = getState().chatReducer.userMessages.messageData.map(
      (i) => {
        return i.temp_msg_id === data.temp_msg_id ? data : i;
      },
    );

    dispatch({type: GET_USER_MESSAGES, payload: {messageData}});
  };
};

export const onDeleteMessage = (channelId, messageId) => {
  const {messages} = appIntl();
  return (dispatch) => {
    jwtAxios
      .post('/api/chatApp/delete/message', {channelId, messageId})
      .then((data) => {
        if (data.status === 200) {
          dispatch({type: FETCH_SUCCESS});
          dispatch({type: DELETE_MESSAGE, payload: data.data});
        } else {
          dispatch({
            type: FETCH_ERROR,
            payload: messages['message.somethingWentWrong'],
          });
        }
      })
      .catch((error) => {
        dispatch({type: FETCH_ERROR, payload: error.message});
      });
  };
};

export const onDeleteConversation = (channelId) => {
  const {messages} = appIntl();
  return (dispatch) => {
    dispatch({type: FETCH_START});
    jwtAxios
      .post('/api/chatApp/delete/user/messages', {channelId})
      .then((data) => {
        if (data.status === 200) {
          dispatch({type: FETCH_SUCCESS});
          dispatch({type: DELETE_USER_MESSAGES, payload: data.data});
        } else {
          dispatch({
            type: FETCH_ERROR,
            payload: messages['message.somethingWentWrong'],
          });
        }
      })
      .catch((error) => {
        dispatch({type: FETCH_ERROR, payload: error.message});
      });
  };
};

export const onSelectUser = (user) => {
  return (dispatch) => {
    dispatch({type: SELECT_USER, payload: user});
  };
};

export const onToggleChatDrawer = () => {
  return (dispatch) => {
    dispatch({type: TOGGLE_CHAT_DRAWER});
  };
};
