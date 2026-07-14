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

const initialState = {
  roles: [],
  roleDetail: null,
  menuAccess: {},      // { [roleName]: [...] }
  dashboardAccess: {}, // { [roleName]: [...] }
  notificationConfig: {},
  reportAccess: {},
  dataScope: {},
  fieldVisibility: {},
  loading: false,
  saving: false,
  dirty: {},           // { [roleName]: { menus: bool, dashboard: bool, ... } }
};

const rbacReducer = (state = initialState, action) => {
  switch (action.type) {
    case RBAC_SET_ROLES:
      return { ...state, roles: action.payload };

    case RBAC_SET_ROLE_DETAIL:
      return { ...state, roleDetail: action.payload };

    case RBAC_SET_MENU_ACCESS:
      return {
        ...state,
        menuAccess: { ...state.menuAccess, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_DASHBOARD_ACCESS:
      return {
        ...state,
        dashboardAccess: { ...state.dashboardAccess, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_NOTIFICATION_CONFIG:
      return {
        ...state,
        notificationConfig: { ...state.notificationConfig, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_REPORT_ACCESS:
      return {
        ...state,
        reportAccess: { ...state.reportAccess, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_DATA_SCOPE:
      return {
        ...state,
        dataScope: { ...state.dataScope, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_FIELD_VISIBILITY:
      return {
        ...state,
        fieldVisibility: { ...state.fieldVisibility, [action.payload.roleName]: action.payload.data },
      };

    case RBAC_SET_LOADING:
      return { ...state, loading: action.payload };

    case RBAC_SET_SAVING:
      return { ...state, saving: action.payload };

    case RBAC_SET_DIRTY: {
      const { roleName, section } = action.payload;
      return {
        ...state,
        dirty: {
          ...state.dirty,
          [roleName]: { ...(state.dirty[roleName] || {}), [section]: true },
        },
      };
    }

    case RBAC_CLEAR_DIRTY: {
      const { roleName, section } = action.payload;
      const roleDirty = { ...(state.dirty[roleName] || {}) };
      delete roleDirty[section];
      return {
        ...state,
        dirty: { ...state.dirty, [roleName]: roleDirty },
      };
    }

    default:
      return state;
  }
};

export default rbacReducer;
