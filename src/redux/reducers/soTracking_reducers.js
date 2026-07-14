import {
  GET_BY_SALES_STATUS_ON_HOLD,
  GET_BY_SALES_STATUS_READY_TO_SHIP,
  GET_INVOICE_DATE_FILTER_DATA,
  SET_STATUS_IN_TRANSIT,
  ALL_EMP
} from '../actionTypes';

const initialState = {
  onHoldOrders: [],
  billedOrders: [],
  allemp:[]
};

function soTrackingReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_BY_SALES_STATUS_ON_HOLD:
      return {...state, onHoldOrders: payload};

    case GET_BY_SALES_STATUS_READY_TO_SHIP:
      return {...state, billedOrders: payload};

    case GET_INVOICE_DATE_FILTER_DATA:
      console.log(payload,'djhhfbckdjsbcbsdhb7878')
      return {...state, billedOrdersFilter: payload.data , billedOrdersFilterCount : payload.numPerPage};

    case SET_STATUS_IN_TRANSIT:
      return {...state, billedOrders: payload};
      case ALL_EMP:
        return {...state, allemp: payload};
    default:
      return state;
  }
}

export default soTrackingReducer;
