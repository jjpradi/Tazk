import meetings_services from "services/meetings_services"
import { ErrorAlert } from "./load"
import { 
    CREATE_MEETINGS,
    GET_LEAD_USERNAME,
    GET_LIST_MEETINGS,
    SET_LIST_MEETINGS 
} from "redux/actionTypes"

export const ListMeetings = (data, response) => async (dispatch) => {
    try {
        const res = await meetings_services.getMeetingsAll(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_MEETINGS,
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

export const getSearchMeetingsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_MEETINGS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchMeetingsAction = (data) => {
    return {
        type : SET_LIST_MEETINGS,
        payload : data
    }
}

export const CreateMeetings = (data) => async (dispatch) => {
    try {
        const res = await meetings_services.createMeetingsAll(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_MEETINGS,
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

export const getLeadUserNameAction = () => async (dispatch) => {
    try {
        const res = await meetings_services.getLeadUserName()

        if(res.status === 200) {
            dispatch({
                type : GET_LEAD_USERNAME,
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