import {idID} from '@mui/material/locale';
import http from '../http-common';

class ErrorDashboards {
  getAll(data) {
    return http.post(`/errorDashboard`, data);
  }

  create(data) {
    return http.post(`/errorDashboard/createlog`, data);
  }

  get() {
    return http.get(`/errorDashboard/developerDetails`);
  }

  assignError(data) {
    return http.post(`/errorDashboard/assignError`, data);
  }

  remove(data) {
    return http.post(`/errorDashboard/removeAssig`, data);
  }

  change(data) {
    return http.post(`/errorDashboard/statusChange`, data);

  }

  sendMail(data) {
    return http.post(`/errorDashboard/sendMail`, data);
  }

  getDevDashboard() {
    return http.get(`/errorDashboard/devDashboard`);
  }

  getSeverityConfig() {
    return http.get(`/errorDashboard/priorityConfig/severity`);
  }
  updateSeverityConfig(id, data) {
    return http.put(`/errorDashboard/priorityConfig/severity/${id}`, data);
  }
  getThresholds() {
    return http.get(`/errorDashboard/priorityConfig/thresholds`);
  }
  updateThreshold(id, data) {
    return http.put(`/errorDashboard/priorityConfig/thresholds/${id}`, data);
  }
  getFilterOptions(data) {
    return http.post(`/errorDashboard/filterOptions`, data);
  }

}

export default new ErrorDashboards();
