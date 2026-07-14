import http from '../http-common';

class Advancesheetservice {
  getAll(data) {
    return http.get(`/advanceSheet`,data);
  }

  update(id,data) {
    return http.put(`/advanceSheet/${id}`,data);
  }

  getAfter(data) {
    return http.post(`/advanceSheet/after`,data);
  }

  getChild(data) {
    return http.post(`/advanceSheet/afterda`,data);
  }

  create(data) {
    return http.post(`/advanceSheet/create`,data);
  }
  
}

export default new Advancesheetservice();
