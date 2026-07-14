import PropTypes from 'prop-types';
import React, { memo } from 'react';

const AppAnimate = ({ children }) => {
  return <>{children}</>;
};

AppAnimate.propTypes = {
  children: PropTypes.element.isRequired,
};

export default memo(AppAnimate);
