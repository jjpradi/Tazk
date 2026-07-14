import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Dialog,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { scheduleReportPdfAction } from 'redux/actions/sales_actions';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
  import context from '../../../context/CreateNewButtonContext';

const CommonSchedule = (props) => {

    const dispatch = useDispatch()

       const {
          appConfigReducer : {app_config_data}
        } = useSelector((state) => state);

            const {
              commoncookie,
              setModalTypeHandler,
              setLoaderStatusHandler,
              headerLocationId,
            } = useContext(context);

  const [formData, setFormData] = useState({
    frequency: null,
    dateTime: null,
    emailRecipients: [],
    additionalRecipients: '',
    reportType : 'pdf',
    email : 1,
    whatsApp : 0,
    additional_phonenumbers : ''
  });

  const [formErrors, setFormErrors] = useState({
    frequency: null,
    dateTime: null,
    emailRecipients: null,
    additionalRecipients: null,
  });

  const [emailOptions, setEmailOptions] = useState([]);
  const [phone, setPhone] = useState();

  const requiredFields = ['frequency', 'dateTime', 'emailRecipients'];

  const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

  const setStateHandler = (name, value) => {
    const formObj = { ...formData };
    formObj[name] = value === '' ? null : value;
    setFormData(formObj);
    validateForm(name, value);
  };

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: capitalize(name.replace(/_/g, ' ')) + ' is required',
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();
  let isValid = true;
  let formErrorsObj = { ...formErrors };

  requiredFields.forEach((key) => {
    const value = formData[key];
    if (
      value === null ||
      value === 'null' ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      isValid = false;
      formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is required';
    } else {
      formErrorsObj[key] = null;
    }
  });

  setFormErrors(formErrorsObj);

  if (isValid) {
    // Combine emailRecipients and additionalRecipients into one array

    const selectedEmails = formData.emailRecipients.map((item) => item.email);
    const additionalEmails = formData.additionalRecipients
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);

    const additionalPhone = formData.additional_phonenumbers
      .split(',')
      .map((email) => Number(email.trim()))
      .filter((email) => !isNaN(email));

    const allRecipientsPhone = [Number(phone[0].value), ...additionalPhone].map((phone) => ({ phone }));
    const allRecipients = [...selectedEmails, ...additionalEmails].map((email) => ({ email }));

    console.log(allRecipientsPhone,'sdfdsfsdfsdf')
 

    // const finalData = {
    //   ...formData,
    //   emailRecipients: allRecipients,
    //   additionalRecipients: [], // You can optionally clear this if not needed anymore
    //   reportName: 'Sales Report',
    //   columns: props?.columns,
    // };

    const finalData = {
        report_name :props?.report_name,
        columns : JSON.stringify(props?.columns),
        frequency : formData.frequency.repeat,
        email_recipient : JSON.stringify(allRecipients),
        phone_number : JSON.stringify(allRecipientsPhone),
        export_type : formData.reportType,
        date_time : formData.dateTime,
        email : formData.email,
        whatsApp : formData.whatsApp,

    }

    delete finalData.additionalRecipients

    dispatch(scheduleReportPdfAction(finalData));
    console.log('finalValuessss', finalData);
    props.handleClose();
  }
};


  const frequentDates = [
    { repeat: 'Weekly' },
    { repeat: 'Monthly' },
    { repeat: 'Quarterly' },
    { repeat: 'Half-Yearly' },
    { repeat: 'Yearly' }
  ];

  

// useEffect(() => {
//   dispatch(getAppConfigDataAction())
// }, []);


useEffect(() => {
  if (app_config_data?.length > 0) {
    const company_email = app_config_data.filter((f) => f.key_name === 'company.email');
    const company_mobile = app_config_data.filter((f) => f.key_name === 'company.mobile');
    const company_name = app_config_data.filter((f) => f.key_name === 'company.name');
    if (company_email.length > 0) {
      setEmailOptions([
        {
          email: company_email[0].value,name : company_name[0].value
        }
      ]);
      if(company_mobile.length > 0){
        setPhone(company_mobile)
      }
    }
  }
}, [app_config_data]);




useEffect(() => {
  if (formData.TypeXls && formData.Typepdf) {
    // If both are true, disable the older one
    setFormData((prev) => ({
      ...prev,
      Typepdf: formData.TypeXls ? false : prev.Typepdf,
      TypeXls: formData.Typepdf ? false : prev.TypeXls,
    }));
  }
}, [formData.TypeXls, formData.Typepdf]);



console.log(props?.columns,'formDatassss',formData)

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      fullWidth
      maxWidth="md"
    >
      <Card sx={{ p: 5 }}>
        <Typography sx={{ pb: 4 }}>Schedule Report</Typography>

        <Grid container spacing={5}>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              disablePortal
              options={frequentDates}
              getOptionLabel={(option) => option.repeat || ''}
              value={formData.frequency}
              onChange={(event, newValue) => setStateHandler('frequency', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Frequency"
                  required
                  variant="filled"
                  error={!!formErrors.frequency}
                  helperText={formErrors.frequency}
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                slotProps={{
                  textField: {
                    variant: 'filled',
                    fullWidth: true,
                    name: 'dateTime',
                    required: true,
                    error: !!formErrors.dateTime,
                    helperText: formErrors.dateTime,
                  },
                }}
                label="Start Date & Time"
                value={formData.dateTime ? moment(formData.dateTime) : null}
                onChange={(val) => {
                  if (!val || !moment(val).isValid()) {
                    setFormErrors((prev) => ({
                      ...prev,
                      dateTime: 'Start Date & Time is required',
                    }));
                    setFormData((prev) => ({ ...prev, dateTime: null }));
                  } else {
                    const momentDate = moment(val);
                    setFormErrors((prev) => ({ ...prev, dateTime: null }));
                    setFormData((prev) => ({ ...prev, dateTime: momentDate }));
                  }
                }}
                format="DD/MM/YYYY hh:mm a"
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
                multiple
                options={emailOptions}
                getOptionLabel={(option) => option.email}
                value={formData.emailRecipients || []}
                onChange={(e, newValue) => setStateHandler('emailRecipients', newValue)}
                renderInput={(params) => (
                <TextField
                    {...params}
                    required
                    variant="filled"
                    label="Email Recipients"
                    error={Boolean(formErrors.emailRecipients)}
                    helperText={formErrors.emailRecipients}
                />
                )}
            />
            </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              fullWidth
              label="Additional Email Address"
              rows={4}
              variant="filled"
              value={formData.additionalRecipients}
              onChange={(e) => setStateHandler('additionalRecipients', e.target.value)}
              multiline
              helperText={'Use comma(,) to separate more than one email address'}
              disabled ={formData.email === 0 || formData.email === false}
            />
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              fullWidth
              label="Additional Recipients"
              rows={4}
              variant="filled"
              value={formData.additional_phonenumbers}
              onChange={(e) => setStateHandler('additional_phonenumbers', e.target.value)}
              multiline
              helperText={'Use comma(,) to separate more than one phone number'}
              disabled ={formData.whatsApp === 0 || formData.whatsApp === false}
            />
          </Grid>

           <Grid
             display="flex"
             alignItems="center"
             gap={2}
             size={{
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12
             }}>
            <Typography>Via : </Typography>

            <FormControlLabel
                control={
                    <Checkbox
                    checked={formData.email}
                    onChange={(e) =>
                        setFormData((prev) => ({
                        ...prev,
                        email: e.target.checked,
                        }))
                    }
                    />
                }
                label="Email"
            />

            <FormControlLabel
                control={
                <Checkbox
                checked={formData.whatsApp}
                onChange={(e) =>
                    setFormData((prev) => ({
                    ...prev,
                    whatsApp:  e.target.checked,
                    }))
                }
                />
            }
            label="WhatsApp"
            />
          </Grid>

          <Grid
            display="flex"
            alignItems="center"
            gap={2}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography>Attach Report As : </Typography>

            <FormControlLabel
                control={
                    <Checkbox
                    checked={formData.reportType === 'pdf'}
                    onChange={() =>
                        setFormData((prev) => ({
                        ...prev,
                        reportType: prev.reportType === 'pdf' ? null : 'pdf',
                        }))
                    }
                    />
                }
                label="Export As PDF"
            />

            <FormControlLabel
                control={
                <Checkbox
                checked={formData.reportType === 'xls'}
                onChange={() =>
                    setFormData((prev) => ({
                    ...prev,
                    reportType: prev.reportType === 'xls' ? null : 'xls',
                    }))
                }
                />
            }
            label="Export As XLSX"
            />
          </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid>
                <Button variant="contained" color="error" onClick={props.handleClose}>
                  Cancel
                </Button>
              </Grid>

              <Grid>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Dialog>
  );
};

export default CommonSchedule;
