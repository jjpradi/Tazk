import {
  CREATE_TAX_RATE,
  LIST_TAX_RATE,
  GET_ID_TAX_RATE,
  EDIT_TAX_RATE,
  DELETE_TAX_RATE,
  SET_SEARCH_TAX_RATE
} from '../actionTypes';

const initialState = {
  taxrate: [],
  taxrateCount: 0,
  taxrate_id_data: [],
  searchTaxRatesData:[],
  searchTaxRatesDataCount: 0
};

function TaxRateReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX_RATE:
      return {...state, taxrate: payload};

    case LIST_TAX_RATE:
      return {
        ...state, 
        taxrate: payload.data,
        taxrateCount: payload.numRows
      };

    case GET_ID_TAX_RATE:
      return {...state, taxrate_id_data: payload};
    //return payload

    case EDIT_TAX_RATE:
      return {...state, taxrate: payload};

    case DELETE_TAX_RATE:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return { ...state, deleteTaxrate: payload };
    
    case SET_SEARCH_TAX_RATE:
      return {
        ...state, 
        // searchTaxRatesData: payload.data,
        // searchTaxRatesDataCount: payload.numRows

        taxrate: payload.data,
        taxrateCount: payload.numRows
      };

    default:
      return state;
  }
}

export default TaxRateReducer;
