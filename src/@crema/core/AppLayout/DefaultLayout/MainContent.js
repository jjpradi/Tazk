import React from 'react';
import {Box, useMediaQuery} from '@mui/material';
import PropsTypes from 'prop-types';

const MainContent = ({children, ...rest}) => {
  const Lgscreen = useMediaQuery((theme) => theme.breakpoints.down('1199'));

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        width: {xs: '100%', lg: `calc(100% - 280px)`},
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.5s ease',
        ml: Lgscreen ? '' : '280px',
        overflow: 'hidden',
      }}
      className='mainContent'
      {...rest}
    >
      {children}
    </Box>
  );
};

export default MainContent;

MainContent.propTypes = {
  children: PropsTypes.node,
};
