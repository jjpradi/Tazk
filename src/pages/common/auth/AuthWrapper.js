import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {Typography} from '@mui/material';
import {Fonts} from '../../../shared/constants/AppEnums';
import { titleURL } from 'http-common';

const AuthWrapper = ({ children }) => {
  
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get('username');
    const password = searchParams.get('password');
    return { username, password };
  };
  const { username, password } = getQueryParams();
  const initialSubscriptionLoginPage = (username && password)
  return (
    !initialSubscriptionLoginPage && (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          minHeight: {xs: 320, sm: 450},
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: {xs: '100%', sm: '50%', lg: '40%'},
            padding: {xs: 5, lg: 10},
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            width: {xs: '100%', sm: '50%', lg: '60%'},
            position: 'relative',
            padding: {xs: 5, lg: 10},
            display: {xs: 'none', sm: 'flex'},
            alignItems: {sm: 'center'},
            justifyContent: {sm: 'center'},
            flexDirection: {sm: 'column'},
            backgroundColor: (theme) => theme.palette.grey[900],
            color: (theme) => theme.palette.common.white,
            fontSize: 14,
          }}
        >
          <Box
            sx={{
              maxWidth: 320,
            }}
          >
            <Typography
              component='h2'
              sx={{
                fontWeight: Fonts.BOLD,
                fontSize: 26,
                mb: 4,
              }}
            >
              {`Welcome to ${titleURL}!`}
            </Typography>
            <Typography>
              {'We Elevate Your Business.'}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
    )
  );
};

export default AuthWrapper;

AuthWrapper.propTypes = {
  children: PropTypes.node,
};
