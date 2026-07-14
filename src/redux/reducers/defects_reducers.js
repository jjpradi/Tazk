import {
    BILLS_BY_VENDOR,
    DEFECT_COLLECTION_SEQUENCE,
    DEFECTS_BY_CUSTOMER_VENDOR,
    GET_ALL_DEFECT_COLLECTION,
    INVOICE_BY_CUSTOMER,
    LIST_DEFECT_COLLECTION,
    LOT_DETAILS_FOR_DEFECTS,
    PRODUCTS_BY_BILLS,
    PRODUCTS_BY_INVOICE,
    SET_SEARCH_DEFECT_COLLECTION,
    COLLECTED_DEFECT_BY_ID,
    LIST_REPLACEMENT,
    SET_SEARCH_REPLACEMENT,
    PRODUCT_DEFECT_COLLECTED_SENT,
    GET_SEND_DEFECTS_BY_ID,
    PRODUCT_BY_CUSTOMER,
    INVOICE_BY_PRODUCT,
    PRODUCT_BY_VENDOR,
    SEND_DEFECT_SEQUENCE,
    REPLACEMENT_BY_ID,
    DEFECT_COLLECTION_BY_ID,
    DEFECT_SENT_BY_ID
} from "redux/actionTypes"
import { GET_SEND_DEFECTS, REPLACEMENT_ITEMS_BY_ID } from "../actionTypes"

const initialState = {
    invoiceByCustomer: [],
    productByInvoice: [],
    lotDetailsForDefects: [],
    defectCollectionSequence: null,
    listDefectCollection: { data: [], numRows: 0 },
    defectByCustomerVendor: [],
    productByDefect: [],
    collectedDefectById: [],
    listReplacement: { data: [], numRows: 0 },
    productByCustomer: [],
    invoiceByProduct: [],
    productByVendor: [],
    sendDefectSequence: null,
    getSendDefects: { data: [], numRows: 0 },
    getSendDefectsById: [],
    replacementById: [],
    defectCollectionById: [],
    defectSentById: [],
    replacementItemsByReplacementId: {}
}

function defectReducers(state = initialState, action){
    const { type, payload } = action

    switch (type) {
        case INVOICE_BY_CUSTOMER:
            return { ...state, invoiceByCustomer: payload }
        
        case PRODUCTS_BY_INVOICE:
            return { ...state, productByInvoice: payload }
        
        case LOT_DETAILS_FOR_DEFECTS:
            return { ...state, lotDetailsForDefects: payload }
        
        case DEFECT_COLLECTION_SEQUENCE:
            return { ...state, defectCollectionSequence: payload }
        
        case LIST_DEFECT_COLLECTION:
        case SET_SEARCH_DEFECT_COLLECTION:
            return { ...state, listDefectCollection: payload }
        
        case DEFECTS_BY_CUSTOMER_VENDOR:
            return { ...state, defectByCustomerVendor: payload }
        
        case COLLECTED_DEFECT_BY_ID:
            return { ...state, collectedDefectById: payload }
        
        case LIST_REPLACEMENT:
        case SET_SEARCH_REPLACEMENT:
            return { ...state, listReplacement: payload }
        
        case PRODUCT_DEFECT_COLLECTED_SENT:
            return { ...state, productByDefect: payload }

        case BILLS_BY_VENDOR:
            return { ...state, billsByVendor: payload }

        case PRODUCTS_BY_BILLS:
            return { ...state, productBybills: payload }

        case GET_ALL_DEFECT_COLLECTION:
            return { ...state, getAllDefectCollection: payload }

        case GET_SEND_DEFECTS:
            return { ...state, getSendDefects: payload }

        case GET_SEND_DEFECTS_BY_ID:
            return { ...state, getSendDefectsById: payload }

        case PRODUCT_BY_CUSTOMER:
            return { ...state, productByCustomer: payload }

        case INVOICE_BY_PRODUCT:
            return { ...state, invoiceByProduct: payload }

        case PRODUCT_BY_VENDOR:
            return { ...state, productByVendor: payload }

        case SEND_DEFECT_SEQUENCE:
            return { ...state, sendDefectSequence: payload }

        case REPLACEMENT_BY_ID:
            return { ...state, replacementById: payload }

        case DEFECT_COLLECTION_BY_ID:
            return { ...state, defectCollectionById: payload }

        case DEFECT_SENT_BY_ID:
            return { ...state, defectSentById: payload }

        case REPLACEMENT_ITEMS_BY_ID:
            return { ...state, replacementItemsByReplacementId: payload }

        default:
            return state
    }
}

export default defectReducers
