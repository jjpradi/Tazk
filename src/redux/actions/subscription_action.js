import { CANCEL_FOR_TRIAL, COMPANY_SUBSCRIPTIONS, MANUAL_PAYMENT_FOR_SUBSCRIPTION, ORDER_PLACED, PAYMENT_HISTORY, PLAN_DETAILS, PLAN_RENEWAL_DETAILS, RESTRICT_CREATION, SETTING_MODULES } from 'redux/actionTypes';
import subscription_services from '../../services/subscription_services';
import { ErrorAlert, FailLoad, ListLoad, UpdateAlert } from './load';


export const getSubscriptionDetailsAction = (data) =>
    async (dispatch) => {
      try {
        const res = await subscription_services.getSubscriptionDetails(data);
        if (res.status === 200) {
          dispatch({
            type: COMPANY_SUBSCRIPTIONS,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    }; 

    export const getPlanDetailsAction = (data) =>
      async (dispatch) => {
        try {
          const res = await subscription_services.getPlanDetails(data);
          if (res.status === 200) {
            dispatch({
              type: PLAN_DETAILS,
              payload: res.data,
            });
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          console.log("getSubscriptionDetailsAction",err);
          
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      };

      export const getPlanRenewalDetailsAction = (data) =>
        async (dispatch) => {
          try {
            const res = await subscription_services.getPlanRenewalDetails(data);
            if (res.status === 200) {
              dispatch({
                type: PLAN_RENEWAL_DETAILS,
                payload: res.data,
              });
            }
            return Promise.resolve("API_FINISHED_SUCCESS");
          } catch (err) {
            console.log("getSubscriptionDetailsAction",err);
            
            ErrorAlert(dispatch, err);
            return Promise.reject("API_FINISHED_ERROR");
          }
        };

        export const orderPlacedDetailsAction = (data) =>
          async (dispatch) => {
            try {
              const res = await subscription_services.orderPlacedDetails(data);
              if (res.status === 200) {
                dispatch({
                  type: ORDER_PLACED,
                  payload: res,
                });
              }
              return Promise.resolve("API_FINISHED_SUCCESS");
            } catch (err) {
              
              ErrorAlert(dispatch, err);
              return Promise.reject("API_FINISHED_ERROR");
            }
          };

          export const restrictNewCreationBasedOnPlanAction = () =>
            async (dispatch) => {
              try {
                const res = await subscription_services.restrictCreationBasesPlans();
                if (res.status === 200) {
                  dispatch({
                    type: RESTRICT_CREATION,
                    payload: res.data,
                  });
                }
                return Promise.resolve("API_FINISHED_SUCCESS");
              } catch (err) {
                
                ErrorAlert(dispatch, err);
                return Promise.reject("API_FINISHED_ERROR");
              }
            };

            export const paymentTransactionDetailsAction = (data) =>
              async (dispatch) => {
                try {
                  const res = await subscription_services.PaymentTransactionDetails(data);
                  if (res.status === 200) {
                    dispatch({
                      type: PAYMENT_HISTORY,
                      payload: res.data,
                    });
                  }
                  return Promise.resolve("API_FINISHED_SUCCESS");
                } catch (err) {
                  
                  ErrorAlert(dispatch, err);
                  return Promise.reject("API_FINISHED_ERROR");
                }
              };

              export const cancelSubscriptionForTrialAction = () =>
                async (dispatch) => {
                  try {
                    const res = await subscription_services.cancelSubscriptionForTrial();
                    if (res.status === 200) {
                      dispatch({
                        type: CANCEL_FOR_TRIAL,
                        payload: res.data,
                      });
                    }
                    return Promise.resolve("API_FINISHED_SUCCESS");
                  } catch (err) {
                    
                    ErrorAlert(dispatch, err);
                    return Promise.reject("API_FINISHED_ERROR");
                  }
                };

                           
         export const settingsModulesBasedOnRoleAction = (data) =>
            async (dispatch) => {
              try {
                const res = await subscription_services.settingsModulesBasedOnRole(data);
                if (res.status === 200) {
                  dispatch({
                    type: SETTING_MODULES,
                    payload: res.data,
                  });
                }
                return res.data;
              } catch (err) {
                
                ErrorAlert(dispatch, err);
                return Promise.reject("API_FINISHED_ERROR");
              }
            };