import {
    LIST_SPECIALPERMISSION,
    CREATE_SPECIALPERMISSION,
    GET_BY_ID_SPECIALPERMISSION,
    UPDATE_SPECIALPERMISSION,
    DELETE_SPECIALPERMISSION,
    SET_SEARCH_SPECIALPERMISSION,
    GET_SPL_PERMISSION_CREATED_YEARS
  } from '../actionTypes';
  
  const initialState = {
    specialPermissionlist: [],
    specialPermissiongetbyid: [],
    searchSpecialPermissionData: [],
    getSpecialPermissionCreatedYears:[]
  };
  
  function SpecialPermissionReducers(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
      case LIST_SPECIALPERMISSION:
        return { ...state, specialPermissionlist: payload };
      case CREATE_SPECIALPERMISSION:
        return { ...state, specialPermissionlist: payload };
      case GET_BY_ID_SPECIALPERMISSION:
        return { ...state, specialPermissiongetbyid: payload };
      case UPDATE_SPECIALPERMISSION:
        return { ...state, specialPermissionlist: payload };
      case DELETE_SPECIALPERMISSION:
        return { ...state, specialPermissionlist: payload };
  
      case SET_SEARCH_SPECIALPERMISSION:
        return {...state, searchSpecialPermissionData: payload};
      case GET_SPL_PERMISSION_CREATED_YEARS:
        return {...state, getSpecialPermissionCreatedYears: payload};
  
      default:
        return state;
    }
  }
  
  export default SpecialPermissionReducers;
  