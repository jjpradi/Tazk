import { COMPANY_LOGO, COMPANY_SIGNATURE, CREATE_COMPANY, GET_COMPANY_GPS_RADIUS, GET_COMPANY_LIST, GET_INDUSTRY_TYPE, GET_MULTI_TYPES, GET_TYPES, UPDATE_DEFAULT_TYPE} from '../actionTypes';
import CompanyService from 'services/company_services';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
} from './load';
import { deleteAction} from './actions';




  export const CreateCompany =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CompanyService.create(data);
      if (res.data.changedRows === 1) CreateAlert(dispatch);
      dispatch({
        type: CREATE_COMPANY,
        payload: res.data,
      });
      successmsg(sample);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
    };
  
    export const listCompanyNameErrorDBoard = (data, setModalTypeHandler,
      setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await CompanyService.getCompanyName(data);
      if (res.status === 200) {
        dispatch({
          type: GET_COMPANY_LIST,
          payload: res.data,
        });
      }
       if (res.status !== 200) {
        response(res.status, res);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getCompanyTypesAction =
  () => async (dispatch) => {
    try {
      const res = await CompanyService.getTypes();
      if (res.status === 200) {
        dispatch({
          type: GET_TYPES,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getMultiTypesAction = (data) => async (dispatch) => {
    try {
      const res = await CompanyService.getMultiTypes(data);
      if (res.status === 200) {
        dispatch({
          type: GET_MULTI_TYPES,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateDefaultTypeAction = (data) => async (dispatch) => {
    try {
      const res = await CompanyService.updateDefaultType(data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_DEFAULT_TYPE,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };



  export const listCompanyGpsRadiusAction = (setModalTypeHandler,
    setLoaderStatusHandler) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await CompanyService.getGpsRadius();
    if (res.status === 200) {
      dispatch({
        type: GET_COMPANY_GPS_RADIUS,
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

  export const updateGpsAttendanceAction =
  (data) => async (dispatch) => {
    try {
      const res = await CompanyService.updateGpsAttendance(data);
      if (res.status === 200) {
        // dispatch({
        //   type: GET_TYPES,
        //   payload: res.data,
        // });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateEnableLiveAction =
  (data) => async (dispatch) => {
    try {
      const res = await CompanyService.updateEnableLive(data);
      if (res.status === 200) {
        // dispatch({
        //   type: GET_TYPES,
        //   payload: res.data,
        // });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const updateWorkFromHomeAction =
  (data) => async (dispatch) => {
    try {
      const res = await CompanyService.updateWorkFromHome(data);
      if (res.status === 200) {
        // dispatch({
        //   type: GET_TYPES,
        //   payload: res.data,
        // });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getCompanyLogo =
  () => async (dispatch, response) => {
    console.log('SSSSSSZDXZD');
    try {
      const res = await CompanyService.getCompanyLogo();
      if (res.status === 200) {
        dispatch({
          type: COMPANY_LOGO,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const getCompanyLogoSalary =
  () => async (dispatch, response) => {
    try {
      const res = await CompanyService.getCompanyLogoSalary();
      if (res.status === 200) {
        dispatch({
          type: COMPANY_LOGO,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getCompanybase64Logo =
  (response) => async (dispatch) => {
    console.log('SSSSSSZDXZD');
    try {
      const res = await CompanyService.getCompanybase64Logo();
      if (res.status === 200) {
       
        if (response) {
          response(res.data)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getSignature =
  () => async (dispatch, response) => {
    try {
      const res = await CompanyService.getSignature();
      if (res.status === 200) {
        dispatch({
          type: COMPANY_SIGNATURE,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getSignatureSalary =
  () => async (dispatch, response) => {
    try {
      const res = await CompanyService.getSignatureSalary();
      if (res.status === 200) {
        dispatch({
          type: COMPANY_SIGNATURE,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const uploadCompanyLogo =
  (data) => async (dispatch, response) => {
    try {
      console.log('DDDXFXXFXF');
      const res = await CompanyService.uploadCompanyLogo(data);
      if (res.status === 200) {
        dispatch({
          type: COMPANY_LOGO,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const uploadSignature =
  (data) => async (dispatch, response) => {
    try {
      const res = await CompanyService.uploadSignature(data);
      if (res.status === 200) {
        dispatch({
          type: COMPANY_SIGNATURE,
          payload: res.data,
        });
        if (response) {
          response(res.status)
        }

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getIndustryTypeAction = () => async (dispatch) => {
    try {
      const res = await CompanyService.getIndustryType();
      if (res.status === 200) {
        dispatch({
          type: GET_INDUSTRY_TYPE,
          payload: res.data,
        });

        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } 
    catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }



  
export const updateGpsandEnableLiveAction = (data) => async (dispatch) => {
  await dispatch(updateGpsAttendanceAction(data));
  await dispatch(updateEnableLiveAction(data));
  return Promise.resolve("API_FINISHED_SUCCESS");
};

