import {
  GET_PRODUCT_ERP_DETAILS,
  GET_CUSTOMER_ERP_DETAILS,
} from '../actionTypes';

const initialState = {
  erp_type: '',
  product_erp_details: [],
  customer_erp_details: [],
};

function erpDetailsReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_PRODUCT_ERP_DETAILS:
      return {...state, product_erp_details: payload, erp_type: 'product'};

    case GET_CUSTOMER_ERP_DETAILS:
      return {...state, customer_erp_details: payload, erp_type: 'customer'};

    default:
      return state;
  }
}

export default erpDetailsReducer;
