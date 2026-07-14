import {
    GET_DELETED_LOG_DETAILS,
    GET_DELETE_LIST,
    SET_DELETED_LOG_DETAILS
}  from "redux/actionTypes";

import DeletedDetails from 'services/deletedLog_services'
import { ErrorAlert } from "./load";

export const GetDeletedDetails = (data) => async(dispatch)=>{
    try{
        const res = await DeletedDetails.getAll(data);
        if(res.status === 200){
            dispatch({
                type : SET_DELETED_LOG_DETAILS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESSFULLY")
    }
    catch(err){
        ErrorAlert(dispatch,err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
};

export const setSearchDeleteListAction =(data)=>{
    return{
        type : SET_DELETED_LOG_DETAILS,
        payload : data
    }
}

export const getSearchDeleteListAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_DELETED_LOG_DETAILS,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const setSearchAlertsListAction = (data) => {
    return {
      type : GET_DELETED_LOG_DETAILS,
      payload : data
    }
};

