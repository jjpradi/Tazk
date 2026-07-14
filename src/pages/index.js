import {authRouteConfig} from './common/auth';
import {initialUrl} from 'shared/constants/AppConst';
import {Navigate} from 'react-router-dom';
import Error403 from './common/errorPages/Error403';
import React from 'react';
import {errorPagesConfigs} from './common/errorPages';
import {samplePagesConfigs} from './sales/sample';
import {extraPagesConfigs} from './common/extraPages';
import {allRoutesConfigs} from './allRoutes';

const authorizedStructure = {
  fallbackPath: '/signin',
  unAuthorizedComponent: <Error403 />,
  routes: [...allRoutesConfigs],
};

const unAuthorizedStructure = {
  fallbackPath: initialUrl,
  routes: authRouteConfig,
};

const anonymousStructure = {
  routes: errorPagesConfigs.concat([
    {
      path: '*',
      // element: <Navigate to='/error-pages/error-404' />,
      element: <Navigate to='/signin' />,

    },
  ]),
};

export {authorizedStructure, unAuthorizedStructure, anonymousStructure};
