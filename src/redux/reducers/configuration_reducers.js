import {
  GET_ALL_MAIL_CONFIGURATION,
    GET_MAIL_CONFIGURATION_BY_ID,
    GET_MAIL_ROLE_BY_ID,
    UPDATE_MAIL_CONFIGURATION,
    GET_ALL_SMS_CONFIGURATION,
    GET_SMS_CONFIGURATION_BY_ID,
    UPDATE_SMS_CONFIGURATION,
    SEND_TEST_MAIL_CONFIGURATION,
    SET_SEARCH_SMS,
    SET_SEARCH_MAIL,
    SEND_TEST_SMS_CONFIGURATION,
    SET_LIST_SMS,
    REMINDER_CONFIGURATION,
  } from '../actionTypes';
  
  const initialState = {
    mail_configuration: [],
    list_mail_config: [],
    mail_role_config: [],
    mail_role_config_count: 0,
    list_sms_config: [],
    sms_role_config: [],
    sms_role_config_count: 0,
    sms_configuration: [],
    testMail: {},
    searchSmsData: [],
    searchSmsDataCount: 0,
    searchMailData: [],
    searchMailDataCount: 0,
    testSMS: {},
    remindeConfiguration : []
  };
  
  function ConfigurationReducer(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {

      case GET_MAIL_CONFIGURATION_BY_ID:
        return {...state, mail_configuration: payload};
     
      case GET_ALL_MAIL_CONFIGURATION:
        return {...state, list_mail_config: payload};

      case GET_MAIL_ROLE_BY_ID:
        return {
          ...state, 
          mail_role_config: payload.data,
          mail_role_config_count: payload.numRows
        };

      case UPDATE_MAIL_CONFIGURATION:
        return {...state, mail_role_config: payload};

      case GET_ALL_SMS_CONFIGURATION:
        return {...state, list_sms_config: payload};

      case SET_LIST_SMS:
        return {
          ...state, 
          sms_role_config: payload.data,
          sms_role_config_count: payload.numRows
        };

      case GET_SMS_CONFIGURATION_BY_ID:
        return {...state, sms_configuration: payload};

      case UPDATE_SMS_CONFIGURATION:
        return {...state, sms_role_config: payload.data};

      case SEND_TEST_MAIL_CONFIGURATION:
        return { ...state, testMail: payload }
      
      case SET_SEARCH_MAIL:
        return { 
          ...state, 
          // searchMailData: payload.data,
          // searchMailDataCount: payload.numRows

          mail_role_config: payload.data,
          mail_role_config_count: payload.numRows
        };
      
      case SET_SEARCH_SMS:
        return {
          ...state, 
          // searchSmsData: payload.data,
          // searchSmsDataCount: payload.numRows

          sms_role_config: payload.data,
          sms_role_config_count: payload.numRows
        };

      case SEND_TEST_SMS_CONFIGURATION:
        return {...state, testSMS: payload}

      case REMINDER_CONFIGURATION:
        return {...state,remindeConfiguration: payload}

      default:
        return state;
    }
  }
  
  export default ConfigurationReducer;
  