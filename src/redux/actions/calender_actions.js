import calender_services from "services/calender_services"
import { ErrorAlert } from "./load"
import { CALENDER_EVENTS, CALENDER_HOLIDAYS, 
         CREATE_REMINDER, 
         GET_COMPANY_LOAN_DUE, 
         GET_LIST_PAYROLLCALENDER, 
         GET_LIST_TASKCALENDER, 
         GET_LOAN_DUE, 
         GET_PLAN_SUB_FOR_CLIENT, 
         GET_REMINDERS, 
         GET_REPORT_SCHEDULE, 
         LEADS_TASKS, 
         PAYABLES_EVENT, 
         RECEIVABLES_EVENT, 
         SET_LIST_PAYROLLCALENDER,
         SET_LIST_TASKCALENDER, 
} from "redux/actionTypes"
import { DELETE_SCHEDULE_REPORT } from "../actionTypes"

export const ListPayrollCalender = (data, response) => async (dispatch) => {
    try {
        const res = await calender_services.getPayrollCalender(data)
        
        if(res.status === 200) {
            dispatch({
                type : SET_LIST_PAYROLLCALENDER,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchPayrollCalenderAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_PAYROLLCALENDER,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchPayrollCalenderAction = (data) => {
    return {
        type : SET_LIST_PAYROLLCALENDER,
        payload : data
    }
}

export const getCalenderHolidaysAction = (data, response) => async (dispatch) => {
    try {
        const res = await calender_services.getCalenderHolidays(data)

        if(res.status === 200) {
            dispatch({
                type : CALENDER_HOLIDAYS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const ListTaskCalenderAction = (data, response) => async (dispatch) => {
    try {
        const res = await calender_services.getTaskCalender(data)

        if(res.status === 200) {
            dispatch({
                type : SET_LIST_TASKCALENDER,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getSearchTaskCalenderAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : GET_LIST_TASKCALENDER,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}

export const setSearchTaskCalenderAction = (data) => {
    return {
        type : SET_LIST_TASKCALENDER,
        payload : data
    }
}

export const getEventsAction = () => async (dispatch) => {
    try {
        const res = await calender_services.getEvents()

        if(res.status === 200) {
            dispatch({
                type : CALENDER_EVENTS,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getPayablesDueAction =
(
  employee_id,
  headerLocationId,
  data
) =>
async (dispatch) => {
  try {

    const res = await calender_services.PayablesDue(employee_id, headerLocationId,data);
    if (res.status === 200) {
      dispatch({
        type : PAYABLES_EVENT,
        payload : res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS");

  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getReceivablesDueAction =
  (employee_id, headerLocationId, data) => async (dispatch) => {
    try {
      const res = await calender_services.ReceivableDue(
        employee_id,
        headerLocationId,
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: RECEIVABLES_EVENT,
          payload: res.data,
        });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  export const createReminderAction = (data,response) => async (dispatch) => {
    try {
        const res = await calender_services.createReminder(data)

        if(res.status === 200) {
            dispatch({
                type : CREATE_REMINDER,
                payload : res.data
            })
        }
        if(response){
            response(res.status)
          }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const getRemindersAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.getreminders()

        if(res.status === 200){
            dispatch({
                type : GET_REMINDERS,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getLoanDuesAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.getLoanDues()

        if(res.status === 200){
            dispatch({
                type : GET_LOAN_DUE,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getCompanyLoanDuesAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.getCompanyLoanDues()

        if(res.status === 200){
            dispatch({
                type : GET_COMPANY_LOAN_DUE,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const calenderLeadsTasksAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.calenderLeadsTasks()

        if(res.status === 200){
            dispatch({
                type : LEADS_TASKS,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const calenderReportScheduleAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.calenderReportSchedule()

        if(res.status === 200){
            dispatch({
                type : GET_REPORT_SCHEDULE,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const getPlanSubForClientAction = () => async (dispatch)=>{
    try{

        const res = await calender_services.getPlanSubForClient()

        if(res.status === 200){
            dispatch({
                type : GET_PLAN_SUB_FOR_CLIENT,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}

export const scheduleDeleteAction = (id) => async (dispatch)=>{
    try{

        const res = await calender_services.deleteSchedule(id)

        if(res.status === 200){
            dispatch({
                type : DELETE_SCHEDULE_REPORT,
                payload : res.data
            })
        }

        return Promise.resolve('API_FINISHED_SUCCESS')
    }
    catch(err){
        return Promise.resolve('API_FINISHED_ERROR')
    }
}