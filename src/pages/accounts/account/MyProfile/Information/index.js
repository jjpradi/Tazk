import React, {useContext, useEffect} from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import * as yup from 'yup';
import {Fonts} from 'shared/constants/AppEnums';
import IntlMessages from '@crema/utility/IntlMessages';
import InfoForm from './InfoForm';
import { listUserByid, updateUsercreationallAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {useSelector, useDispatch} from 'react-redux';
import {Formik} from 'formik';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema = yup.object({
    area: yup
      .string()
      .nullable() // Allow null as an initial value
      .required('Area is Required'),
  
    address: yup
      .string()
      .required('Address is Required'),
  
    zip: yup
      .string()
      .required('Zip is Required'),
  });
const Information = () => {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  // useEffect(() => {
  //   dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));
  // }, []);

  // const dispatch = useDispatch();

  const userCreation = useSelector(
    (state) => state.UserCreationReducer.user_by_id,
  );
  let FormsValuestate = userCreation || []
  const dispatch = useDispatch();  

  const sessionData = sessionStorage.getItem('login')

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
        <IntlMessages id='common.information' />
      </Typography>
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{
          area:'',
          address:'',
          city:'',
          zip:'',
          state:'',
          country:'',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting}) => {
          setSubmitting(true);
          dispatch(
            updateUsercreationallAction(
              data.person_id,
              data,
              setModalTypeHandler,
              setLoaderStatusHandler,
              
            ),
          );

          let jsonData = JSON.parse(sessionData);
          jsonData["area"] = data.area
          jsonData["address"] = data.address
          jsonData["city"] = data.city
          jsonData["zip"] = data.zip
          jsonData["state"] = data.state
          jsonData["country"] = data.country
          sessionStorage.setItem('login', JSON.stringify(jsonData))
          let dat = sessionStorage.getItem('login')

          setSubmitting(false);
        }}
      >
        {({values, setFieldValue}) => {
          return <InfoForm values={values} setFieldValue={setFieldValue} formValues={userCreation} />;
        }}
      </Formik>
    </Box>
  );
};

export default Information;
