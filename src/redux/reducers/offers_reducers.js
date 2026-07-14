import {
 GET_OFFERS,
 CREATE_OFFERS
  } from '../actionTypes';

  const initialState = {
  getOfferDetails:[],
  createOffer:[]
  };
  

  function OfferReducer(state = initialState, action) {
    const {type, payload} = action;
  
    switch (type) {
        case GET_OFFERS:
            return {...state, getOfferDetails: payload};
  
     case CREATE_OFFERS:
              return {...state, createOffer: payload};

      

      default:
        return state;
    }
  }
  
  export default OfferReducer;