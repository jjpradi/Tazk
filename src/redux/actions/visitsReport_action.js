import {GET_VISITS_REPORT} from '../actionTypes'
  
  import visits_service from 'services/visits_service';
  import {ListLoad, FailLoad, ErrorAlert} from './load';
  
  export const visitsReportAction =
    (id,headerLocation_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await visits_service.get(id,headerLocation_id, data);
        if (res.status === 200) {
          dispatch({
            type: GET_VISITS_REPORT,
            payload: res.data,
          });
          if(response) {
            response(res)
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        //}
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
 