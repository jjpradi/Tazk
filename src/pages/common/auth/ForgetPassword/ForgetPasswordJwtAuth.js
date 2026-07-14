import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage  } from 'formik';
import * as yup from 'yup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppTextField from '@crema/core/AppFormComponents/AppTextField';
import IntlMessages from '@crema/utility/IntlMessages';
import AuthWrapper from '../AuthWrapper';
import AppLogo from '../../../../@crema/core/AppLayout/components/AppLogo';
import { useDispatch } from 'react-redux';
import { fetchStart, fetchError, fetchSuccess } from 'redux/actions';
import login_services from 'services/login_services';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {Link} from 'react-router-dom';

// Validation schemas for each step
const validationSchemas = {
  sendOtp: yup.object({
    userName: yup
      .string()
      .required('Username is required'),
  }),
  verifyOtp: yup.object({
    otp: yup
      .string()
      .matches(/^[0-9]{6}$/, "OTP must be a 6-digit number")
      .required('OTP is required'),
  }),
  resetPassword: yup.object({
    new_password: yup
      .string()
      .required('Password is required.')
      .min(6, 'Password must be at least 6 characters long.')
      .matches(/^\S*$/, 'Password must not contain spaces.'),
    confirm_new_password: yup
      .string()
      .required('Confirm password is required.')
      .oneOf([yup.ref('new_password'), null], 'Passwords must match.'),
  }),
  emailValidation: yup.object({
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
  }),
};

const ForgetPasswordJwtAuth = () => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState('sendOtp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [userInfo, setuserInfo] = useState([]);
  const [error, setError] = useState(null);
  const [success, setsuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const sendOtp = async (values) => {
    dispatch(fetchStart());
    setError(null)
    const data = { user_name: values.userName };

    try {
      const response = await login_services.sendForgetOtp(data);
      
   if (response?.data?.status === 401) {
        if (response?.data?.msg === 'No Mail found! Contact Admin to reset the password') {
          setUserName(values?.userName);
          setOpenDialog(true);
        } else {
          setError(response?.data?.msg);
        }
      } else if (response.data.status === 200) {
        setsuccess(response.data.msg)
        setCurrentStep('verifyOtp');
          setUserName(values.userName);
      } else {
         setError(response.data.msg);
      }
    } catch (error) {
      setError('Failed to send OTP');
    } finally {
      dispatch(fetchSuccess());
    }
  };

  const verifyOtp = async (values) => {
    dispatch(fetchStart());
    setError(null)
    const data = { user_name: userName, otp: values.otp };

    try {
      const response = await login_services.verifyForetOtp(data);
      
      if (response.data.status === 200) {
        setCurrentStep('resetPassword');
        setuserInfo(response.data.data)
        setsuccess(response.data.msg)
      } else {
        setError(response.data.msg);
      }
    } catch (error) {
      setError('Failed to verify OTP');
    } finally {
      dispatch(fetchSuccess());
    }
  };

  const updatePassword = async (values) => {
    dispatch(fetchStart());
    setError(null)
    const data = { 
      confirm_new_password: values.confirm_new_password,
      new_password: values.new_password,
      person_id : userInfo.person_id 
    };

    try {
      const response = await login_services.updatePassword(data);
      // console.log("response",response);
      const signInPath = '/signin';
      if (response.data.status === 200) {
        setsuccess(response.data.msg)
        window.location.replace(`${window.location.origin}${signInPath}`);
      } else {
        setError(response.data.msg);
      }
    } catch (error) {
      setError('Failed to update password');
    } finally {
      dispatch(fetchSuccess());
    }
  };

  const userEmailUpdate = async (values) => {
    dispatch(fetchStart());
    setError(null)
    const data = {
      email: values.email,
      username: userName
    };

    try {
      const response = await login_services.userEmailUpdate(data);
      if (response?.data?.status === 200) {
        setsuccess(response?.data?.message)
        setOpenDialog(false);
      } else {
        setOpenDialog(false);
        setError(response?.data?.msg);
      }
    } catch (error) {
      setError('Failed to update password');
    } finally {
      dispatch(fetchSuccess());
    }
  };

// console.log("userInfo",userInfo);


  return (
    <>
      {error && (
        <Alert severity='error' sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{mb: 2}}>
          {success}
        </Alert>
      )}
      <AuthWrapper>
        <Box sx={{width: '100%'}}>
          <Box sx={{mb: {xs: 8, xl: 10}}}>
            {/* <AppLogo /> */}
            {/* <Box sx={{mb: {xs: 8, xl: 10}}}>
          <Box
            sx={{
              mb: 5,
              display: 'flex',
              alignItems: 'center',
            }}
          > */}
            <AppLogo />
            {/* </Box> */}

            {/* </Box> */}

            {currentStep === 'sendOtp' && (
              <>
                <Typography
                  variant='h2'
                  component='h2'
                  sx={{
                    mb: 1.5,
                    color: (theme) => theme.palette.text.primary,
                    fontWeight: Fonts.SEMI_BOLD,
                    fontSize: {xs: 14, xl: 16},
                  }}
                >
                  <IntlMessages id='common.forgetPassword' />
                </Typography>

                <Typography
                  sx={{
                    pt: 3,
                    fontSize: 15,
                    color: 'grey.500',
                  }}
                >
                  <span style={{marginRight: 4}}>
                    <IntlMessages id='common.alreadyHavePassword' />
                  </span>
                  <Box
                    component='span'
                    sx={{
                      fontWeight: Fonts.MEDIUM,
                      '& a': {
                        color: (theme) => theme.palette.primary.main,
                        textDecoration: 'none',
                      },
                    }}
                  >
                    <Link to='/signin'>
                      <IntlMessages id='common.signIn' />
                    </Link>
                  </Box>
                </Typography>

                <Formik
                  initialValues={{userName: ''}}
                  validationSchema={validationSchemas.sendOtp}
                  onSubmit={sendOtp}
                >
                  {({isSubmitting}) => (
                    <Form>
                      <Box sx={{mb: 5, mt: 5}}>
                        <AppTextField
                          name='userName'
                          label="Username"
                          placeholder='Enter Username'
                          variant='outlined'
                          sx={{width: '100%'}}
                        />
                      </Box>
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        disabled={isSubmitting}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mx: 'auto',
                        }}
                      >
                        Send OTP
                      </Button>
                    </Form>
                  )}
                </Formik>
              </>
            )}

            {currentStep === 'verifyOtp' && (
              <Formik
                initialValues={{otp: ''}}
                validationSchema={validationSchemas.verifyOtp}
                onSubmit={verifyOtp}
              >
                {({isSubmitting}) => (
                  <Form>
                    <Box sx={{mb: 5}}>
                      <AppTextField
                        name='otp'
                        label='Enter OTP'
                        placeholder='Enter the OTP sent to your Mail'
                        variant='outlined'
                        sx={{width: '100%'}}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          maxLength: 6,
                        }}
                      />
                    </Box>
                    <Button
                      type='submit'
                      variant='contained'
                      color='primary'
                      disabled={isSubmitting}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mx: 'auto',
                      }}
                    >
                      Verify OTP
                    </Button>
                  </Form>
                )}
              </Formik>
            )}

            {currentStep === 'resetPassword' && (
              <>
                <Typography align='center'>
                  {' '}
                  Hello,{' '}
                  <strong>
                    {userInfo.customer_id ? userInfo.company_name : userInfo.full_name}
                  </strong>{' '}
                  please reset the new password.
                </Typography>
                <Formik
                  initialValues={{new_password: '', confirm_new_password: ''}}
                  validationSchema={validationSchemas.resetPassword}
                  onSubmit={updatePassword}
                >
                  {({isSubmitting}) => (
                    <Form>
                      <Box sx={{mb: 5}}>
                        <AppTextField
                          name='new_password'
                          label='New Password'
                          placeholder='Enter your new password'
                          variant='outlined'
                          type={showPassword ? 'text' : 'password'}
                          sx={{width: '100%'}}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge='end'
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <Box sx={{mb: 5}}>
                        <AppTextField
                          name='confirm_new_password'
                          label='Confirm New Password'
                          placeholder='Re-enter your new password'
                          variant='outlined'
                          type={showConfirmPassword ? 'text' : 'password'}
                          sx={{width: '100%'}}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  edge='end'
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        disabled={isSubmitting}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mx: 'auto',
                        }}
                      >
                        Update Password
                      </Button>
                      <Typography
                        sx={{
                          pt: 3,
                          fontSize: 15,
                          color: 'grey.500',
                        }}
                      >
                        <span style={{marginRight: 4}}>
                          <IntlMessages id='common.alreadyHavePassword' />
                        </span>
                        <Box
                          component='span'
                          sx={{
                            fontWeight: Fonts.MEDIUM,
                            '& a': {
                              color: (theme) => theme.palette.primary.main,
                              textDecoration: 'none',
                            },
                          }}
                        >
                          <Link to='/signin'>
                            <IntlMessages id='common.signIn' />
                          </Link>
                        </Box>
                      </Typography>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </Box>
        </Box>
      </AuthWrapper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>No Email Found!</DialogTitle>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={yup.object({
            email: yup
              .string()
              .email('Invalid email format')
              .required('Email is required'),
          })}
          onSubmit={(values, { setSubmitting }) => {
            userEmailUpdate(values);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <DialogContent>
                <Typography>Please enter an email to continue</Typography>
                <Field
                  as={TextField}
                  autoFocus
                  margin="dense"
                  label="Email"
                  type="email"
                  name="email"
                  fullWidth
                  variant="outlined"
                />
                <ErrorMessage name="email">
                  {(msg) => <Typography color="error" variant="caption">{msg}</Typography>}
                </ErrorMessage>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)} color="secondary">
                  Close
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default ForgetPasswordJwtAuth;
