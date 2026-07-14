import { retry } from 'redux-saga/effects';
import {
  CREATE_CUSTOMER,
  LIST_CUSTOMER,
  GET_ID_CUSTOMER,
  EDIT_CUSTOMER,
  DELETE_CUSTOMER,
  TOTAL_CUSTOMER_COUNT,
  GET_ALL_CUSTOMER,
  GET_CUSTOMER_STATEMENT_BY_ID,
  RESET_GET_CUSTOMER_STATEMENT_BY_ID,
  GET_FILTER_LIST,
  GET_CUSTOMER_SALESMAN,
  SALESMAN_INSERT,
  LIST_SALESMAN,
  STARED_CHANGE,
  STARED_DETAILS_EDIT,
  CUSTOMER_AS_COMPANY,
  SET_SEARCH_CONTACTS,
  INVOICE_CUSTOMER,
  CUSTOMER_SALE_DETAILS,
  CUSTOMER_DETAILS,
  LIST_PICK_CUSTOMER,
  PICK_CUSTOMER_SET_SEARCH_CONTACTS,
  FOLLOW_USER,
  FOLLOW_REQUEST_USER,
  LIST_FOLLOW_REQUEST,
  FOLLOW_LIST,
  ADDITIONAL_CONTACTS,
  ADDITIONAL_SHIPPING_ADDRESS,
  EDIT_ADDITIONAL_CONTACTS,
  EDIT_ADDITIONAL_SHIPPING_ADDRESS,
  UPDATE_CREDIT_DAYS,
  GET_CUSTOMER_OUTSTANDING,
  OUTSTANDING_BY_CUSTOMER,
  GET_CUSTOMER_OUTSTANDING_DUES,
  CUSTOMER_INVOICE,
  CUSTOMER_PAYMENT,
  CUSTOMER_DELIVERY_CHALLAN,
  CUSTOMER_QUOTES,
  CUSTOMER_CREDIT_NOTE,
  RESET_OUTSTANDING_BY_CUSTOMER,
  SHARE_OUTSTANDING_REPORT,
  OUTSTANDING_REPORT_TEMP,
  LIST_SELECT_CUSTOMER,
  GET_UPDATE_OTHER_DETAILS,
  CUST_ADDRESS_UPDATE,
  CUST_GST_UPDATE,
  CUST_PORTAL_UPDATE
} from '../actionTypes';

const initialState = {
  customer: [],
  customerCount: 0,
  customer_filter: [],
  customer_id_data: [],
  Get_all_customer: [],
  customer_count: 0,
  Get_customer_statement: [],
  getcustomersalesman:[],
  customer_mapping:[],
  stared:[],
  stared_edit_details: [],
  customerAsCompany: [],
  customer_paginate : [],
  customer_paginateCount : 0,
  customer_invoice: [],
  customerSalesDetailById: [],
  customerDetailById: [],
  pickCustomer: [],
  pickCustomerCount: 0,
  follow_user : [],
  follow_list : [],
  request_user : [],
  list_request : [],
  additional_contacts:[],
  additionalShippingAddress:[],
  editAdditionalContacts:[],
  editAdditionalShippingAddress:[],
  updateCreditDays:[],
  getCustomerOutstanding:[],
  outstandingByCustomer: [],
  getCustomerOutstandingDues : [],
  customerInvoice : [],
  customerPayment : [],
  customerDelverChallan : [],
  customerCreditNote : [],
  customerQuotes : [],
  shareOutstandingReport : [],
  outstandingReportTemp : [],
  getOtherDetails: [],
  custPortalUpdate: [],
  custGstUpdate: [],
  custAddUpdate: [],
};

function customerReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    // case CREATE_CUSTOMER:
    //   return {...state, customer: payload};

    case CREATE_CUSTOMER: {
      const safeCustomerList = Array.isArray(state.customer) ? state.customer : [];
      return {
        ...state,
        customer: Array.isArray(payload) ? payload : [...safeCustomerList],
      };
    }

    case LIST_CUSTOMER:
      return {
        ...state, 
        customer: payload
      };
      case UPDATE_CREDIT_DAYS:
      return {
        ...state, 
        updateCreditDays: payload
      };
      case GET_CUSTOMER_OUTSTANDING:
        return {
          ...state, 
          getCustomerOutstanding: payload
        };

      case GET_CUSTOMER_OUTSTANDING_DUES:
        return {
          ...state, 
          getCustomerOutstandingDues: payload
        };

    case LIST_PICK_CUSTOMER:
      return {
        ...state, 
        pickCustomer: payload.data,
        pickCustomerCount: payload.numRows
      };

    case LIST_SELECT_CUSTOMER:
      return {
        ...state, 
        selectCustomer: payload,
        selectCustomerCount: payload.length
      };

    case PICK_CUSTOMER_SET_SEARCH_CONTACTS:
      return {
        ...state, 
        pickCustomer: payload.data,
        pickCustomerCount: payload.numRows
      };

    case GET_CUSTOMER_SALESMAN:
      return {...state, getcustomersalesman: payload};

    case GET_FILTER_LIST:
      return {...state, customer_filter: payload};

    case GET_ALL_CUSTOMER:
      return {...state, Get_all_customer: payload};

    case GET_ID_CUSTOMER:
      return {...state, customer_id_data: payload};
    //return payload

    case GET_CUSTOMER_STATEMENT_BY_ID:
      return {...state, Get_customer_statement: payload};

    case GET_UPDATE_OTHER_DETAILS:
      return {...state, getOtherDetails: payload};

    case RESET_GET_CUSTOMER_STATEMENT_BY_ID:
      return {...state, Get_customer_statement: []};

    case EDIT_CUSTOMER:
      return {...state, customer: payload};

    case TOTAL_CUSTOMER_COUNT:
      return {...state, customer_count: payload};

    case DELETE_CUSTOMER:
      //return {...state.customer.filter(({ id }) => id !== payload.id)};
      return {...state, customer: payload};
    
    case SALESMAN_INSERT:
      return {...state, getcustomersalesman:payload }
    
    case LIST_SALESMAN:
       return {...state,customer_mapping:payload}

    case STARED_CHANGE:
       return {...state, stared:payload}

    case  STARED_DETAILS_EDIT:
      return { ...state, stared_edit_details: payload }
    
    case  CUSTOMER_AS_COMPANY:
      return {...state, customerAsCompany:payload}

      case  SET_SEARCH_CONTACTS:
        return {...state, customer_paginate:payload.data,
          customer_paginateCount:payload.numRows}

    case  INVOICE_CUSTOMER:
      return { ...state, customer_invoice: payload }
    
    case CUSTOMER_SALE_DETAILS:
      return { ...state, customerSalesDetailById: payload }
    
    case CUSTOMER_DETAILS:
      return { ...state, customerDetailById: payload }

      case FOLLOW_USER:
      return { ...state, follow_user: payload }
    
    
      case FOLLOW_LIST:
        return { ...state, follow_list: payload }

        case FOLLOW_REQUEST_USER:
          return { ...state, request_user: payload }

          case LIST_FOLLOW_REQUEST:
          return { ...state, list_request: payload }

          case ADDITIONAL_CONTACTS:
          return { ...state, additional_contacts: payload }

          case ADDITIONAL_SHIPPING_ADDRESS:
          return { ...state, additionalShippingAddress: payload }

          case EDIT_ADDITIONAL_CONTACTS:
            return { ...state, editAdditionalContacts: payload }

            case EDIT_ADDITIONAL_SHIPPING_ADDRESS:
              return { ...state, editAdditionalShippingAddress: payload }

      case OUTSTANDING_BY_CUSTOMER:
        return { ...state, outstandingByCustomer: payload }

      case RESET_OUTSTANDING_BY_CUSTOMER:
        return {...state, outstandingByCustomer: payload}
      case CUSTOMER_INVOICE : 
      return {...state , customerInvoice : payload}

      case CUSTOMER_PAYMENT : 
      return {...state , customerPayment : payload}

      case CUSTOMER_DELIVERY_CHALLAN : 
      return {...state , customerDelverChallan : payload}

      case CUSTOMER_QUOTES : 
      return {...state , customerQuotes : payload}

      case CUSTOMER_CREDIT_NOTE : 
      return {...state , customerCreditNote : payload}

      case SHARE_OUTSTANDING_REPORT : 
      return {...state , shareOutstandingReport : payload}

      case OUTSTANDING_REPORT_TEMP : 
      return {...state , outstandingReportTemp : payload}

      case CUST_ADDRESS_UPDATE : 
      return {...state , custAddUpdate : payload}

      case CUST_GST_UPDATE : 
      return {...state , custGstUpdate : payload}

      case CUST_PORTAL_UPDATE : 
      return {...state , custPortalUpdate : payload}

    default:
      return state;

    
  }
}

export default customerReducer;
