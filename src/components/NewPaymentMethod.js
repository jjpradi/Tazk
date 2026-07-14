import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Autocomplete,
  Card,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import _ from 'lodash';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { useDispatch, useSelector } from 'react-redux';
import context from '../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
import { listBankCreationAction } from 'redux/actions/bankCreation_actions';
import { listPaymentTypeDetails } from 'redux/actions/payment_method_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

function NewPaymentMethod(props) {
  const dispatch = useDispatch()
  const { bankCreationReducer: { bank_creation_list }, paymentMethodReducer: { list_payment_type, search_paymentmethod_data } } = useSelector(s => s)
  const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)

  const [formValues, setFormValues] = useState({
    paymentName: null,
    paymentType: null,
    shortCode: null,
    bankAccountId: null,
  });
  const [formErrors, setFormErrors] = useState({
    paymentName: null,
    paymentType: null,
    shortCode: null,
    bankAccountId: null,
  });
  const [requiredFields] = useState([
    'paymentName',
    'paymentType',
    'shortCode',
    'bankAccountId',
  ]);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const [open, setOpen] = useState(false);

  const initsform = () => {
    setInitialState(formValues);
   
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listPaymentTypeDetails()),
        dispatch(listBankCreationAction()),
      )
    
  };

  useEffect(() => {
    if(props.pageType === 'detailpage') {
      if (search_paymentmethod_data?.length > 0) {
        if(props.pageType === 'detailpage'){
          setFormValues({
            ...formValues,
            paymentName: search_paymentmethod_data[1]?.paymentName,
            paymentType: search_paymentmethod_data[1]?.paymentType,
            shortCode: search_paymentmethod_data[1]?.shortCode,
            bankAccountId: search_paymentmethod_data[1]?.bankAccountId,
          })
        } else {
          setFormValues({
            ...formValues,
            paymentName: search_paymentmethod_data[0]?.paymentName,
            paymentType: search_paymentmethod_data[0]?.paymentType,
            shortCode: search_paymentmethod_data[0]?.shortCode,
            bankAccountId: search_paymentmethod_data[0]?.bankAccountId,
          })
        }
      }
    }
  }, [search_paymentmethod_data])
  
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
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    // } else if (
    //   requiredFields.includes(name) &&
    //   (capitalize(value) === 'Cash' ||
    //     (Object.keys(value) && value.value === null))
    // ) {
    //   setFormErrors({
    //     ...formErrors,
    //     [name]: capitalize(value) + ' is Not Allowed!',
    //   });
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

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      // let names = formValues.paymentName;
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' || formValues[key] === undefined)
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
    // if (
    //   formValues.paymentName?.toLowerCase() === 'cash' ||
    //   formValues.paymentType === 'Cash'
    // ) {
    //   isValid = false;
    // }
    await setFormErrors(formErrorsObj);

    // alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) {
      console.log('paymentisvalid')
      props.handleSubmit(getTrimmedData(formValues));
      if(props.pageType === 'detailpage') {
        console.log('paymentdetail')
        props.handleInitialSubmit()
      }
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      if(props.pageType === 'detailpage') {
        setFormValues(props.edit_id_data[1]);
      } else{
        setFormValues(props.edit_id_data[0]);
      }
      setInitialState(props.edit_id_data[0]);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto' }}>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
       {props.status === 'edit' ? "Update Payment Method" : "New Payment Method"}
      </Typography>
      <Grid
        spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
      >
        <Grid
          size={{
            lg: 10,
            md: 10,
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
          <FormControl
            variant='filled'
            required={true}
            // disabled={props.status === 'edit' ? true : false}
            error={formErrors.bankAccountId === null ? false : true}
            component='fieldset'
            fullWidth={true}
          >
            <InputLabel>Bank Name</InputLabel>
            <Select
              style={{}}
              name='bankAccountId'
              label='SaleType'
              // items={[{ "label": "Select one", "value": "" }, { "label": "option 1", "value": "one" }, { "label": "option 2", "value": "two" }]}
              onChange={handleChange}
              value={
                formValues.bankAccountId === null
                  ? ''
                  : formValues.bankAccountId
              }
            >
              {bank_creation_list.map((s) => (
                <MenuItem value={s.bankAccountId} key={s.bankAccountId}>
                  {s.bankName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formErrors.bankAccountId === null ? '' : 'Bank Name is Required!'}</FormHelperText>
          </FormControl>
            {/* <Autocomplete
                  value={formValues.bankAccountId !== null? props.bank_creation_list.filter(f=>f.id === formValues.bankAccountId)[0] : {name:''}}
                  name='bankAccountId'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                      handleChange({target : {name : 'bankAccountId' , value : 'bankAccountId'}})
                  }}
                  options={_.uniqBy(props.bank_creation_list,'name')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                  variant="outlined"
                  error={formErrors.bankAccountId === null ? false : true} 
                  helperText={formErrors.bankAccountId === null ? '' : formErrors.bankAccountId}
                  label='Bank Name'
                  required={true} />
                } /> */}

        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <FormControl
            variant='filled'
            required={true}
            // disabled={props.status === 'edit' ? true : false}
            error={formErrors.paymentType === null ? false : true}
            component='fieldset'
            fullWidth={true}
          >
            <InputLabel>Payment Type</InputLabel>
            <Select
              style={{}}
              name='paymentType'
              label='SaleType'
              // items={[{ "label": "Select one", "value": "" }, { "label": "option 1", "value": "one" }, { "label": "option 2", "value": "two" }]}
              onChange={handleChange}
              value={
                formValues.paymentType === null ? '' : formValues.paymentType
              }
              onOpen={handleOpen}
              onClose={handleClose}
              //  defaultValue={props.list_payment_type.filter((d)=> d.id === formValues.paymentType)[0]?.id || ''}
              // defaultValue={'hii'}
            >
              {open === true
                ? list_payment_type

                    .filter((f) => f.payment_type !== 'Cash')

                    .filter((lp) => {
                      return !props?.paymentMethod?.prodCatData?.some(
                        (pm) =>
                          pm.bankAccountId === formValues.bankAccountId &&
                          pm.paymentType === lp.payment_type,
                      );
                    })

                    .map((s) => (
                      <MenuItem value={s.id} key={s.id}>
                        {s.payment_type}
                      </MenuItem>
                    ))
                : list_payment_type.map((s) => (
                    <MenuItem value={s.id} key={s.id}>
                      {s.payment_type}
                    </MenuItem>
                  ))}
            </Select>
            <FormHelperText>{formErrors.paymentType === null ? '' :'Payment Type is Required!'}</FormHelperText>
          </FormControl>
           {/* <Autocomplete
                  value={formValues.paymentType !== null? props.list_payment_type.filter(f=>f.id === formValues.paymentType)[0] : {name:''}}
                  name='paymentType'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                      handleChange({target : {name : 'paymentType' , value : 'paymentType'}})
                  }}
                  options={_.uniqBy(props.list_payment_type,'name')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                  variant="outlined"
                  error={formErrors.paymentType === null ? false : true} 
                  helperText={formErrors.paymentType === null ? '' : formErrors.paymentType}
                  label='Payment Type'
                  required={true} />
                } /> */}

        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Payment Name'
            label='Payment Name'
            name='paymentName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues.paymentName === null ? '' : formValues.paymentName
            }
            error={formErrors.paymentName === null ? false : true}
            helperText={
              formErrors.paymentName === null ? '' : 'Payment Name is Required!'
            }
          />
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=" Enter Payment Type"
            label="Payment Type"
            name="paymentType"
            color="primary"
            multiline={false}
            type="text"
            regex=""
            variant="standard"
            value={
              formValues.paymentType === null ? "" : formValues.paymentType
            }
            error={formErrors.paymentType === null ? false : true}
            helperText={
              formErrors.paymentType === null ? "" : formErrors.paymentType
            }
          />
        </Grid> */}

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Short Code'
            label='Short Code'
            name='shortCode'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.shortCode === null ? '' : formValues.shortCode}
            error={formErrors.shortCode === null ? false : true}
            helperText={
              formErrors.shortCode === null ? '' : 'Short Code is Required!'
            }
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

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          
          
         
          >
          <TextField onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Bank Name'
            label='Bank Name'
            name='bankName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={formValues.bankName === null ? '' : formValues.bankName}
            error={formErrors.bankName === null ? false : true}
            helperText={formErrors.bankName === null ? '' : formErrors.bankName} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          
          
         
          >
          <TextField onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Account Number'
            label='Account Number'
            name='accountNumber'
            color='primary'
            multiline={false}
            type='number'
            regex=''
            variant='standard'
            value={formValues.accountNumber === null ? '' : formValues.accountNumber}
            error={formErrors.accountNumber === null ? false : true}
            helperText={formErrors.accountNumber === null ? '' : formErrors.accountNumber} />
        </Grid>

        // <Grid
          
        //   lg={3}
        //   md={4}
        //   sm={6}
        //   xs={12}
        //  
          
        //   >
        //   <FormControl required={true} component='fieldset' fullWidth={true} error={formErrors.accountType === null ? false : true}>
        //     <InputLabel>
        //         Account Type
        //     </InputLabel>
        //     <Select style={{}}
        //       name='accountType'
        //       label='Account Type'
        //       items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
        //       required={true}
        //       onChange={handleChange}
        //       value={formValues.accountType === null ? "" : formValues.accountType}>
        //       <MenuItem value=''>
        //         Select one
        //       </MenuItem>
        //       <MenuItem value={"one"}>
        //         Current
        //       </MenuItem>
        //       <MenuItem value={"two"}>
        //         Savings
        //       </MenuItem>
        //     </Select>
        //     <FormHelperText>
        //       {formErrors.accountType}
            </FormHelperText>
        //   </FormControl>
        // </Grid> */}

        <Grid
          // container={true}
          // direction='row'
          style={{marginBottom: '10px'}}
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
            paddingTop={props.pageType === 'detailpage' ? '40%' : '25px'}
          >
            {props.pageType === 'detailpage' && <Grid>
                <Button
                  onClick={props.handleInitialSubmit}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Skip And Submit
                </Button>
            </Grid>}
            {props.pageType === 'detailpage' ? <Grid>
                <Button
                  onClick={() => props.handleBack()}
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
            </Grid>  :
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
          </Grid>}

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
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      </Card>
    </>
  );
}

export default NewPaymentMethod;
