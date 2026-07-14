import { 
    CREATE_SERVICEDUE, 
    SERVICEDUE_CARD, 
    SET_LIST_SERVICEDUE, 
    GET_SERVICEDUE_BY_ASSET, 
    GET_SERVICEDUE_PRIORITY, 
    GET_SERVICE_TYPE, 
    GET_SERVICE_METERTYPE,
    UPDATE_SERVICE_DUE
} from "redux/actionTypes";

const initialState = {
    serviceDueList : [],
    serviceDueListCount : [],
    serviceDueCard : [],
    createInsurance : [],
    serviceDueByAsset: [],
    getServiceDuePriority: [],
    getServiceType: [],
    getServiceTrigger: [],
    getMeterType: [],
    setServiceDue:[]
}

function ServiceDueReducers(state = initialState, action) {
    const {type, payload} = action
    switch (type) {
        case SET_LIST_SERVICEDUE : 
            return {...state, serviceDueList: payload.data, serviceDueListCount: payload.numRows}
            
        case UPDATE_SERVICE_DUE :
            return {...state , setServiceDue : payload }

        case CREATE_SERVICEDUE :
            return {...state, createServiceDue: payload}

        case SERVICEDUE_CARD : 
            return {...state, serviceDueCard : payload}
            
        case GET_SERVICEDUE_BY_ASSET:
            return{...state, serviceDueByAsset: payload}

        case GET_SERVICEDUE_PRIORITY:
            return{...state, getServiceDuePriority: payload}

        case GET_SERVICE_TYPE:
            return{...state, getServiceType: payload}

        case GET_SERVICE_METERTYPE:
            return{...state, getMeterType: payload}
        
        default :
            return state
    }
}

export default ServiceDueReducers;