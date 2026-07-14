import React,{useEffect, useState} from 'react';
import {
  alpha,
  Box,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import Avatar from '@mui/material/Avatar';
import AppGridContainer from '../../../../../@crema/core/AppGridContainer';
import Grid from '@mui/material/Grid';
import IntlMessages from '../../../../../@crema/utility/IntlMessages';
import {useDropzone} from 'react-dropzone';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import AppTextField from '../../../../../@crema/core/AppFormComponents/AppTextField';
import EditIcon from '@mui/icons-material/Edit';
import {styled} from '@mui/material/styles';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import { useSelector } from 'react-redux';
import { emailValidation, phoneValidation } from 'components/regexFunction';
import requestConfig from 'services/requestConfig';
import userCreation_services from 'services/userCreation_services';
import login_services from 'services/login_services';

const AvatarViewWrapper = styled('div')(({theme}) => {
  return {
    position: 'relative',
    cursor: 'pointer',
    '& .edit-icon': {
      position: 'absolute',
      bottom: 0,
      right: 0,
      zIndex: 1,
      border: `solid 2px ${theme.palette.background.paper}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      width: 26,
      height: 26,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '&.dropzone': {
      outline: 0,
      '&:hover .edit-icon, &:focus .edit-icon': {
        display: 'flex',
      },
    },
  };
});

const PersonalInfoForm = ({values, setFieldValue, formValues}) => {
  const profileData = Array.isArray(formValues) ? (formValues[0] || {}) : (formValues || {});

  const {getRootProps, getInputProps} = useDropzone({ 
    accept: 'image/jpeg , image/png , image/jpg',
    onDrop: (acceptedFiles) => {

      if (acceptedFiles[0] instanceof Blob) {

        var reader = new FileReader();

        reader.onload = function (event) {

          const img = new Image();

          img.onload = function () {

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const jpegUrl = canvas.toDataURL('image/jpeg');

            setImage(jpegUrl);
          };

          img.src = event.target.result;

        };

        reader.readAsDataURL(acceptedFiles[0]);

      }

    },
  });

  const [imageStatus, setimageStatus] = useState(true);
  const [image, setImage] = useState(null);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [enableMfa, setEnableMfa] = useState(false);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  const {customerReducer:{}} = useSelector((state) => state);

  useEffect(() => {

    const data = profileData;

    Object.keys(data).map((d)=>{
      setFieldValue(d, data[d])
    })

  }, [formValues, profileData, setFieldValue]);

  useEffect(() => {
    setFieldValue('image_url', image)
  },[image])

  useEffect(() => {
    let cancelled = false;

    const fetchMfaStatus = async () => {
      try {
        const response = await login_services.getMultiFactorStatus();
        if (cancelled) return;

        const row = Array.isArray(response?.data) ? response.data[0] : response?.data;
        const mfaValue = row?.multi_factor_authentication;
        const isEnabled =
          mfaValue === true ||
          mfaValue === 1 ||
          mfaValue === '1' ||
          mfaValue === 'true';

        setEnableMfa(isEnabled);
        setFieldValue('multiFactorAuthentication', isEnabled);
      } catch (error) {
        if (cancelled) return;
        setEnableMfa(false);
        setFieldValue('multiFactorAuthentication', false);
      }
    };

    fetchMfaStatus();

    return () => {
      cancelled = true;
    };
  }, [setFieldValue]);

  const handleEmailChange = (e) => {

    const email = e.target.value;
    setFieldValue('email',email);

    if (!emailValidation(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }

  };

  const handlePhoneChange = (e) => {

    const phoneNumber = e.target.value;
    setFieldValue('phone_number' ,phoneNumber);

    if (!phoneValidation(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }

  };



  const maskEmail = (email) => {

    if(!email) return '';

    const parts = email.split('@');

    if(parts.length !== 2) return email;

    const name = parts[0];

    return name.substring(0,3) + '*******@*****';

  };



  const handleMfaToggle = async (e) => {
    const shouldEnable = e.target.checked;
    if (!shouldEnable) {
      setEnableMfa(false);
      setFieldValue('multiFactorAuthentication', false);
      setOpenOtpModal(false);
      setOtp('');
      setOtpError('');
      return;
    }

    const employeeId = values?.employee_id || values?.person_id;
    if (!employeeId) {
      setOtpError('Employee ID is missing. Please refresh and try again.');
      return;
    }

    try {
      setOtpSending(true);
      setOtpError('');
      const response = await requestConfig.sendOTPforAuthentication({
        employee_id: employeeId,
      });
      const status = String(response?.data?.status || '').toLowerCase();
      const message = String(response?.data?.message || '').toLowerCase();
      const responseEmail = response?.data?.email || '';
      const isMailSent =
        status === 'success' ||
        message === 'mail sent' ||
        message === 'mail sent successfully';

      if (isMailSent) {
        setOtpEmail(responseEmail);
        setOpenOtpModal(true);
      } else {
        setEnableMfa(false);
        setFieldValue('multiFactorAuthentication', false);
        setOtpError(response?.data?.message || 'Unable to send OTP');
      }
    } catch (error) {
      setEnableMfa(false);
      setFieldValue('multiFactorAuthentication', false);
      setOtpError(
        error?.response?.data?.message || 'Unable to send OTP. Please try again.'
      );
    } finally {
      setOtpSending(false);
    }
  };


  const saveChanges = () => {
     userCreation_services.updateFactorAuthentication({
     multiFactorAuthentication: enableMfa ? 1 : 0,
      })
  }

  const verifyOtp = async () => {

    if(otp.length !== 6){
      setOtpError("Enter valid 6 digit OTP");
      return;
    }
    try {
      setOtpVerifying(true);
      const response = await requestConfig.verifyOtpForAuthentication({ otp });
      if (response?.data?.message === 'otp verified') {
        setEnableMfa(true);
        setFieldValue('multiFactorAuthentication', true);
        setOpenOtpModal(false);
        setOtp('');
        setOtpError('');
      } else {
        setEnableMfa(false);
        setFieldValue('multiFactorAuthentication', false);
        setOtpError("Invalid OTP");
      }
    } catch (error) {
      setEnableMfa(false);
      setFieldValue('multiFactorAuthentication', false);
      setOtpError(
        error?.response?.data?.message || 'OTP verification failed. Please try again.'
      );
    } finally {
      setOtpVerifying(false);
    }

  };

  return (
    <>
    <Form noValidate autoComplete='off'>

      <Typography
        component='h3'
        sx={{
          fontSize: 16,
          fontWeight: Fonts.BOLD,
          mb: {xs: 3, lg: 4},
        }}
      >
        <IntlMessages id='common.personalInfo' />
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: {xs: 5, lg: 6},
        }}
      >
        <AvatarViewWrapper {...getRootProps({className: 'dropzone'})}>

          <input {...getInputProps()} />

          <Avatar
            sx={{
              width: {xs: 50, lg: 64},
              height: {xs: 50, lg: 64},
              cursor: 'pointer',
            }}
            src={imageStatus ? ( profileData?.image?.length > 0 ?  profileData?.image : image) : image} 
          />

          <Box className='edit-icon'>
            <EditIcon />
          </Box>

        </AvatarViewWrapper>

        <Box sx={{ml:4}}>

          <Typography sx={{fontWeight: Fonts.MEDIUM}}>
            {values.first_name}
          </Typography>

          <Typography sx={{color: (theme) => theme.palette.text.secondary}}>
            {values.email}
          </Typography>

        </Box>

      </Box>

      <AppGridContainer spacing={4}>

        <Grid xs={12} md={6}>
          <TextField
            name='first_name'
            fullWidth
            value={values.first_name || ''}
            onChange={(e)=>setFieldValue('first_name',e.target.value)}
            label={'First Name'}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <AppTextField
            fullWidth
            name='last_name'
            value={values.last_name || ''}
            onChange={(e)=>setFieldValue('last_name',e.target.value)}
            label={'Last Name'}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            name='email'
            fullWidth
            value={values.email || ''}
            onChange={handleEmailChange}
            label={<IntlMessages id='common.email' />}
            error={!!emailError}
            helperText={emailError}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            name='phone_number'
            fullWidth
            value={values.phone_number || ''}
            onChange={handlePhoneChange}
            label={<IntlMessages id='common.phoneNumber' />}
            error={!!phoneError}
            helperText={phoneError}
          />
        </Grid>


        <Grid xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={enableMfa}
                onChange={handleMfaToggle}
                disabled={otpSending}
              />
            }
            label="Enable Multi-Factor Authentication"
          />
        </Grid>

        <Grid xs={12}>
          <Button 
            onClick={saveChanges}
            sx={{
              position: 'relative',
              minWidth: 100,
            }}
            color='primary'
            variant='contained'
            type='submit'
          >
            <IntlMessages id='common.saveChanges' />
          </Button>
        </Grid>

      </AppGridContainer>

    </Form>

  

    <Dialog open={openOtpModal} onClose={()=>setOpenOtpModal(false)}>

      <DialogTitle>
        Enable Multi Factor Authentication
      </DialogTitle>

      <DialogContent>

      <Typography sx={{ mb: 2 }}>
  To enable multi factor authentication, verify your email
  <span style={{ display: "block" }}>
    {maskEmail(otpEmail || values.email)}
  </span>
</Typography>

        <TextField
          fullWidth
          label="Enter 6 digit OTP"
          value={otp}
          inputProps={{maxLength:6}}
          onChange={(e)=>{
            setOtp(e.target.value);
            setOtpError('');
          }}
        />

        {otpError && (
          <Typography color="error" sx={{mt:1}}>
            {otpError}
          </Typography>
        )}

      </DialogContent>

      <DialogActions>

        <Button
          onClick={()=>{
            setOpenOtpModal(false);
            setOtp('');
            setOtpError('');
            setOtpEmail('');
            setEnableMfa(false);
            setFieldValue('multiFactorAuthentication', false);
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={verifyOtp}
          disabled={otpVerifying}
        >
          {otpVerifying ? 'Verifying...' : 'Verify'}
        </Button>

      </DialogActions>

    </Dialog>

    </>
  );
};

export default PersonalInfoForm;

PersonalInfoForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
};
