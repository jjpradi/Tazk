import defects_services from "../../services/defects_services"
import { ErrorAlert, ListLoad, FailLoad, CreateAlert, ReplacementAlert, CreditDebitNoteConvertAlert } from './load'
import {
    COLLECTED_DEFECT_BY_ID,
    CREATE_CUSTOMER_REPLACEMENT,
    BILLS_BY_VENDOR,
    CREATE_DEFECT_COLLECTION,
    CREATE_VENDOR_REPLACEMENT,
    DEFECT_COLLECTION_SEQUENCE,
    DEFECTS_BY_CUSTOMER_VENDOR,
    DELETE_COLLECTED_DEFECT,
    EDIT_COLLECTED_DEFECTS,
    GET_ALL_DEFECT_COLLECTION,
    GET_SEARCH_DEFECT_COLLECTION,
    GET_SEARCH_REPLACEMENT,
    INVOICE_BY_CUSTOMER,
    LIST_DEFECT_COLLECTION,
    LIST_REPLACEMENT,
    LOT_DETAILS_FOR_DEFECTS,
    PRODUCT_DEFECT_COLLECTED_SENT,
    PRODUCTS_BY_INVOICE,
    SET_SEARCH_DEFECT_COLLECTION,
    SET_SEARCH_REPLACEMENT,
    PRODUCTS_BY_BILLS,
    SEND_DEFECTS,
    GET_SEND_DEFECTS,
    DELETE_SEND_DEFECTS,
    GET_SEND_DEFECTS_BY_ID,
    UPDATE_SEND_DEFECTS,
    CONVERT_TO_CREDIT_DEBOT_NOTE,
    PRODUCT_BY_CUSTOMER,
    INVOICE_BY_PRODUCT,
    PRODUCT_BY_VENDOR,
    SEND_DEFECT_SEQUENCE,
    REPLACEMENT_BY_ID,
    DEFECT_COLLECTION_BY_ID,
    DEFECT_SENT_BY_ID,
    REPLACEMENT_ITEMS_BY_ID
} from '../actionTypes'

export const getInvoiceByCustomerAction = (customer_id, location_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.getInvoiceByCustomer(customer_id, location_id)
        if (res.status === 200) {
            dispatch({
                type: INVOICE_BY_CUSTOMER,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getProductsByInvoiceAction = (sale_id) => async (dispatch) => {
    try {
        const res = await defects_services.getProductsByInvoice(sale_id)
        if (res.status === 200) {
            dispatch({
                type: PRODUCTS_BY_INVOICE,
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

export const getLotsDetailsForDefectsAction = (data, response) => async (dispatch) => {
    try {
        const res = await defects_services.getLotsDetails(data)

        if (res.status === 200) {
            dispatch({
                type: LOT_DETAILS_FOR_DEFECTS,
                payload: res.data
            })

            if (response) {
                response(res.data)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getDefectCollectionSequenceAction = () => async (dispatch) => {
    try {
        const res = await defects_services.getDefectCollectionSequence()
        if (res.status === 200) {
            dispatch({
                type: DEFECT_COLLECTION_SEQUENCE,
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

export const createDefectCollectionAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.createDefectCollection(payload)
        if (res.status === 200) {
            dispatch({
                type: CREATE_DEFECT_COLLECTION,
                payload: res.data
            })
            CreateAlert(dispatch)
        }
        response(res)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const listDefectCollectionAction = (payload, employee_id, location_id, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.listDefectCollection(payload, employee_id, location_id)
        if (res.status === 200) {
            dispatch({
                type: LIST_DEFECT_COLLECTION,
                payload: res.data
            })
        }
        if (response) {
            response(res.data.data)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getBillsByVendorAction = (supplier_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.getBillsByVendor(supplier_id)
        if (res.status === 200) {
            dispatch({
                type: BILLS_BY_VENDOR,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getProductsByBillsAction = (receiving_id) => async (dispatch) => {
    try {
        const res = await defects_services.getProductsByBills(receiving_id)
        if (res.status === 200) {
            dispatch({
                type: PRODUCTS_BY_BILLS,
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

export const getAlldefectsCollectionAction = (type, id) => async (dispatch) => {
    try {
        const res = await defects_services.getAlldefectsCollection(type, id)
        if (res.status === 200) {
            dispatch({
                type: GET_ALL_DEFECT_COLLECTION,
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

export const sendDefectsAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.sendDefects(payload)
        if (res.status === 200) {
            dispatch({
                type: SEND_DEFECTS,
                payload: res.data
            })
            CreateAlert(dispatch)
        }
        response(res)
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSendDefectsAction = (payload, employee_id, location_id, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.getSendDefects(payload, employee_id, location_id)
        if (res.status === 200) {
            dispatch({
                type: GET_SEND_DEFECTS,
                payload: res.data
            })
              if (response) response(res.data)
            // CreateAlert(dispatch)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const deleteSendDefectsAction = (id) => async (dispatch) => {
    try {
        const res = await defects_services.deleteSendDefects(id)
        if (res.status === 200) {
            dispatch({
                type: DELETE_SEND_DEFECTS,
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

export const setSearchCollectedDefectsAction = (data) => {
    return {
        type: SET_SEARCH_DEFECT_COLLECTION,
        payload: data
    }
}

export const getSearchCollectedDefectsAction = (body, employee_id, location_id, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type: GET_SEARCH_DEFECT_COLLECTION,
        body,
        location_id,
        employee_id,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const deleteDefectCollectionAction = (collection_id, response) => async (dispatch) => {
    try {
        const res = await defects_services.deleteDefectCollection(collection_id)
        if (res.status === 200) {
            dispatch({
                type: DELETE_COLLECTED_DEFECT,
                payload: res.data
            })
        }
        if (response) {
            response(res)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const editDefectCollectionAction = (payload, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.editCollectedDefects(payload)
        if (res.status === 200) {
            dispatch({
                type: EDIT_COLLECTED_DEFECTS,
                payload: res.data
            })
        }
        if (response) {
            response(res)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getDefectByCustomerVendorAction = (id, type) => async (dispatch) => {
    try {
        const res = await defects_services.getDefectByCustomerVendor(id, type)
        if (res.status === 200) {
            dispatch({
                type: DEFECTS_BY_CUSTOMER_VENDOR,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setDefectByCustomerVendorAction = (data) => {
    return {
        type: DEFECTS_BY_CUSTOMER_VENDOR,
        payload: data
    }
}

export const resetCustomerVendorDefectAction = (data) => {
    return{
        type: DEFECTS_BY_CUSTOMER_VENDOR,
        payload: data
    }
}

export const getCollectedDefectByIdAction = (id) => async (dispatch) => {
    try {
        const res = await defects_services.getCollectedDefectsById(id)
        if (res.status === 200) {
            dispatch({
                type: COLLECTED_DEFECT_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const createCustomerReplacementAction = (payload, response) => async (dispatch) => {
    try {
        const res = await defects_services.createCustomerReplacement(payload)
        if (res.status === 200) {
            dispatch({
                type: CREATE_CUSTOMER_REPLACEMENT,
                payload: res.data
            })
            ReplacementAlert(dispatch)
        }
        if (response) {
            response(res)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const listReplacementAction = (payload, employee_id, location_id, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.listReplacement(payload, employee_id, location_id)
        if (res.status === 200) {
            dispatch({
                type: LIST_REPLACEMENT,
                payload: res.data
            })
        }
        if (response) {
            response(res.data)
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSendDefectsByIdAction = (id) => async (dispatch) => {
    try {
        const res = await defects_services.getSendDefectsById(id)
        if (res.status === 200) {
            dispatch({
                type: GET_SEND_DEFECTS_BY_ID,
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

export const updateSendDefectsAction = (payload, response) => async (dispatch) => {
    try {
        const res = await defects_services.updateSendDefects(payload)
        if (res.status === 200) {
            dispatch({
                type: UPDATE_SEND_DEFECTS,
                payload: res.data
            })
        }
        if(response){
            response(res)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setSearchReplacementAction = (data) => {
    return {
        type: SET_SEARCH_REPLACEMENT,
        payload: data
    }
}

export const getSearchReplacementAction = (body, employee_id, location_id, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type: GET_SEARCH_REPLACEMENT,
        body,
        location_id,
        employee_id,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const getDefectCollectedSentProductAction = (type, id, purpose) => async (dispatch) => {
    try {
        const res = await defects_services.getDefectCollectedSentProduct(type, id, purpose)
        if (res.status === 200) {
            dispatch({
                type: PRODUCT_DEFECT_COLLECTED_SENT,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setDefectCollectedSentProductAction = (data) => {
    return{
        type: PRODUCT_DEFECT_COLLECTED_SENT,
        payload: data
    }
}

export const createVendorReplacementAction = (payload, response) => async (dispatch) => {
    try{
        const res = await defects_services.createVendorReplacement(payload)
        if (res.status === 200) {
            dispatch({
                type: CREATE_VENDOR_REPLACEMENT,
                payload: res.data
            })
            ReplacementAlert(dispatch)
        }
        if (response) {
            response(res)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const convertToCreditDebitNoteAction = (payload, tabValue, response) => async(dispatch) => {
    try {
        const res = await defects_services.convertToCreditDebitNote(payload)
        if (res.status === 200) {
            dispatch({
                type: CONVERT_TO_CREDIT_DEBOT_NOTE,
                payload: res.data
            })
            CreditDebitNoteConvertAlert(dispatch, tabValue)
        }
        if (response) {
            response(res)
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getProductByCustomerAction = (customer_id, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.getProductByCustomer(customer_id)
        if(res.status === 200){
            dispatch({
                type: PRODUCT_BY_CUSTOMER,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getInvoicesByProductAction = (payload) => async(dispatch) => {
    try{
        const res = await defects_services.getInvoicesByProduct(payload)
        if(res.status === 200){
            dispatch({
                type: INVOICE_BY_PRODUCT,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getProductByVendorAction = (supplier_id, setModalTypeHandler, setLoaderStatusHandler) => async(dispatch) => {
    try{
        ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await defects_services.getProductByVendor(supplier_id)
        if(res.status === 200){
            dispatch({
                type: PRODUCT_BY_VENDOR,
                payload: res.data
            })
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSendDefectSequenceAction = () => async(dispatch) => {
    try{
        const res = await defects_services.getSendDefectSequence()
        if(res.status === 200){
            dispatch({
                type: SEND_DEFECT_SEQUENCE,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setInvoiceByProductAction = (data) => {
    return{
        type: INVOICE_BY_PRODUCT,
        payload: data
    }
}

export const resetSendDefectsByIdAction = (data) => {
    return{
        type: GET_SEND_DEFECTS_BY_ID,
        payload: data
    }
}

export const getReplacementByIdAction = (type, id) => async(dispatch) => {
    try{
        const res = await defects_services.getReplacementById(type, id)
        if(res.status === 200){
            dispatch({
                type: REPLACEMENT_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setReplacementByIdAction = (data) => {
    return{
        type: REPLACEMENT_BY_ID,
        payload: data
    }
}

export const resetDefectProductAction = (data) => {
    return{
        type: PRODUCT_DEFECT_COLLECTED_SENT,
        payload: data
    }
}

export const getDefectCollectionByIdAction = (id) => async(dispatch) => {
    try{
        const res = await defects_services.getDefectCollectionById(id)
        if(res.status === 200){
            dispatch({
                type: DEFECT_COLLECTION_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setDefectCollectionByIdAction = (data) => {
    return{
        type: DEFECT_COLLECTION_BY_ID,
        payload: data
    }
}

export const getDefectSentByIdAction = (id) => async(dispatch) => {
    try{
        const res = await defects_services.getDefectSentById(id)
        if(res.status === 200){
            dispatch({
                type: DEFECT_SENT_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setDefectSentByIdAction = (data) => {
    return{
        type: DEFECT_SENT_BY_ID,
        payload: data
    }
}

export const deleteReplacementAction = (type, id, response) => async(dispatch) => {
    try{
        const res = await defects_services.deleteReplacement(type, id)
        if(response){
            response(res)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const editReplacementAction = (type, id, data, response) => async(dispatch) => {
    try{
        const res = await defects_services.editReplacement(type, id, data)
        if(response){
            response(res)
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getReplacementItemsByReplacementIdAction = (type, id) => async(dispatch) => {
    try{
        const res = await defects_services.getReplacementItemsByReplacementId(type, id)
        if(res.status === 200){
            dispatch({
                type: REPLACEMENT_ITEMS_BY_ID,
                payload: res.data
            })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        ErrorAlert(dispatch, err)
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const setReplacementItemsByReplacementIdAction = (data) => {
    return{
        type: REPLACEMENT_ITEMS_BY_ID,
        payload: data
    }
}

// Backward-compatible alias used in older imports
export const getInvoiceByVendorAction = getBillsByVendorAction;
