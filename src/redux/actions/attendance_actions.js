import {LIST_ATTENDANCE,ATTENDANCE_VIEW,GET_EMP_BASECOMPANY,UPDATE_ATTENDANCE,APPROVE_ATTENDANCE,OVER_TIME_REPORT,FILTER_SALARY, SET_ATTENDANCEVIEW, GET_ATTENDANCEVIEW, QR_ATTENDANCE, GET_SEARCH_ATTENDANCECOR_DATA, SET_SEARCH_ATTENDANCECOR, ATTENDANCE_VIEW_EXIST, SELFIE_IMAGES, GET_SEARCH_SELFIE_IMAGES, SET_SEARCH_SELFIE_IMAGES, COMPANY_BASED_EMP_DETAILS, COMPANY_BASED_EMP, GET_WORKDURATION_REPORT, GET_WORKDURATION_TOTAL_REPORT,  GET_OVERTIME_REPORT, GET_SEARCH_OVER_TIME_REPORT, WORK_DURATION_REPORT_DATA, GET_DEPT_BASE_EMP, LOCATION_BASE_DEP, GET_DEPT_BASE_EMP_FILTER, GET_SEARCH_DEPARTMENT_BASED_EMPLOYEE, SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE, GET_SEARCH_LOCATION_BASED_EMPLOYEE, SET_SEARCH_LOCATION_BASED_EMPLOYEE, LOCATION_BASE_DEP_FILTER, GET_EMP_BASECOMPANY_FILTER, GET_SEARCH_COMPANY_BASED_EMPLOYEE, SET_SEARCH_COMPANY_BASED_EMPLOYEE,GET_ATTENDANCE_PROCESS, SET_ATTENDANCE_PROCESS, APPROVE_ATTENDANCE_EXCEL, GET_WORK_DURATION_REPORT_DATA, GET_COMPANY_BASED_SEARCH, GET_COMPANY_BASED_DETAILS_SEARCH, EMPLOYEE_VERIFICATION_DETAILS, GET_SEARCH_CATEGORY_BASED_EMPLOYEE, SET_SEARCH_CATEGORY_BASED_EMPLOYEE, GET_CATEGORY_BASE_EMP_FILTER, GET_CATEGORY_BASE_EMP, WORKDETAILS_LIST, LEAVE_BALANCE, LAST_SIX_MONTH_LEAVE, LATE_LOGIN_EARLY_CHECKOUT_REPORT, GET_SEARCH_LATE_EARLY_REPORT, PF_REPORT, GET_PF_REPORT, GET_SEARCH_PF_REPORT, MANUAL_CHECKIN, MANUAL_CHECKOUT, UPDATE_MANUAL_ATTENDANCE,MANUAL_ENTRY_DATA, SET_SEARCH_LATE_EARLY_REPORT, GET_EMP_BASECOMPANY_FORM, GET_BREAKS_RECORDS, SYNC_CONTACT, CHECK_DEVICE_ATT, GET_DEVICE_ATT, GET_ATTENDANCE_LOG_REPORT, GET_ATTENDANCELOGREPORT, SET_SEARCH_PUNCH_EXCEPTIONS, 
  GET_SEARCH_PUNCH_EXCEPTIONS,
  DELETE_EMP_DOCS,
  ATTPROCESS_BACKGROUND_JOB,
  PRIVILEGELEAVEREPORT,
  GET_SEARCH_PRIVILEGE_LEAVE,
  CHECK_IN_OUT,
  SET_ATTENDANCE_EFFICIENCY_REPORT
} from '../actionTypes';
import Attendanceservice from '../../services/attendance_services';
import {approverVerifierError, CannotEdit, CheckInAlert, CheckOutAlert, ErrorAlert, FailLoad, ListLoad, ManualCorrectionAlert, SalaryProcessAlert, UpdateAlert} from './load';


export const listAttendanceAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,empId) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getAll(data,empId);
      if (res.status === 200) {
        dispatch({
          type: LIST_ATTENDANCE,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getCheckInOutAction =
  (empId) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getCheckInOut(empId);
      if (res.status === 200) {
        dispatch({
          type: CHECK_IN_OUT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listAttendanceDataAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getAllData();
      if (res.status === 200) {
        dispatch({
          type: LIST_ATTENDANCE,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getWorkDurationReportAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getWorkDurationReport(data);
      if (res.status === 200) {
        dispatch({
          type: GET_WORKDURATION_REPORT,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getWorkDurationTotalHoursReportAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getWorkDurationTotalHoursReport(data);
      if (res.status === 200) {
        dispatch({
          type: GET_WORKDURATION_TOTAL_REPORT,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const lateAndEarlyReportAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.lateAndEarlyReport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_LATE_EARLY_REPORT,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

   export const punchexceptionAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.punchexceptionreport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_PUNCH_EXCEPTIONS,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const privilegeleavereportAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.PrivilegeLeaveReport(data);
      if (res.status === 200) {
        dispatch({
          type: PRIVILEGELEAVEREPORT,
          payload: res.data,
        });

        if (response) {
          response(res.status, res.data)
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const pfReportAction =
  (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.pfReport(data);
      if (res.status === 200) {
        dispatch({
          type: PF_REPORT,
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


  export const getSearchOverTimeReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_OVER_TIME_REPORT,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  
  export const setSearchOverTimeReportAction = (data) => {
    return {
      type: GET_OVERTIME_REPORT,
      payload: data
    }
  };

  export const getSearchLateAndEarlyReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_LATE_EARLY_REPORT,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

    export const getSearchpunchReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PUNCH_EXCEPTIONS,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

    export const getSearchprivilegeReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PRIVILEGE_LEAVE,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  export const getSearchPfReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_PF_REPORT,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const setSearchLateAndEarlyReportAction = (data) => {
    return {
      type: SET_SEARCH_LATE_EARLY_REPORT,
      payload: data
    }
  };

   export const setSearchPunchReportAction = (data) => {
    return {
      type: SET_SEARCH_PUNCH_EXCEPTIONS,
      payload: data
    }
  };
  export const setSearchPfReportAction = (data) => {
    return {
      type: PF_REPORT,
      payload: data
    }
  };

    export const setSearchPrivilegeleaveAction = (data) => {
    return {
      type: PRIVILEGELEAVEREPORT,
      payload: data
    }
  };
// export const listBalancesheetdateAction = ( from , to ) => async (dispatch) => {
//   try {
//     // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
//     const res = await Balancesheetservice.getDate(from , to)
//     if (res.status === 200) {
//       dispatch({
//         type: LIST_BALANCESHEET,
//         payload: res.data,
//       });
//       // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
//     }
//   } catch (err) {
//       // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
//       ErrorAlert(dispatch,err)
//   }
// };

export const AttendanceViewAction =
  (data, resExist) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.AttendanceView(data);
      if(res.data.response_code === 500){
        // SalaryProcessAlert(dispatch, res.data.status)
        resExist(res.data.response_code)
        dispatch({
          type: ATTENDANCE_VIEW_EXIST,
          payload: res.data.status,
        });
      }
      else if (res.status === 200) {
        resExist(res.status)
        dispatch({
          type: ATTENDANCE_VIEW,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ManualCorrectionGet =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.Manualdataget(data);
      if (res.status === 200) {
      
        dispatch({
          type: MANUAL_ENTRY_DATA,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ManualCorrection =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.ManualEdit(data);
      if (res.status === 200) {
        if(res.data == 'SalaryProcessConfirmed'){
          SalaryProcessAlert(dispatch, res.data)
        }
        else{
        dispatch({
          type: MANUAL_ENTRY_DATA,
          payload: res.data,
        });
        UpdateAlert(dispatch)
      }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getEmpbasecompanyAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getEmpbasecompany(data);
      if (res.status === 200) {
        dispatch({
          type: GET_EMP_BASECOMPANY,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getEmpbasecompanyFormAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getEmpbasecompanyform(data);
      if (res.status === 200) {
        dispatch({
          type: GET_EMP_BASECOMPANY_FORM,
          payload: res.data,
        });
        if(response){
          response(res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getDeptBaseEmpAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getDeptBaseEmp(data);
      if (res.status === 200) {
        dispatch({
          type: GET_DEPT_BASE_EMP,
          payload: res.data,
        });

        if(response){
          response(res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // if (response) {
        //   response(res.status, res.data);
        // }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getCategoryBaseEmpAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getCategoryBaseEmp(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CATEGORY_BASE_EMP,
          payload: res.data,
        });

        if(response){
          response(res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // if (response) {
        //   response(res.status, res.data);
        // }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const AttendanceProcessAction =
  (data, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getProcess(data);
      console.log(res.data,'data1')
      if (res.status === 200) {
        dispatch({
          type: SET_ATTENDANCE_PROCESS,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // if (exportDataCallBack) {
      //   exportDataCallBack([]);
      // }
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const SearchAttendanceAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    console.log(body,'returnbody');
    return {
      type:GET_ATTENDANCEVIEW,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  export const setSearchAttendanceListAction = (data) => {
    return {
      type:SET_ATTENDANCE_PROCESS,
      payload:data
    }
};


export const searchAttendanceCor_Action =
(data) =>
async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
    const res = await Attendanceservice.searchAttendanceCor(data);
    dispatch({
      type: APPROVE_ATTENDANCE,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    ErrorAlert(dispatch, err);
    //   return Promise.reject(err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
  export const searchAttendanceCorAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
    // console.log('searchchserch')
    return {
      type: GET_SEARCH_ATTENDANCECOR_DATA,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const setsearchAttendanceCorAction = (data) => {
    return {
      type: SET_SEARCH_ATTENDANCECOR,
      payload: data
    }
  };



  export const updateAttendanceAction =
  (id,break_id,data, callback, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
   
      const res = await Attendanceservice.updateCorrection(id,break_id,data);
  
        dispatch({
          type: UPDATE_ATTENDANCE,
          payload: res.data,
        });
        UpdateAlert(dispatch);
        if(callback){
          callback()
        }
        if(response){
           response(res.status)
        }
 
    
      return Promise.resolve("API_FINISHED_SUCCESS");
      
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ApproveAttendance_Action =
  (data) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.approveAttendance(data);
      dispatch({
        type: APPROVE_ATTENDANCE,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const ApproveAttendanceExcel_Action =
  (data,setModalTypeHandler,setLoaderStatusHandler,exportDataCallBack) =>
  async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.approveAttendanceExcel(data);
      if (res.status === 200) {
        dispatch({
          type: APPROVE_ATTENDANCE_EXCEL,
          payload: res.data,
        });
        if (exportDataCallBack) {
    
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

      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const overtimeReportAction = () => async (dispatch) => {
    try {
      const res = await Attendanceservice.overtimeReport();
      if (res.status === 200) {
        dispatch({
          type: OVER_TIME_REPORT,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const employeeVerificationDetailsAction = () => async (dispatch) => {
    try {
      const res = await Attendanceservice.getEmployeeVerificationDetails();
      if (res.status === 200) {
        dispatch({
          type: EMPLOYEE_VERIFICATION_DETAILS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const filterSalaryReportAction =
  (data) =>
  async (dispatch) => {
    try {
      const res = await Attendanceservice.filterSalaryReport(data);
      dispatch({
        type: FILTER_SALARY,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
    };
  
    export const searchAttendanceViewAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
      return {
        type: GET_ATTENDANCEVIEW,
        data: val,
        setModalTypeHandler,
        setLoaderStatusHandler
      }
    };
    
    export const setsearchAttendanceViewAction = (data) => {
      console.log(data,'data')
      return {
        type: SET_ATTENDANCE_PROCESS,
        payload: data
      }
    };

export const qrAttendanceAction =
  (data) =>
    async (dispatch) => {
      try {
        const res = await Attendanceservice.qrAttendance(data);
        dispatch({
          type: QR_ATTENDANCE,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };


    export const viewSelfieAttendanceImagesAction =
    (data) =>
    async (dispatch) => {
      try {
        const res = await Attendanceservice.viewSelfieAttendanceImages(data);
        dispatch({
          type: SELFIE_IMAGES,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };



    export const get_searchSelfieImagesAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
      return {
        type:GET_SEARCH_SELFIE_IMAGES,
        data: body,
        setModalTypeHandler, 
        setLoaderStatusHandler
      }
    };
  
    export const set_searchSelfieImagesAction = (data) => {
      return {
        type:SET_SEARCH_SELFIE_IMAGES,
        payload:data
      }
    };

  export const getCompanyBasedEmpAction = (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getCompanyBasedEmp(data);
      if (res.status === 200) {
        dispatch({
          type: COMPANY_BASED_EMP,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getCompanyBasedEmpDetailsAction = (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getCompanyBasedEmpDetails(data);
      if (res.status === 200) {
        dispatch({
          type: COMPANY_BASED_EMP_DETAILS,
          payload: res.data,
        });

        if(response){
          response(res.status, res.data)
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
};
  
  export const workDurationAction = (data, response) => async (dispatch) => {
    try {
      const res = await Attendanceservice.workDuration(data);
      console.log(res,'action')
      if (res.status === 200) {
        dispatch({
          type: WORK_DURATION_REPORT_DATA,
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

  export const getLocBaseEmpAction = (data,cb) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getLocBaseEmp(data);
      if (res.status === 200) {
        cb(res)
       
    }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getLocBaseEmpFilterAction = (data,cb) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getLocBaseEmpFilter(data);
      if (res.status === 200) {
        cb(res)
       
    }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getDeptBaseEmpFilterAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getDeptBaseEmpFilter(data);
      if (res.status === 200) {
        dispatch({
          type: GET_DEPT_BASE_EMP_FILTER,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // if (response) {
        //   response(res.status, res.data);
        // }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getCategoryBaseEmpFilterAction =
  (data, response) => async (dispatch) => {
    try {

      const res = await Attendanceservice.getCategoryBaseEmpFilter(data);
      if (res.status === 200) {
        dispatch({
          type: GET_CATEGORY_BASE_EMP_FILTER,
          payload: res.data,
        }); 
          if (response) {
          response()
        }
   
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {

      ErrorAlert(dispatch, err);

      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const get_search_department_based_employee = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_DEPARTMENT_BASED_EMPLOYEE,
      data: body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_search_category_based_employee = (data) => {
    return {
      type:SET_SEARCH_CATEGORY_BASED_EMPLOYEE,
      payload:data
    }
  };

  export const get_search_category_based_employee = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_CATEGORY_BASED_EMPLOYEE,
      data: body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_search_department_based_employee = (data) => {
    return {
      type:SET_SEARCH_DEPARTMENT_BASED_EMPLOYEE,
      payload:data
    }
  };

  export const getLocationBaseEmpFilterAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getLocBaseEmpFilter(data);
      if (res.status === 200) {
        dispatch({
          type: LOCATION_BASE_DEP_FILTER,
          payload: res.data,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // if (response) {
        //   response(res.status, res.data);
        // }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_search_location_based_employee = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    console.log("body",body)
    return {
      type:GET_SEARCH_LOCATION_BASED_EMPLOYEE,
      data: body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_search_location_based_employee = (data) => {
    console.log("dat666",data)
    return {
      type:SET_SEARCH_LOCATION_BASED_EMPLOYEE,
      payload:data
    }
  };

  export const getEmpbasecompanyFilterAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getEmpbasecompanyFilter(data);
      if (res.status === 200) {
        dispatch({
          type: GET_EMP_BASECOMPANY_FILTER,
          payload: res.data,
        });

       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // if (response) {
        //   response(res.status, res.data);
        // }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const get_search_company_based_employee = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    // console.log("body",body)
    return {
      type:GET_SEARCH_COMPANY_BASED_EMPLOYEE,
      data: body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const set_search_company_based_employee = (data) => {
    // console.log("dat666",data)
    return {
      type:SET_SEARCH_COMPANY_BASED_EMPLOYEE,
      payload:data
    }
  };


  export const attendanceProcessBackgroundJobAction = (data,callback) => async (dispatch) => {
    try {
      const res = await Attendanceservice.attendanceProcessBackgroundJob(data);
     
      

      if(res.status === 200){

        dispatch({
          type: ATTPROCESS_BACKGROUND_JOB,
          payload: res.data,
        });
      if (callback) {
        callback(res.data);
      }
    }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
       if(err !== 'timeout of 100000ms exceeded'){
      ErrorAlert(dispatch, err);
      }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const setWorkdurationReportAction = (data) => {
    console.log(data,'search')
    return {
      type: WORK_DURATION_REPORT_DATA,
      payload:data
    }
  };

  export const get_workdurationReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
     console.log("body",body)
    return {
      type:GET_WORK_DURATION_REPORT_DATA,
      data: body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

  export const setCompanyBasedEmpAction = (data) => {
    return {
      type: COMPANY_BASED_EMP,
      payload:data
    }
  };
 
  export const get_CompanyBasedEmpAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
     console.log("body",body)
    return {
      type:GET_COMPANY_BASED_SEARCH,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const setCompanyBasedEmpDetailsAction = (data) => {
    return {
      type: COMPANY_BASED_EMP_DETAILS,
      payload:data
    }
  };
 
  export const get_CompanyBasedEmpDetailsAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
     console.log("body",body)
    return {
      type:GET_COMPANY_BASED_DETAILS_SEARCH,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  const inflightWorklog = new Map();

  export const worklogDetailsAction =
  (id) =>
  async (dispatch) => {
    if (!id) return Promise.resolve("NO_ID");

    const key = String(id);
    if (inflightWorklog.has(key)) {
      return inflightWorklog.get(key);
    }

    const promise = Attendanceservice.worklogDetails(id)
      .then((res) => {
        dispatch({
          type: WORKDETAILS_LIST,
          payload: res.data,
        });
        return "API_FINISHED_SUCCESS";
      })
      .catch((err) => {
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      })
      .finally(() => {
        inflightWorklog.delete(key);
      });

    inflightWorklog.set(key, promise);
    return promise;
  };

  export const getPaidLeaveBalanceAction =
  () =>
  async (dispatch) => {
    try {
      const res = await Attendanceservice.getpaidleaveBalance();
     
        dispatch({
          type: LEAVE_BALANCE,
          payload: res.data[0],
        });
    
      return Promise.resolve("API_FINISHED_SUCCESS");
      
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const lastSixMonthLeaveAction =
  (id) =>
  async (dispatch) => {
    try {
      const res = await Attendanceservice.lastSixMonthLeave(id);
     
        dispatch({
          type: LAST_SIX_MONTH_LEAVE,
          payload: res.data,
        });
    
      return Promise.resolve("API_FINISHED_SUCCESS");
      
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const ManualeditAlert =
  (response) => async (dispatch) => {
    try {
    
      CannotEdit(dispatch)
      // if(res.status == 200){
      //   if(response){
      //     response(res.status)
      //   }
      // }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const manualCheckInAction = (payload) => async (dispatch) => {
  try {
    const res = await Attendanceservice.manualCheckIn(payload);
    dispatch({
      type: MANUAL_CHECKIN,
      payload: res.data,
    });
    res.data.forEach((entry) => {
      if (entry.checkin === "Success") {
        CheckInAlert(dispatch);
      }
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const manualCheckOutAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    const res = await Attendanceservice.manualCheckOut(payload);
    dispatch({
      type: MANUAL_CHECKOUT,
      payload: res.data,
    });
    res.data.forEach((entry) => {
      if (entry.response_message === "Clocked out successfully") {
        CheckOutAlert(dispatch);
      }
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateManualAttendanceAction = (payload, setLoaderStatusHandler) => async (dispatch) => {
  try {
    ListLoad(setLoaderStatusHandler);
    const res = await Attendanceservice.updateManualAttendance(payload);
    dispatch({
      type: UPDATE_MANUAL_ATTENDANCE,
      payload: res.data,
    });

    if (
      res?.data?.message?.toLowerCase() === "attendance logs inserted successfully" ||
      res?.data?.message?.toLowerCase() === "attendance logs updated successfully"
    ) {
      ManualCorrectionAlert(dispatch);
    }

    return Promise.resolve(res.data, "API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getBreaksDurationForReportsAction = (payload, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    const res = await Attendanceservice.getBreaksDurationForReports(payload);
    dispatch({
      type: GET_BREAKS_RECORDS,
      payload: res.data,
    });
    
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const syncContactAction = (data)=> async(dispatch)=>{
  try{
    const res = await Attendanceservice.syncContact(data)
    dispatch({
      type : SYNC_CONTACT,
      payload : res.data
    })

    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const checkDeviceAttStatusAction = ()=> async(dispatch)=>{
  try{
    const res = await Attendanceservice.checkDeviceAttStatus()
    dispatch({
      type : CHECK_DEVICE_ATT,
      payload : res.data
    })

    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const getRegisteredUsersAction = (data)=> async(dispatch)=>{
  try{
    const res = await Attendanceservice.getRegisteredUsers(data)
    dispatch({
      type : GET_DEVICE_ATT,
      payload : res.data
    })

    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

export const AttendanceLogReport =
  (data, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Attendanceservice.getAttendanceLogReport(data);
      console.log(res.data,'data1')
      if (res.status === 200) {
        dispatch({
          type: GET_ATTENDANCE_LOG_REPORT,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // if (exportDataCallBack) {
      //   exportDataCallBack([]);
      // }
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const SearchAttendanceLogReportAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type:GET_ATTENDANCELOGREPORT,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };

   export const setSearchAttendanceLogReportAction = (data) => {
    return {
      type:GET_ATTENDANCE_LOG_REPORT,
      payload:data
    }
};

export const deleteEmployeeDocumentsAction = (data)=> async(dispatch)=>{
  try{
    const res = await Attendanceservice.deleteEmployeeDocuments(data)

    if(res.status === 200){
      dispatch({
        type : DELETE_EMP_DOCS,
        payload : res.data
      })
    }

    return Promise.resolve('API_FINISHED_SUCCESS')
  }
  catch(err){
    return Promise.reject('API_FINISHED_ERROR')
  }
}

  export const AttendanceEfficiencyReportAcion =
  (data, exportDataCallBack) => async (dispatch) => {
    try {
      const res = await Attendanceservice.getAttendanceEfficiencyReport(data);
      if (res.status === 200) {
        dispatch({
          type: SET_ATTENDANCE_EFFICIENCY_REPORT,
          payload: res.data,
        });
        if (exportDataCallBack) {
          console.log('res.data', res.data.data)
          exportDataCallBack(res.data.data);
        }
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };