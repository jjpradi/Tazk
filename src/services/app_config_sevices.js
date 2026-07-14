import http from '../http-common';

class AppConfig {
  getAppConfig() {
    return http.post(`/appConfig/appConfigDetails`);
  }
  getAppConfigBasedOnType(type) {
    return http.post(`/appConfig/appConfigDetailsBasedOnType/${type}`);
  }
  getAppConfigWithCompnayInfo(){
    return http.get(`/appConfig/companyInfo`);
  }
  updateAppConfig(data) {
    return http.post(`/appConfig`, data);
  }
  updateAppConfigWithCompanyInfo(data){
    return http.put(`/appConfig/companyInfo`, data);
  }
  updateUsername(data) {
    return http.put(`/appConfig/updateUsername`,data);
  }
  updateInvoiceDetailInfo(data){
    return http.put(`/appConfig/updateInvoiceDetail`, data);
  }
  getprefix(data) {
    return http.get(`/appConfig/getprefix`,data)
  }

  updateMailConfig(data) {
    return http.put(`/appConfig/smsmailconfiguration` , data);
  }
  createSms(data) {
    return http.post(`/appConfig/CreateSmsDetails`, data);
  }
  createMail(data) {
    return http.post(`/appConfig/createMailDetails`, data);
  }
  getManualAttendanceEmp(data) {
    return http.post(`/appConfig/getManualAttendanceEmpList`, data);
  }
  updateInventoryConfig(data) {
    return http.post(`/appConfig/updateInventoryConfig`, data);
  }
  getEinvoiceDetails() {
    return http.get(`/appConfig/getEinvoiceDetails`);
  }
  getSubCompanyDetails(data) {
    return http.post('/appConfig/getsubbilling', data)
  }
  createSubCompanyDetails(data) {
    return http.post('/appConfig/subbillinginsert', data)
  }
  updateSubCompanyDetails(data, id) {
    return http.post(`/appConfig/updatesubbilling/${id}`, data)
  }
  deleteSubCompanyDetails(id) {
    return http.post(`/appConfig/deletesubbilling/${id}`)
  }
  checkShortCodeExist(data) {
    return http.post(`/appConfig/checkShortCodeExist`, data)
  }
}

export default new AppConfig();
