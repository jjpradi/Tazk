import {
  CREATE_REQUEST_CONFIG,
  DELETE_REQUEST_CONFIG,
  GET_APPROVER_VERIFIER,
  GET_COMPANY_BASED_ADMIN_MANAGER,
  GET_REQUEST_CONFIG,
  GET_MANAGER_BASED_ROUTES,
  GET_REQUEST_CONFIG_BY_ID,
  GET_REQUEST_TYPE,
  GET_REQUEST_VERIFIER_APPROVER,
  GET_SEARCH_COMPANY_BASED_ADMIN_MANAGER,
  SET_SEARCH_COMPANY_BASED_ADMIN_MANAGER,
  SET_SEARCH_REQUEST_CONFIG,
  UPDATE_REQUEST_CONFIG,
  GET_ALL_FRONT_DESK,
  DISCOUNT_CONFIG_BY_POS_ID,
} from 'redux/actionTypes';

const initialState = {
  requestList: [],
  requestgetbyid: [],
  requestCreate: [],
  requestUpdate: [],
  requestDelete: [],
  getRequestType: [],
  searchcompanyBasedAdminManager: [],
  getcompanyBasedAdminManager: [],
  requestConfigSearch: [],
  requestCount: 0,
  approverVerifierType : [],
  getEmpDeptApproverVerifierList: [],
  getManagerBasedRoutes:[],
  getAllFrontDesk: [],
  getAllFrontDeskCount:[],
  posDiscountByPOSId: []
};

function RequestConfigReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case GET_REQUEST_CONFIG:
      return {...state, requestList: payload};
    case CREATE_REQUEST_CONFIG:
      return {...state, requestCreate: payload};
    case GET_REQUEST_CONFIG_BY_ID:
      return {...state, requestgetbyid: payload};
      case GET_MANAGER_BASED_ROUTES:
        return {...state, getManagerBasedRoutes: payload};
    case UPDATE_REQUEST_CONFIG:
      return {...state, requestUpdate: payload};
    case DELETE_REQUEST_CONFIG:
      return {...state, requestDelete: payload};

    case GET_REQUEST_TYPE:
      return {...state, getRequestType: payload};
      
      case GET_REQUEST_VERIFIER_APPROVER:
        return {...state, approverVerifierType: payload};
    case SET_SEARCH_REQUEST_CONFIG:
      return {
        ...state,
        requestConfigSearch: payload.data,
        requestCount: payload.numRows,
      };

    case GET_COMPANY_BASED_ADMIN_MANAGER:
      return {...state, getcompanyBasedAdminManager: payload};

    case SET_SEARCH_COMPANY_BASED_ADMIN_MANAGER:
      return {...state, searchcompanyBasedAdminManager: payload};

      case GET_APPROVER_VERIFIER:
      return {...state, getEmpDeptApproverVerifierList: payload};

    case GET_ALL_FRONT_DESK:
      return { ...state, getAllFrontDesk: payload.data, getAllFrontDeskCount: payload.numRows }

    case DISCOUNT_CONFIG_BY_POS_ID:
      return { ...state, posDiscountByPOSId: payload }

    default:
      return state;
  }
}

export default RequestConfigReducer;
