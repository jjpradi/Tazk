import { 
    CREATE_ALERTS, 
    GET_EMP_ALERTS_EMPLOYEE_FILTER, 
    GET_LIST_ALERTS, 
    GET_SEARCH_ALERTS_EMPLOYEE_FILTER, 
    SET_LIST_ALERTS, 
    SET_SEARCH_ALERTS_EMPLOYEE_FILTER
} from "redux/actionTypes";
import alerts_services from "services/alerts_services";
import { ErrorAlert } from "./load";

export const ListAlerts = (data, response) => async (dispatch) => {
    try {
        const res = await alerts_services.getAll(data);

        if(res.status === 200) {
            dispatch({
                type: SET_LIST_ALERTS,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchAlertsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type : GET_LIST_ALERTS,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
 
export const setSearchAlertsListAction = (data) => {
    return {
      type : SET_LIST_ALERTS,
      payload : data
    }
};


export const CreateAlertsAction = (data) => async (dispatch) => {
    try {
        const res = await alerts_services.createAll(data)

        if(res.status === 200) {
            dispatch({
                type: CREATE_ALERTS,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export  const getAlertsEmployeeFilterAction = (data) => async (dispatch) => {
    try {
        const res = await alerts_services.getAlertsEmployeeFilter(data)

        if(res.status === 200) {
            dispatch({
                type : GET_EMP_ALERTS_EMPLOYEE_FILTER,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch(err))
        return Promise.reject("API_FINISHED_ERROR")
    }
}

export const getSearchAlertsEmployeeFilterAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_SEARCH_ALERTS_EMPLOYEE_FILTER,
        data : body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchAlertsEmployeeFilterAction = (data) => {
    return {
        type : SET_SEARCH_ALERTS_EMPLOYEE_FILTER,
        payload : data
    }
}
