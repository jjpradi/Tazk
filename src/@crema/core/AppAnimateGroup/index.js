import PropTypes from 'prop-types';
import React, { memo } from 'react';

const AppAnimateGroup = ({ children }) => {
  return <>{children}</>;
};

AppAnimateGroup.propTypes = {
  children: PropTypes.any,
};

export default memo(AppAnimateGroup);
