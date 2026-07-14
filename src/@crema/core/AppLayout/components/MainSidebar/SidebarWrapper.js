import React from 'react';
import {Box} from '@mui/material';
import PropsTypes from 'prop-types';

const SidebarWrapper = ({children, sxProps, ...rest}) => {
  return (
    <Box
      sx={(theme) => ({
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
        position: {xs: 'relative', lg: 'fixed'},
        borderRight: `1px solid ${theme.palette.divider}`,
        top: 0,
        left: 0,
        zIndex: 1101,
        width: 280,
        height: '100vh',
        transition: 'all 0.4s ease',
        ...sxProps,
      })}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default SidebarWrapper;

SidebarWrapper.propTypes = {
  children: PropsTypes.node,
  sxProps: PropsTypes.object,
};
