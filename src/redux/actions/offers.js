import {GET_OFFERS,CREATE_OFFERS} from '../actionTypes';
import OffersService from '../../services/offers';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  successmsg,
  errormsg,
  DeleteAlert,
  CannotDeleteAlert,
} from './load';



export const getOffersAction =
(setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
  try {
     ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await OffersService.getOfferDetails()
    if (res.status === 200) {
      dispatch({
        type: GET_OFFERS,
        payload: res.data,
      });
      if(response){
        response(res.status)
      }
    }
     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }


  
};


export const createOffersAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await OffersService.createOffer(data);
      if (res.status === 200) {

        dispatch({
          type: GET_OFFERS,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        CreateAlert(dispatch);
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };