import React from 'react';
import Logo from '../../../assets/icon/something-wrong.svg?react';
import {useTheme} from '@mui/material';

const ErrorIcon = () => {
  const theme = useTheme();
  return <Logo fill={theme.palette.primary.main} />;
};

export default ErrorIcon;
