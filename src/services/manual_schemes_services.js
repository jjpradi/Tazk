import http from '../http-common';

class ManualSchemesService {

  create(data) {
    return http.post('/manualSchemes', data);
  }

  getAll(){
    return http.get('/manualSchemes');
  }

  pagination(data){
    return http.post('/manualSchemes/searchManualSchemes',data);
  }
}
export default new ManualSchemesService();
