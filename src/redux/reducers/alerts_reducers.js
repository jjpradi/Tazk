import { 
    CREATE_ALERTS, 
    GET_EMP_ALERTS_EMPLOYEE_FILTER, 
    SET_LIST_ALERTS, 
    SET_SEARCH_ALERTS_EMPLOYEE_FILTER
} from "redux/actionTypes";

const initialState = {
    alertsList: [],
    createAlertList: [],
    alertListCount: [],
    getAlertsEmployeeFilter : [],
    getSearchAlertsEmployeeFilter : [],
}

function AlertsReducers(state = initialState, action) {
    const{type, payload} = action
    switch(type) {
        case SET_LIST_ALERTS:
            return {...state, alertsList: payload.data, alertListCount: payload.numRows};
        
        case CREATE_ALERTS:
            return {...state, createAlertList: payload};

        case GET_EMP_ALERTS_EMPLOYEE_FILTER : 
            return {...state, getAlertsEmployeeFilter : payload}

        case SET_SEARCH_ALERTS_EMPLOYEE_FILTER : 
            return {...state, getSearchAlertsEmployeeFilter : payload}

        default:
            return state;
    }
}

export default AlertsReducers