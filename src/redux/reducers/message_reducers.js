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
} from '../actionTypes/index';

const initialState = {
  inboxList: [],
  inboxAllMsg: [],
  employeeList: [],
  isApiSuccess: false,
  seenRead: [],
  UnseenMsg: [],
  chatListData: [],
};

const messageReducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case GET_INBOX:
      return {
        ...state,
        inboxList: payload,
        isApiSuccess: true,
      };
    case GET_MSG_IN_INBOX:
      return {
        ...state,
        inboxList: payload.inbox,
        inboxAllMsg: payload.msgByInboxId,
      };

    case SEND_MESSAGE:
      return {
        ...state,
        inboxList: payload.inbox,
        inboxAllMsg: payload.msgByInboxId,
      };

    case UPDATE_MESSAGE:
      return {
        ...state,
        inboxList: payload.inbox,
        inboxAllMsg: payload.msgByInboxId,
      };

    case DELETE_MESSAGE:
      return {
        ...state,
        inboxList: payload.inbox,
        inboxAllMsg: payload.msgByInboxId,
      };

    case DELETE_INBOX:
      return {
        ...state,
        inboxList: payload,
      };

    case LIST_EMPLOYEE:
      return {
        ...state,
        employeeList: payload,
      };

    case API_SUCCESS:
      return {
        ...state,
        isApiSuccess: payload,
      };

    case GET_SEEN_READ_MSG:
      return {...state, seenRead: payload};

    case UPDATE_UNSEEN_MSG:
      return {...state, UnseenMsg: payload};

    case CHAT_LIST_DATA:
      return {...state, chatListData: payload};

    default:
      return state;
  }
};

export default messageReducer;
