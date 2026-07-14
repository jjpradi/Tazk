import {
    GET_ADVANCE_SHEET,
    UPDATE_ADVANCE_SHEET,
    GET_ADVANCE_AFTER,
    GET_CHILD_DATA
  } from '../actionTypes';
  
  const initialState = {
    advancesheet: [],
    updatesheet : [],
    afterget : [],
    childget : []
  };
  
  function AdvancesheetReducer(state = initialState, action) {
    const {type, payload} = action;
  
    switch (type) {
      case GET_ADVANCE_SHEET:
        return {...state, advancesheet: payload};

        case UPDATE_ADVANCE_SHEET:
          return {...state, updatesheet: payload};

          case GET_ADVANCE_AFTER:
            return {...state, afterget: payload};

            case GET_CHILD_DATA:
              return {...state, childget: payload};
     
            
      default:
        return state;
    }
  }
  
  export default AdvancesheetReducer;