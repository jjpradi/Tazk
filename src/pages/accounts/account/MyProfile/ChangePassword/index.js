import React,{useContext} from 'react';
import {Box, Typography} from '@mui/material';
import IntlMessages from '@crema/utility/IntlMessages';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import ChangePasswordForm from './ChangePasswordForm';
import {Formik} from 'formik';
import * as yup from 'yup';
import { changepasswordAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {useSelector, useDispatch} from 'react-redux';

const validationSchema = yup.object({
  oldPassword: yup
    .string()
    .required('Password is required.'),
  newPassword: yup
    .string()
    .when('oldPassword', (oldPassword, schema) => {
      return oldPassword ? schema.required('Password is required.')
        .min(6, 'Password must be at least 6 characters long.')
        .matches(/^\S*$/, 'Password must not contain spaces.') : schema;
    }),
  retypeNewPassword: yup
    .string()
    .when(['oldPassword', 'newPassword'], (oldPassword, newPassword, schema) => {
      return (oldPassword || newPassword) ? schema.required('Please re-enter password.') : schema;
    })
  .oneOf([yup.ref('newPassword'), null], 'Passwords must match.')

});


const ChangePassword = () => {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
        p: { xs: 2, md: 3, lg: 4 },
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
          newPassword: '',
          retypeNewPassword: '',
          employee_id: commoncookie,
          // company_id: 
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting, resetForm}) => {
          setSubmitting(true);
          dispatch(
            changepasswordAction(
              data,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
          );
          resetForm()
          setSubmitting(false);
        }}
      >
        {() => <ChangePasswordForm />}
      </Formik>
    </Box>
  );
};

export default ChangePassword;
