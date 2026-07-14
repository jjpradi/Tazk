import React, { useEffect } from 'react';
import { AppSuspense } from '../../index';
import {
  anonymousStructure,
  authorizedStructure,
  unAuthorizedStructure,
} from '../../../pages';
import AppFooter from '../AppLayout/components/AppFooter';
import AppErrorBoundary from '../AppErrorBoundary';
import generateRoutes from '../../utility/RouteGenerator';
import { useAuthUser } from '../../utility/AuthHooks';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import AppContentViewWrapper from './AppContentViewWrapper';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { initialUrl } from '../../../shared/constants/AppConst';
import { useSelector } from 'react-redux';
import Cookies from 'universal-cookie';
import Notifications from 'firebase/notifications';
import ToastMessage from 'firebase/toast_notify';
import Alertbox from 'pages/assets/alert';
import { toast } from 'react-toast';
import Notification from 'pages/common/notification';
import { getsessionStorage } from 'pages/common/login/cookies';
import { PartnerAdminApp, PartnerPortalApp } from 'pages/partnerPortal';
import DOMPurify from 'dompurify';

const AppContentView = ({ sxStyle }) => {
  // const[open,setOpen] = useState()
  const { user, isAuthenticated } = useAuthUser();
  const { modules = [] } = useSelector((state) => state.roleReducer.menus_id_get);
  const {
    NavigationReducer: {
      allowedRoutes: navAllowedRoutes,
      loaded: navigationLoaded,
    },
  } = useSelector(state => state)
  // const cookies =  new Cookies()
  const storage = getsessionStorage();
  const { modules: localModules = [] } = storage || {};

  /*
    FIXME
    This is a temporary solution for allowing followlist route
    for employee role in payroll company. Need to fix later.
  */
   const location = useLocation();
   const pathname = location.pathname;
    if (pathname.startsWith('/partner-admin')) {
    return (
      <Routes>
        <Route path="/partner-admin/*" element={<PartnerAdminApp />} />
      </Routes>
    );
  }
    if (pathname.startsWith('/partner')) {
    return (
      <Routes>
        <Route path="/partner/*" element={<PartnerPortalApp />} />
      </Routes>
    );
  }
  const routesAllowedForAll = ['/common/home', '/payroll/followlist', '/common/myaccount', '/payroll/form12', '/payroll/form16','/payroll/form12c', '/common/activity'];

  const getModules = modules.length ? modules : localModules;



  // Clear cached routesConfig whenever NavigationReducer data changes
  useEffect(() => {
    if (navigationLoaded && navAllowedRoutes.length) {
      sessionStorage.removeItem('routesConfig');
    }
  }, [navAllowedRoutes]);

  // Use NavigationReducer allowedRoutes (DB-driven, no frontend fallback)
  const activeAllowedRoutes = navigationLoaded && navAllowedRoutes.length
    ? navAllowedRoutes
    : null;

  if (activeAllowedRoutes) {
    if (!sessionStorage.getItem('routesConfig')) {
      let value = authorizedStructure.routes.filter((route) =>
        findNestedMatch(activeAllowedRoutes, route.path))
      sessionStorage.setItem('routesConfig', JSON.stringify(value));
    }
  }

  const routesConfigsession = sessionStorage.getItem('routesConfig') && JSON.parse(sessionStorage.getItem('routesConfig'));


  function findNestedMatch(dbRoutes, routePath) {
    const normalizePath = (path = '') => {
      const withoutQuery = String(path).split('?')[0];
      if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
        return withoutQuery.slice(0, -1);
      }
      return withoutQuery || '/';
    };

    const toPatternRegex = (pattern) => {
      const normalized = normalizePath(pattern);
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const withParams = escaped.replace(/\\:([A-Za-z0-9_]+)/g, '[^/]+');
      return new RegExp(`^${withParams}$`);
    };

    const normalizedRoutePath = normalizePath(routePath);

    for (let dbRoute of dbRoutes) {
      const normalizedDbRoute = normalizePath(dbRoute);

      if (normalizedDbRoute === normalizedRoutePath) {
        return true;
      }

      // Parent route permission should allow child routes.
      if (
        normalizedDbRoute !== '/' &&
        normalizedRoutePath.startsWith(`${normalizedDbRoute}/`)
      ) {
        return true;
      }

      // Support dynamic route templates from DB, e.g. /crm/leads/:lead_id/convert
      if (
        normalizedDbRoute.includes('/:') &&
        toPatternRegex(normalizedDbRoute).test(normalizedRoutePath)
      ) {
        return true;
      }

      if (normalizedDbRoute.startsWith('/comingSoon')) {
        return '/comingSoon';
      }
    }

    return false;
  }

  const newConfigs = authorizedStructure.routes.filter((route) =>
    activeAllowedRoutes
      ? findNestedMatch(activeAllowedRoutes, route.path) || routesAllowedForAll.includes(route.path)
      : routesConfigsession || routesAllowedForAll.includes(route.path)
  );

  // const newConfigs = authorizedStructure.routes.filter(
  //   (r) =>
  //    ( routesConfigFromDB.length ? routesConfigFromDB[0].children.some((s)=> r.path === s.url)  : getModules.some((m) => r.parentName === m.module_name)) ||
  //     routesAllowedForAll.includes(r.path), 
  // );
  const newAuthorizedStructure = { ...authorizedStructure, routes: newConfigs };

  // const toastTrigger = (title, body) => {
  //   toast(
  //     <div>
  //       {title} <br />
  //        {body} 
  //     </div>,{allowHtml: true }
  //   );
  // };

  const toastTrigger = (title, body) => {
    toast(

      <div>
        {title} <br />
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} />

      </div>, {
      backgroundColor: "#0A8FDC",
      color: 'white'
    }

    );
  };

  return (
    <AppContentViewWrapper className='app-content-view'>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto',
          px: '10px',
          py: '0px',
          // p: {xs: 5, md: 3.5, xl: 12.5},
          // paddingTop: {xs: 5, md: 1, xl: 12.5},
          ...sxStyle,
          // paddingBottom:{xs: 5, md: 2.5, xl: 10.5}
          // height:'900px'
        }}
        className='app-content'
      >
        <Notifications toastTrigger={toastTrigger} />
        <Link to='/NotificationView'>
          <ToastMessage />
        </Link>
        <Alertbox />
        <AppSuspense>
          <AppErrorBoundary>
            {generateRoutes({
              isAuthenticated: isAuthenticated,
              userRole: user?.role,
              unAuthorizedStructure,
              authorizedStructure: newAuthorizedStructure,
              anonymousStructure,
            })}
            <Routes>
              <Route path="/partner-admin/*" element={<PartnerAdminApp />} />
              <Route path='/' element={<Navigate to={isAuthenticated ? initialUrl : '/signin'} />} />
              <Route path='*' element={null} />
            </Routes>
          </AppErrorBoundary>
        </AppSuspense>
      </Box>
      <AppFooter />
    </AppContentViewWrapper>
  );
};

export default AppContentView;

AppContentView.propTypes = {
  sxStyle: PropTypes.object,
};

