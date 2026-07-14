import {
  CREATE_TAX_JURISDICTION,
  LIST_TAX_JURISDICTION,
  GET_ID_TAX_JURISDICTION,
  EDIT_TAX_JURISDICTION,
  DELETE_TAX_JURISDICTION,
} from '../actionTypes';

const initialState = {
  taxjurisdiction: [],
  taxjurisdiction_id_data: [],
};

function taxjurisdictionReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX_JURISDICTION:
      return {...state, taxjurisdiction: payload};

    case LIST_TAX_JURISDICTION:
      return {...state, taxjurisdiction: payload};

    case GET_ID_TAX_JURISDICTION:
      return {...state, taxjurisdiction_id_data: payload};
    //return payload

    case EDIT_TAX_JURISDICTION:
      return {...state, taxjurisdiction: payload};

    case DELETE_TAX_JURISDICTION:
      return {...state, taxjurisdiction: payload};

    default:
      return state;
  }
}

export default taxjurisdictionReducer;
