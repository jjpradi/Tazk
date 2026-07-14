import { DELETE_SCHEDULE_REPORT, SET_LIST_PAYROLLCALENDER,
        CALENDER_HOLIDAYS,
        SET_LIST_TASKCALENDER,
        CALENDER_EVENTS,
        PAYABLES_EVENT,
        RECEIVABLES_EVENT,
        CREATE_REMINDER,
        GET_REMINDERS,
        GET_LOAN_DUE,
        GET_COMPANY_LOAN_DUE,
        LEADS_TASKS,
        GET_REPORT_SCHEDULE,
        GET_PLAN_SUB_FOR_CLIENT
} from "redux/actionTypes"

const initialState = {
    payrollCalenderList : [],
    attendanceStatusCount : [],
    calenderHolidaysList : [],
    taskCalenderList : [],
    tasksCount : [],
    calenderEventsList : [],
    getPayablesDue : [],
    getReceivablesDue : [],
    createReminder : [],
    getReminders : [],
    getLoanDues : [],
    getCompanyLoanDues :[],
    calenderLeadsTasks : [],
    getReportSchedule : [],
    getPlanSubForClient:[],
    delete_schedule_report : []
}

function CalenderReducers (state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case SET_LIST_PAYROLLCALENDER :
            return {...state, payrollCalenderList : payload}

        case CALENDER_HOLIDAYS :
            return {...state, calenderHolidaysList : payload}

        case SET_LIST_TASKCALENDER :
            return {...state, taskCalenderList : payload.data, tasksCount : payload.count}

        case CALENDER_EVENTS : 
            return {...state, calenderEventsList : payload}

        case PAYABLES_EVENT : 
            return {...state, getPayablesDue : payload}

        case RECEIVABLES_EVENT : 
            return {...state, getReceivablesDue : payload}

        case CREATE_REMINDER : 
            return {...state, createReminder : payload}

        case GET_REMINDERS :
            return {...state, getReminders : payload}

        case GET_LOAN_DUE :
                return {...state, getLoanDues : payload}

        case GET_COMPANY_LOAN_DUE :
                return {...state, getCompanyLoanDues : payload}

        case LEADS_TASKS :
                return {...state, calenderLeadsTasks : payload}

        case GET_REPORT_SCHEDULE :
                return {...state, getReportSchedule : payload}

        case GET_PLAN_SUB_FOR_CLIENT :
                return {...state, getPlanSubForClient : payload}

        case DELETE_SCHEDULE_REPORT :
                return {...state, delete_schedule_report : payload}

        default : 
            return state
    }
}

export default CalenderReducers