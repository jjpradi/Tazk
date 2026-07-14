import {
  LIST_DISCOUNT_TYPE,
  CREATE_DISCOUNT_TYPE,
  EDIT_DISCOUNT_TYPE,
  DELETE_DISCOUNT_TYPE,
} from '../actionTypes';

const initialState = {
  discount_type_list: [],
};

function discountTypeReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_DISCOUNT_TYPE:
      return {...state, discount_type_list: payload};

    case CREATE_DISCOUNT_TYPE:
      return {...state, discount_type_list: payload};

    case EDIT_DISCOUNT_TYPE:
      return {...state, discount_type_list: payload};

    case DELETE_DISCOUNT_TYPE:
      return {...state, discount_type_list: payload};

    default:
      return state;
  }
}

export default discountTypeReducer;
