import {
  GET_FUEL_PRICE_LIST,
  GET_TRAVEL_DETAILS,
  CREATE_FUEL_PRICE_LIST,
  GET_SALES_MAN_LIST,
  DELETE_FUEL_PRICE_LIST,
  GET_ALLOWANCE_LIST,
  UPDATE_FUEL_PRICE_LIST,
  SALES_MAN_LIVE_TRACKING_DATA,
  GET_FUEL_TYPES,
  GET_FUEL_PRICE_BASED_ON_TYPE,
  GET_SALESMAN_FUEL_DETAILS,
  SEARCH_SALES_MAN_LIST
} from '../actionTypes';

const initialState = {
  fuelPriceList: [],
  travelDetails: [],
  salesManList:[],
  salesManLiveTrackingData:[],
  getFuelTypes:[],
  getFuelPriceBasedOnType:[],
  getSalesmanFuelDetails:[],
  searchSalesManList:[]
};

const fuelAllowanceReducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case GET_FUEL_PRICE_LIST:
      return {...state, fuelPriceList: payload};
    case GET_TRAVEL_DETAILS:
      return {...state, travelDetails: payload};
    case CREATE_FUEL_PRICE_LIST:
      return {...state, fuelPriceList: payload};
    case GET_SALES_MAN_LIST:
      return {...state, salesManList: payload};
    case DELETE_FUEL_PRICE_LIST:
      return {...state, fuelPriceList: payload};
    case GET_ALLOWANCE_LIST:
      return{...state, travelDetails: payload};
    case UPDATE_FUEL_PRICE_LIST:
      return{...state, fuelPriceList: payload};
    case SALES_MAN_LIVE_TRACKING_DATA:
      return{...state, salesManLiveTrackingData: payload};
    case GET_FUEL_TYPES:
      return{...state, getFuelTypes: payload};
    case GET_FUEL_PRICE_BASED_ON_TYPE:
      return{...state, getFuelPriceBasedOnType: payload};
    case GET_SALESMAN_FUEL_DETAILS:
      return{...state, getSalesmanFuelDetails: payload};
    case SEARCH_SALES_MAN_LIST:
      return{...state, searchSalesManList: payload};
    default:
      return state;
  }
};

export default fuelAllowanceReducer;