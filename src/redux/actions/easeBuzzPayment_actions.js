import easeBuzzPayment_services from 'services/easeBuzzPayment_services';
import { ErrorAlert, FailLoad, ListLoad } from './load'; 
import { INITIATE_PAYMENT } from 'redux/actionTypes';

    export const initiatePaymentEaseBuzzPaymentAction = (data) =>
      async (dispatch) => {
        try {
          const res = await easeBuzzPayment_services.initiatePayment(data);
          if (res.status === 200) {
            dispatch({
              type: INITIATE_PAYMENT,
              payload: res.data,
            });
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      };