import http from '../http-common'

class Calender {
    getPayrollCalender(data) {
        return http.post('/calender', data)
    }

    getCalenderHolidays(data) {
        return http.post('/calender/calenderHolidays', data)
    }

    getTaskCalender(data) {
        return http.post('/calender/taskCalender', data)
    }

    getEvents() {
        return http.get('/calender/getEvents')
    }

    PayablesDue(employee_id, headerLocationId,data) {
        return http.post(
          `/purchase/payables/${employee_id}/${headerLocationId}/payable`,data
        );
    }

    ReceivableDue(employee_id, headerLocationId,data) {
        return http.post(
          `/sales/received/${employee_id}/${headerLocationId}`,data
        );
    }

    createReminder(data) {
        return http.post('/calender/createReminder',data);
    }

    getreminders(){
        return http.get('/calender/getreminders');
    }

    getLoanDues(){
        return http.get('/calender/getLoanDues');
    }

    getCompanyLoanDues(){
        return http.get('/calender/getCompanyLoanDues');
    }

    calenderLeadsTasks(){
        return http.get('/calender/calenderLeadsTasks')
    }

    calenderReportSchedule(){
        return http.get('/calender/calenderReportSchedule')
    }

    getPlanSubForClient(){
        return http.get('/calender/getPlanSubForClient')
    }

    deleteSchedule(id){
        return http.post(`/calender/deleteScheduleCalendar/${id}`)
    }
}

export default new Calender