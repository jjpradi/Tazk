import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  createSmsDataAction,
  getAppConfigDataAction,
  updateAppConfigAction,
  updateSmsDataAction,
} from 'redux/actions/app_config_actions';
import context from '../../../../src/context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {urlValidation} from '../../../components/regexFunction';
import apiCalls from 'utils/apiCalls';
import { getByIdSmsRoleConfigurationAction, sendTestSMSAction } from 'redux/actions/configuration_actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { useTheme } from '@mui/material/styles';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

//---------------------------------------------------------------------------//

function SmsConfig(props) {
  const dispatch = useDispatch();
  const theme = useTheme()

  const [formValues, setFormValues] = useState({
    url: '',
    header: '',
    token: '',
    location_id:'',
    location_name:''
  });
  const [formErrors, setFormErrors] = useState({
    url: null,
    header: null,
    token: null,
    location_id:null
  });
  const [location, setLocation] = useState();
  // const {
  //   appConfigReducer: {app_config_data},
  // } = useSelector((s) => s);

  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);

  const { stockLocationReducer: { allliststocklocation },ConfigurationReducer: { testSMS } } = useSelector((state) => state);


  const {
    SmsOpen,
    handleClose,
    app_config_data,
    pageSizeSms,
    onSubmitSuccess,
    mode = 'create',
    initialValues,
    onSubmit,
    submitLabel,
  } = props;
  const handleChange = async (e) => {
    let {name, value} = e.target;
    const nextValue = name === 'token' ? value.trim() : value;
    setStateHandler(name, nextValue);
    validationHandler(name, nextValue);
  };

  // useEffect(() => {
  //   dispatch(
  //     getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler),
  //   );
  // }, []);

  const requiredFields = [
    'url',
    'header',
    'token',
    'location_id'
  ]


  useEffect(() => {

    if(app_config_data.length > 0){
      let tempObj = {}

      app_config_data.map(i => {
        if(i.key_name === 'smsConfig.url'){
          tempObj.url = i.value;
        }
        if(i.key_name === 'smsConfig.header'){
          tempObj.header = i.value;
        }
        if(i.key_name === 'smsConfig.token'){
          tempObj.token = i.value;
        }
        
      })

      if (mode === 'create') {
        setFormValues(tempObj);
        setFormErrors({
          url: '',
          header: '',
          token: '',
        });
      }

    }
  }, [app_config_data, SmsOpen, mode]);

  useEffect(() => {
    if (mode === 'edit' && SmsOpen && initialValues) {
      const resolvedLocationId =
        initialValues.location_id ||
        allliststocklocation.find(
          (item) => item.location_name === initialValues.location_name,
        )?.location_id ||
        '';

      setFormValues({
        url: initialValues.url || '',
        header: initialValues.header || '',
        token: initialValues.token || '',
        location_id: resolvedLocationId,
        location_name: initialValues.location_name || '',
      });
      setLocation(resolvedLocationId);
      setFormErrors({
        url: '',
        header: '',
        token: '',
        location_id: '',
      });
    }
  }, [mode, SmsOpen, initialValues, allliststocklocation]);

  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };
    setFormValues(formObj);
  };
  const validationHandler = (name, value) => {

    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'url') {
      const urlFormat = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/
      if (!value || !urlFormat.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Invalid URL!',
        }));
      }else{
        setFormErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    }

    if (name === 'header') {
      if (value.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
      if (value.length === 0) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Header is Required!',
        }));
      }
    }

    if (name === 'token') {
      const tokenFormat = /^[a-zA-Z0-9]{32}$/
      if (!value || !tokenFormat.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Invalid Token!',
        }));
      }
      else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
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

      Object.keys(formValues).forEach((key) => {
        if (
          requiredFields.includes(key) &&
          (formValues[key] === null ||
            formValues[key] === 'null' ||
            formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        }
      });

      if (
        formErrors.url === 'Invalid URL!' ||
        formErrors.token === 'Invalid Token!'
      ) {
        isValid = false;
      }

      setFormErrors(formErrorsObj);

      if (!isValid) {
        dispatch(
          OpenalertActions({
            msg: requiredFieldsAlertMessage,
            severity: 'warning'
          })
        );
        return;
      }

      try {
        if (mode === 'edit' && onSubmit) {
          await onSubmit(formValues);
        } else {
          await dispatch(
            createSmsDataAction(
              formValues,
              null,
              setLoaderStatusHandler,
              setModalTypeHandler
            )
          );

          await dispatch(
            getByIdSmsRoleConfigurationAction(
              setModalTypeHandler,
              setLoaderStatusHandler,
              {
                pageCount: 0,
                numPerPage: pageSizeSms,
                searchStringValSms: ''
              }
            )
          );
        }

        handleClose();
        if (onSubmitSuccess) onSubmitSuccess();
      } catch (err) {
        console.error('Submit failed:', err);
      }
    };

  const handleTestSMS = async () => {
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (formValues[key] === null) {
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
    });
    setFormErrors(formErrorsObj);

    if (Object.values(formValues).every((value) => Boolean(value)) === true) {
      const formData = {
        'url': formValues.url,
        'header': formValues.header,
        'token': formValues.token,
      };
      apiCalls(
        setLoaderStatusHandler,
        setModalTypeHandler,
        dispatch(
          sendTestSMSAction(
            formData,
            setLoaderStatusHandler,
            setModalTypeHandler,
          ),
        ),
      );
      // handleClose();
    }
  };

  useEffect(() => {
    
    if (app_config_data.length > 0) {

    
      setFormValues({...formValues,
        url: app_config_data.find((item) => item.key_name === 'smsConfig.url')?.value,
        header: app_config_data.find((item) => item.key_name === 'smsConfig.header')?.value,
        token: app_config_data.find((item) => item.key_name === 'smsConfig.token')?.value,
      })
    }
  }, [app_config_data]);
  const handleLocation = (event) => {
    const selectedId = event.target.value;
    const selected = allliststocklocation.find(
      (item) => item.location_id === selectedId,
    );
    setLocation(selectedId);
    setFormValues({
      ...formValues,
      location_id: selectedId,
      location_name: selected?.location_name || '',
    });
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      location_id: "", 
    }));
  };
  return (
    <Dialog open={SmsOpen} onClose={handleClose}>
      <DialogContent>
        <DialogContentText>Configure SMS Settings</DialogContentText>
        
        {/* URL Field */}
        <TextField
          required
          margin='dense'
          id='url'
          label='URL'
          type='text'
          fullWidth
          variant='standard'
          name='url'
          value={formValues.url}
          onChange={handleChange}
          error={!!formErrors.url}
          helperText={formErrors.url}
          placeholder='Eg. http://example.sms.com'
        />

        {/* Header Field */}
        <TextField
          required
          margin='dense'
          id='header'
          label='Header'
          type='text'
          fullWidth
          variant='standard'
          name='header'
          value={formValues.header}
          onChange={handleChange}
          error={!!formErrors.header}
          helperText={formErrors.header}
          placeholder='Eg. EXAMPLE'
        />

        {/* Token Field */}
        <TextField
          required
          margin='dense'
          id='token'
          label='Token'
          type='text'
          fullWidth
          variant='standard'
          name='token'
          value={formValues.token}
          onChange={handleChange}
          error={!!formErrors.token}
          helperText={formErrors.token}
          placeholder='Eg. B8cbd73fee5f5931f2351f7begb2c5e65'
        />

        {/* Select Location */}
        <FormControl variant='outlined' fullWidth margin='dense'>
          <FormLabel>Select Location <span style={{ color: theme.palette.error.main }}>*</span></FormLabel>
          <Select
            id='location'
            value={location}
            onChange={(e)=> handleLocation(e)}
            fullWidth
          >
            {allliststocklocation.map((m) => (
              <MenuItem key={m.location_id} value={m.location_id}>
                {m.location_name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText sx={{ color: theme.palette.error.main }}>{formErrors.location_id ? 'Location is Required!' : ''}</FormHelperText>
        </FormControl>

        {/* Test SMS Button */}
        <Button
          onClick={handleTestSMS}
          variant='contained'
          color='primary'
          fullWidth
          style={{ marginTop: '10px' }}
        >
          Test SMS
        </Button>

      </DialogContent>
      <DialogActions>
        <Grid container spacing={2} justifyContent='flex-end'>
          {/* Cancel Button */}
          <Grid>
            <Button
              onClick={handleClose}
              variant='contained'
              color='secondary'
            >
              Cancel
            </Button>
          </Grid>
          
          {/* Submit Button */}
          <Grid>
            <Button
              onClick={handleSubmit}
              variant='contained'
              color='primary'
            >
              {submitLabel || (mode === 'edit' ? 'Update' : 'Submit')}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default SmsConfig;
