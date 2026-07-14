import {idID} from '@mui/material/locale';
import http from '../http-common';

class Configuration {

  getAllMailConfig() {
    return http.get(`/configuration/mail`);
  }

  getAllSmsConfig() {
    return http.get(`/configuration/sms`);
  }
  getAllSmsData() {
    return http.get(`/appConfig/configuration/sms`);
  }
  // getMailRoleById(employee_id, data) {
  //   return http.post(`/configuration/mail/${employee_id}`, data);
  // }

  // getSmsRoleById(employee_id, data) {
  //   return http.post(`/configuration/sms/${employee_id}`, data);
  // }

  getMailRoleById( data) {
    return http.post(`/appConfig/configuration/searchMail`, data);
  }

  getSmsRoleById(data) {
    return http.post(`/appConfig/configuration/searchSms`, data);
  }

  updateMailRole(role_id, data) {
    return http.put(`/configuration/mail/${role_id}`, data);
  }

  updateSmsRole(role_id, data) {
    return http.put(`/configuration/sms/${role_id}`, data);
  }

  deleteSmsRole(role_id) {
    return http.delete(`/configuration/deleteSms/${role_id}`);
  }

  getMailById(mail_name,role_id) {
    return http.get(`/configuration/mail/${mail_name}/${role_id}`);
  }

  getSmsById(sms_role_name,role_id) {
    return http.get(`/configuration/sms/${sms_role_name}/${role_id}`);
  }

  sendTestMail(data){
    return http.post(`/configuration/testMail`, data);
  }
  searchMail(data) {
    return http.post(`/configuration/searchMail`, data)
  }
  searchSms(data) {
    return http.post(`/configuration/searchSms`, data)
  }

  sendTestSMS(data){
    return http.post(`/configuration/testSMS`, data);
  }

  reminderConfiguration(data){
    return http.post(`/configuration/reminderConfiguration`,data)
  }
 
  deleteMailRole(role_id){
    return http.delete(`/configuration/deleteMail/${role_id}`);
  }

}

export default new Configuration();
