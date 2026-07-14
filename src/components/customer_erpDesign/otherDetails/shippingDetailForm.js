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
import { additionalContactsForVendorAction, editShippingAddressForVendorAction, shippingAddressForVendorAction } from 'redux/actions/vendor_actions';
import styled from '@emotion/styled';
import { additionalContactsAction, editAdditionalContactsAction, updateShippingAddressAction } from 'redux/actions/customer_actions';
import { Country } from 'components/Country_list';
import { getLocationDataBasedOnPincode } from 'components/common';
import { Cities } from 'utils/cities';
import { phoneValidation } from 'components/regexFunction';

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



function ShippingDetailForm(props) {
  const dispatch = useDispatch();
  const textRef = useRef(null);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
 
  const {formValues, setFormValues, status, handleEdit, setStatus, formErrors, setFormErrors, requiredFields, type, editshippingAddress, customerData ,detailFrom,shippingId,supplierId,handleShipping, customerId, isEdit} = props
  
  console.log('statussssssssssss', status,handleEdit, setFormValues)
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
const StyledSelect = styled(Select)({
  '& .MuiSelect-select': {
    textAlign: 'left',
  },
});

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
    console.log('shippingdatas', values)
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
      return null;
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
        id: props.customerId,
        type: props?.customerId ? 'customer_id' : 'supplier_id',
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
        createdBy: formValues.createdBy,
        updatedBy: formValues.updatedBy,
        zip: formValues.zip || '',
        isPrimary: isPrimary,
        customer_id: customerId
      };

      if (!isPrimary) {
        shippingData.shipping_id = values.shipping_id;
      }
        console.log('CREATE MODE');
        setStatus('create');
        props.ApplyButton(values);
        dispatch(updateShippingAddressAction(shippingData))
    }
  }

  const handleError = async(values) => {
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    console.log(formErrorsObj,formErrors, values,'formErrorsObj')
    await Object.keys(values).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (values[key] === null || values[key] === '')
      ) {
        console.log('formErrorsssss', key)
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } 
      else if(key === 'address'){
        if((values[key]?.length || 0) > 100){
          isValid = false
          formErrorsObj[key] = 'Address exceeded more than 100 characters'
        }
        else{
          isValid = true
          formErrorsObj[key] = null
        }
      }
      else {
        formErrorsObj[key] = null
      }
      return null;
    });
    setFormErrors(formErrorsObj);
  }

console.log(formErrors,'formValuessss', formValues)
  const handleChange = async(event) => {
    const {value, name} = event.target;
    console.log('namevalue', name, value)
    await setFormValues({...formValues, [name]: value});
    await handleError({ [name]: value})
    if (name === 'zip') {
        if (value.length === 6) {
          const locationData = await getLocationDataBasedOnPincode(value);
          if (locationData !== undefined) {
            const { district, state } = locationData;
            if (district && state) {
              console.log('countyyyyyyy', district, state)
              setFormValues({ ...formValues, zip: value, city: district, state });
               setFormErrors({...formErrors,zip:null,city:null,state:null})
              // handleError({ ...formValues, zip: value, city: district, state })
            }
          }
          else {
            setFormErrors({
              ...formErrors,
              zip: "Pincode Not Found",
            });
          }
        }
      }
   
    if (name === 'contactperson_num') {
      if (value.trim() === '') {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else if (!phoneValidation(value)) {
        setFormErrors({
          ...formErrors,
          [name]: 'Person Number is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    }
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
        contactperson_num: null});
      setFormErrors({
          company_name: null,
          contactperson_num: null,
          zip: null,
          state: null,
          city: null,
          address: null,
          area: null
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
  
  const handleStateChange = (event, val) => {
    console.log('statechange')
    if (val !== null) {
      setFormValues({
        ...formValues,
        state: val.state,
      });
      setFormErrors({
        ...formErrors,
        state: null,
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

  const dialogClose = () => {
    props.handleClose(false);
    setStatus('create')
    let formErrorsObj = { ...formErrors };
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
        contactperson_num: null});
      setFormErrors({
          company_name: null,
          contactperson_num: null,
          zip: null,
          state: null,
          city: null,
          address: null,
          area: null
        })
        console.log(formErrorsObj,formErrors,formValues,requiredFields,'formErrorsObj12')
  }

  return (
    <>
      {/* <Badge color='secondary' badgeContent={props.count}>
        <AddCircleOutlineIcon onClick={() => {props.handleClose(true); setStatus('create')
        }} />
      </Badge> */}
      <Modal
        open={props.open}
        onClose={dialogClose}
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
             <IconButton aria-label="close" onClick={dialogClose}>
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
                    style={{}}
                    fullWidth={true}
                    placeholder='Gst'
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
                  />
                )}
              />
            </Grid>
          </Grid>

                <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                  <Grid>
                    <Button
                      onClick={() =>  handleSubmit(formValues)}
                      variant='contained'>
                      {editshippingAddress === "EditShipping" ? "Update" : "Submit"}
                    </Button>
                  </Grid>
                </Grid>

        </Card>
      </Modal>
    </>
  );
}

export default ShippingDetailForm;
