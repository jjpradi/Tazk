import { CREATE_PLANS, GET_ALL_PLAN_BENEFITS, GET_ALL_PLANS, GET_ALL_SCHEDULED_PLAN, GET_ALL_STATUS, GET_ALL_TRAINING_TYPE, GET_CLIENTS, GET_PLAN_TYPE, GET_SEARCH_ALL_PLANS, GET_SEARCH_SCHEDULED_PLANS, SCHEDULE_PLAN, SET_SEARCH_ALL_PLANS, SET_SEARCH_SCHEDULED_PLANS, UPDATE_MAPPED_CLIENTS, UPDATE_PLANS, UPDATE_SCHEDULED_PLAN } from "redux/actionTypes";
import clientSubscription from "services/clientSubscription_service";
import { CreateAlert, ErrorAlert, UpdateAlert } from "./load";


export const createPlanAction = (data) => async (dispatch) => {
  try {
    const res = await clientSubscription.createPlan(data);
    if (res.status === 200) {
      CreateAlert(dispatch);
      dispatch({
        type: CREATE_PLANS,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updatePlanAction = (id,data) => async (dispatch) => {
    try {
      console.log(id,"id")
      const res = await clientSubscription.updatePlan(id,data);
      console.log("API Response:", res);
      if (res.status === 200) {
        UpdateAlert(dispatch)
        dispatch({
          type: UPDATE_PLANS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAllPlansAction = (data) => async (dispatch) => {
    try {
      const res = await clientSubscription.getAllPlans(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PLANS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getStatusAction = () => async (dispatch) => {
    try {
      const res = await clientSubscription.getStatus();
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_STATUS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getPlanTypeAction = () => async (dispatch) => {
    try {
      const res = await clientSubscription.getPlanType();
      if (res.status === 200) {
        dispatch({
          type: GET_PLAN_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const schedulePlanAction = (payload) => async (dispatch) => {
    try {
      const res = await clientSubscription.schedulePlan(payload);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch({
          type: SCHEDULE_PLAN,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateScheduledPlanAction = (payload) => async (dispatch) => {
    try {
      const res = await clientSubscription.updateScheduledPlan(payload);
      if (res.status === 200) {
        UpdateAlert(dispatch)
        dispatch({
          type: UPDATE_SCHEDULED_PLAN,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAllSchedulePlanAction = (data) => async (dispatch) => {
    try {
      const res = await clientSubscription.getAllSchedulePlan(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_SCHEDULED_PLAN,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getPlanBenefitsAction = () => async (dispatch) => {
    try {
      const res = await clientSubscription.getPlanBenefits();
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PLAN_BENEFITS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getTrainingTypeAction = () => async (dispatch) => {
    try {
      const res = await clientSubscription.getTrainingType();
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_TRAINING_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getClientsAction = () => async (dispatch) => {
    try {
      const res = await clientSubscription.getClients();
      if (res.status === 200) {
        dispatch({
          type: GET_CLIENTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateMappedClientsAction = (data) => async (dispatch) => {
    try {
      const res = await clientSubscription.updateMappedClients(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_MAPPED_CLIENTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getSearchAllPlansAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_ALL_PLANS,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

export const setSearchAllPlansAction = (data) => {
  return {
    type: SET_SEARCH_ALL_PLANS,
    payload: data,
  };
};

export const getSearchScheduledPlansAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_SCHEDULED_PLANS,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler,
  };
};

export const setSearchScheduledPlansAction = (data) => {
  return {
    type: SET_SEARCH_SCHEDULED_PLANS,
    payload: data,
  };
};

// Backward-compatible alias used in older imports
export const deleteMappedClientsAction = updateMappedClientsAction;
