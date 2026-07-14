import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../../../pages/common/unChangeswarning';
import CircularProgress from '@mui/material/CircularProgress';
import CancelDialog from '../../../components/CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  Typography,
  TextField,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
// import { useTheme } from '@emotion/react';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import MaterialTable from 'utils/SafeMaterialTable';
import DenominationDialog from '../../../pages/accounts/cashOutIn/DenominationDialog';
import _ from 'lodash';
// import { useDispatch, useSelector } from 'react-redux';
import Chip from '@mui/material/Chip';
import listBankCreationAction, {
  setTransactionCount,
} from '../../../redux/actions/bankCreation_actions';
import {useSelector, useDispatch} from 'react-redux';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Box from '@mui/material/Box';
import context from '../../../context/CreateNewButtonContext';
import {
  listPayIndataAction,
  listPayOutdataAction,
} from 'redux/actions/chartOfAccounts';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import {getDateFormat} from 'utils/getTimeFormat';

function OpeningBalNewCashOutIn(props) {
  const [formValues, setFormValues] = useState({
    expense: null,
    ledger_id: null,
    reason: null,
    amount: null,
    payment_id: null,
    cashboxId: null,
    activeChip: null,
    cash_type: null,
    date: getDateFormat(new Date()),
    location_id: null,
    paymentModeLedgerId: null,
    amount_in_change: [],
    amount_in_denomination: [],
  });
  const [ledger_name, setLedgerName] = useState(null);
  const [formErrors, setFormErrors] = useState({
    expense: null,
    ledger_id: null,
    reason: null,
    amount: null,
    discount_type: null,
    payment_id: null,
    date: null,
    upload: null,
  });
  const [requiredFields] = useState([
    'reason',
    'amount',
    'payment_id',
  ]);
  const [regex] = useState({});
  const [Prompt] = UnSavedChangesWarning();
  // const [initialState, setInitialState] = useState({})
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [formval, setFormVal] = useState({ledgerVal: null});
  const [single, setsingle] = useState('0');
  const [tabData, setTabData] = useState([]);
  const [activeChip, setActiveChip] = useState('cash');
  // const {chartOfAccounts, expenses} = props;
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const AmountRef = useRef(null);
  const [openDenomination, setOpenDenomination] = useState(false);
  const [currentTarget, setCurrentTarget] = useState('Tendered');
  const [expenseValue, ExpenseValue] = React.useState([]);
  // const dublicateexpense = props.expense?.filter((d) => d.expense) || [];
  const dispatch = useDispatch();
  const [locationId, setLocationId] = useState('');
  const {headerLocationId} = useContext(context);
  const [amountNegativeValidation, setAmountNegativeValidation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);

  const {
    ChartOfAccountsReducer: {
      chartOfAccounts_payOut_data,
      chartOfAccounts_payIn_data,
    },
  } = useSelector((state) => state);

  const [openPayIn, setOpenPayIn] = useState(false);
  const [openPayOut, setOpenPayOut] = useState(false);
  const [payOutData, setPayOutData] = useState([
    ...chartOfAccounts_payOut_data,
  ]);
  const [payInData, setPayInData] = useState([...chartOfAccounts_payIn_data]);
  const loadingPayIn = openPayIn && payInData.length === 0;
  const loadingPayout = openPayOut && payOutData.length === 0;
  const [defaultcash, setDefaultcash] = useState(0);

  useEffect(() => {
    if (formValues.amount_in_denomination?.length > 0) {
      setFormErrors({...formErrors, amount: null});
    }
  }, [formValues.amount_in_denomination?.length]);

  useEffect(() => {
    if (
      formValues.payment_id !== null &&
      activeChip === 'cash' &&
      props.cash_box_adjustment_list.length > 0
    ) {
      props.cash_box_adjustment_list
        ?.filter((f) => f.id === formValues.payment_id)
        ?.map((d) => setDefaultcash(d.allowdenomination));
    }
  }, [formValues.payment_id]);

  useEffect(() => {
    let active = true;

    if (!loadingPayIn) {
      return undefined;
    }

    (async () => {
      !chartOfAccounts_payIn_data.length &&
        dispatch(
          listPayIndataAction((response) => {
            setPayInData(response);
          }),
        );
    })();
    return () => {
      active = false;
    };
  }, [loadingPayIn]);

  useEffect(() => {
    let active = true;

    if (!loadingPayout) {
      return undefined;
    }

    (async () => {
      !chartOfAccounts_payOut_data.length &&
        dispatch(
          listPayOutdataAction((response) => {
            setPayOutData(response);
          }),
        );
    })();
    return () => {
      active = false;
    };
  }, [loadingPayout]);

  const loadLedgerApi = () => {
    if (single === '0') {
      !chartOfAccounts_payOut_data.length &&
        dispatch(
          listPayOutdataAction((response) => {
            setPayOutData(response);
          }),
        );
    } else if (single === '1') {
      !chartOfAccounts_payIn_data.length &&
        dispatch(
          listPayIndataAction((response) => {
            setPayInData(response);
          }),
        );
    }
  };

  // const filter = createFilterOptions();
  // const dispatch = useDispatch()

  // const {  CashOutInReducer: { expenses }, } = useSelector(state => state)

  // const top100Films = [
  //   { label: 'The Shawshank Redemption', year: 1994 },
  //   { label: 'The Godfather', year: 1972 },
  // ]

  //   const initsform = () =>{
  //     setInitialState(formValues);
  //   }
  //   tempinitsform.current = initsform
  //   useEffect(() => {
  //     tempinitsform.current();
  //   }, [])

  //  const inits = () =>{
  //   if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
  //     setDirty();
  //     setForm(true)
  //   }
  //   else {
  //     setPristine();
  //     setForm(false)
  //   }
  //  }
  //  tempinits.current =inits
  //   useEffect(() => {
  //     tempinits.current();
  //   }, [formValues, initialState])

  const handleChange = async (e) => {
    let {name, value} = e.target;

    if (headerLocationId !== 'null') {
      setStateHandler(name, value);
    } else {
      setOpenAlert(true);
    }
  };
  useEffect(() => {
    if (formValues.payment_id !== '' && formValues.payment_id !== null) {
      let getPaymentModeLedgerId = null;
      if (activeChip === 'cash') {
        getPaymentModeLedgerId = props.cash_box_adjustment_list.find(
          (d) => d.id === formValues.payment_id,
        );
        setFormValues({
          ...formValues,
          paymentModeLedgerId: getPaymentModeLedgerId?.ledger_id || null,
        });
        setAmountNegativeValidation(
          getPaymentModeLedgerId?.negativeDenomination,
        );
      } else {
        getPaymentModeLedgerId = props.paymentMethod.find(
          (d) => d.paymentId === formValues.payment_id,
        );
        setFormValues({
          ...formValues,
          paymentModeLedgerId: getPaymentModeLedgerId?.ledger_id || null,
        });
      }
    }
  }, [formValues.payment_id]);

  const clearField = () => {
    setFormValues({
      ...formValues,
      expense: null,
      ledger_id: null,
      reason: null,
      amount: null,
      payment_id: null,
      cashboxId: null,
      activeChip: null,
      cash_type: null,
      // date: getDateFormat(new Date()),
      location_id: null,
      amount_in_change: [],
      amount_in_denomination: [],
    });
  };

  useEffect(() => {
    clearField();
  }, [headerLocationId]);

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const filter = createFilterOptions();

  const setStateHandler = async (name, value) => {
    let formObj = {};

    if (name === 'ledger_id' && value !== null) {
      const ledgerName = [
        ...chartOfAccounts_payOut_data,
        ...chartOfAccounts_payIn_data,
      ].find((d) => d.id === value).name;
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
        ledgerName,
      };
    }
    // else if (name === 'date') {
    //   if(value === "null"){
    //     const newDate = getDateFormat(new Date())
    //     formObj = {
    //       ...formValues,
    //       [name]: value === '' ? null : value, newDate
    //     };
    //   }

    // }
    // else if (name === 'amount') {
    //   const cashBoxData = props.cash_box_list.filter(f => f.id === formValues.cashboxId)
    //   if(cashBoxData.length>0){
    //     const AlertCashBox = cashBoxData[0].current_balance < 0
    //     alert("Amount balance is less then 0 !!!!")
    //   }
    // }
    else if (name === 'payment_id') {
      if (activeChip !== 'cash') {
        if (single === '0') {
          await props.PaymentDenominationvalidation(value);
        } else {
          await props.PaymentDenominationvalidation(value);
        }
        const paymentData = props.paymentMethod.find(
          (d) => d.paymentId === value,
        );
        const locationValue = props.bank_creation_adjustment_list.find(
          (d) => d.bankAccountId === paymentData.bankAccountId,
        );
        const payName = paymentData.paymentName;
        setLocationId(locationValue.location_id);
        const data = {payment_id: value};
        await props.PayOutAmountValidation(data);
        formObj = {
          ...formValues,
          [name]: value === '' ? null : value,
          payName,
        };
      } else if (activeChip === 'cash') {
        await props.PaymentDenominationvalidation(
          value,
          'cash',
          single === '0' ? 'Out' : 'IN',
        );

        const paymentData = props.cash_box_adjustment_list.find(
          (d) => d.id === value,
        );
        const payName = paymentData.name;
        setLocationId(paymentData.location_id);
        const data = {cashboxId: value};
        await props.PayOutAmountValidation(data);
        formObj = {
          // ...contraform,
          ...formValues,
          [name]: value === '' ? null : value,
          payName,
        };
      }
    } else if (name === 'amount' && single === '0') {
      // if(amountNegativeValidation === 0 && value >= props.cashOutIn_denomination[0]?.current_balance){
      //   alert(`Amount Rs ${value} not in your account..!`)
      // }
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
      };
    }
    // else if (name === 'bankAccountId') {
    //   const bank = props.bankcreation.find((d) => d.bankAccountId === value).bankName
    //   formObj = {
    //     ...contraform,
    //     [name]: value === '' ? null : value, bank
    //   };
    // }
    else {
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
      };
    }

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

  const Change = (e) => {
    let {value} = e.target;
    setsingle(value);
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleTabdata = async (event) => {
    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (
        key == 'amount_in_denomination' &&
        formValues[key].length === 0 &&
        activeChip === 'cash' &&
        defaultcash === 1
      ) {
        isValid = false;
        formErrorsObj['amount'] = capitalize('amount') + 'Denomination Empty!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });

    if (formErrorsObj.amount === 'AmountDenomination Empty!') {
      setOpenDenomination(true);
      setCurrentTarget('Tendered');
    }
    await setFormErrors(formErrorsObj);

    if (uploadedFiles.length) {
      var file = uploadedFiles[0];

      const bill_image = await readFileAsync(file);
      formValues.bill_image = bill_image;
    }
    if (isValid) {
      formValues.cash_type = props.openingBalData.parentName === 'Sundry Creditors' ? 'OUT' : 'IN'
      formValues.activeChip = activeChip;
      formValues.location_id = locationId;
      if (activeChip === 'cash') {
        formValues.cashboxId = formValues.payment_id;
        formValues.payment_id = null;
      } else {
        formValues.cashboxId = null;
      }
      //  formValues.date = moment(formValues.date, "year", "month", "day").format( "yyyy-MM-DD")
      // formValues.date = yyyymmdd_ddmmyyyy(formValues.date)
      // formValues.date = formValues.date  // || getDateFormat(new Date())
      await setTabData([...tabData, formValues]);
      await setUploadedFiles([]);
      await setFormValues({
        ledger_id: '',
        reason: '',
        amount: '',
        payment_id: '',
        cashboxId: '',
        cash_type: '',
        activeChip: '',
        location_id: '',
        date: formValues.date,
      });
    }
  };

  useEffect(() => {
    if (tabData.length > 0) {
      handleSubmit();
    }
  }, [tabData]);

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  // const keyboard = (val, tendered) => {
  //   setOpenDenominationDialog(false);
  //   const {cash_box_id,cashboxLedgerId} = normalCashBoxInfo
  //   const getData = [...Tdata];
  //   if (!getData[index]) return;
  //   getData[index].payment_amount = val;
  //   getData[index].tendered = tendered;

  //   // if(cash_box_id !== null && cashboxLedgerId !== null){
  //   //   getData[index].cash_box_id = cash_box_id
  //   //   getData[index].cashboxLedgerId = cashboxLedgerId
  //   // }

  //   let cindex = [];

  //   const getAmount = getData.reduce(function (acc, obj, i) {
  //     if (!+obj.payment_amount) {
  //       cindex.push(i);
  //     }
  //     return acc + +obj.payment_amount;
  //   }, 0);
  //   if (getAmount > total) {
  //     setOpenDenominationDialog(true);
  //     setCurrrentTarget('Change');
  //   }
  //   change(setDefault(getData, getAmount, cindex), getAmount);
  // };

  const handleSubmit = async (event) => {
    // event.preventDefault();

    if (props.status === 'edit') {
      let isValid = true;
      let formErrorsObj = {...formErrors};
      await Object.keys(formValues).map((key, i) => {
        if (
          requiredFields.includes(key) &&
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

      // alert("Is Form Valid - " + isValid);

      // API call..
      if (isValid) {
        const cash_type = single === '0' ? 'OUT' : 'IN';
        // formValues.cash_type = single === 'false' ? 'OUT' :'IN'
        if (activeChip === 'cash') {
          setFormValues({
            ...formValues,
            cash_type: cash_type,
            activeChip: activeChip,
            cashboxId: formValues.payment_id,
            location_id: locationId,
          });
          //props.handleSubmit(getTrimmedData(formValues));
        } else {
          setFormValues({
            ...formValues,
            cash_type: cash_type,
            activeChip: activeChip,
            payment_id: null,
            location_id: locationId,
          });
          //props.handleSubmit(getTrimmedData(formValues));
        }
      }
    } else {
      console.log('tabData', tabData);
      const dat = tabData.map((d) => {
        delete d.ledgerName;
        delete d.payName;
        return d;
      });
      props.handleSubmit(dat);
      dispatch(setTransactionCount(tabData.length));
    }
    // }
  };
  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      let ID_data = props.edit_id_data;
      var obj = ID_data;
      for (let key of Object.keys(obj)) {
        var value = obj[key];

        setFormValues(value);
        // setInitialState(value)
        setsingle(value.cash_type !== 'IN' ? 'false' : 'true');
      }
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  useEffect(() => {
    setActiveChip('cash');
  }, [props.cash_box_adjustment_list]);

  const setAmountDialogToState = (Amount) => {
    if (typeof Amount !== 'undefined') {
      setFormValues({...formValues, amount: Amount});
      setOpenDenomination(false);
      setStateHandler('amount', Amount);
    } else {
      setOpenDenomination(false);
    }
  };

  const chipChange = (data) => {
    setFormValues({...formValues, amount: null});
    setActiveChip(data);
    // setTabData([...tabData, data])
  };
  const existingchipChange = (data) => {
    if (headerLocationId !== 'null') {
      loadLedgerApi();
      setActiveChip(data.cashboxId !== null ? 'cash' : data.bankAccountId);
      setFormValues({
        ...formValues,
        cashboxId: data.cashboxId === null ? null : data.cashboxId,
        payment_id: data.cashboxId === null ? data.payment_id : data.cashboxId,
        ledger_id: data.ledger_id,
        payName: data.payName === null ? data.cashbox_name : data.payName,
        ledgerName: data.ledgerName,
      });
    } else {
      alert('Please select any one location.');
    }
    // setActiveChip(data);
    // setTabData([...tabData, data])
  };

  const cashDenominationChange = (name) => {
    setOpenDenomination(true);
    setCurrentTarget(name);
  };

  //  const dublicate = chartOfAccounts?.filter((d) => d.name);
  //_.uniqBy(props.bank_creation_adjustment_list,"bankName")

  useEffect(() => {
    setFormErrors({
      expense: null,
      ledger_id: null,
      reason: null,
      amount: null,
      discount_type: null,
      payment_id: null,
      date: null,
      upload: null,
    });
    setFormValues({
      expense: null,
      ledger_id: null,
      reason: null,
      amount: null,
      payment_id: null,
      cashboxId: null,
      activeChip: null,
      cash_type: null,
      date: getDateFormat(new Date()),
      location_id: null,
      paymentModeLedgerId: null,
      amount_in_change: [],
      amount_in_denomination: [],
    });
  }, [single]);

  console.log("Ddsdsd", props.openingBalData.amountToPay);

  return (
    <>
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
        }}
      ></div>
      <Grid container style={{marginTop: '25px'}}>
        <Grid
          style={{marginBottom: '25px'}}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          {_.uniqBy(props.bank_creation_adjustment_list, 'bankName').map(
            (d) => (
              <Button
                key={d.ledger_id}
                sx={{borderRadius: '0', boxShadow: 0}}
                onClick={() => {
                  chipChange(d.bankAccountId);
                }}
                label={d.bankName}
                variant={
                  activeChip === d.bankAccountId ? 'contained' : 'outlined'
                }
                disabled={
                  props.type === 'BANKRECONCILIATION' && d.bankName === 'Cash'
                }
              >
                {d.bankName}
              </Button>
            ),
          )}

          {/* </div> */}
        </Grid>

        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Box display='flex' justifyContent='flex-end'>
            {/* <div style={{justifyContent: 'right', display:'flex', marginTop: '25px'}}> */}
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Date'
                // inputFormat='DD/MM/yyyy'
                name='date'
                value={formValues.date}
                inputVariant='contained'
                disableFuture
                onChange={(e, v) => {
                  setFormValues({...formValues, date: getDateFormat(e)});
                }}
                slotProps={{ textField: { variant: 'filled' } }}
              />
            </LocalizationProvider>
            {/* </div> */}
          </Box>
        </Grid>
      </Grid>
      <>
        {Prompt}
        <Typography variant='h6' align='left' style={{paddingTop: '15px'}}>
          Opening Balance Payment
        </Typography>

        <Grid
          style={{paddingTop: '15px'}}
          spacing={2}
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
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <FormControl
              required={true}
              error={formErrors.payment_id === null ? false : true}
              component='fieldset'
              fullWidth={true}
              variant='filled'
            >
              <InputLabel>Payment Mode</InputLabel>
              <Select
                style={{}}
                name='payment_id'
                label='Payment Mode'
                // items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                required={false}
                onChange={handleChange}
                //defalutValue=''
                value={
                  formValues.payment_id === null ? '' : formValues.payment_id
                }
              >
                {activeChip === 'cash' &&
                  props.cash_box_adjustment_list?.map((d) => (
                    <MenuItem value={d.id} key={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}

                {activeChip !== 'cash' &&
                  props.paymentMethod
                    .filter((f) => activeChip === f.bankAccountId)
                    ?.map((d) => (
                      <MenuItem value={d.paymentId} key={d.paymentId}>
                        {d.paymentName}
                      </MenuItem>
                    ))}
              </Select>
              <FormHelperText>
                {formErrors.payment_id === null
                  ? ''
                  : 'Payment Mode is Required!'}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              value={
                formValues.ledger_id !== null
                  ? payOutData.filter((f) => f.id === formValues.ledger_id)[0]
                  : {name: ''}
              }
              disabled
              name='ledger_id'
              open={openPayOut}
              onOpen={() => {
                setOpenPayOut(true);
              }}
              onClose={() => {
                setOpenPayOut(false);
              }}
              loading={loadingPayout}
              fullWidth={true}
              onChange={(event, newValue) => {
                //  if (newValue !== null ) {
                handleChange({
                  target: {
                    name: 'ledger_id',
                    value: newValue === null ? null : newValue.id,
                  },
                });
                // setFormValues({...formValues , ledger : newValue.id})
                // }
              }}
              // disablePortal
              // options={payOutData}
              options={_.uniqBy(payOutData, 'name')}
              // renderOption={(option) => option.name}
              getOptionLabel={(option) => option.name}
              // options={props.chartOfAccounts}
              // renderInput={(params) => (
              //   <TextField
              //     {...params}
              //     variant='outlined'
              //     error={formErrors.ledger_id === null ? false : true}
              //     helperText={
              //       formErrors.ledger_id === null ? '' : formErrors.ledger_id
              //     }
              //     label='Ledger'
              //     required={true}
              //   />
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='filled'
                  error={formErrors.ledger_id === null ? false : true}
                  helperText={
                    formErrors.ledger_id === null ? '' : 'Ledger is Required!'
                  }
                  label='Ledger'
                  // required={true}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loadingPayout ? (
                          <CircularProgress color='inherit' size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              onBlur={(e) => {
                console.log("oooeoee", activeChip, defaultcash, formValues);
                activeChip === 'cash' &&
                  defaultcash === 1 &&
                  formValues.amount > 0 &&
                  setOpenDenomination(true);
                setCurrentTarget('Tendered');
              }}
              // onBlur={handleChange}
              // onFocus={(e)=>setOpenDenomination(pre=> pre===true ?false:true)}
              // onClick={
              //   activeChip === 'cash' && handleChange
              // }
              required={true}
              style={{}}
              fullWidth={true}
              onWheel={(e) => e.target.blur()}
              placeholder=' Enter Amount'
              label='Amount'
              name='amount'
              color='primary'
              multiline={false}
              type='number'
              InputProps={{ inputProps: { min: 0, max: props.openingBalData.amountToPay } }}
              regex=''
              variant='filled'
              value={formValues.amount === null ? '' : formValues.amount}
              error={formErrors.amount === null ? false : true}
              helperText={
                formErrors.amount === null
                  ? ''
                  : formErrors.amount === 'AmountDenomination Empty!'
                  ? 'AmountDenomination Empty'
                  : 'Amount is Required!'
              }
            />
          </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              // onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder=' Note'
              label='Note'
              name='reason'
              color='primary'
              multiline={true}
              variant='filled'
              rows={10}
              type='text'
              regex=''
              value={formValues.reason === null ? '' : formValues.reason}
              error={formErrors.reason === null ? false : true}
              helperText={formErrors.reason === null ? '' : 'Note is Required!'}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 12,
              xs: 12
            }}></Grid>
        </Grid>
        <CancelDialog
          handle={cancel}
          delete={dialog}
          close={props.handleClose}
        ></CancelDialog>
        {openDenomination && (
          <DenominationDialog
            openDenomination={openDenomination}
            handleSubmit={setAmountDialogToState}
            responseType={'cashOut'}
            formValues={{...formValues}}
            setFormValues={setFormValues}
            setOpenDenomination={setOpenDenomination}
            currentTarget={currentTarget}
            setCurrentTarget={setCurrentTarget}
            validationHandler={validationHandler}
            total={formValues.amount}
            payInAmount={props.payInAmount[0]?.Amount}
            amountNegativeValidation={amountNegativeValidation}
            cashOutIn_denomination={props.cashOutIn_denomination}
          />
        )}

        {props.status !== 'edit' ? (
          <Grid
            pt='10px'
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12
            }}>
              <Grid
                display='flex'
                alignItems='center'
                justifyContent={'flex-end'}
                gap={5}
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <Button
                  onClick={props.handleClose}
                  name='add'
                  size='medium'
                  text='button'
                  color='secondary'
                  style={{}}
                  sx={{width: 'max-content'}}
                  variant='contained'
                  fullWidth={true}
                >
                  close
                </Button>

                <Button
                  onClick={handleTabdata}
                  name='add'
                  size='medium'
                  text='button'
                  color='primary'
                  style={{}}
                  sx={{width: 'max-content'}}
                  variant='contained'
                  fullWidth={true}
                >
                  Submit
                </Button>
            </Grid>
          </Grid>
        ) : (
          ' '
        )}
        <br />

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            container
            display='flex'
            flexDirection='row'
            //
          >
            <Grid
              size={{
                lg: 9,
                md: 8,
                sm: 6,
                xs: 6
              }}></Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 6
              }}>
              <Grid
                // lg={12}
                // md={12}
                // sm={12}
                // xs={12}
                spacing={0}
                container
                direction='row'
                //
              >
                {props.status !== 'edit' ? (
                  <Grid
                    align='right'
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 12
                    }}>
                    {' '}
                  </Grid>
                ) : (
                  <Grid
                    align='right'
                    size={{
                      lg: 1,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
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
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </>
      <LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />
    </>
  );
}

export default OpeningBalNewCashOutIn;

