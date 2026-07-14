import { ACCOUNT_CONTACTS, CREATE_LEAD_TASK, GET_ACCOUNTS_TIMELINE, GET_LEADS_TASK, GET_TASK_LEADS, SET_LEADS_ACCOUNTS } from "redux/actionTypes"


const initialState ={
    createTask:[],
    getTasks:[],
    getLeadsAccounts:[],
    getAccountsTimeline:[],
    getAccountsContacts:[],
    getTaskLeads:[]
}

function LeadsTaskReducer(state = initialState,action){
    const {type,payload} = action

    switch(type){
        case CREATE_LEAD_TASK:
            return {...state, createTask:payload}
            
        case GET_LEADS_TASK:
            return {...state, getTasks:payload}

        case SET_LEADS_ACCOUNTS:
            return {...state, getLeadsAccounts:payload}

        case GET_ACCOUNTS_TIMELINE :
            return {...state, getAccountsTimeline:payload}

        case ACCOUNT_CONTACTS :
            return {...state, getAccountsContacts:payload}
        case GET_TASK_LEADS :
            return {...state, getTaskLeads:payload}

        default:
            return state;
    }
}

export default LeadsTaskReducer