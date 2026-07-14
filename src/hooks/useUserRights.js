import { useSelector } from 'react-redux';

export const useUserRights = () => {
  const navRights = useSelector(state => state.NavigationReducer.userRights);
  const oldRights = useSelector(state => state.roleReducer.user_rights);

  // Prefer NavigationReducer if loaded (object format)
  if (navRights && Object.keys(navRights).length > 0) {
    return navRights;
  }
  // Fallback to old array format
  return oldRights || [];
};

export const useHasRight = (rightName) => {
  const rights = useUserRights();
  if (!Array.isArray(rights)) {
    return !!rights[rightName];
  }
  return rights.some(item => item.right_name === rightName && item.value === true);
};

export const useMenuAction = (menuKey, action) => {
  const menuActions = useSelector(state => state.NavigationReducer.menuActions);
  if (!menuActions || !menuActions[menuKey]) return false;
  return !!menuActions[menuKey][action];
};

export const useMenuActions = (menuKey) => {
  const menuActions = useSelector(state => state.NavigationReducer.menuActions);
  if (!menuActions || !menuActions[menuKey]) {
    return { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false };
  }
  return menuActions[menuKey];
};

export const useDashboardWidget = (widgetKey) => {
  const widgets = useSelector(state => state.NavigationReducer.dashboardWidgets);
  if (!widgets || !widgets.length) return false;
  return widgets.some(w => w.widget_key === widgetKey && w.is_visible);
};

export const useDashboardWidgets = () => {
  return useSelector(state => state.NavigationReducer.dashboardWidgets) || [];
};

export const useDataScope = (menuKey) => {
  const dataScope = useSelector(state => state.NavigationReducer.dataScope);
  if (!dataScope || !dataScope[menuKey]) return 'all';
  return dataScope[menuKey];
};

export const useFieldVisibility = (menuKey, fieldKey) => {
  const fieldVisibility = useSelector(state => state.NavigationReducer.fieldVisibility);
  if (!fieldVisibility || !fieldVisibility[menuKey] || !fieldVisibility[menuKey][fieldKey]) {
    return { visible: true, editable: true };
  }
  return fieldVisibility[menuKey][fieldKey];
};

export const useIsFieldVisible = (menuKey, fieldKey) => {
  const { visible } = useFieldVisibility(menuKey, fieldKey);
  return visible;
};

export const useNotificationConfig = (notificationKey) => {
  const config = useSelector(state => state.NavigationReducer.notificationConfig);
  if (!config || !config[notificationKey]) {
    return { in_app: false, push: false, email: false, sms: false, whatsapp: false };
  }
  return config[notificationKey];
};
