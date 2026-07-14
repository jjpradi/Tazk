import React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Checkbox, useTheme } from '@mui/material';
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


const validationSchema = yup.object({
  name: yup.string().required(<IntlMessages id='validation.nameRequired' />),
  email: yup
    .string()
    .email(<IntlMessages id='validation.emailFormat' />)
    .required(<IntlMessages id='validation.emailRequired' />),
  password: yup
    .string()
    .required(<IntlMessages id='validation.passwordRequired' />)
    .min(6, 'Password must be at least 6 characters long.')
    .matches(/^\S*$/, 'Password must not contain spaces.'),
  confirmPassword: yup
    .string()
    .required(<IntlMessages id='validation.reTypePassword' />)
    .oneOf([yup.ref('password'), null], 'Passwords must match.'),
});

const Signup = () => {
  const theme = useTheme();
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
          marginTop:'-120px',
        }}
      >
        <Card
          sx={{
            maxWidth: 1024,
            width: '100%',
            padding: 3,
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
            direction='row'
            display='flex'
          >


            <Grid
              sx={{
                textAlign: 'center',
              }}
              size={{
                lg: 12,
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
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(data, { setErrors, resetForm }) => {
                  if (data.password !== data.confirmPassword) {
                    setErrors({
                      confirmPassword: (
                        <IntlMessages id='validation.passwordMisMatch' />
                      ),
                    });
                  } else {
                    resetForm();
                  }
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
                          lg: 4,
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
                        </Box></Grid>
                      <Grid
                        sx={{
                          textAlign: 'center',
                        }}
                        size={{
                          lg: 4,
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
                          lg: 4,
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
                          lg: 4,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='City'
                            name='city'
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
                          lg: 4,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='State'
                            name='state'
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
                          lg: 4,
                          xs: 6,
                          md: 6
                        }}>
                        <Box >
                          <AppTextField
                            label='Country'
                            name='country'
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
                          lg: 4,
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
                          lg: 4,
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
                          lg: 4,
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
                    </Grid>
                 
                    {/* Agreee */}
                     <Box
                      sx={{
                        mb: {xs: 5, xl: 6},
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ml: -3}}>
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
                
                    <Grid
                      sx={{
                        textAlign: 'center',
                      }}
                      display='flex'
                      alignItems='center'
                      size={{
                        lg: 4,
                        xs: 6,
                        md: 6
                      }}>
                    <Button
                      variant='contained'
                      color='primary'
                      disabled={isSubmitting}
                      sx={{
                        width: '100%',
                        height: 44,
                      }}
                      type='submit'
                    >
                      <IntlMessages id='common.signup' />
                    </Button>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </AppAnimate>
  );
};

export default Signup;
