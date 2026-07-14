import {
  CREATE_VENDOR,
  LIST_VENDOR,
  GET_ID_VENDOR,
  EDIT_VENDOR,
  DELETE_VENDOR,
  LIST_VENDOR_ID_NAME,
  GET_VENDOR_PRICE_LIST,
  PO_TEMP,
  VENDOR_PRICE_LIST_DROP_DOWN,
  VENDOR_PRICE_LIST_PRODUCT,
  ADDITIONAL_CONTACTS_VENDOR,
  SHIPPING_ADDRESS_VENDOR,
  EDIT_SHIPPING_ADDRESS_VENDOR
} from '../actionTypes';

const initialState = {
  vendor: [],
  vendor_id_data: [],
  vendorIdAndName: [],
  vendorPriceList: [],
  vendorPriceListDropDown: [],
  vendorPriceListProduct: [],
  additionalContactsForVendor:[],
  shippingAddressForVendor:[],
  editShippingAddressForVendor:[],
  po_temp:[]
};

function vendorReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    // case CREATE_VENDOR:
    //   return {...state, vendor: payload};

    case LIST_VENDOR:
      return {...state, vendor: payload};

    case GET_ID_VENDOR:
      return {...state, vendor_id_data: payload};
    //return payload

    case EDIT_VENDOR:
      return {...state, vendor: payload};

    // case DELETE_VENDOR:
    //   //return {...state.vendor.filter(({ id }) => id !== payload.id)};
    //   return {...state, vendor: payload};
    
    case LIST_VENDOR_ID_NAME:
      return { ...state, vendorIdAndName: payload }; 
    
    case GET_VENDOR_PRICE_LIST:
      return { ...state, vendorPriceList: payload }; 
    
    case VENDOR_PRICE_LIST_DROP_DOWN:
      return { ...state, vendorPriceListDropDown: payload }; 
    
    case VENDOR_PRICE_LIST_PRODUCT:
      return { ...state, vendorPriceListProduct: payload }; 

    case ADDITIONAL_CONTACTS_VENDOR:
      return { ...state, additionalContactsForVendor: payload }; 

    case SHIPPING_ADDRESS_VENDOR:
      return { ...state, shippingAddressForVendor: payload }; 

    case EDIT_SHIPPING_ADDRESS_VENDOR:
      return { ...state, editShippingAddressForVendor: payload }; 

      case PO_TEMP:
        return { ...state, po_temp: payload }; 

    default:
      return state;
  }
}

export default vendorReducer;
