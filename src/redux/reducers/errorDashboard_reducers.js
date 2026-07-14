import {
    GET_ALL_ERROR_DASHBOARD_LIST, GET_DEVELOPERS_DETAILS
  } from '../actionTypes';
  
  const initialState = {
    error_dashboard_list: [],
    error_dashboard_list_count: 0,
    error_dashboard_list_pendingCount: 0,
    error_dashboard_list_fixedCount: 0,
    developers_details:[]
  };
  
  function ErrorDashboardReducer(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
      case GET_ALL_ERROR_DASHBOARD_LIST:
        return {
          ...state, 
          error_dashboard_list: payload.data,
          error_dashboard_list_count: payload.numRows,
          error_dashboard_list_pendingCount: payload.pendingCount,
          error_dashboard_list_fixedCount: payload.fixedCount,
        };
      
      case GET_DEVELOPERS_DETAILS:
        return {
          ...state, 
          developers_details: payload.data,
        };

      default:
        return state;
    }
  }
  
  export default ErrorDashboardReducer;
  