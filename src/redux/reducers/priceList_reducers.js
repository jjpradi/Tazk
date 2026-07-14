import {
  GET_PRICE_LIST,
  GET_PRODUCT_PRICE_LIST,
  GET_PRODUCT_LIST,
  CREATE_PRICE_LIST,
  UPDATE_PRICE_LIST,
  DELETE_PRICE_LIST,
  GET_PRICE_LIST_CUSTOMER,
  GET_PRICE_LIST_ALL_CUSTOMER,
  INSERT_PRICELIST_MAPPING_CUSTOMER,
  SET_SEARCH_PRICE_LIST,
} from '../actionTypes';

const initialState = {
  price_list: [],
  product_price_list: [],
  product_list: [],
  get_price_list_customer: [],
  get_price_list_all_customer: [],
  insert_pricelist_customer_mapping: [],
  searchPriceListData:[],
  searchPriceListCount: 0,
};

const PriceListReducer = (state = initialState, action) => {
  const {type, payload} = action;

  switch (type) {
    case GET_PRICE_LIST:
      return {
        ...state,
        price_list: payload,
      };

    case GET_PRODUCT_PRICE_LIST:
      return {
        ...state,
        product_price_list: payload,
      };

    case GET_PRODUCT_LIST:
      return {
        ...state,
        product_list: payload,
      };

      case CREATE_PRICE_LIST:
      return {
        ...state,
        price_list: payload,
      };

      case UPDATE_PRICE_LIST:
      return {
        ...state,
        price_list: payload,
      };

      case DELETE_PRICE_LIST:
      return {
        ...state,
        price_list: payload,
      };

      case GET_PRICE_LIST_CUSTOMER:
        return {
          ...state,
          get_price_list_customer: payload,
        };

    case GET_PRICE_LIST_ALL_CUSTOMER:
      return {
        ...state,
        get_price_list_all_customer: payload,
      };

    case INSERT_PRICELIST_MAPPING_CUSTOMER:
      return {
        ...state,
        insert_pricelist_customer_mapping: payload,
      };
    
    case SET_SEARCH_PRICE_LIST:
      return {
        ...state,
        searchPriceListData: payload.data,
        searchPriceListCount: payload.numRows
      }

    default:
      return state;
  }
};

export default PriceListReducer;
