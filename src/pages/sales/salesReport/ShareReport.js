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
import { scheduleReportPdfAction, shareReportAction } from 'redux/actions/sales_actions';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
  import context from '../../../context/CreateNewButtonContext';

const ShareReport = (props) => {

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
    users: [],
    additionalUsers: '',
    additionalUsersEmail: '',
    email : 0,
    whatsApp : 1,
  });

  const [formErrors, setFormErrors] = useState({
    users: null,
    additionalUsers: null,
  });

  const [userOptions, setUserOptions] = useState([]);
  const [userNumber, setUserNumber] = useState([]);

  const requiredFields = ['users'];

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
    // Combine users and additionalUsers into one array

    const selectedEmails = formData.users.map((item) => item.phone);
    const additionalEmails = formData.additionalUsers
      .split(',')
      .map((phone) => phone.trim())
      .filter((phone) => phone);

    const allRecipients = [...selectedEmails, ...additionalEmails].map((phone) => ({ phone }));

    // const finalData = {
    //   ...formData,
    //   users: allRecipients,
    //   additionalUsers: [], // You can optionally clear this if not needed anymore
    //   reportName: 'Sales Report',
    //   columns: props?.columns,
    // };

    const finalData = {
       users :[{
  phone: JSON.stringify(allRecipients.map(e => ({
    phone: Number(e.phone) // ensures phone numbers are numbers, not strings
  })))
}],
       additionalUsers : formData.additionalUsers,
        reportName: props.report_name,
        columns: props?.columns,
        data :props?.data,
        fromDate : props?.fromDate || null,
        toDate : props?.toDate || null,
    }

    delete finalData.additionalUsers

    dispatch(shareReportAction(finalData));
    console.log('finalValuessss', finalData);
    props.handleClose();
  }
};

// useEffect(() => {
//   dispatch(getAppConfigDataAction())
// }, []);


useEffect(() => {
  if (app_config_data?.length > 0) {
    const company_user = app_config_data.filter((f) => f.key_name === 'company.name');
    const company_phone = app_config_data.filter((f) => f.key_name === 'company.mobile');
    if (company_user.length > 0) {
      setUserOptions([
        {
          user: company_user[0].value,
          phone: company_phone[0].value
        }
      ]);
    }
  }
}, [app_config_data]);

console.log(formData.users,'usersassdass')


  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      fullWidth
      maxWidth="md"
    >
      <Card sx={{ p: 5 }}>
        <Typography sx={{ pb: 4 }}>Share Report</Typography>

        <Grid container spacing={5}>
        

         

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
                multiple
                options={userOptions}
                getOptionLabel={(option) => option.user}
                value={formData.users || []}
                onChange={(e, newValue) => setStateHandler('users', newValue)}
                renderInput={(params) => (
                <TextField
                    {...params}
                    required
                    variant="filled"
                    label="Select Users"
                    error={Boolean(formErrors.users)}
                    helperText={formErrors.users}
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
            <TextField
              fullWidth
              label="Additional Users"
              rows={4}
              variant="filled"
              value={formData.additionalUsers}
              onChange={(e) => setStateHandler('additionalUsers', e.target.value)}
              multiline
               helperText={'Use comma(,) to separate more than one phone number'}
              disabled ={formData.whatsApp === 0 || formData.whatsApp === false}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <TextField
              fullWidth
              label="Additional Users"
              rows={4}
              variant="filled"
              value={formData.additionalUsersEmail}
              onChange={(e) => setStateHandler('additionalUsersEmail', e.target.value)}
              multiline
              helperText={'Use comma(,) to separate more than one email address'}
              disabled ={formData.email === 0 || formData.email === false}
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
                                  checked={formData.whatsApp}
                                  onChange={(e) =>{
                                    if(e.target.checked == false) {
                                    console.log(e.target.checked,'ghjgyjugy')
                                    setFormData((prev) => ({
                                  ...prev,
                                  additionalUsers : '',
                                  }))
                                  }
                                      setFormData((prev) => ({
                                      ...prev,
                                       email : 0,
                                      whatsApp:  e.target.checked,
                                      }))

                                    }
                                  }
                                  />
                              }
                              label="WhatsApp"
                              />
                      <FormControlLabel
                          control={
                              <Checkbox
                              checked={formData.email}
                              onChange={(e) =>{
                                  if(e.target.checked == false) {
                                    console.log(e.target.checked,'ghjgyjugy')
                                    setFormData((prev) => ({
                                  ...prev,
                                  additionalUsersEmail : '',
                                  }))
                                  }
                                  
                                  setFormData((prev) => ({
                                  ...prev,
                                  whatsApp : 0,
                                  email: e.target.checked,
                                  }))
                                
                              }
                              }
                              />
                          }
                          label="Email"
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

export default ShareReport;
