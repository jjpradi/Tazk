import React from 'react';
import PropsTypes from 'prop-types';
import {Box} from '@mui/material';

const AppContentViewWrapper = ({children, ...rest}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        minHeight: '100vh',
        maxWidth: {xl: 3750},
        mx: {xl: 'auto'},
        width: {xl: '100%'},
        color: theme => theme.palette.grey['800']
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default AppContentViewWrapper;

AppContentViewWrapper.propTypes = {
  children: PropsTypes.node,
};
