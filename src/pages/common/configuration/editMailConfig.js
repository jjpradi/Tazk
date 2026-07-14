import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAppConfigDataAction,
  updateAppConfigAction,
  updateMailConfigActions,
} from 'redux/actions/app_config_actions';
import {hostNameValidation, emailValidation} from '../../../components/regexFunction';
import context from '../../../../src/context/CreateNewButtonContext';
import Autocomplete from '@mui/material/Autocomplete';
import apiCalls from 'utils/apiCalls';
import { getByIdMailRoleConfigurationAction, sendTestMailActions } from 'redux/actions/configuration_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
//---------------------------------------------------------------------------//

export default function EditMailConfig(props) {
  const dispatch = useDispatch();

  // const {
  //   appConfigReducer: {app_config_data},
  // } = useSelector((s) => s);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);

  const { ConfigurationReducer: { testMail },stockLocationReducer: { allliststocklocation } } = useSelector((state) => state);

  const {
    open,
    handleClose,
    app_config_data,
    initialValues,
    submitLabel = 'Submit',
    onSubmit,
    onSubmitSuccess
  } = props;
  const [location, setLocation] = useState();
  const [checked, setChecked] = useState(true);
  const [formValues, setFormValues] = useState({
    host: '',
    port: '',
    fromMail: '',
    secure:'',
    fromname: '',
    fromPassword:'',
    location_id:''
  });


  const [formErrors, setFormErrors] = useState({
    host: '',
    port: '',
    fromMail: '',
    secure:'',
    fromname:'',
    fromPassword:'',
    location_id:''
  });

  // useEffect(() => {
  //   dispatch(
  //     getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler),
  //   );
  // }, []);


  const normalizeInitialValues = (values) => {
    if (!values) return null;
    const bccValue = Array.isArray(values.bcc)
      ? values.bcc
      : typeof values.bcc === 'string'
        ? values.bcc.split(',').map((e) => e.trim()).filter((e) => e !== '')
        : [];
    return {
      host: values.host || '',
      port: values.port || '',
      fromMail: values.fromMail || '',
      secure: values.secure ?? '',
      fromname: values.fromname || '',
      fromPassword: values.fromPassword || '',
      bcc: bccValue,
      location_id: values.location_id || '',
      location_name: values.location_name || '',
    };
  };

  useEffect(() => {
    if (!open) return;

    const normalizedInitialValues = normalizeInitialValues(initialValues);
    if (normalizedInitialValues) {
      setFormValues(normalizedInitialValues);
      setLocation(normalizedInitialValues.location_id || '');
      setChecked(normalizedInitialValues.secure === '1' || normalizedInitialValues.secure === 1);
      setFormErrors({
        host: '',
        port: '',
        fromMail: '',
        secure:'',
        fromname:'',
        fromPassword:'',
        location_id:''
      });
      return;
    }

    if(app_config_data.length > 0){
      let tempObj = {}
      // var bccvalues = app_config_data?.find((item) => item.key_name === 'mailConfig.fromBcc').value
      // var editbcc  = [bccvalues];

      app_config_data.map(i => {
        if(i.key_name === 'mailConfig.host'){
          tempObj.host = i.value;
        }
        if(i.key_name === 'mailConfig.port'){
          tempObj.port = i.value;
        }
        if(i.key_name === 'mailConfig.fromMail'){
          tempObj.fromMail = i.value;
        }
        if(i.key_name === 'mailConfig.fromPassword'){
          tempObj.fromPassword = i.value;
        }
        if(i.key_name === 'mailConfig.fromMailName'){
          tempObj.fromname = i.value;
        }
        if(i.key_name === 'mailConfig.fromBcc'){
          tempObj.bcc = i.value ? i.value.split(',').map(e => e.trim()).filter(e => e !== '') : [];
        }
        if(i.key_name === 'mailConfig.secure'){
          tempObj.secure = i.value;
          setChecked(i.value === '1' ? true : false);
        }
        
      })

      setFormValues(tempObj);
      setFormErrors({
        host: '',
        port: '',
        fromMail: '',
        secure:'',
        fromname:'',
        fromPassword:''
      });


    }
  }, [app_config_data, open, initialValues]);

  const handleChange = async (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'host') {
      if(!hostNameValidation(value)){
        setFormErrors({
              ...formErrors,
              ['host']: 'host name is Required!',
            });
      }else{
        setFormErrors({
          ...formErrors,
          ['host']: '',
        });
      }
    }

    if (name === 'port') {
      if (value.length > 0) {
        setFormErrors({
          ...formErrors,
          ['port']: '',
        });
      }
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          ['port']: 'port name is Required!',
        });
      }
    }

    if (name === 'fromname') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          fromname: 'From Name is required!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          fromname: '',
        });
      }
    }

    if (name === 'fromMail') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          fromMail: 'From Mail is required!',
        });
      } else if (!emailValidation(value)) {
        setFormErrors({
          ...formErrors,
          fromMail: 'Invalid email!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          fromMail: '',
        });
      }
    }

    if (name === 'fromPassword') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          fromPassword: 'From Password is required!',
        });
      }else {
        setFormErrors({
          ...formErrors,
          fromPassword: '',
        });
      }
    }
  };

  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };
    setFormValues(formObj);
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const fieldLabels = {
    host: "Host",
    port: "Port",
    fromMail: "From Mail",
    secure: "Secure",
    fromname: "From Name",
    fromPassword: "Password",
    bcc: "BCC",
  };

 const handleSubmit = async () => {
  const resolvedLocationId = formValues.location_id || location;
  const locationObj = (allListStockLocation || []).find(
    (loc) => String(loc.location_id) === String(resolvedLocationId)
  );
  const location_name = locationObj?.location_name || '';

  let formErrorsObj = { ...formErrors };
  const requiredKeys = Object.keys(formValues).filter(
    (key) => key !== 'secure',
  );

  requiredKeys.forEach((key) => {
    if (formValues[key] === null || formValues[key] === '') {
      formErrorsObj[key] =
        (fieldLabels[key] || capitalize(key)) + ' is Required!';
    }
  });

  setFormErrors(formErrorsObj);

  if (!requiredKeys.every((key) => Boolean(formValues[key]))) {
    dispatch(
      OpenalertActions({
        msg: requiredFieldsAlertMessage,
        severity: 'warning'
      })
    );
    return;
  }

  try {
    const bccValue = Array.isArray(formValues.bcc)
      ? formValues.bcc
      : typeof formValues.bcc === 'string'
        ? formValues.bcc.split(',').map((e) => e.trim()).filter((e) => e !== '')
        : [];

    const payload = {
      host: formValues.host,
      port: formValues.port,
      fromMail: formValues.fromMail,
      secure: formValues.secure,
      fromname: formValues.fromname,
      fromPassword: formValues.fromPassword,
      bcc: bccValue.join(','),
      location_id: resolvedLocationId,
      location_name,
      id: initialValues?.id
    };

    if (onSubmit) {
      await onSubmit(payload);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        handleClose();
      }
      return;
    }

    const res = await dispatch(
      updateMailConfigActions(
        payload,
        setLoaderStatusHandler,
        setModalTypeHandler
      )
    );

    if (res?.success === false) {
      dispatch(
        OpenalertActions({
          msg: res.message || 'Already created on this location',
          severity: 'warning'
        })
      );
      return;
    }

    const payloadMail = {
      pageCount: 0,
      numPerPage: app_config_data?.pageSizeMail || 10,
      searchStringValMail: ''
    };

    await dispatch(
      getByIdMailRoleConfigurationAction(
        setModalTypeHandler,
        setLoaderStatusHandler,
        payloadMail
      )
    );

    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      handleClose();
    }

  } catch (err) {
    console.error('Mail submit failed', err);
  }
};


  const handleTestMail = async () => {
    let formErrorsObj = {...formErrors};
    const requiredKeys = Object.keys(formValues).filter(
      (key) => key !== 'secure',
    );
    await requiredKeys.map((key, i) => {
      if (formValues[key] === null || formValues[key] === '') {
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
    });
    setFormErrors(formErrorsObj);

    if (requiredKeys.every((key) => Boolean(formValues[key])) === true) {
      var bcccc = formValues.bcc + ""
      const formData = {
        'host': formValues.host,
        'port': formValues.port,
        'fromMail': formValues.fromMail,
        'secure': formValues.secure,
        'fromMailName': formValues.fromname,
        'fromPassword': formValues.fromPassword,
        'fromBcc': bcccc
      };
       apiCalls(
         setLoaderStatusHandler,
         setModalTypeHandler,
         dispatch(
          sendTestMailActions(
             formData,
             setLoaderStatusHandler,
             setModalTypeHandler,
           ),
         ),
       );
      // handleClose();
    }
  };

  const handleSwitchChange = (e) => {
    if(e.target.checked){
      setChecked(true);
      setFormValues({...formValues, secure:'1'});
    }else{
      setChecked(false);
      setFormValues({...formValues, secure:'0'});
    }
  };

  const handleLocation = (event) => {
    setLocation(event.target.value);
    setFormValues({
      ...formValues,
      location_id: event.target.value,
    });
  };
  
  return (
    <Dialog open={open} onClose={() => {}}>
      <DialogContent>
        <DialogContentText></DialogContentText>
        <TextField
          margin='dense'
          id='name'
          label='Host'
          required={true}
          // regex='^((?!-)[A-Za-z0-9-]{1, 63}(?<!-)\\.)+[A-Za-z]{2, 6}$'
          // type='text'
          fullWidth={true}
          variant='standard'
          name='host'
          value={formValues.host}
          onChange={handleChange}
          error={formErrors.host}
          helperText={formErrors.host}
          // placeholder='Eg - example.gmail.com'
        />
        <TextField
          margin='dense'
          id='name'
          label='Port'
          required={true}
          type='text'
          fullWidth={true}
          variant='standard'
          name='port'
          value={formValues.port}
          onChange={(e) => {

            let val = e.target.value.replace(/[^0-9]/g, "");
              handleChange({
                target:{
                  name:e.target.name, 
                  value:val}
              })
          }}
          // required={true}
          error={formErrors.port}
          helperText={formErrors.port}
          placeholder='Eg - 123'
        />
        <TextField
          margin='dense'
          id='name'
          label='From User Name'
          //type='email'
          required={true}
          fullWidth={true}
          variant='standard'
          name='fromname'
          value={formValues.fromname}
          onChange={handleChange}
          // required={true}
          error={formErrors.fromname}
          helperText={formErrors.fromname}
          placeholder='Eg - Name'
        />
        <TextField
          margin='dense'
          id='name'
          label='From User Mail'
          type='email'
          required={true}
          regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
          fullWidth={true}
          variant='standard'
          name='fromMail'
          value={formValues.fromMail}
          onChange={handleChange}
          // required={true}
          error={formErrors.fromMail}
          helperText={formErrors.fromMail}
          placeholder='Eg - name123@gmail.com'
        />
        <TextField
          margin='dense'
          id='name'
          label='Password'
          required={true}
          // type='email'
          fullWidth={true}
          variant='standard'
          name='fromPassword'
          value={formValues.fromPassword}
          onChange={handleChange}
          // required={true}
          error={formErrors.fromPassword}
          helperText={formErrors.fromPassword}
          placeholder='Eg - abcdefghijklmnop'
        />
        <FormControl variant='outlined' fullWidth margin='dense'>
          <FormLabel>Select Location</FormLabel>
          <Select
            id='location'
            value={location ?? formValues.location_id ?? ''}
            onChange={(e) => handleLocation(e)}
            fullWidth
          >
            {allliststocklocation.map((m) => (
              <MenuItem key={m.location_id} value={m.location_id}>
                {m.location_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          multiple
          freeSolo
          id="tags-outlined"
          options={["mail@gmail.com"]}
          value={formValues.bcc}
          onChange={(event, newValue) => {
            setFormValues({ ...formValues, bcc: newValue })
          }}
          //defaultValue={["mail@gmail.com"]}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label="BCC"
              placeholder="name1@gmail.com, name2@gmail.com,..."
            />
          )}
        />
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={checked} onChange={handleSwitchChange} />}
            label='Secure'
          />
        </FormGroup>

        <Grid container>
          <Grid
            size={{
              lg: 4
            }}>
            <Button
              onClick={handleTestMail}
              style={{}}
              name='testMail'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={true}
            >
              Test Mail
            </Button>
          </Grid>
        </Grid>

      </DialogContent>
      <DialogActions>
        <Grid
          spacing={4}
          container={true}
          direction='row'
          gap='20px'
          display='flex'
          justifyContent='flex-end'
          padding='15px 15px'
        >
          <Grid>
            <Button
              onClick={handleClose}
              style={{}}
              name='Cancel'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={true}
              type='cancel'
            >
              Cancel
            </Button>
          </Grid>
          <Grid>
            <Button
              onClick={handleSubmit}
              style={{}}
              name='Submit'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={true}
              type='submit'
            >
              {submitLabel}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
  
}
