import {
  CREATE_TAX_CODE,
  LIST_TAX_CODE,
  GET_ID_TAX_CODE,
  EDIT_TAX_CODE,
  DELETE_TAX_CODE,
} from '../actionTypes';

const initialState = {
  taxcodes: [],
  taxcodes_id_data: [],
};

function taxCodeReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX_CODE:
      return {...state, taxcodes: payload};

    case LIST_TAX_CODE:
      return {...state, taxcodes: payload};

    case GET_ID_TAX_CODE:
      return {...state, taxcodes_id_data: payload};
    //return payload

    case EDIT_TAX_CODE:
      return {...state, taxcodes: payload};

    case DELETE_TAX_CODE:
      //return {...state.customer.filter(({ id }) => id !== payload.id)};
      return {...state, taxcodes: payload};

    default:
      return state;
  }
}

export default taxCodeReducer;
