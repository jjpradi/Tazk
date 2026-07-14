import {TextField} from '@mui/material';
import {
  FormControl,
  Grid,
  Typography,
  Container,
  FormControlLabel,
  Autocomplete,
  Button,
  Switch,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker,TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { createReminderAction, getRemindersAction } from 'redux/actions/calender_actions';
import { listSalesOutstandingAction } from 'redux/actions/sales_actions';
import apiCalls from 'utils/apiCalls';
import Context from '../../../context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { listCustomerAction } from 'redux/actions/customer_actions';
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';
import toMomentOrNull from '../../../utils/DateFixer';
// import Context from '../../context';
// import toMomentOrNull from 'utils/DateFixer';

const ReminderForm = (props) => {
  const [repeat, setRepeat] = useState(false);
  const [validRegex, setValidRegex] = useState({
    dateValid: false,
  });
  const [formData, setFormData] = useState({
    title: null,
    description: null,
    date: null,
    time: null,
    repeat: null,
    name:null,
    id : null
  });
  // console.log("formData",formData)

  const [formErrors, setFormErrors] = useState({
    title: null,
    description: null,
    date: null,
    time: null,
    repeat: null,
    name : null,
    id : null
  });

  const dispatch = useDispatch()

  const {
    salesReducer: { sale_outstanding},
    customerReducer: { customer },
    vendorReducer: { vendorIdAndName }

  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(Context);

    const storage = getsessionStorage()
    let person_id = storage?.person_id
  const requiredFields = ['title', 'description', 'date', 'time'];

  if (repeat) {
    requiredFields.push('repeat');
  }
  if(props.type && props.type !== 'manual'){
    requiredFields.push('name','id');

  }

  const handleChange = (name, value) => {
    setFormData((prevData) => {
      const newFormData = { ...prevData, [name]: value || null };
      validateForm(name, value); 
      return newFormData;
    });
  };
  

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: `${name} is Required`,
      }));
    } else {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: null,
      }));
    }
  
    if (name === 'date' && value !== null) {
      if (!moment(value, moment.ISO_8601).isValid()) {
        setValidRegex({ ...validRegex, dateValid: false });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Date is Invalid!',
        }));
      } else {
        setValidRegex({ ...validRegex, dateValid: true });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null,
        }));
      }
    }
  };
  

  const daysToRepeat = [
    {repeat: 'Daily'},
    {repeat: 'WeekDays'},
    {repeat: 'WeekEnds'},
    {repeat: 'Weekly'},
    {repeat: 'Monthly'},
    {repeat: 'Yearly'},
  ];
console.log(formData, 'formDatayturtyter')
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    let formErrObj = { ...formErrors };
    requiredFields.forEach((key) => {
      if (
        formData[key] === null ||
        formData[key] === 'null' ||
        formData[key] === ''
      ) {
        isValid = false;
        formErrObj[key] = `${key} is required`;
      } else {
        formErrObj[key] = null;
      }
    });

    setFormErrors(formErrObj);

    if (isValid) {
      if (props?.type === 'payable') {

        const data = {
          date: formData.date,
          time: formData.time,
          type: 'payable',
          repeat: repeat ? 1 : 0,
          duration: repeat ? formData.repeat.repeat : 'null',
          title: formData.title,
          description: formData.description,
          po_number: formData.id.po_number,
          person_id: formData.id.person_id,
          edit: props.data ? 'edit' : 'null',
          id: props?.data?.id
        };

        await dispatch(createReminderAction(data, (response) => {
          if (response === 200) {
            dispatch(getRemindersAction())
            props?.handleClose()
          }
        }
        ))
      }
      else if (props?.type === 'receivable') {
        const data = {
          date: formData.date,
          time: formData.time,
          type: 'receivable',
          repeat: repeat ? 1 : 0,
          duration: repeat ? formData.repeat.repeat : 'null',
          title: formData.title,
          description: formData.description,
          invoice_number: formData.id.invoice_number,
          customer_id: formData.name.customer_id,
          edit: props.data ? 'edit' : 'null',
          id: props?.data?.id
        };

        await dispatch(createReminderAction(data, (response) => {
          if (response === 200) {
            dispatch(getRemindersAction())
            props?.handleClose()
          }
        }
        ))
      }
      else {
        const data = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          repeat: repeat ? 1 : 0,
          duration: repeat ? formData.repeat.repeat : 'null',
          edit: props.data ? 'edit' : 'null',
          id: props?.data?.id,
          person_id:person_id
        };

        await dispatch(createReminderAction(data, (response) => {
          if (response === 200) {
            dispatch(getRemindersAction())
            props?.handleClose()
          }
        }
        ))
      }
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  //const dataObj = formData?.name?.childRow?.map((e) => ({ po: props.type ==='payable' ?  e.po_number : e.invoice_number }));


  
  useEffect(() => {
   if (props.data && props.type === 'receivable' && customer?.length > 0) {
  const selectedCustomer = customer.find(
    (e) => e.customer_id === props.data.name
  );

  const selectedInvoice = props.datas.find(
    (e) => e.invoice_number === props.data.so_number
  );

  setFormData((prev) => ({
    ...prev,
    name: selectedCustomer || null,
    id: selectedInvoice || null,
    title: props.data.title,
    description: props.data.description,
    time: props.data.time,
    date: props.data.date,
  }));
}
    console.log(props.data,'sadasdas',props.datas)
    if (props.data && props.type === 'payable') {
  const propData = props.datas.find((e) => e.person_id === props.data.name);
  const propData1 = props.datas.find((f) => f.po_number === props.data.po_number);

  setFormData((prev) => ({
    ...prev,
    name: propData || null,   // Fix here
    id: propData1 || null,    // Optional: guard this too
    title: props.data.title,
    description: props.data.description,
    time: props.data.time,
    date: props.data.date,
  }));
}
    if(props.type === 'manual'){
      
      setFormData((prev) => ({
        ...prev, 
        title:props.data.title,description:props.data.description,time:props.data.time,date:props.data.date
      }));
    }

  }, [props.data,customer]); 
  // const uniqueVendor = [...new Map(customer?.map(item => 
  //   [props.type ==='payable' ? `${item.vendorName}` : `${item.company_name}`, item] 
  // )).values()];
  const uniqueVendor = props.type === 'payable'
    ? [...new Map(vendorIdAndName?.map(item =>
      [`${item.company_name}`, item]
    )).values()]
    : [...new Map(customer?.map(item =>
      [`${item.company_name}`, item]
    )).values()];

  const uniquePo = [...new Map(props?.datas?.map(item => 
    [props.type ==='payable' ? `${item.po_number}` : `${item.invoice_number}`, item]
  )).values()];

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listVendorIdAndNameAction())
    );
  }, []);

  // console.log(props.data.name,'optionspooooo',propData)
  console.log(props?.datas,uniqueVendor,'909jjjj')

  return (
    <div>
      <Container>
        <Typography sx={{pt: 3,pb: 3}}>Reminder</Typography>

        <Grid container spacing={5}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              fullWidth
              name='title'
              variant='filled'
              label='Title'
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              error={formErrors.title !== null}
              helperText={formErrors.title}
            />
          </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Date'
                value={toMomentOrNull(formData.date)}
                onChange={(date) =>handleChange('date',date ? moment(date).format('YYYY-MM-DD') : null)}
                views={['year', 'month', 'day']}
                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, error: formErrors.date !== null, helperText: formErrors.date } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <TimePicker
                label="Time"
                value={toMomentOrNull(formData.time)}
                onChange={(time) => {
                  if (time && moment(time).isValid()) {
                    handleChange('time', moment(time).format('HH:mm:ss'))
                  } else {
                    handleChange('time', null);
                  }
                }}
                onError={(reason) => {
                  handleChange('time', null)
                }}
                disableMaskedInput
                slotProps={{ textField: { required: true, variant: "filled", fullWidth: true, error: Boolean(formErrors.time), helperText: formErrors.time } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                />
              }
              label='Repeat'
            />
          </Grid> */}



          {(props?.type && props.type !== 'manual') && 
          <>
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
  <Autocomplete
    // disablePortal
    options={uniqueVendor  || []}
    getOptionLabel={(option) => 
      props.type === 'payable' ? (option.company_name || option.vendorName) : option.company_name || ''
    }
    value={formData.name ||  null} 
    onChange={(e, newValue) => handleChange('name', newValue)}
    renderInput={(params) => (
      <TextField
        {...params}
        fullWidth
        label={props.type === 'payable' ? 'Select Vendor' : 'Select Customer'}
        required
        variant='filled'
        error={formErrors.name !== null}
        helperText={formErrors.name !== null && (props.type === 'payable' ? 'Vendor is Required' : 'Customer is Required')}
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
              <Autocomplete
                // disablePortal
                options={uniquePo || []}
                getOptionLabel={(option) =>props.type === 'payable' ? option.po_number : option.invoice_number || ''}
                value={formData.id || null}
                onChange={(e, newValue) => handleChange('id', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label={props.type === 'payable' ? 'Select Po/No' : 'Select In/No'}
                    required
                    variant='filled'
                    error={formErrors.id !== null}
                    helperText={formErrors.id !== null && (props.type === 'payable' ? 'Po/No is Required' : 'In/No is Required')}
                  />
                )}
              />
            </Grid>

            </>
            }

          

          {repeat && (
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                disablePortal
                options={daysToRepeat}
                getOptionLabel={(option) => option.repeat || ''}
                value={formData.repeat || null}
                onChange={(e, newValue) => handleChange('repeat', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label='Repeat'
                    required
                    variant='filled'
                    error={formErrors.repeat !== null}
                    helperText={formErrors.repeat}
                  />
                )}
              />
            </Grid>
          )}

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography m={'15px 0px 5px 0px'}>
              Description
            </Typography>
            <TextField
              fullWidth
              label='Description'
              required
              rows={4}
              variant='filled'
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              error={formErrors.description !== null}
              helperText={formErrors.description}
            />
          </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent='flex-end' spacing={2} mb={2}>
              <Grid>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => props.handleClose()}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default ReminderForm;
