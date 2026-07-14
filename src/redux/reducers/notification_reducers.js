import {
    GET_NOTIFICATION_DATA,
    GETALL_NOTIFICATION,
    EDIT_NOTIFICATION,
    GET_UNREAD_NOTIFICATION,
    GET_ENABLE_NTFY,
    SELECT_ONDATA,
    NOTIFICATION_TOKEN,
    UPDATE_IS_READ,
    INDIVIDUAL_NOTIFICATION,
    UPDATE_INDIVIDUAL_NOTIFICATION,
    CLEAR_NOTIFICATION
  } from '../actionTypes';

  const initialState = {
   ntfydata : [],
   getnotificationdata : [],
   editntfydata : [],
   unReaddata : [],
   list_enabled : [],
   is_serialied : '',
   getNotificationToken : [],
   updateIsread: [],
   getIndividualNotification:[],
   updateIndividualNotification:[],
   clearNotification:[],
  };
  

  function NotificationReducer(state = initialState, action) {
    const {type, payload} = action;
  
    switch (type) {
        case GET_NOTIFICATION_DATA:
            return {...state, ntfydata: payload};

      case UPDATE_IS_READ:
        return { ...state, updateIsread: payload };
  
     case GETALL_NOTIFICATION:
              return {...state, getnotificationdata: payload};

      case EDIT_NOTIFICATION:
                return {...state, editntfydata: payload};

               
      case GET_UNREAD_NOTIFICATION:
        return {...state, unReaddata: payload}; 

        case GET_ENABLE_NTFY:
          return {...state, list_enabled: payload}; 
  
        case SELECT_ONDATA:
          return {...state, is_serialied: payload}; 

        case NOTIFICATION_TOKEN:
          return {...state, getNotificationToken: payload}; 

        case INDIVIDUAL_NOTIFICATION:
          return {...state, getIndividualNotification: payload}; 

        case UPDATE_INDIVIDUAL_NOTIFICATION:
          return {...state, updateIndividualNotification: payload}; 

        case CLEAR_NOTIFICATION:
          return {...state, clearNotification: payload}; 

      default:
        return state;
    }
  }
  
  export default NotificationReducer;