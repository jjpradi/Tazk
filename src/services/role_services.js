import http from '../http-common';

class Roleservice {
  list_role() {
    return http.get('/role/getrole');
  }
  listModulesForAllRoles(data){
    return http.post('/role/getModulesForAllRoles',data)
  }
  list_module() {
    return http.get('/role/modulelist');
  }
  create(data) {
    return http.post('/role/modulelist', data);
  }
  delete(id) {
    return http.delete(`/role/${id}`);
  }
  get(id) {
    return http.get(`/role/${id}`);
  }
  update(id, data) {
    return http.put(`/role/${id}`, data);
  }
  user(id) {
    return http.get(`/role/userlocation/${id}`);
  }
  menus(id) {
    return http.get(`/role/menus/${id}`);
  }
  PosPages() {
    return http.get('/role/posPages');
  }
  notifyData() {
    return http.get(`/role/notifyData`);
  }
  pagination(data) {
    return http.post(`/role/searchUserRole`, data)
  }
  roleName(data) {
    return http.post(`/role/roleName`, data)
  }
  userRights() {
    return http.get(`/role/userRights`)
  }
  updateUserRights(data){
    return http.put(`/role/updateUserRights`,data)
  }
  frontDeskRights() {
    return http.get('/role/userRightsForFrontDesk')
  }

  addfavouriteMenu(data) {
    return http.post('/role/addFavouriteMenu', data);
  }
  
favouriteMenuList() {
    return http.get('/role/favouriteMenuList');
  }

getChildModules() {
    return http.get('/role/getChildModules');
  }
}

export default new Roleservice();
