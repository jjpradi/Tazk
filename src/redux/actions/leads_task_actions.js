
import { ACCOUNT_CONTACTS, CREATE_LEAD_TASK, GET_ACCOUNTS_CONTACTS, GET_ACCOUNTS_TIMELINE, GET_LEADS_ACCOUNTS, GET_LEADS_TASK, GET_TASK_LEADS, SET_LEADS_ACCOUNTS, SET_LEADS_TASK } from 'redux/actionTypes';
import leads_task_services from 'services/leads_task_services';
import { ErrorAlert } from './load';

export const createLeadTaskAction =(data)=> async (dispatch)=>{
    try{
        const res = await leads_task_services.createTask(data);
        if(res.status === 200){
            dispatch({
                type:CREATE_LEAD_TASK,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve('API_FINISHED_ERROR')
    }

}

export const getLeadsTaskAction=(data)=>async(dispatch)=>{
    try{
        const res = await leads_task_services.getTask(data)
        if(res.status === 200){
            dispatch({
                type:GET_LEADS_TASK,
                payload:res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')

    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}


export const setSearchLeadsTaskAction = (data) => {
    return {
        type : GET_LEADS_TASK,
        payload : data
    }
}

export const getSearchLeadsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_LEADS_TASK,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

// Accounts

export const listLeadsAccountsAction =(data, response)=>async(dispatch)=>{
    try{
        const res = await leads_task_services.getLeadsAccounts(data)

        console.log(res,'resssdd')

        if(res.status === 200){
            dispatch({
                type: SET_LEADS_ACCOUNTS,
                payload:res.data
            })
        }
            response(res.data)
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')

    }
}

export const setLeadsAccountsAction =(data)=>{
   return{
    type:SET_LEADS_ACCOUNTS,
    payload:data
   }
}

export const getSearchLeadsAccountsAction=(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
        type:GET_LEADS_ACCOUNTS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const getAccountsTimelineAction = (id) => async (dispatch) => {
    try {
        const res = await leads_task_services.getAccountsTimeline(id)

        if(res.status === 200) {
            dispatch({
                type : GET_ACCOUNTS_TIMELINE,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

//contacts

export const AccountsContactsAction=(data)=>async(dispatch)=>{
    try{
        const res = await leads_task_services.getAccountsContacts(data)
        if(res.status === 200){
            dispatch({
                type: ACCOUNT_CONTACTS,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')

    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setAccountContacts =(data)=>{
    return{
     type:ACCOUNT_CONTACTS,
     payload:data
    }
 }

 
export const getSearchAccountsContact=(body,setModalTypeHandler,setLoaderStatusHandler)=>{
    return{
        type:GET_ACCOUNTS_CONTACTS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const getLeadstaskCreationAction =(data)=> async (dispatch)=>{
    try{
        const res = await leads_task_services.getTaskLeads(data);
        if(res.status === 200){
            dispatch({
                type:   GET_TASK_LEADS,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve('API_FINISHED_ERROR')
    }

}


