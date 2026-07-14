import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
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
  Box,
} from '@mui/material';
// import { useTheme } from '@emotion/react';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import MaterialTable from 'utils/SafeMaterialTable';
import DenominationDialog from './DenominationDialog';
import _ from 'lodash';
// import { useDispatch, useSelector } from 'react-redux';
import {getTrimmedData} from './trimFunction/index';
import Chip from '@mui/material/Chip';
import listBankCreationAction, { BankwithledgerAction, listContraBankWithLedgerId } from '../redux/actions/bankCreation_actions';
import {useSelector, useDispatch} from 'react-redux';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {commonDateFormat, getDateFormat} from '../../src/utils/getTimeFormat';
import contexts from '../context/CreateNewButtonContext';
import context from '../context/CreateNewButtonContext';
import { common } from '@mui/material/colors';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { listCashBoxAction, listContraCashBox } from 'redux/actions/cash_box_actions';
import apiCalls from 'utils/apiCalls';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import FilePicker from '../../src/components/FilePicker/indexIn';
import toMomentOrNull from 'utils/DateFixer';



function Contra(props) {
  
  const { commoncookie} =
  useContext(context);
  function excelSerialToDate(serial) {
  // Excel counts from 1900-01-01
  const excelEpoch = new Date(1900, 0, 1);
  // Subtract 2 days because Excel wrongly treats 1900 as leap year
  return new Date(excelEpoch.getTime() + (serial - 2) * 86400000);
  }
  const [formValues, setFormValues] = useState({
    from: null,
    to: null,
    cash_type: null,
    amount: props.reconciliateData ? props.reconciliateData.Credit || props.reconciliateData.Debit : null,
    reason: null,
    transactionDate: props.date,
    employee_id:null,
    reference: props.reconciliateData ? props.reconciliateData.Description : null,
    date:  new Date()
  });
 
  //console.log('formValuesssssssssssss', formValues)
  
  const [ledger_name, setLedgerName] = useState(null);
  const [formErrors, setFormErrors] = useState({
    from: null,
    to: null,
    amount: null,
    reason: null,
    transactionDate: null,
  });
  const [requiredFields] = useState([
    'from',
    'to',
    'amount',
    'reason',
    'transactionDate',
  ]);
  const [regex] = useState({});
  const [Prompt] = UnSavedChangesWarning();

  // const [initialState, setInitialState] = useState({})
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [formval, setFormVal] = useState({ledgerVal: null});
  const [single, setsingle] = useState('0');
  const [tabData, setTabData] = useState([]);
  const {chartOfAccounts, expenses, cashbox} = props;
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const AmountRef = useRef(null);
  const [openDenomination, setOpenDenomination] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null)
  const [expenseValue, ExpenseValue] = React.useState([]);
  const dublicateexpense = props.expense?.filter((d) => d.expense) || [];
  const dispatch = useDispatch();
  const [dateValue, setDateValue] = useState('');
  const [validSubmit, setvalidSubmit] = useState(false);
  const [arr, setArr] = useState([]);
  const [destinationArr, setDestinationArr] = useState([]);
  const [openAlert,setOpenAlert] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([])

  useEffect(() => {
    const isDirty = formValues.amount || formValues.from || tabData.length > 0;
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formValues.amount, formValues.from, tabData.length]);

  // console.log("destinationArr",destinationArr)
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    setHeaderLocationIdHandeler,
    headerLocationId,
  } = useContext(context);

  const { cashBoxReducer: { cash_box_list,contra_cash_box }, bankCreationReducer : {bank_with_ledger,contra_bank_with_ledgerId},
    CashOutInReducer: { payInOutContraSequence } } = useSelector((state) => state);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(BankwithledgerAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listContraCashBox()),
      dispatch(listContraBankWithLedgerId())
    );
  }, []);
  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
   
    );
  }, [headerLocationId]);

  useEffect(() => {
    const normalizedCashBoxes = (cash_box_list || []).map((c) => ({
      ...c,
      name: c.name || c.cashbox_name || c.ledgerName || c.payName || '',
      code: c.code || c.CODE || null,
    }));
    const normalizedBanks = (bank_with_ledger || []).map((b) => ({
      ...b,
      name: b.bankName || b.name || '',
      code: b.code || b.CODE || null,
    }));
    const Data = [...normalizedCashBoxes, ...normalizedBanks];

    setArr(Data);
    if(props.type === 'BANKRECONCILIATION') {
      const codeId = Data.filter((d) => d.bankAccountId === props.bankId)
      if(codeId.length > 0) {
        setFormValues((prev) => ({
          ...prev, from: codeId[0].code,
           from_ledger_id:codeId[0].ledger_id === null ? null : codeId[0].ledger_id,
          from_ledger_name: codeId[0].name === null ? null :codeId[0].name,
          frompayment_id:  null,
          fromlocation_id: headerLocationId !== 'null' ? headerLocationId : codeId[0].location_id,
          bankAccountId: codeId[0].bankAccountId === null ? null :codeId[0].bankAccountId,
        }))
      }
    }
  }, [cash_box_list, bank_with_ledger, props.bankId, headerLocationId]);

  useEffect(() => {

    
    const normalizedContraCashBoxes = (contra_cash_box || []).map((c) => ({
      ...c,
      name: c.name || c.cashbox_name || c.ledgerName || c.payName || '',
      CODE: c.CODE || c.code || null,
    }));
    const normalizedContraBanks = (contra_bank_with_ledgerId || []).map((b) => ({
      ...b,
      name: b.bankName || b.name || '',
      CODE: b.CODE || b.code || null,
    }));
    const Data = [...normalizedContraCashBoxes, ...normalizedContraBanks];

    

    setDestinationArr(Data);
  }, [contra_cash_box, contra_bank_with_ledgerId]);

  useEffect(() => {
    if (props.mode === "edit" && props.editData) {

      if (props.editData.location_id) {
        setHeaderLocationIdHandeler(props.editData.location_id);
      }

      setFormValues((prevValues) => ({
        ...prevValues,
        from: props.editData.cash_type === "IN"
          ? props.editData.contra_out_data?.accountCode
          : props.editData.accountCode,
        to: props.editData.cash_type === "IN"
          ? props.editData.accountCode
          : props.editData.contra_in_data?.accountCode,
        reason: props.editData.reason || null,
        prevAmount: props.editData.amount || null,
        amount: props.editData.amount || null,
        cashboxId: props.editData.cashboxId || null,
        prevFromLedgerId: props.editData.cash_type === "IN"
          ? props.editData.contra_out_data?.ledger_id
          : props.editData.ledger_id,
        prevFromCashBoxId: props.editData.cash_type === "IN"
          ? props.editData.contra_out_data?.cashboxId
          : props.editData.cashboxId,
        prevToCashBoxId: props.editData.cash_type === "IN"
          ? props.editData.cashboxId
          : props.editData.contra_in_data?.cashboxId,
        prevToLedgerId: props.editData.cash_type === "IN"
          ? props.editData.ledger_id
          : props.editData.contra_in_data?.ledger_id,

        prevCashboxId: props.editData.cashboxId || null,
        cash_type: props.editData.cash_type || null,
        reference : props.editData.reference || null,
        transactionDate: props.editData.date
          ? moment(props.editData.date, "DD/MM/YYYY").toDate()
          : new Date(),
        employee_id: props.editData.location_id || null,
        paymentTransactionId:
          props.editData.cash_type === "IN"
            ? [props.editData.id, props.editData.contra_out_data?.id]
              .filter(Boolean)
              .join(",")
            : [props.editData.id, props.editData.contra_in_data?.id]
              .filter(Boolean)
              .join(","),
        accTransactionId: props.editData.cash_type === "IN"
          ? [props.editData.accTransactionId, props.editData.contra_out_data?.accTransactionId]
            .filter(Boolean)
            .join(",")
          : [props.editData.accTransactionId, props.editData.contra_in_data?.accTransactionId]
            .filter(Boolean)
            .join(","),
        cashBoxDetailId: props.editData.cash_type === "IN"
          ? [
            ...(props.editData.cashBoxDetailIds
              ? props.editData.cashBoxDetailIds.split(",").map(id => parseInt(id, 10))
              : []),
            ...(props.editData.contra_out_data?.cashBoxDetailIds
              ? props.editData.contra_out_data.cashBoxDetailIds.split(",").map(id => parseInt(id, 10))
              : [])
          ]
          : [
            ...(props.editData.cashBoxDetailIds
              ? props.editData.cashBoxDetailIds.split(",").map(id => parseInt(id, 10))
              : []),
            ...(props.editData.contra_in_data?.cashBoxDetailIds
              ? props.editData.contra_in_data.cashBoxDetailIds.split(",").map(id => parseInt(id, 10))
              : [])
          ]
      }));
    }

  }, [props.mode, props.editData]);

  

  useEffect(() => {
    if (props.mode === "edit") {
      const fromData = arr.find((item) => item.code === formValues.from && item.ledger_id === formValues.prevFromLedgerId) || null;
      const toData = destinationArr.find((item) => item.CODE === formValues.to && item.ledger_id === formValues.prevToLedgerId) || null;

      setFormValues((prevValues) => ({
        ...prevValues,
        from_ledger_id: fromData ? fromData.ledger_id : null,
        from_ledger_name: fromData ? fromData.name : null,
        fromcashboxId: fromData ? fromData.id || null : null,
        frompayment_id: null,
        fromlocation_id: headerLocationId !== 'null' ? headerLocationId : fromData?.location_id,
        fromallowdenomination: fromData ? fromData.allowdenomination : null,
        to_ledger_id: toData ? toData.ledger_id : null,
        to_ledger_name: toData ? toData.name : null,
        TocashboxId: toData ? toData.id || null : null,

        Topayment_id: null,
        tolocation_id: headerLocationId !== 'null' ? headerLocationId : toData?.location_id,
        toallowdenomination: toData ? toData.allowdenomination : null,
      }));
    }
  }, [props.mode, formValues.from, formValues.to, arr, destinationArr]);


  //  useEffect(()=>{
  // let item =  props.cashbox.map(c=>{
  //     return  arr.push({...c})
  //  })
  // let item1 = bank_with_ledger.map(b => arr.push({...b,name:b.bankName}))

  //  },[bank_with_ledger, props.cashbox])

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
    
    if (headerLocationId !== 'null') {
      let {name, value} = e.target;
      setStateHandler(name, value);
    } else {
      setOpenAlert(true)
    }
  };

  const clearField = ()=>{
    setFormValues({
      expense: null,
      ledger_id: null,
      reason: null,
      amount: null,
      payment_id: null,
      cashboxId: null,
      activeChip: null,
      cash_type: null,
      date: null,
      location_id: null,
      from: null,
      to: null
    })
  }

  // useEffect(()=>{
  //   clearField()
  // },[headerLocationId])

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const filter = createFilterOptions();

  const setStateHandler = async (name, value) => {
    let formObj = {};
    if (name === 'ledger_id') {
      const bank = bank_with_ledger.find(
        (d) => d.ledger_id === value,
      ).bankName;
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
        bank,
      };
    } else {
      formObj = {
        ...formValues,
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
      } else if (key === 'amount' && formValues[key] !== null && formValues[key] !== '' && +formValues[key] <= 0) {
        isValid = false;
        formErrorsObj[key] = 'Amount must be greater than zero';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    if (formValues.from_ledger_id && formValues.to_ledger_id && formValues.from_ledger_id === formValues.to_ledger_id) {
      isValid = false;
      formErrorsObj['to'] = 'From and To accounts cannot be the same';
    }
    await setFormErrors(formErrorsObj);

    if (isValid) {
      setvalidSubmit(true);
      formValues.cash_type = 'CONTRA';
      // formValues.transactionDate = moment(formValues.transactionDate, "year", "month", "day").format( "yyyy-MM-DD")
      //  formValues.transactionDate = props.date
      
      formValues.transactionDate = formValues?.date;
      formValues.employee_id = commoncookie;
      setTabData([...tabData, formValues]);
      setFormValues({
        reason: null,
        amount: null,
        cash_type: null,
        from: null,
        to: null,
        reference: null,
        date: new Date()
        //date: null
      });
      setUploadedFiles([])
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

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
        //const cash_type = 'CONTRA'
        // formValues.cash_type = single === 'false' ? 'OUT' :'IN'
        setFormValues({...formValues});
        setUploadedFiles([])
        props.contraSubmit(getTrimmedData(formValues));
      }
    } else {
      const dat = tabData.map((d) => {
        delete d.ledgerName;
        delete d.payName;
        delete d.cash_type;
        delete d.activeChip;
        delete d.cashboxId;
        // delete d.date;
        delete d.expense;
        delete d.ledger_id;
        delete d.location_id;
        delete d.payment_id;
        //  delete d.date;
        return d;
      });
     props.contraSubmit(dat);
    }
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

  const setAmountDialogToState = (Amount) => {
    if (typeof Amount !== 'undefined') {
      setFormValues({...formValues, amount: Amount});
      setOpenDenomination(false);
      validationHandler('amount', Amount);
    } else {
      setOpenDenomination(false);
    }
  };

  const chipChange = (data) => {
    setTabData([...tabData, data]);
  };

  const dublicate = chartOfAccounts?.filter((d) => d.name);


  return (
    <>
      <>
        {Prompt}
        {openDenomination && (
          <DenominationDialog
            openDenomination={openDenomination}
            handleSubmit={setAmountDialogToState}
            responseType={'cashOutIn'}
            formValues={{ ...formValues }}
            setFormValues={setFormValues}
            setOpenDenomination={setOpenDenomination}
            currentTarget={currentTarget}
            validationHandler={validationHandler}
          />
        )}
        <Typography variant='h6' align='left' style={{paddingTop: '20px'}}>
         {props.mode !== 'edit' ? 'Contra' : 'Update Contra'}
        </Typography>

        

        <Grid
          style={{paddingTop: '15px'}}
          spacing={2}
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
          <Box display='flex' justifyContent='space-between'>
            {/* <div style={{justifyContent: 'right', display:'flex', marginTop: '25px'}}> */}
            <Typography variant='h6'>{payInOutContraSequence}</Typography>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DateTimePicker
                label='Date'
                // inputFormat='DD/MM/yyyy'
                name='date'
                value= {toMomentOrNull(formValues.date)}
                inputVariant='contained'
                disableFuture
                onChange={(e, v) => {
                  setFormValues({...formValues, date: moment(e).format('YYYY-MM-DD HH:mm:ss')});
                }}
                views={['year', 'month', 'day']}
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
              sm: 12,
              xs: 12
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
              value={
                formValues.from !== null
                ? arr.find((f) => f.ledger_id === formValues.from_ledger_id)
                  : {name: ''}
              }
              name='from'
              fullWidth={true}
              onChange={(event, newValue) => {
                if (headerLocationId !== 'null'  ) {
                  setFormValues({
                    ...formValues,
                    from:newValue === null ? null : newValue.code,
                    from_ledger_id:newValue === null ? null : newValue.ledger_id,
                    from_ledger_name: newValue === null ? null :newValue.name,
                    fromcashboxId: newValue === null ? null :newValue.id || null,
                    frompayment_id:  null,
                    fromlocation_id: headerLocationId !== 'null' ? headerLocationId : newValue.location_id,
                    fromallowdenomination : newValue === null ? null : newValue.allowdenomination,
                    prevFromLedgerId: newValue === null ? null : newValue.ledger_id, 
                  });
                  
                  validationHandler('from', newValue === null ? null :newValue.code);
                } else {
                  setOpenAlert(true)
                }

                // if (typeof newValue === 'string') {
                // handleChange({target : {name : 'from' , value : newValue.code}})
                
                // }
              }}
              // disablePortal
              // options={props.payOutdata}
                 options={_.uniqBy(
                arr.filter((f) => f.ledger_id !== formValues.to_ledger_id),
                'name',
              )}
              // renderOption={(option) => option.name}
              getOptionLabel={(option) => option?.name || ''}
              // options={props.chartOfAccounts}
              disabled={props.type === 'BANKRECONCILIATION'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='filled'
                  error={formErrors.from === null ? false : true}
                  helperText={formErrors.from === null ? '' : formErrors.from}
                  label='From'
                  required={true}
                />
              )}
            />
            {/* <FormControl required={true}
                 error={formErrors.from === null ? false : true}
                component='fieldset'
                fullWidth={true}>
                <InputLabel>
                  From
                </InputLabel>
                <Select style={{}}
                  name='from'
                  label='From Bank Name'
                  items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                  required={false}
                  onChange={handleChange}
                  //defalutValue=''
                  value={formValues.from === null ? "" : formValues.from}>
                  {arr?.map(d => <MenuItem value={d.code} key={d.code}>
                    {d.name}
                  </MenuItem>)}
                </Select>
                <FormHelperText>
                  {formErrors.from}
                </FormHelperText>
              </FormControl> */}
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              value={
                formValues.to !== null&& formValues.to !==undefined
                ? destinationArr.find((f) => f.ledger_id === formValues.to_ledger_id) || { name: '' }
                  : {name: ''}
              }
              name='to'
              fullWidth={true}
              onChange={(event, newValue) => {
                // console.log('newValueeee', newValue)
                if (headerLocationId !== 'null') {
                  setFormValues({
                    ...formValues,
                    to: newValue === null ? null : newValue.CODE,
                    to_ledger_id: newValue === null ? null : newValue.ledger_id,
                    to_ledger_name: newValue === null ? null :newValue.name,
                    TocashboxId: newValue === null ? null :newValue.id || null,
                    Topayment_id: null,
                    tolocation_id: headerLocationId !== 'null' ? headerLocationId : newValue.location_id,
                    toallowdenomination : newValue === null ? null : newValue.allowdenomination,
                    prevToLedgerId: newValue === null ? null : newValue.ledger_id, 
                  });
                  validationHandler('to', newValue === null ? null :newValue.CODE);
                } else {
                  setOpenAlert(true)
                }
                // if (typeof newValue === 'string') {
                // handleChange({target : {name : 'to' , value : newValue.code}})
                
                // }
              }}
              // disablePortal
              // options={props.payOutdata}
                options={_.uniqBy(
                destinationArr.filter((f) => f.ledger_id !== formValues.from_ledger_id),
                'name',
              )}
              // renderOption={(option) => option.name}
              getOptionLabel={(option) => option?.name || ''}
              // options={props.chartOfAccounts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='filled'
                  error={formErrors.to === null ? false : true}
                  helperText={formErrors.to === null ? '' : formErrors.to}
                  label='To'
                  required={true}

                />
              )}
            />
            {/* <FormControl required={true}
                error={formErrors.to === null ? false : true}
                component='fieldset'
                fullWidth={true}>
                <InputLabel>
                  To
                </InputLabel>
                <Select style={{}}
                  name='to'
                  label='To Bank Name'
                  items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                  // required={false}
                  onChange={handleChange}
                  //defalutValue=''
                  value={formValues.to === null ? "" : formValues.to}>
                  {arr.filter(f=> f.code !== formValues.from)?.map(d => <MenuItem value={d.code}  key={d.code}>
                    {d.name}
                   
                  </MenuItem>)}
                </Select>
                <FormHelperText>
                  {formErrors.to}
                </FormHelperText>
              </FormControl> */}
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
                const { name, value } = e.target;
                if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                  setFormValues(prev => ({ ...prev, [name]: value }));
                  headerLocationId !== 'null'
                    ? setStateHandler(name, value)
                    : setOpenAlert(true);
                }
              }}
              // onBlur={handleChange}
              onBlur={(e) => { formValues.frompayment_id ===null && (formValues.fromallowdenomination === 1 || formValues.toallowdenomination === 1 ) &&
                setOpenDenomination(true); setCurrentTarget(e.target.name) }}
              required={true}
              style={{}}
              fullWidth={true}
              onWheel={ (e) => e.target.blur()}
              placeholder=' Enter Amount'
              label='Amount'
              name='amount'
              color='primary'
              multiline={false}
              type="text"
              inputMode="decimal"
              regex=''
              variant='filled'
              value={formValues.amount === null ? '' : formValues.amount}
              error={formErrors.amount === null ? false : true}
              helperText={formErrors.amount === null ? '' : formErrors.amount}
              disabled={props.type === 'BANKRECONCILIATION'}
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
                fullWidth
                label='Reference'
                variant='filled'
                name='reference'
                value={formValues.reference === null ? '' : formValues.reference}
                onChange={handleChange}
                disabled={props.type === 'BANKRECONCILIATION'}
              />
            </Grid>

          <Grid
            form={false}
            size={{
              lg: 6,
              sm: 12,
              md: 6,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              // onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder='Note'
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
              lg: 6,
              md: 6,
              sm: 12,
              xs: 12
            }}>
            <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
          </Grid>
        </Grid>
        </Grid>
        {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}
        </Grid>

        <Grid
          style={{paddingTop: '15px'}}
          size={{
            lg: 6,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Button
            onClick={handleTabdata}
            name='add'
            size='large'
            text='button'
            color='primary'
            style={{}}
            variant='contained'
            fullWidth={false}
          >
           <Typography variant='h9'> {props.mode !== 'edit' ? 'Add items' : 'Update items'}</Typography>
          </Button>
          {/* <div style={{ display: 'flex', padding: '0 10px' }}>
                    {props.top3[single === "0" ? 'out' : single === "1" ?'in' : 'contra']?.filter(d => !tabData.some(s1 => d.id === s1.id)).map(d => <Chip sx={{ m: '0 5px' }} onClick={() => chipChange(d)} label={`${d.ledgerName || ''} â‚¹ ${d.amount}`} />)}

                  </div> */}
        </Grid>
        <br />
        <Grid container>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
        <MaterialTable
          options={{
            showEmptyDataSourceMessage: false,
            headerStyle,
            cellStyle,
            exportButton: true,
            filtering: false,
            maxBodyHeight: '60vh',
            actionsColumnIndex: -1,
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) => ExportPdf(cols, datas, 'Contra'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) => ExportCsv(cols, datas, 'Contra'),
              },
            ],
          }}
          columns={[
            {
              title: 'Date',
              field: 'transactionDate',
              render: (rowData) => (
                commonDateFormat(rowData.transactionDate)
              )
            },
            {
              title: 'From',
              field: 'from_ledger_name',
            },
            {
              title: 'To',
              field: 'to_ledger_name',
            },
            {
              title: 'Note',
              field: 'reason',
            },
            {
              title: 'Amount',
              field: 'amount',
              render: (rowData) => (
                <div
                  style={{
                    textAlign: 'right',
                    minWidth: '60px',
                    maxWidth: '60px',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rowData.amount}
                </div>
              )
            },
            {
              title: 'Reference',
              field: 'reference',
            },
            // {
            //   title : "Expenses" , field : "expense",
            // },
            // {
            //   title : "Purpose" , field : "purpose",
            // },
            {
              title: 'Cash Type',
              field: 'cash_type',
            },
          ]}
          data={tabData}
          title={<Typography variant='h6'>Contra</Typography>}
        />
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
          sx={{ mt: 2 }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
              <Grid
                spacing={7}
                container
                display='flex'
                flexDirection='row'
                justifyContent='flex-end'
              >
                {props.status === 'edit' ? (
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    {' '}
                  </Grid>
                ) : (
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
                )}

                <Grid>
                  <Button
                    onClick={handleSubmit}
                    disabled={validSubmit === false ? true : false}
                    name='Submit'
                    size='medium'
                    text='button'
                    color='primary'
                    style={{}}
                    variant='contained'
                    fullWidth={false}
                  >
                    Submit
                  </Button>
                </Grid>
          </Grid>
        </Grid>
        <CancelDialog
          handle={cancel}
          delete={dialog}
          close={props.handleClose}
        ></CancelDialog>
      </>
      <LocationAlert open={openAlert} onClose={()=>setOpenAlert(false)}/>
    </>
  );
}

export default Contra;

