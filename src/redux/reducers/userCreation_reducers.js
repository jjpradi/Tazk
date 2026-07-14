import {
  CREATE_USER_CREATION,
  UPDATE_USER_CREATION,
  STATUS_CREATE_USER_CREATION,
  GET_ALL_USER,
  DELETE_USER,
  EDIT_USER,
  GET_USER_LOCATIONS,
  GET_USER_BY_ID,
  SET_SEARCH_USERCREATION,
  GET_REGISTERED_USER,
  UPDATE_REGISTER_USER,
  UPDATE_DETAILS_COMPANY,
  DEPARTMENT_LIST,
  EMP_VERIFICATION_DETAIL,
  COMPLETED_EMPLOYEE_VALUE,
  LIST_VERIFICATION,
  EMPLOYEE_DETAILS,
  VERIFICATION_TYPE,
  LOCATION_BASE_DEP,
  LOAD_REGISTERED_USER,
  GET_SUBSCRIPTION_RECORDS,
  SET_GET_REGISTERED_USER,
  GET_REJECTED_REQUEST,
  EMP_DOCUMENTS_DETAILS,
  EMP_DOCUMENTS_EMAIL,
  BANK_TRANSACTION_TYPE,
  GET_SHOP_TYPE,
  LIST_EVENTS,
  SESSION_DETAIL,
  GET_THEMES,
  UPDATE_THEMES,
  REPORTING_MANAGER,
  GET_WHATSAPP_LOGS
} from '../actionTypes';

const initialState = {
  userCreation: [],
  createUser: [],
  StatusUserCreation: [],
  update: [],
  all_user_location: [],
  user_by_id:[],
  RegisteredUserGR:[],
  RejectedRequests:[],
  UpdateStatusGR: [],
  update_company : [],
  departmentList : [],
  empVerificationDetail :[],
  empDocumentsDetailList: [],
  completed_index_value : [],
  list_verification: [],
  employeeDetails: {},
  verificationType: [],
  subscription_records: [],
  RegisteredUserGRCount: 0,
  RegisterRequestState: [],
  empDocumentsEmail: [],
  bankTransactionType: [],
  getShopType:[],
  listEvent:[],
  getsessiondetail:[],
  getThemes:[],
  updateThemes:[],
  reportingManager: [],
  getWhatsappLogs:[]
};

function UserCreationReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_ALL_USER:
      return {...state, createUser: payload};
      
    case GET_USER_BY_ID:
      return {...state, user_by_id: payload};
      
    case REPORTING_MANAGER:
      return {...state, reportingManager: payload};

    case GET_USER_LOCATIONS:
      return {...state, all_user_location: payload};

    case CREATE_USER_CREATION:
      return {...state, createUser: payload};

    case UPDATE_USER_CREATION:
      return {...state, userCreation: payload};

    case EDIT_USER:
      return {...state, createUser: payload};

      case GET_SHOP_TYPE:
        return {...state, getShopType: payload};

    case STATUS_CREATE_USER_CREATION:
      return {...state, StatusUserCreation: payload};

    case DELETE_USER:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, createUser: payload};

    case SET_SEARCH_USERCREATION:
      return {
        ...state,
        searchUserCreationData:payload.data, 
        searchUserCreationCount:payload.numRows
      }

    case SET_GET_REGISTERED_USER:
      return { ...state, RegisteredUserGR: payload.data, RegisteredUserGRCount: payload.numRows };

    case GET_REJECTED_REQUEST:
      return { ...state, RejectedRequests: payload.data, RejectedRequestsCount: payload.numRows };

      case GET_SUBSCRIPTION_RECORDS:
        return {...state, subscription_records: payload};
       
      case UPDATE_REGISTER_USER:
      return { ...state, UpdateStatusGR: payload };
    
      case UPDATE_DETAILS_COMPANY:
        return { ...state, update_company: payload };
    
      case DEPARTMENT_LIST:
        return {...state, departmentList: payload};
      
      case EMP_VERIFICATION_DETAIL:
        return {...state, empVerificationDetail: payload }

        case EMP_DOCUMENTS_DETAILS:
        return {...state, empDocumentsDetailList: payload }

        case EMP_DOCUMENTS_EMAIL:
          return {...state, empDocumentsEmail: payload }

      case COMPLETED_EMPLOYEE_VALUE :
        return {...state, completed_index_value : payload }

      case LIST_VERIFICATION:
        return {...state, list_verification : payload }
        
      case EMPLOYEE_DETAILS:
        return {...state, employeeDetails : payload }
        
      case VERIFICATION_TYPE:
        return {...state, verificationType : payload }

      case LOCATION_BASE_DEP:
        return {...state, departmentList : payload }

      case BANK_TRANSACTION_TYPE:
        return {...state, bankTransactionType: payload};

        case LIST_EVENTS:
        return {...state, listEvent: payload};

      case SESSION_DETAIL: 
        return {...state, getsessiondetail: payload};

    case GET_THEMES:
      return { ...state, getThemes: payload }

    case UPDATE_THEMES:
      return { ...state, updateThemes: payload}

      // case LOAD_REGISTERED_USER:
      //   // let data = [...state.RegisteredUserGR]
      //   // let index = data.findIndex((x) => x?.company_id == payload?.company_id)
      //   // if(index !== -1){
      //   //   data[index]=payload;
      //   // }
      //   return {...state, RegisteredUserGR : payload.data }
     case GET_WHATSAPP_LOGS:
      return { ...state, getWhatsappLogs: payload, getWhatsappLogsCount : payload.numRows}  

    default:
      return state;
  }
}

export default UserCreationReducer;
