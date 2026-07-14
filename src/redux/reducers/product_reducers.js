import {
  CREATE_PRODUCT,
  LIST_PRODUCT,
  PRODUCT_BY_PAGINATION,
  GET_ID_PRODUCT,
  EDIT_PRODUCT,
  TOTAL_PRODUCT_COUNT,
  DELETE_PRODUCT,
  GET_ID_PRODUCT_DATE,
  GET_ID_PRODUCT_MONTH,
  GET_ID_PRODUCT_TILL,
  GET_PRODUCT_HSN_CODE_DETAILS,
  GET_ALL_PRODUCT_BRAND,
  GET_ALL_PRODUCT_CATEGORY,
  GET_INVENTORY_PRODUCT,
  GET_FILTER_INVENTORY_PRODUCT,
  GET_FILTER_SALES_PRODUCT,
  GET_SALES_PRODUCT,
  SET_SEARCH_PRODUCT,
  PURCHASE_PRODUCT_LIST,
  CHECK_PRODUCT,
  TOTAL_PURCHASED_QTY,
  EDIT_LOT_NUMBER,
  GET_LOT_NUMBER_BY_ID,
  SEARCH_PRODUCT_FILTER,
  PRODUCT_SCROLL,
  GET_INVENTORY_SALES_PRODUCT,
  GET_INVENTORY_SALES_ALL_PRODUCT,
  PRODUCT_LIST,
  CATEGORY_BASED_ON_BRAND,
  LIST_LOCATION_PRODUCT,
  DELETE_GR_PRODUCT,
  SET_LIST_GR_PRODUCT,
  SET_SEARCH_SYNC_PRODUCT,
  SET_INITIAL_FREQUENTLY_FILTER,
  SET_FREQUENTLY_FILTERED_BY_POS_ID,
  GET_TAX_RATE,
  HSN_CODE_DETAIL,
  LIST_PRODUCT_BY_TYPE,
  PRODUCT_TIMELINE
} from '../actionTypes';

const initialState = {
  product: [],
  product_id_data: [],
  product_limit_data: [],
  product_id_data_date: [],
  product_id_data_month: [],
  product_id_data_till: [],
  product_count: 0,
  hsn_details: [],
  product_all_brand: [],
  product_all_category: [],
  inventory_product: [],
  inventory_sales_product_list: [],
  filter_inventory_product :[],
  filter_inventory_product_count:0,
  filter_sales_product: [],
  filter_sales_product_count:0,
  sales_product : [],
  productByPagination: [],
  productByPaginationCount: 0,
  check_product: [],
  searchProduct:[],
  searchProductCount: 0,
  purchase_productList : [],
  totalPurchasedQty:0,
  updateLotNumber:[],
  getLotNumberById:[],
  searchproductfilter:[],
  productScroll : [],
  productList : [],
  categoryBasedOnBrand: [],
  locationproduct : [],
  grproducts : [],
  productListCount : [],
  syncproduct:[],
  frequentlyFiltered: {},
  get_tax_rate : [],
  hsnCode : [],
  productByType:[],
  productTimeline: []
};

function productReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_PRODUCT:
      return {...state, product: payload};

    case LIST_PRODUCT:
      return {...state, product: payload,productByType: payload};
    case LIST_PRODUCT_BY_TYPE:
      return {...state, productByType: payload};
    case LIST_LOCATION_PRODUCT:
      return {...state, locationproduct : payload}

    case PRODUCT_BY_PAGINATION:
      return {...state, 
        productByPagination: payload.data,
        productByPaginationCount: payload.numRows
      };

    case GET_ID_PRODUCT:
      return {...state, product_id_data: payload};
    //return payload

    case EDIT_PRODUCT:
      return {...state, product: payload};

    case DELETE_PRODUCT:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, product: payload};

    case GET_ID_PRODUCT_DATE:
      return {...state, product_id_data_date: payload};

    case GET_INVENTORY_SALES_ALL_PRODUCT:
      return {...state, inventory_sales_product_list: payload}

    case GET_INVENTORY_PRODUCT:
      return {...state, inventory_product: payload}

    case GET_ID_PRODUCT_MONTH:
      return {...state, product_id_data_month: payload};

    case GET_ID_PRODUCT_TILL:
      return {...state, product_id_data_till: payload};

    case GET_PRODUCT_HSN_CODE_DETAILS:
      return {...state, hsn_details: payload};

    case TOTAL_PRODUCT_COUNT:
      return {...state, product_count: payload};

    case GET_ALL_PRODUCT_BRAND:
      return {...state, product_all_brand: payload};

    case GET_ALL_PRODUCT_CATEGORY:
      return {...state, product_all_category: payload};

    case GET_FILTER_INVENTORY_PRODUCT:
        return {
          ...state, 
          filter_inventory_product: payload.data,
          filter_inventory_product_count:payload.numRows
        };

    case GET_INVENTORY_SALES_PRODUCT:
      return {
        ...state, 
        inventory_sales_product: payload.data,
        inventory_sales_product_count:payload.numRows
      };
      
    case GET_FILTER_SALES_PRODUCT:
          return {
            ...state, 
            filter_sales_product: payload.data,
            filter_sales_product_count:payload.numRows
          };
    
    case GET_SALES_PRODUCT:
            return {...state, sales_product: payload};
    
    case CHECK_PRODUCT :
           return {...state, check_product: payload};

    case PRODUCT_TIMELINE :
           return {...state, productTimeline: payload};
            
    case SET_SEARCH_PRODUCT:
      return {...state, 
        searchProduct:payload.data,
        searchProductCount: payload.numRows,
      };

    case PURCHASE_PRODUCT_LIST:
      return {...state, purchase_productList: payload};

    case GET_TAX_RATE:
      return {...state, get_tax_rate: payload};

    case TOTAL_PURCHASED_QTY :
        return {...state, totalPurchasedQty: payload};

    case HSN_CODE_DETAIL :
        return {...state, hsnCode: payload};

    case EDIT_LOT_NUMBER :
          return {...state, updateLotNumber: payload};

    case GET_LOT_NUMBER_BY_ID :
          return {...state, getLotNumberById: payload};

    case SEARCH_PRODUCT_FILTER : 
         return {...state, searchproductfilter: payload };

    case PRODUCT_SCROLL : 
         return { ...state, productScroll: payload };
    
    case PRODUCT_LIST : 
         return { ...state, productList: payload };
    
    case CATEGORY_BASED_ON_BRAND : 
         return {...state, categoryBasedOnBrand: payload };

    case SET_LIST_GR_PRODUCT : 
      return {...state, grproducts: payload.data, productListCount: payload.numRows };

    case SET_SEARCH_SYNC_PRODUCT:
      return {...state, syncproduct: payload.data };
        //  case DELETE_GR_PRODUCT : 
        //  let arr = [...state.grproducts]
        //  arr = arr.filter(v => v?.item_id != payload)
        //  return {...state, grproducts: arr };

        
    case SET_INITIAL_FREQUENTLY_FILTER:
      return { ...state, frequentlyFiltered: payload }
    
      case SET_FREQUENTLY_FILTERED_BY_POS_ID: {
        const preState = { ...state.frequentlyFiltered }
        preState[payload.posId] = payload.data
        return { ...state, frequentlyFiltered: preState }
      }
        

    default:
      return state;
  }
}

export default productReducer;
