import {GET_APP_CONFIG_DATA, UPDATE_APP_CONFIG_DATA,GET_PREFIX_CONFIG_DATA,SMS_MAIL_CONFIG_UPDATE, GET_APP_CONFIG_WITH_COMPANY_INFO, SET_CHECK_EXISTS, UPDATE_APP_CONFIG_WITH_COMPANY_INFO, GET_MANUAL_ATT_EMP,GET_EINVOICE_DETAILS, GET_APP_CONFIG_DATA_BASED_ON_TYPE, GET_SUB_COMPANY_DETAILS} from '../actionTypes';

const initialState = {
  app_config_data: [],
  getprefix_data: [],
  updateMail:[],
  getManualAttEmp:[],
  appConfigWithCompanyInfo: [],
  checkExists: {},
  getEinvoiceDetails:[],
  app_config_data_based_on_type:[],
  sub_company_details : []
};

function appConfigReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_APP_CONFIG_DATA:
      return {...state, app_config_data: payload};
      case GET_APP_CONFIG_DATA_BASED_ON_TYPE:
        return {...state, app_config_data_based_on_type: payload};
    case GET_APP_CONFIG_WITH_COMPANY_INFO:
      return {...state, appConfigWithCompanyInfo: payload}

    case SET_CHECK_EXISTS:
      return { ...state, checkExists: payload };

    case UPDATE_APP_CONFIG_DATA:
      return {...state, app_config_data: payload};

    case UPDATE_APP_CONFIG_WITH_COMPANY_INFO:
      return {...state, appConfigWithCompanyInfo: payload}
      
      case GET_PREFIX_CONFIG_DATA:
        return {...state, getprefix_data: payload};


       case SMS_MAIL_CONFIG_UPDATE:
        return {...state, updateMail: payload};

        case GET_MANUAL_ATT_EMP:
        return {...state, getManualAttEmp: payload};

        case GET_EINVOICE_DETAILS:
        return {...state, getEinvoiceDetails: payload};

        case GET_SUB_COMPANY_DETAILS :
          return {...state, sub_company_details: payload};
        

    default:
      return state;
  }
}

export default appConfigReducer;
