import http from '../http-common';

class RbacService {
  // Roles
  listRoles() {
    return http.get('/rbac/roles');
  }
  getRole(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}`);
  }
  createRole(data) {
    return http.post('/rbac/roles', data);
  }
  cloneRole(roleName, data) {
    return http.post(`/rbac/roles/${encodeURIComponent(roleName)}/clone`, data);
  }
  updateRole(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}`, data);
  }
  deleteRole(roleName) {
    return http.delete(`/rbac/roles/${encodeURIComponent(roleName)}`);
  }

  // Menu actions (effective permissions with COALESCE)
  getMenuAccess(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/menus`);
  }
  updateMenuAccess(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/menus`, data);
  }
  resetMenuAccess(roleName) {
    return http.post(`/rbac/roles/${encodeURIComponent(roleName)}/menus/reset`);
  }

  // Reports
  getReportAccess(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/reports`);
  }
  updateReportAccess(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/reports`, data);
  }

  // Dashboard
  getDashboardAccess(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/dashboard`);
  }
  updateDashboardAccess(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/dashboard`, data);
  }

  // Notifications
  getNotificationConfig(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/notifications`);
  }
  updateNotificationConfig(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/notifications`, data);
  }

  // Data scope
  getDataScope(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/dataScope`);
  }
  updateDataScope(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/dataScope`, data);
  }

  // Field visibility
  getFieldVisibility(roleName) {
    return http.get(`/rbac/roles/${encodeURIComponent(roleName)}/fields`);
  }
  updateFieldVisibility(roleName, data) {
    return http.put(`/rbac/roles/${encodeURIComponent(roleName)}/fields`, data);
  }

  // ---- L3: User-Level Overrides (Admin manages user permissions) ----
  getUserEffectiveMenuAccess(employeeId) {
    return http.get(`/rbac/users/${employeeId}/menus/effective`);
  }
  getL3MenuOverrides(employeeId) {
    return http.get(`/rbac/users/${employeeId}/menus`);
  }
  setL3MenuOverrides(employeeId, data) {
    return http.put(`/rbac/users/${employeeId}/menus`, data);
  }
  grantL3MenuAccess(employeeId, data) {
    return http.post(`/rbac/users/${employeeId}/menus/grant`, data);
  }
  revokeL3MenuAccess(employeeId, menuId) {
    return http.delete(`/rbac/users/${employeeId}/menus/${menuId}`);
  }
  getL3NotificationConfig(employeeId) {
    return http.get(`/rbac/users/${employeeId}/notifications`);
  }
  setL3NotificationConfig(employeeId, data) {
    return http.put(`/rbac/users/${employeeId}/notifications`, data);
  }
  getL3DashboardAccess(employeeId) {
    return http.get(`/rbac/users/${employeeId}/dashboard`);
  }
  setL3DashboardAccess(employeeId, data) {
    return http.put(`/rbac/users/${employeeId}/dashboard`, data);
  }

  // ---- Self-Service (logged-in user manages own preferences) ----
  getMyNotifications() {
    return http.get('/rbac/me/notifications');
  }
  setMyNotifications(data) {
    return http.put('/rbac/me/notifications', data);
  }
  getMyDashboard() {
    return http.get('/rbac/me/dashboard');
  }
  setMyDashboard(data) {
    return http.put('/rbac/me/dashboard', data);
  }

  // Audit log
  getAuditLog(params) {
    return http.get('/rbac/audit', { params });
  }
}

export default new RbacService();
