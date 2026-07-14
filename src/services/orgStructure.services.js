import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.orgStructure;

class OrgStructureService {
  getDepartmentTree() {
    return http.get(`${BASE}/departmentTree`);
  }
  updateDepartmentHierarchy(data) {
    return http.post(`${BASE}/departmentHierarchy`, data);
  }
  getOrgChart(data) {
    return http.post(`${BASE}/orgChart`, data);
  }
  getDepartmentStats() {
    return http.get(`${BASE}/departmentStats`);
  }
  getCostCenters() {
    return http.get(`${BASE}/costCenter`);
  }
  createCostCenter(data) {
    return http.post(`${BASE}/costCenter`, data);
  }
  updateCostCenter(data) {
    return http.put(`${BASE}/costCenter`, data);
  }
  deleteCostCenter(id) {
    return http.delete(`${BASE}/costCenter/${id}`);
  }
}

export default new OrgStructureService();
