import termsConditions_services from "services/termsConditions_services";
import { CannotDeleteAlert, CreateAlert, DeleteAlert, ErrorAlert } from "./load";
import { 
    CREATE_CREDIT_DAYS_LOV,
    CREATE_DELIVERY_TERMS,
    CREATE_LIST_TERMSCONDITIONS,
    CREATE_PAYMENT_TERMS,
    CREATE_UNITS_LOV,
    DELETE_CREDIT_DAYS_LOV,
    DELETE_DELIVERY_TERMS,
    DELETE_PAYMENT_TERMS,
    DELETE_TERMS_CONDITIONS,
    DELETE_UNITS_LOV,
    GET_CREDIT_DAYS_LOV,
    GET_DELIVERY_TERMS,
    GET_LIST_TERMSCONDITIONS,
    GET_PAYMENT_TERMS,
    GET_UNITS_LOV,
    INVOICE_TYPES, 
    SET_CREDIT_DAYS_LOV, 
    SET_DELIVERY_TERMS, 
    SET_LIST_TERMSCONDITIONS,
    SET_PAYMENT_TERMS,
    SET_UNITS_LOV,
    UPDATE_TERMSCONDITIONS, 
} from "redux/actionTypes";

export const ListTermsAndConditionsAction = (data) => async (dispatch) => {
    try {
        const res = await termsConditions_services.getTermsConditions(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_TERMSCONDITIONS,
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

export const getSearchTermsConditionsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_TERMSCONDITIONS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchTermsConditionsAction = (data) => {
    return {
        type : SET_LIST_TERMSCONDITIONS,
        payload : data
    }
}

export const CreateTermsConditionsAction = (data, response) => async (dispatch) => {
    try {
        const res = await termsConditions_services.createTermsConditions(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_LIST_TERMSCONDITIONS,
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

export const InvoiceTypesAction = () => async (dispatch) => {
    try {
        const res = await termsConditions_services.getInvoiceTypes()

        if(res.status === 200) {
            dispatch({
                type : INVOICE_TYPES,
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

export const DeleteTermsConditionsAction = (id,type) => async (dispatch) => {
    try {
        const res = await termsConditions_services.deleteTermsConditions(id,type)
        if(res.status === 200) {
            if(res.data.message === 'THE TERMS & CONDITIONS CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_TERMS_CONDITIONS,
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

export const GetUnitsLovAction = (data) => async (dispatch) => {
    try {
        const res = await termsConditions_services.getUnitsLov(data)

        if(res.status === 200) {
            dispatch({
                type : SET_UNITS_LOV,
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

export const getSearchUnitsLovAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_UNITS_LOV,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchUnitsLovAction = (data) => {
    return {
        type : SET_UNITS_LOV,
        payload : data
    }
}

export const CreateUnitsLovAction = (data) => async (dispatch) => {
    try {
        const res = await termsConditions_services.createUnitsLov(data)
    
        if(res.status === 200) {
            if(res.data.message === 'UNIT NAME OR CODE ALREADY EXISTS') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                CreateAlert(dispatch)
                dispatch({
                    type : CREATE_UNITS_LOV,
                    payload : res.data
                })
            }
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const DeleteUnitsLovAction = (id) => async (dispatch) => {
    try {
        const res = await termsConditions_services.deleteUnitsLov(id)

        if(res.status === 200) {
            if(res.data.message === 'THE UNITS & CODE CANNOT BE DELETED AS IT HAS BEEN IN USE') {
                CannotDeleteAlert(dispatch, res.data)
            }
            else {
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_UNITS_LOV,
                    payload : res.data
                })
            }
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getCreditDaysLovAction = (payload) => async(dispatch) => {
    try{
        const res = await termsConditions_services.getCreditDaysLov(payload)
        if(res.status === 200){
            dispatch({
                type: SET_CREDIT_DAYS_LOV,
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

export const getCreditDaysLovSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type : GET_CREDIT_DAYS_LOV,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setCreditDaysLovSearchAction = (data) => {
    return {
        type : SET_CREDIT_DAYS_LOV,
        payload : data
    }
}

export const createCreditDaysLovAction = (payload) => async(dispatch) => {
    try{
        const res = await termsConditions_services.createCreditDaysLov(payload)
        if(res.status === 200){
            CreateAlert(dispatch)
            dispatch({
                type: CREATE_CREDIT_DAYS_LOV,
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

export const deleteCreditDaysLovAction = (id) => async(dispatch) => {
    try{
        const res = await termsConditions_services.deleteCreditDaysLov(id)
        if(res.status === 200){
            if(res.data.message === 'THE CREDIT DAYS CANNOT BE DELETED AS IT HAS BEEN IN USE'){
                CannotDeleteAlert(dispatch, res.data)
            }
            else{
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_CREDIT_DAYS_LOV,
                    payload : res.data
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

export const createPaymentTermsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.createPaymentTerms(data)
        if(res.status === 200){
            CreateAlert(dispatch)
                dispatch({
                    type : CREATE_PAYMENT_TERMS,
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

export const deletePaymentTermsAction = (id) => async(dispatch) => {
    try{
        const res = await termsConditions_services.deletePaymentTerms(id)
        if(res.status === 200){
                DeleteAlert(dispatch)
                dispatch({
                    type : DELETE_PAYMENT_TERMS,
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

export const getPaymentTermsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.getPaymentTerms(data)
        if(res.status === 200){
                dispatch({
                    type : SET_PAYMENT_TERMS,
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

export const getPaymentTermsSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type : GET_PAYMENT_TERMS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setPaymentTermsSearchAction = (data) => {
    return {
        type : SET_PAYMENT_TERMS,
        payload : data
    }
}

export const createDeliveryTermsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.createDeliveryTerms(data)
        if(res.status === 200){
            CreateAlert(dispatch)
                dispatch({
                    type : CREATE_DELIVERY_TERMS,
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

export const deleteDeliveryTermsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.deleteDeliveryTerms(data)
        if(res.status === 200){
                dispatch({
                    type : DELETE_DELIVERY_TERMS,
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

export const getDeliveryTermsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.getDeliveryTerms(data)
        if(res.status === 200){
                dispatch({
                    type : SET_DELIVERY_TERMS,
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

export const getDeliveryTermsSearchAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return{
        type : GET_DELIVERY_TERMS,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setDeliveryTermsSearchAction = (data) => {
    return {
        type : SET_DELIVERY_TERMS,
        payload : data
    }
}

export const updateTermsConditionsAction = (data) => async(dispatch) => {
    try{
        const res = await termsConditions_services.updateTermsConditions(data)
        if(res.status === 200){
                dispatch({
                    type : UPDATE_TERMSCONDITIONS,
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