
import {
    ListLoad,
    FailLoad,
    ErrorAlert,
    CreateAlert,
    successmsg,
    errormsg,
    UpdateAlert,
    DeleteAlert,
    departmentExists,
    verifyOtpAlert,
    otpSentAlert,
    passwordUpdateAlert,
    frontDeskCreateAlert,
    invalidOtpAlert,
    emailExceedAlert,
    userNameExistAlert,
    frontDeskUpdateAlert,
    companyOtpAlert
  } from './load';
  import { deleteAction } from './actions';
import requestConfig from 'services/requestConfig';
import { CREATE_FRONT_DESK, CREATE_POS_DISCOUNT_CONFIG, DISCOUNT_CONFIG_BY_POS_ID, GET_ALL_FRONT_DESK, GET_APPROVER_VERIFIER, GET_COMPANY_BASED_ADMIN_MANAGER, GET_MANAGER_BASED_ROUTES, GET_REQUEST_CONFIG_BY_ID, GET_REQUEST_TYPE, GET_SEARCH_COMPANY_BASED_ADMIN_MANAGER, GET_SEARCH_REQUEST_CONFIG, POS_DISCOUNT_BY_ID, SEND_MAIL_FORGOT, SET_SEARCH_COMPANY_BASED_ADMIN_MANAGER, SET_SEARCH_REQUEST_CONFIG, UPDATE_FRONT_DESK, UPDATE_PASSWORD, UPDATE_POS_DISCOUNT_CONFIG, VERIFY_OTP } from 'redux/actionTypes';
  
  
  
  export const getCompanyBasedAdminManagerAction =
    (data, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await requestConfig.getCompanyBasedAdminManager(data);
        if (res.status === 200) {
          dispatch({
            type: GET_COMPANY_BASED_ADMIN_MANAGER,
            payload: res.data,
          });
  
          if (response) {
            response()
          }
  
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        //}
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
  
  export const getRequestConfig =
    (setModalTypeHandler, setLoaderStatusHandler, data) =>
      async (dispatch) => {
        try {
  
          const res = await requestConfig.getConfig(data);
          if (res.status === 200) {
            dispatch({
              type: SET_SEARCH_REQUEST_CONFIG,
              payload: res.data,
            });
          }
  
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
  
          ErrorAlert(dispatch, err);
  
          return Promise.reject("API_FINISHED_ERROR");
        }
      };
  
  
  export const createConfig =
    (
      data, response
    ) =>
      async (dispatch) => {
        try {
  
          const res = await requestConfig.createConfig(data);
  
          if (res.data.status === 'Department and Request Already Configured') {
            departmentExists(dispatch, res.data.status)
  
          }
          else{
            dispatch({
              type: SET_SEARCH_REQUEST_CONFIG,
              payload: res.data,
            });
  
            if (res) {
              response(res.data)
            }
            CreateAlert(dispatch);
   
  
          }
  
  
          return Promise.resolve(response.data);
        } catch (err) {
  
          ErrorAlert(dispatch, err);
  
          return Promise.reject(err);
  
        }
      };
  
  export const getConfigById =
    (id, response) => async (dispatch) => {
      try {
  
        const res = await requestConfig.getConfigById(id);
        dispatch({
          type: GET_REQUEST_CONFIG_BY_ID,
          payload: res.data,
        });
  
        if (res) {
          response(res.data)
        }
        return Promise.resolve(res.data);
      } catch (err) {
  
        ErrorAlert(dispatch, err);
  
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
    
    export const getManagerBasedRoutesAction =
    () => async (dispatch) => {
      try {
  
        const res = await requestConfig.getManagerBasedRoutes();
        dispatch({
          type: GET_MANAGER_BASED_ROUTES,
          payload: res.data,
        });
  
        return Promise.resolve(res.data);
      } catch (err) {
  
        ErrorAlert(dispatch, err);
  
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
    export const updateConfig =
      (
        id,
        data,
        response

      ) =>
        async (dispatch) => {
          try {

            const res = await requestConfig.updateConfig(id, data);

            if (res.data.status === 'Department and Request Already Configured') {
              departmentExists(dispatch, res.data.status)
            } else {
              dispatch({
                type: SET_SEARCH_REQUEST_CONFIG,
                payload: res.data,
              });

              if (res) {
                response(res.data)
              }

              UpdateAlert(dispatch);
            }
            return Promise.resolve(res.data);
          } catch (err) {

            ErrorAlert(dispatch, err);

            return Promise.reject(err);

          }
        };
  
  export const deleteConfig =
    (
      id,response
    ) =>
      async (dispatch) => {
        try {
  
          const res = await requestConfig.deleteConfig(id);
  
        
            if (res.data.changedRows === 1) DeleteAlert(dispatch);
            dispatch({
              type: SET_SEARCH_REQUEST_CONFIG,
              payload: res.data,
            });
            // if (res) {
            //   response(res.data)
            // }
               return Promise.resolve(res.data);
        } catch (err) {
  
          ErrorAlert(dispatch, err);
  
          return Promise.reject(err);
        }
      };
  
      export const getRequestTypeAction =
  () =>
    async (dispatch) => {
      try {



        const res = await requestConfig.getRequestType();


        if (res.status === 200) {
          dispatch({
            type: GET_REQUEST_TYPE,
            payload: res.data,
          });
        }

       

        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {

        ErrorAlert(dispatch, err);

        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const getRequestApproverVerifierType =
    (id) =>
      async (dispatch) => {
        try {
  
  
  
          const res = await requestConfig.getRequestApproverVerifierType(id);
  
  
          if (res.status === 200) {
            dispatch({
              type: GET_REQUEST_TYPE,
              payload: res.data,
            });
          }
  
         
  
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
  
          ErrorAlert(dispatch, err);
  
          return Promise.reject("API_FINISHED_ERROR");
        }
      };

  export const setSearchRequestConfigState = (data) => {
    return {
      type: SET_SEARCH_REQUEST_CONFIG,
      payload: data
    }
  };
  
  export const getSearchRequestConfigAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_REQUEST_CONFIG,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  

  
  export const get_search_company_based_admin_manager= (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_COMPANY_BASED_ADMIN_MANAGER,
      data: body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  
  export const set_search_company_based_admin_manager = (data) => {
    return {
      type: SET_SEARCH_COMPANY_BASED_ADMIN_MANAGER,
      payload: data
    }
  };

  export const getEmpDeptApproverVerifierAction = (id,data) => async (dispatch) => {
    try {
      const res = await requestConfig.getEmpDeptApproverVerifier(id,data);

      if (res.status === 200) {
        dispatch({
          type: GET_APPROVER_VERIFIER,
          payload: res.data,
        });
        console.log("resdata",res.data);
        
      }

      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);

      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const sendMailForgetPasswordAction = (data, setLoaderStatusHandler) => async (dispatch) => {
  try {
    const res = await requestConfig.sendMailForgot(data);
    if (res.status === 200) {
      dispatch({
        type: SEND_MAIL_FORGOT,
        payload: res.data,
      });

      if (res.data.message === "mail sent") {
        companyOtpAlert(dispatch)
      }
      if (res.data.message === "Email exceeded") {
        emailExceedAlert(dispatch)
      }

      return res.data;
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const verifyOtpAction = (data, response) => async (dispatch) => {
  try {
    const res = await requestConfig.verifyOtp(data);
    if (res.status === 200) {
      dispatch({
        type: VERIFY_OTP,
        payload: res.data,
      });

      if (res.data.message === "otp verified") {
        verifyOtpAlert(dispatch)
      }else{
        invalidOtpAlert(dispatch)
      }

      return res.data;
    }

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updatePasswordAction = (data, response) => async (dispatch) => {
  try {
    const res = await requestConfig.updatePassword(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_PASSWORD,
        payload: res.data,
      });

      if (res.data.message === "password updated") {
        passwordUpdateAlert(dispatch)
      }

      return res.data;
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const createFrontDeskAction = (data, response) => async (dispatch) => {
  try {
    const res = await requestConfig.createFrontDesk(data);
    if (res.status === 201) {
      dispatch({
        type: CREATE_FRONT_DESK,
        payload: res.data,
      });

     if (res.data.message === "User Name Already Exists") {
         userNameExistAlert(dispatch)
         return Promise.resolve(res.data.message);
      }

      if (res.data.message === "Front Desk User Created Successfully") {
        frontDeskCreateAlert(dispatch)
      }
      return res.data;
    }
    
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getAllFrontDeskAction = (data, response) => async (dispatch) => {

  try {
    const res = await requestConfig.getAllFrontDesk(data);
    if (res.status === 200) {
      dispatch({
        type: GET_ALL_FRONT_DESK,
        payload: res.data,
      });

      if (res.data.message === "Front Desk User Created Successfully") {
        frontDeskCreateAlert(dispatch)
      }

      return res.data;
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateFrontDeskUserAction = (data, response) => async (dispatch) => {

  try {
    const res = await requestConfig.updateFrontDeskUser(data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_FRONT_DESK,
        payload: res.data,
      });

      if (res.data.message === "Updated successfully") {
        frontDeskUpdateAlert(dispatch)
      }

      return res.data;
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const createPOSDiscountConfigAction = (data) => async(dispatch) => {
  try{
    const res = await requestConfig.createPOSDiscount(data)
    if(res.status === 200){
      CreateAlert(dispatch)
      dispatch({
        type: CREATE_POS_DISCOUNT_CONFIG,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}

export const getPOSDiscountByIdAction = (id, response) => async(dispatch) => {
  try{
    const res = await requestConfig.getPOSDiscountById(id)
    if(res.status === 200){
      dispatch({
        type: POS_DISCOUNT_BY_ID,
        payload: res.data
      })
    }
    if(response){
      response(res.data)
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}

export const updatePOSDiscountConfigAction = (data, discountConfigId) => async(dispatch) => {
  try{
    const res = await requestConfig.updatePOSDiscount(data, discountConfigId)
    if(res.status === 200){
      CreateAlert(dispatch)
      dispatch({
        type: UPDATE_POS_DISCOUNT_CONFIG,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}

export const getDiscountConfigByPosIdAction = (posId) => async(dispatch) => {
  try{
    const res = await requestConfig.getDiscountConfigByPosId(posId)
    if(res.status === 200){
      dispatch({
        type: DISCOUNT_CONFIG_BY_POS_ID,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR")
  }
}

// Backward-compatible alias used in older imports
export const getRequestType = getRequestTypeAction;
