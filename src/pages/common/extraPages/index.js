import React from 'react';
import {RoutePermittedRole} from 'shared/constants/AppConst';
import Account from './Account';

export const extraPagesConfigs = [
  {
    permittedRole: RoutePermittedRole.user,
    path: '/common/my-account',
    element: <Account />,
  },
];
