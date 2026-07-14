import { 
        CALL_PURPOSE, 
        CALL_RESULT, 
        CREATE_CALLS,
        GET_LEAD_COMPANYNAME,
        SET_LIST_CALLS, 
       } 
from "redux/actionTypes"

const initialState = {
    callsList : [],
    callsListCount : [],
    createCalls : [],
    callPurposeList : [],
    callResultList : [],
    leadCompanyNameList : [],
}

function CallsReducers (state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case SET_LIST_CALLS : 
            return {...state, callsList : payload.data, callsListCount : payload.numRows}

        case CREATE_CALLS : 
            return {...state, createCalls : payload}

        case CALL_PURPOSE : 
            return {...state, callPurposeList : payload}

        case CALL_RESULT : 
            return {...state, callResultList : payload}

        case GET_LEAD_COMPANYNAME : 
            return {...state, leadCompanyNameList : payload}

        default : 
            return state
    }
}

export default CallsReducers