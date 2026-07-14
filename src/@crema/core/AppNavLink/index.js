import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const AppNavLink = ({ activeClassName, className, ...rest }) => {
  return (
    <NavLink
      {...rest}
      className={({ isActive }) => (isActive ? `${activeClassName} ${className}` : className)}
    />
  );
};

export default AppNavLink;
AppNavLink.propTypes = {
  activeClassName: PropTypes.any,
  className: PropTypes.any,
};
