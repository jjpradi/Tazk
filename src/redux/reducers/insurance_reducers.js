import { 
    CREATE_INSURANCE, 
    GET_DYNAMIC_INSURANCE, 
    INSURANCE_RENEWAL_CARD, 
    SET_LIST_INSURANCE, 
    GET_INSURANCE_BY_ASSET, 
    GET_INSURANCE_BY_ID, 
    GET_FREQUENCY_TYPE, 
    GET_INSURANCE_DETAILS,
    UPDATE_INSURANCE,
    CREATE_INSURANCE_LOV,
    DELETE_RENEWALS_LOV
} from "redux/actionTypes"
import { GET_INSURANCE_LOV } from "../actionTypes";

const initialState = {
    insuranceList : [],
    insuranceListCount : [],
    createInsurance : [],
    insuranceReNewalCard : [],
    insuranceByAsset: [],
    insuranceById: [],
    getFrequencyType: [],
    getInsuranceLov: [],
    getInsuranceDetails: [],
    updateInsurance: [],
    createInsuranceLov:[] ,
    deleteInsuranceLov : []
    
}

function InsuranceReducers(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
        case SET_LIST_INSURANCE : 
            return {...state, insuranceList: payload.data, insuranceListCount: payload.numRows};

        case CREATE_INSURANCE :
            return {...state, createInsurance: payload}

        case GET_DYNAMIC_INSURANCE :
            return {...state,getDynamicInsurance:payload.data}

        case INSURANCE_RENEWAL_CARD : 
            return {...state, insuranceReNewalCard : payload}
            
        case GET_INSURANCE_BY_ASSET:
            return {...state, insuranceByAsset: payload}

        case GET_INSURANCE_BY_ID:
            return { ...state, insuranceById: payload }

        case GET_FREQUENCY_TYPE:
            return { ...state, getFrequencyType: payload }

        case GET_INSURANCE_LOV:
            return { ...state, getInsuranceLov: payload }

        case GET_INSURANCE_DETAILS:
            return { ...state, getInsuranceDetails: payload }

        case CREATE_INSURANCE_LOV:
            return { ...state, createInsuranceLov: payload }

        case DELETE_RENEWALS_LOV:
            return { ...state, deleteInsuranceLov: payload }

        case UPDATE_INSURANCE:
            return { ...state, updateInsurance: payload }

        default : 
            return state;
    }
}

export default InsuranceReducers;