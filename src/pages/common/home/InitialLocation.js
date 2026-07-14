import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Button, TextField, Typography, Grid, InputAdornment, IconButton, Modal, Dialog, DialogContent, DialogActions } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import SimpleBackdrop from 'pages/common/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { location_typeAction, stockLocationPaginationAction } from 'redux/actions/stock_Location_actions';
import apiCalls from 'utils/apiCalls';
import { Info } from '@mui/icons-material';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { ProperCaseFunc } from 'utils/properCase';
import { getLocationDataBasedOnPincode } from 'components/common';
import context from '../../../context/CreateNewButtonContext'
import UnSavedChangesWarning from 'pages/common/unChangeswarning';
import { Cities } from 'utils/cities';
import CancelDialog from 'components/CancelDialog';
import { Country } from 'components/Country_list';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
  bssIdValidation,
  locationcodeValidation,
  longitudeValidation,
  latitudeValidation
} from 'components/regexFunction';
import { getTrimmedData } from 'components/trimFunction';

function InitialLocation(props) {
  const textRef = useRef(null);

  const dispatch = useDispatch()
  const { stockLocationReducer: { location_type }, appConfigReducer: { app_config_data }, UserCreationReducer: { all_user_location } } = useSelector(s => s)
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context)

  console.log('app_config_data', all_user_location);

  const [formValues, setFormValues] = useState({
    location_name: null,
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    description: null,
    email: null,
    phone_number: null,
    location_type_id: null,
    location_type: props.pageType === 'detailpage' ? 'Default Location' : null,
    location_code: null,
    bssId: '',
    macId: null,
  });
  const [formErrors, setFormErrors] = useState({
    location_name: null,
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    description: null,
    email: null,
    phone_number: null,
    location_type: null,
    location_type_id: null,
    location_code: null,
    bssId: null,
    macId: null,
  });

  const [value, setValue] = React.useState([]);
  const filter = createFilterOptions();

  const [loader, setLoader] = useState(false)

  const [wifiAttendance, setWifiAttendance] = useState(false);

  useEffect(() => {
    const body = {
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler, (response) => { })),
      dispatch(stockLocationPaginationAction(body))
    )
  }, [])

  useEffect(() => {

      const usableLocations = all_user_location?.filter((d) => d.location_type !== 'Scrap');

     if (usableLocations?.length > 0) {
      setFormValues({
        ...formValues,
        location_code: usableLocations[0]?.location_code,
        location_name: usableLocations[0]?.location_name,
        location_type_id: usableLocations[0]?.location_type,
        latitude: usableLocations[0]?.latitude,
        longitude: usableLocations[0]?.longitude,
        email: usableLocations[0]?.email,
        address: usableLocations[0]?.address,
        phone_number: usableLocations[0]?.phone_number,
        description: usableLocations[0]?.description,
        zip: usableLocations[0]?.zip,
        bssId: usableLocations[0]?.bssId,
        macId: usableLocations[0]?.macId,
        city: usableLocations[0]?.city,
        state: usableLocations[0]?.state,
        // country: usableLocations[0]?.country,
        location_id: usableLocations[0]?.location_id
      })
      const latvalue = usableLocations[0]?.latitude;
      const lat = parseFloat(latvalue);
      const longvalue = usableLocations[0]?.longitude;
      const lng = parseFloat(longvalue);
      if (lat < -90 || lat > 90) {
        setFormErrors({ ...formErrors, latitude: "Invalid Latitude." })
      } else {
        setFormErrors({ ...formErrors, latitude: null })
      }
      if (lng < -180 || lng > 180) {
        setFormErrors({ ...formErrors, longitude: "Invalid Longitude" })
      } else {
        setFormErrors({ ...formErrors, longitude: null })
      }
    }
  }, [all_user_location])


  const isQrAttendanceEnabled = app_config_data?.find(item => item.key_name === "qr.attendance")?.value === "true" ? true : false;

  useEffect(() => {
    let wifi = app_config_data?.find(item => item.key_name === "wifi.attendance");
    let result = wifi?.value === "false" ? false : true;
    setWifiAttendance(result)
  }, [app_config_data])

  const requiredFields = [
    'location_name',
    'zip',
    'location_type',
    'location_code',
    'latitude',
    'longitude',
    ...(wifiAttendance ? ['bssId'] : []),
    ...(isQrAttendanceEnabled ? ['macId'] : []),
  ]

  console.log('requiredFields', requiredFields, isQrAttendanceEnabled, app_config_data);

  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [open, setOpen] = useState(false);
  const [helpDialogText, setHelpDialogText] = useState("");

  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: false,
    location_code: false,
    bssId: false,
    zip: false
  });
  const [isLoadingLocationData, setIsLoadingLocationData] = useState(false)

  const initsform = () => {
    setInitialState(formValues);
    if (!location_type.length) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(location_typeAction())
      )
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };

  console.log("asdad", formValues)
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let { name, value } = e.target;

    if (name === "location_code") {
    value = value.toUpperCase();

    if (value.length > 4) {
      value = value.slice(0, 4);
    }
  }

    setStateHandler(name, value);

    if (name === 'zip') {
      if (!isLoadingLocationData) {
        setIsLoadingLocationData(true)
        if (value !== '') {
          if (value.length === 6) {
            setLoader(true)
            const locationData = await getLocationDataBasedOnPincode(value);
            if (locationData !== undefined) {
              const { district, state } = locationData;
              if (district && state) {
                textRef.current.focus();
                await setFormValues({ ...formValues, zip: value, city: district, state: state });
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  zip: null,
                  city: null,
                  state: null,
                }));
                setLoader(false)
              }
            }
            else {
              setLoader(false)
              setFormErrors({
                ...formErrors,
                zip: "Pincode Not Found",
              });
            }
          }
          else {
            setLoader(false)
            setFormErrors({
              ...formErrors,
              zip: "Pincode maximum length is 6 digits",
            });
          }
        }
        else {
          setFormErrors({
            ...formErrors,
            zip: "Pincode is required",
          });
        }
        setIsLoadingLocationData(false);
      }
    }
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
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
        (Object.keys(value) && value.value === null))
    ) {
      if (name === 'zip') {
        setFormErrors({
          ...formErrors,
          [name]: 'Pincode is Required!',
        });
      }
      else {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name.replace(/_/g, ' ')) + ' is Required!',
        });
      }
    }

    else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else if (name === 'email' && value !== null && value !== '') {
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
    } else if (name === 'bssId' && value !== null && value !== '') {
      if (bssIdValidation(value) !== true) {
        setValidRegex({ ...validRegex, bssId: false });
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({ ...validRegex, bssId: true });
      }
    } else if (name === 'phone_number' && value !== null && value !== '') {
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
    else if (name === 'location_code') {
      if (/^[A-Z0-9]{4}$/.test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name).replace('_', ' ') + 'must be exactly 4 characters (A–Z, 0–9)',
        });
      }
    }
    else if (name === 'zip') {
      if (value !== '') {
        if (value.length === 6) {
          setFormErrors({
            ...formErrors,
            zip: null,
          });
        }
        else {
          setLoader(false)
          setFormErrors({
            ...formErrors,
            zip: "Pincode maximum length is 6 digits",
          });
        }
      }
      else {
        setFormErrors({
          ...formErrors,
          zip: "Pincode is required",
        });
      }
    }
    else if (name === 'longitude') {
      const longvalue = formValues?.longitude == null ? all_user_location[0]?.longitude : formValues?.longitude;
      const lng = longvalue?.toString().split('.')[0];
      if (lng < -180 || lng > 180) {
        setFormErrors({ ...formErrors, longitude: "Invalid Longitude" })
      } else {
        setFormErrors({ ...formErrors, longitude: null })
      }
    }
    else if (name === 'latitude') {
      const latvalue = formValues?.latitude == null ? all_user_location[0]?.latitude : formValues?.latitude;
      const lat = latvalue?.toString().split('.')[0];
      if (lat < -90 || lat > 90) {
        setFormErrors({ ...formErrors, latitude: "Invalid Latitude." })
      } else {
        setFormErrors({ ...formErrors, latitude: null })
      }
    }
    else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };

    await Object.keys(formValues).forEach((key) => {
      if (requiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
        isValid = false;
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
      }
    });

    if (!isValid) {
      await setFormErrors(formErrorsObj);
      return;
    }

    Object.keys(validRegex).forEach((key) => {
      if (key === 'location_code' && formValues[key] !== null && formValues[key] !== '') {
        if (locationcodeValidation(formValues[key]) !== true) {
          setValidRegex({ ...validRegex, location_code: false });
          formErrorsObj[key] = 'Location code is Invalid!';
          isValid = false;
        } else {
          setValidRegex({ ...validRegex, location_code: true });
        }
      }

      if (key === 'zip' && formErrors.zip !== null) {
        isValid = false;
      }

      if (key === 'bssId' && formValues[key] !== null && formValues[key] !== '') {
        if (bssIdValidation(formValues[key]) !== true) {
          setValidRegex({ ...validRegex, bssId: false });
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
          isValid = false;
        } else {
          setValidRegex({ ...validRegex, bssId: true });
        }
      }
    });

    await setFormErrors(formErrorsObj);
    
    if (formErrors.latitude !== null || formErrors.longitude !== null) {
      isValid = false;
      return
    }

    if (isValid) {
      delete formValues.locationtypename;
      props.handleSubmit(getTrimmedData(formValues));
      if (props.pageType == 'detailpage') {
        props.handleNext()
      }
    }
  };
  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      setFormValues(props.edit_id_data[0]);
      setInitialState(props.edit_id_data[0]);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  const handleAutocompleteBlur = (field) => (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} is Required!`,
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };
console.log(props.pageType,'dfdsfdsfsdfssdfsdf')

  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
        {props.status === 'edit' ? "Update Stock Location" : "Location"}
      </Typography>
      <Grid
        spacing={3}
        container
        direction='row'
      >
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Location name'
            label='Location name'
            name='location_name'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues?.location_name === null ? '' : formValues?.location_name
            }
            error={formErrors?.location_name === null ? false : true}
            helperText={
              formErrors?.location_name === null ? '' : 'Location name is Required!'
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            fullWidth={true}
            placeholder=' Enter Location Code'
            label='Location Code'
            name='location_code'
            color='primary'
            type='text'
            // regex={/^[A-Z0-9]{4}$/}
            variant='filled'
            value={
              formValues?.location_code === null ? '' : formValues?.location_code
            }
            error={formErrors?.location_code === null ? false : true}
            helperText={
              formErrors?.location_code === null ? '' : formErrors?.location_code
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value.replace(/[^0-9.-]/g, ''); // Allows only numbers, decimals, and negative signs
              handleChange({ target: { name: 'latitude', value: numericValue } });
            }}
            // onBlur={(e) => {
            //   const value = e.target.value;
            //   const lat = parseFloat(value);
            //   if (lat < -90 || lat > 90) {
            //     // You can set error state here
            //     formErrors.latitude = "Invalid Latitude.";
            //   } else {
            //     handleChange({ target: { name: 'latitude', value: value } });
            //   }
            // }}
            required={true}
            fullWidth={true}
            onWheel={(e) => e.target.blur()} // Disable number scrolling
            placeholder="Enter Latitude"
            label="Latitude"
            name="latitude"
            color="primary"
            variant="filled"
            value={formValues?.latitude === null ? '' : formValues?.latitude}
            error={Boolean(formErrors?.latitude)}
            helperText={formErrors?.latitude || ''}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value.replace(/[^0-9.-]/g, ''); // Allows only numbers, decimals, and negative signs
              handleChange({ target: { name: 'longitude', value: numericValue } });
            }}
            // onBlur={(e) => {
            //   const value = e.target.value;
            //   const lng = parseFloat(value);
            //   if (lng < -180 || lng > 180) {
            //     // You can set error state here
            //     formErrors.longitude = "Invalid Longitude";
            //   } else {
            //     handleChange({ target: { name: 'longitude', value: value } });
            //   }
            // }}
            required={true}
            fullWidth={true}
            onWheel={(e) => e.target.blur()} // Disable number scrolling
            placeholder="Enter Longitude"
            label="Longitude"
            name="longitude"
            color="primary"
            variant="filled"
            value={formValues?.longitude === null ? '' : formValues?.longitude}
            error={Boolean(formErrors?.longitude)}
            helperText={formErrors?.longitude || ''}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TextField
           onChange={(e) => {
            const value = e.target.value;
            const numericValue = value.replace(/[^0-9.-]/g, '');
            handleChange({ target: { name: 'latitude', value: numericValue } });
          }}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder=' Enter Latitude'
            label='Latitude'
            name='latitude'
            color='primary'
            multiline={false}
            type='text'
            variant='filled'
            value={formValues?.latitude === null ? '' : formValues?.latitude}
            error={formErrors?.latitude === null ? false : true}
            helperText={formErrors?.latitude === null ? '' : formErrors?.latitude}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TextField
           onChange={(e) => {
            const value = e.target.value;
            const numericValue = value.replace(/[^0-9.-]/g, '');
            handleChange({ target: { name: 'longitude', value: numericValue } });
          }}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder=' Enter Longitude'
            label='Longitude'
            name='longitude'
            color='primary'
            multiline={false}
            type='text'
            variant='filled'
            value={formValues?.longitude === null ? '' : formValues?.longitude}
            error={formErrors?.longitude === null ? false : true}
            helperText={
              formErrors?.longitude === null ? '' : formErrors?.longitude
            }
          />
        </Grid> */}

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            style={{}}
            fullWidth={true}
            placeholder='Email'
            label='Email'
            name='email'
            value={formValues?.email === null ? '' : formValues?.email}
            color='primary'
            type='email'
            regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
            variant='filled'
            error={formErrors?.email === null ? false : true}
            helperText={formErrors?.email === null ? '' : formErrors?.email}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value.replace(/[^0-9.-]/g, '');
              handleChange({ target: { name: 'phone_number', value: numericValue } });
            }}
            onBlur={handleChange}
            style={{}}
            fullWidth={true}
            onWheel={(e) => e.target.blur()}
            placeholder='Phone Number'
            label='Phone Number'
            name='phone_number'
            value={
              formValues?.phone_number === null ? '' : formValues?.phone_number
            }
            color='primary'
            type='text'
            variant='filled'
            error={formErrors?.phone_number === null ? false : true}
            helperText={
              formErrors?.phone_number === null ? '' : formErrors?.phone_number
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            fullWidth={true}
            name='address'
            label='Address'
            multiline={true}
            placeholder='Address'
            rows={2}
            value={formValues?.address === null ? '' : formValues?.address}
            variant='filled'
            onChange={handleChange}
            onBlur={handleChange}
            error={formErrors?.address === null ? false : true}
            helperText={formErrors?.address === null ? '' : formErrors?.address}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            onWheel={(e) => e.target.blur()}
            placeholder='PinCode'
            label='Pincode'
            name='zip'
            value={formValues?.zip === null ? '' : formValues?.zip}
            color='primary'
            type='number'
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
              }
            }}
            regex=''
            variant='filled'
            error={formErrors?.zip === null ? false : true}
            helperText={formErrors?.zip === null ? '' : formErrors?.zip}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            fullWidth={true}
            value={{ name: formValues?.city === null ? '' : formValues?.city }}
            name='city'
            onChange={(e, val) => {
              const selectedCity = val !== null ? val.name : null;
              setFormValues({
                ...formValues,
                city: selectedCity,
              });
              setFormErrors({
                ...formErrors,
                city: selectedCity ? null : 'City is Required',
              });
            }}
            onBlur={handleAutocompleteBlur('city')}
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
                error={formErrors?.city === null ? false : true}
                helperText={formErrors?.city === null ? '' : formErrors?.city}
              />
            )}
          />
        </Grid>
        <Grid
          value='one'
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            fullWidth={true}
            name='state'
            value={{ state: formValues?.state === null ? '' : formValues?.state }}
            options={_.uniqBy(Cities, 'state')}
            getOptionLabel={(options) => options.state}
            onChange={(e, val) => {
              const selectedState = val !== null ? val.state : null;
              setFormValues({
                ...formValues,
                state: selectedState,
              });
              setFormErrors({
                ...formErrors,
                state: selectedState ? null : 'State is Required',
              });
            }}
            onBlur={handleAutocompleteBlur('state')}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='State'
                variant='filled'
                error={formErrors?.state === null ? false : true}
                helperText={formErrors?.state === null ? '' : formErrors?.state}
              />
            )}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            fullWidth={true}
            name='country'
            value={{ name: formValues?.country || '' }}
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
            onBlur={handleAutocompleteBlur('country')}
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

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            inputRef={textRef}
            onChange={handleChange}
            onBlur={handleChange}
            required={wifiAttendance && true}
            fullWidth
            placeholder=' Enter BSSID'
            label='BSSID'
            name='bssId'
            color='primary'
            variant='filled'
            value={formValues?.bssId === null ? '' : formValues?.bssId}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton title='Run (netsh wlan show interfaces) in cmd' onClick={() => {
                    setOpen(true)
                    setHelpDialogText('Run (netsh wlan show interfaces) in cmd')
                  }}>
                    <Info titleAccess='Run (netsh wlan show interfaces) in cmd' />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={wifiAttendance ? formErrors?.bssId === null ? false : true : false}
            helperText={wifiAttendance ? formErrors?.bssId === null ? '' : formErrors?.bssId : ''}
          />
        </Grid>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogContent>
            {helpDialogText}
          </DialogContent>
          <DialogActions onClick={() => setOpen(false)}>
            <Button>Back</Button>
          </DialogActions>
        </Dialog>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            inputRef={textRef}
            onChange={handleChange}
            onBlur={handleChange}
            required={isQrAttendanceEnabled}
            fullWidth
            placeholder=' Enter MAC ID'
            label='MAC ID'
            name='macId'
            color='primary'
            variant='filled'
            value={formValues?.macId === null ? '' : formValues?.macId}
            InputProps={{
              inputProps: { autoCapitalize: 'characters' },

              endAdornment: (
                <InputAdornment position="end">
                  <IconButton title='Run (getmac) in cmd' onClick={() => {
                    setOpen(true)
                    setHelpDialogText('Run (getmac) in cmd')
                  }}>
                    <Info titleAccess='Run (getmac) in cmd' />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={isQrAttendanceEnabled ? formErrors?.macId === null ? false : true : false}
            helperText={isQrAttendanceEnabled ? formErrors?.macId === null ? '' : formErrors?.macId : ''}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            inputRef={textRef}
            onChange={handleChange}
            onBlur={handleChange}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Description'
            label='Description'
            name='description'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues?.description === null ? '' : formValues?.description
            }
            error={formErrors?.description === null ? false : true}
            helperText={
              formErrors?.description === null ? '' : formErrors?.description
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop={props.pageType === 'detailpage' ? '25%' : '25px'}
          >
            <Grid>
              <Button
                onClick={props.handleBack}
                disabled = {props.activeStep === 0 ? true : false}
                style={{}}
                name='Cancel'
                variant='contained'
                color='secondary'
                size='medium'
                text='button'
                fullWidth={false}
                type='cancel'
              >
                Back
              </Button>
            </Grid>

            <Grid>
              <Button
                onClick={handleSubmit}
                style={{}}
                name='SUBMIT'
                variant='contained'
                color='primary'
                size='medium'
                text='button'
                fullWidth={false}
                type='submit'
              >
                {props.pageType === 'detailpage' ? 'Next' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      {loader && <SimpleBackdrop loader={loader} />}
    </>
  );
}

export default InitialLocation;
