import React from 'react';
import Box from '@mui/material/Box';
import AuthWrapper from '../AuthWrapper';
import SigninFirebase from './SigninFirebase';
import AppLogo from '../../../../@crema/core/AppLayout/components/AppLogo';
import SalesPlayLogo from '../../../../assets/user/Salesplay.png';
import TazkLogo from '../../../../assets/user/Tazk-logo-horizontal.svg';
import {hostURL} from '../../../../http-common';
import { useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

const Signin = () => {
  const location = useLocation();
  
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get('username');
    const password = searchParams.get('password');
    return { username, password };
  };
  const { username, password } = getQueryParams();
  const initialSubscriptionLoginPage = (username && password)
  
  return (
    <>
      {/* {username && password ? ( */}
       {/* <Box 
       sx={{ 
         width: '100%', 
         height: '100vh', // Full height for centering
         display: 'flex', 
         justifyContent: 'center', 
         alignItems: 'center' 
       }}
     >
       <CircularProgress />
     </Box> */}
        
      {/* ) : ( */}
      {!initialSubscriptionLoginPage && (
        <AuthWrapper>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: { xs: 6, xl: 8 } ,display:'flex',justifyContent:'center'}}>
              <Box
                sx={{
                  mb: 5,
                  display: 'flex',
                  alignContent: 'center',
                }}
              >
                {/* <AppLogo /> */}
                <Box style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}><img src={hostURL === 'erp.tazk.in' ? TazkLogo : TazkLogo} alt="Logo" style={{ alignContent: 'center', width: 150 }} />
                </Box>
              </Box>
            </Box>

            <SigninFirebase />
          </Box>
        </AuthWrapper>
      )}

      {initialSubscriptionLoginPage && (
        <>
          <SigninFirebase />
        </>
      )}
     {/* )} */}
    </>
  );
};

export default Signin;
