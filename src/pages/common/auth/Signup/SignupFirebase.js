import { React, useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Checkbox, useTheme, Autocomplete, TextField } from '@mui/material';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import Grid from '@mui/material/Grid';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@mui/material/Box';
import { Fonts } from '../../../../shared/constants/AppEnums';
import AppAnimate from '../../../../@crema/core/AppAnimate';
import AppTextField from '../../../../@crema/core/AppFormComponents/AppTextField';
import Logo from '../../../../assets/user/signup.svg?react';
import { Link } from 'react-router-dom';
import AppLogo from '../../../../@crema/core/AppLayout/components/AppLogo';
import { Cities } from '../../../../utils/cities';
import { Country } from '../../../../components/Country_list';
import { CreateCompany } from 'redux/actions/company_actions';
import { useDispatch } from 'react-redux';
import company_services from 'services/company_services';
import { useNavigate } from 'react-router-dom';
import { fetchError, fetchStart, fetchSuccess, showMessage } from 'redux/actions';
import { useAuthMethod } from '../../../../@crema/utility/AuthHooks';
import { ExistAlert } from 'redux/actions/load';
import {requestForToken} from '../../../../firebase/firebase.service';



const phoneRegExp = /^\d{10}$/;
const validationSchema = yup.object({
  first_name: yup.string().required(<IntlMessages id='validation.nameRequired' />),
  username: yup.string().required(<IntlMessages id='validation.usernameRequired' />),
  company_name:  yup.string().required(<IntlMessages id='validation.companynameRequired' />),
  short_code:  yup.string().required(<IntlMessages id='Please enter shortcode!' />),
  gstin: yup.string().required(<IntlMessages id='validation.gstinRequired' />),
  phone_number: yup.string().matches(phoneRegExp, 'Phone number is not valid')
  .required(<IntlMessages id='validation.phoneRequired' />),
  office_number: yup.string().matches(phoneRegExp, 'Phone number is not valid'),
  email: yup
    .string()
    .email(<IntlMessages id='validation.emailFormat' />)
    .required(<IntlMessages id='validation.emailRequired' />),
  password: yup
    .string()
    .required(<IntlMessages id='validation.passwordRequired' />)
    .min(6, 'Password must be at least 6 characters long.')
    .matches(/^\S*$/, 'Password must not contain spaces.'),


  // confirmPassword: yup
  //   .string()
  //   .required(<IntlMessages id='validation.reTypePassword' />),
});

const Signup = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [fieldValue, setFieldValue] = useState({ city: null, state: null, country: 'India' })
  const { signInWithEmailAndPassword, signInWithPopup, setFirebaseData } = useAuthMethod();

  useEffect(() => {
    requestForToken(() => {}, setToken);
  }, []);
  const SignupRes = async (data) => {
    const formdata = data
    try {
      // dispatch(fetchStart());

      const signUp = await company_services.create(formdata);
      if (signUp.status === 200) {

        if (signUp?.data.response === 400) {
          // alert('Already Exists')
          ExistAlert(dispatch)
        } else {
          navigate('/signin');
        }

        // dispatch(getusermenus(loginApi.data));
        // dispatch(fetchSuccess());

        // let emp_id = cookies.get('login')?.employee_id || '';
        // let data = {token: token};
        // dispatch(
        //   updateUserCreationAction(emp_id, data, (response) => {
        //     if (response) {
        //       dispatch(
        //         getLoginRoleAction(emp_id, (role_name, token, content) => {
        //           if (role_name !== 'Administrator') {
        //             let notify_type = notificationType('login');
        //             let notify_content = content?.filter(
        //               (m) => m.notification_type === notify_type,
        //             );

        //             if (notify_content.length) {
        //               sendNtfy(
        //                 token,
        //                 notify_content[0]?.title,
        //                 notify_content[0]?.body_msg,
        //               );
        //               dispatch(CreateNotificationAction({title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
        //             }
        //           }
        //         }),
        //       );
        //     }
        //   }),
        // );
        // dispatch(listUserlocationsAction(emp_id));
      }
    } catch (err) {
      dispatch(fetchError('Something Went Wrong'))
      // if (err.response?.status === 401)
      //  {
      //   dispatch(fetchError('Username Or Password Invalid'))
      // } else {
      //   dispatch(fetchError('Username Or Password Invalid'))
      // }
    }
    return null;
  };





  return (
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Box
        sx={{
          pb: 6,
          py: { xl: 8 },
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            maxWidth: 1024,
            width: '100%',
            padding: 8,
            paddingLeft: { xs: 8, md: 2 },
            overflow: 'hidden',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Grid
            container
            spacing={5}
            sx={{
              alignItems: { lg: 'center' },
            }}
          >
            <Grid
              sx={{
                textAlign: 'center',
                '& svg': {
                  display: 'inline-block',
                  paddingRight: { xs: 0, lg: 10 },
                },
              }}
              size={{
                xs: 12,
                md: 6
              }}>
              <AppLogo />
              <Logo fill={theme.palette.primary.main} />
            </Grid>

            <Grid
              sx={{
                textAlign: 'center',
              }}
              size={{
                xs: 12,
                md: 6
              }}>
              <Box
                sx={{
                  mb: { xs: 6, xl: 8 },
                  fontWeight: Fonts.BOLD,
                  fontSize: 20,
                }}
              >
                <IntlMessages id='common.signup' />
              </Box>

              <Formik
                validateOnChange={true}
                initialValues={{
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone_number: '',
                  office_number: '',
                  area: '',
                  address: '',
                  zip: '',
                  city: '',
                  state: '',
                  country: '',
                  company_name: '',
                  url: '',
                  gstin: '',
                  username: '',
                  password: '',
                  // terms: '',
                  token: '',
                  short_code: '',
                }}
                validationSchema={validationSchema}
                // onSubmit={(data, { setErrors, resetForm }) => {

                //     resetForm();

                // }}
                onSubmit={(data, { setErrors, resetForm }) => {
                  // setSubmitting(true);
                  let val = { ...data }
                  val.city = fieldValue.city
                  val.state = fieldValue.state
                  val.country = fieldValue.country
                  val.token = token
                  SignupRes(val)
                  //TODO Api Call here to save user info
                  // setSubmitting(false);
                }}
              >
                {({ isSubmitting }) => (
                  <Form noValidate autoComplete='off'>
                    <Grid
                      spacing={3}
                      container
                      direction='row'
                    >
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Fist Name'
                            name='first_name'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Last Name'
                            name='last_name'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Email'
                            name='email'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Phone number'
                            name='phone_number'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Office Phone Number'
                            name='office_number'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Area'
                            name='area'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Address'
                            name='address'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Pincode'
                            name='zip'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <Autocomplete
                            id='country-select-demo'
                            fullWidth
                            options={_.uniqBy(Cities, 'name')}
                            value={{ name: fieldValue.city === null ? '' : fieldValue.city }}
                            name='city'
                            autoHighlight
                            selectOnFocus
                            onChange={(_, newValue) => {
                              setFieldValue({ ...fieldValue, city: newValue.name });
                            }}

                            getOptionLabel={(city) => city.name ? city.name : ''}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={'City'}
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Autocomplete
                          id='country-select-demo'
                          fullWidth
                          options={_.uniqBy(Cities, 'state')}
                          value={{ state: fieldValue.state === null ? '' : fieldValue.state }}
                          name='state'
                          autoHighlight
                          selectOnFocus
                          onChange={(_, newValue) => {
                            setFieldValue({ ...fieldValue, state: newValue.state });
                          }}

                          getOptionLabel={(city) => city.state ? city.state : ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              // label={<IntlMessages id='common.country' />}
                              label={'State'}
                            // inputProps={{
                            //   ...params.inputProps,
                            //   autoComplete: 'new-password', // disable autocomplete and autofill
                            // }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Autocomplete
                          id='country-select-demo'
                          fullWidth
                          options={Country}
                          value={{ name: fieldValue.country === null ? '' : fieldValue.country }}
                          name='country'
                          autoHighlight
                          onChange={(_, newValue) => {
                            setFieldValue({ ...fieldValue, country: newValue.name });
                          }}
                          // onChange={(e, val) =>
                          //   // val !== null
                          //   //   ? 
                          //     setFieldValue({
                          //         ...values,
                          //         city: val.name,
                          //         state: val.state,
                          //       })
                          //    // : ''
                          // }
                          getOptionLabel={(country) => country.name ? country.name : ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={'Country'}

                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Company Name'
                            name='company_name'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Company URL'
                            name='url'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='GSTIN'
                            name='gstin'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 12,
                          xs: 12,
                          md: 12,
                          sm: 12
                        }}>
                        <Box >
                          <AppTextField
                            label='Short Code'
                            name='short_code'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Username'
                            name='username'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Password'
                            name='password'
                            variant='outlined'
                            sx={{
                              width: '100%',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 6,
                          xs: 6,
                          md: 6
                        }}>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mb: { xs: 5, xl: 6 },
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >

                      <Box sx={{ ml: -3 }}>
                        <Checkbox />
                      </Box>
                      <Box
                        component='span'
                        sx={{
                          mr: 2,
                          fontSize: 14,
                        }}
                      >
                        <IntlMessages id='common.iAgreeTo' />
                      </Box>
                      <Box
                        sx={{
                          cursor: 'pointer',
                          component: 'span',
                          color: 'primary.main',
                          fontWeight: Fonts.BOLD,
                          fontSize: 14,
                        }}
                      >
                        <IntlMessages id='common.termConditions' />
                      </Box>
                    </Box>

                    <Button
                      variant='contained'
                      color='primary'
                      // disabled={isSubmitting}
                      sx={{
                        width: '100%',
                        height: 44,
                      }}
                      type='submit'
                    >
                      <IntlMessages id='common.signup' />
                    </Button>
                  </Form>
                )}
              </Formik>

              <Box
                sx={{
                  textAlign: 'center',
                  color: 'grey.700',
                  fontSize: 14,
                  fontWeight: Fonts.BOLD,
                  mt: { xs: 3, xl: 4 },
                }}
              >
                <Box component='span' sx={{ mr: 1 }}>
                  <IntlMessages id='common.alreadyHaveAccount' />
                </Box>
                <Box
                  component='span'
                  sx={{
                    color: 'primary.main',
                    fontWeight: Fonts.MEDIUM,
                    cursor: 'pointer',
                  }}
                >
                  <Link to='/signIn'>
                    <IntlMessages id='common.signInHere' />
                    {/* <IntlMessages id='common.signIn' /> */}
                  </Link>

                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </AppAnimate>
  );
};

export default Signup;
