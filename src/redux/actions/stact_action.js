import { GET_CLIENTS_DETAILS_COUNT } from "redux/actionTypes";
import stact_service from "services/stact_service";

  export const getClientDetailsAction = () => async (dispatch) => {
    try {
      const res = await stact_service.getClientDetails();
      if (res.status === 200) {
        dispatch({
          type: GET_CLIENTS_DETAILS_COUNT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };