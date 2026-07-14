import { CannotDeleteAlert, DeleteAlert, ErrorAlert } from "./load";
import compliances_services from '../../services/compliances_services'
import { 
    CREATE_COMPLIANCES,
    DELETE_COMPLIANCES_INITIAL_LOV,
    GET_COMPLIANCES_BY_ID,
    GET_COMPLIANCES_INITIAL_LOV,
    GET_COMPLIANCES_LOV, 
    GET_COMPLIANCES_SEARCH, 
    GET_LIST_COMPLIANCES, 
    RENEW_COMPLIANCE,
    SET_COMPLIANCES_SEARCH, 
    SET_LIST_COMPLIANCES,
    UPDATE_COMPLIANCE
} from "redux/actionTypes";

export const getComplianceLovAction = (data) => async(dispatch) => {
    try{
        const res = await compliances_services.getCompliancesLOV(data)
        if(res.status === 200){
            dispatch({
                type: GET_COMPLIANCES_LOV,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getCompliancesForInitialLovAction = (response) => async(dispatch) => {
    try{
        const res = await compliances_services.getCompliancesForInitialLov()
        if(res.status === 200){
            dispatch({
                type: GET_COMPLIANCES_INITIAL_LOV,
                payload: res.data
            })
            if(response) {
                response(res.data)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setCompliancesLOVAction = (data) => {
    return{
        type: SET_COMPLIANCES_SEARCH,
        payload: data
    }
}

export const getCompliancesLOVAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_COMPLIANCES_SEARCH,
        body: data,
        setModalTypeHandler, 
        setLoaderStatusHandler
    }
}

export const deleteComplianceAction = (id) => async(dispatch) => {
    try{
        const res = await compliances_services.deleteCompliance(id)
        if(res.status === 200){
            if(res.data.message === 'THE COMPLIANCES CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type: GET_COMPLIANCES_LOV,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteCompliancesForInitialLovAction = (id) => async(dispatch) => {
    try{
        const res = await compliances_services.deleteCompliancesForInitialLov(id)
        if(res.status === 200){
            if(res.data.message === 'THE COMPLIANCES CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type: DELETE_COMPLIANCES_INITIAL_LOV,
                    payload: res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const addComplianceAction = (data) => async(dispatch) => {
    try{
        const res = await compliances_services.addCompliance(data)
        if(res.status === 200){
            dispatch({
                type: GET_COMPLIANCES_LOV,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createCompliancesAction = (data) => async (dispatch) => {
    try {
        const res = await compliances_services.createCompliances(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_COMPLIANCES,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getCompliancesAction = (data) => async (dispatch) => {
    try {
        const res = await compliances_services.getCompliances(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_COMPLIANCES,
                payload : res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getSearchCompliancesAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_COMPLIANCES,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchCompliancesAction = (data) => {
    return {
        type : SET_LIST_COMPLIANCES,
        payload : data
    }
}

export const getComplianceByIdAction = (id ,payload) => async (dispatch) => {

    const res = await compliances_services.getComplianceById(id ,payload)

    if (res.status === 200) {
        dispatch({
            type: GET_COMPLIANCES_BY_ID,
            payload: res.data
        })
    }
}

export const updateComplianceAction = (data, id) => async (dispatch) => {
    console.log(data, id, "dgdfgfd");

    try {
        const res = await compliances_services.updateCompliance(data, id)

        if (res.status === 200) {
            dispatch({
                type: UPDATE_COMPLIANCE,
                payload: res.data
            })
            return Promise.resolve('API_FINISHED_SUCCESS')

        }
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const renewComplianceAction = (data, id) => async (dispatch) => {
    try {
        const res = await compliances_services.renewCompliance(data, id)
        if (res.status === 200) {
            dispatch({
                type: RENEW_COMPLIANCE,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}
