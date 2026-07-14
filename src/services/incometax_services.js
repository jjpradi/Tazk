import http from '../http-common';

class Incometaxservice {
   getAll() {
    return http.get('/incometax/form12bb');
    }
  createform12(data) {
    return http.post('/incometax/form12bb', data);
  }
}
 

export default new Incometaxservice();
