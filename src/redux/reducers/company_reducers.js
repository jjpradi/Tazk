import {
  COMPANY_LOGO,
    COMPANY_SIGNATURE,
    CREATE_COMPANY, GET_COMPANY_GPS_RADIUS, GET_COMPANY_LIST, GET_INDUSTRY_TYPE, GET_MULTI_TYPES, GET_TYPES,
    UPDATE_DEFAULT_TYPE,
    
  } from '../actionTypes';
  
  const initialState = {
    company: [],
    companyName:[],
    types:[],
    company_logo: [],
    signature: [],
    companyRadiusGps:[],
    getIndustryType: [],
    multiTypes: [],
    defaultType: []
  };
  
  function CompanyReducers(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
    //   case LIST_HOLIDAYS:
    //     return { ...state, holidaylist: payload };
      case CREATE_COMPANY:
        return { ...state, company: payload };
      
        case GET_COMPANY_LIST:
          return {...state, companyName: payload};

          case GET_COMPANY_GPS_RADIUS:
            return {...state, companyRadiusGps: payload};
      
      case GET_TYPES:
        return { ...state, types: payload }
      
      case GET_MULTI_TYPES:
        return { ...state, multiTypes: payload }
      
      case UPDATE_DEFAULT_TYPE:
        return { ...state, defaultType: payload }
  
      case COMPANY_LOGO:
        return { ...state, company_logo: payload }

      case COMPANY_SIGNATURE:
        return { ...state, signature: payload }

      case GET_INDUSTRY_TYPE:
        return { ...state, getIndustryType: payload }
  
      default:
        return state;
    }
  }
  
  export default CompanyReducers;
  