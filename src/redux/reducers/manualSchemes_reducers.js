import {
   GET_ALL_MANUAL_SCHEMES,
   CREATE_MANUAL_SCHEMES,
   SET_SEARCH_MANUALSCHEMES
  } from '../actionTypes';
  
  const initialState = {
    manualSchemes: [],
    createStatus:0,
    searchManualSchemesData:[],
    searchManualSchemesCount: 0,
  };
  
  function manualSchemesReducer(state = initialState, action) {
    const {type, payload} = action;
  
    switch (type) {
      case GET_ALL_MANUAL_SCHEMES:
        return {
          ...state,
          manualSchemes: payload,
          createStatus :0
          // individualNotes: payload.individualNotes,
        };
  
      case CREATE_MANUAL_SCHEMES:
        return {
          ...state,
          createStatus: payload,
        };

      case SET_SEARCH_MANUALSCHEMES:
        return {
          ...state,
          searchManualSchemesData:payload.data, 
          searchManualSchemesCount:payload.numRows
        }

      default:
        return state;
    }
  }
  
  export default manualSchemesReducer;
  