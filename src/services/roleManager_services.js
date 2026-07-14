import http from '../http-common';

class RoleManagerService {
  // Company Types
  getCompanyTypes() {
    return http.get('/roleManager/companyTypes');
  }

  // Roles CRUD per company type
  getRoles(companyTypeId) {
    return http.get(`/roleManager/${companyTypeId}/roles`);
  }
  createRole(companyTypeId, data) {
    return http.post(`/roleManager/${companyTypeId}/roles`, data);
  }
  updateRole(companyTypeId, roleName, data) {
    return http.put(`/roleManager/${companyTypeId}/roles/${encodeURIComponent(roleName)}`, data);
  }
  deleteRole(companyTypeId, roleName) {
    return http.delete(`/roleManager/${companyTypeId}/roles/${encodeURIComponent(roleName)}`);
  }

  // Menu Access (L1)
  getMenuAccess(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/menus`);
  }
  setMenuAccess(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/menus`, { items });
  }

  // Report Access (L1)
  getReportAccess(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/reports`);
  }
  setReportAccess(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/reports`, { items });
  }

  // Dashboard Access (L1)
  getDashboardAccess(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/dashboard`);
  }
  setDashboardAccess(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/dashboard`, { items });
  }

  // Notification Config (L1)
  getNotificationConfig(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/notifications`);
  }
  setNotificationConfig(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/notifications`, { items });
  }

  // Data Scope (L1)
  getDataScope(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/dataScope`);
  }
  setDataScope(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/dataScope`, { items });
  }

  // Field Visibility (L1)
  getFieldVisibility(ctId, roleName) {
    return http.get(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/fields`);
  }
  setFieldVisibility(ctId, roleName, items) {
    return http.put(`/roleManager/${ctId}/roles/${encodeURIComponent(roleName)}/fields`, { items });
  }

  // Master Tables
  getReports(companyTypeId) {
    return http.get(`/roleManager/reports/${companyTypeId}`);
  }
  createReport(data) {
    return http.post('/roleManager/reports', data);
  }
  // Widgets CRUD
  getWidgets(companyTypeId) {
    return http.get(`/roleManager/widgets/list/${companyTypeId}`);
  }
  createWidget(data) {
    return http.post('/roleManager/widgets', data);
  }
  updateWidget(id, data) {
    return http.put(`/roleManager/widgets/${id}`, data);
  }
  deleteWidget(id) {
    return http.delete(`/roleManager/widgets/${id}`);
  }
  getWidgetSubscriptions(id) {
    return http.get(`/roleManager/widgets/${id}/subscriptions`);
  }
  setWidgetSubscriptions(id, items) {
    return http.put(`/roleManager/widgets/${id}/subscriptions`, { items });
  }
  getWidgetSubscriptionsByCompanyType(companyTypeId) {
    return http.get(`/roleManager/widgets/subscriptions/${companyTypeId}`);
  }

  // Field Definitions CRUD
  getFields(companyTypeId) {
    return http.get(`/roleManager/fields/list/${companyTypeId}`);
  }
  createFieldDefinition(data) {
    return http.post('/roleManager/fields', data);
  }
  updateFieldDefinition(id, data) {
    return http.put(`/roleManager/fields/${id}`, data);
  }
  deleteFieldDefinition(id) {
    return http.delete(`/roleManager/fields/${id}`);
  }
  getFieldSubscriptions(id) {
    return http.get(`/roleManager/fields/${id}/subscriptions`);
  }
  setFieldSubscriptions(id, items) {
    return http.put(`/roleManager/fields/${id}/subscriptions`, { items });
  }
  getFieldSubscriptionsByCompanyType(companyTypeId) {
    return http.get(`/roleManager/fields/subscriptions/${companyTypeId}`);
  }

  // Notification Types CRUD
  getNotificationTypes(companyTypeId) {
    return http.get(`/roleManager/notifications/list/${companyTypeId}`);
  }
  createNotificationType(data) {
    return http.post('/roleManager/notifications', data);
  }
  updateNotificationType(id, data) {
    return http.put(`/roleManager/notifications/${id}`, data);
  }
  deleteNotificationType(id) {
    return http.delete(`/roleManager/notifications/${id}`);
  }

  // Notification Types (for template manager - from sa_notification_types)
  getNotificationTypesForCompanyType(companyTypeId) {
    return http.get(`/roleManager/notifications/list/${companyTypeId}`);
  }

  // Notification Templates (from notification_templates table via tzk-notifications)
  getNotificationTemplates(companyTypeId) {
    return http.get(`/notifyservice/api/templates?company_type_id=${companyTypeId}`);
  }
  createNotificationTemplate(data) {
    return http.post('/notifyservice/api/templates', data);
  }
  updateNotificationTemplate(id, data) {
    return http.put(`/notifyservice/api/templates/${id}`, data);
  }
  deleteNotificationTemplate(id) {
    return http.delete(`/notifyservice/api/templates/${id}`);
  }
}

export default new RoleManagerService();
