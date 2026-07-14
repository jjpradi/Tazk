import http from '../http-common';

class LoginService {
  create(data) {
    return http.post('/login', data);
  }
  logout(data) {
    return http.post('/logout', data);
  }
  logoutAll() {
    return http.post('/logout/logoutAll');
  }
  active_devices(person_id) {
    return http.get(`/login/personlogin/deviceId/getRegisteredDeviceId/${person_id}`);
  }
  setLogindate(employee_id) {
    return http.put(`/login/setlogindate/${employee_id}`)
  }

  verify(data){
    // console.log("pppp",data)
    return http.post('/login/verifyOtp/multiFactor', data);
  }

  resendOtp(data){
    return http.post('/login/resendOtp', data);
  }
  
  sendForgetOtp(data) {
    return http.post('/login/sendForgetOtp', data);
  }

  verifyForetOtp(data) {
    return http.post('/login/verifyForgetOtp', data);
  }

  updatePassword(data) {
    return http.post('/login/updatePassword', data);
  }

  userEmailUpdate(data) {
    return http.post('/login/userEmailUpdate', data);
  }

  getMultiFactorStatus() {
    return http.get('/login/MultiFactor/status');
  }

}

export default new LoginService();
