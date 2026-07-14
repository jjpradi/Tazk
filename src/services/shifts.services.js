import http from '../http-common';

class ShiftService {
  getCompanyName() { 
    return http.get('/shifts/companyName'); 
  }
  createShift(data) {
    return http.post('/shifts', data);
  }
  updateShist(data,shift_id) {
    return http.post(`/shifts/updateShift/${shift_id}`, data);
  }
  getShiftList() {
    return http.get('/shifts/shiftList');
  }
  getShiftDetailsByEmployeeId(employee_id){
    return http.get(`/shifts/shiftDetails/${employee_id}`);
  }
  getCurrentShift(employee_id){
    return http.get(`/shifts/currentshift/${employee_id}`);
  }
  getLogDetails(data){
    return http.post(`/shifts/employee/logDetails`,data);
  }
  getShiftHistory() {
    return http.get('/shifts/shiftHistory');
  }  
  getLeaveHistory(data) {
    return http.post('/shifts/leaveHistory',data);
  }
  getRequestHistory() {
    return http.get('/shifts/requestHistory');
  }
  pagination(data) {
    return http.post('/shifts/SearchShiftList' , data);
  }
  deleteShift(id) {
    return http.delete(`/shifts/deleteShift/${id}`);
  }
  selectuser(data) {
    return http.post(`/shifts/userWise`, data);
  }
  createschedule(data) {
    return http.post(`/shifts/shiftschedule`, data);
  }
  updateschedule(id, data) {
    return http.post(`/shifts/update/schedule/${id}`, data)
  }
  getscheduledetails(id,data){
    return http.post(`/shifts/getscheduledetails/${id}`, data)
  }
  getMonthShiftSchedule (data) {
    return http.post('/shifts/monthShift/view/details',data);
  }
  getDayShift (data) {
    return http.post('/shifts/day/view/details',data);
  }
  deleteSchedule (data) {
    return http.put(`/shifts/deleteSchedule`, data);
  }

  createPolicy(data) { 
    return http.post(`/shifts/createPolicy`,data); 
  } 

  getPolicy() {
    return http.get(`/shifts/getallPolicy`);
  }

  filterLeaveHistory(data) {
    return http.post(`/shifts/leaveHistory/filter`, data);
  }

  filterRequestReport(data) {
    return http.post(`/shifts/searchrequesthistory`, data);
  }

  listDepartment (data){
    return http.post(`/department/listDepartment`, data);
  }

  assignedDepartments (){
    return http.get(`/department/get/assignedDepartments`);
  }
  shiftScheduleFilter (data){
    return http.post(`/shifts/shiftScheduleFilter`, data);
  }

  shiftList (){
    return http.get(`/shifts/shiftList`);
  }
  
  listDesignation (){
    return http.get(`/shifts/listDesignation`);
  }
  
  attendancePolicy(data) {
    return http.post(`/shifts/createAttendancePolicy`, data);
  }

  updateAttendancePolicy(data,id) {
    return http.post(`/shifts/updateAttendancePolicy/${id}`, data);
  }

  listEmployeeCategory (data){
    return http.post(`/userCreation/employeeCategory`, data);
  }

  leavePolicy(data) {
    return http.post(`/shifts/createLeavePolicy`, data);
  }

  updateLeavePolicy(data,id) {
    return http.post(`/shifts/updateLeavePolicy/${id}`, data);
  }

  addDepartment(data) {
    return http.post(`/department/addDepartment`, data);
  }

  deleteDepartment(id) {
    return http.delete(`/department/deleteDepartment/${id}`);
  }

  deleteDepartmentLov(id) {
    return http.delete(`/department/deleteDepartmentLov/${id}`);
  }

  addCategory(data) {
    return http.post(`/userCreation/addCategory`, data);
  }

  deleteCategory(id) {
    return http.delete(`/userCreation/deleteCategory/${id}`);
  }

  deleteCategoryLov(id) {
    return http.delete(`/userCreation/deleteCategoryLov/${id}`);
  }

  addInitialLov(data) {
    return http.post(`/userCreation/addInitialLov`, data);
  }

  breakStartForManualAtt(payload) {
    return http.post(`/shifts/breakStartForManualAtt`, payload);
  }

  breakEndForManualAtt(payload) {
    return http.post(`/shifts/breakEndForManualAtt`, payload);
  }

  updateDepartment(data) {
    return http.put(`/department/updateDepartment`, data);
  }
  
}


export default new ShiftService();
