import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
//import context from '../context/CreateNewButtonContext'
// import { ThemeProvider } from '@mui/material/styles';
// import {formLabelsTheme} from "./Asterisk";
import { getCurrentFinancialYear, getDateTimeFormat } from 'utils/getTimeFormat';
import {
  Button,
  TextField,
  Grid,
  Typography,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
} from '@mui/material';
// import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {getTrimmedData} from './trimFunction/index';
import _ from 'lodash';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { getAccountGroupAction, listAllParentLedgerAction } from 'redux/actions/ledger_actions';
import { getCreditDebitHintAction } from 'redux/actions/cash_box_actions';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CommonDialog from './commonDialog';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getSchemesLedgerParentAction } from 'redux/actions/manualNotes_actions';
import toMomentOrNull from 'utils/DateFixer';

const financialYear = getCurrentFinancialYear()
function NewLedger(props) {
  // console.log("999999",props)
  // const [TableData, setTableData] = useState({ id: '' })
  
// const today = moment(financialYear.fromDate).add(1, 'day');
// const lastday = moment().set('month', 3).set('date', 1).set('year', financialYear.fromDate.slice(-4))
const lastday = moment(financialYear.fromDate).startOf('month')
const today = moment();
const dayaftertomorrow =  moment().add(2, 'day');
  
  const startdate = financialYear.fromDate
  const minDate = moment(); // Minimum date is today
  const maxDate = moment().add(1, 'year'); // Maximum date is one year from today
  const [formValues, setFormValues] = useState({
    name: '',
    accountCode: '',
    accountGroup: '',
    parentAccountId: '',
    description: null,
    credit: '',
    debit: '',
    trans_date: null,
    creationType: 'Child'
   // trans_date: moment(new Date().getDate(),'dd/MM/yyyy')

  }); //,account : null ,debit : null , credit : null ,description : null

  const [formErrors, setFormErrors] = useState({
    name: null,
    accountCode: null,
    accountGroup: null,
    parentAccountId: null,
    description: null,
    credit: null,
    debit: null,
  }); //, account : null ,debit : null , credit : null ,description : null
  const [requiredFields, setRequiredFields] = useState(['name', 'parentAccountId', 'description' ]); //,"account","debit","credit","description"
  // const [transData, setTransData] = useState([])
  // const [current_item_id,setCurrent_Item_ID] = useState('')
  const [regex] = useState({});
  // const { setModalStatusHandler, setModalTypeHandler, modalStatus, selectData, setselectData } = useContext(context)
  // const [value, setValue] = React.useState([]);
  // const [data, setData] = useState([
  //   // { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
  //   // { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
  // ]);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  // const [ledgerValue, setLedgerValue] = useState([]);
  // const { chartOfAccounts } = props;
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const tempinitsformVal = useRef(null);
  const [ledgerOverWriteOpen, setLedgerOverWriteOpen] = useState(false);
  const [activeBalanceHint, setActiveBalanceHint] = useState('');
  const oldValues = useRef({credit:null, debit:null, balance: null, trans_date: null})

  const dispatch = useDispatch()

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId
} = useContext(CreateNewButtonContext);

  const { ledgerReducer: { all_parent_ledger, accountGroup, ledger_parent_group_list, },manualNoteReducer: { schemesLedgerParent }, cashBoxReducer: { cashboxCreditDebitHint } } = useSelector((state) => state);
  const parentAccounts = (props.from === 'D' || props.from === 'C') ? schemesLedgerParent : all_parent_ledger;
  const selectedParentAccount = parentAccounts.find((account) => account.id === formValues.parentAccountId) || null;
  const disableOpeningBalanceForParent = ['sundry debtors', 'sundry creditors']
    .includes((selectedParentAccount?.name || '').trim().toLowerCase());
  const hasHintSource = (formValues.creationType === 'Child' && formValues.parentAccountId)
    || (formValues.creationType === 'Parent' && formValues.accountGroup);
  const ledgerAccountRule = hasHintSource && cashboxCreditDebitHint?.increaseOn && cashboxCreditDebitHint?.decreaseOn
    ? cashboxCreditDebitHint
    : null;
  const creditHintText = ledgerAccountRule
    ? `Hint: Credit will ${ledgerAccountRule.increaseOn === 'credit' ? 'increase' : 'decrease'} Ledger balance.`
    : `Hint: Select ${formValues.creationType === 'Parent' ? 'Account Group' : 'Parent Account'} to view sign-based credit effect.`;
  const debitHintText = ledgerAccountRule
    ? `Hint: Debit will ${ledgerAccountRule.increaseOn === 'debit' ? 'increase' : 'decrease'} Ledger balance.`
    : `Hint: Select ${formValues.creationType === 'Parent' ? 'Account Group' : 'Parent Account'} to view sign-based debit effect.`;

  // useEffect(() => {
  //   if(formValues.parentAccountId) {
  // const accounts = props.ledger_parent_group_list.find(d => d.id === formValues.parentAccountId ) || {}
  // setFormValues({...formValues,accountGroup:accounts.accountGroup[0]?.name,accountCode: accounts.accountCode})

  //   }
  // },[formValues.parentAccountId, props.ledger_parent_group_list])

  // console.log("schemesLedgerParent",schemesLedgerParent)
  const initsformVal = () => {
    const accounts =
      ledger_parent_group_list.find(
        (d) => d.id === formValues.parentAccountId,
      ) || {};
    setFormValues({...formValues, accountGroup: accounts.accountGroup});
  };
  
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    if (formValues.parentAccountId) {
      tempinitsformVal.current();
    }
  }, [formValues.parentAccountId, ledger_parent_group_list]);

  useEffect(() => {
    if (formValues.creationType === 'Child' && formValues.parentAccountId) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getCreditDebitHintAction({ ledger_id: formValues.parentAccountId }))
      );
      return;
    }

    if (formValues.creationType === 'Parent' && formValues.accountGroup) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getCreditDebitHintAction({ account_group_id: formValues.accountGroup }))
      );
    }
  }, [formValues.creationType, formValues.parentAccountId, formValues.accountGroup]);

  useEffect(() => {
    if (props.ledger_list) {
      // setFormValues(props.ledger_list)
    }
  }, [props.ledger_list]);

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;

  useEffect(() => { (async () => {

    if (props.from === 'D') {
      const fetchData = async () => {
        let data = { type : 'Debit'}
        await Promise.all([
          dispatch(getSchemesLedgerParentAction(data)),
          dispatch(getAccountGroupAction())
        ]);
        tempinitsform.current();
      };

      fetchData();
    }
    else if (props.from === 'C') {
      const fetchData = async () => {
        let data = { type : 'Credit'}
        await Promise.all([
          dispatch(getSchemesLedgerParentAction(data)),
          dispatch(getAccountGroupAction())
        ]);
        tempinitsform.current();
      };

      fetchData();
    }
    else {
      const fetchData = async () => {
        await Promise.all([
          dispatch(listAllParentLedgerAction()),
          dispatch(getAccountGroupAction())
        ]);
        tempinitsform.current();
      };

      fetchData();
    }

  })();
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
    if(name === 'creationType'){
      if(value === 'Parent'){
        setRequiredFields(['name', 'accountGroup', 'description' ])
      }
      else{
        setRequiredFields(['name', 'parentAccountId', 'description' ])
      }
    }
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  // const filterOptions = createFilterOptions({
  //   stringify: (option) => JSON.stringify(option.opt = option.accountCode + " " + option.name),
  //   // option.opt = `${option.accountCode + " " + option.name}`),
  //   // const opt = option.account_number + option.name;
  // });

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
console.log(formValues,"formmmmm")
  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};
    //     if(headerLocationId === 'null'){
    //   alert('Please Select Location')
    // }else{
      console.log(props.status,'propsstatussss',props.ledgerStatus)
    if (props.status === 'create' || props.ledgerStatus === 'create') {
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
    }
    await setFormErrors(formErrorsObj);

    // await setFormValues({...formValues,"transData":transData||[].map(m =>{
    //   const {tableData,...rest} = m
    //      return rest}),
    //   "transData":transData})
    //  await setTableData('')
    if (props.status === 'edit') {
      const accounts =
        ledger_parent_group_list.find(
          (d) => d.id === formValues.parentAccountId,
        ) || {};

      const account_group = accounts.accountGroup;
      const {
        accountCode,
        name,
        accountGroup = account_group,
        parentAccountId,
        description,
        id,
        trans_date,
        credit,
        debit,
      } = formValues;
      const data = {
        accountCode: accountCode,
        name: name,
        accountGroup,
        parentAccountId: parentAccountId,
        description: description,
        id: id,
        trans_date,
        credit,
        debit,
        location_id: headerLocationId,
        opening_balance: !debit ? parseFloat(credit) * -1 : parseFloat(debit) * +1,
        isValueChanged: oldValues.current.debit != formValues.debit || oldValues.current.credit != formValues.credit,
        parentAccountName: (props.from === 'D' || props.from === 'C' ) ?  schemesLedgerParent.find(f=>f.id === formValues.parentAccountId)?.name  :  all_parent_ledger.find(f=>f.id === formValues.parentAccountId)?.name ?? null,
        oldAmount: oldValues.current,
      };
      // data.accountTransaction = transData.map(m => {
      //   var each = { ...m }
      //   delete each.name;
      //   delete each.accountCode;
      //   const {  accountId, description, amount, id } = each //id
      //   return { accountId, description, amount, id }
      // })//id
      if (isValid) {
        props.handleSubmit(getTrimmedData(data));
      }
    } else {
      const {name, accountGroup, parentAccountId, description, id, trans_date, credit, debit, creationType} = formValues;
      const data = {
        name: name,
        accountGroup: creationType === 'Parent' ? accountGroup : null,
        parentAccountId: creationType === 'Parent' ?null : parentAccountId,
        description: description,
        id: id,
        type: 'Ledger creation',
        trans_date,
        credit,
        debit,
        location_id : headerLocationId,
        opening_balance: !debit  ? parseFloat(credit) * -1 : parseFloat(debit) * +1,
        isValueChanged: oldValues.current.debit != formValues.debit || oldValues.current.credit != formValues.credit,
        parentAccountName: (props.from === 'D' || props.from === 'C' ) ?  schemesLedgerParent.find(f=>f.id === formValues.parentAccountId)?.name : all_parent_ledger.find(f=>f.id === formValues.parentAccountId)?.name ?? null,
        oldAmount: oldValues.current,
        creationType
      };
      // data.accountTransaction = transData.map(m => {
      //   var each = { ...m }
      //   delete each.name;
      //   delete each.accountCode;
      //   const {  accountId, description, amount, id } = each //id
      //   return { accountId, description, amount, id }
      // })//id
      if (isValid) {
        props.handleSubmit(getTrimmedData(data));
      }
      else{
        dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      }
    }
  // }
  };

  const normalizeDate = (value) => {
    const m = toMomentOrNull(value);
    return m ? m.format('YYYY-MM-DD') : null;
  };

  const shouldOpenOverwriteDialog = () => {
    if (props.status !== 'edit' || props.edit_id_data?.[0]?.isOpeningBalTransAvailable !== true) {
      return false;
    }

    const amountChanged = oldValues.current.debit != formValues.debit || oldValues.current.credit != formValues.credit;
    const dateChanged = normalizeDate(formValues.trans_date) !== normalizeDate(oldValues.current.trans_date);

    return amountChanged || dateChanged;
  };

  const edits = () => {
    if (props.edit_id_data?.[0] && props.status === 'edit') {
      const existingTransDate = props.edit_id_data[0]?.trans_date || props.edit_id_data[0]?.firstTransDate || null;

      oldValues.current.credit = props.edit_id_data[0].credit;
      oldValues.current.debit = props.edit_id_data[0].debit;
      oldValues.current.balance = props.edit_id_data[0].balance;
      oldValues.current.trans_date = existingTransDate;

      setFormValues({
        ...props.edit_id_data[0],
        trans_date: existingTransDate,
        creationType: props.edit_id_data[0]?.parentAccountId === null ? 'Parent' : 'Child'
      });
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data?.[0]]);
  
console.log(formValues.creationType, props.edit_id_data, 'cvhrgvhyrh')
  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto' }}>
    {Prompt}
    <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
      {props.status === 'create' || props.ledgerStatus === 'create'
        ? 'New Ledger'
        : ` Update Ledger - ${formValues.accountCode}`}
    </Typography>
    {/* <Grid
      spacing={3}
      // lg={12}
      // md={12}
      // sm={12}
      // xs={12}
      //
      direction='row'
      container
    > */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}  
       
        container={true}
        
        >
        <TextField onChange={handleChange}
          onBlur={handleChange}
          //required={true}
          style={{}}
          fullWidth={true}
          placeholder='Enter Ledger Number'
          label='Ledger Number'
          name='ledger_number'
          value={formValues.ledger_number === null ? '' : formValues.ledger_number}
          color='primary'
          multiline={false}
          type='text'
          regex=''
          variant='standard'
         // error={formErrors.code === null ? false : true}
        //  helperText={formErrors.code === null ? '' : formErrors.code}
           />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}          
       
        container={true}
        
        >
        <TextField onChange={handleChange}
          onBlur={handleChange}
          //required={true}
          style={{}}
          fullWidth={true}
          placeholder='Enter Ledger Name'
          label='Ledger Name'
          name='ledger_name'
          value={formValues.ledger_name === null ? '' : formValues.ledger_name}
          color='primary'
          multiline={false}
          type='text'
          regex=''
          variant='standard'
         // error={formErrors.code === null ? false : true}
        //  helperText={formErrors.code === null ? '' : formErrors.code}
           />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}   
       
        container={true}
        
        >
         <TextField onChange={handleChange}
          onBlur={handleChange}
          //required={true}
          style={{}}
          fullWidth={true}
          placeholder='Enter AccountGroup'
          label='AccountGroup'
          name='accountGroup'
          value={formValues.accountGroup === null ? '' : formValues.accountGroup}
          color='primary'
          multiline={false}
          type='text'
          regex=''
          variant='standard'
         // error={formErrors.code === null ? false : true}
        //  helperText={formErrors.code === null ? '' : formErrors.code}
           />
       
      </Grid> */}

      {/* <Grid spacing={3} container direction='row'> */}
        {
          (props.status !== 'edit' && props.ledgerStatus !== 'create') &&
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <FormControl component='fieldset'>
              <RadioGroup
                row
                value={formValues.creationType}
                name='creationType'
                onChange={handleChange}
              >
                <FormControlLabel value='Child' control={<Radio />} label='Ledger' />
                <FormControlLabel value='Parent' control={<Radio />} label='Parent Ledger' />
              </RadioGroup>
            </FormControl>
          </Grid>
        }

          <Grid container spacing={3}>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          {/* <FormControl
          sx={{height:'100px'}}
            fullWidth
            error={formErrors.parentAccountId === null ? false : true}
            required={true}
            variant='outlined'
            component='fieldset'
          >
            <InputLabel id='demo-simple-select-label'>
              ParentAccountId
            </InputLabel>
            <Select
              name='parentAccountId'
              // labelId="ParentAccountId"
              id='ParentAccountId'
              label='parentAccountId'
              required={true}
              value={
                formValues.parentAccountId === null
                  ? ''
                  : formValues.parentAccountId
              }
              onChange={handleChange}
            >
              {<div style={{height:360}}>
               { all_parent_ledger.map((d) =>(
                <>
                  <MenuItem  value={d.id} key={d.id}>
                    {d.name}
                  </MenuItem>
                  </>
                ))}</div>}
            </Select>
            <FormHelperText>{formErrors.parentAccountId}</FormHelperText>
          </FormControl> */}
              {
                formValues.creationType === 'Child' &&
                <Autocomplete
                  value={
                    formValues.parentAccountId
                      ? selectedParentAccount
                      : { name: '' }
                  }
                  name='parentAccountId'
                  disabled={props.status === 'edit' && props.edit_id_data?.[0]?.isTransactionAvailable}
                  fullWidth={true}
                  onChange={(event, newValue) => {
                    handleChange({ target: { name: 'parentAccountId', value: newValue?.id || null } })
                  }}
                  options={
                    _.uniqBy(
                      parentAccounts,
                      'name'
                    )
                  }
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params}
                    variant='filled'
                    error={formErrors.parentAccountId === null ? false : true}
                    helperText={formErrors.parentAccountId === null ? '' : 'Parent Account Id is Required!'}
                    label='Parent Account Id'
                    required={true} />
                  }
                />
              }
          {
            formValues.creationType === 'Parent' && 
              <Autocomplete
                value={formValues.accountGroup ? accountGroup.find(f=>f.id === formValues.accountGroup) || null : {name:''}}
                name='accountGroup'
                disabled={props.status === 'edit' && props.edit_id_data?.[0]?.isTransactionAvailable}
                fullWidth={true}
                onChange={(event, newValue) => {
                    handleChange({target : {name : 'accountGroup' , value : newValue.id}})
                }}
                options={_.uniqBy(accountGroup,'id')}
                getOptionLabel={(option) => option.name}                
                renderInput={(params) => <TextField {...params}
                  variant='filled'
                  error={formErrors.accountGroup === null ? false : true} 
                  helperText={formErrors.accountGroup === null ? '' : 'Account Group is Required!'}
                  label='Account Group'
                  required={true} />
                }
              />
          }
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
         

        >

          <TextField onChange={handleChange}
            onBlur={handleChange}
            //required={true}
            style={{}}
            fullWidth={true}
            placeholder='Enter AccountGroup'
            label='AccountGroup'
            name='accountGroup'
            value={formValues.accountGroup === null ? '' : formValues.accountGroup}
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'

          />

        </Grid> */}

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}  
       
        container={true}
        
        >
        <TextField onChange={handleChange}
          onBlur={handleChange}
          //required={true}
          style={{}}
          fullWidth={true}
          placeholder='Enter Ledger Number'
          label='Ledger Number'
          name='ledger_number'
          // value={formValues.ledger_number === null ? '' : formValues.ledger_number}
          value={props.stock_ledger_list[0]?.sequence_pattern}
          color='primary'
          multiline={false}
          type='text'
          regex=''
          variant='standard'
         // error={formErrors.code === null ? false : true}
        //  helperText={formErrors.code === null ? '' : formErrors.code}
           />
      </Grid> */}

        <Grid
          size={{
            lg: 4,
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
            placeholder={formValues.creationType === 'Parent' ? 'Enter Parent Ledger' : 'Enter Ledger Name'}
            label={formValues.creationType === 'Parent' ? 'Parent Ledger' : 'Ledger Name'}
            name='name'
            value={formValues.name === null ? '' : formValues.name}
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            error={formErrors.name === null ? false : true}
            helperText={formErrors.name === null ? '' : formErrors.name}
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
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Enter Note'
            label='Description'
            name='description'
            value={
              formValues.description === null ? '' : formValues.description
            }
            color='primary'
            multiline={true}
            type='text'
            regex=''
            variant='filled'
            error={formErrors.description === null ? false : true}
            helperText={
              formErrors.description === null ? '' : formErrors.description
            }
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
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            onBlur={(e) => { handleChange(e); setActiveBalanceHint(''); }}
            disabled={disableOpeningBalanceForParent || !!formValues.debit}
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
            lg: 4,
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
            disabled={disableOpeningBalanceForParent || !!formValues.credit}
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
                      lg: 4,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                name='trans_date'
                label="Date"
                 minDate={lastday}
                 maxDate={props.edit_id_data?.[0]?.isTransactionAvailable === true ? moment(props.edit_id_data?.[0]?.firstTransDate) : today}
                 format='DD/MM/YYYY'
                 disabled={disableOpeningBalanceForParent || ((formValues.debit || formValues.credit) ? false : true)}
                // minDate={tomorrow}
                // maxDate={dayaftertomorrow}
                // defaultValue = {today}
                value={toMomentOrNull(formValues.trans_date)}
                views={['year', 'month', 'day']}
                onChange={(dates) =>{
                  handleChange({
                    target: {value: getDateTimeFormat(dates?.toDate()), name: 'trans_date'},
                  })
                }
                }
                fullWidth={true}
                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
              />
            </LocalizationProvider>
        </Grid>
        </Grid>

        <Grid
          size={{
            lg: props.ledgerStatus === 'create' ? 0 : 2,
            md: props.ledgerStatus === 'create' ? 0 : 2,
            sm: props.ledgerStatus === 'create' ? 0 : 2,
            xs: props.ledgerStatus === 'create' ? 0 : 2
          }}>
        </Grid>
      {/* </Grid> */}
      <br />

      <Grid
        style={{paddingTop: '25px'}}
      >
        <Grid spacing={7} container direction='row' display= 'flex' justifyContent= 'flex-end'>
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
                  onClick={async (e) => {
                    if(shouldOpenOverwriteDialog()){
                      setLedgerOverWriteOpen(true);
                      return;
                    }

                    await handleSubmit(e);
                  }}
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

            {/* <Grid
              lg={6}
              md={6}
              sm={6}
              xs={6}
             
              // style={{marginBottom:'10px'}}
            ></Grid> */}
      </Grid>
    {/* </Grid> */}
    <CancelDialog
      handle={cancel}
      delete={dialog}
      close={props.handleClose}
    ></CancelDialog>
    <CommonDialog
      cancel_buttonName = {'No'}
      ok_buttonName = {'Yes'}
      dialogTitle = {'Opening Balance transaction is already there.'}
      dialogContent = {`Do you want delete previous opening balance transaction and create new ?`}
      cancel_fun = {() => {
        setLedgerOverWriteOpen(false)
      }}
      ok_fun = {handleSubmit}
      open={ledgerOverWriteOpen}
      handleClose={() => setLedgerOverWriteOpen(false)}
    />
    </Card>
    </>
  );
}

export default NewLedger;

