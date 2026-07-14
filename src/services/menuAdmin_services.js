import http from '../http-common';

class MenuAdminService {
  // Menu Items CRUD
  getAllMenuItems() {
    return http.get('/menuAdmin');
  }
  getMenuItemById(id) {
    return http.get(`/menuAdmin/${id}`);
  }
  createMenuItem(data) {
    return http.post('/menuAdmin', data);
  }
  updateMenuItem(id, data) {
    return http.put(`/menuAdmin/${id}`, data);
  }
  deleteMenuItem(id) {
    return http.delete(`/menuAdmin/${id}`);
  }
  reorderMenuItems(items) {
    return http.put('/menuAdmin/reorder', { items });
  }
  reorderByCompanyType(companyTypeId, items) {
    return http.put(`/menuAdmin/reorder/company-type/${companyTypeId}`, { items });
  }

  // Company Type mappings
  getMenuCompanyTypes(menuId) {
    return http.get(`/menuAdmin/${menuId}/company-types`);
  }
  setMenuCompanyTypes(menuId, companyTypes) {
    // companyTypes: array of { company_type_id, is_active }
    return http.post(`/menuAdmin/${menuId}/company-types`, { companyTypes });
  }

  // Subscription mappings
  getMenuSubscriptions(menuId) {
    return http.get(`/menuAdmin/${menuId}/subscriptions`);
  }
  setMenuSubscriptions(menuId, subscriptions) {
    // subscriptions: array of { company_type_id, subscription_tier, is_active }
    return http.post(`/menuAdmin/${menuId}/subscriptions`, { subscriptions });
  }

  // Auto-add to top-tier subscription plans
  addToTopTierPlans(menuId, companyTypeIds) {
    return http.post(`/menuAdmin/${menuId}/add-to-top-plans`, { companyTypeIds });
  }

  // Set default RBAC (admin-only) for new menu
  setDefaultRbac(menuId, companyTypeIds) {
    return http.post(`/menuAdmin/${menuId}/set-default-rbac`, { companyTypeIds });
  }

  // Role access mappings
  getMenuRoleAccess(menuId) {
    return http.get(`/menuAdmin/${menuId}/roles`);
  }
  setMenuRoleAccess(menuId, roles) {
    // roles: array of { company_type_id, role_name, is_visible }
    return http.post(`/menuAdmin/${menuId}/roles`, { roles });
  }

  // Bulk subscription management
  getSubscriptionsByCompanyType(companyTypeId) {
    return http.get(`/menuAdmin/subscriptions/company-type/${companyTypeId}`);
  }
  bulkSetSubscriptions(companyTypeId, entries) {
    // entries: [{ menu_id, subscription_tier }]
    return http.post(`/menuAdmin/subscriptions/company-type/${companyTypeId}`, { entries });
  }

  // Company types list
  getCompanyTypes() {
    return http.get('/menuAdmin/companyTypes');
  }

  // User Rights
  getAllRights() {
    return http.get('/menuAdmin/rights/all');
  }
  createRight(data) {
    return http.post('/menuAdmin/rights', data);
  }
  updateRight(id, data) {
    return http.put(`/menuAdmin/rights/${id}`, data);
  }

  // Role Rights Defaults
  getRoleRightsDefaults(companyTypeId, roleName) {
    return http.get('/menuAdmin/rights/defaults', { params: { companyTypeId, roleName } });
  }
  setRoleRightsDefaults(data) {
    return http.post('/menuAdmin/rights/defaults', data);
  }
}

export default new MenuAdminService();
