import campaign_services from "services/campaign_services";
import { ErrorAlert } from "./load";
import { 
    CAMPAIGN_STATUS, 
    CAMPAIGN_TYPE,
    CREATE_CAMPAIGN,
    GET_CAMPAIGN_LEAD_COUNT,
    GET_ACTIVE_CAMPAIGN,
    GET_CAMPAIGN_TIMELINE,
    GET_LIST_CAMPAIGN,
    SET_LIST_CAMPAIGN,
    UPDATE_CAMPAIGN_STATUS,
    CAMPAIGN_CONVERTED_LEADS_COUNT,
    SET_CAMPAIGN_LEADS,
    GET_CAMPAIGN_LEADS,
    GET_ALL_CAMPAIGN, 
} from "redux/actionTypes";

export const ListCampaignAction = (data, response) => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignAll(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_CAMPAIGN,
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

export const getSearchCampaignAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_CAMPAIGN,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchCampaignAction = (data) => {
    return {
        type : SET_LIST_CAMPAIGN,
        payload : data
    }
}

export const CreateCampaignAction = (data) => async (dispatch) => {
    try {
        const res = await campaign_services.createCampaignAll(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_CAMPAIGN,
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

export const getCampaignTypeAction = () => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignType()

        if(res.status === 200) {
            dispatch({
                type : CAMPAIGN_TYPE,
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

export const getCampaignStatusAction = () => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignStatus()

        if(res.status === 200) {
            dispatch({
                type : CAMPAIGN_STATUS,
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

export const updateCampaignStatusAction = (data) => async (dispatch) => {
    try {
        const res = await campaign_services.updateCampaignStatus(data)

        if(res.status === 200) {
            dispatch({
                type : UPDATE_CAMPAIGN_STATUS,
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

export const updateCampaignAction = (data, id) => async (dispatch) => {
    try{
        const res = await campaign_services.updateCampaign(data, id)
        if(res.status === 200){
            dispatch({
                type: SET_LIST_CAMPAIGN,
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

export const getCampaignTimelineAction = (id) => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignTimeline(id)

        if(res.status === 200) {
            dispatch({
                type : GET_CAMPAIGN_TIMELINE,
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

export const getCampaignLeadCountAction = (id) => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignLeadCount(id)

        if(res.status === 200) {
            dispatch({
                type : GET_CAMPAIGN_LEAD_COUNT,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getActiveCampaignAction = () => async (dispatch) => {
    try{
        const res = await campaign_services.getActiveCampaign()

        if(res.status === 200){
            dispatch({
                type: GET_ACTIVE_CAMPAIGN,
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

export const getCampaignConvertedLeadsCountAndValueAction = (id) => async(dispatch) => {
    try{
        const res = await campaign_services.getCampaignConvertedLeadsCountAndValue(id)

        if(res.status === 200){
            dispatch({
                type: CAMPAIGN_CONVERTED_LEADS_COUNT,
                payload: res.data
            })
        }
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getCampaignLeadAction = (id, data) => async (dispatch) => {
    try {
        const res = await campaign_services.getCampaignLead(id, data)

        if(res.status === 200) {
            dispatch({
                type : SET_CAMPAIGN_LEADS,
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

export const getSearchCampaignLeadsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_CAMPAIGN_LEADS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchCampaignLeadsAction = (data) => {
    return {
        type : SET_CAMPAIGN_LEADS,
        payload : data
    }
}

export const getAllCampaignAction = (id, data) => async (dispatch) => {
    try {
        const res = await campaign_services.getAllCampaign(id, data)

        if(res.status === 200) {
            dispatch({
                type : GET_ALL_CAMPAIGN,
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