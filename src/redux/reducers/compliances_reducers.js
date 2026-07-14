import{ 
    CREATE_COMPLIANCES,
    GET_COMPLIANCES_LOV, 
    SET_COMPLIANCES_SEARCH,
    SET_LIST_COMPLIANCES,
    GET_COMPLIANCES_INITIAL_LOV,
    DELETE_COMPLIANCES_INITIAL_LOV,
    GET_COMPLIANCES_BY_ID
} from "redux/actionTypes";

const initialState = {
    compliancesLov: [],
    createCompliances : [],
    compliancesList : [],
    compliancesListCount : [],
    getCompliancesForInitialLov : [],
    deleteCompliancesForInitialLov : [] ,
    getComplianceById :[]

}

function compliancesReducers(state = initialState, action){
    const { type, payload } = action

    switch(type){
        case GET_COMPLIANCES_LOV:
            return { ...state, compliancesLov: payload }

        case SET_COMPLIANCES_SEARCH:
            return { ...state, compliancesLov: payload }

        case CREATE_COMPLIANCES :
            return { ...state, createCompliances : payload }

        case SET_LIST_COMPLIANCES : 
            return {...state, compliancesList : payload.data, compliancesListCount : payload.numRows}

        case GET_COMPLIANCES_INITIAL_LOV : 
            return {...state, getCompliancesForInitialLov : payload}

        case DELETE_COMPLIANCES_INITIAL_LOV : 
            return {...state, deleteCompliancesForInitialLov : payload}

        case GET_COMPLIANCES_BY_ID :
            return {...state ,getComplianceById : payload }

        default:
            return { ...state }
    }
}

export default compliancesReducers