import { 
    CREATE_INSURANCE, 
    GET_DYNAMIC_INSURANCE, 
    GET_LIST_INSURANCE, 
    INSURANCE_RENEWAL_CARD, 
    SET_LIST_INSURANCE, 
    GET_INSURANCE_BY_ASSET, 
    GET_INSURANCE_BY_ID, 
    RENEW_INSURANCE, 
    GET_FREQUENCY_TYPE, 
    GET_INSURANCE_DETAILS,
    UPDATE_INSURANCE,
    CREATE_INSURANCE_LOV,
    DELETE_INSURANCE_LOV
} from "redux/actionTypes";
import insurance_services from "services/insurance_services";
import { CannotDeleteAlert, DeleteAlert, ErrorAlert } from "./load";
import { GET_INSURANCE_LOV, SET_INSURANCE_LOV } from "../actionTypes";

export const ListInsurance = (data, response) => async (dispatch) => {
    try {
        const res = await insurance_services.getInsuranceAll(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_INSURANCE,
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

export const getSearchInsuranceAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_INSURANCE,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchInsuranceAction = (data) => {
    return {
        type : SET_LIST_INSURANCE,
        payload : data
    }
}

export const CreateInsurance = (data,id) => async (dispatch) => {
    try {
        const res = await insurance_services.createInsuranceAll(data,id)

        if(res.status === 200) {
            dispatch({
                type : CREATE_INSURANCE,
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

export const updateInsuranceAction = (data,id) => async (dispatch) => {
    try {
        const res = await insurance_services.updateInsurance(data,id)

        if(res.status === 200) {
            dispatch({
                type : UPDATE_INSURANCE,
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

export const getDynamicPropByInsurnace =(data, response) =>async (dispatch) =>{
    try{
        const res = await insurance_services.getDynamicPropByInsurnace(data)
        if(res.status === 200){

            dispatch({
                type : GET_DYNAMIC_INSURANCE,
                payload : res.data
            })
        }
        if(response) {
            response (res.data)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const insuranceRenewalCountCardAction = () => async (dispatch) => {
    try {
        const res = await insurance_services.insuranceRenewalCardCount()

        if(res.status === 200) {
            dispatch({
                type : INSURANCE_RENEWAL_CARD,
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

export const getInsuranceByAssetAction = (id, response) => async(dispatch) => {
    try{
        const res = await insurance_services.getInsuranceByAsset(id)
        if(res.status === 200){
            dispatch({
                type: GET_INSURANCE_BY_ASSET,
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

export const getInsuranceByIdAction = (id, response) => async(dispatch) => {
    try{
        const res = await insurance_services.getInsuranceById(id)
        if(res.status === 200){
            dispatch({
                type: GET_INSURANCE_BY_ID,
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

export const renewInsuranceAction = (data, id) => async(dispatch) => {
    try{
        const res = await insurance_services.renewInsurance(data, id)
        if(res.status === 200){
            dispatch({
                type: RENEW_INSURANCE,
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

export const GetFrequencyTypeAction = () => async(dispatch) => {
    try {
        const res = await insurance_services.getFrequencyType()
        if(res.status === 200) {
            dispatch({
                type: GET_FREQUENCY_TYPE,
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

export const getInsuranceLovAction = () => async(dispatch) => {
    try {
        const res = await insurance_services.getInsuranceLov()
        if(res.status === 200) {
            dispatch({
                type: GET_INSURANCE_LOV,
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



export const getSearchInsuranLovceAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_INSURANCE_LOV,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchInsuranceLovAction = (data) => {
    return {
        type : GET_INSURANCE_LOV,
        payload : data
    }
}

export const getInsuranceDetailsAction = (id,data) => async(dispatch) => {
    try {
        const res = await insurance_services.getInsuranceDetails(id,data)
        if(res.status === 200) {
            dispatch({
                type: GET_INSURANCE_DETAILS,
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

export const createInsuranceLovAction = (data) => async(dispatch) =>{
    try{
        const res = await insurance_services.createInsurenceLov(data)
        if(res ===  200){
            dispatch({
                type : CREATE_INSURANCE_LOV,
                payload :res.data
            })
        }
    }catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")

    }
}

export const deleteInsuranceLovAction = (type ,id) => async (dispatch)=>{
    try{
        const res = await insurance_services.deleteInsuranceLov(type ,id)
        if(res.status === 200){
            if(res.data.message === 'THE INSURANCE CANNOT BE DELETED AS IT HAS BEEN IN USE' ){
                CannotDeleteAlert(dispatch , res.data)
            }else{
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_INSURANCE_LOV,
                    payload : res.data
                })
            }
        }
    }catch(err){
        ErrorAlert(dispatch , err)
        return Promise.reject("API_FINISHED_ERROR")
    }
}