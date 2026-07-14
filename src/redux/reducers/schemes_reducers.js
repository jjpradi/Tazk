import {
  CREATE_SCHEMES,
  LIST_SCHEMES,
  GET_ID_SCHEMES,
  EDIT_SCHEMES,
  DELETE_SCHEMES,
  DASHBOARD_DATA_SCHEMES,
  SET_SEARCH_SCHEMES,
  GET_STATUS,
  SCHEMES_RECEIVABLES
} from '../actionTypes';

const initialState = {
  schemes: [],
  schemes_id_data: [],
  schemesDashBoard: [],
  searchSchemesData: [],
  searchSchemesCount: 0,
  getSchemesStatus:[],
  countSchemesReceivables:[],
  getSchemesReceivables:[],
};

function schemesReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_SCHEMES:
      return {...state, schemes: payload};

    case LIST_SCHEMES:
      return {...state, schemes: payload};

    case GET_ID_SCHEMES:
      return {...state, schemes_id_data: payload};
    //return payload

    case EDIT_SCHEMES:
      return {...state, searchSchemesData: payload};

    case DELETE_SCHEMES:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, schemes: payload};

      case GET_STATUS:
        //return {...state.product.filter(({ id }) => id !== payload.id)};
        return {...state, getSchemesStatus: payload.data};

    case DASHBOARD_DATA_SCHEMES:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, schemesDashBoard: payload};

    case SET_SEARCH_SCHEMES:
      return {
        ...state,
        searchSchemesData:payload.data.data, 
        searchSchemesCount:payload.data.numRows
      };

    case SCHEMES_RECEIVABLES:
      console.log(payload,'payloadsgf',payload.numRows)
      return {
        ...state,
        getSchemesReceivables:payload.data, 
        countSchemesReceivables:payload.numRows
      };
      
    default:
      return state;
  }
}

export default schemesReducer;
