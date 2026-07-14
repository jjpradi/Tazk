import {
  CREATE_LEADS,
  LIST_LEADS,
  GET_ID_LEADS,
  TOTAL_LEADS_COUNT,
  EDIT_LEADS,
  DELETE_LEADS,
  LIST_LEADS_BY_PAGINATION,
  SET_SEARCH_LEADS
} from '../actionTypes';

const initialState = {
  leads: [],
  leads_by_pagination: [],
  leads_id_data: [],
  leads_count: 0,
  search_leads: [],
  search_leads_count : 0
};

function leadsReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_LEADS:
      return {...state, leads_by_pagination: payload};
    case LIST_LEADS:
      return {...state, leads: payload};
    case LIST_LEADS_BY_PAGINATION:
      return {...state, leads_by_pagination: payload};
    case GET_ID_LEADS:
      return {...state, leads_id_data: payload};

    case TOTAL_LEADS_COUNT:
      return {...state, leads_count: payload};

      case SET_SEARCH_LEADS:
        return {
          ...state,
          search_leads:payload.data, 
          search_leads_count:payload.numRows
        }

        
    //return payload
    case EDIT_LEADS:
      return {...state, leads_by_pagination: payload};
    case DELETE_LEADS:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, leads_by_pagination: payload};
    default:
      return state;
  }
}

export default leadsReducer;
