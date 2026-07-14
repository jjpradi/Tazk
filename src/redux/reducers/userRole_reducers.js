import Designation from 'pages/common/ListOfValues/Designation';
import {GET_USER_ROLE, GET_EVENT_NAME, GET_LOGIN_TOKEN, GET_LOGIN_ROLE,RESET_STORE,GET_CHILD_MODULES, ROUTES_CONFIG, ENABLE_NEW_ROUTES,DESIGNATION,DELETE_DESIGNATION,ADD_DESIGNATION, SET_SEARCH_DESIGNATION,USER_RIGHTS, REPORTS_CONFIG, SET_SEARCH_TRAINING_TYPE, TRAINING_TYPE, ADD_TRAINING_TYPE, PLAN_TYPE, SET_SEARCH_PLAN_TYPE, ADD_PLAN_TYPE, SET_SEARCH_BENEFITS, BENEFITS, GET_BANK_REPORT_COLUMNS} from '../actionTypes';

const initialState = {
  userRole: [],
  eventName : [],
  loginToken: [],
  loginRole: [],
  logout : null,
  getchildmodule : [],
  routesConfigFromDB: [],
  enableNewRoutes: false,
  designation :[],
  deleteDesignation :[],
  addDesignation :[],
  userRights:[],
  companyReportsConfig:[],
  addTrainingType: [],
  trainingType: [],
  addPlanType: [],
  planType: [],
  benefits: [],
  reportColumns: []
};

function UserRoleReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_USER_ROLE:
      return {...state, userRole: payload};

    case GET_EVENT_NAME:
      return {...state, eventName : payload};

    case GET_BANK_REPORT_COLUMNS:
      return { ...state, reportColumns: payload };
      
    case GET_LOGIN_TOKEN:
      return {...state, loginToken: payload};
    case GET_LOGIN_ROLE:
      return {...state, loginRole: payload};
      case GET_CHILD_MODULES:
        return {...state, getchildmodule: payload};
      case RESET_STORE:
        return initialState;
      case  ROUTES_CONFIG:
        return {...state, routesConfigFromDB: payload};
      case  ENABLE_NEW_ROUTES:
        return {...state, enableNewRoutes: payload};
      
        case  DESIGNATION:
          case SET_SEARCH_DESIGNATION:
        return {...state, designation: payload};
      
        case  BENEFITS:
          case SET_SEARCH_BENEFITS:
        return {...state, benefits: payload};
      
        case  PLAN_TYPE:
          case SET_SEARCH_PLAN_TYPE:
        return {...state, planType: payload};
      
        case  TRAINING_TYPE:
          case SET_SEARCH_TRAINING_TYPE:
        return {...state, trainingType: payload};

        case  ADD_DESIGNATION:
        return {...state, addDesignation: payload};

        case  ADD_PLAN_TYPE:
        return {...state, addPlanType: payload};

        case  ADD_TRAINING_TYPE:
        return {...state, addTrainingType: payload};

        case  DELETE_DESIGNATION:
        return {...state, deleteDesignation: payload};

        case USER_RIGHTS:
          return{...state,userRights: payload}

        case REPORTS_CONFIG:
            return{...state,companyReportsConfig: payload}

    default:
      return state;
  }
}

export default UserRoleReducer;
