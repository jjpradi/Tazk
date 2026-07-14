import { 
    CREATE_SERVICEDUE, 
    GET_LIST_SERVICEDUE, 
    SERVICEDUE_CARD, 
    SET_LIST_SERVICEDUE, 
    GET_SERVICEDUE_BY_ASSET, 
    GET_SERVICEDUE_PRIORITY, 
    GET_SERVICE_TYPE, 
    GET_SERVICE_METERTYPE, 
    SET_SERVICE_TYPE,
    UPDATE_SERVICE_DUE
} from "redux/actionTypes";
import serviceDue_services from "services/serviceDue_services";
import { ErrorAlert } from "./load";

export const ListServiceDue = (data, response) => async (dispatch) => {
    try {
        const res = await serviceDue_services.getServiceDueAll(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_SERVICEDUE,
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

export const updateServiceDueAction = (data,id) => async (dispatch) => {
    try{
        const res = await  serviceDue_services.updateServiceDue(data,id)
        if(res.status === 200 ){
            dispatch({
                type : UPDATE_SERVICE_DUE,
                payload : res.data
            })
        }

    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
 
export const getSearchServiceDueAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_SERVICEDUE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchServiceDueAction = (data) => {
    return {
        type : SET_LIST_SERVICEDUE,
        payload : data
    }
}

export const CreateServiceDue = (data) => async (dispatch) => {
    try {
        const res = await serviceDue_services.createServiceDueAll(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_SERVICEDUE,
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

export const serviceDueCardCountAction = () => async (dispatch) => {
    try {
        const res = await serviceDue_services.serviceDueCardCount()

        if(res.status === 200) {
            dispatch({
                type : SERVICEDUE_CARD,
                payload : res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getServiceDueByAssetAction = (id, payloadCallBack = {}) => async(dispatch) => {
    const isCallback = typeof payloadCallBack === 'function'
    const payload = isCallback ? {} : payloadCallBack
    const response = isCallback ? payloadCallBack : undefined
    try{
        const res = await serviceDue_services.getServiceDueByAsset(id ,payload)
        if(res.status === 200){
            dispatch({
                type: GET_SERVICEDUE_BY_ASSET,
                payload: res.data
            })
        }
        if(response){
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const GetPriorityAction = () => async(dispatch) => {
    try {
        const res = await serviceDue_services.getPriority()
        
        if(res.status === 200) {
            dispatch({
                type: GET_SERVICEDUE_PRIORITY,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } 
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const GetServiceTypeAction = () => async(dispatch) => {
    try {
        const res = await serviceDue_services.getServiceType()

        console.log(res,'response1111')
        
        if(res.status === 200) {
            dispatch({
                type: GET_SERVICE_TYPE,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } 
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const GetMeterTypeAction = () => async(dispatch) => {
    try {
        const res = await serviceDue_services.getMeterType()
        
        if(res.status === 200) {
            dispatch({
                type: GET_SERVICE_METERTYPE,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } 
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setSearchServiceTypeLovAction = (data) => {
    return {
        type : GET_SERVICE_TYPE,
        payload : data
    }
}

export const getSearchserviceTypeLovAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_SERVICE_TYPE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}