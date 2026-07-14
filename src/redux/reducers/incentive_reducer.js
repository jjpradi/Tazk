import {
   CREATE_INCENTIVE, GET_INCENTIVE_DATA, UPDATE_INCENTIVE
  } from '../actionTypes';
  
  const initialState = {
    processedincentive: [],
    monthDetails:[]
  };
  
  function incentiveReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
      case CREATE_INCENTIVE:
        return { ...state, processedincentive: payload };
      case UPDATE_INCENTIVE:
        let arr = [...state.processedincentive]
        if(payload?.index !== -1){
            arr[payload.index].amount = payload.amount;
        }
        return {...state, processedincentive: arr };
        case GET_INCENTIVE_DATA:
          return { ...state, monthDetails: payload };
      default:
        return state;
    }
  }
  
export default incentiveReducer;
  