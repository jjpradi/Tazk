import quotation_services from "services/quotation_services"
import { ErrorAlert, FailLoad, ListLoad, MailAlert, ProductDeleteAlert } from "./load";
import { 
    CREATE_QUOTATIONS, 
    DELETE_QUOTATIONS, 
    GET_QUOTATION_APPROVALS, 
    GET_QUOTATION_BY_ID, 
    GET_QUOTATION_CONFIG_SEARCH, 
    GET_QUOTATION_SEQUENCE, 
    GET_QUOTATIONS,
    GET_SEARCH_QUOTATION,
    QUOTATION_AMOUNT_DISCOUNT,
    QUOTATION_BY_CUSTOMER,
    QUOTATION_CONFIG,
    QUOTATION_CONFIG_AMOUNT_DISCOUNT,
    QUOTATION_PDF,
    QUOTATION_TIMELINE_DATA,
    SET_QUOTATION_CONFIG_SEARCH,
    SET_SEARCH_QUOTATION,
} from "redux/actionTypes";

export const createQuotationAction = (payload) => async (dispatch) => {
    try{
        const res = await quotation_services.createQuotations(payload)
        if(res.status === 200){
            dispatch({
                type: CREATE_QUOTATIONS,
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

export const deleteQuotationAction = (payload) => async (dispatch) => {
    try {
        const res = await quotation_services.deleteQuotation(payload)
        if (res.status === 200) {
            dispatch({
                type: DELETE_QUOTATIONS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationsActions = (payload, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await quotation_services.getQuotations(payload)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATIONS,
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

export const setQuotationSearchAction = (data) => {
    return{
        type: SET_SEARCH_QUOTATION,
        payload: data
    }
}

export const getQuotationSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_SEARCH_QUOTATION,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const sendQuotationMailAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await quotation_services.sendQuotationMail(data)
        if(res.status === 200){
            if(res.data.msg === "Setup Mail COnfiguration"){
                FailLoad(setModalTypeHandler, setLoaderStatusHandler)
                return ProductDeleteAlert(dispatch, res.data.msg)
            }
            MailAlert(dispatch)
            }
        if(response){
            response(res)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch(err){
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
    }
}

export const getQuotationSequenceAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await quotation_services.getQuotationSequence()
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_SEQUENCE,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createQuotationPdfAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) => async(dispatch) => {
  try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await quotation_services.createQuotationPdf(data)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_PDF,
                payload: res.data
            })
        }
        if(response){
            response(res.data)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationConfigAction = () => async(dispatch) => {
    try{
        const res = await quotation_services.getQuotationConfig()
        if(res.status === 200){
            dispatch({
                type: QUOTATION_CONFIG,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getConfigAmountDiscountAction = () => async(dispatch) => {
    try{
        const res = await quotation_services.getConfigAmountDiscount()
        if(res.status === 200){
            dispatch({
                type: QUOTATION_CONFIG_AMOUNT_DISCOUNT,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const createQuotationConfigAction = (data) => async(dispatch) => {
    try{
        const res = await quotation_services.createQuotationConfig(data)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_CONFIG,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const setQuotationConfigSearchAction = (data) => {
    return{
        type: SET_QUOTATION_CONFIG_SEARCH,
        payload: data
    }
}

export const getQuotationConfigSearchAction = (data, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type: GET_QUOTATION_CONFIG_SEARCH,
        body: data,
        setModalTypeHandler, 
        setLoaderStatusHandler
    }
}

export const deleteQuotationConfigAction = (id) => async(dispatch) => {
    try{
        const res = await quotation_services.deleteQuotationConfig(id)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_CONFIG,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const updateQuotationConfigAction = (data, id) => async(dispatch) => {
    try{
        const res = await quotation_services.updateQuotationConfig(data, id)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_CONFIG,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationApprovalsAction = (payload, response) => async(dispatch) => {
    try{
        const res = await quotation_services.getQuotationApprovals(payload)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_APPROVALS,
                payload: res.data
            })
        }
        if(response){
            response(res.data.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationByIdAction = (id) => async(dispatch) => {
    try{
        const res = await quotation_services.getQuotationById(id)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const updateSeenApproval = (id) => async(dispatch) => {
    try{
        const res = await quotation_services.updateRequestSeen(id)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_APPROVALS,
                payload: res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationAmountAndDiscountAction = (id, response) => async (dispatch) => {
    try {
        const res = await quotation_services.getQuotationAmountAndDiscount(id)
        
        if(res.status === 200) {
            dispatch({
                type : QUOTATION_AMOUNT_DISCOUNT,
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

export const quotationRejectedAction = (data, id, response) => async(dispatch) => {
    try{
        const res = await quotation_services.quotationRejected(data, id)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_APPROVALS,
                payload: res.data
            })
        }
        if(response){
            response(res.data.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const quotationApprovedAction = (data, id, response) => async(dispatch) => {
    try{
        const res = await quotation_services.quotationApproved(data, id)
        if(res.status === 200){
            dispatch({
                type: GET_QUOTATION_APPROVALS,
                payload: res.data
            })
        }
        if(response){
            response(res.data.data)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getQuotationByCustomerAction = (customer_id, page, pageSize, searchString = '', filters = {}) => async(dispatch) => {
    try{
        const data = { page, pageSize, searchString, ...filters }
        const res = await quotation_services.quotationByCustomer(data, customer_id)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_BY_CUSTOMER,
                payload: res.data
            })
        }
        return Promise.resolve({status: "API_FINISHED_SUCCESS", data: res.data})
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve({status: "API_FINISHED_ERROR", data: []})
    }
}

export const quotationTimelineDataAction = ( data ) => async(dispatch) => {
    try{
        const res = await quotation_services.quotationTimelineData(data)
        if(res.status === 200){
            dispatch({
                type: QUOTATION_TIMELINE_DATA,
                payload: res.data
            })
        }
        // if(response){
        //     response(res.data.data)
        // }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}