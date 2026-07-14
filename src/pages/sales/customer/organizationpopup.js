import React, {useEffect, useState, useContext, useRef} from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Slider,
  Typography,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  FormHelperText
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import context from '../../../context/CreateNewButtonContext'
import {useDispatch, useSelector} from 'react-redux';
import { Cities } from '../../../utils/cities';
import {Country} from '../../../components/Country_list';
import { getLocationDataBasedOnPincode } from 'components/common';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
} from '../../../components/regexFunction/index';
import { useTheme } from '@mui/material/styles';
import styled from '@emotion/styled';
import { additionalContactsAction, customerDetailByIdAction, editAdditionalContactsAction } from 'redux/actions/customer_actions';
import { additionalContactsForVendorAction } from 'redux/actions/vendor_actions';

const StyledSelect = styled(Select)({
  '& .MuiSelect-select': {
    textAlign: 'left', // Adjust to control the alignment of the selected value
  },
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};



function CustomerDetailPopup(props) {
  const dispatch = useDispatch();
  const textRef = useRef(null);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
 
  const {status, handleEdit, setStatus, edit_id_data ,customerId,handleClose,handleEditorganization,setIsEdit,isEdit,func1,supplierId} = props
  console.log(handleEdit,"customerId")
  // useEffect(()=>{
  //   if(props.open !== undefined && !props.list_payment_type.length){
  //   dispatch(listPaymentTypeDetails(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //   ))
  //   }
  // },[props.open && !props.list_payment_type.length])


  const [formValues, setFormValues] = useState({  
    gender: null,
    first_name: null,
    phone_number: null,
    email: null,
    designation: null,
    last_name: null,});
  const [requiredFields] = useState([ 
    'gender',
    'first_name',
    'email',
    'phone_number'
  ]);
  const theme = useTheme();
  const [formErrors, setFormErrors] = useState({
    first_name: null,
    phone_number: null,
    email: null,
    gender:null
  });
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: true,
    alternate_phone_number: true,
  });
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
console.log(formValues,"formValues")
  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, []);

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, [props.filtedValue]);
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    console.log(isEdit,edit_id_data,"isEdit")
    if (isEdit && edit_id_data) {
      setFormValues({
        gender: edit_id_data?.gender || null,
        first_name: edit_id_data?.first_name || "",
        phone_number: edit_id_data?.phone_number || "",
        email: edit_id_data?.email || "",
        designation: edit_id_data?.designation || "",
        last_name: edit_id_data?.last_name || "",
      });
    }
  }, [isEdit, edit_id_data]);

  const handleSubmit = async(values) =>{
    console.log('shippingdatas', values,isEdit,customerId,supplierId)
    // values.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        console.log('formErrorsssss', key)
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
        // if (alter[key]) {
        //   if (!alter[key].test(formValues[key])) {
        //     isValid = false;
        //     formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        //   }
        // }
      } 
      return null;
    });
    setFormErrors(formErrorsObj)
    console.log('isvaliddddddddd', isValid)
    if (isValid) {
      values.gender_name = formValues.gender === 1 ? "Male" : formValues.gender === 2 ? "Female" : "Others";
      
      const payload = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        phone_number: formValues.phone_number,
        email: formValues.email,
        designation: formValues.designation,
        gender: formValues.gender,
        customer_id: customerId || undefined,
        supplier_id: supplierId || undefined
      };
  
      if (isEdit === true && edit_id_data?.person_id) {
        dispatch(editAdditionalContactsAction(edit_id_data.person_id, payload));
      } else if (isEdit === false) {
        if (customerId) {
          dispatch(additionalContactsAction(payload));
        } else if (supplierId) {
          dispatch(additionalContactsForVendorAction(payload));
        } else {
          console.error("No valid ID found (customer_id or supplier_id)");
        }
      } else if (props.ApplyButton) {
        console.log("here");
        props.ApplyButton(values);
      } else {
        console.error("No valid ID found (customer_id or supplier_id)");
      }
  
      props.handleClose();
    }
  };

console.log('formValuessss', formValues)
const handleChange = async (e) => {
  let { name, value } = e.target;
  setStateHandler(name, value);
  // validationZipHandler()
  //setInitialState(value)
  //setDirty();
};
const setStateHandler = async (name, value) => {
  let formObj = {};

  formObj = {
    ...formValues,
    [name]: value === '' ? null : value,
  };

  await setFormValues(formObj);
  validationHandler(name, value);
};

const validationHandler = (name, value) => {
  if (!Object.keys(formErrors).includes(name)) return;
 if (
    requiredFields.includes(name) &&
    (value === null ||
      value === 'null' ||
      value === '' ||
      value === false ||
      (typeof value === 'object' && value.value === null))
  ) {
    setFormErrors({
      ...formErrors,
      [name]: capitalize(name) + ' is Required!',
    });
  }
  else if (name === 'email') {
    if (emailValidation(value) !== true) {
      setValidRegex({ ...validRegex, email: false });
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Invalid!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({ ...validRegex, email: true });
    }
  } else if (name === 'phone_number') {
    if (phoneValidation(value) !== true) {
      setValidRegex({ ...validRegex, phone_number: false });
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Invalid!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({ ...validRegex, phone_number: true });
    }
  } 
  else {
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
  }
};



  useEffect(()=>{
     if(status === 'edit' && status !== 'create'){
      console.log('statusss', status)
      setFormValues({    
        gender: edit_id_data?.gender,
        first_name: edit_id_data.first_name,
        phone_number: edit_id_data.phone_number,
        email: edit_id_data.email,
        designation: edit_id_data.designation,
        last_name: edit_id_data.last_name});
      }
      if(status === 'create'){
        console.log('statussscreate', status)
        setFormValues({    gender: null,
          first_name: null,
          phone_number: null,
          email: null,
          designation: null,
          last_name: null});
        }
      setFormErrors({
        first_name: null,
        phone_number: null,
        email: null,
        gender:null
        })
     
  }, [status])
  const initialstate = ()=>{
    setFormValues({    gender: null,
      first_name: null,
      phone_number: null,
      email: null,
      designation: null,
      last_name: null});
  }
  
const keyPress = (e) => {
  if (e.key === "m") {
    setFormValues({ ...formValues, gender: 1 });
  } else if (e.key === "f") {
    setFormValues({ ...formValues, gender: 2 });
  } else if (e.key === "o") {
    setFormValues({ ...formValues, gender: 0 });
  }
};
  

  return (
    <>
      {props.type !== 'custdetails' && <Badge color='secondary' badgeContent={props.count}>
        <AddCircleOutlineIcon onClick={() => {props.handleClose(true); setStatus('create');initialstate();
            // if(!props.list_payment_type.length){
            //   dispatch(listPaymentTypeDetails(
            //     setModalTypeHandler,
            //     setLoaderStatusHandler,
            //   ))
            //   }
        }} />
      </Badge>}
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc", minWidth: '50%'}}>
        <div style={{ marginLeft: "16pc" }}>
                <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
          <Grid container spacing={1.5} direction={'row'}>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <TextField
                   
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='First Name'
                    label='First Name'
                    name='first_name'
                    value={
                      formValues.first_name === null
                        ? ''
                        : formValues.first_name
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                     error={formErrors.first_name === null ? false : true}
                    helperText={
                      formErrors.first_name === null
                        ? ''
                        : 'First Name is Required!'
                    }
                  
                  />
                   {/* {formErrors.first_name && (<div style={{
                                color: theme.palette.error.main,
                                fontSize: '12px',
                                paddingLeft:'10px'
                              }}>
                              <div>First Name is Required!</div>
                            </div>)} */}
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <TextField
                   
                    onChange={handleChange}
                    // onBlur={handleChange}
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Last Name'
                    label='Last Name'
                    name='last_name'
                    value={
                      formValues.last_name === null
                        ? ''
                        : formValues.last_name
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    // error={formErrors.first_name === null ? false : true}
                    // helpertext={
                    //   formErrors.first_name === null
                    //     ? ''
                    //     : formErrors.first_name
                    // }
                  />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <FormControl
                          fullWidth={true}
                          required={true}
                          error={
                            formErrors.gender === null
                              ? false
                              : true
                          }
                          // helpertext={
                          //   formErrors.gender === null ? '' : formErrors.gender
                          // }
                          variant='filled'
                        >
                          <InputLabel
                            variant='filled'
                            htmlFor='uncontrolled-native'
                          >
                            Gender
                          </InputLabel>
                          <StyledSelect
                            name='gender'
                            label='Gender'
                            value={
                              formValues.gender === null
                                ? ''
                                : formValues.gender
                            }
                            onChange={handleChange}
                            onKeyPress={(e) => {
                              setTimeout(() => {
                                keyPress(e);
                              }, 1000);
                            }}
                            inputProps={{
                              name: 'gender',
                              id: 'uncontrolled-native',
                            }}
                          >
                            <MenuItem value={1}>Male</MenuItem>
                            <MenuItem value={2}>Female</MenuItem>
                            <MenuItem value={0}>Others</MenuItem>
                          </StyledSelect>
                          <FormHelperText>{formErrors.gender}</FormHelperText>
                        </FormControl>
                       
               {/* {formErrors.gender && (<div style={{
                            color: theme.palette.error.main,
                            fontSize: '12px',
                            paddingLeft:'10px'
                          }}>
                          <div>Gender is Required!</div>
                        </div>)} */}
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <TextField
                   
                    onChange={handleChange}
                    // onBlur={handleChange}
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Designation'
                    label='Designation'
                    name='designation'
                    value={
                      formValues.designation === null
                        ? ''
                        : formValues.designation
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    // error={formErrors.first_name === null ? false : true}
                    // helpertext={
                    //   formErrors.first_name === null
                    //     ? ''
                    //     : formErrors.first_name
                    // }
                  />
            </Grid> 
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <TextField
                onChange={handleChange}
                // onBlur={handleChange}
                 required={true}
                style={{}}
                fullWidth={true}
                placeholder='Email'
                label='Email'
                name='email'
                value={formValues.email === null ? '' : formValues.email}
                color='primary'
                type='email'
                regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
                variant='filled'
                error={formErrors.email === null ? false : true}
                // helperText={formValues.email === null ? false : formErrors.email === null ? '' : formErrors.email}
                // helpertext={formErrors.email === null ? '' : formErrors.email}
                helperText={
                  formErrors.email === null
                    ? ''
                    : 'Email is Required!'
                }
              />
               {/* {formErrors.email && (<div style={{
                            color: theme.palette.error.main,
                            fontSize: '12px',
                            paddingLeft:'10px'
                          }}>
                          <div>Email is Required!</div>
                        </div>)} */}

            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <TextField
                onChange={handleChange}
                onBlur={handleChange}
                required={true}
                onWheel={ (e) => e.target.blur()}
                style={{}}
                fullWidth={true}
                placeholder='Phone Number'
                label='Phone Number'
                name='phone_number'
                value={
                  formValues.phone_number === null
                    ? ''
                    : formValues.phone_number
                }
                color='primary'
                type='number'
                regex={alter.phone_number}
                variant='filled'
                error={formErrors.phone_number === null ? false : true}
                helperText={
                  formErrors.phone_number === null
                    ? ''
                    : 'Phone Number is Required!'
                }
              />
               {/* {formErrors.phone_number && (<div style={{
                            color: theme.palette.error.main,
                            fontSize: '12px',
                            paddingLeft:'10px'
                          }}>
                          <div>Phone Number is Required!</div>
                        </div>)} */}
            </Grid>
          
          </Grid>

                <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                  {/* <Box> */}
                  {/* <Grid>
                    <Button
                      onClick={() => props.clearButton()}
                      // sx={button}
                      variant='contained'
                      color='secondary'
                    >
                      Clear
                    </Button>
                    
                  </Grid> */}

                  <Grid>
                    <Button
                      onClick={() => status === 'create' ? handleSubmit(formValues): handleEdit(formValues)}
                      // sx={button}
                      variant='contained'
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>

        </Card>
      </Modal>
    </>
  );
}

export default CustomerDetailPopup;
