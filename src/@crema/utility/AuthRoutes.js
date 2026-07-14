import React, { useEffect } from 'react';
import {AppLoader} from '../index';
import PropTypes from 'prop-types';
import {useAuthUser} from './AuthHooks';
import { useLocation } from 'react-router-dom';

const AuthRoutes = ({children}) => {
  const {isLoading} = useAuthUser();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return isLoading ? <AppLoader /> : <>{children}</>;
};

export default AuthRoutes;

AuthRoutes.propTypes = {
  children: PropTypes.node.isRequired,
};
