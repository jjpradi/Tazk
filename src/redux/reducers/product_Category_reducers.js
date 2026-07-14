import {
  CREATE_PRODUCT_CATEGORY,
  LIST_PRODUCT_CATEGORY,
  GET_ID_PRODUCT_CATEGORY,
  EDIT_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY,
} from '../actionTypes';

const initialState = {
  taxcategory: [],
  taxcategory_id_data: [],
};

function productCategoryReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_PRODUCT_CATEGORY:
      return {...state, productcategory: payload};

    case LIST_PRODUCT_CATEGORY:
      return {...state, productcategory: payload};

    case GET_ID_PRODUCT_CATEGORY:
      return {...state, productcategory_id_data: payload};
    //return payload

    case EDIT_PRODUCT_CATEGORY:
      return {...state, productcategory: payload};

    case DELETE_PRODUCT_CATEGORY:
      //return {...state.taxcategory.filter(({ id }) => id !== payload.id)};
      return {...state, productcategory: payload};

    default:
      return state;
  }
}

export default productCategoryReducer;
