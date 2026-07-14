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
  Checkbox,
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
import { additionalContactsForVendorAction, editShippingAddressForVendorAction, shippingAddressForVendorAction } from 'redux/actions/vendor_actions';
import { emailValidation, phoneValidation } from 'components/regexFunction';
import styled from '@emotion/styled';
import { additionalContactsAction, editAdditionalContactsAction } from 'redux/actions/customer_actions';

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



function ShippingDetailPopup(props) {
  const dispatch = useDispatch();
  const textRef = useRef(null);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
 
  const {formValues, setFormValues, status, handleEdit, setStatus, formErrors, setFormErrors, requiredFields, type, editshippingAddress, customerData ,detailFrom,shippingId,supplierId,handleShipping, customerId, isEdit} = props
  
  useEffect(() => {
    if (detailFrom === 'customer' && status === 'create') {
      setFormValues((prev) => ({
        ...prev,
        gender: null,
        first_name: null,
        phone_number: null,
        email: null,
        designation: null,
        lastname: null
      }));
      setFormErrors((prev) => ({
        ...prev,
        first_name: null,
        phone_number: null,
        email: null,
        gender: null
      }));
    }
  }, [detailFrom]);
  console.log('bankdata',shippingId)
  console.log('statussssssssssss', status,handleEdit, setFormValues)
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
const StyledSelect = styled(Select)({
  '& .MuiSelect-select': {
    textAlign: 'left',
  },
});

  const [formValue, setFormValue] = useState({});
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());

  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const currentDate = new Date()

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const shippingApply = async(values) =>{
   
  console.log('shippingdatas', values)

  props.setorganizationdata([
              ...props.organizationdata,
              values,
            ]);
  // this.setState({formValues : {
  //   gender: null,
  //   first_name: null,
  //   phone_number: null,
  //   email: null,
  //   designation: null,
  //   lastname: null,
  // }})  
}

  const handleAdditionalSubmit = async(values) =>{
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
      else if(key === 'email'){
        if(!emailValidation(values[key])){
          isValid = false
          formErrorsObj[key] = 'Email is Invalid!'
        }
      }
      else if(key === 'phone_number'){
        if(!phoneValidation(values[key])){
          isValid = false
          formErrorsObj[key] = 'Phone Number is Invalid!'
        }
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
        console.log(values, payload, 'additionalsubmit')
        dispatch(editAdditionalContactsAction(edit_id_data.person_id, payload));
      } else if (isEdit === false) {
        console.log(values, payload, 'additionalsubmit1')
        if (customerId) {
          console.log(values, payload, 'additionalsubmit2')
          dispatch(additionalContactsAction(payload));
        } else if (supplierId) {
          console.log(values, payload, 'additionalsubmit3')
          dispatch(additionalContactsForVendorAction(payload));
        } else {
          console.log(values, payload, 'additionalsubmit4')
          console.error("No valid ID found (customer_id or supplier_id)");
        }
      } else if (shippingApply) {
        console.log(values, payload, 'additionalsubmit5')
        console.log("here");
        shippingApply(values);
      } else {
        console.log(values, payload, 'additionalsubmit6')
        console.error("No valid ID found (customer_id or supplier_id)");
      }
  
      props.handleClose();
    }
  };

  const handleSubmit = async(values) =>{
    console.log('comoncomon1', detailFrom)
    if(detailFrom === 'customer' && status !== 'edit') {
      console.log('comoncomon')
      handleAdditionalSubmit(values)
    }
    console.log('shippingdatas', values)
    // values.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    console.log(formErrorsObj,formErrors,formValues,requiredFields,'formErrorsObj')
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        console.log('formErrorsssss', key)
        isValid = false;
        formErrorsObj[key] = capitalize(key)?.replace(/_/g, ' ') + ' is Required!';
      } 
      else if(key === 'address'){
        if((values[key]?.length || 0) > 100){
          isValid = false
          formErrorsObj[key] = 'Address exceeded more than 100 characters'
        }
      }
      else if(key === 'email' && detailFrom === 'customer' && status !== 'edit'){
        if(!emailValidation(values[key])){
          isValid = false
          formErrorsObj[key] = 'Email is Invalid!'
        }
      }
      else if(key === 'phone_number' && detailFrom === 'customer' && status !== 'edit'){
        if(!phoneValidation(values[key])){
          isValid = false
          formErrorsObj[key] = 'Phone Number is Invalid!'
        }
      }
      // return null;
    });

    if (formValues.contactperson_num) {
      if (!phoneValidation(formValues.contactperson_num)) {
        isValid = false;
        formErrorsObj.contactperson_num = 'Person Number is Invalid!';
      }
    }

    setFormErrors(formErrorsObj);
    console.log('isvaliddddddddd', isValid)
    if(isValid){
          values.pin_code = formValues.zip;
      const isPrimary = !formValues.shipping_id ? true : false;

      let shippingData = {
        company_id: formValues.company_id,
        company_name: formValues.company_name,
        contactperson_name: formValues.contactperson_name || null,
        contactperson_num: formValues.contactperson_num || null,
        Gst: formValues.Gst || null,
        address: formValues.address || '',
        latitude: formValues.latitude || null,
        longitude: formValues.longitude || null,
        area: formValues.area || '',
        city: formValues.city || '',
        state: formValues.state || '',
        pin_code: formValues.pin_code || '',
        country: formValues.country || '',
        deleted: formValues.deleted || 0,
        createdAt: formValues.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: formValues.createdBy || 333,
        updatedBy: formValues.updatedBy || 333,
        customer_id: formValues.customer_id,
        zip: formValues.zip || '',
        isPrimary: isPrimary,
        gst: formValues.gst,
      };

      if (!isPrimary) {
        shippingData.shipping_id = values.shipping_id;
      }

         if (editshippingAddress === "EditShipping") {
      console.log('EDIT MODE');
      if (detailFrom === 'customer') {
        props.handleEdit(shippingData);
        props.handleClose();
      } else {
        const shippingDataEdit = [...formValues.fullList];
        const indexToUpdate = shippingDataEdit.findIndex(
          (item) => item.shipping_id === shippingData.shipping_id
        );

        if (indexToUpdate !== -1) {
          shippingDataEdit[indexToUpdate] = {
            ...shippingDataEdit[indexToUpdate],
            ...shippingData,
          };
        }
  
          console.log('Updated List:', shippingData);
  
          props.ApplyButton(shippingData);
          props.handleClose();
        }

        
      } else {
        console.log('CREATE MODE');
        setStatus('create');
        props.ApplyButton(values);
      }
    }
  }
  
  
  

  const handleError = async(name, value) => {
    // let isValid = true;
    // let formErrorsObj = { ...formErrors };
    // console.log(formErrorsObj,formErrors, values,'formErrorsObj')
    // await Object.keys(values).map((key, i) => {
    //   if (
    //     requiredFields.includes(key) &&
    //     (values[key] === null || values[key] === '')
    //   ) {
    //     console.log('formErrorsssss', key)
    //     isValid = false;
    //     formErrorsObj[key] = capitalize(key) + ' is Required!';
    //   } 
    //   else if(key === 'address'){
    //     if((values[key]?.length || 0) > 100){
    //       isValid = false
    //       formErrorsObj[key] = 'Address exceeded more than 100 characters'
    //     }
    //     else{
    //       isValid = true
    //       formErrorsObj[key] = null
    //     }
    //   }
    //   else {
    //     formErrorsObj[key] = null
    //   }
    //   return null;
    // });
    // setFormErrors(formErrorsObj);
    if(requiredFields.includes(name) && value === null || value === 'null' || value === '') {
      setFormErrors({
          ...formErrors,
          [name] : capitalize(name.replace(/_/g, '')) + ' is Required'
      })
    }
    else {
      setFormErrors({...formErrors, [name] : null})
    }
  }

console.log(formErrors,'formValuessss', formValues)
  const handleChange = async(event) => {
    const {value, name} = event.target;
    console.log('namevalue', name, value)
    await setFormValues({...formValues, [name]: value});
    await handleError(name, value)
    if (name === 'zip') {
        if (value.length === 6) {
        //   setLoader(true)
          const locationData = await getLocationDataBasedOnPincode(value);
          if (locationData !== undefined) {
            const { district, state } = locationData;
            if (district && state) {
              // textRef.current.focus();
              console.log('countyyyyyyy', district, state)
              setFormValues({ ...formValues, zip: value, city: district, state });
              // handleError({ ...formValues, zip: value, city: district, state })
              setFormErrors((prev) => ({
                ...prev,
                zip: null,
                city: null,
                state: null
              }))
            }
          }
          else {
            // setLoader(false)
            setFormErrors((prev) => ({
              ...prev,
              zip: "Pincode Not Found",
            }));
          }
        }
      }
   
    if (name === 'phone_number') {
      if (value.trim() === '') {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Phone Number is Required!',
        }));
      } else if (!phoneValidation(value)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Phone Number is Invalid!',
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }

    if (name === 'email') {
      if (value.trim() === '') {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Email is Required!',
        }));
      } else if (!emailValidation(value)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Email is Invalid!',
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }

    if((name === 'contactperson_num')){
      if (!phoneValidation(value)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Person Number is Invalid!',
        }));
      }
      else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }


    // props.filterHandler(name,value)
  };

  useEffect(()=>{
     if(status === 'create' && editshippingAddress!== "EditShipping" ){
      console.log('statusss', status)
      setFormValues({ company_name: null,
        isPrimary: false,
        city: null,
        state: null,
        zip: null,
        country: 'India',
        latitude : null,
        longitude : null,
        address : null,
        area : null,
        first_name: null,
        gender: null,
        email: null,
        phone_number: null,
        contactperson_num: null});
      setFormErrors({
          company_name: null,
          contactperson_num: null,
          zip: null,
          state: null,
          city: null,
          address: null,
          area: null,
          first_name: null,
          gender: null,
          email: null,
          phone_number: null
        })
     }
  }, [status])

  const handleCityChange = (event, val) => {
    console.log('citychange')
    if (val !== null) {
      setFormValues({
        ...formValues,
        city: val.name,
        state: val.state,
      });
      setFormErrors({
        ...formErrors,
        city: null, 
        state: null, 
      });
    } else {
      setFormValues({
        ...formValues,
        city: null,
      });
      setFormErrors({
        ...formErrors,
        city: 'City is required',
      });
    }
  };

  const keyPress = (e) => {
  if (e.key === "m") {
    setFormValues({ ...formValues, gender: 1 });
  } else if (e.key === "f") {
    setFormValues({ ...formValues, gender: 2 });
  } else if (e.key === "o") {
    setFormValues({ ...formValues, gender: 0 });
  }
};
  
  const handleStateChange = (event, val) => {
    console.log('statechange')
    if (val !== null) {
      setFormValues({
        ...formValues,
        state: val.state,
      });
      setFormErrors({
        ...formErrors,
        state: null, // Clear state error
      });
    } else {
      setFormValues({
        ...formValues,
        state: null,
      });
      setFormErrors({
        ...formErrors,
        state: 'State is required',
      });
    }
  };

  console.log(formValues,'ghdstt666')

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <AddCircleOutlineIcon onClick={() => {props.handleClose(true); setStatus('create')
        }} />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{ overflow: 'auto', minWidth: '50%' }}>
        <>
          {(props.customerData?.address === null || props.customerData?.address === 'null' || props.customerData?.address === "") && editshippingAddress !== "EditShipping" && (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={formValues.isPrimary || false}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      isPrimary: e.target.checked,
                    }))
                  }
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Primary Shipping Address
                </Typography>
              }
            />
           
          </Box>
            )}
             <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
              <CloseIcon />
            </IconButton>
          </>
            
          <Grid container spacing={1.5} direction={'row'}>
            {detailFrom === 'customer' && <Grid
              display='flex'
              justifyContent='start'
              margin='0px 0px 10px 0px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <Typography variant='h6'> Shipping Address </Typography>
            </Grid>}
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
                    placeholder='Company Name'
                    label='Company Name'
                    name='company_name'
                    value={
                      formValues.company_name === null
                        ? ''
                        : formValues.company_name
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    error={formErrors.company_name !== null}
                    helperText={formErrors.company_name === null ? '' : formErrors.company_name}
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
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Person Name'
                    label='Person Name'
                    name='contactperson_name'
                    value={
                      formValues.contactperson_name === null
                        ? ''
                        : formValues.contactperson_name
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
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Person Number'
                    label='Person Number'
                    name='contactperson_num'
                    value={formValues.contactperson_num || ''}
                    color='primary'
                    type='number' 
                    regex=''
                    variant='filled'
                    error={!!formErrors.contactperson_num}
                    helperText={formErrors.contactperson_num || ''}
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
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Gst'
                    disabled = {formValues.gst === '0' }
                    label='Gst'
                    name='Gst'
                     value={
                      formValues.Gst === null
                        ? ''
                        : formValues.Gst
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    // error={formErrors.Gst === null ? false : true}
                    // helpertext={
                    //   formErrors.Gst === null
                    //     ? ''
                    //     : formErrors.Gst
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
                    required={requiredFields.includes('address')}
                    style={{}}
                    fullWidth={true}
                    placeholder='Address'
                    label='Address'
                    name='address'
                    value={
                      formValues.address === null
                        ? ''
                        : formValues.address
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    error={requiredFields.includes('address') && formErrors.address === null ? false : true}
                    helperText={
                      requiredFields.includes('address') && formErrors.address === null
                        ? ''
                        : formErrors.address
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
                    // onBlur={handleChange}
                    required={requiredFields.includes('area')}
                    style={{}}
                    fullWidth={true}
                    placeholder='Area'
                    label='Area'
                    name='area'
                    value={
                      formValues.area === null
                        ? ''
                        : formValues.area
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    error={requiredFields.includes('area') && formErrors.area === null ? false : true}
                    helperText={
                      requiredFields.includes('area') && formErrors.area === null
                        ? ''
                        : formErrors.area
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
                    // onBlur={handleChange}
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Latitude'
                    label='Latitude'
                    name='latitude'
                    value={
                      formValues.latitude === null
                        ? ''
                        : formValues.latitude
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
                    // required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Longitude'
                    label='Longitude'
                    name='longitude'
                    value={
                      formValues.longitude === null
                        ? ''
                        : formValues.longitude
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
                onWheel={ (e) => e.target.blur()}
                placeholder='PinCode'
                label='Pincode'
                name='zip'
                value={formValues.zip  === null ? '' :  formValues.zip}
                color='primary'
                type='number'
                regex=''
                variant='filled'
                error={formErrors.zip !== null}
                helperText={formErrors.zip === null ? '' : formErrors.zip}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <Autocomplete
                    fullWidth={true}
                    required={true}
                value={{name: formValues.city === null ? '' : formValues.city || ''}}
                name='city'
                onChange={handleCityChange}
                id='free-solo-dialog-demo'
                options={[...Cities]}
                getOptionLabel={(city) => city.name}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='city'
                    variant='filled'
                    error={formErrors.city === null ? false : true}
                    helperText={formErrors.city || ''}
                    required={true}
                  />
                )}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <Autocomplete
                    fullWidth={true}
                name='state'
                // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
                value={{
                  state: formValues.state === null ? '' : formValues.state || '',
                }}
                options={_.uniqBy(Cities, 'state')}
                getOptionLabel={(options) => options.state}
                onChange={handleStateChange}
                autoHighlight={true}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='State'
                    variant='filled'
                    error={formErrors.state === null ? false : true} 
                    helperText={formErrors.state === null ? '' : formErrors.state}
                    required={true}
                  />
                )}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
            <Autocomplete
                fullWidth={true}
                name='country'
                //  defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.country) : ""}`}
                //defaultValue
                value={{name: formValues.country || ''}}
                options={Country}
                getOptionLabel={(options) => options.name}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormValues({
                      ...formValues,
                      country: newValue.name,
                    });
                  }
                }}
                autoHighlight={true}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Country'
                    variant='filled'
                    //error = { formErrors.country === null ? false : true } helpertext = { formErrors.country === null ? '' : formErrors.country } required={true}
                  />
                )}
              />
            </Grid>
          </Grid>

          {(detailFrom === 'customer' && status !== 'edit') && 
          <Grid container spacing={1.5} direction={'row'}>
            <Grid
              display='flex'
              justifyContent='start'
              margin='10px 0px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <Typography variant='h6'> Additional Contacts </Typography>
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
                  formErrors.email
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
                  formErrors.phone_number
                }
                 InputProps={{
                  inputProps: { min: 0 }, 
                  sx: {
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    "& input[type=number]::-webkit-outer-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                  },
                }}
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
          }

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
                      onClick={() =>  handleSubmit(formValues)}
                      // sx={button}
                      variant='contained'
                    >
                      {editshippingAddress === "EditShipping" && status === 'edit' ? "Update" : "Submit"}
                    </Button>
                  </Grid>
                </Grid>

        </Card>
      </Modal>
    </>
  );
}

export default ShippingDetailPopup;
