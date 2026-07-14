import {
  CREATE_TAX_CATEGORY,
  LIST_TAX_CATEGORY,
  GET_ID_TAX_CATEGORY,
  EDIT_TAX_CATEGORY,
  DELETE_TAX_CATEGORY,
} from '../actionTypes';

const initialState = {
  taxcategory: [],
  taxcategory_id_data: [],
};

function taxCategoryReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX_CATEGORY:
      return {...state, taxcategory: payload};

    case LIST_TAX_CATEGORY:
      return {...state, taxcategory: payload};

    case GET_ID_TAX_CATEGORY:
      return {...state, taxcategory_id_data: payload};
    //return payload

    case EDIT_TAX_CATEGORY:
      return {...state, taxcategory: payload};

    case DELETE_TAX_CATEGORY:
      //return {...state.taxcategory.filter(({ id }) => id !== payload.id)};
      return {...state, taxcategory: payload};

    default:
      return state;
  }
}

export default taxCategoryReducer;
