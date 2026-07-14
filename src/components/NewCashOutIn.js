import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CircularProgress from '@mui/material/CircularProgress';
import CancelDialog from './CancelDialog';
import AddIcon from '@mui/icons-material/Add';
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
  Tooltip,
  IconButton,
  Dialog,
  Card,
  CardContent,
} from '@mui/material';
// import { useTheme } from '@emotion/react';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import MaterialTable from 'utils/SafeMaterialTable';
import DenominationDialog from '../pages/accounts/cashOutIn/DenominationDialog';
import _ from 'lodash';
// import { useDispatch, useSelector } from 'react-redux';
import {getTrimmedData} from './trimFunction/index';
import Chip from '@mui/material/Chip';
import listBankCreationAction, { setTransactionCount } from '../redux/actions/bankCreation_actions';
import {useSelector, useDispatch} from 'react-redux';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import Contra from './contra';
import {
  getDateTimeFormat,
  getDateFormat,
  yyyymmdd_ddmmyyyy,
  commonDateFormat,
} from '../../src/utils/getTimeFormat';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Box from '@mui/material/Box';
import context from '../context/CreateNewButtonContext';
import FilePicker from '../../src/components/FilePicker/indexIn'
import { listPayIndataAction, listPayOutdataAction } from 'redux/actions/chartOfAccounts';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import NewLedger from './Ledger';
import { createLedgerAction, updateLedgerAction } from 'redux/actions/ledger_actions';
import apiCalls from 'utils/apiCalls';
import NegativeCashWarning from './NegativeCashWarning';
import { getBankAndCashAccountsAction } from 'redux/actions/cash_box_actions';
import toMomentOrNull from 'utils/DateFixer';
import { getPayInOutContraSequenceAction } from 'redux/actions/cashOutIn_actions';

function NewCashOutIn(props) {
  const [formValues, setFormValues] = useState({
    expense: null,
    ledger_id: null,
    reason: null,
    prevAmount: null,
    amount: null,
    payment_id: null,
    cashboxId: null,
    activeChip: null,
    cash_type: null, 
    date: moment(),
    location_id: null,
    paymentModeLedgerId:null,
    amount_in_change: [],
    amount_in_denomination : [],
    prevCashboxId: null,
    paymentTransactionId: null,
    accTransactionId: null,
    cashBoxDetailId: [],
    reference : null,
    chequeNumber: null,
    chequeBankName: null,
    chequeDate: null,
    paymentType: null
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
    chequeNumber: null,
    chequeBankName: null,
    chequeDate: null
  });
  const [requiredFields, setRequiredFields] = useState([
    'ledger_id',
    'reason',
    'amount',
    'payment_id',
  ]);
  const [regex] = useState({chequeNumber: /^\d{6}$/});
  const [Prompt] = UnSavedChangesWarning();

  // const [initialState, setInitialState] = useState({})
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [formval, setFormVal] = useState({ledgerVal: null});
  const [single, setsingle] = useState(props.requestMode || '0');
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
  const {headerLocationId, setHeaderLocationIdHandeler,setModalTypeHandler,setLoaderStatusHandler} = useContext(context);
  const [amountNegativeValidation, setAmountNegativeValidation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [ledgerCreateOpen, setLedgerCreateOpen] = useState(false);
  const [status,setStatus] = useState('create')
  const [needNegativeCashAlert, setNeedNegativeCashAlert] = useState(false)
  const [negativeCashAlertOpen, setNegativeCashAlertOpen] = useState(false)
  
  const {
    ChartOfAccountsReducer: { chartOfAccounts_payOut_data, chartOfAccounts_payIn_data },
    stockLedgerReducer:{stock_ledger_list},
    cashBoxReducer: { cashAndBankAccounts },
    CashOutInReducer: { cashOutIn_denomination, payInOutContraSequence }
  } = useSelector((state) => state);

  const [openPayIn, setOpenPayIn] = useState(false);
  const [openPayOut, setOpenPayOut] = useState(false);
  const [payOutData, setPayOutData] = useState([...chartOfAccounts_payOut_data]);
  const [payInData, setPayInData] = useState([...chartOfAccounts_payIn_data]);
  const loadingPayIn = openPayIn && payInData.length === 0;
  const loadingPayout = openPayOut && payOutData.length === 0;
  const [ defaultcash, setDefaultcash ] = useState(0);

  useEffect(() => {
    const isDirty = formValues.amount || formValues.ledger_id || tabData.length > 0;
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formValues.amount, formValues.ledger_id, tabData.length]);

  // console.log("payInData",payInData)
  // console.log("payOutData",payOutData)
  // console.log("single",single)

  useEffect(() => {
    if (formValues.amount_in_denomination?.length > 0) {
      setFormErrors({ ...formErrors, amount: null })
    }
  }, [formValues.amount_in_denomination?.length])

  // console.log("props.cash_box_adjustment_list",props.cash_box_adjustment_list,activeChip)

  useEffect(() => {
    if (props.mode === "edit" && props.editData && props.editData.cash_type === 'OUT') {
      dispatch(listPayOutdataAction((response) => {
        setPayOutData(response);
      }));
    }
    else if(props.mode === "edit" && props.editData && props.editData.cash_type === 'IN'){
        dispatch(listPayIndataAction((response) => {
          setPayInData(response);
        }));
    }
  }, [props.mode, props.editData, dispatch]);

  useEffect(() => {
    if (props.mode === "edit" && props.editData) {
      if (formValues.amount_in_denomination?.length > 0) {
        setFormErrors({ ...formErrors, amount: null })
      }
      if (props.editData.location_id) {
        setHeaderLocationIdHandeler(props.editData.location_id);
      }

      if (props.editData.cash_type === 'IN' && props.editData.purpose !== 'contra') {
        setsingle('1');
      } else if (props.editData.cash_type === 'OUT' && props.editData.purpose !== 'contra') {
        setsingle('0');
      } else {
        setsingle('2');
      }

      setFormValues((prevValues) => ({
        ...prevValues,
        expense: props.editData.expense || null,
        ledger_id: props.editData.ledger_id || null,
        reason: props.editData.reason || null,
        prevAmount: props.editData.amount || null,
        amount: props.editData.amount || null,
        payment_id: activeChip === 'cash' ? props.editData.cashboxId :  props.editData.payment_id,
        cashboxId: props.editData.cashboxId || null,
        prevCashboxId: props.editData.cashboxId || null,
        cash_type: props.editData.cash_type || null,
        date: props.editData.date
          ? moment(props.editData.date, "DD/MM/YYYY")
          : moment(),
        location_id: props.editData.location_id || null,
        paymentModeLedgerId: props.editData.paymentModeLedgerId || null,
        amount_in_change: props.editData.amount_in_change || [],
        amount_in_denomination: props.editData.amount_in_denomination || [],
        paymentTransactionId: props.editData.id || null,
        accTransactionId: props.editData.accTransactionId || null,
        cashBoxDetailId: props.editData.cashBoxDetailIds
          ? props.editData.cashBoxDetailIds.split(',').map(id => parseInt(id, 10))
          : [],
        reference : props.editData.reference || null,
        chequeBankName: props.editData.bankName || null,
        chequeNumber: props.editData.chequeNumber || null,
        chequeDate: props.editData.chequeDate || null,
        paymentType: props.editData.paymentType || null
      }));
    }

  }, [props.mode, props.editData,activeChip]);

  // console.log("formValues",formValues)

  
  useEffect(()=>{
      if(formValues.payment_id !== null && activeChip === 'cash' && props.cash_box_adjustment_list.length > 0 ){
       props.cash_box_adjustment_list?.filter((f)=> f.id === (formValues.payment_id || formValues.cashboxId))?.map((d) => setDefaultcash(d.allowdenomination))
      }
  },[formValues.payment_id])

  useEffect(() => {
    let active = true;

    if (!loadingPayIn) {
      return undefined;
    }

    (async () => {
      
        !chartOfAccounts_payIn_data.length && dispatch(
          listPayIndataAction((response) => {
            setPayInData(response)
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
      !chartOfAccounts_payOut_data.length && dispatch(
        listPayOutdataAction((response) => {
          setPayOutData(response)
        }),
      );
    })();
    return () => {
      active = false;
    };
  }, [loadingPayout]);


  const loadLedgerApi = () => {
    if (single === '0') {
      !chartOfAccounts_payOut_data.length && dispatch(
        listPayOutdataAction((response) => {
          setPayOutData(response)
        }),
      );
    } else if (single === '1') { 
      !chartOfAccounts_payIn_data.length && dispatch(
        listPayIndataAction((response) => {
          setPayInData(response)
        }),
      );
    } 
  }

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
  
  useEffect(()=>{
     
    if(formValues.payment_id !== '' && formValues.payment_id !== null || formValues.cashboxId !== '' && formValues.cashboxId !== null){
      let getPaymentModeLedgerId = null 
      if(activeChip === 'cash'){
         getPaymentModeLedgerId = props.cash_box_adjustment_list.find(
          (d) => d.id ===  formValues.cashboxId,
        );
        setFormValues({...formValues,paymentModeLedgerId:getPaymentModeLedgerId?.ledger_id || null})
        setAmountNegativeValidation(getPaymentModeLedgerId?.negativeDenomination)
      }else{
         getPaymentModeLedgerId = props.paymentMethod.find(
          (d) => d.paymentId === formValues.payment_id ,
        );
        setFormValues({...formValues,paymentModeLedgerId:getPaymentModeLedgerId?.ledger_id || null})
      }
      
     }
  },[formValues.payment_id,formValues.cashboxId])


  const clearField = ()=>{
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
      amount_in_denomination : []
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
   
    if (name === 'ledger_id' && value !==null) {
      const ledgerName = [...chartOfAccounts_payOut_data, ...chartOfAccounts_payIn_data].find((d) => d.id === value).name;
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
      await setFormErrors({
        expense: null,
        ledger_id: null,
        reason: null,
        amount: null,
        discount_type: null,
        payment_id: null,
        date: null,
        upload: null,
        chequeNumber: null,
        chequeBankName: null,
        chequeDate: null
      })
      if (activeChip !== 'cash') {
        if(single === '0'){
          await props.PaymentDenominationvalidation(value)
        }else{
          await props.PaymentDenominationvalidation(value)
        }
        const paymentData = props.paymentMethod.find(
          (d) => d.paymentId === value,
        );
        const locationValue = props.bank_creation_adjustment_list.find(
          (d) => d.bankAccountId === paymentData.bankAccountId,
        );
        const payName = paymentData.paymentName;
        const paymentType = paymentData.paymentType
        setLocationId(locationValue.location_id);
        const data = {payment_id: value}
        await props.PayOutAmountValidation(data)
        formObj = {
          ...formValues,
          [name]: value === '' ? null : value,
          payName,
          paymentType
        };
        if(paymentData.paymentType === 'Cheque'){
          await setRequiredFields([
            'ledger_id',
            'reason',
            'amount',
            'payment_id',
            'chequeNumber',
            'chequeBankName',
            'chequeData'
          ])
        }
        else{
          await setRequiredFields([
            'ledger_id',
            'reason',
            'amount',
            'payment_id'
          ])
        }
      } else if (activeChip === 'cash') {
         await props.PaymentDenominationvalidation(value,'cash',single === '0' ? 'Out': 'IN')
        
        const paymentData = props.cash_box_adjustment_list.find(
          (d) => d.id === value,
        );
        const payName = paymentData.name;
        const paymentType = paymentData.paymentType
        setLocationId(paymentData.location_id);
        const data = {cashboxId: value}
        await props.PayOutAmountValidation(data)
         formObj = {
          // ...contraform,
          ...formValues,
          [name]: value === '' ? null : value,
          payName,
          paymentType
        };
        await setRequiredFields([
          'ledger_id',
          'reason',
          'amount',
          'payment_id'
        ])
      }
    }
    else if ( name === 'amount' && single === '0') {
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
    if(needNegativeCashAlert){
      setNegativeCashAlertOpen(true)
      return
    }
    let isValid = true;
    let formErrorsObj = {...formErrors};
     await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!'
      } 
      else if (key === 'amount' && formValues[key] !== null && formValues[key] !== '' && +formValues[key] <= 0) {
        isValid = false;
        formErrorsObj[key] = 'Amount must be greater than zero';
      }
      else if (key == 'amount_in_denomination' && formValues[key].length === 0 && activeChip === 'cash' && defaultcash === 1){
       isValid = false;
       formErrorsObj['amount'] = capitalize('amount') + 'Denomination Empty!';
      }
      // else if (regex[key]) {
      //   if (!regex[key].test(formValues[key])) {
      //     isValid = false;
      //     formErrorsObj[key] = capitalize(key) + ' is Invalid!';
      //   }
      // }
      return null;
    });
    
    if(+formValues.amount >= 5000 && !uploadedFiles.length){
      isValid = false;
      formErrorsObj.upload = true
    }
    if (formErrorsObj.amount === "AmountDenomination Empty!") {
      setOpenDenomination(true);
      setCurrentTarget('Tendered')
    }
    await setFormErrors(formErrorsObj);

    if(uploadedFiles.length){
      var file = uploadedFiles[0];

    const bill_image = await readFileAsync(file)
    formValues.bill_image = bill_image

    }
    if (isValid) {
      const submitValues = { ...formValues };
      submitValues.cash_type =
        single === '1' ? 'IN' : single === '0' ? 'OUT' : 'CONTRA';
      submitValues.activeChip = activeChip;
      submitValues.location_id = locationId;
      if (activeChip === 'cash') {
        submitValues.cashboxId = submitValues.payment_id;
        submitValues.payment_id = null;
      } else {
        submitValues.cashboxId = null;
      }
      submitValues.chequeDate = submitValues.chequeDate ? moment(submitValues.chequeDate).format('YYYY-MM-DD') : null
      await setTabData([ submitValues ]);
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
   };

   useEffect(()=>{
      if(tabData.length > 0){
        handleSubmit()
      }
   }, [tabData])

   function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
  
      reader.onload = () => {
        resolve(reader.result);
      };
  
      reader.onerror = reject;
  
      reader.readAsDataURL(file);
    })
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
      else{
        dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      }
    } else {
     
      const dat = tabData.map((d) => {
        const { ledgerName, payName, paymentType, ...rest } = d;
        return rest;
      });
      props.handleSubmit(dat);
      dispatch(setTransactionCount(tabData.length))
    }
    // }
  };


   const ledgerSubmit = async (data) => {
      if (data.id) {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(updateLedgerAction(
            data.id,
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
          )
        )
        );
        setLedgerCreateOpen(false);
      } else {
        const id = stock_ledger_list[0]?.sequence_id;
        const current_seq = stock_ledger_list[0]?.current_seq;
  
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          await dispatch(createLedgerAction(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
            id,
            {current_seq},
          )
        )
        );
        await dispatch(listPayOutdataAction((response) => {
        setPayOutData(response);
      }));
        setLedgerCreateOpen(false);
        loadLedgerApi()
      }
    };
  //  const edits = () => {
  //   if (props.edit_id_data[0] && props.status === 'edit') {
  //     let ID_data = props.edit_id_data;
  //     var obj = ID_data;
  //     for (let key of Object.keys(obj)) {
  //       var value = obj[key];

  //       setFormValues(value);
  //       // setInitialState(value)
  //       setsingle(value.cash_type !== 'IN' ? 'false' : 'true');

  //      }
  //   }
  // };
  // tempedits.current = edits;
  // useEffect(() => {
  //   console.log("dcefvc");
    
  //   tempedits.current();
  // }, [props.edit_id_data]);

    // console.log("setMethddd",props.mode)

useEffect(() => {
  let setMethod;

  if (props.mode === "edit") {
    if (props.editData?.cashboxId) {
      setMethod = "cash";
    } else {
      const matched = props.paymentMethod?.find(
        (p) => p.paymentId === props.editData?.payment_id
      );
      setMethod = matched?.bankAccountId || null;
    }
  } 
  else if(props.type === 'MANUALMATCH' || props.type === 'BANKRECONCILIATION') {
    const matched = props.paymentMethod?.find(
        (p) => p.bankAccountId === props?.bankId
      );
      setMethod = matched?.bankAccountId || null;
  }
  else {
    setMethod = "cash";
  }


  setActiveChip(setMethod);
}, [props.mode, props.editData, props.paymentMethod]);

  useEffect(() => {
    let setMethod;
    if (props.type === 'CHEQUE_REPRESENT' && props.paymentMethod.length > 0) {
      if (props.paymentData.paymentDetails[0]?.cashboxId) {
        setMethod = "cash";
      } else {
        const matched = props.paymentMethod?.find(
          (p) => p.paymentId === props.paymentData.paymentDetails[0]?.payment_id
        );
        setMethod = matched?.bankAccountId || null;
      }
    
    setActiveChip(setMethod);

    !chartOfAccounts_payIn_data.length && dispatch(
      listPayIndataAction((response) => {
        setPayInData(response)
      }),
    )

    setFormValues((prev) => ({
      ...prev,
      expense: props?.paymentData?.paymentDetails?.[0]?.expense || null,
      ledger_id: props?.paymentData?.paymentDetails?.[0]?.ledger_id || null,
      reason: props?.paymentData?.paymentDetails?.[0]?.reason || null,
      amount: props?.paymentData?.paymentDetails?.[0]?.amount || null,
      payment_id: props?.paymentData?.paymentDetails?.[0]?.payment_id || null,
      cashboxId: props?.paymentData?.paymentDetails?.[0]?.cashboxId || null,
      cash_type: props?.paymentData?.paymentDetails?.[0]?.cash_type || null,
      date: props?.paymentData?.representDate ? moment(props?.paymentData?.representDate).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss'),
      location_id: props?.paymentData?.paymentDetails?.[0]?.location_id || null,
      reference: props?.paymentData?.paymentDetails?.[0]?.reference || null,
      paymentType: props?.paymentData?.paymentDetails?.[0]?.paymentType || null,
      chequeNumber: props?.paymentData?.paymentDetails?.[0]?.chequeNumber || null,
      chequeBankName: props?.paymentData?.paymentDetails?.[0]?.bankName || null,
      chequeDate: props?.paymentData?.paymentDetails?.[0]?.date || null
    }))
  }
  }, [props.paymentMethod, props.paymentData, props.type])


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
    if(!props.type === 'BANKRECONCILIATION' || !props.type === 'MANUALMATCH'){
      setFormValues({...formValues, amount: null});
    }
    
    setActiveChip(data);
    // setTabData([...tabData, data])
  };
  const existingchipChange = (data) => {
    if (headerLocationId !== 'null') {
      loadLedgerApi();
      setActiveChip(data.cashboxId !== null ? 'cash' : data.bankAccountId)
    setFormValues({...formValues, cashboxId : data.cashboxId === null ? null : data.cashboxId, payment_id : data.cashboxId === null ? data.payment_id : data.cashboxId, ledger_id : data.ledger_id, payName : data.payName === null ? data.cashbox_name : data.payName, ledgerName: data.ledgerName });
    } else{
      alert('Please select any one location.')
    }
    // setActiveChip(data);
    // setTabData([...tabData, data])
  };

  const cashDenominationChange = (name) => {
    setOpenDenomination(true);
    setCurrentTarget(name);
  }

  //  const dublicate = chartOfAccounts?.filter((d) => d.name);
   //_.uniqBy(props.bank_creation_adjustment_list,"bankName")
  function excelSerialToDate(serial) {
    // Excel counts from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    // Subtract 2 days because Excel wrongly treats 1900 as leap year
    return new Date(excelEpoch.getTime() + (serial - 2) * 86400000);
  }


  useEffect(() => {
    if (props.mode !== "edit") {
    setFormErrors({
      expense: null,
      ledger_id: null,
      reason: null,
      amount: null,
      discount_type: null,
      payment_id: null,
      date: null,
      upload: null,
      chequeNumber: null,
      chequeBankName: null,
      chequeDate: null
    })
    setFormValues({
      expense: null,
      ledger_id: null,
      reason: null,
      amount: props.reconciliateData ? props.reconciliateData.Credit || props.reconciliateData.Debit : null,
      payment_id: null,
      cashboxId: null,
      activeChip: null,
      cash_type: null, 
      date: props.reconciliateData
    ? moment(excelSerialToDate(props.reconciliateData.Date)).set({hour: moment().hour(), minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD HH:mm:ss'),
      location_id: null,
      paymentModeLedgerId:null,
      amount_in_change: [],
      amount_in_denomination : [],
      reference : props.reconciliateData ? props.reconciliateData.Description : null,
      chequeNumber: null,
      chequeBankName: null,
      chequeDate: null
    })
  }
  const payload = {
      chip: 'All',
      searchString: ''
  }
  dispatch(getBankAndCashAccountsAction(payload))
  const params = single === '0' ? 'payOut' : single === '1' ? 'payIn' : single === '2' ? 'contra' : ''
  dispatch(getPayInOutContraSequenceAction(params))
  }, [single, props.mode])

  const selectedLedger = payOutData.length > 0 ? payOutData.find(item => item.id === formValues.ledger_id) : []
  const selectedLedger1 = payInData.length > 0 ? payInData.find(item => item.id === formValues.ledger_id) : []

  return (
    <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto' }}>
      {props.mode !== 'edit' && 
        <div
          style={{
            border: '2px solid grey',
            borderRadius: '10px',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <FormControl component='fieldset'>
            <RadioGroup
              row
              aria-label='customer'
              value={single}
              name='cash_type'
              onChange={Change}
            >
              <FormControlLabel value='0' control={<Radio />} label='PayOut'  disabled={props.requestMode === '1' || props.requestMode === '2' }/>
              <FormControlLabel value='1' control={<Radio />} label='PayIn' disabled={props.requestMode === '0' || props.requestMode === '2' }/>
              <FormControlLabel value='2' control={<Radio />} label='Contra' disabled={props.requestMode === '0' || props.requestMode === '1' } />
            </RadioGroup>
          </FormControl>
        </div>
  }
      {single !== '2' &&
      <Grid container style={{marginTop: '25px'}}>
        <Grid
          style={{marginBottom: '25px'}}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          {/* <div style={{ justifyContent: 'left',display: 'flex', marginTop: '25px' }}> */}
          {/* {props.top3[single === "0" ? 'out' : 'in']?.filter(d=>!tabData.some(s1 => d.id === s1.id)).map(d => <Chip sx={{ m: '0 5px' }} onClick={() => chipChange(d)} label={`${d.ledgerName || ''} â‚¹ ${d.amount}`} />)} */}
          {/* {single !== "2" &&
            <div>
            <Chip sx={{ m: '0 5px' }} onClick={() => chipChange("cash")} label="Cash" color={activeChip === "cash" ? "primary" : "default"} />
           { _.uniqBy(props.bank_creation_adjustment_list,"bankName").map(d => <Chip sx={{ m: '0 5px' }} onClick={() => chipChange(d.bankAccountId)} label={d.bankName} color={activeChip === d.bankAccountId ? "primary" : "default"} />)}
           </div>
           } */}

          {/* {single !== "2" &&
            <div>
            <Chip sx={{ m: '0 5px' }} onClick={() => chipChange("cash")} label="Cash" color={activeChip === "cash" ? "primary" : "default"} />
           { _.uniqBy(props.bank_creation_adjustment_list,"bankName").map(d => <Chip sx={{ m: '0 5px' }} onClick={() => chipChange(d.bankAccountId)} label={d.bankName} color={activeChip === d.bankAccountId ? "primary" : "default"} />)}
           </div>
           } */}

          {/* <Button
            sx={{borderRadius: '0', boxShadow: 0}}
            onClick={() => chipChange('cash')}
            label='Cash'
            variant={activeChip === 'cash' ? 'contained' : 'outlined'}
          >
            Cash
          </Button> */}
            {_.uniqBy(props.type === 'MANUALMATCH' || props.type === 'BANKRECONCILIATION' ? 
                  props.bank_creation_adjustment_list.filter((d) => d.bankAccountId === props.bankId) 
                  : props.bank_creation_adjustment_list, 'bankName')
              .map(
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
                    disabled={props.type === 'BANKRECONCILIATION' && d.bankName === 'Cash'}
                  >
                    {d.bankName}
                  </Button>
                ),
              )}

          {/* </div> */}
        </Grid>

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
                value={toMomentOrNull(formValues.date)}
                inputVariant='contained'
                disableFuture
                onChange={(e, v) => {
                  setFormValues({...formValues, date: e});
                }}
                slotProps={{ textField: { variant: 'filled' } }}
              />
            </LocalizationProvider>
            {/* </div> */}
          </Box>
        </Grid>
      </Grid>
      }
      {single === '0' && (
        <>
          {Prompt}
          <Typography variant='h6' align='left'  style={{ paddingTop: '15px' }}>
           {props.mode !== 'edit' ? 'New Payout' : 'Update Payout'}
          </Typography>

          {/* <div style={{ border: '2px solid grey', borderRadius: '10px', paddingLeft: '500px', paddingBottom: '0px' }}>
  
          <FormControl component="fieldset" >
            <RadioGroup row aria-label="customer" value={single} name="cash_type" onChange={Change} >
              <FormControlLabel value="false" control={<Radio />} label="CashOut" />
              <FormControlLabel value="true" control={<Radio />} label="CashIn" />
            </RadioGroup>
          </FormControl>
        </div> */}

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
              <FormControl
                required={true}
                error={formErrors.payment_id === null ? false : true}
                component='fieldset'
                fullWidth={true}
                variant='filled'
              >
                <InputLabel shrink>Payment Mode</InputLabel>
                <Select
                  style={{}}
                  name='payment_id'
                  label='Payment Mode'
                  // items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                  required={false}
                      onChange={handleChange}
                      //defalutValue=''
                      value={
                        activeChip === 'cash' && props.mode === 'edit' && props.editData?.cashboxId
                          ? formValues.cashboxId
                          : formValues.payment_id ?? ''
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
                <FormHelperText>{formErrors.payment_id === null ? '' : 'Payment Mode is Required!'}</FormHelperText>
              </FormControl>
                  {/* <Autocomplete
                  value={formValues.payment_id !== null? props.cash_box_adjustment_list.filter(f=>f.id === formValues.payment_id)[0] : {name:''}}
                  name='payment_id'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                       handleChange({target : {name : 'payment_id' , value : newValue.id}})
                  }}
                  options={_.uniqBy(props.cash_box_adjustment_list,'name')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                   variant="outlined"
                    error={formErrors.payment_id === null ? false : true} 
                     helperText={formErrors.payment_id === null ? '' : formErrors.payment_id}
                      label='Payment Mode'
                       required={true} />}
              /> */}

            </Grid>

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
  
           
            container={true}
            direction='row'>
            <FormControl required={true}
              error={formErrors.ledger_id === null ? false : true}
              variant='outlined'
              component='fieldset'
              fullWidth={true}>
              <InputLabel>
                  Ledger
              </InputLabel>
              <Select style={{}}
                name='ledger_id'
                label='Payment Mode'
                items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                required={false}
                onChange={handleChange}
                value={formValues.ledger_id === null ? "" : formValues.ledger_id}>
                  {props.chartOfAccounts?.map(d => <MenuItem value={d.id} key={d}>
                {d.name} 
              </MenuItem>)}
              </Select>
              <FormHelperText>
              {formErrors.ledger_id}
            </FormHelperText>
            </FormControl>
          </Grid> */}

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 6,
              xs: 12
            }}>
          
          <Autocomplete
               value={
                  formValues.ledger_id !== null
                    ? payOutData.filter(
                        (f) => f.id === formValues.ledger_id,
                      )[0]
                    : {name: ''}
                }
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
                  handleChange({
                    target: {name: 'ledger_id', value: newValue === null? null: newValue.id},
                  });
                }}
                options={_.uniqBy(payOutData, 'name')}
                getOptionLabel={(option) => option.name}
                renderInput={(params) =>
                  <TextField {...params}
                    variant='filled'
                    error={formErrors.ledger_id === null ? false : true}
                    helperText={formErrors.ledger_id === null ? formValues.ledger_id !== null ? `${selectedLedger?.groupName || 'NIL'} - ${selectedLedger?.parentName || 'NIL'}` : '' : 'Ledger is Required!'}
                    label='Ledger'
                    required={true}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Tooltip title="Create New">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setLedgerCreateOpen(true);
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {loadingPayout ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
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
                  const { name, value } = e.target;
                  if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                    setFormValues(prev => ({ ...prev, [name]: value }));
                    headerLocationId !== 'null'
                      ? setStateHandler(name, value)
                      : setOpenAlert(true);
                  }
                }}
                onBlur={(e) =>{
                  const num = e.target.value;

                  if (num) setFormValues(prev => ({ ...prev, amount: Number(num).toFixed(2) }));
                  activeChip === 'cash' && defaultcash === 1 &&
                    formValues.amount > 0 &&
                    setOpenDenomination(true);
                  setCurrentTarget('Tendered')

                    const account = activeChip === 'cash'
                      ? cashAndBankAccounts.find(d => d.type === 'Cash' && d.id === formValues.payment_id)
                      : cashAndBankAccounts.find(d => d.type === 'Bank' && d.id === activeChip);
                    if(account && account.amount < Number(num)){
                      setNeedNegativeCashAlert(true)
                    }
                    else{
                      setNeedNegativeCashAlert(false)
                    }
              }}
              // onBlur={handleBlur}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
                // onBlur={handleChange}
                // onFocus={(e)=>setOpenDenomination(pre=> pre===true ?false:true)}
                // onClick={
                //   activeChip === 'cash' && handleChange
                // }
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
                helperText={formErrors.amount === null ? '' : (formErrors.amount === "AmountDenomination Empty!" ? "AmountDenomination Empty" : 'Amount is Required!')}
                disabled={props.type === 'BANKRECONCILIATION'}
              />
            </Grid>

            {
              formValues.paymentType !== 'Cheque' && (
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
                    value={formValues.reference}
                    onChange={handleChange}
                    disabled={props.type === 'BANKRECONCILIATION'}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField 
                    fullWidth
                    label='Cheque Number'
                    variant='filled'
                    name='chequeNumber'
                    value={formValues.chequeNumber}
                    onChange={handleChange}
                    required
                    error={formErrors.chequeNumber}
                    helperText={formErrors.chequeNumber}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField 
                    fullWidth
                    label={`Cheque's Bank Name`}
                    variant='filled'
                    name='chequeBankName'
                    value={formValues.chequeBankName}
                    onChange={handleChange}
                    required
                    error={formErrors.chequeBankName}
                    helperText={formErrors.chequeBankName}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker 
                        fullWidth
                        label={`Cheque Date`}
                        inputVariant='contained'
                        name='chequeDate'
                        value={toMomentOrNull(formValues.chequeDate)}
                        onChange={(e, v) => {
                          handleChange({target: {name: 'chequeDate', value: e}})
                        }}
                        required
                        error={formErrors.chequeDate}
                        helperText={formErrors.chequeDate}
                        slotProps={{ textField: { variant: 'filled', required: true } }}
                      />
                    </LocalizationProvider>
                </Grid>
              )
            }

            <Grid size={12}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
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
                    lg: 6,
                    md: 6,
                    sm: 12,
                    xs: 12
                  }}>
                  <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} upload={formErrors.upload} amount={formValues.amount} />
                  </Grid>
                
              </Grid>
            </Grid>
              </Grid>
              </Grid>

              {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}
            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
            container={true}
            direction='row'
           
            >
            <TextField onChange={handleChange}
              onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder=' Enter Purpose'
              label='Purpose'
              name='purpose'
              color='primary'
              multiline={true}
              variant='outlined'
              rows={2}
              type='text'
              regex=''
              value={formValues.purpose === null ? '' : formValues.purpose}
              error={formErrors.purpose === null ? false : true}
              helperText={formErrors.purpose === null ? '' : formErrors.purpose} />
          </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
  
           
            container={true}
            direction='row'>
                  <Autocomplete
            value={formValues.expense }
            name='expense'
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFormValues({
                  ...formValues, expense: newValue
                })
               } else if (newValue && newValue.inputValue) {
                setFormValues({
                  ...formValues, expense: newValue.inputValue,
                });
                 ExpenseValue([...expenseValue, newValue.inputValue])
              } else if (newValue === null) {
                setFormValues({
                  ...formValues, expense: newValue
                })
              } else {
                setFormValues({
                  ...formValues, expense: newValue.expense
                })
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some((option) => inputValue === option.expense);
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  expense: `Add "${inputValue}"`,
                });
              }
              if (expenseValue.length) {
                expenseValue.forEach((data) => {
                  filtered.push({
                    inputValue: data,
                    expense: data,
                  });
                })

              }
              return filtered;
            }}
            id="free-solo-dialog-demo"
           // options={props.expense}
            // options={Array.from(
            //   new Set(props.expenses.map((a) => a.expense))
            // ).map((name) => {
            //   return props.expenses.find((a) => a.expense === name);
            // })}
            options={Array.from(new Set(dublicateexpense.map((a) => a.expense))).map(
              (name) => {
                return dublicateexpense.find((a) => a.expense === name);
              }
            )}
            // options = {props.expenses.filter((d) => (d.expense))}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.expense;
            }}
            fullWidth
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            // renderOption={(option) => option.expense}
            // renderOption={(props, option) => <li {...props}>{option.expense}</li>}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} onBlur={handleChange} label="expense" variant="outlined" error={formErrors.expense === null ? false : true} helperText={formErrors.expense === null ? '' : formErrors.expense} required={true} />
            )}
          />
           </Grid> */}
            {/* <TextField onChange={handleChange}
              onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder=' Enter Expenses'
              label='Expenses'
              name='expense'
              color='primary'
              multiline={false}
              type='text'
              regex=''
              variant='standard'
              value={formValues.expense === null ? '' : formValues.expense}
              error={formErrors.expense === null ? false : true}
              helperText={formErrors.expense === null ? '' : formErrors.expense} /> */}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            
            
           
          >

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              
              
             
            >
              <Button onClick={handleSubmit}
                        name='add'
                        size='medium'
                        text='button'
                        color='primary'
                        style={{}}
                        variant='contained'
                        fullWidth={false}>
                        Add Items
                      </Button>
            </Grid>
          </Grid> */}
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

          {
            negativeCashAlertOpen &&
            <NegativeCashWarning
              open={negativeCashAlertOpen}
              cash={formValues.amount - ((activeChip === 'cash'
                ? cashAndBankAccounts.find(d => d.type === 'Cash' && d.id === formValues.payment_id)
                : cashAndBankAccounts.find(d => d.type === 'Bank' && d.id === activeChip)
              )?.amount ?? 0)}
              onClose={() => {
                setNegativeCashAlertOpen(false)
                setNeedNegativeCashAlert(false)
              }}
            />
          }

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
                container
                display='flex'
                flexDirection='row'
                spacing={4}
              >
                <Grid
                  display='flex'
                  alignItems='center'
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <div>
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
                  </div>
                  
                  <div style={{display: 'flex', padding: '0 10px'}}>
                    <Button
                      onClick={()=>props.handleClose()}
                      name='add'
                      size='medium'
                      text='button'
                      color='secondary'
                      style={{}}
                      sx={{width: 'max-content'}}
                      variant='contained'
                      fullWidth={true}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div style={{display: 'flex', padding: '0 10px'}}>
                    {props.top3[single === '0' ? 'out' : 'in']
                      ?.filter((d) => !tabData.some((s1) => d.id === s1.id))
                      .map((d) => (
                        <Chip
                          key={d.id}
                          sx={{m: '0 5px'}}
                          onClick={() => existingchipChange(d)}
                          label={`${d.ledgerName || ''} ₹ ${d.amount}`}
                        />
                      ))}
                  </div>
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                 
                >
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
                          exportFunc: (cols, datas) =>
                            ExportPdf(cols, datas, 'PayOutData'),
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, datas) =>
                            ExportCsv(cols, datas, 'PayOutData'),
                        },
                      ],
                    }}
                    columns={[
                      {
                        title: 'Date',
                        field: 'date',
                        render: (rowData) => (
                          commonDateFormat(rowData.date)
                        )
                      },
                      {
                        title: 'Payment Mode',
                        field: 'payName',
                      },
                      {
                        title: 'Ledger',
                        field: 'ledgerName',
                      },
                      {
                        title: 'Note',
                        field: 'reason',
                      },
                      {
                        title: 'Amount',
                        field: 'amount',
                        cellStyle: {
                          textAlign: 'right',
                          paddingRight: '130px'
                        },
                        render: (rowData) => parseInt(rowData.amount).toFixed(2),
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
                    title={
                      <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                        PayOut</Typography>}
                  />
                </Grid> */}
              </Grid>
              {/* </Grid> : " "}<br/>


          {props.status !== 'edit' ?
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <br />
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}


               
              >

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}


                 
                >
                  <Button onClick={handleTabdata}
                    name='add'
                    size='medium'
                    text='button'
                    color='primary'
                    style={{}}
                    variant='contained'
                    fullWidth={false}>
                    Add Items
                  </Button>
                </Grid>
              </Grid>
              <br />
              <MaterialTable
                options={{
                  exportButton: true,
                  filtering: false,
                  maxBodyHeight: '60vh',
                  actionsColumnIndex: -1
                }}

                columns={[

                  {
                    title: "Expense", field: "expense",
                  },
                  {
                    title: "Ledger", field: "ledgerName",
                  },
                  {
                    title: "Reason", field: "reason",
                  },
                  {
                    title: "Amount", field: "amount",
                  },
                  {
                    title: "Payment Mode", field: "payName",
                  },
                  {
                    title: "Purpose", field: "purpose",
                  },
                  {
                    title: "Cash Type", field: "cash_type",
                  },

                ]}

                data={tabData}

                title="CashOut"
              /> */}
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

                  {/* <Grid  container justifyContent="flex-end">
                    <Button
                      onClick={handleSubmit}
                      name='Submit'
                      size='medium'
                      text='button'
                      color='primary'
                      style={{}}
                      variant='contained'
                      fullWidth={false}
                      disabled = {tabData.length === 0}
                    >
                      Submit 
                    </Button>
                  </Grid> */}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
      {single === '1' && (
        <>
          {Prompt}
          {openDenomination && (
            <DenominationDialog
              openDenomination={openDenomination}
              handleSubmit={setAmountDialogToState}
              responseType={'cashIn'}
              formValues={{...formValues}}
              setFormValues={setFormValues}
              setOpenDenomination={setOpenDenomination}
              currentTarget={currentTarget}
              setCurrentTarget={setCurrentTarget}
              validationHandler={validationHandler}
              total={formValues.amount}
              amountNegativeValidation={amountNegativeValidation}
              cashOutIn_denomination={props.cashOutIn_denomination}
            />
          )}
          <Typography variant='h6' align='left' style={{paddingTop: '15px'}}>
          {props.mode !== 'edit' ? 'New Payin' : 'Update Payin'}
          </Typography>

          {/* <div style={{ border: '2px solid grey', borderRadius: '10px', paddingLeft: '500px', paddingBottom: '0px' }}>
  
          <FormControl component="fieldset" >
            <RadioGroup row aria-label="customer" value={single} name="cash_type" onChange={Change} >
              <FormControlLabel value="false" control={<Radio />} label="CashOut" />
              <FormControlLabel value="true" control={<Radio />} label="CashIn" />
            </RadioGroup>
          </FormControl>
        </div> */}

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
                  items={[
                    {label: 'Select one', value: ''},
                    {label: 'one', value: 'one'},
                    {label: 'two', value: 'two'},
                  ]}
                  
                  required={false}
                  onChange={handleChange}
                  //defalutValue=''
                 value={
                        activeChip === 'cash' && props.mode === 'edit' && props.editData?.cashboxId
                          ? formValues.cashboxId
                          : formValues.payment_id ?? ''
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
                <FormHelperText>{formErrors.payment_id === null? '': 'Payment Mode is Required!'}</FormHelperText>
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
                value={
                  formValues.ledger_id !== null
                    ? payInData.filter(
                        (f) => f.id === formValues.ledger_id,
                      )[0]
                    : {name: ''}
                }
                name='ledger_id'
                fullWidth={true}
                onChange={(event, newValue) => {
                   // if (typeof newValue === 'string') {
                  handleChange({
                    target: {name: 'ledger_id', value: newValue === null ? null : newValue.id},
                  });

                  // setFormValues({...formValues , ledger : newValue.id})
                  // }
                }}
                // disablePortal
                options={_.uniqBy(payInData, 'name')}
                open={openPayIn} 
                onOpen={() => {
                  setOpenPayIn(true);
                }}
                onClose={() => {
                  setOpenPayIn(false);
                }}
                loading={loadingPayIn}
                // options={Array.from(new Set(dublicate.map((a) => a.name))).map(
                //   (name) => {
                //     return dublicate.find((a) => a.name === name);
                //   }
                // )}
                // renderOption={(option) => option.name}
                getOptionLabel={(option) => option.name}
                // options={props.chartOfAccounts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='filled'
                    fullWidth={true}
                    error={formErrors.ledger_id === null ? false : true}
                    helperText={
                      formErrors.ledger_id === null ? formValues.ledger_id !== null ? `${selectedLedger1?.groupName || 'NIL'} - ${selectedLedger1?.parentName || 'NIL'}` : '' : 'Ledger is Required!'
                    }
                    label='Ledger'
                    required={true}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Tooltip title="Create New">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setLedgerCreateOpen(true);
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {loadingPayIn ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          overflowY: 'auto',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
  
           
            container={true}
            direction='row'>
            <FormControl required={true}
              error={formErrors.ledger_id === null ? false : true}
              variant='outlined'
              component='fieldset'
              fullWidth={true}>
              <InputLabel>
                  Ledger
              </InputLabel>
              <Select style={{}}
                name='ledger_id'
                label='Payment Mode'
                items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                required={false}
                onChange={handleChange}
                value={formValues.ledger_id === null ? "" : formValues.ledger_id}>
                  {props.chartOfAccounts?.map(d => <MenuItem value={d.id} key={d}>
                {d.name} 
              </MenuItem>)}
              </Select>
              <FormHelperText>
              {formErrors.ledger_id}
            </FormHelperText>
            </FormControl>
          </Grid> */}

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
                    onBlur={(e) => {
                      const num = e.target.value;
                      if (num) setFormValues(prev => ({ ...prev, amount: Number(num).toFixed(2) }));
                      activeChip === 'cash' && formValues.amount > 0 && defaultcash === 1 && setOpenDenomination(true); setCurrentTarget('Tendered')

                      const account = activeChip === 'cash'
                        ? cashAndBankAccounts.find(d => d.type === 'Cash' && d.id === formValues.payment_id)
                        : cashAndBankAccounts.find(d => d.type === 'Bank' && d.id === activeChip);
                      if(account && account.amount < Number(num)){
                        setNeedNegativeCashAlert(true)
                      }
                      else{
                        setNeedNegativeCashAlert(false)
                      }
                    }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                // onClick={(e) => {
                //   activeChip === 'cash' && setOpenDenomination(true);
                //   setCurrentTarget('Tendered');
                // }}
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
                // inputProps={{ pattern: '^[0-9]+(\\.[0-9]{0,2})?$' }}
                regex=''
                variant='filled'
                value={formValues.amount === null ? '' : formValues.amount}
                error={formErrors.amount === null ? false : true}
                helperText={formErrors.amount === null ? '' : 'Amount is Required!'}
                disabled={props.type === 'BANKRECONCILIATION'}
              />
            </Grid>

            {
              formValues.paymentType !== 'Cheque' && (
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
                    value={formValues.reference}
                    onChange={handleChange}
                    disabled={props.type === 'BANKRECONCILIATION'}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField 
                    fullWidth
                    label='Cheque Number'
                    variant='filled'
                    name='chequeNumber'
                    value={formValues.chequeNumber}
                    onChange={handleChange}
                    required
                    error={formErrors.chequeNumber}
                    helperText={formErrors.chequeNumber}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField 
                    fullWidth
                    label={`Cheque's Bank Name`}
                    variant='filled'
                    name='chequeBankName'
                    value={formValues.chequeBankName}
                    onChange={handleChange}
                    required
                    error={formErrors.chequeBankName}
                    helperText={formErrors.chequeBankName}
                  />
                </Grid>
              )
            }
            {
              formValues.paymentType === 'Cheque' && (
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker 
                        fullWidth
                        label={`Cheque Date`}
                        inputVariant='contained'
                        name='chequeDate'
                        value={toMomentOrNull(formValues.chequeDate)}
                        onChange={(e, v) => {
                          handleChange({target: {name: 'chequeDate', value: e}})
                        }}
                        required
                        error={formErrors.chequeDate}
                        helperText={formErrors.chequeDate}
                        slotProps={{ textField: { variant: 'filled', required: true } }}
                      />
                    </LocalizationProvider>
                </Grid>
              )
            }

            <Grid size={12}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
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
                    lg: 6,
                    md: 6,
                    sm: 12,
                    xs: 12
                  }}>
                  <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} upload={formErrors.upload} amount={formValues.amount} />
                  </Grid>
                
              </Grid>
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

            {/*   
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
  
           
            container={true}
            direction='row'>
                  <Autocomplete
            value={formValues.expense }
            name='expense'
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFormValues({
                  ...formValues, expense: newValue
                })
               } else if (newValue && newValue.inputValue) {
                setFormValues({
                  ...formValues, expense: newValue.inputValue,
                });
                 ExpenseValue([...expenseValue, newValue.inputValue])
              } else if (newValue === null) {
                setFormValues({
                  ...formValues, expense: newValue
                })
              } else {
                setFormValues({
                  ...formValues, expense: newValue.expense
                })
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some((option) => inputValue === option.expense);
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  expense: `Add "${inputValue}"`,
                });
              }
              if (expenseValue.length) {
                expenseValue.forEach((data) => {
                  filtered.push({
                    inputValue: data,
                    expense: data,
                  });
                })

              }
              return filtered;
            }}
            id="free-solo-dialog-demo"
           // options={props.expense}
            // options={Array.from(
            //   new Set(props.expenses.map((a) => a.expense))
            // ).map((name) => {
            //   return props.expenses.find((a) => a.expense === name);
            // })}
            options={Array.from(new Set(dublicateexpense.map((a) => a.expense))).map(
              (name) => {
                return dublicateexpense.find((a) => a.expense === name);
              }
            )}
            // options = {props.expenses.filter((d) => (d.expense))}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.expense;
            }}
            fullWidth
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            // renderOption={(option) => option.expense}
            // renderOption={(props, option) => <li {...props}>{option.expense}</li>}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} onBlur={handleChange} label="expense" variant="outlined" error={formErrors.expense === null ? false : true} helperText={formErrors.expense === null ? '' : formErrors.expense} required={true} />
            )}
          />
           </Grid> */}
            {/* <FormControl required={true}
              error={formErrors.expense === null ? false : true}
              variant='outlined'
              component='fieldset'
              fullWidth={true}>
              <InputLabel>
                  Expenses
              </InputLabel>
              <Select style={{}}
                name='expense'
                label='Payment Mode'
                items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                required={false}
                onChange={handleChange}
                value={formValues.expense === null ? "" : formValues.expense}>
                  {props.chartOfAccounts?.map(d => <MenuItem value={d.id} key={d}>
                {d.name} 
              </MenuItem>)}
              </Select>
              <FormHelperText>
              {formErrors.expense}
            </FormHelperText>
            </FormControl> */}
            {/* <TextField onChange={handleChange}
              onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder=' Enter Expenses'
              label='Expenses'
              name='expense'
              color='primary'
              multiline={false}
              type='text'
              regex=''
              variant='standard'
              value={formValues.expense === null ? '' : formValues.expense}
              error={formErrors.expense === null ? false : true}
              helperText={formErrors.expense === null ? '' : formErrors.expense} /> */}

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            spacing={0}
            container={true}
            direction='row'
           
            >
            <TextField onChange={handleChange}
              onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder=' Enter Purpose'
              label='Purpose'
              name='purpose'
              color='primary'
              multiline={true}
              variant='outlined'
              rows={2}
              type='text'
              regex=''
              value={formValues.purpose === null ? '' : formValues.purpose}
              error={formErrors.purpose === null ? false : true}
              helperText={formErrors.purpose === null ? '' : formErrors.purpose} />
          </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            
            
           
          >

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              
              
             
            >
              <Button onClick={handleSubmit}
                        name='add'
                        size='medium'
                        text='button'
                        color='primary'
                        style={{}}
                        variant='contained'
                        fullWidth={false}>
                        Add Items
                      </Button>
            </Grid>
          </Grid> */}
          </Grid>
          <CancelDialog
            handle={cancel}
            delete={dialog}
            close={props.handleClose}
          ></CancelDialog>

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
                container
                display='flex'
                flexDirection='row'
                spacing={4}
              >
                <Grid
                  display='flex'
                  alignItems='center'
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <div>
                    <Button
                      onClick={handleTabdata}
                      name='add'
                      size='medium'
                      text='button'
                      color='primary'
                      style={{}}
                      variant='contained'
                      fullWidth={true}
                      sx={{width: 'max-content'}}
                    >
                      Submit
                    </Button>
                  </div>

                  <div style={{display: 'flex', padding: '0 10px'}}>
                    <Button
                      onClick={()=>props.handleClose()}
                      name='add'
                      size='medium'
                      text='button'
                      color='secondary'
                      style={{}}
                      sx={{width: 'max-content'}}
                      variant='contained'
                      fullWidth={true}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div style={{ display: 'flex', padding: '0 10px' }}>
                    {props.top3[single === '0' ? 'out' : 'in']
                      ?.filter((d) => !tabData.some((s1) => d.id === s1.id))
                      .map((d) => (
                        <Chip
                          key={d.id}
                          sx={{ m: '0 5px' }}
                          onClick={() => existingchipChange(d)}
                          label={`${d.ledgerName || ''} ₹ ${d.amount}`}
                        />
                      ))}
                  </div>
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                 
                >
                  <MaterialTable
                    options={{
                      showEmptyDataSourceMessage: false,
                      headerStyle,
                      cellStyle,
                      exportButton: true,
                      filtering: false,
                      maxBodyHeight: '60vh',
                      // pageSize: 20,
                      // pageSizeOptions: [ 20, 50, 100],
                      actionsColumnIndex: -1,
                      exportMenu: [
                        {
                          label: 'Export PDF',
                          exportFunc: (cols, datas) =>
                            ExportPdf(cols, datas, 'PayInData'),
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, datas) =>
                            ExportCsv(cols, datas, 'PayInData'),
                        },
                      ],
                    }}
                    columns={[
                      {
                        title: 'Date',
                        field: 'date',
                        render: (rowData) => (
                          commonDateFormat(rowData.date)
                        )
                      },
                      {
                        title: 'Payment Mode',
                        field: 'payName',
                      },
                      {
                        title: 'Ledger',
                        field: 'ledgerName',
                      },
                      {
                        title: 'Note',
                        field: 'reason',
                      },
                      {
                        title: 'Amount',
                        field: 'amount',
                        cellStyle: {
                          textAlign: 'right',
                          // paddingRight: '120px'
                        },
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
                        cellStyle: {
                          textAlign: 'center'
                        }
                      },
                    ]}
                    data={tabData}
                    title={<Typography variant='h6'>PayIn</Typography>}
                  />
                </Grid> */}
              </Grid>
            </Grid>
          ) : (
            ' '
          )}

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
              display='flex'
              flexDirection='row'
              justifyContent='flex-end'
            >
                  {props.status !== 'edit' ? (
                    <Grid
                      align='right'
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

                  {/* <Grid>
                    <Button
                      onClick={handleSubmit}
                      name='Submit'
                      size='medium'
                      text='button'
                      color='primary'
                      style={{}}
                      variant='contained'
                      fullWidth={false}
                      disabled={tabData.length === 0}
                    >
                      Submit
                    </Button>
              </Grid> */}
            </Grid>
          </Grid>
          <CancelDialog
            handle={cancel}
            delete={dialog}
            close={props.handleClose}
          ></CancelDialog>
        </>
      )}
      {
        single === '2' && (
          <>
            {openDenomination && (
              <DenominationDialog
                openDenomination={openDenomination}
                handleSubmit={setAmountDialogToState}
                responseType={'cashIn'}
                formValues={{...formValues}}
                setFormValues={setFormValues}
                setOpenDenomination={setOpenDenomination}
                currentTarget={currentTarget}
                setCurrentTarget={setCurrentTarget}
                validationHandler={validationHandler}
                total={formValues.amount}
              />
            )}

            <Contra
              date={props.reconciliateData ? props.reconciliateData.Date : formValues.date}
              cash_type={formValues.cash_type}
              status={props.status}
              mode={props.mode}
              editData={props.editData}
              edit_id_data={props.edit_id_data}
              handleClose={props.handleClose}
              contraSubmit={props.contraSubmit}
              top3={props.top3}
              type={props.type}
              // bankcreation={props.bankcreation}
              cashbox={props.cashbox}
              reconciliateData={props.reconciliateData}
              bankId={props.bankId}
            />
          </>
        )

        // <>
        //   {Prompt}
        //   {openDenomination&&<DenominationDialog  handleSubmit={setAmountDialogToState} setOpenDenomination={setOpenDenomination}/>}
        //   <Typography variant='h5'
        //     align='left'
        //     style={{ paddingTop: '15px' }}>
        //     Contra
        //   </Typography>

        //   <Grid
        //     style={{ paddingTop: '15px' }}
        //     spacing={2}
        //     container
        //     direction='row'
        //   >

        //     <Grid
        //       lg={4}
        //       md={4}
        //       sm={6}
        //       xs={12}
        //      
        //     >
        //       <FormControl required={true}
        //          error={contraerror.frombankname === null ? false : true}
        //         component='fieldset'
        //         fullWidth={true}>
        //         <InputLabel>
        //           From
        //         </InputLabel>
        //         <Select style={{}}
        //           name='frombankname'
        //           label='From Bank Name'
        //           items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
        //           required={false}
        //           onChange={handleChange}
        //           //defalutValue=''
        //           value={contraform.frombankname === null ? "" : contraform.frombankname}>
        //           {props.bankcreation?.map(d => <MenuItem value={d.bankAccountId} key={d}>
        //             {d.bankName}
        //           </MenuItem>)}
        //         </Select>
        //         <FormHelperText>
        //           {contraerror.frombankname}
        //         </FormHelperText>
        //       </FormControl>
        //     </Grid>

        //     <Grid
        //       spacing={0}
        //       lg={4}
        //       md={4}
        //       sm={6}
        //       xs={12}
        //      

        //     >
        //       <FormControl required={true}
        //         error={contraerror.tobankname === null ? false : true}
        //         component='fieldset'
        //         fullWidth={true}>
        //         <InputLabel>
        //           To
        //         </InputLabel>
        //         <Select style={{}}
        //           name='tobankname'
        //           label='To Bank Name'
        //           items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
        //           // required={false}
        //           onChange={handleChange}
        //           //defalutValue=''
        //           value={contraform.tobankname === null ? "" : contraform.tobankname}>
        //           {props.bankcreation?.map(d => <MenuItem value={d.bankAccountId} key={d}>
        //             {d.bankName}
        //           </MenuItem>)}
        //         </Select>
        //         <FormHelperText>
        //           {contraerror.tobankname}
        //         </FormHelperText>
        //       </FormControl>
        //     </Grid>
        //     <Grid
        //       spacing={0}
        //       lg={4}
        //       md={4}
        //       sm={6}
        //       xs={12}
        //      
        //     >
        //       <TextField onChange={handleChange}
        //       onBlur={handleChange}
        //       onClick={(e) => setOpenDenomination(true)}
        //       required={true}
        //       style={{}}
        //       fullWidth={true}
        //       placeholder=' Enter Amount'
        //       label='Amount'
        //       name='amount'
        //       color='primary'
        //       multiline={false}
        //       type='number'
        //       regex=''
        //       variant='standard'
        //       value={contraform.amount === null ? '' : contraform.amount}
        //       error={contraerror.amount === null ? false : true}
        //       helperText={contraerror.amount === null ? '' : contraerror.amount} />
        //     </Grid>

        //     <Grid
        //       lg={12}
        //       sm={12}
        //       md={12}
        //       xs={12}
        //      
        //       form={false}>
        //       <TextField onChange={handleChange}
        //       onBlur={handleChange}
        //       required={true}
        //       style={{}}
        //       fullWidth={true}
        //       placeholder='Note'
        //       label='Note'
        //       name='reason'
        //       color='primary'
        //       multiline={true}
        //       variant='outlined'
        //       rows={2}
        //       type='text'
        //       regex=''
        //       value={contraform.reason === null ? '' : contraform.reason}
        //       error={contraerror.reason === null ? false : true}
        //       helperText={contraerror.reason === null ? '' : contraerror.reason} />
        //     </Grid>
        //     </Grid>

        //   <Grid

        //     lg={6}
        //     md={4}
        //     sm={6}
        //     xs={12}

        //     style={{ paddingTop: '15px' }}
        //    
        //   >
        //     <Button onClick={handleTabcontra}
        //       name='add'
        //       size='large'
        //       text='button'
        //       color='primary'
        //       style={{}}
        //       variant='contained'
        //       fullWidth={false}>
        //       Add Items
        //     </Button>
        //     {/* <div style={{ display: 'flex', padding: '0 10px' }}>
        //             {props.top3[single === "0" ? 'out' : single === "1" ?'in' : 'contra']?.filter(d => !tabData.some(s1 => d.id === s1.id)).map(d => <Chip sx={{ m: '0 5px' }} onClick={() => chipChange(d)} label={`${d.ledgerName || ''} â‚¹ ${d.amount}`} />)}

        //           </div> */}
        //   </Grid>
        //   <br/>
        //                  <MaterialTable
        //                         options={{
        //                         exportButton: true,
        //                         filtering: false,
        //                         maxBodyHeight: '60vh',
        //                         actionsColumnIndex: -1
        //                         }}

        //                         columns={[
        //                           {
        //                             title: "Date", field: "date",
        //                            },
        //                              {
        //                               title: "From", field: "frombankname",
        //                              },
        //                             {
        //                               title: "To", field: "tobankname",
        //                             },
        //                             {
        //                               title : "Note" , field : "reason",
        //                             },
        //                             {
        //                               title : "Amount" , field : "amount",
        //                             },
        //                             // {
        //                             //   title : "Expenses" , field : "expense",
        //                             // },
        //                             // {
        //                             //   title : "Purpose" , field : "purpose",
        //                             // },
        //                             {
        //                               title : "Cash Type" , field : "cash_type",
        //                             },

        //                         ]}

        //                         data={tabData }

        //                         title="Contra"
        //                     />

        // </>
      }
      <LocationAlert open={openAlert} onClose = {()=> setOpenAlert(false)}/>
      <Dialog
        open={ledgerCreateOpen}
           maxWidth="md"
        handleClose={() => setLedgerCreateOpen(false)}
      >
        <Card sx={{ m: 3, p: 2 }}>
          <Grid container>
            <Grid size={12}>
              <NewLedger
                handleClose={() => setLedgerCreateOpen(false)}
                handleSubmit={ledgerSubmit}
                ledgerStatus={status}
              />
            </Grid>
          </Grid>
        </Card>
      </Dialog>
    </Card>
  );
}

export default NewCashOutIn;

