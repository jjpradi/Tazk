import {
  CREATE_STOCK_POS,
  LIST_STOCK_POS,
  GET_ID_STOCK_POS,
  EDIT_STOCK_POS,
  DELETE_STOCK_POS,
} from '../actionTypes';

const initialState = {
  stock_pos_list: [],
  stockpos_id_data: [],
};

function stockPosReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_STOCK_POS:
      return {...state, stock_pos_list: payload};

    case LIST_STOCK_POS:
      return {...state, stock_pos_list: payload};

    case GET_ID_STOCK_POS:
      return {...state, stockpos_id_data: payload};
    //return payload

    case EDIT_STOCK_POS:
      return {...state, stock_pos_list: payload};

    case DELETE_STOCK_POS:
      //return {...state.taxcategory.filter(({ id }) => id !== payload.id)};
      return {...state, stock_pos_list: payload};

    default:
      return state;
  }
}

export default stockPosReducer;
