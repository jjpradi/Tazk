import http from '../http-common';

class superAdminService {
    // getAll() {
    //     return http.get('/superAdmin');
    // }
    getCompanyDetails(data) {
        return http.post('/superAdmin/getCompanyDetails', data);
    }

    updateSubscription(data) {
        return http.post('/superAdmin/update/subscriptionDate', data);
    }

    getApprovestatus(id) {
        return http.post(`/grProduct/getApproveStatus`, id);
    }
    getRejectedRequest(data) {
        return http.post(`/superAdmin/getRejectedRequest`, data);
    }

    updateDetails(data) {
        return http.put(`/superAdmin/updateCompanyDetails`, data);
    }
    getSubscription(id) {
        return http.get(`/superAdmin/getSubscriptionRecords/${id}`);
    }
    getShopType() {
        return http.get(`/superAdmin/getshopType`);
    }
    insertManualPaymentDetails(data) {
        return http.post('/Subscription/superAdmin/manualPayment', data);
    }
    getDashboardData() {
        return http.get('/superAdmin/dashboard');
    }
    getAnalyticsData() {
        return http.get('/superAdmin/analytics');
    }
    bulkExtend(data) {
        return http.post('/superAdmin/bulk/extend', data);
    }
    bulkChangePlan(data) {
        return http.post('/superAdmin/bulk/changePlan', data);
    }
    getCompaniesByType(data) {
        return http.post('/superAdmin/getCompaniesByType', data);
    }
    getCompanyTypeCounts() {
        return http.get('/superAdmin/getCompanyTypeCounts');
    }
    getAuditLogs() {
        return http.get('/superAdmin/auditLogs');
    }
    getCompanyOverview(companyId) {
        return http.get(`/superAdmin/company/${companyId}/overview`);
    }
    getCompanyEmployees(companyId) {
        return http.get(`/superAdmin/company/${companyId}/employees`);
    }
    getCompanySubscriptionHistory(companyId) {
        return http.get(`/superAdmin/company/${companyId}/subscriptionHistory`);
    }
    getCompanyTimeline(companyId) {
        return http.get(`/superAdmin/company/${companyId}/timeline`);
    }
    getCompanyConfig(companyId) {
        return http.get(`/superAdmin/company/${companyId}/config`);
    }
    updateCompanyConfig(companyId, data) {
        return http.put(`/superAdmin/company/${companyId}/config`, data);
    }
    changeCompanyPlan(companyId, data) {
        return http.post(`/superAdmin/company/${companyId}/changePlan`, data);
    }
    extendSubscription(companyId, data) {
        return http.post(`/superAdmin/company/${companyId}/extend`, data);
    }
    deactivateCompany(companyId) {
        return http.post(`/superAdmin/company/${companyId}/deactivate`);
    }
    reactivateCompany(companyId) {
        return http.post(`/superAdmin/company/${companyId}/reactivate`);
    }
    addCompanyNote(companyId, data) {
        return http.post(`/superAdmin/company/${companyId}/note`, data);
    }
    globalSearch(q) {
        return http.get(`/superAdmin/search?q=${encodeURIComponent(q)}`);
    }
    getCompanyHealth(companyId) {
        return http.get(`/superAdmin/company/${companyId}/health`);
    }
    // Settings / RBAC
    getRoles() {
        return http.get('/superAdmin/settings/roles');
    }
    createRole(data) {
        return http.post('/superAdmin/settings/roles', data);
    }
    renameRole(roleId, data) {
        return http.put(`/superAdmin/settings/roles/${roleId}`, data);
    }
    deleteRole(roleId) {
        return http.delete(`/superAdmin/settings/roles/${roleId}`);
    }
    getAllRights() {
        return http.get('/superAdmin/settings/rights');
    }
    getRoleRights(roleName) {
        return http.get(`/superAdmin/settings/roles/${encodeURIComponent(roleName)}/rights`);
    }
    updateRoleRights(roleName, data) {
        return http.put(`/superAdmin/settings/roles/${encodeURIComponent(roleName)}/rights`, data);
    }
    getRoleMenus(roleName) {
        return http.get(`/superAdmin/settings/roles/${encodeURIComponent(roleName)}/menus`);
    }
    updateRoleMenus(roleName, data) {
        return http.put(`/superAdmin/settings/roles/${encodeURIComponent(roleName)}/menus`, data);
    }
    getSAUsers() {
        return http.get('/superAdmin/settings/users');
    }
    createSAUser(data) {
        return http.post('/superAdmin/settings/users', data);
    }
    updateUserRole(employeeId, data) {
        return http.put(`/superAdmin/settings/users/${employeeId}/role`, data);
    }
    // Notifications
    getSANotifications(page = 0, limit = 20) {
        return http.get(`/superAdmin/notifications?page=${page}&limit=${limit}`);
    }
    getSAUnreadCount() {
        return http.get('/superAdmin/notifications/unread-count');
    }
    markSANotificationRead(id) {
        return http.put(`/superAdmin/notifications/${id}/read`);
    }
    markAllSANotificationsRead() {
        return http.put('/superAdmin/notifications/read-all');
    }
    dismissSANotification(id) {
        return http.delete(`/superAdmin/notifications/${id}`);
    }
    getAlertRules() {
        return http.get('/superAdmin/notifications/settings');
    }
    updateAlertRule(ruleId, data) {
        return http.put(`/superAdmin/notifications/settings/${ruleId}`, data);
    }
    // Advanced Analytics
    getRevenueOverview() {
        return http.get('/superAdmin/analytics/revenue');
    }
    getCohortData() {
        return http.get('/superAdmin/analytics/cohorts');
    }
    getLTVData() {
        return http.get('/superAdmin/analytics/ltv');
    }
    // Tags
    getAllTags() {
        return http.get('/superAdmin/communications/tags');
    }
    createTag(data) {
        return http.post('/superAdmin/communications/tags', data);
    }
    deleteTag(tagId) {
        return http.delete(`/superAdmin/communications/tags/${tagId}`);
    }
    getCompanyTags(companyId) {
        return http.get(`/superAdmin/communications/company/${companyId}/tags`);
    }
    addCompanyTag(companyId, data) {
        return http.post(`/superAdmin/communications/company/${companyId}/tags`, data);
    }
    removeCompanyTag(companyId, tagId) {
        return http.delete(`/superAdmin/communications/company/${companyId}/tags/${tagId}`);
    }
    // Communications
    getCommunications(companyId, page = 0, limit = 30) {
        return http.get(`/superAdmin/communications/company/${companyId}/communications?page=${page}&limit=${limit}`);
    }
    logCommunication(companyId, data) {
        return http.post(`/superAdmin/communications/company/${companyId}/communications`, data);
    }
    // Follow-ups
    getAllFollowUps() {
        return http.get('/superAdmin/communications/follow-ups');
    }
    getTodayFollowUps() {
        return http.get('/superAdmin/communications/follow-ups/today');
    }
    getCompanyFollowUps(companyId) {
        return http.get(`/superAdmin/communications/company/${companyId}/follow-ups`);
    }
    createFollowUp(companyId, data) {
        return http.post(`/superAdmin/communications/company/${companyId}/follow-ups`, data);
    }
    updateFollowUp(id, data) {
        return http.put(`/superAdmin/communications/follow-ups/${id}`, data);
    }
    deleteFollowUp(id) {
        return http.delete(`/superAdmin/communications/follow-ups/${id}`);
    }
    // Onboarding
    getOnboardingOverview() {
        return http.get('/superAdmin/onboarding/overview');
    }
    getOnboardingCompanies(page = 0, limit = 30, status = 'all') {
        return http.get(`/superAdmin/onboarding/companies?page=${page}&limit=${limit}&status=${status}`);
    }
    getCompanyOnboarding(companyId) {
        return http.get(`/superAdmin/onboarding/company/${companyId}`);
    }
    markOnboardingMilestone(companyId, milestoneId, data) {
        return http.put(`/superAdmin/onboarding/company/${companyId}/milestone/${milestoneId}`, data);
    }
    triggerOnboardingScan() {
        return http.post('/superAdmin/onboarding/scan');
    }
    scanCompanyOnboarding(companyId) {
        return http.post(`/superAdmin/onboarding/company/${companyId}/scan`);
    }
}

export default new superAdminService();