import React from 'react';
import {Box, Typography} from '@mui/material';
import IntlMessages from '@crema/utility/IntlMessages';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import ChangePasswordForm from './ChangePasswordForm';
import {Formik} from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  oldPassword: yup
    .string()
    .required('Password is required.')
    .min(6, 'Password must be at least 6 characters long.')
    .matches(/^\S*$/, 'Password must not contain spaces.'),
  newPassword: yup
    .string()
    .required('Password is required.')
    .min(6, 'Password must be at least 6 characters long.')
    .matches(/^\S*$/, 'Password must not contain spaces.'),
  retypeNewPassword: yup
    .string()
    .required('Please re-enter password.')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match.'),
});

const ChangePassword = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
      }}
    >
      <Typography
        component='h3'
        sx={{
          fontSize: 16,
          fontWeight: Fonts.BOLD,
          mb: {xs: 3, lg: 5},
        }}
      >
        <IntlMessages id='common.changePassword' />
      </Typography>
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{
          oldPassword: '',
          newPassword: null,
          retypeNewPassword: 'us',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting}) => {
          setSubmitting(true);
          //TODO Api Call here to save user info
          setSubmitting(false);
        }}
      >
        <ChangePasswordForm />
      </Formik>
    </Box>
  );
};

export default ChangePassword;
