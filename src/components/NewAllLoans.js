import React, {useState, useEffect, useContext, useRef} from 'react';
import context from '../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  Autocomplete,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Card,
  Box,
} from '@mui/material';
import {SetCustomer} from '../redux/actions/pos_product_list';
import {listCustomerAction} from '../redux/actions/customer_actions';
import Customer from '../pages/crm/leads/customer';
import {useDispatch, useSelector} from 'react-redux';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {getTrimmedData} from './trimFunction/index';
import Context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import {listProductAction} from 'redux/actions/product_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

function NewAllLoans(props,) {  //{posId}
  const {
    customerReducer: {customer},
    productListReducer: {tab_count, product_lists},
    productReducer: {product},
  } = useSelector((state) => state);
  const dispatch = useDispatch();
  const current_date = moment();
  const tempdis = useRef(null);
  const [formValues, setFormValues] = useState({
    type: null,
    bank_Name: null,
    loan_account_number: null,
    ROI_amount: null,
    EMI_amount: null,
    tenor_of_loan: null,
    EMI_date: current_date,
    processing_fee: null,
    document_charges: null,
    other_charges: null,
    net_amount: null,
    loan_types : null
  });
  const [formErrors, setFormErrors] = useState({
    type: null,
    bank_Name: null,
    loan_account_number: null,
    ROI_amount: null,
    EMI_amount: null,
    tenor_of_loan: null,
    EMI_date: null,
    processing_fee: null,
    document_charges: null,
    other_charges: null,
    net_amount: null,
    loan_types : null
  });
  const [requiredFields] = useState([
    'type',
    'bank_Name',
    'loan_account_number',
    'ROI_amount',
    'EMI_amount',
    'tenor_of_loan',
    'EMI_date',
    'net_amount',
    'loan_types'
  ]);
  const [removeRepayment] = useState([
    'type',
    'bank_Name',
    'loan_account_number',
    'ROI_amount',
    'EMI_amount',
    'tenor_of_loan',
    'EMI_date',
    'processing_fee',
    'document_charges',
    'other_charges',
    'net_amount',
    'loan_types'
  ]);
  const [regex] = useState({});
  const [value, setValue] = React.useState({item_id: null, other: null});
  const [opentxt, setOpenTxt] = React.useState(false);
  const {selectData, setselectData} = useContext(context);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [form, setForm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const tempinitform = useRef(null);
  const tempinits = useRef(null);
  const temptaxforms = useRef(null);
  const tempedits = useRef(null);
  const [open, setopen] = React.useState(false);
  const [formvisible, setformvisible] = useState(true);
  const [pickerror, setpickerror] = useState(false);
  const [date, setdate] = React.useState(moment());

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    commoncookie,
  } = useContext(Context);

  const otherOption = {value: 'Other', label: 'Other', name: 'Other'};

  const initform = () => {
    setInitialState(formValues);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
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

  const cancel = () => {
    setDialog(false);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
    let tempArr =
      formValues.repayment_frequency_period === '0'
        ? removeRepayment
        : requiredFields;
    if (
      tempArr.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        value === 'undefined' ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
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
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleDateChange = async (date) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    setFormValues({...formValues ,EMI_date:convertedDate})
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    const temp = s.split('_').join(' ');
    return temp.charAt(0).toUpperCase() + temp.slice(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    let tempArr =
      formValues.repayment_frequency_period === '0'
        ? removeRepayment
        : requiredFields;
    await Object.keys(formValues).map((key, i) => {
      if (
        tempArr.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    if (isValid) {
      props.handleSubmit(getTrimmedData(formValues));
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const taxforms = () => {
    if (selectData.taxcategory) {
      const filter = [...props.taxcategory];
      const pops = filter.shift();
      setFormValues({...formValues, tax_category_id: pops.tax_category_id});
      setFormErrors({...formErrors, tax_category_id: false});
      setselectData('taxcategory', false);
    }
  };
  temptaxforms.current = taxforms;

  useEffect(() => {
    temptaxforms.current();
  }, [selectData.taxcategory]);

  useEffect(() => {
    if (props.status === "Edit" && props.data) {
      setFormValues(props.data);
    }
  }, [props.status, props.data]);

  const loanTypes = [
    { label : 'Business Loan' },
    { label : 'Loan Against Property' },
    { label : 'Personal Loan' },
    { label : 'Home Loan' },
    { label : 'Gold Loan' },
    { label : 'Vehicle Loan' }
  ]

  return (
    <Box sx={{ height: 'calc(100vh - 80px)' , display: 'flex' }}>
      <Card style={{padding:'20px'}}>
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
        {'Company Loans'}
      </Typography>

      <Grid container direction="row">
    
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
      <Grid container spacing={3}>
    <Grid
      style={{ display: 'flex', alignItems: 'center' }}
      size={{
        lg: 3,
        md: 4,
        sm: 6,
        xs: 12
      }}>
      <Typography style={{ marginRight: '12px' }}>Type:</Typography>
      <FormControl error={Boolean(formErrors.type)}>
        <RadioGroup row name="type" value={formValues.type} onChange={handleChange}>
          <FormControlLabel value="0" control={<Radio />} label="NBFC" />
          <FormControlLabel value="1" control={<Radio />} label="Bank" />
        </RadioGroup>
        <FormHelperText>{formErrors.type ?? ''}</FormHelperText>
      </FormControl>
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
        required
        fullWidth
        placeholder="Enter Bank Name"
        label="Bank Name"
        name="bank_Name"
        value={formValues.bank_Name ?? ''}
        variant="filled"
        error={Boolean(formErrors.bank_Name)}
        helperText={formErrors.bank_Name ?? ''}
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
        required
        fullWidth
        placeholder="Enter Loan Account Number"
        label="Loan Account Number"
        name="loan_account_number"
        value={formValues.loan_account_number ?? ''}
        variant="filled"
        error={Boolean(formErrors.loan_account_number)}
        helperText={formErrors.loan_account_number ?? ''}
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
        options = {loanTypes}
        value = {formValues.loan_types}
        onChange = {(name, value) => handleChange({target : {name: 'loan_types', value: value ? value.label : null}})}
        renderInput = {(params) => (
          <TextField 
            {...params}
            required
            label = 'Loan Types'
            variant = 'filled'
            error = {formErrors.loan_types !== null}
            helperText = {formErrors.loan_types === null ? '' : 'Loan Types is Required!'}
          />
        )}
      />
    </Grid>
    {/* </Grid> */}

    {/* <Grid  spacing={3}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat( auto-fit, minmax(22rem, 1fr) )',
          gridRowGap: '2rem',
          gridColumnGap: '1.5rem',
        }}
        container
        // direction='row'
        paddingTop='10px'> */}

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
            required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Enter Rate Of Interest'
            label='Rate Of Interest %'
            name='ROI_amount'
            value={formValues.ROI_amount === null ? '' : formValues.ROI_amount}
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            error={formErrors.ROI_amount === null ? false : true}
            helperText={
              formErrors.ROI_amount === null ? '' : formErrors.ROI_amount
            }
          />
          <FormControl
            error={
              formValues.ROI_amount !== null
                ? formErrors.ROI_period === null
                  ? false
                  : true
                : ''
            }
          >
            <FormHelperText>
              {formValues.ROI_amount !== null
                ? formErrors.ROI_period === null
                  ? ''
                  : formErrors.ROI_period
                : ''}
            </FormHelperText>
          </FormControl>
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
            required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Enter EMI Amount'
            label='EMI Amount'
            name='EMI_amount'
            value={formValues.EMI_amount === null ? '' : formValues.EMI_amount}
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            error={formErrors.EMI_amount === null ? false : true}
            helperText={
              formErrors.EMI_amount === null ? '' : formErrors.EMI_amount
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
            style={{}}
            fullWidth={true}
            placeholder='Enter Tenor Of Loan'
            label='Tenor Of Loan (Month)'
            name='tenor_of_loan'
            value={
              formValues.tenor_of_loan === null ? '' : formValues.tenor_of_loan
            }
            color='primary'
            type='text'
            variant='filled'
            error={formErrors.tenor_of_loan === null ? false : true}
            helperText={
              formErrors.tenor_of_loan === null ? '' : formErrors.tenor_of_loan
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
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label='EMI Date'
              value={toMomentOrNull(formValues.EMI_date)}
              format='DD/MM/YYYY'
              inputVariant='contained'
              onChange={(e, v) => {
                handleDateChange(e._d);
              }}
              views={['year', 'month', 'day']}
              slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
            />
          </LocalizationProvider>
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
            // required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Enter Processing Fee'
            label='Processing Fee'
            name='processing_fee'
            value={
              formValues.processing_fee === null
                ? ''
                : formValues.processing_fee
            }
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            // error={formErrors.processing_fee === null ? false : true}
            // helperText={
            //   formErrors.processing_fee === null
            //     ? ''
            //     : formErrors.processing_fee
            // }
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
            // required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Document Charges'
            label='Document Charges'
            name='document_charges'
            value={
              formValues.document_charges === null
                ? ''
                : formValues.document_charges
            }
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            // error={formErrors.document_charges === null ? false : true}
            // helperText={
            //   formErrors.document_charges === null
            //     ? ''
            //     : formErrors.document_charges
            // }
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
            // required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Enter Other Charges'
            label='Other Charges'
            name='other_charges'
            value={
              formValues.other_charges === null ? '' : formValues.other_charges
            }
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            // error={formErrors.other_charges === null ? false : true}
            // helperText={
            //   formErrors.other_charges === null ? '' : formErrors.other_charges
            // }
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
            required
            fullWidth
            onWheel={ (e) => e.target.blur()}
            placeholder='Enter Net Amount'
            label='Net/Loan Amount'
            name='net_amount'
            value={formValues.net_amount === null ? '' : formValues.net_amount}
            color='primary'
            type='number'
            InputProps={{inputProps: {min: 0}}}
            variant='filled'
            error={formErrors.net_amount === null ? false : true}
            helperText={
              formErrors.net_amount === null ? '' : formErrors.net_amount
            }
          />
        </Grid>
        </Grid>
        </Grid>

        {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}
      </Grid>

      <Grid
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: '50px',
          marginLeft: '30px',
          gap: '30px',
        }}
      >
        <Button
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
        </Button>

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
          Submit
        </Button>
      </Grid>

      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>

      </Card>
    </Box>
  );
}

export default NewAllLoans;
