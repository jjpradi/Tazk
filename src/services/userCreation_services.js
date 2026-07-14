import http from '../http-common';

class UserCreationService {
  getAll() {
    return http.get('/userCreation');
  }
  
  getReportingManager() {
    return http.get('/userCreation/getReportingManager');
  }

  getuserbyid(id){
    return http.get(`/userCreation/myaccount/${id}`);
  }

  getLocations(id) {
    return http.get(`/userCreation/locations/${id}`);
  }

  create(data) {
    return http.post('/userCreation', data);
  }
  
  bulkcreate(data) {
    return http.post('/userCreation/bulkcreate', data);
  }

  update(id, data) {
    return http.put(`/userCreation/${id}`, {
      table_name: 'pos_employees',
      table_data: data,
    });
  }
  useredit(id, data) {
    return http.put(`/userCreation/useredit/${id}`, {data});
  }

  delete(id) {
    return http.delete(`/userCreation/${id}`);
  }
  changepassword(data) {
    return http.post('/login/changepassword', data);
  }

  LastActivedate(payload, id) {
    return http.put(`/login/LastActivedate/${id}`, payload);
  }

  userCreationPagination(data) {
    return http.post('/userCreation/UserCreations', data);
  }

  getRegisterRequest(data){
    return http.post(`/grProduct/getRegisterRequest`, data);
  }

 

  updateUserGr(id,data){
    return http.post(`/grProduct/status/${id}`,data);
  }

  updateDeviceId(id){
    return http.post(`/userCreation/updateDeviceIdStatus/${id}`);
  }

 

  updatTimelineDetails(data){
    return http.post(`/grProduct/updateCompanyTimeline`,data);
  }

  updateSubscription(data){
    return http.post(`/grProduct/updateSubscriptionRecords`,data);
  }

 

  insertSub(data){
    return http.post(`/grProduct/insertSubscription`,data);
  }

 

  department(){
    return http.get(`/userCreation/list/department`);
  }

  updateRelievingDate(data){
    return http.post(`/userCreation/update/relievingDate`, data);
  }
 
  empVerificationDetail(data) {
    return http.post(`/userCreation/EmpverificationDetail`, data);
  }

  empDocumentsDetail(data) {
    return http.post(`/userCreation/EmpDocumentsDetail`, data);
  }

  empDocumentsDetailEmail(data) {
    return http.post(`/userCreation/EmpDocumentsDetail/sendMail`, data);
  }

  Completedindex(id) {
    return http.post(`/userCreation/completedindex/${id}`);
  }
  UploadFile(data) {
    return http.post(`/posMessage/emp_verification/uploadFile`, data);
  }
  Listverification(id) {
    return http.get(`/userCreation/ListEmpVerification/${id}`);
  }

  employeeDetail(id) {
    return http.get(`/userCreation/employeeDetail/${id}`);
  }

  verificationType(data) {
    return http.post(`/userCreation/verification/type`, data);
  }

  empVerificationCreate(data) {
    return http.post(`/userCreation/empVerification/create`, data);
  }

  empVerificationUpdate(data, id) {
    return http.put(`/userCreation/empVerification/update/${id}`, data);
  }

  createNewType(data) {
    return http.post(`/userCreation/createNewType`, data);
  }

  enableDisableEmpLogin(data){
    return http.post(`/userCreation/enableDisableEmpLogin`,data);
  }

  bankTransactionType(){
    return http.get(`/userRole/getBankTransactionType`);
  }

  listEvent(id){
    return http.get(`/userCreation/get/event/${id}`);
  }

  addNewEvent(data){
    return http.post(`/userCreation/addEvent/event`,data);
  }

  eventEdit(id, data) {
    return http.put(`/userCreation/update/event/${id}`, {data});
  }

  deleteEvent(id) {
    return http.delete(`/userCreation/delete/event/${id}`);
  }

  designation(data) {
    return http.post(`/userCreation/designation`, data);
  }

  benefits(data) {
    return http.post(`/userCreation/benefits`, data);
  }

  planType(data) {
    return http.post(`/userCreation/planType`, data);
  }

  trainingType(data) {
    return http.post(`/userCreation/trainingType`, data);
  }

  deleteDesignation(id) {
    return http.delete(`/userCreation/deleteDesignation/${id}`);
  }

  deletePlanType(id) {
    return http.delete(`/userCreation/deletePlanType/${id}`);
  }

  deleteTrainingType(id) {
    return http.delete(`/userCreation/deleteTrainingType/${id}`);
  }

  deleteBenefits(id) {
    return http.delete(`/userCreation/deleteBenefits/${id}`);
  }

  deleteDesignationLov(id) {
    return http.delete(`/userCreation/deleteDesignationLov/${id}`);
  }

  addDesignation(data) {
    return http.post(`/userCreation/addDesignation`, data);
  }

  addBenefits(data) {
    return http.post(`/userCreation/addBenefits`, data);
  }

  addPlanType(data) {
    return http.post(`/userCreation/addPlanType`, data);
  }

  addTrainingType(data) {
    return http.post(`/userCreation/addTrainingType`, data);
  }

  bulkcreateClient(data) {
    return http.post('/userCreation/bulkcreateClient', data);
  }

  getThemes(employee_id) {
    return http.get(`/userCreation/getThemes/${employee_id}`);
  }

  updateThemes(employee_id,data) {
    return http.post(`/userCreation/updateThemes/${employee_id}`,data);
  }

  updateDesignation(data) {
    return http.put(`/userCreation/updateDesignation`, data);
  }

  updateFactorAuthentication(data) {
    return http.post(`/userCreation/multiFactorAuthentication`, data);
  }
  
  getWhatsappLogs(){
    return http.get(`/grProduct/getWhatsappLogs`)
  }

}

export default new UserCreationService();
