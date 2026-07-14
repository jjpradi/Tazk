import renewals_services from "services/renewals_services";
import { CannotDeleteAlert, DeleteAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert } from "./load";
import { 
    CREATE_CUSTOM_RENEWALS,
    CREATE_RENEWALS,
    CREATE_RENEWALS_LOV,
    DELETE_CUSTOM_RENEWALS,
    DELETE_INITIAL_RENEWALS_LOV,
    DELETE_RENEWALS_LOV,
    GET_ALL_CUSTOM_RENEWALS,
    GET_ALL_RENEWALS,
    GET_CUSTOM_RENEWALS_BY_ID,
    GET_PAYMENT_METHOD,
    GET_RENEWAL_RECORDS_BY_ID,
    GET_RENEWAL_SEARCH,
    GET_RENEWALS,
    GET_RENEWALS_BY_ID,
    GET_RENEWALS_LOV,
    GET_TOTAL_FORM_DETAILS,
    INITIAL_RENEWALS_LOV,
    RENEW_RENEWALS,
    SET_RENEWAL_SEARCH,
    SET_RENEWALS_LOV,
    UPDATE_PAUSE_RENEWALS,
    UPDATE_RENEWALS,
    UPDATE_RESUME_RENEWALS,
} from "redux/actionTypes";
import { GET_LIST_CUSTOM_RENEWALS, UPDATE_CUSTOM_RENEWALS } from "../actionTypes";

export const getRenewalsAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await renewals_services.getRenewals(data)
        if(res.status === 200){
            dispatch({
                type: GET_RENEWALS,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setRenewalSearchAction = (data) => {
    return{
        type: SET_RENEWAL_SEARCH,
        payload: data
    }
}

export const getRenewalSearchAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_RENEWAL_SEARCH,
        body: data,
        setModalTypeHandler, 
        setLoaderStatusHandler
    }
}

export const getAllRenewalsAction = (data) => async(dispatch) => {
    try{
        const res = await renewals_services.getAllRenewals(data)
        if(res.status === 200){
            dispatch({
                type: GET_ALL_RENEWALS,
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

export const getRenewalRecordAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.getRenewalRecordsById(data)
        console.log(res , "dfsdf");
        
        dispatch({
            type : GET_RENEWAL_RECORDS_BY_ID,
            payload : res.data
        })
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")

    }
}

export const getRenewalRecordsAction = (data) => async(dispatch) => {
    try{
        const res = await renewals_services.getRenewalsById(data)
        if(res.status === 200){
            dispatch({
                type: GET_RENEWALS_BY_ID,
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

export const updatePauseRenewalsAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.updatePauseRenewals(data)

        if(res.status === 200) {
            dispatch({
                type : UPDATE_PAUSE_RENEWALS,
                payload : res.data
            })
        }
        UpdateAlert(dispatch)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const updateResumeRenewalsAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.updateResumeRenewals(data)

        if(res.status === 200) {
            dispatch({
                type : UPDATE_RESUME_RENEWALS,
                payload : res.data
            })
        }
        UpdateAlert(dispatch)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getRenewalsLovAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.getRenewalsLov(data)

        if(res.status === 200) {
            dispatch({
                type : SET_RENEWALS_LOV,
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

export const getSearchRenewalsLovAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_RENEWALS_LOV,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchRenewalsLovAction = (data) => {
    return {
        type : SET_RENEWALS_LOV,
        payload : data
    }
}

export const createRenewalsLovAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.createRenewalsLov(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_RENEWALS_LOV,
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

export const deleteRenewalsLovAction = (type, id) => async (dispatch) => {
    try {
        const res = await renewals_services.deleteRenewalsLov(type, id)

        if(res.status === 200) {
            if(res.data.message === 'THE RENEWALS CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_RENEWALS_LOV,
                    payload : res.data
                })
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createRenewalsFormAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.createRenewalsForm(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_RENEWALS,
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

export const getRenewalsByIdAction = (id, response) => async (dispatch) => {
    try {
        const res = await renewals_services.getRenewalsById(id)

        if(res.status === 200) {
            dispatch({
                type : GET_RENEWALS_BY_ID,
                payload : res.data
            })
        }
        if(response) {
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
export const updateSubscriptionAction = (data , id) => async (dispatch) =>{
        try{
            const res = await renewals_services.updateRenewals(data ,id)
            if(res.status === 200){
                dispatch({
                    type: UPDATE_RENEWALS,
                    payload: res.data
                })
            }
        } catch (err) {
            ErrorAlert(dispatch, err)
            return Promise.resolve("API_FINISHED_ERROR")

        }
}
export const renewRenewalsAction = (data, id) => async (dispatch) => {
    try {
        const res = await renewals_services.renewRenewals(data, id)

        if(res.status === 200) {
            dispatch({
                type : RENEW_RENEWALS,
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

export const GetRenewalsInitialLovAction = (response) => async (dispatch) => {
    try {
        const res = await renewals_services.getRenewalsInitialLov()

        if(res.status === 200) {
            dispatch({
                type : INITIAL_RENEWALS_LOV,
                payload : res.data
            })
            if(response) {
                response(res.data)
            }
        }
        return Promise.resolve('API_FINISHED SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const DeleteRenewalsInitialLovAction = (id) => async (dispatch) => {
    try {
        const res = await renewals_services.deleteRenewalsInitialLov(id)

        if(res.status === 200) {
            if(res.status.message === 'THE RENEWALS CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_INITIAL_RENEWALS_LOV,
                    payload : res.data
                })
            }
        }
        return Promise.resolve('API_FINISHED SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const GetPaymentMethodAction = () => async (dispatch) => {
    try {
        const res = await renewals_services.getPaymentMethod()

        if(res.status === 200) {
            dispatch({
                type : GET_PAYMENT_METHOD,
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

export const getFormDetailsAction = (type) => async(dispatch) =>{
    try{
        const res = await renewals_services.getFormTotal(type)

        if(res.status === 200){
            dispatch({
                type : GET_TOTAL_FORM_DETAILS,
                payload : res.data
            })
        }

        return Promise.resolve('APUI_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.reject('API_FINISHED_ERROR')
    }
}

export const createCustomRenewalsAction = (data) => async (dispatch) => {
    try {
        const res = await renewals_services.createCustomRenewal(data)

        if (res.status === 200) {
            dispatch({
                type: CREATE_CUSTOM_RENEWALS,
                payload: res.data
            })
        }
        return Promise.resolve('APUI_FINISHED_SUCCESS')

    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.reject('API_FINISHED_ERROR')

    }
}

export const getAllCustomRenewalsAction = (data, response) => async (dispatch) => {

    try {
        const res = await renewals_services.getAllCustomRenewals(data)
        console.log(res,"dfdsfd");
        

        if (res.status === 200) {
            dispatch({
                type: GET_ALL_CUSTOM_RENEWALS,
                payload: res.data
            })
            return Promise.resolve("API_FINISHED_SUCCESS")

        }
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchCustomRenewalsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type: GET_LIST_CUSTOM_RENEWALS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchCustomRenewalsAction = (data) => {
    return {
        type : GET_ALL_CUSTOM_RENEWALS,
        payload : data
    }
}

export const getCustomRenewalsByIdAction = (id ,payload = {}) => async (dispatch) => {
    try {
        const res = await renewals_services.getCustomRenewalsById(id ,payload)

        if (res.status === 200) {
            dispatch({
                type : GET_CUSTOM_RENEWALS_BY_ID ,
                payload: res.data
            })
            return Promise.resolve("API_FINISHED_SUCCESS")
        }
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")

    }
}

export const deleteCustomRenewalsAction = (id) => async (dispatch) => {

    try {
        const res = await renewals_services.deleteCustomRenewals(id)
        if(res.status === 200){
            dispatch({
                type : DELETE_CUSTOM_RENEWALS ,
                payload : res.data
            })
            DeleteAlert(dispatch)
        }

    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")

    }
}

export const updateCustomRenewalsAction = (data ,id) => async (dispatch) => {
    try{
        const res = await renewals_services.updateCustomRenewals(data ,id)
        if(res.status === 200){
            dispatch({
                type : UPDATE_CUSTOM_RENEWALS ,
                payload : res.data
            })
        }
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")

    }
}

export const renewCustomRenewalsAction = (data, id) => async (dispatch) => {
    try {
        const res = await renewals_services.renewCustomRenewals(data, id)
        if (res.status === 200) {
            dispatch({
                type: RENEW_RENEWALS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}