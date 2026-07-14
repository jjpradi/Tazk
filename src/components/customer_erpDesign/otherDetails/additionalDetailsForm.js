import React, {useEffect, useState, useContext, useRef} from 'react';
import { Modal, Card, Button, TextField, MenuItem, InputLabel, Select, FormControl, Grid, FormHelperText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import {useDispatch, useSelector} from 'react-redux';
import styled from '@emotion/styled';
import { additionalContactsAction, customerDetailByIdAction, editAdditionalContactsAction, getUpdateOtherDetailsAction, updateAdditionalContactAction } from 'redux/actions/customer_actions';
import { additionalContactsForVendorAction } from 'redux/actions/vendor_actions';
import { emailValidation, phoneValidation } from 'components/regexFunction';

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



function AdditionalDetailsForm(props) {
  const dispatch = useDispatch();
  const {customerReducer: { getOtherDetails }} = useSelector(state => state)
  const {status, handleEdit, setStatus, edit_id_data ,customerId,handleClose,handleEditorganization,setIsEdit,isEdit,func1,supplierId, formValues, setFormValues, requiredFields, formErrors, setFormErrors, customerDetailById} = props
  console.log(customerDetailById,customerDetailById?.customer_id,customerId, getOtherDetails,"customerId")
  
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: true,
    alternate_phone_number: true,
  });
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
console.log(formValues,"formValues")
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
      } 
      return null;
    });
    setFormErrors(formErrorsObj)
    console.log('isvaliddddddddd', isValid, requiredFields, formValues, requiredFields)
    if (isValid) {
      values.gender_name = formValues.gender === 1 ? "Male" : formValues.gender === 2 ? "Female" : "Others";
      const data = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        phone_number: formValues.phone_number,
        email: formValues.email,
        designation: formValues.designation,
        gender: formValues.gender,
        customer_id: customerId,
        person_id: customerDetailById?.person_id || null,
        seq: 1,
        status: 0
      };
dispatch(updateAdditionalContactAction(data))
dispatch(getUpdateOtherDetailsAction(customerId))
      props.handleClose();
    }
  };

console.log('formValuessss', formValues)
const handleChange = async (e) => {
  let { name, value } = e.target;
  setStateHandler(name, value);
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
  
const dialogClose = () => {
props.handleClose(false)
setFormErrors({
        first_name: null,
        phone_number: null,
        email: null,
        gender:null
        })
         setFormValues({    
          gender: null,
          first_name: null,
          phone_number: null,
          email: null,
          designation: null,
          last_name: null});
}

  return (
    <>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{overflow:'auto', maxHeight:"38pc", minWidth: '50%'}}>
        <div style={{ marginLeft: "16pc" }}>
                <IconButton aria-label="close" onClick={dialogClose}>
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
                helperText={
                  formErrors.email === null
                    ? ''
                    : 'Email is Required!'
                }
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
            </Grid>
          </Grid>

                <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                  <Grid>
                    <Button
                      onClick={() => handleSubmit(formValues)}
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

export default AdditionalDetailsForm;
