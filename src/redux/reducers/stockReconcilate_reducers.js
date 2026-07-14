import {
  LIST_STOCK_RECONCILATE,
  LIST_RECONCILATE_PRODUCTS,
  LIST_CHECK_RECONCILATE_PRODUCTS,
  LIST_STOCK_LOT_ITEMS,
  LIST_SYSTEM_STOCK_PRODUCTS,
  MOVE_STOCK_RECONCILATE,
  SET_SEARCH_RECONCILATE_DATA,
  RECONCILIATE_DETAILS_DATA,
  SAVE_RECONCILATE,
  UPADTE_RECONCILED_DATA
} from '../actionTypes';

const initialState = {
  stockReconcilate: [],
  reconcilateProducts: [],
  checkReconcilateProducts: [],
  stockLotItems: [],
  systemStock: [],
  searchReconcilateValue: [],
  searchReconcilate_count: 0,
  reconciliateDetails: {},
  saveReconcilate:[]
};

function stockReconcilateReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_STOCK_RECONCILATE:
      return {...state, stockReconcilate: payload};
    
    case MOVE_STOCK_RECONCILATE:
      return {...state,stockReconcilate:payload };

    case LIST_RECONCILATE_PRODUCTS:
      return {...state, reconcilateProducts: payload};

    case LIST_CHECK_RECONCILATE_PRODUCTS:
      return {...state, checkReconcilateProducts: payload};

    case LIST_STOCK_LOT_ITEMS:
      return {...state, stockLotItems: payload};

    case LIST_SYSTEM_STOCK_PRODUCTS:
      return { ...state, systemStock: payload};  
    case SAVE_RECONCILATE:
      return { ...state, saveReconcilate: payload}; 
    case SET_SEARCH_RECONCILATE_DATA:
      return {
        ...state,
        searchReconcilateValue: payload.data ,
        searchReconcilate_count: payload.numRows
      
      };
    
    case RECONCILIATE_DETAILS_DATA:
      return { ...state, reconciliateDetails: payload};

    case UPADTE_RECONCILED_DATA:
      const prevState = state.reconciliateDetails
      const updatedMergedReconciliateDetails = state.reconciliateDetails.mergedArray.map((d) => {
        if(d.id === payload.id){
          return payload.updatedData
        }
        else {
          return d
        }
      })
      return { ...state, reconciliateDetails: { ...prevState, mergedArray: updatedMergedReconciliateDetails } }

    default:
      return state;
  }
}

export default stockReconcilateReducer;
