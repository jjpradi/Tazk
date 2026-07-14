import React, { useEffect, useMemo } from 'react';
import List from '@mui/material/List';

import NavVerticalGroup from './VerticalNavGroup';
import VerticalCollapse from './VerticalCollapse';
import VerticalItem from './VerticalItem';
import { useDispatch, useSelector } from 'react-redux';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getNavigationBootstrapAction } from 'redux/actions/navigation_actions';
import { useLocation } from 'react-router-dom';
import { resetDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import * as icons from '../../../../../pages/routesIcons';

const VerticalNav = () => {
  const {
    NavigationReducer: {
      menus: navigationMenus,
      loaded: navigationLoaded,
      subscriptionExpired,
    },
    DashboardRoleReducer : {
      dashboardPollTimerIds
    },
    appConfigReducer: {
      app_config_data
    }
   } = useSelector(state => state)

   const location = useLocation();
   let storage = getsessionStorage();
  const dispatch = useDispatch();

  useEffect(() => {
    const payload = {
      companyType: storage.company_type,
      subscriptionType: storage.subscription_type,
      type: 'web'
    }
    if (storage?.company_type === 13) return;
    dispatch(getNavigationBootstrapAction(payload));
    dispatch(getAppConfigDataAction(null, null));
  }, [])

  // Build a lookup from app config array: { 'qr.attendance': 'true', ... }
  const appConfigMap = useMemo(() => {
    if (!Array.isArray(app_config_data)) return {};
    return app_config_data.reduce((acc, item) => {
      if (item.key_name) acc[item.key_name] = item.value;
      return acc;
    }, {});
  }, [app_config_data]);

  const addIcons = (items) => {
    return items.map(item => {
      const Icon = icons[item.iconName];
      const newItem = { ...item };
      if (Icon) {
        newItem.icon = typeof Icon === 'object'
          ? <Icon style={{ color: '#5d6057' }} height={10} width={10}/>
          : <img src={Icon} height={20} style={{ filter: 'invert(34%) sepia(5%) saturate(338%) hue-rotate(46deg) brightness(92%) contrast(85%)' }} />;
      }
      if (newItem.type === 'collapse' && newItem.children?.length) {
        newItem.children = addIcons(newItem.children);
      }
      return newItem;
    });
  };

  // Map of menu messageIds that should only show when the corresponding module is present
  const featureModuleMap = {
    'Live Location': 'Live Location',
    'QR Attendance': 'QR Generator',
    'QR Generator': 'QR Generator',
    'Manual Attendance': 'Manual Attendance',
    'Face Attendance': 'Face Attendance',
    'Selfie Attendance': 'Selfie Attendance',
    'Offline Attendance': 'Offline Attendance'
  };

  // Map of menu messageIds to their app config key_name (dot notation as stored in DB)
  const featureConfigMap = {
    'Live Location': 'company.enableLiveLocation',
    'QR Attendance': 'qr.attendance',
    'QR Generator': 'qr.attendance',
    'Manual Attendance': 'manual.attendance',
    'Face Attendance': 'offline.attendance',
    'Offline Attendance': 'offline.attendance'
  };

  const filterMenusByModules = (children) => {
    console.log(children,"childerd value data")
    const userModules = storage?.modules || [];
    const moduleNames = userModules.map(m => m.module_name);

    return children.filter(item => {
      // Check app config toggle — if explicitly disabled, hide the menu
      const configKey = featureConfigMap[item.messageId];
      if (configKey && appConfigMap[configKey] === 'false') {
        return false;
      }

      // If config says enabled, skip the module check for this item (module may not be synced yet)
      if (configKey && appConfigMap[configKey] === 'true') {
        // Feature is enabled in config — allow it
      } else {
        // For items not in featureConfigMap or config not loaded yet, fall back to module check
        const requiredModule = featureModuleMap[item.messageId];
        if (requiredModule && !moduleNames.includes(requiredModule)) {
          return false;
        }
      }

      // Also filter children of collapse items
      if (item.type === 'collapse' && item.children?.length) {
        item.children = filterMenusByModules(item.children);
      }
      return true;
    });
  };

  const routesConfig = useMemo(() => {
    // Only render menus from the API (DB-driven)
    if (navigationLoaded && navigationMenus.length) {
      const menus = JSON.parse(JSON.stringify(navigationMenus));
      if (menus[0]?.children?.length) {
        menus[0].children = addIcons(menus[0].children);
        menus[0].children = filterMenusByModules(menus[0].children);
      }
      return menus;
    }

    // Return empty while loading — no hardcoded fallback
    return [];
  }, [navigationMenus, navigationLoaded, storage?.modules, appConfigMap]);

  // Clear dashboard polling intervals when navigating away
  if (dashboardPollTimerIds.length) {
    if (location.pathname !== '/common/home') {
      dashboardPollTimerIds.forEach(timerId => clearInterval(timerId));
      dispatch(resetDashboardPollingTimerIdsAction());
    }
  }

  // Hide sidebar when subscription is expired or no menus loaded
  if (subscriptionExpired || !routesConfig.length || !routesConfig[0]?.children?.length) {
    return (
      <List sx={{ position: 'relative', padding: 0 }} component='div'></List>
    );
  }

  return (
    <List
      sx={{
        position: 'relative',
        padding: 0,
      }}
      component='div'
    >
      {routesConfig.map((item, idx) => (
        <React.Fragment key={`${item.id ?? 'root'}-${item.messageId ?? item.url ?? 'menu'}-${idx}`}>
          {item.type === 'group' && <NavVerticalGroup item={item} level={0} />}
          {item.type === 'collapse' && <VerticalCollapse item={item} level={0} />}
          {(item.type === 'item' || item.type === 'panel-item') && <VerticalItem item={item} level={0} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default VerticalNav;
