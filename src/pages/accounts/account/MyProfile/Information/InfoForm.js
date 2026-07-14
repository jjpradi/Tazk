import React, {useEffect, useContext, useRef, useState} from 'react';
import AppGridContainer from '../../../../../@crema/core/AppGridContainer';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IntlMessages from '../../../../../@crema/utility/IntlMessages';
import Box from '@mui/material/Box';
import {Button} from '@mui/material';
import {Form} from 'formik';
import AppTextField from '../../../../../@crema/core/AppFormComponents/AppTextField';
import PropTypes from 'prop-types';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
// import countries from '../../../../@crema/services/db/account/countries';
import {Cities} from '../../../../../utils/cities';
import {getLocationDataBasedOnPincode} from '../../../../../components/common';
import {Country} from '../../../../../components/Country_list';
import _ from 'lodash';
import SimpleBackdrop from 'pages/common/Loader';


const InfoForm = ({values, setFieldValue, formValues}) => {
  const textRef = useRef(null);
  const [loader, setLoader] = useState(false)
  const [formErrors, setFormErrors] = useState({ zip: null })
  useEffect(() => {
    const data = formValues[0] || {}
    // dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));
    Object.keys(data).map((d)=>{
      setFieldValue(d,  data[d])
    })
   
  }, [formValues]);
  // useEffect(()=>{
  //   if (values === 'zip') {
  //     if (value.length === 6) {
  //       const locationData =  getLocationDataBasedOnPincode(value);
  //       const {county, state} = locationData;
  //       if (county && state) {
  //         textRef.current.focus();
  //         setFormValues({...formValues, zip: value, city: county, state});
  //       }
  //     }
  //   }
  // },[])
  // const handleChange = async (e) => {
  //   let {name, value} = e.target;
  //   // setStateHandler(name, value);
  //   if (name === 'zip') {
  //     if (value.length === 6) {
  //       const locationData = await getLocationDataBasedOnPincode(value);
  //       const {county, state} = locationData;
  //       // if (county && state) {
  //         // textRef.current.focus();
  //         // setFieldValue({...values,zip: value, city: 'hiii', state});
  //       // }
  //     }
  //   }
  // };

  const handleChange = async (e) => {

    let {name, value} = e.target;
    setFieldValue('zip', value);
    if (name === 'zip') {
      if(value !== ''){
        if (value.length === 6) {
          setLoader(true)
          const locationData = await getLocationDataBasedOnPincode(value);
          if(locationData !== undefined){
            const {district, state} = locationData;
            if (district && state) {
              console.log('sdsfffg', value, district, state)
              setFieldValue('zip', value);
              setFieldValue('city', district);
              setFieldValue('state', state);
              setFormErrors({
                ...formErrors,
                zip:null
              });
              setLoader(false)
            }
          }    
          else{
              setLoader(false)
              setFormErrors({
              ...formErrors,
            zip: "Pincode is Not Found",
            });
          }
        }
        else{
          setFormErrors({
            ...formErrors,
          zip: "Pincode is Not Found",
          });
        }
      }
      else{
        setFormErrors({
          ...formErrors,
        zip: "Pincode is required",
        });
      }
    }
  }

  console.log('asdfasfse', formErrors.zip)
 
  return (
    <Form autoComplete='off'>
      <AppGridContainer spacing={4}>
      <Grid
        size={{
          xs: 12,
          md: 12
        }}>
          <AppTextField
            multiline
            name='area'
            rows={3}
            fullWidth
            // label={<IntlMessages id='common.yourBioDataHere' />}
            label={'Area'}
            
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 12
          }}>
          <AppTextField
            multiline
            name='address'
            rows={3}
            fullWidth
            // label={<IntlMessages id='common.yourBioDataHere' />}
            label={'Address'}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 12
          }}>
          {/* <AppTextField
            multiline
            name='zip'
            rows={1}
            fullWidth
             value = {values.zip}
               //onKeyUp={(e)=>handleChange(e)}
             // onChange={(e)=>handleChange(e)}
            // onBlur={(e)=>handleChange(e)}
            // label={<IntlMessages id='common.yourBioDataHere' />}
            label={'Zip'}
          /> */}
          <TextField
              onChange={handleChange}
              onBlur={handleChange}
              // required={true}
              style={{}}
              fullWidth={true}
              onWheel={ (e) => e.target.blur()}
              placeholder='PinCode'
              label='Pincode'
              name='zip'
              value={values.zip === null ? '' : values.zip}
              color='primary'
              type='number'
              regex=''
              variant='outlined'              
              error={formErrors.zip === null ? false : true}
              helperText={formErrors.zip === null ? '' : formErrors.zip }
            />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Autocomplete
            id='country-select-demo'
            fullWidth
            options={_.uniqBy(Cities, 'name')}
            value={{name: values.city === null ? '' : values.city}}
            name='city'
            autoHighlight
            selectOnFocus
            onChange={(_, newValue) => {
              if(newValue !== null){
                setFieldValue('city', newValue.name);
              }
            }}
            getOptionLabel={(city) => city.name? city.name : ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label={'City'}
                readOnly
              />
            )}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Autocomplete
            id='country-select-demo'
            fullWidth
            options={_.uniqBy(Cities, 'state')}
            value={{state: values.state === null ? '' : values.state}}
            name='state'
            autoHighlight
            selectOnFocus
            onChange={(_, newValue) => {
              if(newValue !== null){
                setFieldValue('state', newValue.state);
              }
            }}
            
            getOptionLabel={(city) => city.state? city.state : ''}
            renderInput={(params) => (
              <TextField
                {...params}
                // label={<IntlMessages id='common.country' />}
                label={'State'}
                InputProps={{
                  ...params.InputProps,
                  readOnly: true,
                }}
                // inputProps={{
                //   ...params.inputProps,
                // }}
              />
            )}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Autocomplete
            id='country-select-demo'
            fullWidth
            options={Country}
            value={{name: values.country === null ? '' : values.country}}
            name='country'
            autoHighlight
            onChange={(_, newValue) => {
              if(newValue !== null){
                setFieldValue('country', newValue.name);
              }
            }}
            // onChange={(e, val) =>
            //   // val !== null
            //   //   ? 
            //     setFieldValue({
            //         ...values,
            //         city: val.name,
            //         state: val.state,
            //       })
            //    // : ''
            // }
            getOptionLabel={(country) => country.name? country.name : ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label={'Country'}
                InputProps={{
                  ...params.InputProps,
                  readOnly: true,
                }}              
              />
            )}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: 'relative',
              '& .MuiTextField-root': {
                width: '100%',
              },
            }}
          >
            <DatePicker
              label={<IntlMessages id='common.birthDate' />}
              value={values.dob}
              onChange={(newValue) => {
                setFieldValue('dob', newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </Grid> */}
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            id='country-select-demo'
            fullWidth
            options={[]}
            name='country'
            autoHighlight
            onChange={(_, newValue) => {
              setFieldValue('country', newValue);
            }}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
              <Box
                component='li'
                sx={{'& > img': {mr: 2, flexShrink: 0}}}
                {...props}
              >
                <img
                  loading='lazy'
                  width='20'
                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                  alt=''
                />
                {option.label} ({option.code}) +{option.phone}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={<IntlMessages id='common.country' />}
                inputProps={{
                  ...params.inputProps,
                }}
              />
            )}
          />
        </Grid> */}
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <AppTextField
            name='website'
            fullWidth
            label={<IntlMessages id='common.website' />}
          />
        </Grid> */}
        {/* <Grid size={{ xs: 12, md: 6 }}>
          <AppTextField
            fullWidth
            name='phone'
            label={<IntlMessages id='common.phoneNumber' />}
          />
        </Grid> */}
        <Grid
          size={{
            xs: 12,
            md: 12
          }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Button
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
            {/* <Button
              sx={{
                position: 'relative',
                minWidth: 100,
                ml: 2.5,
              }}
              color='primary'
              variant='outlined'
              type='cancel'
            >
              <IntlMessages id='common.cancel' />
            </Button> */}
          </Box>
        </Grid>
      </AppGridContainer>
      { loader&&<SimpleBackdrop loader={loader}/>}
    </Form>
  );
};

export default InfoForm;
InfoForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
};
