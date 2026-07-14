import React from 'react';
import {useThemeContext} from '../../../../utility/AppContextProvider/ThemeContextProvider';
import {alpha, Box, Typography} from '@mui/material';
import Logo from '../../../../../assets/icon/logo.svg?react';
import LogoText from '../../../../../assets/icon/logo_text.svg?react';
import CompanyLogo from '../../../../../assets/user/logo.png';
import SalesPlayLogo from '../../../../../assets/user/Salesplay.png';
import TazkLogo from '../../../../../assets/user/Tazk-logo-horizontal.svg';
import {hostURL} from '../../../../../../src/http-common';


const AppLogo = () => {
  const {theme} = useThemeContext();

  return (
    <Box
      sx={{
        height: {xs: 56, sm: 70},
        padding: 2.5,
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          height: {xs: 40, sm: 45},
        },
      }}
      className='app-logo'
    >
      {/* <Logo fill={theme.palette.primary.main} /> */}
      <Box
        sx={{
          mt: 1,
          display: {xs: 'none', md: 'block'},
          '& svg': {
            height: {xs: 25, sm: 30},
          },
        }}
      >
         <Box style={{ justifyContent: 'center', alignItems: 'center' }}><img src={
          hostURL === 'erp.tazk.in' ? TazkLogo : TazkLogo
          // SalesPlayLogo
          } alt="Logo" style={{ height: 35, alignItem: 'center' }} /></Box>
        {/* <LogoText fill={alpha(theme.palette.text.primary, 0.8)} /> */}
      </Box>
    </Box>
  );
};

export default AppLogo;
