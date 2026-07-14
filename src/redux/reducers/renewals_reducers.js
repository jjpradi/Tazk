import { 
    CREATE_RENEWALS,
    CREATE_RENEWALS_LOV,
    DELETE_INITIAL_RENEWALS_LOV,
    DELETE_RENEWALS_LOV,
    GET_ALL_RENEWALS,
    GET_PAYMENT_METHOD,
    GET_RENEWAL_RECORDS_BY_ID,
    GET_RENEWALS,
    GET_RENEWALS_BY_ID,
    GET_TOTAL_FORM_DETAILS,
    INITIAL_RENEWALS_LOV,
    RENEW_RENEWALS,
    SET_RENEWAL_SEARCH,
    SET_RENEWALS_LOV,
    UPDATE_PAUSE_RENEWALS,
    UPDATE_RESUME_RENEWALS,
    UPDATE_RENEWALS,
    CREATE_CUSTOM_RENEWALS,
    GET_ALL_CUSTOM_RENEWALS,
    GET_CUSTOM_RENEWALS_BY_ID,
    DELETE_CUSTOM_RENEWALS
} from "redux/actionTypes";
import { UPDATE_CUSTOM_RENEWALS } from "../actionTypes";

const initialState = {
    renewals: [],
    allRenewals: [],
    renewalRecords: [],
    updatePauseRenewal : [],
    getRenewalsLov : [],
    createRenewalsLov : [],
    createRenewalsForm : [],
    initialRenewalsLov : [],
    deleteInitialRenewalsLov : [],
    getPaymentMethod: [],
    getTotalDetails: [],
    updateRenewals: [],
    createCustomRenewals : [],
    getCustomRenewalsById :[],
    updateCustomRenewals :[],
    deleteCustomRenewals :[]

}

function RenewalsReducers(state = initialState, action){
    const { type, payload } = action

    switch(type){
        case GET_RENEWALS:
            return { ...state, renewals: payload }

        case SET_RENEWAL_SEARCH:
            return { ...state, renewals: payload }

        case GET_ALL_RENEWALS:
            return { ...state, allRenewals: payload }

        case GET_RENEWAL_RECORDS_BY_ID:
            return { ...state, renewalRecords: payload }

        case UPDATE_PAUSE_RENEWALS :
            return {...state, updatePauseRenewal : payload}

        case UPDATE_RESUME_RENEWALS : 
            return {...state, updateResumeRenewal : payload}
        
        case DELETE_RENEWALS_LOV :
        case SET_RENEWALS_LOV : 
            return {...state, getRenewalsLov : payload}

        case CREATE_RENEWALS_LOV : 
            return {...state, createRenewalsLov : payload}

        case CREATE_RENEWALS :
            return {...state, createRenewalsForm : payload}

        case GET_RENEWALS_BY_ID :
            return {...state, renewalsById : payload}

        case UPDATE_RENEWALS :
            return {...state, updateRenewals : payload}

        case RENEW_RENEWALS :
            return {...state, renewRenewals : payload}

        case INITIAL_RENEWALS_LOV :
            return {...state, initialRenewalsLov : payload}

        case DELETE_INITIAL_RENEWALS_LOV :
            return {...state, deleteInitialRenewalsLov : payload}

        case GET_PAYMENT_METHOD :
            return {...state, getPaymentMethod : payload}

        case GET_TOTAL_FORM_DETAILS :
            return {...state , getTotalDetails : payload }

        case CREATE_CUSTOM_RENEWALS :
            return {...state , createCustomRenewals : payload}    

        case GET_ALL_CUSTOM_RENEWALS :
            return {...state ,allCustomRenewals : payload}

        case GET_CUSTOM_RENEWALS_BY_ID :
            return {...state , getCustomRenewalsById : payload}

        case UPDATE_CUSTOM_RENEWALS :
            return {...state ,updateCustomRenewals : payload}

        case DELETE_CUSTOM_RENEWALS :
            return {...state ,deleteCustomRenewals : payload}

        default:
            return { ...state }
    }
}

export default RenewalsReducers