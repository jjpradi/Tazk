import React from 'react';
import PropTypes from 'prop-types';
import {
  createTheme,
  ThemeProvider,
} from '@mui/material/styles';
import {useThemeContext} from '../AppContextProvider/ThemeContextProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {responsiveFontSizes} from '@mui/material';

const AppThemeProvider = (props) => {
  const {theme} = useThemeContext();

  return (
    <ThemeProvider theme={responsiveFontSizes(createTheme(theme))}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {props.children}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AppThemeProvider;

AppThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
