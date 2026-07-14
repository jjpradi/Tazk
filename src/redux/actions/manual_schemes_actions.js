import {
    CREATE_MANUAL_SCHEMES,
    GET_ALL_MANUAL_SCHEMES,
    GET_SEARCH_MANUALSCHEMES,
    SET_SEARCH_MANUALSCHEMES,
  } from '../actionTypes';
  import ManualSchemesservice from '../../services/manual_schemes_services';
  import {
    CreateAlert,
    DeleteAlert,
    ErrorAlert,
    FailLoad,
    ListLoad,
    UpdateAlert,
    ExistAlert,
    commonAlert,
  } from './load';
  // import { updateAction } from './actions';
  
  export const createManualSchemesAction =
    (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await ManualSchemesservice.create(data);
        if(res.data.status === 'exists'){
          ExistAlert(dispatch);
        }
        if (res.status === 200 && res.data.status !== 'exists') {
          CreateAlert(dispatch);
         //getNewData
         
         dispatch({
            type: CREATE_MANUAL_SCHEMES,
            payload: res.data.affectedRows,
          });
        
          // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        } else if (res.data.status === 'exists') {
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          // alertResponce("Already Exists", 'error')
        }
        return Promise.resolve(res.data);
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        if (err.response.status === 409 && err.response.data.status === 'CANNOT CREATE')
        {commonAlert(dispatch, "Cannot Create");}
        else{ErrorAlert(dispatch, err);
        }
        // }
      }
    };
  
  export const listManualSchemesAction =
    (setModalTypeHandler, setLoaderStatusHandler,exportDataCallBack,) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await ManualSchemesservice.getAll();
        //  let rem = await res.data.map((m) => {
        //   return delete m['tableData'] ? m :null
        // }).filter( (f) => f !==null )
          dispatch({
            type: GET_ALL_MANUAL_SCHEMES,
            payload: res.data,
          });
          if (exportDataCallBack) {
            exportDataCallBack(res.data);
          }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        if (exportDataCallBack) {
          exportDataCallBack([]);
        }
        ErrorAlert(dispatch, err);
        //}
      }
    };

    export const get_searchManualSchemesAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
      return {
        type:GET_SEARCH_MANUALSCHEMES,
        body,
        setModalTypeHandler, 
        setLoaderStatusHandler
      }
    };
  
    export const set_searchManualSchemesAction = (data) => {
      return {
        type:SET_SEARCH_MANUALSCHEMES,
        payload:data
      }
    };
  
    export const manualSchemePaginationAction = (data) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await ManualSchemesservice.pagination(data);
        if (res.status === 200) {
          dispatch({
            type: SET_SEARCH_MANUALSCHEMES,
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
  