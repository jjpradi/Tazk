import http from '../http-common';

class UserRoleService {
  getAll() {
    return http.get('/userRole');
  }
 
  getBankReportColumns() {
    return http.get('/userRole/getBankReportColumns');
  }

  updateBankReportColumns(data) {
    return http.post('/userRole/updateBankReportColumns', data);
  }

  getevent() {
    console.log('eventttt')
    return http.get('/userRole/eventname');
  }

  getUsername(id) {
    return http.get(`/userRole/${id}`);
  }

  getToken() {
    return http.get('/userRole/userToken');
  }

  getTokenByEmpId(empId) {
    return http.get(`/userRole/userTokenByEmpId/${empId}`);
  }
  getTokenByCompany() {
    return http.get(`/userRole/adminsTokenByCompany`);
  }

  getchildModule(type) {
    return http.get(`/userRole/getmodules/child/${type}`);
  }

  getRoutesConfigService(data) {
    return http.post(`/userRole/getRoutesConfig`, data);
  }

  getUserRightsService() {
    return http.post(`/userRole/getUserRights`);
  }

  getReportsBasedOnCategory() {
    return http.post(`/userRole/getReportsBasedOnCategory`);
  }
}

export default new UserRoleService();
