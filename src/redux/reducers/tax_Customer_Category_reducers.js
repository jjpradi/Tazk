import {
  CREATE_TAX_CUSTOMER_CATEGORY,
  LIST_TAX_CUSTOMER_CATEGORY,
  GET_ID_TAX_CUSTOMER_CATEGORY,
  EDIT_TAX_CUSTOMER_CATEGORY,
  DELETE_TAX_CUSTOMER_CATEGORY,
} from '../actionTypes';

const initialState = {
  taxcustomercategory: [],
  taxcustomercategory_id_data: [],
};

function taxCustomerCategoryReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TAX_CUSTOMER_CATEGORY:
      return {...state, taxcustomercategory: payload};

    case LIST_TAX_CUSTOMER_CATEGORY:
      return {...state, taxcustomercategory: payload};

    case GET_ID_TAX_CUSTOMER_CATEGORY:
      return {...state, taxcustomercategory_id_data: payload};
    //return payload

    case EDIT_TAX_CUSTOMER_CATEGORY:
      return {...state, taxcustomercategory: payload};

    case DELETE_TAX_CUSTOMER_CATEGORY:
      //return {...state.taxcustomercategory.filter(({ id }) => id !== payload.id)};
      return {...state, taxcustomercategory: payload};

    default:
      return state;
  }
}

export default taxCustomerCategoryReducer;
