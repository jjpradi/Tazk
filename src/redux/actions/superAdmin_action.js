import superAdmin_services from '../../services/superAdmin_services';
import { GET_APPROVE_STATUS, GET_COMPANY_SUBSCRIPTION, GET_REJECTED_REQUEST, GET_SHOP_TYPE, GET_SUBSCRIPTION_RECORDS, MANUAL_PAYMENT_FOR_SUBSCRIPTION, SET_GET_REGISTERED_USER, UPDATE_SUBSCRIPTION_DATE } from '../actionTypes'
import { AssignedAlert, ErrorAlert, FailLoad, ListLoad, UpdateAlert } from './load';

export const companyListAction = (
  data,
  setModalTypeHandler,
  setLoaderStatusHandler) =>
async (dispatch) => {
  try {
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await superAdmin_services.getCompanyDetails(data)

    if (res.status === 200) {
      dispatch({
        type: GET_COMPANY_SUBSCRIPTION,
        payload: res.data,
      });
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const updateSubscriptionDateAction = (data, setModalTypeHandler,
  setLoaderStatusHandler) =>
async (dispatch) => {
  try {
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await superAdmin_services.updateSubscription(data)

    if (res.status === 200) {
      dispatch({
        type: GET_COMPANY_SUBSCRIPTION,
        payload: res.data,
      });
        AssignedAlert(dispatch);
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const getCompanyStatusAction =
(id,response) => async (dispatch) => {
  try {
    const res = await superAdmin_services.getApprovestatus(id);
    console.log(res,'res');
    if (res.status === 200) {
      dispatch({
        type: GET_APPROVE_STATUS,
        payload: res.data,
      });
      if (response) {
        response(res.data);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  
  } catch (err) {
    console.log(err,'err');
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


  export const getRejectedRequestAction = (id,data) =>
    async (dispatch) => {
      try {
        const res = await superAdmin_services.getRejectedRequest(id,data);
        if (res.status === 200) {
          dispatch({
            type: GET_REJECTED_REQUEST,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    }; 



      export const UpdateCompanyDetailsAction = (data , response) =>
      async (dispatch) => {
        try {
          const res = await superAdmin_services.updateDetails(data);
          if (res.status === 200) {
            dispatch({
              type: SET_GET_REGISTERED_USER,
              payload: res.data,
            });
            if (response) {
              response(res.data.data)
            }
            UpdateAlert(dispatch)
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      }; 


        export const getSubscriptionRecords = (id) =>
        async (dispatch) => {
          try {
            const res = await superAdmin_services.getSubscription(id);
            if (res.status === 200) {
              dispatch({
                type: GET_SUBSCRIPTION_RECORDS,
                payload: res.data,
              });
      
            }
            return Promise.resolve("API_FINISHED_SUCCESS");
          } catch (err) {
            ErrorAlert(dispatch, err);
            return Promise.reject("API_FINISHED_ERROR");
          }
        }; 



          
          export const getShopTypeAction = (response) =>
            async (dispatch) => {
              try {
                const res = await superAdmin_services.getShopType();
                if (res.status === 200) {
                  dispatch({
                    type: GET_SHOP_TYPE,
                    payload: res.data,
                  });
          
                  if(response){
                    response(res.data)
                  }
                }
                return Promise.resolve("API_FINISHED_SUCCESS");
              } catch (err) {
                ErrorAlert(dispatch, err);
                return Promise.reject("API_FINISHED_ERROR");
              }
            }; 


               export const insertManualPaymentDetailsAction = (data) =>
                              async (dispatch) => {
                                try {
                                  const res = await superAdmin_services.insertManualPaymentDetails(data);
                                  if (res.status === 200) {
                                    dispatch({
                                      type: MANUAL_PAYMENT_FOR_SUBSCRIPTION,
                                      payload: res,
                                    });
                                  }
                                  // UpdateAlert(dispatch);
                                  return Promise.resolve("API_FINISHED_SUCCESS");
                                } catch (err) {
                                  
                                  ErrorAlert(dispatch, err);
                                  return Promise.reject("API_FINISHED_ERROR");
                                }
              };