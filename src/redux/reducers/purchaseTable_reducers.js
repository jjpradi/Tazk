import {GET_ID_PURCHASE_TABLE} from '../actionTypes';

const initialState = {
  purchaseTable: [],
  purchaseTable_id_data: [],
};

function purchaseTableReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_ID_PURCHASE_TABLE:
      return {...state, purchaseTable_id_data: payload};

    default:
      return state;
  }
}

export default purchaseTableReducer;
