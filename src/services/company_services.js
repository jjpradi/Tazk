import http from '../http-common';

class CompanyService {
  create(data) {
    return http.post('/company', data);
  }

  getCompanyName(data) {
    return http.post('/company/getCompanyList', data);
  }


  getGpsRadius() {
    return http.get('/company/getGpsRadius');
  }


  getTypes() {
    return http.get('/company/types')
  }

  getMultiTypes(data) {
    return http.post('/company/multitypes', data)
  }

  updateDefaultType(data) {
    return http.post('/company/updateDefault', data)
  }

  updateGpsAttendance(data){
    return http.put('/appConfig/updateGpsAttendance', data)
  }

  
  updateWorkFromHome(data){
    return http.put('/appConfig/updateWorkFromHome', data)
  }

  updateEnableLive(data){
    return http.put('/appConfig/updateEnableLive', data)
  }

  getCompanyLogo() {
    return http.get(`/companyInfo/companyLogo/getCompanyLogo`);
  }
  getCompanyLogoSalary() {
    return http.get(`/salary/companyLogo/getCompanyLogo`,);
  }
  getCompanybase64Logo() {
    return http.get(`/customer/companyLogo/getCompanybase64Logo`,);
  }


  getSignature() {
    return http.get(`/companyInfo/signature/getSignature`,);
  }

  uploadCompanyLogo(data) {
    return http.post(`/customer/companyLogo/uploadCompanyLogo`, data);
  }

  uploadSignature(data) {
    return http.post(`/customer/signature/uploadSignature`, data);
  }
  getSignatureSalary(){
    return http.get(`/salary/signature/getSignature`);
  }

  getIndustryType() {
    return http.get('/company/getIndustryType')
  }
}

export default new CompanyService();
