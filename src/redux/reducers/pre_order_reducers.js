import {CREATE_PRE_ORDERS, GET_ALL_CANCELLED_ORDERS, GET_ALL_PRE_ORDERS, SET_SEARCH_PRE_ORDER} from '../actionTypes';

const initialState = {
  pre_orders: [],
  cancelledPreOrders:[]
};

function preOrderReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    // case CREATE_PRE_ORDERS:
    //   return {...state,product:payload};

    case GET_ALL_PRE_ORDERS:
    case SET_SEARCH_PRE_ORDER:
      return {...state, pre_orders: payload};

      case GET_ALL_CANCELLED_ORDERS:
        return {...state, cancelledPreOrders: payload};

    default:
      return state;
  }
}

export default preOrderReducer;
