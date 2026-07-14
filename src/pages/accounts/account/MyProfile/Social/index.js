import React from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import IntlMessages from '../../../../../@crema/utility/IntlMessages';
import PropTypes from 'prop-types';
import {Formik} from 'formik';
import SocialForm from './SocialForm';
import * as yup from 'yup';

const validationSchema = yup.object({
  twitter: yup.string().label('Please Enter your Twitter url'),
  facebook: yup.string().label('Please Enter your Facebook url'),
  google: yup.string().label('Please Enter your Google url'),
  linkedIn: yup.string().label('Please Enter your LinkedIn url'),
  instagram: yup.string().label('Please Enter your Instagram url'),
  quora: yup.string().label('Please Enter your Quora url'),
});

const Social = ({social}) => {

  const sessionData = sessionStorage.getItem('login')
  
  return (
    <Box sx={{position: 'relative', p: { xs: 2, md: 3, lg: 4 }}}>
      <Typography
        component='h3'
        sx={{
          fontSize: 16,
          fontWeight: Fonts.BOLD,
          mb: {xs: 3, lg: 5},
        }}
      >
        <IntlMessages id='common.socialLinks' />
      </Typography>
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{
          twitter: 'https://twitter.com/?lang=en',
          facebook: '',
          linkedIn: '',
          google: '',
          instagram: '',
          quora: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting}) => {
          setSubmitting(true);

          let jsonData = JSON.parse(sessionData);
          jsonData["twitter"] = data.twitter
          jsonData["facebook"] = data.facebook
          jsonData["linkedIn"] = data.linkedIn
          jsonData["google"] = data.google
          jsonData["instagram"] = data.instagram
          jsonData["quora"] = data.quora
          sessionStorage.setItem('login', JSON.stringify(jsonData))
          let dat = sessionStorage.getItem('login')
          //TODO Api Call here to save user info
          setSubmitting(false);
        }}
      >
        <SocialForm social={social} />
      </Formik>
    </Box>
  );
};

export default Social;

Social.propTypes = {
  social: PropTypes.array,
};
