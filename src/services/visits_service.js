import http from '../http-common';

class visitSerice {
  get(employee_id,headerLocation_id, data) {
    return http.post(`/Visits/${employee_id}/${headerLocation_id}`, data);
  }
  
}

export default new visitSerice();
