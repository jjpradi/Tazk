import { GET_BALANCE } from 'redux/actionTypes';
import Balance_Service from 'services/Balance_Service';
import {ListLoad, FailLoad, ErrorAlert} from './load';
  
  export const cashbalanceAction =
    (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Balance_Service.get();
        if (res.status === 200) {
          dispatch({
            type: GET_BALANCE,
            payload: res.data,
          });
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        //}
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
 