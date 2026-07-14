import http from '../http-common';
class Holidays {
  getAll() {
    return http.get(`/holidays`);
  }
  create(data) {
    return http.post(`/holidays/create`, data)
  }
  update(data) {
    return http.post(`/holidays/updateHoliday`, data)
  }
  delete(data){
    return http.post(`/holidays/deleteHoliday`, data)
  }
  getbyid(id){
    return http.get(`/holidays/getByid/${id}`)
  }
  search(data) {
    return http.post(`/holidays/searchHoliday`, data)
  }

  getByCompanyCategoryHolidays() {
    return http.get(`/holidays/getByCompanyCategoryHolidays`);
  }

  getHolidayCreatedYears() {
    return http.get(`/holidays/getHolidayCreatedYears`);
  }

}

export default new Holidays();
