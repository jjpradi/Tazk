import {
  CREATE_QUOTATIONS,
  GET_QUOTATIONS,
  SET_SEARCH_QUOTATION,
  GET_QUOTATION_SEQUENCE,
  QUOTATION_PDF,
  QUOTATION_CONFIG,
  GET_QUOTATION_APPROVALS,
  GET_QUOTATION_BY_ID,
  QUOTATION_AMOUNT_DISCOUNT,
  QUOTATION_CONFIG_AMOUNT_DISCOUNT,
  QUOTATION_BY_CUSTOMER,
  QUOTATION_TIMELINE_DATA
} from "redux/actionTypes";

const initialState = {
  quotations: [],
  searchQuotation:[],
  quotationSequence: [],
  quotationPdf: [],
  quotationConfig: [],
  quotationApprovals: [],
  quotationApprovalsTotalCount: 0,
  quotationApprovalsUnseenCount: 0,
  quotationById: [],
  quotationAmountAndDiscount : [],
  quotationConfigAmountDiscount: [],
  quotationByCustomer: {data: []},
  quotationTimelineData:[]
}

function quotationReducer(state = initialState, action){
  const { type, payload } = action
  switch(type){
    case CREATE_QUOTATIONS:
      return {...state, quotations: payload}

    case GET_QUOTATIONS:
      return {...state, quotations: payload}

    case SET_SEARCH_QUOTATION:
      return {...state, quotations: payload}
    
    case GET_QUOTATION_SEQUENCE:
      return {...state, quotationSequence: payload}

    case QUOTATION_PDF:
      return {...state, quotationPdf: payload}

    case QUOTATION_CONFIG:
      return {...state, quotationConfig: payload}
      
    case QUOTATION_CONFIG_AMOUNT_DISCOUNT:
      return {...state, quotationConfigAmountDiscount: payload}

    case GET_QUOTATION_APPROVALS:
      return {...state, quotationApprovals: payload.data, quotationApprovalsUnseenCount: payload.unseenCount, quotationApprovalsTotalCount: payload.totalCount}

    case GET_QUOTATION_BY_ID:
      return {...state, quotationById: payload}

    case QUOTATION_AMOUNT_DISCOUNT : 
      return {...state, quotationAmountAndDiscount : payload}

    case QUOTATION_BY_CUSTOMER:
      return { ...state, quotationByCustomer: payload }

    case QUOTATION_TIMELINE_DATA:
      return { ...state, quotationTimelineData: payload }

    default: 
      return {...state}
  }
}

export default quotationReducer