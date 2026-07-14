import http from '../http-common';

class Jwtservice {
  //   getAll() {
  //     return http.get("/customer");
  //   }

  //   get(id) {
  //     return http.get(`/customer/${id}`);
  //   }

  create(data) {
    return http.post('/renewAccessToken', {refreshToken: data});
  }

  //
}

export default new Jwtservice();
