import React, { useEffect, useState } from 'react';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate, useSearchParams} from 'react-router-dom';
import {useIntl} from 'react-intl';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@mui/material/Box';
import AppTextField from '../../../../@crema/core/AppFormComponents/AppTextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AppInfoView from '../../../../@crema/core/AppInfoView';
import {useAuthMethod} from '../../../../@crema/utility/AuthHooks';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {AiOutlineGoogle, AiOutlineTwitter} from 'react-icons/ai';
import {FaFacebookF} from 'react-icons/fa';
import {BsGithub} from 'react-icons/bs';
import { getusermenus } from 'redux/actions/role_actions';
import { LastActivedateAction, listUserByid, listUserlocationsAction, updateUserCreationAction } from "../../../../redux/actions/userCreation_actions";
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import notificationType from 'firebase/notify_type';
import { requestForToken, sendNtfy } from 'firebase/firebase.service';
import Cookies from 'universal-cookie';
import { useDispatch, useSelector } from 'react-redux';
import login_services from 'services/login_services';
import { fetchError, fetchStart, fetchSuccess, showMessage } from 'redux/actions';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { initWebSocket } from 'http-common';
import { getCompanyStatusAction } from 'redux/actions/superAdmin_action';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FormControl, Grid, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { color, useTheme } from '@mui/system';
import { roleType } from 'utils/roleType';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import {getBrowserUUID} from 'utils/getBrowserUUID'
import { PARTNER_ADMIN_TOKEN_KEY, PARTNER_PORTAL_PREFIX } from 'pages/partnerPortal/config';
import platform from 'platform';

const validationSchema = yup.object({
  // email: yup
  //   .string()
  //   .email(<IntlMessages id='validation.emailFormat' />)
  //   .required(<IntlMessages id='validation.emailRequired' />),
  username: yup
    .string()
    .required(<IntlMessages id='validation.nameRequired' />),
  password: yup
    .string()
    .required(<IntlMessages id='validation.passwordRequired' />),
    // otp: yup
    // .string()
    // .required('OTP is Required'),
});



const SigninFirebase = () => {
  const {signInWithEmailAndPassword, signInWithPopup, setFirebaseData} = useAuthMethod();
  const navigate = useNavigate();
  let storage = getsessionStorage()
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Strip any sensitive params (username/password) from URL on mount
  useEffect(() => {
    const url = new URL(window.location);
    if (url.searchParams.has('password') || url.searchParams.has('username')) {
      url.searchParams.delete('password');
      url.searchParams.delete('username');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, []);
  const [isResending, setIsResending] = useState(false);

 
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };

  const onGoToForgetPassword = () => {
    navigate('/forget-password', {tab: 'firebase'});
  };

  const {messages} = useIntl();

  const dispatch = useDispatch();

  const theme = useTheme();

  const {
    UserCreationReducer: {all_user_location}
  } = useSelector((state) => state);


  
  let id = storage?.employee_id
  let device_name = platform.name
  let device_version = platform.version
//  useEffect(() => {
//   // let body =  {
//   //   device_name: platform.name,
//   //   device_version: platform.version,
//   //   employee_id: emp_id
//   // }
//   // console.log(body,'bodyyyy')
// dispatch(LastActivedateAction(id))
//  },[])


const [isMfaRequired, setIsMfaRequired] = useState(false);
const [otpMessage, setOtpMessage] = useState('');


  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const domainParts = domain.split('.');

    const maskedLocalPart = localPart.slice(0, 3) + '*'.repeat(localPart.length - 3);
    const maskedDomain = domainParts[0].slice(0, 2) + '***';
    const maskedExtension = domainParts[1].slice(0, 1) + '**';

    return `${maskedLocalPart}@${maskedDomain}.${maskedExtension}`;
  };






useEffect(() => { (async () => {
  const handleAutoLogin = async () => {
    // Phase 6: prefer the URL fragment (#token=...&sig=...&ts=...), which
    // is not sent to servers, not written to access logs, and not leaked in
    // Referer headers. Fall back to the legacy query string so any
    // in-flight signup that used the old redirect path still works.
    const hashPart = (window.location.hash || "").replace(/^#/, "");
    const hashParams = new URLSearchParams(hashPart);
    const queryParams = new URLSearchParams(window.location.search);

    const token = hashParams.get("token") || queryParams.get("token");
    const sig = hashParams.get("sig") || queryParams.get("sig");
    const ts = hashParams.get("ts") || queryParams.get("ts");

    if (!token || !sig || !ts) return;

    try {
      await loginRes({
        token,
        sig,
        ts
      });

      // replaceState with just the pathname wipes both query and fragment,
      // so the secrets never survive in browser history.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

    } catch (err) {
      console.error("Auto-login failed", err);
    }
  };

  const timeoutId = setTimeout(handleAutoLogin, 100);
  return () => clearTimeout(timeoutId);
})();
}, []);


    
   

  useEffect(() =>{
    requestForToken(()=>{}, setToken)
  },[])

  const loginRes = async (e) => {
   
    const formdata = e
    try {
      dispatch(fetchStart());
      const loginApi = await login_services.create(formdata);
      if(loginApi.status === 200 && loginApi.data === 'Reset' ) {
        navigate('/forget-password', {tab: 'awsCognito'});
      }
      if (loginApi?.data?.company_type === 13) {

  sessionStorage.setItem('login', JSON.stringify(loginApi.data));
  sessionStorage.setItem('partner_token', loginApi.data?.token);
  localStorage.setItem(PARTNER_ADMIN_TOKEN_KEY, JSON.stringify(loginApi.data?.accessToken));
  setFirebaseData({
    user: loginApi.data,
    isAuthenticated: true,
    isLoading: false,
  });

  dispatch(fetchSuccess());   
  navigate('/common/home');
  return;                     
}
      // console.log(loginApi, "login");
      if (loginApi.status === 200 && loginApi.data.from === 'Normal Login') {
          // console.log('fffffffffff')
          // sessionStorage.setItem('login', JSON.stringify(loginApi.data));
        const normalizeSingleNumber = (value) => {
          if (typeof value === 'string') {
            return Number(value.split(',')[0].trim());
          }
          return Number(value); // handles number input
        };

        const normalizedLoginData = {
          ...loginApi.data,
          company_type: loginApi.data.default_com_type !== 0 ? loginApi.data?.default_com_type : normalizeSingleNumber(loginApi.data.company_type),
          subscription_type: loginApi.data.default_sub_type !== 0 ? loginApi.data?.default_sub_type : normalizeSingleNumber(loginApi.data.subscription_type),
          og_company_type: loginApi.data.company_type,
          og_subscription_type: loginApi.data.subscription_type,
        };

        sessionStorage.setItem('login', JSON.stringify(normalizedLoginData));
          // login_services.setLogindate();

        if (loginApi.status === 200) {
              // const cookies = new Cookies();
              // cookies.set('login', JSON.stringify(loginApi.data));
              // sessionStorage.setItem('login', JSON.stringify(loginApi.data))

              setFirebaseData({
                user: loginApi.data,
                isAuthenticated: true,
                isLoading: false,
              })

              const subscriptionEndDate = moment(loginApi.data.subscriptionEndDate).format('YYYY-MM-DD');
              const todayDate = moment(new Date()).format('YYYY-MM-DD');
              // yesterday.setDate(yesterday.getDate() - 1); // Subtract one day to get yesterday's date

              // subscriptionEndDate.setHours(0, 0, 0, 0);
              // yesterday.setHours(0, 0, 0, 0);
              // console.log("yesterday", subscriptionEndDate, todayDate,subscriptionEndDate < todayDate);
              const { company_type, isDetailEntered, role_name } = loginApi.data;

              if (subscriptionEndDate < todayDate) {
                 navigate('/common/subscriptions');
              }
              //  else if (company_type === 5 && isDetailEntered === 0 && role_name === 'Administrator') {
              //   navigate('/setup')
              // }
              else {
                navigate('/common/home');
              }
              dispatch(getusermenus(loginApi.data));
              dispatch(fetchSuccess());

              // let emp_id = cookies.get('login')?.employee_id || '';
              let emp_id = JSON.parse(sessionStorage.getItem('login'))?.employee_id || '';
              let info = await getBrowserUUID("tazk");
              let data = { token: token , browser_id : info.id , browser_name : info.browser};
              let device_name = platform.name
              let device_version = platform.version
              let payload = {
                device_name: device_name,
                device_version: device_version
              }
              initWebSocket(emp_id, loginApi.data.accessToken)
              dispatch(
                updateUserCreationAction(emp_id, data, (response) => {

                  if (response) {
                    dispatch(
                      getLoginRoleAction(emp_id, (role_name, token, content) => {
                        if (!roleType.includes(role_name)) {
                          let notify_type = notificationType('login');
                          let notify_content = content?.filter(
                            (m) => m.notification_type === notify_type,
                          );
                          if (notify_content.length) {
                            // let loginName = cookies.get('login')?.first_name || '' ;
                            let loginName = JSON.parse(sessionStorage.getItem('login'))?.first_name || '';
                            let content_body = ` ${loginName} \n${notify_content[0]?.body_msg}`;

                            sendNtfy(
                              token,
                              notify_content[0]?.title,
                              content_body
                            );
                            dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
                          }
                        }
                      }),
                    );
                  }
                }),
              );
              dispatch(listUserlocationsAction(emp_id));
              dispatch(LastActivedateAction(payload, emp_id))
              dispatch(listUserByid(emp_id));
              login_services.setLogindate(emp_id);
            }

        // dispatch(getCompanyStatusAction({ company_id: loginApi?.data?.company_id }, async (response) => {
        //   if (response?.length && response[0]?.isApproved === "Approved") {
        //     //const companyStatusData = await dispatch(getCompanyStatusAction());
            
        //   }
        //   else {
        //     dispatch(fetchError('Approval Required'))
        //   }
        // }))
        // dispatch(fetchSuccess());
      }

      else if (loginApi.status === 200 && loginApi.data.from === 'Multi-Factor Authentication Login') {
        setIsMfaRequired(true);
        setOtpMessage(`OTP sent to ${maskEmail(loginApi.data.mail)}`);
        dispatch(fetchSuccess());
      }

      else {
        return;
      }

    } catch (err) {
      console.error('Login catch error:', err);
      if (!err.response) {
        dispatch(fetchError('Some Technical Issue.. !!'));
      }
      else if (err.response?.status === 403) {

        const currentPath = window.location.pathname;
        const signInPath = '/signin';

        // console.log("currentPath",currentPath)
        if (currentPath !== signInPath) {
          // console.log("window.location", window);
          dispatch(fetchError('Subscription Required'));
          window.location.replace(`${window.location.origin}${signInPath}`);
        }
        else {
          dispatch(fetchError('Permission Denied'))
        }


      }

      else if (err.response?.status === 401 && err.response?.data?.message === 'Mail ID Required For Authentication') {
        dispatch(fetchError('Mail ID not exist Contact Admin to Register'))
      }
      else if (err.response?.status === 401 && err.response?.data?.message === 'Failed to send') {
        dispatch(fetchError('Failed to send'))
      }
      else if (err.response?.status === 401) {
        dispatch(fetchError('Username Or Password Invalid'))
      }

      else if (err.response?.status === 500) {
        dispatch(fetchError('Something went wrong. Please try again.'))
      } else if (err.message === 'Network Error') {
        dispatch(fetchError('Check Your Network Connection !!'))
      } else if (err.response?.status === 402) {
        dispatch(fetchError('Approval Required'))
      } else if (err.response?.status === 405) {
        dispatch(fetchError('Admin Restricted'))
      } else if (err.response?.status === 505) {
        dispatch(fetchError('Web access Denied'))
      } else if (err.response === undefined) {
        dispatch(fetchError('Authentication failed!'))
      }
    }
    return null;
  }

  const resendOtp = async (data) => {
    try {
      setIsResending(true); 
      dispatch(fetchStart());
  
      const payload = {
        username: data.username,
        password: data.password,
        from: 'Multi-Factor Authentication Login',
      };
  
      await login_services.resendOtp(payload);
    } catch (error) {
      console.error('Error resending OTP:', error);
    } finally {
      setIsResending(false); 
    }
  };

  const verifyOtp = async (data) => {
    // console.log("111",data)
    try {
      dispatch(fetchStart());
      const data1 = {
        username: data.username,
        password:data.password,
        otp: data.otp,
        from:'Multi-Factor Authentication Login'
      }
      const verifyApi = await login_services.verify(data1);

      // console.log("asasd",verifyApi)
      if (verifyApi.status === 200 && verifyApi.data) {

        // console.log('fffffffffff')
        sessionStorage.setItem('login', JSON.stringify(verifyApi.data));
        

   
         
          // dispatch(getCompanyStatusAction({ company_id: verifyApi.data.company_id}, async (response) => {
          //   if (response?.length && response[0]?.isApproved === "Approved") {
              //const companyStatusData = await dispatch(getCompanyStatusAction());
  
              // const cookies = new Cookies();
              // cookies.set('login', JSON.stringify(loginApi.data));
              // sessionStorage.setItem('login', JSON.stringify(loginApi.data))
  
            
              setFirebaseData({
                user:  verifyApi.data,
                isAuthenticated: true,
                isLoading: false,
              })
              const subscriptionEndDate = moment(verifyApi.data.subscriptionEndDate).format('YYYY-MM-DD');
              const todayDate = moment(new Date()).format('YYYY-MM-DD');
              // yesterday.setDate(yesterday.getDate() - 1); // Subtract one day to get yesterday's date
  
              // subscriptionEndDate.setHours(0, 0, 0, 0);
              // yesterday.setHours(0, 0, 0, 0);
              // console.log("yesterday", subscriptionEndDate, todayDate,subscriptionEndDate < todayDate);
              const { company_type, isDetailEntered, role_name } = verifyApi.data
  
              if (subscriptionEndDate < todayDate) {
                navigate('/common/subscriptions');
              }
              //  else if (company_type === 5 && isDetailEntered === 0 && role_name === 'Administrator') {
              //   navigate('/setup')
              // }
              else {
                navigate('/common/home');
              }
              dispatch(getusermenus(verifyApi.data));
              dispatch(fetchSuccess());
  
              // let emp_id = cookies.get('login')?.employee_id || '';
              let emp_id = JSON.parse(sessionStorage.getItem('login'))?.employee_id || '';
              let info = await getBrowserUUID("tazk");
              let data = { token: token , browser_id : info.id , browser_name : info.browser};
              let device_name = platform.name
              let device_version = platform.version
              let payload = {
                device_name: device_name,
                device_version: device_version
              }
              initWebSocket(emp_id, verifyApi.data.accessToken)
              dispatch(
                updateUserCreationAction(emp_id, data, (response) => {
  
                  if (response) {
                    dispatch(
                      getLoginRoleAction(emp_id, (role_name, token, content) => {
                        if (!roleType.includes(role_name)) {
                          let notify_type = notificationType('login');
                          let notify_content = content?.filter(
                            (m) => m.notification_type === notify_type,
                          );
                          if (notify_content.length) {
                            // let loginName = cookies.get('login')?.first_name || '' ;
                            let loginName = JSON.parse(sessionStorage.getItem('login'))?.first_name || '';
                            let content_body = ` ${loginName} \n${notify_content[0]?.body_msg}`;
  
                            sendNtfy(
                              token,
                              notify_content[0]?.title,
                              content_body
                            );
                            dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
                          }
                        }
                      }),
                    );
                  }
                }),
              );
              dispatch(listUserlocationsAction(emp_id));
              dispatch(LastActivedateAction(payload, emp_id))
              login_services.setLogindate(emp_id);
  
          //   }
          //   else {
          //     dispatch(fetchError('Approval Required'))
          //   }
          // }))
          dispatch(fetchSuccess());
        
       


      } else {
        dispatch(fetchError('Invalid OTP.Please Try Again'))
      }
    } catch (err) {
      dispatch(fetchError('Invalid OTP.Please Try Again'))
    }
  };
  
  

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', mb: 5}}>
      <Formik
      validateOnChange={true}
      initialValues={{
        username: '',
        password: '',
        otp: '', 
      }}
      validationSchema={isMfaRequired ? validationSchema : validationSchema} 
      onSubmit={(data, { setSubmitting }) => {
        setSubmitting(true);
        if (isMfaRequired) {
          verifyOtp(data); 
        } else {
          loginRes(data); 
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, handleChange, values }) => (
        <Form style={{ textAlign: 'left' }} noValidate autoComplete="off">
         
          {!isMfaRequired && (
            <>
              <Box sx={{ mb: { xs: 5, xl: 8 } }}>
                <AppTextField
                id="signin-username-input"
                  placeholder={messages['common.userName']='User Name'}
                  name="username"
                  InputLabelProps={{ shrink: true }}
                  autoComplete="do-not-autofill"
                  label={<IntlMessages id="common.userName" defaultMessage="User Name"  />}
                  variant='filled'
                  sx={{
                    width: '100%'
                  }}
                />
              </Box>

              <Box sx={{ mb: { xs: 5, xl: 8 } }}>
              <AppTextField
                  id="signin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={messages['common.password']}
                  label={<IntlMessages id="common.password" />}
                  InputLabelProps={{ shrink: true }}
                  autoComplete="one-time-code"
                  name="password"
                  variant="filled"
                  onChange={handleChange}
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input': {
                      fontSize: 14
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                 <Box
                  component='span'
                  sx={{
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: Fonts.MEDIUM,
                    cursor: 'pointer',
                    display: 'block',
                    textAlign: 'right',
                    mt:2,
                    fontSize:'13px' 
                  }}
                  onClick={onGoToForgetPassword}
                >
                  <IntlMessages id='common.forgetPassword' />
                </Box>
              </Box>
            </>
          )}
  

         
          {isMfaRequired && (
            <>
            <Box sx={{ mb: { xs: 5, xl: 8 } }}>
               <Box
                sx={{
                  mt: 2,
                  mb:4,
                  color: theme.palette.text.secondary,
                  fontSize: 12,
                }}
              >
                {otpMessage}
              </Box>
              <AppTextField
                placeholder="Enter OTP"
                name="otp"
               
                InputLabelProps={{ shrink: true }}
                 autoComplete="do-not-autofill"
                label="OTP"
                variant="outlined"
                onChange={handleChange}
                value={values.otp}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                    backgroundColor: theme.palette.background.default,
                  },
                }}
              />
            
            <Box sx={{ mt: 2 }}>
            <Button
              variant="text"
              onClick={() => resendOtp(values)}
              disabled={isResending}
              sx={{
                fontSize: 14,
                color: theme.palette.primary.main,
                textTransform: 'none',
              }}
            >
              Resend OTP
            </Button>
              </Box>
            </Box>
              </>  
                
          )}

          <Box sx={{ mb: { xs: 5, xl: 8 } }}>
            <Button 
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{
                height: 45,
                width: '100%',
                borderRadius:1,
                '& .MuiInputBase-input': {
                  fontSize: 14,
                },
                backgroundColor:'#333333'
              }}
            >
              {isMfaRequired ? 'Verify OTP' : <IntlMessages id="common.signIn" />}
            </Button>
          </Box>
          {/* <Typography variant="body2" sx={{ mt: 1 }}>
            New partner?{" "}
            <Button
              component={RouterLink}
              to={`${PARTNER_PORTAL_PREFIX}/signup`}
              size="small"
            >
              Create account
            </Button>
          </Typography> */}
        </Form>
      )}
    </Formik>
      </Box>

       {/* <Box
        sx={{
          color: 'grey.500',
          mb: {xs: 5, md: 7},
        }}
      >
        <span style={{marginRight: 4}}>
          <IntlMessages id='common.dontHaveAccount' />
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
          <Link to='/signup'>
            <IntlMessages id='common.signup' />
          </Link>
        </Box>
      </Box>  */}

      {/* <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: (theme) => theme.palette.background.default,
          mx: {xs: -5, lg: -10},
          mb: {xs: -6, lg: -11},
          mt: 'auto',
          py: 2,
          px: {xs: 5, lg: 10},
        }}
      >
        <Box
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <IntlMessages id='common.orLoginWith' />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        > 
          <IconButton
            sx={{
              p: 2,
              '& svg': {fontSize: 18},
              color: (theme) => theme.palette.text.secondary,
            }}
            onClick={() => signInWithPopup('google')}
          >
            <AiOutlineGoogle />
          </IconButton>
          <IconButton
            sx={{
              p: 1.5,
              '& svg': {fontSize: 18},
              color: (theme) => theme.palette.text.secondary,
            }}
            onClick={() => signInWithPopup('facebook')}
          >
            <FaFacebookF />
          </IconButton>
          <IconButton
            sx={{
              p: 1.5,
              '& svg': {fontSize: 18},
              color: (theme) => theme.palette.text.secondary,
            }}
            onClick={() => signInWithPopup('github')}
          >
            <BsGithub />
          </IconButton>
          <IconButton
            sx={{
              p: 1.5,
              '& svg': {fontSize: 18},
              color: (theme) => theme.palette.text.secondary,
            }}
            onClick={() => signInWithPopup('twitter')}
          >
            <AiOutlineTwitter />
          </IconButton>
        </Box>
      </Box> */}

      <AppInfoView />
    </Box>
  );
};

export default SigninFirebase;
