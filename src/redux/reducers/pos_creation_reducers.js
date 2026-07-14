import {
  CREATE_POS_CREATION,
  LIST_POS_CREATION,
  LOCATION_LIST_POS,
  GET_ID_POS_CREATION,
  EDIT_POS_CREATION,
  DELETE_POS_CREATION,
  GET_VOUCHER_TYPE,
  POST_VOUCHER_TYPE,
  GETALL_VOUCHER_TYPE,
  DELETE_VOUCHER_TYPE,
  UPDATE_VOUCHER_TYPE,
  SET_SEARCH_POS_CREATION
} from '../actionTypes';

const initialState = {
  pos_creation: [],
  pos_creation_id_data: [],
  location_pos:[],
  get_voucher : [],
  post_voucher : [],
  getall_invoices : [],
  update_voucher : [],
  search_poscreate_data : [],
  search_poscreate_count : 0
};

function posCreationReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_POS_CREATION:
      return {...state, pos_creation: payload};

    case LIST_POS_CREATION:
      return {...state, pos_creation: payload};

    case LOCATION_LIST_POS:
        return {...state, location_pos: payload};

    case GET_ID_POS_CREATION:
      return {...state, pos_creation_id_data: payload};
    //return payload

    case EDIT_POS_CREATION:
      return {...state, pos_creation: payload};

    case DELETE_POS_CREATION:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, pos_creation: payload};

    case GET_VOUCHER_TYPE:
      return {...state, get_voucher: payload};
      
      case POST_VOUCHER_TYPE:
        return {...state, post_voucher: payload};

        case GETALL_VOUCHER_TYPE:
          return {...state, getall_invoices: payload};

        case DELETE_VOUCHER_TYPE:
          return {...state, getall_invoices: payload};

          case UPDATE_VOUCHER_TYPE:
            return {...state, update_voucher: payload};

            case SET_SEARCH_POS_CREATION:
              return {
                ...state,
                search_poscreate_data:payload.data, 
                search_poscreate_count:payload.numRows
              }

    default:
      return state;
  }
}

export default posCreationReducer;
