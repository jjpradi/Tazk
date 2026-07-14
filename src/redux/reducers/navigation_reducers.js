import { NAVIGATION_BOOTSTRAP } from '../actionTypes';

const initialState = {
  menus: [],
  userRights: {},
  allowedRoutes: [],
  menuActions: {},
  dashboardWidgets: [],
  notificationConfig: {},
  dataScope: {},
  fieldVisibility: {},
  subscriptionExpired: false,
  loaded: false,
};

function NavigationReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case NAVIGATION_BOOTSTRAP:
      return {
        ...state,
        menus: payload.menus || [],
        userRights: payload.userRights || {},
        allowedRoutes: payload.allowedRoutes || [],
        menuActions: payload.menuActions || {},
        dashboardWidgets: payload.dashboardWidgets || [],
        notificationConfig: payload.notificationConfig || {},
        dataScope: payload.dataScope || {},
        fieldVisibility: payload.fieldVisibility || {},
        subscriptionExpired: payload.subscriptionExpired || false,
        loaded: true,
      };
    case 'RESET_STORE':
      return initialState;
    default:
      return state;
  }
}

export default NavigationReducer;
