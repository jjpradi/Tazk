import calls_services from "services/calls_services"
import { ErrorAlert } from "./load"
import { CALL_PURPOSE, 
         CALL_RESULT,
         CREATE_CALLS,
         GET_LEAD_COMPANYNAME,
         GET_LIST_CALLS,
         SET_LIST_CALLS, 
       } 
from "redux/actionTypes"

export const ListCalls = (data, response) => async (dispatch) => {
    try {
        const res = await calls_services.getCallsAll(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_CALLS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchCallsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_CALLS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchCallsAction = (data) => {
    return {
        type : SET_LIST_CALLS,
        payload : data
    }
}

export const CreateCalls = (data) => async (dispatch) => {
    try {
        const res = await calls_services.createCallsAll(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_CALLS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getCallPurposeAction = () => async (dispatch) => {
    try {
        const res = await calls_services.getCallPurpose()

        if(res.status === 200) {
            dispatch({
                type : CALL_PURPOSE,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getCallResultAction = () => async (dispatch) => {
    try {
        const res = await calls_services.getCallResult()

        if(res.status === 200) {
            dispatch({
                type : CALL_RESULT,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getLeadCompanyNameAction = () => async (dispatch) => {
    try {
        const res = await calls_services.getLeadCompanyName()

        if(res.status === 200) {
            dispatch({
                type : GET_LEAD_COMPANYNAME,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}