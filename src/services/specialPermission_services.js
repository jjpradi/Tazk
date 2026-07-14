import http from '../http-common';
class specialPermission {
  getAll() {
    return http.get(`/specialPermission`);
  }
  create(data) {
    return http.post(`/specialPermission/create`, data)
  }
  update(data) {
    return http.post(`/specialPermission/updateSpecialPermission`, data)
  }
  delete(data){
    return http.post(`/specialPermission/deleteSpecialPermission`, data)
  }
  getbyid(id){
    return http.get(`/specialPermission/getByid/${id}`)
  }
  search(data) {
    return http.post(`/specialPermission/searchSpecialPermission`, data)
  }
  getSpecialPermissionCreatedYears() {
    return http.get(`/specialPermission/getSpecialPermissionCreatedYears`)
  }

}

export default new specialPermission();
