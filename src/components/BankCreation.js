import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import _ from 'lodash';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  InputLabel,
  FormHelperText,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
  Card
} from '@mui/material';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import context from '../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
import { useTheme } from '@mui/material/styles';
import { listBankCreationByPaginationAction } from 'redux/actions/bankCreation_actions';
import { getCreditDebitHintAction } from 'redux/actions/cash_box_actions';
import { accountNoValidation, bankAccountValidation, ifscValidation } from './regexFunction';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getCurrentFinancialYear, getDateTimeFormat } from 'utils/getTimeFormat';
import dayjs from 'dayjs';
import toMomentOrNull from 'utils/DateFixer';

function NewBankCreation(props) {
  const theme = useTheme();
  const dispatch = useDispatch()
  const { stockLocationReducer: { stocklocation }, bankCreationReducer: { searchBankData }, cashBoxReducer: { cashboxCreditDebitHint }, appConfigReducer: { app_config_data } } = useSelector((state) => state)
  const isAddAccEnable = app_config_data.find(item => item.key_name === "additional_acc")?.value || null;
  const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
  console.log("app_config_data", app_config_data, isAddAccEnable, commoncookie, JSON.parse(sessionStorage.getItem('login')) || '')
  const financialYear = getCurrentFinancialYear()
  const lastday = dayjs().set('month', 3).set('date', 1).set('year', parseInt(financialYear.fromDate.slice(0, 4))); 
  const [formValues, setFormValues] = useState({
    bankName: null,
    accountNumber: null,
    ifsc_code: null,
    branchName: null,
    address: null,
    location_id:[],
    bankAccountId: null,
    credit: null,
    debit: null,
    trans_date: null,
  });
  const [formErrors, setFormErrors] = useState({
    bankName: null,
    accountNumber: null,
    bankAccountId: null,
    ifsc_code: null,
    branchName: null,
    address: null,
    location_id:null,
    credit: null,
    debit: null
  });

  const [requiredFields] = useState([
    'bankName',
    'accountNumber',
    // 'bankAccountId',
    // 'ifsc_code',
    // 'branchName',
    // 'address',
    'location_id'
  ]);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [activeBalanceHint, setActiveBalanceHint] = useState('');
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);

  useEffect(() => {
    const payload = {
      type: 'Bank',
      ledger_id: formValues.ledger_id || null,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getCreditDebitHintAction(payload)),
    );
  }, [formValues.ledger_id]);

  const bankAccountRule = cashboxCreditDebitHint?.increaseOn && cashboxCreditDebitHint?.decreaseOn
    ? cashboxCreditDebitHint
    : null;

  const creditHintText = bankAccountRule
    ? `Hint: Credit will ${bankAccountRule.increaseOn === 'credit' ? 'increase' : 'decrease'} Bank balance.`
    : 'Hint: Credit effect depends on account type sign rules.';

  const debitHintText = bankAccountRule
    ? `Hint: Debit will ${bankAccountRule.increaseOn === 'debit' ? 'increase' : 'decrease'} Bank balance.`
    : 'Hint: Debit effect depends on account type sign rules.';


  useEffect(() => {
    if(props.pageType === 'detailpage') {
      if (searchBankData?.length > 0) {
        setFormValues({
          ...formValues,
          bankName: searchBankData[0]?.bankName,
          accountNumber: searchBankData[0]?.accountNumber,
          ifsc_code: searchBankData[0]?.ifsc_code,
          branchName: searchBankData[0]?.branchName,
          address: searchBankData[0]?.address,
          location_id: searchBankData[0]?.Locations_name,
        })
      }
    }
  }, [searchBankData])

  useEffect(() => {
   if(props.edit_id_data === 'detailpage') {
      if (searchBankData?.length > 0) {
        setFormValues({
          ...formValues,
          bankName: props.edit_id_data?.bankName,
          accountNumber: props.edit_id_data?.accountNumber,
          ifsc_code: props.edit_id_data?.ifsc_code,
          branchName: props.edit_id_data?.branchName,
          address: props.edit_id_data?.address,
          location_id: props.edit_id_data?.Locations_name,
        })
      }
    }
  }, [props.edit_id_data.length])

  const initsform = () => {
    let storage = JSON.parse(sessionStorage.getItem('login')) || ''
    setInitialState(formValues);
    let empID = isAddAccEnable == 1 ? storage?.employee_id : commoncookie
    // if (!props.stocklocation?.length) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listStockLocationAction(empID, headerLocationId))
        )
        // }
      };
      
  tempinitsform.current = initsform;

  useEffect(() => {
    tempinitsform.current();
  }, [headerLocationId]);

  useEffect(() => {
    if (
      headerLocationId !== 'null' &&
      Array.isArray(stocklocation)
    ) {
      const matchedLocation = stocklocation.find(
        (loc) => loc.location_id === headerLocationId
      );

      if (matchedLocation && !formValues.location_id?.some(l => l.location_id === headerLocationId)) {
        setFormValues((prev) => ({
          ...prev,
          location_id: [
            {
              location_id: matchedLocation.location_id,
              location_name: matchedLocation.location_name,
            },
          ],
        }));
      }
    }
    else{
          setFormValues((prev) => ({
          ...prev,
          location_id: []
        }));
    }
  }, [headerLocationId, stocklocation]);

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

    if (name === 'location_id' && value.length > 0) {
      setFormErrors({
        ...formErrors,
        ['location_id']: null,
      });
    }
    if(name === 'ifsc_code' && value.length > 0){
      const validation = ifscValidation(value)
      if(validation){
        setFormErrors({
          ...formErrors,
          ['ifsc_code']: null,
        });
      }
      else{
      setFormErrors({
        ...formErrors,
        ['ifsc_code']:'Ifsc Code is Invalid!',
      });
      return;
    }
    }
    if (name === 'accountNumber' && value.length > 0) {
      if (accountNoValidation(value)) {
        setFormErrors({
          ...formErrors,
          ['accountNumber']: null,
        });
      }
      else{
        setFormErrors({
          ...formErrors,
          ['accountNumber']: capitalize('accountNumber') + ' is Invalid!',
        });
        return;
      }
    }
    // if (name === 'location_id' && value.length === 0) {
    //   setFormErrors({
    //     ...formErrors,
    //     ['location_id']: capitalize('location_id') + ' is Required!',
    //   });
    //   return;
    // }


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

  const handleSubmit = (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
     Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === ''|| formValues[key]?.length === 0 || formValues === null)
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      else if (formErrorsObj[key] != null && formErrorsObj[key] !== undefined) {
        isValid = false;
      }
    });
    setFormErrors(formErrorsObj);

    // alert("Is Form Valid - " + isValid);

    // API call..
    if(props?.pageType === "EDIT"){
      formValues.bankAccountId = props.edit_id_data.bankAccountId;
    }
  
    if (isValid) {
      props.handleSubmit(formValues);
      if(props.pageType === 'detailpage') {
        props.handleNext()
    }
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const edits = () => {
  if (!props.edit_id_data || !stocklocation?.length) return;

  const editsdata = { ...props.edit_id_data };
  delete editsdata.tableData;

  let locationArray = [];

  if (props.edit_id_data.location_names) {
    const names = props.edit_id_data.location_names
      .split(',')
      .map(name => name.trim());

    locationArray = names
      .map(name => {
        const match = stocklocation.find(
          loc => loc.location_name === name
        );
        return match
          ? {
              location_id: match.location_id,
              location_name: match.location_name,
            }
          : null;
      })
      .filter(Boolean);
  }

  setFormValues(prev => ({
    ...prev,
    ...editsdata,
    location_id: locationArray,
  }));

  setInitialState({
    ...editsdata,
    location_id: locationArray,
  });
};



  // const edits = () => {
  //   if (props.edit_id_data) {
  //     // setFormValues(props.edit_id_data[0]);
  //     // let val = props.edit_id_data[0]?.Locations_name.filter((d) => {
  //     //   d.location_id
  //     // } )
  //     // setFormValues({...formValues, location_id : val})

  //     let editsdata = {...props.edit_id_data};
  //     delete editsdata.tableData
  //     delete editsdata.Locations_name;
  //     // setFormValues(editsdata)
  //     let location_id = props.edit_id_data.Locations_name?.filter(
  //       (d) => d,
  //     );
  //    // if (location_id?.length > 0) {
  //       setFormValues({...editsdata, location_id});
  //     //}
  //     setInitialState(props.edit_id_data);

  //   }
  // };
  tempedits.current = edits;
 
  useEffect(() => {
  tempedits.current();
}, [props.edit_id_data, stocklocation]);



  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Card sx={{ p: '20px', width: '100%', height: '85vh', minHeight: '100%',pb:'0px' }}>
      <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        {props.status === 'edit' ? "Update Bank Account" : "Add Bank Account"}
      </Typography>
      <Grid
        spacing={3}
        container
        direction='row'
      >
        <Grid
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
            placeholder=' Enter Bank Name'
            label='Bank Name'
            name='bankName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.bankName === null ? '' : formValues.bankName}
            error={formErrors.bankName === null ? false : true}
            helperText={formErrors.bankName === null ? '' : 'Bank Name is Required!'}
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

              let val = e.target.value;
                handleChange({
                  target:{
                    name:e.target.name, 
                    value:val}
                })
            }}
            onBlur={(e) => {

              let val = e.target.value;
                handleChange({
                  target:{
                    name:e.target.name, 
                    value:val}
                })
            }}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Account Number'
            label='Account Number'
            name='accountNumber'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues.accountNumber === null ? '' : formValues.accountNumber
            }
            error={formErrors.accountNumber === null ? false : true}
            helperText={
              formErrors.accountNumber
            }
          />
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <FormControl
            required={true}
            component="fieldset"
            fullWidth={true}
            error={formErrors.accountType === null ? false : true}
          >
            <InputLabel>Account Type</InputLabel>
            <Select
              style={{}}
              name="accountType"
              label="Account Type"
              items={[
                { label: "Select one", value: "" },
                { label: "one", value: "one" },
                { label: "two", value: "two" },
              ]}
              required={true}
              onChange={handleChange}
              value={
                formValues.accountType === null ? "" : formValues.accountType
              }
            >
              <MenuItem value="">Select one</MenuItem>
              <MenuItem value={"one"}>Current</MenuItem>
              <MenuItem value={"two"}>Savings</MenuItem>
            </Select>
            <FormHelperText>{formErrors.accountType}</FormHelperText>
          </FormControl>
        </Grid> */}

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={(e) => {

              let val = e.target.value.replace(/[^0-9a-zA-z]/g, "");
                handleChange({
                  target:{
                    name:e.target.name, 
                    value:val}
                })
            }}
            onBlur={(e) => {

              let val = e.target.value.replace(/[^0-9a-zA-z]/g, "");
                handleChange({
                  target:{
                    name:e.target.name, 
                    value:val}
                })
            }}
            // required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter IFSC code'
            label='IFSC Code'
            name='ifsc_code'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.ifsc_code === null ? '' : formValues.ifsc_code}
            error={formErrors.ifsc_code === null ? false : true}
            helperText={
              formErrors.ifsc_code
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
            placeholder=' Enter Branch Name'
            label='Branch Name'
            name='branchName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.branchName === null ? '' : formValues.branchName}
            error={formErrors.branchName === null ? false : true}
            helperText={
              formErrors.branchName === null ? '' : 'Branch Name is Required!'
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
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      onBlur={(e) => { handleChange(e); setActiveBalanceHint(''); }}
                      disabled={!!formValues.debit}
                      fullWidth
                      onWheel={(e) => e.target.blur()}
                      placeholder="Amount"
                      label="Credit - Opening Balance"
                      onFocus={() => setActiveBalanceHint('credit')}
                      name="credit"
                      value={formValues.credit || ''}
                      color="primary"
                      multiline={false}
                      type="text"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      variant="filled"
                      error={!!formErrors.credit}
                      helperText={formErrors.credit ? "Opening Balance is Required!" : activeBalanceHint === 'credit' ? creditHintText : ''}
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
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      onBlur={(e) => { handleChange(e); setActiveBalanceHint(''); }}
                      disabled={!!formValues.credit}
                      fullWidth
                      onWheel={(e) => e.target.blur()}
                      placeholder="Balance"
                      label="Debit - Opening Balance"
                      onFocus={() => setActiveBalanceHint('debit')}
                      name="debit"
                      value={formValues.debit || ''}
                      color="primary"
                      multiline={false}
                      type="text"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      variant="filled"
                      error={!!formErrors.debit}
                      helperText={formErrors.debit ? "Opening Balance is Required!" : activeBalanceHint === 'debit' ? debitHintText : ''}
                    />
                  </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  disableFuture
                  name='trans_date'
                  label="Date"
                  minDate={lastday}
                  //  maxDate={props.edit_id_data[0]?.isTransactionAvailable === true ? dayjs(props.edit_id_data[0]?.firstTransDate) : today}
                  format='DD/MM/YYYY'
                  disabled={(formValues.debit || formValues.credit) ? false : true}
                  // minDate={tomorrow}
                  // maxDate={dayaftertomorrow}
                  // defaultValue = {today}
                  value={toMomentOrNull(formValues.trans_date)}
                  onChange={(dates) => {
                    handleChange({
                      target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'trans_date' },
                    })
                  }
                  }
                  views={['year', 'month', 'day']}
                  fullWidth={true}
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
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          {/* <Autocomplete
            multiple
            limitTags={2}
            required={true}
            fullWidth={true}
            value={
              !_.isEmpty(props.edit_id_data)
                ? props.stocklocation.filter(
                    (s) =>
                      s.location_id === props.edit_id_data[0].location_id
                  )[0]
                : formValues.location_id !== ''
                ? props.stocklocation.filter(
                    (f) => f.location_id === formValues.location_id,
                  )[0]
                : {}
            }
            id='multiple-limit-tags'
            options={props.stocklocation.filter(
              (s) => s.location_name !== 'scrap location',
            )}
            getOptionLabel={(option) => option.location_name}
            // onChange={(e, v) => v !== null && setFormValues({ ...formValues, stockLocation: v.location_id })}
            onChange={(e, v) =>
              handleChange({
                target: {name: 'location_id', value: v ? v.location_id : ''},
              })
            }
            // renderInput={(params) => (
            //     <TextField {...params} variant="outlined"  required={true} label="StockLocation" placeholder="Select Location" fullWidth={true}

            //     error={formErrors.stockLocation === null ? false : true}
            //     helperText={formErrors.stockLocation === null ? '' : formErrors.stockLocation}  />
            // )}
            renderInput={(params) => {
              const get = {...params};
              return (
                <TextField
                  {...get}
                  required={true}
                  error={formErrors.location_id === null ? false : true}
                  helperText={
                    formErrors.location_id === null
                      ? ''
                      : 'Location is Required!'
                  }
                  label='Select Location'
                  variant='outlined'
                />
              );
            }}
          /> */}
          {props.pageType === "detailpage" ? 
           <Autocomplete
              multiple
              limitTags={2}
              fullWidth={true}
              // required
              value={
                formValues.location_id?.length > 0 ? formValues.location_id : []
              }
              // value={{location_name:formValues.location_id !==null ?props.stocklocation.filter(f => f.location_id === formValues.location_id)[0].location_name :''}}
              name='location_id'
                    onChange={(event, newValue) => {
                      const uniqueLocations = newValue?.filter(
                        (loc, index, self) =>
                          index === self.findIndex((l) => l.location_id === loc.location_id)
                      );

                      setFormValues({
                        ...formValues,
                        location_id: uniqueLocations?.map((d) => ({
                          location_id: d.location_id,
                          location_name: d.location_name,
                        })),
                      });
                      validationHandler('location_id', uniqueLocations || null);
                    }}
              id='multiple-limit-tags'
                  options={
                    stocklocation?.filter((s) => {
                      const headerMatch = headerLocationId === 'null' || headerLocationId === s.location_id;
                      return headerMatch;
                    })
                  }
              getOptionLabel={(option) => option.location_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='filled'
                  onBlur={handleChange}
                  required={true}
                  label='Location'
                  error={formErrors.location_id !== null ? true : false}
                  helperText={
                    formErrors.location_id === null
                      ? ''
                      : 'Location is required!'
                  }
                />
              )}
            />
  : <Autocomplete
  multiple
  limitTags={2}
  fullWidth={true}
  required
  value={
    formValues.location_id?.length > 0 ? formValues.location_id : []
  }
  // value={{location_name:formValues.location_id !==null ?props.stocklocation.filter(f => f.location_id === formValues.location_id)[0].location_name :''}}
  name='location_id'
                    onChange={(event, newValue) => {
                      const uniqueLocations = newValue?.filter(
                        (loc, index, self) =>
                          index === self.findIndex((l) => l.location_id === loc.location_id)
                      );
                      setFormValues({
                        ...formValues,
                        location_id: uniqueLocations?.map((d) => ({
                          location_id: d.location_id,
                          location_name: d.location_name,
                        })),
                      });
                      validationHandler('location_id', uniqueLocations || null);
                    }}

  id='multiple-limit-tags'
                  options={
                    stocklocation?.filter((s) => {
                      const headerMatch = headerLocationId === 'null' || headerLocationId === s.location_id;
                      return headerMatch;
                    })
                  }
  getOptionLabel={(option) => option.location_name || ''}
  renderInput={(params) => (
    <TextField
      {...params}
      variant='filled'
      onBlur={handleChange}
      required={true}
      label='Location'
      error={formErrors.location_id !== null ? true : false}
      helperText={
        formErrors.location_id === null
          ? ''
          : 'Location is required!'
      }
    />
  )}
/>
}
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
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='25px'
          >
            {props?.pageType !== 'detailpage' ? <Grid>
                {/* <Button
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
                </Button> */}
            </Grid> : <Grid></Grid>}

<Grid
  container
  spacing={2}
  direction="row"
  alignItems="center"
  justifyContent="flex-end">
  
{props?.pageType === "detailpage" && <Grid>
    <Button
      onClick={props.handleNext}
      variant="contained"
      color="primary"
      size="medium"
      type="submit"
    >
      Skip
    </Button>
  </Grid>}
  {/* Submit Button */}
  <Grid>
    <Button
      onClick={handleSubmit}
      variant="contained"
      color="primary"
      size="medium"
      type="submit"
    >
      {props?.pageType === "detailpage" ? "Next" : props?.pageType === "EDIT" ? "Update" : "Submit"}
    </Button>
  </Grid>

  {/* Cancel Button */}
  {props?.pageType !== 'detailpage' && <Grid>
    <Button
      variant="contained"
      color="error"
      onClick={props.handleClose}
    >
      Cancel
    </Button>
  </Grid> }
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

export default NewBankCreation;
