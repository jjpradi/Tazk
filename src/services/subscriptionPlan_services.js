import http from '../http-common';

class SubscriptionPlanService {
  getAllPlans() {
    return http.get('/subscriptionPlanAdmin');
  }
  getPlansByCompanyType(companyTypeId) {
    return http.get(`/subscriptionPlanAdmin/company-type/${companyTypeId}`);
  }
  getPlanById(id) {
    return http.get(`/subscriptionPlanAdmin/${id}`);
  }
  createPlan(data) {
    return http.post('/subscriptionPlanAdmin', data);
  }
  updatePlan(id, data) {
    return http.put(`/subscriptionPlanAdmin/${id}`, data);
  }
  deletePlan(id) {
    return http.delete(`/subscriptionPlanAdmin/${id}`);
  }
  getCompanyTypes() {
    return http.get('/subscriptionPlanAdmin/companyTypes');
  }
  getCompaniesOnPlan(planId) {
    return http.get(`/subscriptionPlanAdmin/${planId}/companies`);
  }
  // Plan ↔ Menu mappings
  getPlanMenus(planId) {
    return http.get(`/subscriptionPlanAdmin/${planId}/menus`);
  }
  setPlanMenus(planId, menuIds) {
    return http.post(`/subscriptionPlanAdmin/${planId}/menus`, { menu_ids: menuIds });
  }
  getMenusByCompanyType(companyTypeId) {
    return http.get(`/subscriptionPlanAdmin/menus/company-type/${companyTypeId}`);
  }
  getFeaturesByPlanType(companyTypeId, planId) {
    return http.get(`/subscriptionPlanAdmin/featuresMapping/company-type/${companyTypeId}/${planId}`);
  }
  createFeatureMapping(data) {
    return http.post('/subscriptionPlanAdmin/featuresMapping', data);
  }
  updateFeatureMapping(id, data) {
    return http.put(`/subscriptionPlanAdmin/featuresMapping/${id}`, data);
  }
  deleteFeatureMapping(id) {
    return http.delete(`/subscriptionPlanAdmin/featuresMapping/${id}`);
  }
}

export default new SubscriptionPlanService();
