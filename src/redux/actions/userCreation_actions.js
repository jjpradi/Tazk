import {
  CREATE_USER_CREATION,
  UPDATE_USER_CREATION,
  STATUS_CREATE_USER_CREATION,
  GET_ALL_USER,
  DELETE_USER,
  EDIT_USER,
  GET_USER_LOCATIONS,
  GET_USER_BY_ID,
  GET_SEARCH_USERCREATION,
  SET_SEARCH_USERCREATION,
  GET_REGISTERED_USER,
  UPDATE_REGISTER_USER,
  UPDATE_DEVICE_ID,
  UPDATE_DETAILS_COMPANY,
  DEPARTMENT_LIST,
  SET_REGISTERED_USER,
  RE,
  EMP_VERIFICATION_DETAIL,
  COMPLETED_EMPLOYEE_VALUE,
  LIST_VERIFICATION,
  EMPLOYEE_DETAILS,
  VERIFICATION_TYPE,
  VERIFICATION,
  LOAD_REGISTERED_USER,
  GET_SUBSCRIPTION_RECORDS,
  SET_GET_REGISTERED_USER,
  GET_COMPANY_DETAIL,
  SET_COMPANY_DETAIL,
  GET_SEARCH_REGISTERED_USER,
  GET_REJECTED_REQUEST,
  EMP_DOCUMENTS_DETAILS,
  EMP_DOCUMENTS_EMAIL,
  ENABLE_DISABLE_EMP_LOGIN,
  BANK_TRANSACTION_TYPE,
  GET_SHOP_TYPE,
  LIST_EVENTS,
  CREATE_EVENT,
  DELETE_EVENT,
  DESIGNATION,
  DELETE_DESIGNATION,
  ADD_DESIGNATION,
  GET_SEARCH_DESIGNATION,
  SET_SEARCH_DESIGNATION,
  SESSION_DETAIL,
  SEND_MAIL_FORGOT,
  LAST_ACTIVE_DATE,
  ADD_TRAINING_TYPE,
  TRAINING_TYPE,
  SET_SEARCH_TRAINING_TYPE,
  GET_SEARCH_TRAINING_TYPE,
  ADD_PLAN_TYPE,
  PLAN_TYPE,
  BENEFITS,
  SET_SEARCH_PLAN_TYPE,
  SET_SEARCH_BENEFITS,
  GET_SEARCH_BENEFITS,
  ADD_BENEFITS,
  GET_THEMES,
  UPDATE_THEMES,
  UPDATE_DESIGNATION,
  REPORTING_MANAGER,
  GET_WHATSAPP_LOGS
} from '../actionTypes';
import UserCreationService from '../../services/userCreation_services';
// import { ListLoad, FailLoad,ErrorAlert,CreateAlert,successmsg,setLoaderStatusHandler,setModalStatusHandler,errormsg} from './load';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert,
  Password,
  Passwordsuccess,
  enableEmpAlert,
  CannotDeleteAlert,
  invalidPrefixAlert,
  employeeCodeExists,
  employeeCodeAlert,
  commonAlert,
  categoryExists,
  designationExists,
  locationExists,
  departmentNameExists,
  userRoleNameExists
} from './load';
import userCreation_services from '../../services/userCreation_services';
import {deleteAction} from './actions';

export const createUserCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // createAction(UserCreationService, CREATE_USER_CREATION, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      const res = await UserCreationService.create(data);
      if (res.status === 200 && res.data !== 'User Name Already Exists' && res.data !== 'Phone Number Already Exists' && res.data !== 'Employee Code Already Exists') {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_USER_CREATION,
          payload: res.data,
        });
        successmsg(sample);
      } else if (res.data.status === 'exists') {
        dispatch({
          type: STATUS_CREATE_USER_CREATION,
          payload: res.data.existData,
        });
        // dispatch({
        //   type: Emp_CREATE_USER_CREATION,
        //   payload: res.data.existData,
        // });
        ErrorAlert(dispatch, {message: 'Already Exist'});
        //errormsg(sample);
      }
      else{
        ErrorAlert(dispatch, {message: res.data});
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const bulkcreateUserCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    // createAction(UserCreationService, CREATE_USER_CREATION, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserCreationService.bulkcreate(data);
      if (res.data.validationError === 'USER_LIMIT_REACHED') {
        commonAlert(dispatch, res.data.data);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'There is no prefix for the username' || res.data.validationError === 'Invalid prefix for the username') {
        invalidPrefixAlert(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Duplicate Employee ID found') {
        employeeCodeAlert(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Employee ID already exists') {
        employeeCodeExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Please Check the entered category!') {
        categoryExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Please Check the entered designation!') {
        designationExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Please Check the entered location!') {
        locationExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Please Check the entered department!') {
        departmentNameExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Please Check the entered user role!') {
        userRoleNameExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.status === 200 && res.data.status !== 'exists' && !res.data.validationError) {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_USER_CREATION,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        // successmsg(sample);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        dispatch({
          type: STATUS_CREATE_USER_CREATION,
          payload: res.data.existData,
        });

        if (response) {
          response(res.status, res);
        }
        
        // dispatch({
        //   type: Emp_CREATE_USER_CREATION,
        //   payload: res.data.existData,
        // });
        ErrorAlert(dispatch, {message: 'Already Exists'});
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // errormsg(sample);
      return Promise.reject(err);
    }
  };

  export const changepasswordAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserCreationService.changepassword(data);
      if (res.status === 200 ) {
        Passwordsuccess(dispatch);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return res.data
      } 
      
    } catch (err) {
      // if (err.response?.status === 401) {
      //   FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   Password(dispatch);
      // }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      Password(dispatch);
      // errormsg(sample);
      return Promise.reject(err);
    }
  };

export const updateUserCreationAction =
  (id, data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.update(id, data);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_USER_CREATION,
          payload: res.data,
        });
        if (response) {
          response(res.data.token);
        }
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

export const listUserCreationAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await userCreation_services.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_USER,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

export const listUserByid =
  (id,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await userCreation_services.getuserbyid(id);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_USER_BY_ID,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
    }
  };

export const getReportingManagerAction = () => async (dispatch) => {
    try {
      const res = await userCreation_services.getReportingManager();
      if (res.status === 200) {
        dispatch({
          type: REPORTING_MANAGER,
          payload: res.data,
        });
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listUserlocationsAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await userCreation_services.getLocations(id);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )

      if (res.status === 200) {
        const exceptLocationData = ['scrap location'];
        res.data = res.data.filter(
          (details) => !exceptLocationData.includes(details.location_name),
        );

        dispatch({
          type: GET_USER_LOCATIONS,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
    }
  };

export const LastActivedateAction =
  (data, id) => async (dispatch) => {
    try {
      const payload = {
        device_name: data.device_name,
        device_version: data.device_version,
        employee_id: id,
      };
      const res = await UserCreationService.LastActivedate(payload, id);
      dispatch({
        type: LAST_ACTIVE_DATE,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteUsercreationAction =
  (id) => async (dispatch) => {
    try {
      const res = await UserCreationService.delete(id);
      DeleteAlert(dispatch);
      dispatch({
        type: DELETE_USER,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const updateUsercreationallAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.useredit(id, data);
      if (res.status === 200 && res.data !== 'Phone Number Already Exists' && res.data !== 'Employee Code Already Exists' && res.data !== 'User Name Already Exists') {
        UpdateAlert(dispatch);
        dispatch({
          type: EDIT_USER,
          payload: res.data,
        });
        successmsg(sample);
      } else if (res.status === 200 && (res.data == 'Phone Number Already Exists' || res.data === 'Employee Code Already Exists')) {
        ErrorAlert(dispatch, {message: res.data});
      }
      else{
        ErrorAlert(dispatch, {message: res.data});
      }

      // if (res.status === 200) {
      //   UpdateAlert(dispatch);
      //   dispatch({
      //     type: EDIT_USER,
      //     payload: res.data,
      //   });
        
      // }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const get_searchUserCreationAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_USERCREATION,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchUserCreationAction = (data) => {
    return {
      type:SET_SEARCH_USERCREATION,
      payload:data
    }
  };


  export const userCreationPaginationAction = (data, callback) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.userCreationPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_USERCREATION,
          payload: res.data,
        });
        if (callback) {
          callback(res.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

// export const getRegisterRequestAction = (
//   data,
//   setModalTypeHandler,
//   setLoaderStatusHandler) =>
//   async (dispatch) => {
//     try {
//       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
//       const res = await UserCreationService.getRegisterRequest(data);
//       if (res.status === 200) {
//         dispatch({
//           type: GET_REGISTERED_USER,
//           payload: res.data,
//         });
//       }
//       FailLoad(setModalTypeHandler, setLoaderStatusHandler);

//       return Promise.resolve("API_FINISHED_SUCCESS");
//     } catch (err) {
//       ErrorAlert(dispatch, err);
//       return Promise.reject("API_FINISHED_ERROR");
//     }
//   }; 

export const set_registerRequestAction = (data) => {
    return {
      type:GET_REGISTERED_USER,
      payload: data
    }
  };

  export const updateUserGrAction = (id,data) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.updateUserGr(id,data);
      if (res.status === 200) {
        dispatch({
          type: SET_GET_REGISTERED_USER,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 



  export const updateDeviceIdStatusAction =
  (id, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.updateDeviceId(id);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_DEVICE_ID,
          payload: res.data,
        });
        if (response) {
          console.log('response', response)
          response(res.status);
        }
        UpdateAlert(dispatch);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };



export const UpdateCompanyTimeLineAction = (data, response) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.updatTimelineDetails(data);
      if (res.status === 200) {
        // dispatch({
        //   type: UPDATE_TIMELINE_CONTENT,
        //   payload: res.data,
        // });

        if (response) {
          response(res.data)
        }

      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };       


  export const updateSubscriptionRecords = (data) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.updateSubscription(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SUBSCRIPTION_RECORDS,
          payload: res.data,
        });

      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const InsertSubscription = (data) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.insertSub(data);
      if (res.status === 200) {
        dispatch({
          type: GET_REGISTERED_USER,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const departmentListAction = (cb) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.department();
      if (res.status === 200) {
        dispatch({
          type: DEPARTMENT_LIST,
          payload: res.data,
        });
        if(cb) {
          cb(res)
        }
 
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const updateRelievingDateAction = (data, response) =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.updateRelievingDate(data);
      if (res.status === 200) {
        dispatch({
          type: RE,
          payload: res.data,
        });
        if (response) {
          response(res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const EmployeeVerificationDetail = (data) => async (dispatch) => {
    try {
      const res = await UserCreationService.empVerificationDetail(data);
      dispatch({
        type: EMP_VERIFICATION_DETAIL,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const EmpDocumentsDetailAction = (data) => async (dispatch) => {
    try {
      const res = await UserCreationService.empDocumentsDetail(data);
      dispatch({
        type: EMP_DOCUMENTS_DETAILS,
        payload: res.data,
      });
      console.log("nbnbn",res.data);
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const EmpDocumentsEmailAction = (data) => async (dispatch) => {
    try {
      const res = await UserCreationService.empDocumentsDetailEmail(data);
      dispatch({
        type: EMP_DOCUMENTS_EMAIL,
        payload: res.data,
      });
      console.log("nbnbn",res.data);
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const completedIndexValue = (id) => async (dispatch) => {
    try {
      const res = await UserCreationService.Completedindex(id);
      dispatch({
        type: COMPLETED_EMPLOYEE_VALUE,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const uploadFile = (data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.UploadFile(data);
      console.log('resssssssssss', data)
      // dispatch({
      //   type: EMP_VERIFICATION_DETAIL,
      //   payload: res.data,
      // });
      if(response){
        response(res.status)
      }
      if(res.data.insertId === 0){
        UpdateAlert(dispatch);
      }else{
        CreateAlert(dispatch);
      }

      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ListVerificationDetail = (id) => async (dispatch) => {
    try {
      const res = await UserCreationService.Listverification(id);
      dispatch({
        type: LIST_VERIFICATION,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const employeeDetailAction = (id, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.employeeDetail(id);
      dispatch({
        type: EMPLOYEE_DETAILS,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const verificationTypeAction = (data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.verificationType(data);
      dispatch({
        type: VERIFICATION_TYPE,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const createEmpVerificationAction = (data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.empVerificationCreate(data);
      if (res.status === 200) {
        dispatch({
          type: EMP_VERIFICATION_DETAIL,
          payload: res.data,
        });
  
        if (response) {
          response(res)
        }
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const updateEmpVerificationAction = (data, id, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.empVerificationUpdate(data, id);
      dispatch({
        type: EMP_VERIFICATION_DETAIL,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const createNewTypeAction = (data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.createNewType(data);
      if (res.status === 200) {
        CreateAlert(dispatch)
        dispatch({
          type: VERIFICATION_TYPE,
          payload: res.data,
        });
  
        if (response) {
          response(res.data)
        }
      }      
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const enableDisableEmpLoginAction = (data, response) => async (dispatch) => {
    try {
      const res = await UserCreationService.enableDisableEmpLogin(data);
      // console.log("res.message",res)
      if(res.data.message === 'Enabled Successfully'){
        enableEmpAlert(dispatch,res.data.message);
        dispatch({
          type: ENABLE_DISABLE_EMP_LOGIN,
          payload: res.data,
        });
  
        if (response) {
          response(res.data)
        }
      }

      else{
        enableEmpAlert(dispatch,res.data.message);
        dispatch({
          type: ENABLE_DISABLE_EMP_LOGIN,
          payload: res.data,
        });
  
        if (response) {
          response(res.data)
        }
      }
           
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };



  export const loadRegisteredAction = (payload) => {
 return {
  type : LOAD_REGISTERED_USER,
  payload
 }
  }
  
export const getRegisterRequestState = (data) => {
  console.log('RERERER',data)
  return {
    type: SET_GET_REGISTERED_USER,
    payload: data
  }
};


export const getRegisterRequestAction = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_REGISTERED_USER,
    body,
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};


export const setCompanyDetailsState = (data) => {
  return {
    type: SET_COMPANY_DETAIL,
    payload: data
  }
};


export const getCompanyDetailsAction = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_COMPANY_DETAIL,
    body,
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};



export const bankTransactionTypeAction = () =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.bankTransactionType();
      if (res.status === 200) {
        dispatch({
          type: BANK_TRANSACTION_TYPE,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  }; 

  export const listEventAction = (id) =>
    async (dispatch) => {
      try {
        const res = await UserCreationService.listEvent(id);
        if (res.status === 200) {
          dispatch({
            type: LIST_EVENTS,
            payload: res.data,
          });
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const addNewEventAction = (data) =>
      async (dispatch) => {
        try {
          const res = await UserCreationService.addNewEvent(data);
          if (res.status === 200) {
            CreateAlert(dispatch)
            dispatch({
              type: CREATE_EVENT,
              payload: res.data,
            });
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      };

      export const updateEventAction = (data, id, response) => async (dispatch) => {
        try {
          const res = await UserCreationService.eventEdit(data, id);
          dispatch({
            type: LIST_EVENTS,
            payload: res.data,
          });
    
          if (response) {
            response(res.data)
          }
          return Promise.resolve(res.data);
        } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
    };

    export const deleteEventAction = (id) => async (dispatch) => {
    try {
      const res = await UserCreationService.deleteEvent(id);
      DeleteAlert(dispatch);
      dispatch({
        type: DELETE_EVENT,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const designationAction = (data,response) => async (dispatch) => {
    try {
      const res = await UserCreationService.designation(data);
      if (res.status === 200) {
      dispatch({
        type: DESIGNATION,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
    }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};

  export const benefitsAction = (data,response) => async (dispatch) => {
    try {
      const res = await UserCreationService.benefits(data);
      if (res.status === 200) {
      dispatch({
        type: BENEFITS,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
    }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};

  export const planTypeAction = (data,response) => async (dispatch) => {
    try {
      const res = await UserCreationService.planType(data);
      if (res.status === 200) {
      dispatch({
        type: PLAN_TYPE,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
    }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};

  export const trainingTypeAction = (data,response) => async (dispatch) => {
    try {
      const res = await UserCreationService.trainingType(data);
      if (res.status === 200) {
      dispatch({
        type: TRAINING_TYPE,
        payload: res.data,
      });

      if (response) {
        response(res.data)
      }
    }
      return Promise.resolve(res.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
};

export const deleteDesignationAction = (id, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.deleteDesignation(id);
    if (res.status === 200) {
      if(res.data.message === 'THE DESIGNATION CANNOT BE DELETED AS IT HAS BEEN IN USE'){
        CannotDeleteAlert(dispatch,res.data)
    }
    else{
      dispatch({
        type: DESIGNATION, 
        payload: res.data, 
      }); 
    }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const deletePlanTypeAction = (id, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.deletePlanType(id);
    if (res.status === 200) {
      if(res.data.message === 'THE DESIGNATION CANNOT BE DELETED AS IT HAS BEEN IN USE'){
        CannotDeleteAlert(dispatch,res.data)
    }
    else{
      dispatch({
        type: PLAN_TYPE, 
        payload: res.data, 
      }); 
    }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const deleteBenefitsAction = (id, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.deleteBenefits(id);
    if (res.status === 200) {
      if(res.data.message === 'THE DESIGNATION CANNOT BE DELETED AS IT HAS BEEN IN USE'){
        CannotDeleteAlert(dispatch,res.data)
    }
    else{
      dispatch({
        type: BENEFITS, 
        payload: res.data, 
      }); 
    }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const deleteTrainingTypeAction = (id, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.deleteTrainingType(id);
    if (res.status === 200) {
      if(res.data.message === 'THE DESIGNATION CANNOT BE DELETED AS IT HAS BEEN IN USE'){
        CannotDeleteAlert(dispatch,res.data)
    }
    else{
      dispatch({
        type: TRAINING_TYPE, 
        payload: res.data, 
      }); 
    }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const deleteDesignationLovAction = (id, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.deleteDesignationLov(id);
    if (res.status === 200) {
      if(res.data.message === 'THE DESIGNATION CANNOT BE DELETED AS IT HAS BEEN IN USE'){
        CannotDeleteAlert(dispatch,res.data)
    }
    else{
      dispatch({
        type: DESIGNATION, 
        payload: res.data, 
      }); 
    }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const addDesignationAction = (data, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.addDesignation(data);
    if (res.status === 200) {
      dispatch({
        type: ADD_DESIGNATION, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const addBenefitsAction = (data, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.addBenefits(data);
    if (res.status === 200) {
      dispatch({
        type: ADD_BENEFITS, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const addPlanTypeAction = (data, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.addPlanType(data);
    if (res.status === 200) {
      dispatch({
        type: ADD_PLAN_TYPE, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const addTrainingTypeAction = (data, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.addTrainingType(data);
    if (res.status === 200) {
      dispatch({
        type: ADD_TRAINING_TYPE, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const getThemesAction = (employee_id) => async (dispatch) => {
  try {
    const res = await UserCreationService.getThemes(employee_id);
    if (res.status === 200) {
      dispatch({
        type: GET_THEMES, 
        payload: res.data, 
      }); 
      let designType = res.data?.length ? res.data[0] : {}
      localStorage.setItem('design',JSON.stringify(designType))
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const updateThemesAction = (employee_id,data) => async (dispatch) => {
  try {
    const res = await UserCreationService.updateThemes(employee_id,data);
    if (res.status === 200) {
      dispatch({
        type: UPDATE_THEMES, 
        payload: res.data, 
      }); 
    } 
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    ErrorAlert(dispatch, err); 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 

export const setSearchDesignation = (data) => {
  return {
    type: SET_SEARCH_DESIGNATION,
    payload: data
  }
};

export const setSearchBenefits = (data) => {
  return {
    type: SET_SEARCH_BENEFITS,
    payload: data
  }
};

export const setSearchPlanType = (data) => {
  return {
    type: SET_SEARCH_PLAN_TYPE,
    payload: data
  }
};

export const setSearchTrainingType = (data) => {
  return {
    type: SET_SEARCH_TRAINING_TYPE,
    payload: data
  }
};

export const getSearchDesignation = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_DESIGNATION,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const getSearchBenefits = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_BENEFITS,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const getSearchPlanType = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_DESIGNATION,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const getSearchTrainingType = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_TRAINING_TYPE,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const getSessionDetails = (data, sample) => {
  return (dispatch) => {
    console.log(data, 'dispatching');
    dispatch({
      type: SESSION_DETAIL,
      payload: data[0],
    });
    CreateAlert(dispatch)
  };
};

export const updateDesignationAction = (data, response) => async (dispatch) => {
  try {
    const res = await UserCreationService.updateDesignation(data);
    dispatch({
      type: UPDATE_DESIGNATION,
      payload: res.data,
    });

    if (response) {
      response(res.data)
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const bulkcreateClientUserCreationAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    // createAction(UserCreationService, CREATE_USER_CREATION, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await UserCreationService.bulkcreateClient(data);
      if (res.data.validationError === 'USER_LIMIT_REACHED') {
        commonAlert(dispatch, res.data.data);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'There is no prefix for the username' || res.data.validationError === 'Invalid prefix for the username') {
        invalidPrefixAlert(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Duplicate Employee ID found') {
        employeeCodeAlert(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.data.validationError === 'Employee ID already exists') {
        employeeCodeExists(dispatch);
        if (response) {
          response(res.status, res);
        }
      }
      if (res.status === 200 && res.data.status !== 'exists' && !res.data.validationError) {
        CreateAlert(dispatch);
        dispatch({
          type: CREATE_USER_CREATION,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        // successmsg(sample);
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        dispatch({
          type: STATUS_CREATE_USER_CREATION,
          payload: res.data.existData,
        });

        if (response) {
          response(res.status, res);
        }
        
        // dispatch({
        //   type: Emp_CREATE_USER_CREATION,
        //   payload: res.data.existData,
        // });
        ErrorAlert(dispatch, {message: 'Already Exists'});
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // errormsg(sample);
      return Promise.reject(err);
    }
  };

export const getWhatsappLogsAction = () =>
  async (dispatch) => {
    try {
      const res = await UserCreationService.getWhatsappLogs();
      if (res.status === 200) {
        dispatch({
          type: GET_WHATSAPP_LOGS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

// Backward-compatible aliases used in older imports
export const eventNameAction = listEventAction;
