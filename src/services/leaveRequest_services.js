import { monthAction } from 'redux/actions/profitLossDashboardAction';
import http from '../http-common';

class LeaveRequestService {
  getAll(data,employee_id) {
    return http.post(`/leaveRequest/${employee_id}`,data);
  }

  getEmployeeLeaveReq(person_id, data) {
    return http.post(`/leaveRequest/getEmp/${person_id}`, data);
  }

  // getEmployeeId(person_id){
  //   return http.get(`/leaveRequest/getEmp/${person_id}`);
  // }

  getEmpLeaveHistory(person_id){
    return http.get(`/leaveRequest/leaveHistory/${person_id}`);
  }

  updateSeen(leaveId) {
    return http.put(`/leaveRequest/updateSeen/${leaveId}`);
  }
  commonrequpdateseen(id) {
    return http.put(`/leaveRequest/commonrequpdateSeen/${id}`);
  }

  getLeaveApproval(){
    return http.get(`/leaveRequest/currentDayDetails/leaveApproval`);
  }

  create(data) {
    return http.post('/leaveRequest',data)
  }
  
  getUnseenCount(data) {
    return http.post('/leaveRequest/getUnseen/count',data)
  }

  
  getEmployeeShiftDetails(data) {
    return http.post('/leaveRequest/get/Employee/Shift/Details',data)
  }

  getEmployeeAttendanceDetails(data) {
    return http.post('/leaveRequest/get/Employee/attendanceDetails',data)
  }

  cancel(employee_id,leaveId,data) {
    return http.put(`/leaveRequest/${employee_id}/${leaveId}`,data)
  }
  poscancel(employee_id,id,data) {
    return http.put(`/leaveRequest/cancelrequestpos/${employee_id}/${id}`,data)
  }

  Approve(employee_id,leaveId , data) {
    return http.put(`/leaveRequest/approve/${employee_id}/${leaveId}`,data)
  }

  posApprove(employee_id,leaveId , data) {
    return http.put(`/leaveRequest/posapprove/${employee_id}/${leaveId}`,data)
  }

  getConflictLeaveRequest(employee_id, data) {
    return http.post(`/leaveRequest/getConflictLeaveRequest/${employee_id}`, data);
  }

  updateConflictLeaveRequest(employee_id,leaveId,data) {
    return http.put(`/leaveRequest/updateConflictLeaveRequest/${employee_id}/${leaveId}`,data)
  }

  previousleave(employee_id,data){
    return http.post(`/leaveRequest/preleavereq/${employee_id}`,data);
  }

  previousPermission(employee_id,data){
    return http.post(`/leaveRequest/prepermissionreq/${employee_id}`,data);
  }

  previousCorrection(data){
    return http.post(`/leaveRequest/precorrectionreq`,data);
  }

  leaveType(){
    return http.get(`/leaveRequest/leaveType`);
  }

  leaveTypeForManualAtt(data){
    return http.post(`/leaveRequest/leaveTypeForManualAtt`,data);
  }

  getPaidleave(month, year,data){
    return http.post(`/leaveRequest/webpaidLeavecount/${month}/${year}`,data);
  }

  getPaidleaveForManualAtt(data){
    return http.post(`/leaveRequest/paidLeavecountForManualAtt`,data);
  }

  checkstatus(data){
    return http.post(`/salary/checkStatus`, data);
  }
  
  logDetail(data){
    return http.post(`/attendance/checkExistLogDetail`,data);
  }

  checkDateOfJoin(){
    return http.get(`/attendance/checkDateOfJoin`);
  }

  deleterequest(data){
    return http.post(`/leaveRequest/delete`,data);
  }

  createLeaveRequestForManualAtt(data){
    return http.post(`/leaveRequest/createLeaveRequestForManualAtt`,data);
  }

  permissionRequestForManualAtt(data){
    return http.post(`/leaveRequest/permissionRequestForManualAtt`,data);
  }

  getpermissiondataForManualAtt(data){
    return http.post(`/leaveRequest/getpermissiondataForManualAtt`,data);
  }

  getpermissiondata(data){
    return http.get(`/leaveRequest/getpermissiondata/${data}`);
  }
  getposrequestdata(data){
    return http.post(`/leaveRequest/PosDiscountReq`, data);
  }

  getRestrictedHolidaysData(){
    return http.get(`/leaveRequest/getRestrictedHolidaysData`);
  }
  newLeaveType(data) {
    return http.post('/leaveRequest/leaveType/list', data);
  }
  createLeaveList(data) {
     return http.post('/leaveRequest/leaveType/create', data);
  }
}

export default new LeaveRequestService();
