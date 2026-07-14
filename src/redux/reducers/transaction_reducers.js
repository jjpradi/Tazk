import {
  CREATE_TRANSACTION,
  LIST_TRANSACTION,
  GET_ID_TRANSACTION,
  TOTAL_TRANSACTION_COUNT,
  EDIT_TRANSACTION,
  DELETE_TRANSACTION,
  LIST_TRANSACTION_BY_PAGINATION,
  EXPORT_LIST,
  SET_SEARCH_TRANSACTION
} from '../actionTypes';

const initialState = {
  transaction: [],
  transaction_by_pagination: [],
  transaction_id_data: [],
  transaction_count: 0,
  export:[],
  search_transaction:[],
  search_transaction_count:0,
};

function transactionReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_TRANSACTION:
      return {...state, transaction_by_pagination: payload};

    case LIST_TRANSACTION:
      return {...state, transaction: payload};

    case LIST_TRANSACTION_BY_PAGINATION:
      return {...state, transaction_by_pagination: payload};

    case GET_ID_TRANSACTION:
      return {...state, transaction_id_data: payload};
    //return payload

    case EDIT_TRANSACTION:
      return {...state, transaction_by_pagination: payload};

    case TOTAL_TRANSACTION_COUNT:
      return {...state, transaction_count: payload};

    case DELETE_TRANSACTION:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, transaction_by_pagination: payload};
      
    case EXPORT_LIST:
        return {...state, export: payload};
        

   case SET_SEARCH_TRANSACTION:
          return {
            ...state,
            search_transaction:payload.data, 
            search_transaction_count:payload.numRows
          }

    default:
      return state;
  }
}

export default transactionReducer;
