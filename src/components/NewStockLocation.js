import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import _ from 'lodash';
import {Country} from './Country_list';
import {Button, TextField, Typography, Grid, InputAdornment, IconButton, Modal, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {Cities} from '../utils/cities';
import FormGroup from '@mui/material/FormGroup';
import {getLocationDataBasedOnPincode} from '../components/common';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
  bssIdValidation,
  locationcodeValidation
} from './regexFunction/index';
import SimpleBackdrop from 'pages/common/Loader';
import { useDispatch, useSelector } from 'react-redux';
import context from '../context/CreateNewButtonContext'
import { location_typeAction, getGpsLocationActivationAction } from 'redux/actions/stock_Location_actions';
import apiCalls from 'utils/apiCalls';
import { Info } from '@mui/icons-material';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { ProperCaseFunc } from 'utils/properCase';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getsessionStorage } from 'pages/common/login/cookies';

function NewStockLocation(props) {
  const textRef = useRef(null);
  const storage = getsessionStorage()
  const dispatch = useDispatch()
  const { stockLocationReducer: { location_type }, appConfigReducer: {app_config_data} } = useSelector(s => s)
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
  
console.log('app_config_data', app_config_data?.filter((a) => a.key_name === "wifi.attendance"));

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
    location_type_id:null,
    location_type: props.pageType === 'detailpage' ? 'Default Location' : null,
    location_code : null,
    bssId : '',
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
    location_type_id:null,
    location_code : null,
    bssId : null,
    macId : null,
  });

  const [value, setValue] = React.useState([]);
  const filter = createFilterOptions();

  const [loader, setLoader] = useState(false)

  const [wifiAttendance, setWifiAttendance] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);


 useEffect(() => {
  dispatch(getGpsLocationActivationAction()).then((res) => {
    setGpsEnabled(String(res?.gps_location_activation) === "true");
  });
}, [dispatch]);

console.log('gpsEnabledgpsEnabled', gpsEnabled);


  const isQrAttendanceEnabled = app_config_data?.find(item => item.key_name === "qr.attendance")?.value === "true" ? true : false;
  
  useEffect(() => {
    let wifi = app_config_data?.find(item => item.key_name === "wifi.attendance");
    let result = wifi?.value === "false" ? false : true;
    setWifiAttendance(result)
  },[app_config_data])

  const isCompanyTypeFive = storage?.company_type === 5;

  const requiredFields = [
    'location_name',
    'zip',
    'location_type',
    'location_code',
    ...(wifiAttendance && isCompanyTypeFive ? ['bssId'] : []),
    ...(isQrAttendanceEnabled ? ['macId'] : []),
  ]

  

  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [open, setOpen] = useState(false);
  const [helpDialogText, setHelpDialogText] = useState("");
  const [defaultLocationPrompt, setDefaultLocationPrompt] = useState({
    open: false,
    selectedId: '',
    error: null,
  });
  const [pendingPayload, setPendingPayload] = useState(null);
  

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

 
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);

    if (name === 'zip') {
      if (!isLoadingLocationData) {
        setIsLoadingLocationData(true)
        if(value !== ''){
          if (value.length === 6) {
            setLoader(true)
            const locationData = await getLocationDataBasedOnPincode(value);
            if(locationData !== undefined){
              const {district, state} = locationData;
              if (district && state) {
                textRef.current.focus();
                await setFormValues({...formValues, zip: value, city: district, state: state});
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  zip: null,
                  city: null,
                  state: null,
              }));                
                setLoader(false)
              }
            } 
            else{
              setLoader(false)
              setFormErrors({
                ...formErrors,
                zip: "Pincode Not Found",
              });
            }
          }
          else{
            setLoader(false)
            setFormErrors({
              ...formErrors,
              zip: "Pincode maximum length is 6 digits",
            });
          }
        }
        else{
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
      if(name === 'zip'){
        setFormErrors({
          ...formErrors,
          [name]: 'Pincode is Required!',
        });
      }
      else{
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name).replace('_', ' ') + ' is Required!',
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
        setValidRegex({...validRegex, email: false});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, email: true});
      }
    } else if (name === 'bssId' && value !== null && value !== '') {
      if (bssIdValidation(value) !== true) {
        setValidRegex({ ...validRegex, bssId: false })
        setFormErrors({
          ...formErrors,
          [name]: 'Invalid format! Expected: 00:1A:2B:3C:4D:5E',  
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null, 
        });
        setValidRegex({ ...validRegex, bssId: true })
      }
    } else if (name === 'phone_number' && value !== null && value !== '') {
      if (phoneValidation(value) !== true) {
        setValidRegex({...validRegex, phone_number: false});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, phone_number: true});
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
          [name]: capitalize(name).replace('_', ' ') + ' should be 4 characters long and consist of uppercase letters and numbers only!',
        });
      }
    }
    else if (name === 'zip') {
      if(value !== ''){
        if (value.length === 6) {
          setFormErrors({
            ...formErrors,
            zip: null,
          });
        }
        else{
          setLoader(false)
          setFormErrors({
            ...formErrors,
            zip: "Pincode maximum length is 6 digits",
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

  // const getTrimmedData = (obj) => {
  //   if (obj && typeof obj === "object") {
  //     Object.keys(obj).map(key => {
  //       if (typeof obj[key] === "object") {
  //         getTrimmedData(obj[key]);
  //       } else if (typeof obj[key] === "string") {
  //         obj[key] = obj[key].trim();
  //       }
  //     });
  //   }
  //   return obj;
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };

     let dynamicRequiredFields = [...requiredFields];

     if (gpsEnabled) {
      if (!dynamicRequiredFields.includes("latitude")) dynamicRequiredFields.push("latitude");
      if (!dynamicRequiredFields.includes("longitude")) dynamicRequiredFields.push("longitude");
    }


    await Object.keys(formValues).forEach((key) => {
        if (dynamicRequiredFields.includes(key) && (formValues[key] === null || formValues[key] === '')) {
            isValid = false;
            formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
        }
    });


    if (!isValid) {
        await setFormErrors(formErrorsObj);
        dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
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

    if (isValid) {
        delete formValues.locationtypename;
        const trimmedData = getTrimmedData(formValues);

        const wasDefault = initialState?.location_type === 'Default Location';
        const stillDefault = formValues.location_type === 'Default Location';

        if (props.status === 'edit' && wasDefault && !stillDefault) {
          setPendingPayload(trimmedData);
          setDefaultLocationPrompt({ open: true, selectedId: '', error: null });
          return;
        }

        props.handleSubmit(trimmedData);
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
};

  const handleDefaultLocationConfirm = () => {
    if (!defaultLocationPrompt.selectedId) {
      setDefaultLocationPrompt((prev) => ({
        ...prev,
        error: 'Please select a location',
      }));
      return;
    }

    const defaultType = location_type.find(
      (lt) => lt.location_type === 'Default Location'
    );
    const defaultTypeId = defaultType?.id || initialState?.location_type_id;

    const payload = {
      ...pendingPayload,
      newDefaultLocation_id: defaultLocationPrompt.selectedId,
      default_location_type_id: defaultTypeId,
    };

    setDefaultLocationPrompt({ open: false, selectedId: '', error: null });
    setPendingPayload(null);
    props.handleSubmit(payload);
  };

  const handleDefaultLocationCancel = () => {
    setDefaultLocationPrompt({ open: false, selectedId: '', error: null });
    setPendingPayload(null);
  };
  const edits = () => {
  // console.log("props.edit_id_data", props.edit_id_data);

  if (props.edit_id_data[0] && props.status === 'edit') {
    const editData = {
      ...props.edit_id_data[0],
      country: props.edit_id_data[0].country || 'India', 
    };

    setFormValues(editData);
    setInitialState(editData);
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
        [field]: `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is Required!`,
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  // const handleSelect = (e, value, targetName) => {
  //   setStateHandler(targetName, value);
  // };
  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '10px', paddingLeft: '10px'}}>
        {props.status === 'edit' ? "Update Stock Location" : "Location"}
      </Typography>
      <Grid
        // spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
      >
        <Grid
          style={{paddingLeft: '10px', padding: '10px'}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container spacing={3}>
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
              formValues.location_name === null ? '' : formValues.location_name
            }
            error={formErrors.location_name === null ? false : true}
            helperText={
              formErrors.location_name === null ? '' : 'Location name is Required!'
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
              const val = e.target.value.toUpperCase().slice(0, 4);
              handleChange({ target: { name: 'location_code', value: val } });
            }}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Location Code'
            label='Location Code'
            name='location_code'
            color='primary'
            multiline={false}
            type='text'
            regex={/^[A-Z0-9]{4}$/}
            variant='filled'
            value={
              formValues.location_code === null ? '' : formValues.location_code
            }
            error={formErrors.location_code === null ? false : true}
            helperText={
              formErrors.location_code === null ? '' : formErrors.location_code
            }
          />
        </Grid>
        {props.pageType !== 'detailpage' && <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
        <Autocomplete
        fullWidth
        freeSolo
        value={
          formValues.location_type
            ? location_type.find(f => f.id === formValues.location_type_id) || { location_type: formValues.location_type }
            : { location_type: '' }
        }
        name="location_type"
        onChange={(event, newValue) => {
       
          let selectedLocationId = null;
          let selectedLocationType = '';

          if (typeof newValue === 'string') {
            selectedLocationType = (newValue);
            setValue([...value, selectedLocationType]);
          } else if (newValue && newValue.inputValue) {
            selectedLocationType = (newValue.inputValue);
            setValue([...value, selectedLocationType]);
          } else if (newValue === null) {
            selectedLocationType = '';
          } else {
            selectedLocationId = newValue.id;
            selectedLocationType = newValue.location_type;
          }

          setFormValues({
            ...formValues,
            location_type_id: selectedLocationId,
            location_type: selectedLocationType,
          });

          setFormErrors({
            ...formErrors,
            location_type: selectedLocationType ? null : 'Selected Location is Required',
          });
          
        }}
        filterOptions={(options, params) => {
          const filtered = options.filter(option =>
            option.location_type.toLowerCase().includes(params.inputValue.toLowerCase())
          );
          const { inputValue } = params;
          const isExisting = options.some(option => inputValue.toLowerCase() === option.location_type.toLowerCase());
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              inputValue,
              location_type: (inputValue),
            });
          }
          return filtered;
        }}
        id="free-solo-dialog-demo"
                onBlur={handleAutocompleteBlur('location_type')}
                options={_.uniqBy(
                  location_type.filter(f =>
                    f.location_type !== 'Default Location' &&
                    !(
                      (f.location_type?.toLowerCase() === 'Scrap')
                      //  &&
                      // props.locationData?.some(
                      //   loc => loc.locationTypeName?.toLowerCase() === 'scrap'
                      // )
                    )
                  ),
                  'location_type'
                )}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.location_type;
          }
          return option.location_type;
        }}
        isOptionEqualToValue={(option, value) => option.location_type === value.location_type}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderInput={(params) => (
          <TextField
            {...params}
            label="Location Type"
            variant="filled"
            error={!!formErrors.location_type}
            helperText={formErrors.location_type || ''}
            onBlur={handleAutocompleteBlur('location_type')}
            required
          />
        )}
      />
        </Grid>}
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
            // Filter out non-numeric characters
            const numericValue = value.replace(/[^0-9.-]/g, '');
            // Update the form value with the filtered value
            handleChange({ target: { name: 'latitude', value: numericValue } });
          }}
            onBlur={handleChange}
            // required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder=' Enter Latitude'
            label='Latitude'
            name='latitude'
            color='primary'
            multiline={false}
            required={gpsEnabled}
            type='text'
            // onKeyDown={(e) => {
            //   if (!/^[\d.]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            //     e.preventDefault();
            //   }
            // }}            
            variant='filled'
            value={formValues.latitude === null ? '' : formValues.latitude}
            error={formErrors.latitude === null ? false : true}
            helperText={formErrors.latitude === null ? '' : formErrors.latitude}
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
            // Filter out non-numeric characters
            const numericValue = value.replace(/[^0-9.-]/g, '');
            // Update the form value with the filtered value
            handleChange({ target: { name: 'longitude', value: numericValue } });
          }}
            onBlur={handleChange}
            // required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder=' Enter Longitude'
            label='Longitude'
            name='longitude'
            color='primary'
            multiline={false}
           required={gpsEnabled}
            type='text'
            // onKeyDown={(e) => {
            //   if (!/^[\d.]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            //     e.preventDefault();
            //   }
            // }}            
            // regex='/^\d{10}$/'
            variant='filled'
            value={formValues.longitude === null ? '' : formValues.longitude}
            error={formErrors.longitude === null ? false : true}
            helperText={
              formErrors.longitude === null ? '' : formErrors.longitude
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
            // required={true}
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
            helperText={formErrors.email === null ? '' : formErrors.email}
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
            // Filter out non-numeric characters
            const numericValue = value.replace(/[^0-9.-]/g, '');
            // Update the form value with the filtered value
            handleChange({ target: { name: 'phone_number', value: numericValue } });
          }}
            onBlur={handleChange}
            // required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='Phone Number'
            label='Phone Number'
            name='phone_number'
            value={
              formValues.phone_number === null ? '' : formValues.phone_number
            }
            color='primary'
            type='text'
            // onKeyDown={(e) => {
            //   if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            //     e.preventDefault();
            //   }
            // }}
            // regex='/^\d{10}$/'
            variant='filled'
            error={formErrors.phone_number === null ? false : true}
            helperText={
              formErrors.phone_number === null ? '' : formErrors.phone_number
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
            value={formValues.address === null ? '' : formValues.address}
            variant='filled'
            // required={true}
            onChange={handleChange}
            onBlur={handleChange}
            error={formErrors.address === null ? false : true}
            helperText={formErrors.address === null ? '' : formErrors.address}
          />
        </Grid>
        {/* <Grid
            // spacing={0}
            lg={3}
            md={4}
            sm={6}
            xs={12}
            // container={true}
            // direction='row'
           
          >
            <TextField fullWidth={true}
              name='area'
              label='Area'
              multiline={true}
              placeholder='Area'
              rows={2}
              value={formValues.area === null ? '' : formValues.area}
              variant='outlined'
              required={true}
              onChange={handleChange}
              onBlur={handleChange}
              error={formErrors.area === null ? false : true}
              helperText={formErrors.area === null ? '' : formErrors.area} />
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
            required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='PinCode'
            label='Pincode'
            name='zip'
            value={formValues.zip === null ? '' : formValues.zip}
            color='primary'
            type='number'
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
              }
            }}
            regex=''
            variant='filled'
            error={formErrors.zip === null ? false : true}
            helperText={formErrors.zip === null ? '' : formErrors.zip}
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
            value={{name: formValues.city === null ? '' : formValues.city}}
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
                // error={formErrors.city === null ? false : true}
                // helperText={formErrors.city === null ? '' : formErrors.city}
                // required={true}
                error={formErrors.city === null ? false : true}
               helperText={formErrors.city === null ? '' : formErrors.city}
              />
            )}
          />
          {/* <Autocomplete
              fullWidth={true}
              name='city'
              defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.city) : formValues.city}`}
              value={formValues.city}
              options={Cities}
              // inputProps={{ value: formValues.city }}
              getOptionLabel={(options) => options}
              onChange={(e, v) => handleSelect(e, v, "city")}
              // autoHighlight={true}
              renderInput={(params) => (
                <TextField {...params} label="City" variant="outlined"
                  // error = { formErrors.city === null ? false : true } helperText = { formErrors.city === null ? '' : formErrors.city } 
                  required={false} />
              )}
            /> */}
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
            // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
            value={{state: formValues.state === null ? '' : formValues.state}}
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
                // error={formErrors.state === null ? false : true}
                // helperText={formErrors.state === null ? '' : formErrors.state}
                // required={true}
                error={formErrors.state === null ? false : true}
               helperText={formErrors.state === null ? '' : formErrors.state}
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
            onBlur={handleAutocompleteBlur('country')}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Country'
                variant='filled'
                //error = { formErrors.country === null ? false : true } helperText = { formErrors.country === null ? '' : formErrors.country } required={true}
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
            required={wifiAttendance && isCompanyTypeFive}
            fullWidth
            label='BSSID'
            name='bssId'
            color='primary'
            variant='filled'
            value={formValues.bssId === null ? '' : formValues.bssId}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton title='Run (netsh wlan show interfaces) in cmd' onClick={() => {
                    setOpen(true)
                    setHelpDialogText('Run (netsh wlan show interfaces) in cmd')
                    }}>
                    <Info titleAccess='Run (netsh wlan show interfaces) in cmd'/>
                  </IconButton>
                </InputAdornment>
              ),
            }}
                error={formErrors.bssId !== null}
                helperText={
                  formErrors.bssId !== null
                    ? formErrors.bssId  
                    : 'Format: 00:1A:2B:3C:4D:5E'  
                }
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
            value={formValues.macId === null ? '' : formValues.macId}
            InputProps={{
              inputProps: {autoCapitalize: 'characters'},
              
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton title='Run (getmac) in cmd' onClick={() => {
                    setOpen(true)
                    setHelpDialogText('Run (getmac) in cmd')
                    }}>
                    <Info titleAccess='Run (getmac) in cmd'/>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={isQrAttendanceEnabled ? formErrors.macId === null ? false : true : false}
            helperText={isQrAttendanceEnabled ? formErrors.macId === null ? '' : formErrors.macId : ''}
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
            // required={true}
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
              formValues.description === null ? '' : formValues.description
            }
            error={formErrors.description === null ? false : true}
            helperText={
              formErrors.description === null ? '' : formErrors.description
            }
          />
        </Grid>
        </Grid>
        </Grid>

        {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop={props.pageType === 'detailpage' ? '25%' : '25px'}
          >
            <Grid>
              {form === false ? ( <>
                {props.pageType === 'detailpage' ? <Button
                  onClick={props.handleBack}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Back
                </Button> : <Button
                  onClick={() => props.handleClose()}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Cancel
                </Button>}
                </>) : (
                <Button
                  onClick={() => validClose()}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Cancel
                </Button>
              )}
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
      <Dialog
        open={defaultLocationPrompt.open}
        maxWidth='sm'
        fullWidth
        aria-labelledby='transfer-default-location-title'
      >
        <DialogTitle id='transfer-default-location-title'>
          Transfer Default Location
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ marginBottom: 16 }}>
            You are changing the type of the current <strong>Default Location</strong>.
            Please select another location to set as the new Default Location.
          </DialogContentText>
          <Autocomplete
            fullWidth
            value={
              defaultLocationPrompt.selectedId
                ? (props.locationData || []).find(
                    (l) => l.location_id === defaultLocationPrompt.selectedId
                  ) || null
                : null
            }
            options={(props.locationData || []).filter(
              (l) =>
                l.location_id !== formValues.location_id &&
                l.locationTypeName !== 'Default Location'
            )}
            getOptionLabel={(option) => option.location_name || ''}
            isOptionEqualToValue={(option, value) =>
              option.location_id === value.location_id
            }
            onChange={(event, value) => {
              setDefaultLocationPrompt((prev) => ({
                ...prev,
                selectedId: value ? value.location_id : '',
                error: value ? null : prev.error,
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label='Select Location'
                placeholder='New Default Location'
                variant='filled'
                error={Boolean(defaultLocationPrompt.error)}
                helperText={defaultLocationPrompt.error || ''}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDefaultLocationCancel} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleDefaultLocationConfirm}
            color='primary'
            variant='contained'
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      { loader&&<SimpleBackdrop loader={loader}/>}
    </>
  );
}

export default NewStockLocation;
