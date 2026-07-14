import {
    GET_MAIL_CONFIGURATION_BY_ID,
    GET_ALL_MAIL_CONFIGURATION,
    GET_MAIL_ROLE_BY_ID,
    UPDATE_MAIL_CONFIGURATION,
    GET_ALL_SMS_CONFIGURATION,
    GET_SMS_CONFIGURATION_BY_ID,
    UPDATE_SMS_CONFIGURATION,
    SEND_TEST_MAIL_CONFIGURATION,
    GET_SEARCH_MAIL,
    SET_SEARCH_MAIL,
    SEND_TEST_SMS_CONFIGURATION,
    SET_LIST_SMS,
    GET_LIST_SMS,
    REMINDER_CONFIGURATION,
  } from '../actionTypes';
  import Configuration from '../../services/configuration_services';
  import {
    DeleteAlert,
    ErrorAlert,
    FailLoad,
    ListLoad,
    UpdateAlert,
    CreateAlert,
    testAlert,
  } from './load';
  import {createAction} from './actions';
import sales_services from 'services/sales_services';
import configuration_services from '../../services/configuration_services';
  
//   export const createLeadsAction =
//     (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
//     async (dispatch) => {
//       // createAction(Leadsservice, CREATE_LEADS, dispatch, data, null, null,  setModalTypeHandler, setLoaderStatusHandler, sample)
//       try {
//         ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//         const res = await Leadsservice.create(data);
//         if (res.status === 200) {
//           dispatch({
//             type: CREATE_LEADS,
//             payload: res.data.data,
//           });
//           dispatch({
//             type: TOTAL_LEADS_COUNT,
//             payload: res.data.numRows,
//           });
//           if (sample) {
//             sample(false);
//           }
//           FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//           CreateAlert(dispatch);
//         } else {
//           FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//           // alertResponce(res.data.status, 'error')
//         }
//         return Promise.resolve(res.data.data);
//       } catch (err) {
//         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//         ErrorAlert(dispatch, err);
//         //  return Promise.reject(err);
//         // }
//       }
//     };
  
//   export const listLeadsAction =
//     (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
//       try {
//         ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//         const res = await Leadsservice.getAll();
//         if (res.status === 200) {
//           dispatch({
//             type: LIST_LEADS,
//             payload: res.data,
//           });
//           if (exportDataCallBack) {
//             exportDataCallBack(res.data);
//           }
//           //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
//         }
//         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//       } catch (err) {
//         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//         if (exportDataCallBack) {
//           exportDataCallBack([]);
//         }
//         ErrorAlert(dispatch, err);
//         //  }
//       }
//     };
  
export const getAllMailConfigurationAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    const res = await Configuration.getAllMailConfig();
    dispatch({
      type: GET_ALL_MAIL_CONFIGURATION,
      payload: res.data,
    });
    // return Promise.resolve(res.data);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};
  
  export const getByIdMailConfigurationAction = (mail_name,role_id) => async (dispatch) => {
    try {
      const res = await Configuration.getMailById(mail_name,role_id);
      dispatch({
        type: GET_MAIL_CONFIGURATION_BY_ID,
        payload: res.data,
      });
      // return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
      // }
      // else{
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getByIdMailRoleConfigurationAction = (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      const res = await Configuration.getMailRoleById( data);
      dispatch({
        type: GET_MAIL_ROLE_BY_ID,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
  export const updateMailRoleConfigurationAction =
    (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Configuration.updateMailRole(id, data);
        // if (res.data.affectedRows === 1) 
        UpdateAlert(dispatch);
        dispatch({
          type: GET_MAIL_ROLE_BY_ID,
          payload: res.data,
        });
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
         return res;
        // return Promise.resolve(res.data.data);
      } catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        //return Promise.reject(err);
        // }
      }
    };

    export const getAllSmsConfigurationAction = (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    
        const res = await Configuration.getAllSmsConfig();
        dispatch({
          type: GET_ALL_SMS_CONFIGURATION,
          payload: res,
        });
        // return Promise.resolve(res.data);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // if(err.response?.status === 500) {
        //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
        // }
        // else{
        ErrorAlert(dispatch, err);
        // }
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const getByIdSmsRoleConfigurationAction = (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Configuration.getSmsRoleById( data);
        dispatch({
          type: SET_LIST_SMS,
          payload: res.data,
        });
        // return Promise.resolve(res.data);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // if(err.response?.status === 500) {
        //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
        // }
        // else{
        ErrorAlert(dispatch, err);
        // }
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
    export const getByIdSmsConfigurationAction = (sms_role_name,role_id) => async (dispatch) => {
      try {
        const res = await Configuration.getSmsById(sms_role_name,role_id);
        dispatch({
          type: GET_SMS_CONFIGURATION_BY_ID,
          payload: res.data,
        });
        // return Promise.resolve(res.data);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // if(err.response?.status === 500) {
        //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
        // }
        // else{
        ErrorAlert(dispatch, err);
        // }
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

// export const updateSmsRoleConfigurationAction =
//     (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
//     async (dispatch) => {
//       try {
//         ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//         const res = await Configuration.updateSmsRole(id, data);
//         // if (res.data.affectedRows === 1) 
//         UpdateAlert(dispatch);
//         dispatch({
//           type: UPDATE_SMS_CONFIGURATION,
//           payload: res.data,
//         });
//         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//         // return Promise.resolve(res.data.data);
//       } catch (err) {
//         FailLoad(setModalTypeHandler, setLoaderStatusHandler);
//         ErrorAlert(dispatch, err);
//         //return Promise.reject(err);
//         // }
//       }
//     };

    export const updateSmsRoleConfigurationAction =
    (id, data, setModalTypeHandler, setLoaderStatusHandler, silent = false) =>
    async (dispatch) => {
      try {
        if (!silent) {
          ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        }
        const res = await Configuration.updateSmsRole(id, data);
        // if (res.data.affectedRows === 1)
        UpdateAlert(dispatch);
        dispatch({
          type: UPDATE_SMS_CONFIGURATION,
          payload: res.data,
        });
        if (!silent) {
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        }
        return res;
      } catch (err) {
        if (!silent) {
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        }
        ErrorAlert(dispatch, err);
        return Promise.reject(err);
      }
    };

    export const deleteSmsRoleConfigurationAction =
      (id, setModalTypeHandler, setLoaderStatusHandler) =>
      async (dispatch) => {
        try {
          ListLoad(setModalTypeHandler, setLoaderStatusHandler);
          const res = await Configuration.deleteSmsRole(id);
          if (res?.data?.changedRows === 1 || res?.status === 200) {
            DeleteAlert(dispatch);
          }
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          return res;
        } catch (err) {
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          ErrorAlert(dispatch, err);
          return Promise.reject(err);
        }
      };

    export const sendTestMailActions = (data) => async (dispatch) => {
      try {
        const res = await Configuration.sendTestMail(data);
        testAlert(dispatch)
        dispatch({
          type: SEND_TEST_MAIL_CONFIGURATION,
          payload: res.data
        })
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        // }
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const sendTestSMSAction = (data, response, setLoaderStatusHandler, setModalTypeHandler) =>
    async (dispatch) => {
      try {
        const res = await sales_services.sendTestSMS(data);
        if (res.status === 200) {
          testAlert(dispatch);
          dispatch({
            type: SEND_TEST_SMS_CONFIGURATION,
            payload: res.data,
          });
          if (response) {
            response(res.data.token);
          }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
    export const searchMailState = (data) => {
      return {
        type: SET_SEARCH_MAIL,
        payload: data
      }
    };
    
    export const searchMailAction = ( setModalTypeHandler, setLoaderStatusHandler, body) => {
      return {
        type: GET_SEARCH_MAIL,
         
        setModalTypeHandler,
        setLoaderStatusHandler,
        body
      }
    };
    
    export const setSearchSmsAction = (data) => {
      return {
        type: SET_LIST_SMS,
        payload: data
      }
    };
    
    export const getSearchSmsAction = ( setModalTypeHandler, setLoaderStatusHandler, body) => {
      return {
        type: GET_LIST_SMS,
        setModalTypeHandler,
        setLoaderStatusHandler,
        body
      }
    };

    export const reminderConfigurationAction = (data) => async(dispatch)=>{
      try{
        const res = await configuration_services.reminderConfiguration(data)
        if(res.status ===  200){
          dispatch({
            type : REMINDER_CONFIGURATION,
            payload : res.data
          })
        }
        return Promise.resolve('API_FINISHED_SUCCESS')
      }
      catch(err){
        ErrorAlert(dispatch, err);
        return Promise.reject('API_FINISHED_ERROR')
      }
    }

  export const deleteMailRoleConfigurationAction = (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Configuration.deleteMailRole(id);
      if (res?.data?.changedRows === 1 || res?.status === 200) {
        DeleteAlert(dispatch);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return res;
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

    // Backward-compatible alias used in older imports
    export const reminderConfiguration = reminderConfigurationAction;
  
