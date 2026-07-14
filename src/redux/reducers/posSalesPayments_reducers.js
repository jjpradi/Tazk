import {LIST_POS_SALES_PAYMENTS} from '../actionTypes';

const initialState = {
  pos_sales_payments: [],
};

function posSalesPaymentsReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_POS_SALES_PAYMENTS:
      return {...state, pos_sales_payments: payload};

    default:
      return state;
  }
}

export default posSalesPaymentsReducer;
