import rbacService from '../../services/rbac_services';
import {
  RBAC_SET_ROLES,
  RBAC_SET_ROLE_DETAIL,
  RBAC_SET_MENU_ACCESS,
  RBAC_SET_DASHBOARD_ACCESS,
  RBAC_SET_NOTIFICATION_CONFIG,
  RBAC_SET_REPORT_ACCESS,
  RBAC_SET_DATA_SCOPE,
  RBAC_SET_FIELD_VISIBILITY,
  RBAC_SET_LOADING,
  RBAC_SET_SAVING,
  RBAC_SET_DIRTY,
  RBAC_CLEAR_DIRTY,
} from '../actionTypes';

// List all roles for the company
export const listRbacRolesAction = () => async (dispatch) => {
  dispatch({ type: RBAC_SET_LOADING, payload: true });
  try {
    const res = await rbacService.listRoles();
    dispatch({ type: RBAC_SET_ROLES, payload: res.data?.data || res.data || [] });
  } catch (e) {
    console.error('listRbacRoles error:', e);
  } finally {
    dispatch({ type: RBAC_SET_LOADING, payload: false });
  }
};

// Get single role detail
export const getRbacRoleAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getRole(roleName);
    dispatch({ type: RBAC_SET_ROLE_DETAIL, payload: res.data?.data || res.data });
  } catch (e) {
    console.error('getRbacRole error:', e);
  }
};

// Create role
export const createRbacRoleAction = (data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.createRole(data);
    if (onSuccess) onSuccess(res.data);
    dispatch(listRbacRolesAction());
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Clone role
export const cloneRbacRoleAction = (sourceRole, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.cloneRole(sourceRole, data);
    if (onSuccess) onSuccess(res.data);
    dispatch(listRbacRolesAction());
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Update role metadata
export const updateRbacRoleAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateRole(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch(listRbacRolesAction());
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Delete role
export const deleteRbacRoleAction = (roleName, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.deleteRole(roleName);
    if (onSuccess) onSuccess(res.data);
    dispatch(listRbacRolesAction());
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Menu access (effective COALESCE permissions)
export const getMenuAccessAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getMenuAccess(roleName);
    dispatch({ type: RBAC_SET_MENU_ACCESS, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getMenuAccess error:', e);
  }
};

export const updateMenuAccessAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateMenuAccess(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'menus' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

export const resetMenuAccessAction = (roleName, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.resetMenuAccess(roleName);
    if (onSuccess) onSuccess(res.data);
    dispatch(getMenuAccessAction(roleName));
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Dashboard access
export const getDashboardAccessAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getDashboardAccess(roleName);
    dispatch({ type: RBAC_SET_DASHBOARD_ACCESS, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getDashboardAccess error:', e);
  }
};

export const updateDashboardAccessAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateDashboardAccess(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'dashboard' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Notification config
export const getNotificationConfigAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getNotificationConfig(roleName);
    dispatch({ type: RBAC_SET_NOTIFICATION_CONFIG, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getNotificationConfig error:', e);
  }
};

export const updateNotificationConfigAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateNotificationConfig(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'notifications' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Report access
export const getReportAccessAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getReportAccess(roleName);
    dispatch({ type: RBAC_SET_REPORT_ACCESS, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getReportAccess error:', e);
  }
};

export const updateReportAccessAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateReportAccess(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'reports' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Data scope
export const getDataScopeAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getDataScope(roleName);
    dispatch({ type: RBAC_SET_DATA_SCOPE, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getDataScope error:', e);
  }
};

export const updateDataScopeAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateDataScope(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'datascope' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Field visibility
export const getFieldVisibilityAction = (roleName) => async (dispatch) => {
  try {
    const res = await rbacService.getFieldVisibility(roleName);
    dispatch({ type: RBAC_SET_FIELD_VISIBILITY, payload: { roleName, data: res.data?.data || res.data || [] } });
  } catch (e) {
    console.error('getFieldVisibility error:', e);
  }
};

export const updateFieldVisibilityAction = (roleName, data, onSuccess, onError) => async (dispatch) => {
  dispatch({ type: RBAC_SET_SAVING, payload: true });
  try {
    const res = await rbacService.updateFieldVisibility(roleName, data);
    if (onSuccess) onSuccess(res.data);
    dispatch({ type: RBAC_CLEAR_DIRTY, payload: { roleName, section: 'fields' } });
  } catch (e) {
    if (onError) onError(e.response?.data || e.message);
  } finally {
    dispatch({ type: RBAC_SET_SAVING, payload: false });
  }
};

// Dirty tracking (local state changes)
export const setRbacDirtyAction = (roleName, section) => ({
  type: RBAC_SET_DIRTY,
  payload: { roleName, section },
});
