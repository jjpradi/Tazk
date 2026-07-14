import {GET_COMPANY_NAME, CREATE_SHIFT,GET_SHIFT_LIST,GET_SHIFT_HISTORY, GET_LEAVE_HISTORY, GET_REQUEST_HISTORY, GET_SEARCH_HISTORYREPORT, SET_SEARCH_HISTORYREPORT, GET_SEARCH_LEAVEREPORT, SET_SEARCH_LEAVEREPORT, GET_SEARCH_SHIFTLIST, SET_SEARCH_SHIFTLIST,SET_SEARCH_REQUEST_REPORT,GET_SEARCH_REQUEST_REPORT, USER_WISE_SELECT, CREATE_SCHEDULE_SHIFT, GET_SCHEDULE_DETAILS, UPDATE_SCHEDULE_SHIFT, GET_SHIFT_DETAILS_BY_EMPLOYEE_ID, SET_MONTH_SHIFT_SCHEDULE,CREATE_POLICY, GET_POLICY, FILTER_LEAVE_HISTORY, LIST_DEPARTMENT, SHIFT_SCHEDULE_FILTER, SHIFT_LIST, LIST_DESIGNATION, SET_DAY_SHIFT, ATTENDANCE_POLICY, LEAVE_POLICY, EMPLOYEE_CATEGORY, GET_MONTH_SHIFT_SCHEDULE, GET_DAY_SHIFT,ADD_DEPARTMENT,DELETE_DEPARTMENT_ID,ADD_CATEGORY,DELETE_CATEGORY,SET_SEARCH_DEPARTMENT_LIST,GET_SEARCH_DEPARTMENT_LIST, SET_SEARCH_CATEGORY_LIST, GET_SEARCH_CATEGORY_LIST, ASSIGNED_DEPARTMENTS, LOV_UPDATE, INITIAL_LOV_UPDATE, BREAK_START_FOR_MANUAL, BREAK_END_FOR_MANUAL, UPDATE_DEPARTMENT_LOV, GET_CURRENT_SHIFT, GET_LOG_DETAILS} from '../actionTypes';
import ShiftService from '../../services/shifts.services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  successmsg,
  errormsg,
  DeleteAlert,
  CannotDeleteAlert,
  BreakStartAlert,
  BreakEndAlert,
} from './load';
import { OpenalertActions } from './alert_actions';

export const listCompanyNameAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getCompanyName();
      if (res.status === 200) {
        dispatch({
          type: GET_COMPANY_NAME,
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

  export const listSelectUserAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    
      const res = await ShiftService.selectuser(data);
      if (res.status === 200) {
        dispatch({
          type: USER_WISE_SELECT,
          payload: res.data,
        });
        response(res.data)
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const createShiftsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.createShift(data);
      if (res.status === 200) {

        dispatch({
          type: SET_SEARCH_SHIFTLIST,
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

  export const updateShiftDetails =
  (data,shift_id, setModalTypeHandler, setLoaderStatusHandler,type) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.updateShist(data,shift_id);
      if (res.status === 200) {
        if(type !== 'detailpage') {
          // UpdateAlert(dispatch)
        }
        dispatch({
          type: SET_SEARCH_SHIFTLIST,
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

  export const createShiftscheduleAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.createschedule(data);
      if (res.status === 200) {
        if (res?.data?.message) {
          dispatch(OpenalertActions({ msg: res.data.message, severity: 'warning' }));
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          return Promise.reject("API_FINISHED_ERROR");
        }

        dispatch({
          type: GET_SCHEDULE_DETAILS,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
        CreateAlert(dispatch);
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      const backendMessage = err?.response?.data?.message;
      if (backendMessage) {
        ErrorAlert(dispatch, { message: backendMessage });
      } else {
        ErrorAlert(dispatch, err);
      }
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const updateShiftscheduleAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.updateschedule(id, data);
   
      if (res.status === 200) {
        if (res?.data?.message) {
          dispatch(OpenalertActions({ msg: res.data.message, severity: 'warning' }));
          FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          return Promise.reject("API_FINISHED_ERROR");
        }
        dispatch({
          type: UPDATE_SCHEDULE_SHIFT,
          payload: res.data,
        });
        UpdateAlert(dispatch)
        if(response){
          response(res.status)
        }
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const deleteShiftScheduleAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.deleteSchedule(data);
   
      if (res.status === 200) {
        dispatch({
          type: GET_SCHEDULE_DETAILS,
          payload: res.data,
        });
        DeleteAlert(dispatch)
        if(response){
          response(res)
        }
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listScheduleAction =
  (id,data ,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getscheduledetails(id, data);
      if (res.status === 200) {
        dispatch({
          type: GET_SCHEDULE_DETAILS,
          payload: res.data,
        });
        if(response){
          response(res.status)
        }
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  

  export const deleteShiftAction = (id,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.deleteShift(id);
      if (res.status === 200) {
        if(res.data.message && res.data.message === 'Cannot Delete. Employees Assigned to the Shift'){
          CannotDeleteAlert(dispatch, res.data);
        }
        else{
          dispatch({
            type: SET_SEARCH_SHIFTLIST,
            payload: res.data,
          });
  
          DeleteAlert(dispatch);
          if(response){
            response(res)
          }
        }
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

  export const getShiftDetailsByEmployeeIdAction =
  (employee_id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getShiftDetailsByEmployeeId(employee_id);
      if (res.status === 200) {
        dispatch({
          type: GET_SHIFT_DETAILS_BY_EMPLOYEE_ID,
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
  
  export const getShiftListAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getShiftList();
      if (res.status === 200) {
        dispatch({
          type: GET_SHIFT_LIST,
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


  export const getShiftHistoryAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getShiftHistory();
      if (res.status === 200) {
        dispatch({
          type: GET_SHIFT_HISTORY,
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

  export const getCurrentShiftAction = (employee_id) => async (dispatch) => {
    try {
      const res = await ShiftService.getCurrentShift(employee_id);
      if (res.status === 200) {
        dispatch({
          type: GET_CURRENT_SHIFT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getLogDetailsAction = (data) => async (dispatch) => {
    try {
      const res = await ShiftService.getLogDetails(data);
      if (res.status === 200) {
        dispatch({
          type: GET_LOG_DETAILS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getLeaveHistoryAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getLeaveHistory();
      if (res.status === 200) {
        dispatch({
          type: GET_LEAVE_HISTORY,
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


  export const getRequestHistoryAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.getRequestHistory();
      if (res.status === 200) {
        dispatch({
          type: GET_REQUEST_HISTORY,
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

  export const LovInitialUpdateAction =
  (data) => async (dispatch) => {
    try {
      const res = await ShiftService.addInitialLov(data);
      if (res.status === 200) {
        dispatch({
          type: INITIAL_LOV_UPDATE,
          payload: res,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateDepartmentAction =
  (data, callback) => async (dispatch) => {
    try {
      const res = await ShiftService.updateDepartment(data);

      if (res.status === 200) {
        dispatch({
          type: UPDATE_DEPARTMENT_LOV,
          payload: res.data,
        });

        if (callback) callback(res);
        return res;
      }

      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const breakStartForManualAttAction = (payload) => async (dispatch) => {
  try {
    const res = await ShiftService.breakStartForManualAtt(payload);
    if (res.status === 200) {
      dispatch({
        type: BREAK_START_FOR_MANUAL,
        payload: res.data,
      });
      res.data.forEach((entry) => {
        if (entry.info === "Break started successfully.") {
          BreakStartAlert(dispatch);
        }
      });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const breakEndForManualAttAction = (payload) => async (dispatch) => {
  try {
    const res = await ShiftService.breakEndForManualAtt(payload);
    if (res.status === 200) {
      dispatch({
        type: BREAK_END_FOR_MANUAL,
        payload: res.data,
      });
      res.data.forEach((entry) => {
        if (entry.status === "Break ended successfully.") {
          BreakEndAlert(dispatch);
        }
      });
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


  export const get_searchHistoryReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_HISTORYREPORT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchHistoryReportAction = (data) => {
    return {
      type:SET_SEARCH_HISTORYREPORT,
      payload:data
    }
  }; 

  export const get_searchLeaveReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_LEAVEREPORT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_searchLeaveReportAction = (data) => {
    return {
      type:FILTER_LEAVE_HISTORY,
      payload:data
    }
  };

  export const getSearchShiftlistAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SHIFTLIST,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchShiftlistAction = (data) => {
    return {
      type:SET_SEARCH_SHIFTLIST,
      payload:data
    }
  };

  export const SearchrequestReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_REQUEST_REPORT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  //state
  export const setSearchrequestReportAction = (data) => {
    return {
      type:SET_SEARCH_REQUEST_REPORT,
      payload:data
    }
};

export const filterRequestReportAction =
(data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack ) => async (dispatch) => {
  try {
     ListLoad(setModalTypeHandler, setLoaderStatusHandler);
  
    const res = await ShiftService.filterRequestReport(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_REQUEST_REPORT,
        payload: res.data,
      });
      if (exportDataCallBack) {
        console.log('res.data', res.data.data)
        exportDataCallBack(res.data.data);
      }
    }
     FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    if (exportDataCallBack) {
      exportDataCallBack([]);
    }
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    //}
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const shiftListPaginationAction = (data) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ShiftService.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_SHIFTLIST,
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
export const monthShiftScheduleShiftAction = (data) => async (dispatch) => {
  try {
    const res = await ShiftService.getMonthShiftSchedule(data);
    if (res.status === 200) {
      dispatch({
        type: SET_MONTH_SHIFT_SCHEDULE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const setSearchmonthShiftScheduleShift = (data) => {
  return {
    type: SET_MONTH_SHIFT_SCHEDULE,
    payload: data
  }
};


export const getSearchmonthShiftScheduleShift = (body, commoncookie, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_MONTH_SHIFT_SCHEDULE,
    body,
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const dayShiftAction = (data) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ShiftService.getDayShift(data);
    console.log(res,'res');
    if (res.status === 200) {
      dispatch({
        type: SET_DAY_SHIFT,
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

export const setSearchdayShift = (data) => {
  return {
    type: SET_DAY_SHIFT,
    payload: data
  }
};


export const getSearchdayShift = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_DAY_SHIFT,
    body,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const CreatePolicyAction = (data) => async (dispatch) => { 
  try { 
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler); 
    const res = await ShiftService.createPolicy(data); 
    if (res.status === 200) { 
      dispatch({ 
        type: GET_POLICY,
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

export const getPolicyList = () => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ShiftService.getPolicy();
    if (res.status === 200) {
      dispatch({
        type: GET_POLICY, 
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

export const listDepartment = (data, response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ShiftService.listDepartment(data);
    if (res?.status === 200) {
      dispatch({
        type: LIST_DEPARTMENT, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
    } 
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve("API_FINISHED_SUCCESS"); 
  } catch (err) { 
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);  
    ErrorAlert(dispatch, err); 
    console.log(err,'error')
    //} 
    return Promise.reject("API_FINISHED_ERROR");
  } 
}; 


export const assignedDepartments = (response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await ShiftService.assignedDepartments();

    console.log("Sdfsdf",res)
    if (res.status === 200) {
      dispatch({
        type: ASSIGNED_DEPARTMENTS, 
        payload: res.data, 
      }); 

      if(response){
        response(res.data)
      }
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


export const filterLeaveHistoryAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    console.log('filterLeaveHistoryAction')
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    
      const res = await ShiftService.filterLeaveHistory(data);
      if (res.status === 200) {
        if(!data?.exportData) {
          dispatch({
            type: FILTER_LEAVE_HISTORY,
            // payload: res.data[0],
            payload: res.data
          });
        }
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }

       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const shiftScheduleFilterAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
       ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    
      const res = await ShiftService.shiftScheduleFilter(data);
      if (res.status === 200) {
        dispatch({
          type: SHIFT_SCHEDULE_FILTER,
          payload: res.data,
        });
      }
       FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const shiftListAction = () => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.shiftList();
      if (res.status === 200) {
        dispatch({
          type: SHIFT_LIST, 
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

  export const listDesignationAction = (response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.listDesignation();
      if (res.status === 200) {
        dispatch({
          type: LIST_DESIGNATION, 
          payload: res.data, 
        }); 
  
        if(response){
          response(res.data)
        }
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

  export const attendancePolicyAction = (data,response) => async (dispatch) => {
    try {
      const res = await ShiftService.attendancePolicy(data);
      if (res.status === 200) {
        dispatch({
          type: ATTENDANCE_POLICY, 
          payload: res.data, 
        }); 
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const updateAttendancePolicyAction =
  (data,id, type) => async (dispatch) => {
    try {
      const res = await ShiftService.updateAttendancePolicy(data,id);
      if (res.status === 200) {
        if(type !== 'detailpage') {
          UpdateAlert(dispatch)
        }
        dispatch({
          type: ATTENDANCE_POLICY,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const leavePolicyAction = (data,response) => async (dispatch) => {
    try {
      const res = await ShiftService.leavePolicy(data);
      if (res.status === 200) {
        dispatch({
          type: LEAVE_POLICY, 
          payload: res.data, 
        }); 
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const listEmployeeCategoryAction = (data,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await ShiftService.listEmployeeCategory(data);
      if (res.status === 200) {
        dispatch({
          type: EMPLOYEE_CATEGORY, 
          payload: res.data, 
        }); 
  
        if(response){
          response(res.data)
        }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      //} 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const updateLeavePolicyAction =
  (data,id, type) => async (dispatch) => {
    try {
      const res = await ShiftService.updateLeavePolicy(data,id);
      if (res.status === 200) {
        if(type !== 'detailpage'){
          UpdateAlert(dispatch)
        }
        dispatch({
          type: LEAVE_POLICY,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const addDepartmentAction = (data, response) => async (dispatch) => {
    try {
      const res = await ShiftService.addDepartment(data);
      if (res.status === 200) {
        dispatch({
          type: ADD_DEPARTMENT, 
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

  export const deleteDepartmentAction = (id, response) => async (dispatch) => {
    try {
      const res = await ShiftService.deleteDepartment(id);

   
      if (res.status === 200) {
        if(res.data.message === 'THE DEPARTMENT CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{
          dispatch({
            type: LIST_DEPARTMENT, 
            payload: res.data, 
          }); 
        }
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const deleteDepartmentLovAction = (id, response) => async (dispatch) => {
    try {
      const res = await ShiftService.deleteDepartmentLov(id);

   
      if (res.status === 200) {
        if(res.data.message === 'THE DEPARTMENT CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{
          dispatch({
            type: LIST_DEPARTMENT, 
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

  export const setSearchDepartmentList = (data) => {
    return {
      type: SET_SEARCH_DEPARTMENT_LIST,
      payload: data
    }
  };

  export const getSearchDepartmentList = (body, response,setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_DEPARTMENT_LIST,
      body,
      response,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const addCategoryAction = (data, response) => async (dispatch) => {
    try {
      const res = await ShiftService.addCategory(data);
      if (res.status === 200) {
        dispatch({
          type: ADD_CATEGORY, 
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

  export const setSearchCategoryList = (data) => {
    return {
      type: SET_SEARCH_CATEGORY_LIST,
      payload: data
    }
  };

  export const getSearchCategoryList = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_CATEGORY_LIST,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const deleteCategoryAction = (id, response) => async (dispatch) => {
    try {
      const res = await ShiftService.deleteCategory(id);
      if (res.status === 200) {
        if(res.data.message === 'THE EMPLOYEE CATEGORY CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{

          dispatch({
            type: EMPLOYEE_CATEGORY, 
            payload: res.data, 
          }); 
        }
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 

  export const deleteCategoryLovAction = (id, response) => async (dispatch) => {
    try {
      const res = await ShiftService.deleteCategoryLov(id);
      if (res.status === 200) {
        if(res.data.message === 'THE EMPLOYEE CATEGORY CANNOT BE DELETED AS IT HAS BEEN IN USE'){
          CannotDeleteAlert(dispatch,res.data)
        }
        else{

          dispatch({
            type: EMPLOYEE_CATEGORY, 
            payload: res.data, 
          }); 
        }
  
        // if(response){
        //   response(res.data)
        // }
      } 
      return Promise.resolve("API_FINISHED_SUCCESS"); 
    } catch (err) { 
      ErrorAlert(dispatch, err); 
      return Promise.reject("API_FINISHED_ERROR");
    } 
  }; 


  export const lovDataUpdate = (data) => {
    console.log(data,'kllk');
    //const fdata= {...data}
    return {
      type: LOV_UPDATE,
      payload: data
    }
  };
