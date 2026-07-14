import {
    GET_ALL_LEAVE_REQUEST,
    CREATE_LEAVE_REQUEST,
    CANCEL_LEAVE_REQUEST,
    APPROVE_LEAVE_REQUEST,
    GET_CONFLICT_LEAVE_REQUEST,
    UPDATE_CONFLICT_LEAVE_REQUEST,
    UPDATE_SEEN,
    GET_EMPLOYEE_LEAVE_HISTORY,
    GET_EMPLOYEE_LEAVE_REQUEST,
    GET_PRE_LEAVE_REQUEST,
    LEAVE_TYPE,
    GET_PRE_CORRECTION_REQUEST,
    GET_CHECK_STATUS,
    GET_LOG_DETAIL,
    GET_DATE_OF_JOINING,
    GET_PAID_LEAVE_COUNT,
    DELETE_REQUEST,
    GET_LEAVE_APPROVAL_CARD,
    GET_PERMISSION_DATA,
    CREATE_LEAVE_REQUEST_FOR_MANUAL,
    PERMISSION_REQUEST_FOR_MANUAL,
    POS_REQUEST_DATA,
    GET_EMPLOYEE_SHIFT_DETAILS,
    GET_UNSEEN_COUNT,
    GET_EMPLOYEE_ATTENDANCE_DETAILS,
    RESTRICTED_HOLIDAYS_DATA,
    NEW_LEAVE_TYPE
  } from '../actionTypes';
  import LeaveRequestService from '../../services/leaveRequest_services';
  import {
    ErrorAlert,
    FailLoad,
    ListLoad,
    successmsg,
    errormsg,
    CreateAlert,
    DeleteAlert,
    ExistAlert,
    UpdateAlert,
    CannotDeleteAlert,
    ApproveAlert,
    RejectAlert,
    leaveRequestAlert,
    CancelAlert,
    approverVerifierError,
    LeaveAndPermissionAlert,
    LeaveTypeAlert,
  } from './load';
  

  export const listAllLeaveRequestAction =
    (data,employee_id,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getAll(data,employee_id);
        if (res.status === 200) {
          console.log('getallllll', res.data)
          dispatch({
            type: GET_ALL_LEAVE_REQUEST,
            payload: res.data,
          });
        }        
        if (response) {
          response({data: res?.data,res:res.status,seen: res?.data?.length > 0 ? res?.data[0].seen : []});
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const posRequestdata =
    (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getposrequestdata(data);
        if (res.status === 200) {
          console.log('getallllll', res.data, res.status)
          dispatch({
            type: POS_REQUEST_DATA,
            payload: res.data,
          });
        }        
        if (response) {
          console.log('responseeee')
          response({res:res.status,seen: res?.data?.length > 0 ? res?.data[0].seen : []});
        }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const getLeaveApprovalAction =
    () => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getLeaveApproval();
        if (res.status === 200) {
          dispatch({
            type: GET_LEAVE_APPROVAL_CARD,
            payload: res.data,
          });
        }        
      
    
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
       
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
    export const listEmployeeLeaveRequestAction =
    (person_id, data) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getEmployeeLeaveReq(person_id, data);
        if (res.status === 200) {
          dispatch({
            type: GET_EMPLOYEE_LEAVE_REQUEST,
            payload: res.data,
          });
        }        
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    // export const getEmployeeIdAction =
    // (person_id,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    //   try {
    //     // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    //     const res = await LeaveRequestService.getEmployeeId(person_id);
    //     if (res.status === 200) {
    //       dispatch({
    //         type: GET_EMPLOYEE_ID,
    //         payload: res.data,
    //       });
    //     }        
    //     if (response) {
    //       response(res.status);
    //     }
    //     // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    //     return Promise.resolve("API_FINISHED_SUCCESS");
    //   } catch (err) {
    //     // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    //     ErrorAlert(dispatch, err);
    //     return Promise.reject("API_FINISHED_ERROR");
    //   }
    // };

    export const listEmployeeLeaveHistoryAction =
    (person_id,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getEmpLeaveHistory(person_id);
        if (res.status === 200) {
          dispatch({
            type: GET_EMPLOYEE_LEAVE_HISTORY,
            payload: res.data,
          });
        }        
        if (response) {
          response(res.status);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
    
  export const updateSeenAction =
  (leaveId ,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await LeaveRequestService.updateSeen(leaveId)
      if (res.status === 200) {
        dispatch({
          type: UPDATE_SEEN,
          payload: res.data,
        });
      }        
      if (response) {
        response(res.status);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      console.log(err,'err');
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const PosrequpdateSeenAction =
  (id ,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await LeaveRequestService.commonrequpdateseen(id)
      if (res.status === 200) {
        dispatch({
          type: UPDATE_SEEN,
          payload: res.data,
        });
      }        
      if (response) {
        response(res.status);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      console.log(err,'err');
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getUnseenCountAction =
  (data,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await LeaveRequestService.getUnseenCount(data)
      if (res.status === 200) {
        dispatch({
          type: GET_UNSEEN_COUNT,
          payload: res.data,
        });
      }        
      if (response) {
        response(res.status);
      }
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

     
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEmployeeShiftDetailsAction =
  (data,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await LeaveRequestService.getEmployeeShiftDetails(data)
      if (res.status === 200) {
        dispatch({
          type: GET_EMPLOYEE_SHIFT_DETAILS,
          payload: res.data,
        });
      }        
      if (response) {
        response(res);
      }
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

     
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEmployeeAttendanceDetailsAction =
  (data,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await LeaveRequestService.getEmployeeAttendanceDetails(data)
      if (res.status === 200) {
        dispatch({
          type: GET_EMPLOYEE_ATTENDANCE_DETAILS,
          payload: res.data,
        });
      }        
      if (response) {
        response(res);
      }
      
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

     
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  
    export const createLeaveRequestAction =
    (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.create(data);
        if(res.data.message && res.data.message === 'No shift / schedule assigned'){
          CannotDeleteAlert(dispatch, res.data);
        }else{
          console.log('response_code', res)
          if(res.data.response_code === 500){
            console.log('erroealll', res.data.status)
            let errmsg = res.data.status
            leaveRequestAlert(dispatch, errmsg);
          }
         else if (res.status === 200) {
            dispatch({
              type: CREATE_LEAVE_REQUEST,
              payload: res.data,
            });
            CreateAlert(dispatch);
            if (response) {
              response({
                status: res.status,
                data: res.data
              });
            }
          }
  
         
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };
  
    export const cancelLeaveRequestAction =
    (employee_id, leaveId, cancelledBy, response) => async (dispatch) => {
      console.log( cancelledBy.reason_for_rejection,"reschecj");
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.cancel(employee_id, leaveId, cancelledBy);
          if (res.status === 200) {
          if(cancelledBy.reason_for_rejection === "canceled by the initiator") {
            CancelAlert(dispatch)
          } else {
          RejectAlert(dispatch)
          }
          dispatch({
            type: CANCEL_LEAVE_REQUEST,
            payload: res.data,
          })
          if (response) {
            response(res.status);
          }
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const cancelPosRequestAction =
    (employee_id, id, cancelledBy, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.poscancel(employee_id, id, cancelledBy);
          if (res.status === 200) {
          if(cancelledBy.reason_for_rejection === "canceled by the initiator") {
            CancelAlert(dispatch)
          } else {
          RejectAlert(dispatch)
          }
          dispatch({
            type: CANCEL_LEAVE_REQUEST,
            payload: res.data,
          })
          if (response) {
            response(res.status);
          }
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

   export const ApproveLeaveRequestAction =
    (employee_id,leaveId,approvedBy,setModalTypeHandler, setLoaderStatusHandler, resData, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.Approve(employee_id,leaveId,approvedBy);
          if (res.status === 200) {

          if(res.data.response_code === 500){
            console.log('erroealll', res.data.status)
            let errmsg = res.data.status
            leaveRequestAlert(dispatch, errmsg);
          }
          
          else{
            ApproveAlert(dispatch)
            console.log('approveleave', res.data)
            dispatch({
              type: APPROVE_LEAVE_REQUEST,
              payload: res.data,
            });
            if (resData) {
              resData(res.status);
            }
          }
          if (response) {
            response({res: res.status})
          }
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
      }
    }; 

    export const ApprovePosRequestAction =
    (employee_id,id,approvedBy,setModalTypeHandler, setLoaderStatusHandler, resData) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.posApprove(employee_id,id,approvedBy);
          if (res.status === 200) {

        
            ApproveAlert(dispatch)
            dispatch({
              type: APPROVE_LEAVE_REQUEST,
              payload: res.data,
            });
            if (resData) {
              resData(res.status);
            }
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
      }
    }; 

    export const getConflictLeaveRequestAction =
    (employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.getConflictLeaveRequest(employee_id, data);
        if (res.status === 200) {
          dispatch({
            type: GET_CONFLICT_LEAVE_REQUEST,
            payload: res.data,
          });
        }
        if (response) {
          response(res.data);
        }
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } catch (err) {
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
      }
    } 
  
    export const updateConflictLeaveRequestAction =
    (employee_id,leaveId,data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.updateConflictLeaveRequest(employee_id,leaveId,data);
        if (res.status === 200) {
          dispatch({
            type: UPDATE_CONFLICT_LEAVE_REQUEST,
            payload: res.data,
          });
          if (response) {
            response(res.status);
          }
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const listpreLeaveRequestAction =
    (employee_id,data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.previousleave(employee_id,data);
        if (res.status === 200) {
          dispatch({
            type: GET_PRE_LEAVE_REQUEST,
            payload: res.data.data,
          });
        }        
        if (response) {
          response(res);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const listpreCorrectionRequestAction =
    (data, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.previousCorrection(data);
        console.log(res,'response');
        if (res.status === 200) {
          dispatch({
            type: GET_PRE_CORRECTION_REQUEST,
            payload: res.data,
          });
          // CreateAlert(dispatch)
        }        
        if (response) {
          response(res);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const listprePermissionRequestAction =
    (employee_id,data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await LeaveRequestService.previousPermission(employee_id,data);
        console.log('lisprepermission', res)
       
         if (res.status === 200) {
          dispatch({
            type: GET_PRE_LEAVE_REQUEST,
            payload: res.data.data,
          });
        }        
        if (response) {
          response(res);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const getLeaveTypeAction = () => async (dispatch) => {
      try {
          const res = await LeaveRequestService.leaveType();
          if (res.status === 200) {
              dispatch({
                  type: LEAVE_TYPE,
                  payload: res.data,
              });

              if (res.data.length === 0){
                LeaveTypeAlert(dispatch)
              }
          }
          return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
      }
  };


  export const leaveTypeForManualAttAction = (data) => async (dispatch) => {
    try {
        const res = await LeaveRequestService.leaveTypeForManualAtt(data);
        if (res.status === 200) {
            dispatch({
                type: LEAVE_TYPE,
                payload: res.data,
            });

            if (res.data.length === 0){
              LeaveTypeAlert(dispatch)
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const checkStatusAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await LeaveRequestService.checkstatus(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CHECK_STATUS,
          payload: res.data,
        });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const checkExistLogDetail = (data, response) => async (dispatch) => {
    try {
        const res = await LeaveRequestService.logDetail(data);
        if (res.status === 200) {
            dispatch({
                type: GET_LOG_DETAIL,
                payload: res.data,
            });
        }
        if (response) {
          response(res);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
    }
};

export const checkDateOfJoinAction = (response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.checkDateOfJoin();
      if (res.status === 200) {
          dispatch({
              type: GET_DATE_OF_JOINING,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getPaidLeavecount = (month,year,data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.getPaidleave(month, year,data);
      if (res.status === 200) {
          dispatch({
              type: GET_PAID_LEAVE_COUNT,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getPaidleaveForManualAtt = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.getPaidleaveForManualAtt(data);
      if (res.status === 200) {
          dispatch({
              type: GET_PAID_LEAVE_COUNT,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleterequestAction = (data,response, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await LeaveRequestService.deleterequest(data);
      if (res.status === 200) {
          dispatch({
              type: DELETE_REQUEST,
              payload: res.data,
          });
          DeleteAlert(dispatch)
      }
      if (response) {
        response(res);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};


export const createLeaveRequestForManualAttAction = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.createLeaveRequestForManualAtt(data);
      if (res.status === 200) {
          dispatch({
              type: CREATE_LEAVE_REQUEST_FOR_MANUAL,
              payload: res.data,
          });
          if(res.data.response_code === 500){
            console.log('erroealll', res.data.status)
            let errmsg = res.data.status
            leaveRequestAlert(dispatch, errmsg);
          }
          else{
            LeaveAndPermissionAlert(dispatch)
          }
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};

export const permissionRequestForManualAttAttAction = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.permissionRequestForManualAtt(data);
      if (res.status === 200) {
          dispatch({
              type: PERMISSION_REQUEST_FOR_MANUAL,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};
  
export const getpermissiondataAction = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.getpermissiondata(data);
      if (res.status === 200) {
          dispatch({
              type: GET_PERMISSION_DATA,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getpermissiondataForManualAttAction = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.getpermissiondataForManualAtt(data);
      if (res.status === 200) {
          dispatch({
              type: GET_PERMISSION_DATA,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
}; 

export const getRestrictedHolidaysDataAction = (data,response) => async (dispatch) => {
  try {
      const res = await LeaveRequestService.getRestrictedHolidaysData(data);
      if (res.status === 200) {
          dispatch({
              type: RESTRICTED_HOLIDAYS_DATA,
              payload: res.data,
          });
      }
      if (response) {
        response(res);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
  }
};
 export const getNewLeaveTypeAction = (data, response) => async (dispatch) => {
  try {
    const res = await LeaveRequestService.newLeaveType(data);
    console.log("status:", res?.status, "data:", res?.data);
    if (res.status === 200) {
      const normalizedLeaveTypes = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
        console.log("list:", normalizedLeaveTypes);
      dispatch({
        type: NEW_LEAVE_TYPE,
        payload: normalizedLeaveTypes,
      });
    }
    if (response) response(res);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
export const createLeaveListAction = (data, response) => async (dispatch) => {
  try {
    const res = await LeaveRequestService.createLeaveList(data);

    if (res.status === 200) {
      // if backend create succeeded, refresh master leave type list
      if (res?.data?.success !== false) {
        dispatch(getNewLeaveTypeAction({}));
      }
    }

    if (response) response(res);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

