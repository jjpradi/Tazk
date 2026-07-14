import newItem_services from "../../services/newItem_services";
import { ErrorAlert } from "./load";
import { CREATE_NEWITEM, GET_NEWITEM_BY_ASSET, UPDATE_NEWITEM, SET_LIST_NEWITEM, GET_LIST_NEWITEM } from "../actionTypes";


export const ListNewItem = (data) => async (dispatch) => {
    try{
        const res = await newItem_services.getNewItemAll(data)
        if(res.status === 200){
            dispatch({
                type: SET_LIST_NEWITEM,
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

export const getSearchNewItemAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type: GET_LIST_NEWITEM,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchNewItemAction = (data) => {
    return {
        type: SET_LIST_NEWITEM,
        payload: data
    }
}

export const createNewItem = (data) => async (dispatch) => {
    try{
        const res = await newItem_services.createNewItem(data)
        if(res.status === 200){
            dispatch({
                type: CREATE_NEWITEM,
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

export const updateNewItemAction = (data, id) => async (dispatch) => {
    try{
        const res = await newItem_services.updateNewItem(data, id)
        if(res.status === 200){
            dispatch({
                type: UPDATE_NEWITEM,
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

export const getNewItemByAssetAction = (id, payloadCallBack = {}) => async (dispatch) => {
    const isCallback = typeof payloadCallBack === 'function'
    const payload = isCallback ? {} : payloadCallBack
    const response = isCallback ? payloadCallBack : undefined
    try{
        const res = await newItem_services.getNewItemByAsset(id, payload)
        if(res.status === 200){
            dispatch({
                type: GET_NEWITEM_BY_ASSET,
                payload: res.data
            })
        }
        if(response){
            response(res.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
