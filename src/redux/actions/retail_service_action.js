import retail_services from "services/retail_services";
import { CheckInAlert, CreateAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert } from "./load";
import { ADD_RETAIL_SERVICE, CLEAR_EDIT_DATA, GET_DELIVERY_DATE, GET_SERVICE_PAYMENT, SET_LIST_RETAIL_SERVICE, STATUS_COUNT, UPDATE_RETAIL_CUSTOMER_INTERACTIONS, UPDATE_RETAIL_SERVICE } from "redux/actionTypes";

export const addretailServiceAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.add_service(data);
      if (res.data?.status === "created") {
        CreateAlert(dispatch);
        if(res.data?.data?.service_id){
            dispatch({
                type: ADD_RETAIL_SERVICE, payload: res.data?.data
            }) 
            if(response){
              response(res.data)
          }
        }
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getretailServiceAction = (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.get_service(data);
      if (res.status == 200) {
        dispatch({
            type: SET_LIST_RETAIL_SERVICE, payload: res.data
        })
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getretailServiceidAction = ( setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.get_service_id();
      if(res.status === 200){
        response(res.data)
      }

      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
  export const jobCardCountAction = (data) => async (dispatch) => {
    try {
      const res = await retail_services.jobCardCount(data)
      if (res.status === 200) {
        dispatch({
          type: STATUS_COUNT,
          payload: res,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
  export const getTargetDeliveryAction = (data) => async (dispatch) => {
    try {
      const res = await retail_services.getTargetDelivery(data)
      if (res.status === 200) {
        dispatch({
          type: GET_DELIVERY_DATE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getpreviousdateaction = ( customer_id,setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.get_previousdate(customer_id);
    response(res.data)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getservicebycustomeridaction = ( customer_id,setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.get_servicebycustomerid(customer_id);
    response(res.data)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const addretailcustomerinteractionaction = (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.add_customer_interaction(data);
      if (res.data?.length > 0) {
        CreateAlert(dispatch);
        response()
       dispatch({type:UPDATE_RETAIL_CUSTOMER_INTERACTIONS,payload:{service_id:data?.service_id,data:res?.data}})
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateretailServiceAction = (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await retail_services.update_service(data);
      if (res.data?.status === "updated") {
        // CheckInAlert(dispatch);
       
        if(res.data?.data?.service_id){
            dispatch({
                type: UPDATE_RETAIL_SERVICE, payload: res.data?.data
            }) 
        }
        if(response){
          response(res.data)
        }
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getServicePaymentAction=(data)=>async(dispatch)=>{
    try{

      const res = await retail_services.get_service_payment(data)

      if(res.status === 200){
        dispatch({
          type : GET_SERVICE_PAYMENT,
          payload : res.data
        })
      }

      return Promise.resolve('API_FINISHED_SUCCESS')

    }
    catch(err){
      return Promise.reject('API_FINISHED_ERROR')
    }
  }

  export const clearEditDataAction = () => ({
  type: CLEAR_EDIT_DATA,
  });

