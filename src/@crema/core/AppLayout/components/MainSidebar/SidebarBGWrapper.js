import React from 'react';
import PropsTypes from 'prop-types';
import Box from '@mui/material/Box';
import {useSidebarContext} from '../../../../utility/AppContextProvider/SidebarContextProvider';

const SidebarBgWrapper = ({children}) => {
  const {
    sidebarBgColor,
    sidebarTextColor,
  } = useSidebarContext();
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: sidebarBgColor,
        color: sidebarTextColor,
        '& > *': {
          position: 'relative',
          zIndex: 3,
        },
      }}
    >
      {children}
    </Box>
  );
};

export default SidebarBgWrapper;

SidebarBgWrapper.propTypes = {
  children: PropsTypes.node,
};
