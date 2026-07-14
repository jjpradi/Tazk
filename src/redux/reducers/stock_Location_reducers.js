import {
  CREATE_STOCK_LOCATION,
  LIST_STOCK_LOCATION,
  GET_ID_STOCK_LOCATION,
  EDIT_STOCK_LOCATION,
  DELETE_STOCK_LOCATION,
  ALL_LIST_STOCK_LOCATIN,
  LOCATION_TYPE,
  GET_ID_SOURCE_LOCATION,
  GET_ID_DESTINATION_LOCATION,
  GET_SEARCH_LOCATION,
  SET_SEARCH_LOCATION,
  GPS_LOCATION_ACTIVATION
} from '../actionTypes';

const initialState = {
  stocklocation: [],
  stocklocation_id_data: [],
  allliststocklocation: [],
  location_type:[],
  get_source_locationdata : [],
  get_destination_location : [],
  search_location_data : [],
  search_location_count : [],
  gps_location_activation : []
};

function stockLocationReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_STOCK_LOCATION:
      return {...state, stocklocation: payload};

    case LIST_STOCK_LOCATION:
      return {...state, stocklocation: payload};

    case ALL_LIST_STOCK_LOCATIN:
      return {...state, allliststocklocation: payload};

    case GET_ID_STOCK_LOCATION:
      return {...state, stocklocation_id_data: payload};
    //return payload

    case EDIT_STOCK_LOCATION:
      return {...state, stocklocation: payload};

    case DELETE_STOCK_LOCATION:
      //return {...state.taxcategory.filter(({ id }) => id !== payload.id)};
      return {...state};

    case LOCATION_TYPE :
       return {...state, location_type: payload};

       case GET_ID_SOURCE_LOCATION :
        return {...state, get_source_locationdata: payload};

        case GET_ID_DESTINATION_LOCATION :
          return {...state, get_destination_location: payload};

          case SET_SEARCH_LOCATION:
            return {
              ...state,
              search_location_data:payload.data, 
              search_location_count:payload.numRows
            }

    case GPS_LOCATION_ACTIVATION :
       return {...state, gps_location_activation: payload};

    default:
      return state;
  }
}

export default stockLocationReducer;
