import React, {useState, useEffect, useRef, useContext} from 'react';
import {useAuthUser} from '@crema/utility/AuthHooks';
import {Formik} from 'formik';
import * as yup from 'yup';
import PersonalInfoForm from './PersonalInfoForm';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import { listUserByid, updateUsercreationallAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {useSelector, useDispatch} from 'react-redux';
import {base_url} from '../../../../../http-common';
import { imageUpload } from 'redux/actions/customer_actions';
import apiCalls from 'utils/apiCalls';
import userCreation_services from 'services/userCreation_services';

const phoneRegExp = /^[6-9]\d{9}$/;
const validationSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is Required'),
  phone_number: yup.string().matches(phoneRegExp, 'Invalid Phone number').required('Phone Number is Required'),
  first_name: yup.string().required('Name is Required'),
 
});
const PersonalInfo = () => {
  const {user} = useAuthUser();
  // const [sessionData, setSessionData] = useState([])
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const [flag, setFlag] = useState(false)

  useEffect(() => {
    dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  const dispatch = useDispatch();

  const userCreation = useSelector(
    (state) => state.UserCreationReducer.user_by_id,
  );
  let FormsValuestate = userCreation || []
  const sessionData = sessionStorage.getItem('login')
  // Object.keys(sessionData).forEach((item) => {
  //   if(typeof sessionData[item] == "string" && sessionData[item] == 'first_name') {
  //     sessionData[item] = 'nagaraj';
  //   }
  // })
  // let res = Object.keys(sessionData)
  // let jsonData = JSON.parse(sessionData);

  // let name = jsonData["first_name"];
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
        p: { xs: 2, md: 3, lg: 4 },
      }}
    >
      <Formik
        validateOnBlur={true}
        initialValues={{
          // ...user,
          // photoURL: user.photoURL
          //   ? user.photoURL
          //   : '/assets/images/placeholder.jpg',
          first_name: '',
          pic_filename: '',
          last_name:'',
          email:'',
          phone_number:'',
          image_url: '',
          multiFactorAuthentication: false,
        }}
        validationSchema={validationSchema}
        onSubmit={async (data, {setSubmitting}) => {
          setSubmitting(true);
          console.log('sdassf', data)
          const updatedSessionData = (() => {
            let jsonData = {};
            try {
              jsonData = sessionData ? JSON.parse(sessionData) : {};
            } catch (e) {
              jsonData = {};
            }

            return {
              ...jsonData,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone_number: data.phone_number,
              multiFactorAuthentication: data.multiFactorAuthentication ? 1 : 0,
              image: data.image_url || jsonData.image || '',
              image_url: data.image_url || jsonData.image_url || '',
              user_img_url:
                data.image_url || jsonData.user_img_url || jsonData.image || '',
              img_filename:
                data.image_url || jsonData.img_filename || jsonData.image || '',
            };
          })();
          let imgData = {
            customer_id: data.person_id,
            image: data.image_url,
            customer_type: 'Employee'
          }

          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(imageUpload(imgData,
              (response) => {
                if(response === 200){
                  sessionStorage.setItem('login', JSON.stringify(updatedSessionData))
                }
              }
            ))
          )

          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              updateUsercreationallAction(
                data.person_id,
                data,
                setModalTypeHandler,
                setLoaderStatusHandler,
              ),
            ),
            userCreation_services.updateFactorAuthentication({
              multiFactorAuthentication: data.multiFactorAuthentication ? 1 : 0,
            })
          );

          dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));

          sessionStorage.setItem('login', JSON.stringify(updatedSessionData))

          //TODO Api Call here to save user info
          setSubmitting(false);
        }}
      >
        {({values, setFieldValue}) => {
          return (
            <PersonalInfoForm values={values} setFieldValue={setFieldValue} formValues = {userCreation} />
          );
        }}
      </Formik>
    </Box>
  );
};

export default PersonalInfo;

PersonalInfo.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.string,
};
