import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import AddIcon from '@mui/icons-material/Add';
import {formLabelsTheme} from './Asterisk';
import {
  Button,
  Switch,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Link,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormLabel,
  Card,
  Box,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import Autocomplete from '@mui/material/Autocomplete';
import _ from 'lodash';
import {consolidatedReceivings} from '../redux/actions/sales_actions';
import apiCalls from 'utils/apiCalls';
import { useDispatch, useSelector } from 'react-redux';
import context from '../context/CreateNewButtonContext';
import { sequenceAction, getSchemesLedgerAction, createSchemesLedgerAction } from 'redux/actions/manualNotes_actions';
import { customerAsCompanyAction } from 'redux/actions/customer_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { useCustomFetch } from 'utils/useCustomFetch';
import { GetTdsTaxes } from 'redux/actions/purchase_actions';
import { format } from 'date-fns';
import NewLedger from './Ledger';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  getDateTimeFormat,
  getDateFormat,
  yyyymmdd_ddmmyyyy,
  commonDateFormat,
} from '../../src/utils/getTimeFormat';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { createLedgerAction, updateLedgerAction } from 'redux/actions/ledger_actions';
import { listPayIndataAction, listPayOutdataAction } from 'redux/actions/chartOfAccounts';
import API_URLS from '../utils/customFetchApiUrls';
import toMomentOrNull from 'utils/DateFixer';

function NewManualNotes(props) {

  const [formValues, setFormValues] = useState({
    customer_id: null,
    supplier_id: null,
    schemesLedgerId: null,
    type: props.from,
    amount: null,
    description: null,
    gst_amount: null,
    tds_amount:null,
    Reference:null,
    date: moment(),
  });

  console.log("formValues",formValues,props.from)

  const [formErrors, setFormErrors] = useState({
    customer_id: null,
    supplier_id: null,
    schemesLedgerId: null,
    type: null,
    amount: null,
    description: null,
    gst_amount: null,
    tds_amount: null
  });
  const [requiredFields, setRequiredFields] = useState(['amount','schemesLedgerId','customer_id','supplier_id', 'description']);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const customerReset = useRef(null);
  const [activeType, setActiveType] = useState('customer_id');
  const [ledgerCreateOpen, setLedgerCreateOpen] = useState(false);
  const [createLedgerText, setCreateLedgerText] = useState('');
  const [gsttypes, setGsttypes] = useState([
    { id: 0, name: "0%" },
    { id: 5, name: "5%" },
    { id: 12, name: "12%" },
    { id: 18, name: "18%" }
  ]);

  
  
  const [gst, setgst] = useState(false);
  const [tds, settds] = useState(false);
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    setModalStatusHandler,
    headerLocationId,
  } = useContext(context);



  const {
    manualNoteReducer: { sequence, schemesLedger },
    customerReducer: { customerAsCompany },
    purchasesReducer:{tds_taxrate},
       stockLedgerReducer:{stock_ledger_list}
  } = useSelector((state) => state);

  const initsform = () => {
    setInitialState(formValues);
  };

  const setCreatedDataInAutoComplete = (data) => {
    setFormValues({...formValues, schemesLedgerId : data[0].id})
  }

  const handleCreateSchemeLedger = () => {
    dispatch(createSchemesLedgerAction({ name: createLedgerText }, setCreatedDataInAutoComplete))
    setCreateLedgerText('');
    
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      schemesLedgerId: null,
    }));
    setLedgerCreateOpen(false);
    
  }
 const customFetch = useCustomFetch();

 useEffect(() => { (async () => {
     let data1 = { type: props.from === 'D' ? 'Debit' : 'Credit' };
    await dispatch(sequenceAction())
    !customerAsCompany.length && dispatch(customerAsCompanyAction())
     dispatch(getSchemesLedgerAction(data1))
    const data = await customFetch(API_URLS.GET_GST_TYPES, 'GET');
     !tds_taxrate?.length && dispatch(GetTdsTaxes('list','null'))
  })();
},[])


  const ledgerSubmit = async (data) => {
    try {
      if (data.id) {
        // Update ledger
        await dispatch(updateLedgerAction(
          data.id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler
        ));
      } else {
        // Create new ledger
        const id = stock_ledger_list[0]?.sequence_id;
        const current_seq = stock_ledger_list[0]?.current_seq;

        await dispatch(createLedgerAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          { current_seq }
        ));
      }
      setLedgerCreateOpen(false);
      loadApi();

    } catch (error) {
      console.error("Ledger submit failed:", error);
    }
  };


  const loadApi = () => {
    let data1 = { type: props.from === 'D' ? 'Debit' : 'Credit' };
    dispatch(getSchemesLedgerAction(data1, setCreatedDataInAutoComplete))
  }

       
  // useEffect(() => {
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(sequenceAction()),
  //     !customerAsCompany.length && dispatch(customerAsCompanyAction()),
  //     !schemesLedger.length && dispatch(getSchemesLedgerAction(setCreatedDataInAutoComplete)),
  //   )
    
  // }, [])
  
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
    let { name, value } = e.target;

    setStateHandler(name, value);
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const setStateHandler = (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };


    setFormValues(formObj);
    validationHandler(name, value);
  };

  const fieldLabels = {
    supplier_id: "Supplier",
    customer_id: "Customer",
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
      const fieldLabel = fieldLabels[name] || capitalize(name);
      setFormErrors({
        ...formErrors,
        [name]: `${fieldLabel} is required!`,
      });
    }else {
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
    let formErrorsObj = {...formErrors};

    const updatedRequiredFields = formValues.type === 'C'
    ? ['amount', 'schemesLedgerId', 'customer_id', 'description']
    : ['amount', 'schemesLedgerId', 'supplier_id', 'description'];

    setRequiredFields(updatedRequiredFields);

    Object.keys(formValues).forEach((key) => {
      if (
        updatedRequiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + 'is Required!';
      } else if (regex[key] && !regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + 'is Invalid!';
        }
      });
      // if(formValues.type === 'C'){
      //   let sequencename = 'CREDIT NOTE SEQUENCE'
      //   let sequence_num = props.sequence?.find((d)=>d.sequence_name === sequencename)
      //   //formValues.sequence = 'CN'/(sequence_num+1);
      //   setFormValues({sequence:'CN'/(sequence_num.current_seq+1)})
      // }
      // else{
      //   let sequencename1 = 'DEBIT NOTE SEQUENCE'
      //   let sequence_num1 = props.sequence.find((d)=>d.sequence_name === sequencename1)
      //   // formValues.sequence = 'DB'/(sequence_num1+1);
      //   let sequence_value = (sequence_num1.current_seq+1)
      //   setFormValues({...formValues , sequence: sequence_value})

      // }
      // //let comparevalue = formValues.type === 'C'
      // let seperatevalue = props.sequence.find((d)=>d.sequence_name = sequencename)
    
      
      if (formValues.type === 'C' && !formValues.customer_id) {
        isValid = false;
        formErrorsObj.customer_id = 'Customer is Required!';
      } 
      if (formValues.type === 'D' && !formValues.supplier_id) {
        isValid = false;
        formErrorsObj.supplier_id = 'Supplier is Required!';
      }
    
      setFormErrors(formErrorsObj);
    // alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) {
      console.log(formValues?.amount , formValues.tds_amount?.tds_rate,'fff');
       
      const data = {
        ...formValues,
        amount: parseFloat(formValues.amount) + ((formValues?.amount * parseFloat(formValues.gst_amount ?? 0)) / 100) + (formValues.tds_amount ? ((formValues?.amount * parseFloat(formValues.tds_amount?.tds_rate)) / 100) : 0),
        customer_details: formValues.type === 'C' ? customerAsCompany.filter(i => i.customer_id === formValues.customer_id)[0] : null,
        supplier_details: formValues.type === 'C' ? null : customerAsCompany.filter(i => i.supplier_id === formValues.supplier_id)[0],
        // description : schemesLedger.filter(i => i.id === formValues.schemesLedgerId)[0]?.name,
        tds_amount: (formValues?.amount * parseFloat(formValues.tds_amount?.tds_rate)) / 100,
        gst_amount: (formValues?.amount * parseFloat(formValues.gst_amount)) / 100,
        gst_id: parseFloat(formValues.gst_amount),
        tds_id: parseFloat(formValues.tds_amount?.id)
      }
      console.log(data,'data');
      
      props.handleSubmit(getTrimmedData(data));
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      let editValues = props.edit_id_data[0];
      console.log("editValues", editValues)
      // setFormValues(props.edit_id_data[0]);
      let taxid = tds_taxrate?.filter((v) => v.id == editValues?.tds_id)[0]
      taxid ? settds(true) : settds(false)
      editValues?.gst_id ? setgst(true) : setgst(false)
      setInitialState(props.edit_id_data[0]);
      if (editValues.type === 'C') {
        setActiveType('customer_id');
        setFormValues({
          ...editValues,
          tds_amount: taxid,
          tds_id:editValues?.tds_id,
          gst_amount: editValues?.gst_id,
          supplier_id: null,
          date: editValues.date
            ? moment(editValues.date, "YYYY-MM-DD").toDate()
            : new Date(),
        });
      } else if (editValues.type === 'D') {
        setActiveType('supplier_id');
        setFormValues({
          ...editValues,
          tds_amount: taxid,
          gst_amount: editValues?.gst_id,
          customer_id: null,
          date: editValues.date
            ? moment(editValues.date, "YYYY-MM-DD").toDate()
            : new Date(),
        });
      }

    }

  };
  
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);
  

  const GST = (e) => {
    let { value } = e.target;
    setgst(value === 'true' ? true : false);
    if(value === 'false'){
      setFormValues({...formValues, gst_type : null})
    }
    
    // setyes(value === 'true' ? 1 : 0);
  }
  
  const TDS = (e) => {
    let { value } = e.target;
    settds(value === 'true' ? true : false);
  }

  const currentDate = format(new Date(), 'dd-MM-yyyy');

  return (
    <>
      {Prompt}
      <Typography
        variant='h6'
        align='left'
        fontWeight='bold'
        style={{ paddingBottom: '5px' }}
      >
        {props.status === 'edit'
          ? props.from === 'D'
            ? 'Update debit Note'
            : 'Update credit Note'
          : props.from === 'D'
            ? 'New debit Note'
            : 'New credit Note'}
      </Typography>
      {/* <div
        style={{
          border: '1px solid #b5b5b5',
          borderRadius: '10px',
          justifyContent: 'center',
          display: 'flex',
          padding: '5px',
        }}
      >
        <FormControl component='fieldset'>
          {props.from === 'C' ? (
            <Typography variant='h6'>Credit Note</Typography>
          ) : (
            <Typography variant='h6'>Debit Note</Typography>
          )}
        </FormControl>
      </div> */}
      <Grid spacing={3} container direction='row' sx={{paddingTop: 2}}>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 10,
            xs: 10
          }}>
          <Box display='flex' justifyContent='flex-end'>
            {/* <div style={{justifyContent: 'right', display:'flex', marginTop: '25px'}}> */}
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Date'
                // inputFormat='DD/MM/yyyy'
                name='date'
              value={toMomentOrNull(formValues.date)}
              format='DD/MM/YYYY'
                inputVariant='contained'
                disableFuture
                onChange={(newValue) => {
                  setFormValues({ ...formValues, date: newValue });
                }}
                slotProps={{ textField: { variant: 'filled' } }}
              />
            </LocalizationProvider>
            {/* </div> */}
          </Box>
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                id='multiple-limit-tags'
                disabled={props.status === 'edit' ? true : false}
                defaultValue={
                  !_.isEmpty(props.edit_id_data)
                    ? // props.edit_id_data[0]
                      customerAsCompany.filter(
                        (d) =>
                          d.customer_id ===
                            props.edit_id_data[0]?.customer_id ||
                          d.supplier_id === props.edit_id_data[0]?.supplier_id,
                        // (d) => formValues.type === 'C'?
                        // d.customer_id ===
                        // props.edit_id_data[0].customer_id : props.edit_id_data[0].supplier_id ,
                      )[0] || undefined
                    : customerAsCompany.filter(
                        (d) =>
                          d.customer_id === formValues?.customer_id ||
                          d.supplier_id === formValues?.supplier_id,
                      )[0]
                }
                options={customerAsCompany.filter((c) =>
                  formValues.type === 'C'
                    ? c.company_name !== null && c.customer_type === '1'
                    : c.supplier_id,
                )}
                fullWidth
                getOptionLabel={(option) => option.company_name}
                onChange={(e, c) => {
                  setStateHandler(
                    formValues.type === 'C' ? 'customer_id' : 'supplier_id',
                    c === null
                      ? ''
                      : formValues.type === 'C'
                      ? c.customer_id
                      : c.supplier_id,
                  );
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.person_id}>
                      {option.company_name}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth={true}
                    required={true}
                    variant='filled'
                    label={
                      formValues.type === 'C'
                        ? 'Select Customer'
                        : 'Select Vendor'
                    }
                    placeholder='Select Customer'
                    error={Boolean(
                      formValues.type === 'C'
                        ? formErrors.customer_id
                        : formErrors.supplier_id,
                    )}
                    helperText={
                      formValues.type === 'C'
                        ? formErrors.customer_id || ''
                        : formErrors.supplier_id || ''
                    }
                  />
                )}
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                limitTags={2}
                required={true}
                fullWidth={true}
                value={
                  !_.isEmpty(props.edit_id_data?.length)
                    ? schemesLedger.filter(
                        (s) => s.id === props.edit_id_data[0]?.schemesLedgerId,
                      )[0]
                    : formValues.schemesLedgerId !== null
                    ? schemesLedger.filter(
                        (f) => f.id === formValues.schemesLedgerId,
                      )[0]
                    : {name: ''}
                }
                id='multiple-limit-tags'
                name='schemesLedgerId'
                options={schemesLedger}
                getOptionLabel={(option) => option?.name}
                onChange={(e, c) => {
                  setStateHandler('schemesLedgerId', c === null ? '' : c.id);
                }}
                renderInput={(params) => {
                  const get = {...params};
                  get.InputProps = {
                    ...params.InputProps,
                    startAdornment: (
                      <Tooltip title='Create New'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setLedgerCreateOpen(true);
                          }}
                        >
                          <AddIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    ),
                  };

                  return (
                    <TextField
                      {...get}
                      required={true}
                      error={formErrors.schemesLedgerId === null ? false : true}
                      helperText={
                        formErrors.schemesLedgerId === null
                          ? ''
                          : 'Ledger is Required!'
                      }
                      label='Schemes Ledger'
                      variant='filled'
                    />
                  );
                }}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={(e) => {
                  const value = e.target.value;
                  // Prevent setting zero as a value
                  if (value === '0') {
                    return; // Do nothing if the input is zero
                  }
                  handleChange(e); // Call the existing handler for valid input
                }}
                onBlur={handleChange}
                required={true}
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                placeholder='Amount'
                label='Amount'
                name='amount'
                color='primary'
                multiline={false}
                type='number'
                variant='filled'
                value={formValues.amount === null ? '' : formValues.amount}
                error={formErrors.amount === null ? false : true}
                helperText={
                  formErrors.amount === null ? '' : 'Amount is Required!'
                }
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={(e) => {
                  handleChange(e);
                }}
                onBlur={handleChange}
                required={true}
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                placeholder='Description'
                label='Description'
                name='description'
                color='primary'
                multiline={false}
                //type='number'
                variant='filled'
                value={
                  formValues.description === null ? '' : formValues.description
                }
                error={formErrors.description === null ? false : true}
                helperText={
                  formErrors.description === null ? '' : 'description is Required!'
                }
              />
            </Grid><Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 12
            }}>
              <TextField
                onChange={(e) => {
                  handleChange(e);
                }}
                onBlur={handleChange}
                //required={true}
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                placeholder='Reference'
                label='Reference'
                name='Reference'
                color='primary'
                multiline={false}
                //type='number'
                variant='filled'
                value={
                  formValues.Reference === null ? '' : formValues.Reference
                }
                // error={formErrors.description === null ? false : true}
                // helperText={
                //   formErrors.amount === null ? '' : 'description is Required!'
                // }
              />
            </Grid>
            <Grid
              style={{display:'flex',justifyContent:'center'}}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl>
                <FormLabel id='demo-radio-buttons-group-label'>
                  Include GST
                </FormLabel>

                <RadioGroup
                  row
                  aria-label='customer'
                  value={gst === true ? 'true' : 'false'}
                  name='customer_type'
                  onChange={GST}
                >
                  <FormControlLabel
                    value='true'
                    label='Yes'
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value='false'
                    label='No'
                    control={<Radio />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Autocomplete
                options={gsttypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value}
                value={
                  gsttypes?.find((type) => type.id === formValues.gst_amount) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: 'gst_amount',
                      value: newValue ? newValue.id : '',
                    },
                  });
                }}
                disabled={gst === false ? true : false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select GST Percentage'
                    variant='filled'
                    fullWidth
                    error={formErrors.gst_amount === null ? false : true}
                    helpertext={
                      formErrors.gst_amount === null ? '' : formErrors.gst_amount
                    }
                  />
                )}
                renderOption={(props, option) => (
                  <MenuItem {...props} key={option.id} value={option.id}>
                    <div>
                      <strong className='cardheadervalue'>{option.name}</strong>
                      <br />
                      <small
                        style={{
                          fontWeight: '5',
                          fontSize: '11px',
                          color: 'gray',
                        }}
                      >
                        {option.description}
                      </small>
                    </div>
                  </MenuItem>
                )}
              />
            </Grid>
            <Grid
              style={{display:'flex',justifyContent:'center'}}
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl>
                <FormLabel id='demo-radio-buttons-group-label'>
                  Include TDS
                </FormLabel>

                <RadioGroup
                  row
                  aria-label='customer'
                  value={tds === true ? 'true' : 'false'}
                  name='customer_type'
                  onChange={TDS}
                >
                  <FormControlLabel
                    value='true'
                    label='Yes'
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value='false'
                    label='No'
                    control={<Radio />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                name='tds_percent'
                options={tds_taxrate}
                disabled={tds === false ? true : false}
                value={formValues.tds_amount}
                getOptionLabel={(option) =>
                  `${option.category} [${option.tds_rate}]`
                }
                onChange={(event, newValue) =>
                  handleChange({target: {name: 'tds_amount', value: newValue}})
                }
               
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Select a tds'
                      variant='filled'
                      fullWidth
                      error={formErrors.tds_amount === null ? false : true}
                      helpertext={
                        formErrors.tds_amount === null ? '' : formErrors.tds_amount
                      }
                    />
                  )}
                
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: 2,
            md: 2,
            sm: 2,
            xs: 2
          }}></Grid>

        <Grid
          style={{paddingTop: '25px'}}
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
          >
            <Grid>
              {form === false ? (
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
              ) : (
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
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* <Dialog
        open={ledgerCreateOpen}
        onClose={() => setLedgerCreateOpen(false)}
      >
        <DialogTitle>Create Ledger</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Ledger Name'
            type='text'
            fullWidth
            variant='filled'
            value={createLedgerText}
            onChange={(e) => setCreateLedgerText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => setLedgerCreateOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleCreateSchemeLedger}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog> */}
      <Dialog
           open={ledgerCreateOpen}
           onClose={() => setLedgerCreateOpen(false)}
            maxWidth="md"
           fullWidth
         >
           <Card sx={{ m: 3, p: 2 }}>
             <Grid container>
               <Grid size={12}>
                 <NewLedger
                   handleClose={() => setLedgerCreateOpen(false)}
                   handleSubmit={ledgerSubmit}
                   ledgerStatus={'create'}
                   from={props.from}
                 />
               </Grid>
             </Grid>
           </Card>
         </Dialog>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewManualNotes;
