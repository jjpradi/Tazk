import { 
    CREATE_LIST_TERMSCONDITIONS,
    DELETE_CREDIT_DAYS_LOV,
    DELETE_TERMS_CONDITIONS,
    DELETE_UNITS_LOV,
    INVOICE_TYPES, 
    SET_CREDIT_DAYS_LOV, 
    SET_LIST_TERMSCONDITIONS,
    SET_UNITS_LOV, 
    CREATE_PAYMENT_TERMS,
    DELETE_PAYMENT_TERMS,
    SET_PAYMENT_TERMS,
    CREATE_DELIVERY_TERMS,
    DELETE_DELIVERY_TERMS,
    SET_DELIVERY_TERMS,
    UPDATE_TERMSCONDITIONS
} from "redux/actionTypes"

const initialState = {
    termsAndConditionsList : [],
    createTermsAndConditions : [],
    invoiceTypesList : [],
    getUnitsLov : [],
    creditDaysLov: [],
    createPaymentTerms:[],
    deletePaymentTerms:[],
    getPaymentTerms:[],
    createDeliveryTerms:[],
    deleteDeliveryTerms:[],
    getDeliveryTerms:[],
    updateTermsConditions:[]
}

function TermsConditionsReducers (state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case DELETE_TERMS_CONDITIONS :
        case SET_LIST_TERMSCONDITIONS : 
            return {...state, termsAndConditionsList : payload}

        case CREATE_LIST_TERMSCONDITIONS :
            return {...state, createTermsAndConditions : payload}

        case INVOICE_TYPES : 
            return {...state, invoiceTypesList : payload}

        case DELETE_UNITS_LOV :
        case SET_UNITS_LOV :
            return {...state, getUnitsLov : payload}

        case SET_CREDIT_DAYS_LOV:
        case DELETE_CREDIT_DAYS_LOV:
            return { ...state, creditDaysLov: payload }

        case CREATE_PAYMENT_TERMS:
            return { ...state, createPaymentTerms: payload }

        case DELETE_PAYMENT_TERMS:
            return { ...state, deletePaymentTerms: payload }

        case SET_PAYMENT_TERMS:
            return { ...state, getPaymentTerms: payload }

        case CREATE_DELIVERY_TERMS:
            return { ...state, createDeliveryTerms: payload }

        case DELETE_DELIVERY_TERMS:
            return { ...state, deleteDeliveryTerms: payload }

        case SET_DELIVERY_TERMS:
            return { ...state, getDeliveryTerms: payload }

        case UPDATE_TERMSCONDITIONS:
            return { ...state, updateTermsConditions: payload }

        default : 
            return state
    }
}

export default TermsConditionsReducers