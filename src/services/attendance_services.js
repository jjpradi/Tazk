import http from '../http-common';

class Attendanceservice {
  getAll(data,empId) {
    return http.get(`/attendance/attendance/${data}/${empId}`);
  }

  getCheckInOut(empId) {
    return http.get(`/attendance/checkInOut/${empId}`);
  }

  getAllData() {
    return http.get('/attendance');
  }

  //ATTENDANCE_VIEW -- API
  AttendanceView(data) {
    return http.post('/attendance/AttendanceView',data);
  }

  Manualdataget(data) {
    return http.post('/attendance/manualgetLog',data);
  }
  ManualEdit( data) {
    return http.post(`/attendance/manualEditLog`,data);
  }

  getEmpbasecompany(data) {
    const payload =
      data && typeof data === 'object'
        ? {searchString: '', ...data}
        : {searchString: ''};
    return http.post('/userCreation/getEmpbasecompanyFilter', payload);
  }
  getEmpbasecompanyform(data) {
    return http.post('/attendance/getEmpbasecompanyform12',data);
  }
  
  getEmpbasecompanyFilter(data) {
    return http.post('/userCreation/getEmpbasecompanyFilter',data);
  }
  getDeptBaseEmp(data) {
    return http.post('/attendance/getDeptBaseEmp',data);
  }

  getCategoryBaseEmp(data) {
    return http.post('/attendance/getCategoryBaseEmp',data);
  }
  getDeptBaseEmpFilter(data) {
    return http.post('/attendance/getDeptBaseEmpFilter',data);
  }
  getCategoryBaseEmpFilter(data) {
    return http.post('/attendance/getCategoryBaseEmpFilter',data);
  }
  //ATTENDANCE PROCESS API====
  getProcess(data) {
    return http.post('/attendance/AttendanceProcess',data);
  }

  getCompanyBasedEmp(data) {
    return http.post('/attendance/getCompanyBasedEmployee', data);
  }

  getCompanyBasedEmpDetails(data) {
    return http.post('/attendance/getCompanyBasedEmployeeDetails', data);
  }

  updateCorrection(id,break_id,data) {
    return http.put(`/attendance/AttendanceCorrection/${id}/${break_id}`, data);
  }

  approveAttendance(data) {
    return http.post(`/attendance/ApproveAttendance`, data);
  }
  

  searchAttendanceCor(data) {
    return http.post(`/attendance/searchAttendanceCor`, data);
  }

    
  approveAttendanceExcel(data) {
    return http.post(`/attendance/ApproveAttendance/Excel`, data);
  }
  getWorkDurationReport(data) {
    return http.post('/attendance/workDurationReport',data);
  }

  getWorkDurationTotalHoursReport(data) {
    return http.post('/attendance/workDurationReport/totalHours',data);
  }

  getOverTimeReport(data) {
    return http.post('/attendance/overTimeReport',data);
  }

  lateAndEarlyReport(data) {
    return http.post('/attendance/lateLoginEarlyCheckoutReport',data);
  }

  punchexceptionreport(data) {
     return http.post('/attendance/PunchExceptions',data);
  }

  PrivilegeLeaveReport(data) {
     return http.post('/attendance/PrivilegeLeaveReport',data);
  }

  pfReport(data) {
    return http.post('/salary/pfReport',data);
  }
  //   get(id) {
  //     return http.get(`/inventory/${id}`);
  //   }
  //   delete(id) {
  //     return http.delete(`/inventory/${id}`);
  //   }
  //  //Transfer

  //   getStocktransfer(){
  //     return http.get("/inventory/stacktransfer");
  //   }
  //   get(id) {
  //     return http.get(`/inventory/stocktransfer/${id}`);
  //   }

  //   create(data) {
  //     return http.post("/inventory/stacktransfer",  data );
  //   }
  //   update(id, data) {
  //     return http.put(`/inventory/stackreceive/${id}`, data);
  //   }
  // //Receievr
  //   getStockreceive(){
  //     return http.get("/inventory/stacktransfer");
  //   }
  //   getStockreceiveId(id) {
  //     return http.get(`/inventory/stacktransfer/${id}`);
  //   }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
  overtimeReport() {
    return http.get(`/attendance/overtimeReport`);
  }

  getEmployeeVerificationDetails() {
    return http.get(`/attendance/getEmployeeVerificationDetails`);
  }

  filterSalaryReport(data) {
    return http.post(`/attendance/filterSalaryReport`, data);
  }

  qrAttendance(data) {
    return http.post(`/attendance/qrAttendance`, data);
  }

  viewSelfieAttendanceImages(data) {
    return http.post(`/attendance/viewSelfieAttendanceImages`, data);
  }

  workDuration(data) {
    return http.post(`/attendance/work/duration/reports`, data);
  }

  getLocBaseEmp(data){
    return http.post(`/attendance/getLocBaseEmp`, data)
  }

  getLocBaseEmpFilter(data){
    return http.post(`/attendance/getLocationBasedEmployeeFilter`, data)
  }

  attendanceProcessBackgroundJob(data){
    return http.post(`/attendance/attendanceProcessBackgroundJob`,data)
  }

  worklogDetails(id) {
    return http.get(`/attendance/worklogDetails/${id}`);
  }

  getpaidleaveBalance() {
    return http.get(`/attendance/getpaidleaveBalance`);
  }

  lastSixMonthLeave(id) {
    return http.get(`/attendance/lastSixMonth/${id}`);
  }

  manualCheckIn(payload) {
    return http.post(`/attendance/manualCheckIn`, payload);
  }

  manualCheckOut(payload) {
    return http.post(`/attendance/manualCheckOut`, payload);
  }

  updateManualAttendance(payload) {
    return http.post(`/attendance/updateCorrectionForManualAttendance`, payload);
  }

  getBreaksDurationForReports(data) {
    return http.post('/breaks/getBreaksDurationForReports',data);
  }

  syncContact(data){
    return http.post('/attendance/syncContact',data)
  }

  checkDeviceAttStatus(){
    return http.get('/attendance/checkDeviceAttStatus')
  }

  getRegisteredUsers(data){
    return http.post('/attendance/getRegisteredUsers',data)
  }

  getAttendanceLogReport(data) {
    return http.post('/attendance/AttendanceLogReport',data);
  }

  deleteEmployeeDocuments(id){
    return http.delete(`/attendance/deleteEmployeeDocuments/${id}`)
  }
  getAttendanceEfficiencyReport(data) {
    return http.post('/attendance/AttendanceEfficiencyReport',data);
  }
}

export default new Attendanceservice();
