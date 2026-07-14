// import React, {useState, useEffect, useRef} from 'react';
// import UnSavedChangesWarning from '../pages/common/unChangeswarning';
// import CancelDialog from './CancelDialog';
// // import {formLabelsTheme} from "./Asterisk";
// import {
//   Button,
//   Typography,
//   TextField,
//   Grid,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormControl,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormHelperText,
// } from '@mui/material';
// // import { useTheme } from '@emotion/react';
// import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
// import MaterialTable from 'utils/SafeMaterialTable';
// import DenominationDialog from '../pages/accounts/cashOutIn/DenominationDialog';
// import _ from 'lodash';
// // import { useDispatch, useSelector } from 'react-redux';
// import {getTrimmedData} from './trimFunction/index';
// import Chip from '@mui/material/Chip';
// import listBankCreationAction from '../redux/actions/bankCreation_actions';
// import {useSelector, useDispatch} from 'react-redux';
// import {DatePicker, LocalizationProvider} from '@mui/lab';
// import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
// import moment from 'moment';
// import Contra from './contra';
// import {
//   getDateTimeFormat,
//   getDateFormat,
//   yyyymmdd_ddmmyyyy,
// } from '../../src/utils/getTimeFormat';
// import {ExportCsv, ExportPdf} from '@material-table/exporters';
// import Box from '@mui/material/Box';

// function NewCashOutIn(props) {
//   const [formValues, setFormValues] = useState({
//     expense: null,
//     ledger_id: null,
//     reason: null,
//     amount: null,
//     payment_id: null,
//     cashboxId: null,
//     activeChip: null,
//     cash_type: null,
//     date: getDateFormat(new Date()),
//     location_id: null,
//   });
//   const [ledger_name, setLedgerName] = useState(null);
//   const [formErrors, setFormErrors] = useState({
//     expense: null,
//     ledger_id: null,
//     reason: null,
//     amount: null,
//     payment_id: null,
//     date: null,
//   });
//   const [requiredFields] = useState([
//     'ledger_id',
//     'reason',
//     'amount',
//     'payment_id',
//   ]);
//   const [regex] = useState({});
//   const [Prompt] = UnSavedChangesWarning();
//   // const [initialState, setInitialState] = useState({})
//   const [dialog, setDialog] = useState(false);
//   const [form, setForm] = useState(false);
//   const [formval, setFormVal] = useState({ledgerVal: null});
//   const [single, setsingle] = useState('0');
//   const [tabData, setTabData] = useState([]);
//   const [activeChip, setActiveChip] = useState('cash');
//   const {chartOfAccounts, expenses} = props;
//   const tempinitsform = useRef(null);
//   const tempinits = useRef(null);
//   const tempedits = useRef(null);
//   const AmountRef = useRef(null);
//   const [openDenomination, setOpenDenomination] = useState(false);
//   const [currentTarget, setCurrentTarget] = useState('Tendered');
//   const [expenseValue, ExpenseValue] = React.useState([]);
//   const dublicateexpense = props.expense?.filter((d) => d.expense) || [];
//   const dispatch = useDispatch();
//   const [locationId, setLocationId] = useState('');

//   // const filter = createFilterOptions();
//   // const dispatch = useDispatch()

//   // const {  CashOutInReducer: { expenses }, } = useSelector(state => state)

//   // const top100Films = [
//   //   { label: 'The Shawshank Redemption', year: 1994 },
//   //   { label: 'The Godfather', year: 1972 },
//   // ]

//   //   const initsform = () =>{
//   //     setInitialState(formValues);
//   //   }
//   //   tempinitsform.current = initsform
//   //   useEffect(() => {
//   //     tempinitsform.current();
//   //   }, [])

//   //  const inits = () =>{
//   //   if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
//   //     setDirty();
//   //     setForm(true)
//   //   }
//   //   else {
//   //     setPristine();
//   //     setForm(false)
//   //   }
//   //  }
//   //  tempinits.current =inits
//   //   useEffect(() => {
//   //     tempinits.current();
//   //   }, [formValues, initialState])

//   const handleChange = async (e) => {
//     let {name, value} = e.target;
//     setStateHandler(name, value);
//   };

//   const cancel = () => {
//     setDialog(false);
//   };

//   const validClose = () => {
//     setDialog(true);
//   };

//   const filter = createFilterOptions();

//   const setStateHandler = async (name, value) => {
//     let formObj = {};
//     if (name === 'ledger_id') {
//       const ledgerName = props.chartOfAccounts.find((d) => d.id === value).name;
//       formObj = {
//         ...formValues,
//         [name]: value === '' ? null : value,
//         ledgerName,
//       };
//     }
//     // else if (name === 'date') {
//     //   if(value === "null"){
//     //     const newDate = getDateFormat(new Date())
//     //     formObj = {
//     //       ...formValues,
//     //       [name]: value === '' ? null : value, newDate
//     //     };
//     //   }

//     // }
//     // else if (name === 'amount') {
//     //   const cashBoxData = props.cash_box_list.filter(f => f.id === formValues.cashboxId)
//     //   if(cashBoxData.length>0){
//     //     const AlertCashBox = cashBoxData[0].current_balance < 0
//     //     alert("Amount balance is less then 0 !!!!")
//     //   }
//     // }
//     else if (name === 'payment_id') {
//       if (activeChip !== 'cash') {
//         const paymentData = props.paymentMethod.find(
//           (d) => d.paymentId === value,
//         );
//         const locationValue = props.bank_creation_adjustment_list.find(
//           (d) => d.bankAccountId === paymentData.bankAccountId,
//         );
//         const payName = paymentData.paymentName;
//         setLocationId(locationValue.location_id);

//         formObj = {
//           ...formValues,
//           [name]: value === '' ? null : value,
//           payName,
//         };
//       } else if (activeChip === 'cash') {
//         const paymentData = props.cash_box_adjustment_list.find(
//           (d) => d.id === value,
//         );
//         const payName = paymentData.name;
//         setLocationId(paymentData.location_id);
//         formObj = {
//           // ...contraform,
//           ...formValues,
//           [name]: value === '' ? null : value,
//           payName,
//         };
//       }
//     }
//     // else if (name === 'bankAccountId') {
//     //   const bank = props.bankcreation.find((d) => d.bankAccountId === value).bankName
//     //   formObj = {
//     //     ...contraform,
//     //     [name]: value === '' ? null : value, bank
//     //   };
//     // }
//     else {
//       formObj = {
//         ...formValues,
//         [name]: value === '' ? null : value,
//       };
//     }

//     await setFormValues(formObj);
//     validationHandler(name, value);
//   };

//   const validationHandler = (name, value) => {
//     if (!Object.keys(formErrors).includes(name)) return;

//     if (
//       requiredFields.includes(name) &&
//       (value === null ||
//         value === 'null' ||
//         value === '' ||
//         value === false ||
//         (Object.keys(value) && value.value === null))
//     ) {
//       setFormErrors({
//         ...formErrors,
//         [name]: capitalize(name) + ' is Required!',
//       });
//     } else if (regex[name]) {
//       if (!regex[name].test(value)) {
//         setFormErrors({
//           ...formErrors,
//           [name]: capitalize(name) + ' is Invalid!',
//         });
//       } else {
//         setFormErrors({
//           ...formErrors,
//           [name]: null,
//         });
//       }
//     } else {
//       setFormErrors({
//         ...formErrors,
//         [name]: null,
//       });
//     }
//   };

//   const Change = (e) => {
//     let {value} = e.target;
//     setsingle(value);
//   };

//   const capitalize = (s) => {
//     if (typeof s !== 'string') return '';
//     return s.charAt(0).toUpperCase() + s.slice(1);
//   };

//   const handleTabdata = async (event) => {
//     let isValid = true;
//     let formErrorsObj = {...formErrors};
//     await Object.keys(formValues).map((key, i) => {
//       if (
//         requiredFields.includes(key) &&
//         (formValues[key] === null || formValues[key] === '')
//       ) {
//         isValid = false;
//         formErrorsObj[key] = capitalize(key) + ' is Required!';
//       } else if (regex[key]) {
//         if (!regex[key].test(formValues[key])) {
//           isValid = false;
//           formErrorsObj[key] = capitalize(key) + ' is Invalid!';
//         }
//       }
//       return null;
//     });
//     await setFormErrors(formErrorsObj);

//     if (isValid) {
//       formValues.cash_type =
//         single === '1' ? 'IN' : single === '0' ? 'OUT' : 'CONTRA';
//       formValues.activeChip = activeChip;
//       formValues.location_id = locationId;
//       if (activeChip === 'cash') {
//         formValues.cashboxId = formValues.payment_id;
//         formValues.payment_id = null;
//       } else {
//         formValues.cashboxId = null;
//       }
//       //  formValues.date = moment(formValues.date, "year", "month", "day").format( "yyyy-MM-DD")
//       // formValues.date = yyyymmdd_ddmmyyyy(formValues.date)
//       // formValues.date = formValues.date  // || getDateFormat(new Date())
//       setTabData([...tabData, formValues]);
//       setFormValues({
//         ledger_id: '',
//         reason: '',
//         amount: '',
//         payment_id: '',
//         cashboxId: '',
//         cash_type: '',
//         activeChip: '',
//         location_id: '',
//         date: formValues.date,
//       });
//     }
//   };

//   const keyboard = (val, tendered) => {
//     setOpenDenominationDialog(false);
//     const {cash_box_id,cashboxLedgerId} = normalCashBoxInfo
//     const getData = [...Tdata];
//     if (!getData[index]) return;
//     getData[index].payment_amount = val;
//     getData[index].tendered = tendered;

//     // if(cash_box_id !== null && cashboxLedgerId !== null){
//     //   getData[index].cash_box_id = cash_box_id
//     //   getData[index].cashboxLedgerId = cashboxLedgerId
//     // }
    

//     let cindex = [];

//     const getAmount = getData.reduce(function (acc, obj, i) {
//       if (!+obj.payment_amount) {
//         cindex.push(i);
//       }
//       return acc + +obj.payment_amount;
//     }, 0);
//     if (getAmount > total) {
//       setOpenDenominationDialog(true);
//       setCurrrentTarget('Change');
//     }
//     change(setDefault(getData, getAmount, cindex), getAmount);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (props.status === 'edit') {
//       let isValid = true;
//       let formErrorsObj = {...formErrors};
//       await Object.keys(formValues).map((key, i) => {
//         if (
//           requiredFields.includes(key) &&
//           (formValues[key] === null || formValues[key] === '')
//         ) {
//           isValid = false;
//           formErrorsObj[key] = capitalize(key) + ' is Required!';
//         } else if (regex[key]) {
//           if (!regex[key].test(formValues[key])) {
//             isValid = false;
//             formErrorsObj[key] = capitalize(key) + ' is Invalid!';
//           }
//         }
//         return null;
//       });
//       await setFormErrors(formErrorsObj);

//       // alert("Is Form Valid - " + isValid);

//       // API call..
//       if (isValid) {
//         const cash_type = single === '0' ? 'OUT' : 'IN';
//         // formValues.cash_type = single === 'false' ? 'OUT' :'IN'
//         if (activeChip === 'cash') {
//           setFormValues({
//             ...formValues,
//             cash_type: cash_type,
//             activeChip: activeChip,
//             cashboxId: formValues.payment_id,
//             location_id: locationId,
//           });
//           props.handleSubmit(getTrimmedData(formValues));
//         } else {
//           setFormValues({
//             ...formValues,
//             cash_type: cash_type,
//             activeChip: activeChip,
//             payment_id: null,
//             location_id: locationId,
//           });
//           props.handleSubmit(getTrimmedData(formValues));
//         }
//       }
//     } else {
//       const dat = tabData.map((d) => {
//         delete d.ledgerName;
//         delete d.payName;
//         return d;
//       });
//       props.handleSubmit(dat);
//     }
//     // }
//   };
//   const edits = () => {
//     if (props.edit_id_data[0] && props.status === 'edit') {
//       let ID_data = props.edit_id_data;
//       var obj = ID_data;
//       for (let key of Object.keys(obj)) {
//         var value = obj[key];

//         setFormValues(value);
//         // setInitialState(value)
//         setsingle(value.cash_type !== 'IN' ? 'false' : 'true');

//       }
//     }
//   };
//   tempedits.current = edits;
//   useEffect(() => {
//     tempedits.current();
//   }, [props.edit_id_data]);

//   useEffect(() => {
//     setActiveChip('cash');
//   }, [props.cash_box_adjustment_list]);

//   const setAmountDialogToState = (Amount) => {
//     if (typeof Amount !== 'undefined') {
//       setFormValues({...formValues, amount: Amount});
//       setOpenDenomination(false);
//       setStateHandler('amount', Amount);
//     } else {
//       setOpenDenomination(false);
//     }
//   };

//   const chipChange = (data) => {
//     setFormValues({...formValues, amount: null});
//     setActiveChip(data);
//     // setTabData([...tabData, data])
//   };

//   const cashDenominationChange = (name) => {
//     setOpenDenomination(true);
//     setCurrentTarget(name);
//   }

//   const dublicate = chartOfAccounts?.filter((d) => d.name);
//   //_.uniqBy(props.bank_creation_adjustment_list,"bankName")
//   return (
//     <>
//       <div
//         style={{
//           border: '2px solid grey',
//           borderRadius: '10px',
//           justifyContent: 'center',
//           display: 'flex',
//         }}
//       >
//         <FormControl component='fieldset'>
//           <RadioGroup
//             row
//             aria-label='customer'
//             value={single}
//             name='cash_type'
//             onChange={Change}
//           >
//             <FormControlLabel value='0' control={<Radio />} label='PayOut' />
//             <FormControlLabel value='1' control={<Radio />} label='PayIn' />
//             <FormControlLabel value='2' control={<Radio />} label='Contra' />
//           </RadioGroup>
//         </FormControl>
//       </div>
//       <Grid container style={{marginTop: '25px'}}>
//         <Grid
//           item
//           lg={12}
//           md={12}
//           sm={12}
//           xs={12}
//           style={{marginBottom: '25px'}}
//         >

//           <Button
//             sx={{borderRadius: '0', boxShadow: 0}}
//             onClick={() => chipChange('cash')}
//             label='Cash'
//             variant={activeChip === 'cash' ? 'contained' : 'outlined'}
//           >
//             Cash
//           </Button>
//           {_.uniqBy(props.bank_creation_adjustment_list, 'bankName').map(
//             (d) => (
//               <Button
//                 sx={{borderRadius: '0', boxShadow: 0}}
//                 onClick={() => chipChange(d.bankAccountId)}
//                 label={d.bankName}
//                 variant={
//                   activeChip === d.bankAccountId ? 'contained' : 'outlined'
//                 }
//               >
//                 {d.bankName}
//               </Button>
//             ),
//           )}

//           {/* </div> */}
//         </Grid>

//         <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//           <Box display='flex' justifyContent='flex-end'>
//             {/* <div style={{justifyContent: 'right', display:'flex', marginTop: '25px'}}> */}
//             <LocalizationProvider dateAdapter={DateAdapter}>
//               <DatePicker
//                 label='Date'
//                 // inputFormat='DD/MM/yyyy'
//                 name='date'
//                 value={formValues.date}
//                 inputVariant='contained'
//                 disableFuture
//                 onChange={(e, v) => {
//                   setFormValues({...formValues, date: getDateFormat(e)});
//                 }}
//                 renderInput={(params) => <TextField {...params} />}
//               />
//             </LocalizationProvider>
//             {/* </div> */}
//           </Box>
//         </Grid>
//       </Grid>

//       {single === '0' && (
//         <>
//           {Prompt}
//           <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
//             NewPayOut
//           </Typography>

//           {/* <div style={{ border: '2px solid grey', borderRadius: '10px', paddingLeft: '500px', paddingBottom: '0px' }}>
  
//           <FormControl component="fieldset" >
//             <RadioGroup row aria-label="customer" value={single} name="cash_type" onChange={Change} >
//               <FormControlLabel value="false" control={<Radio />} label="CashOut" />
//               <FormControlLabel value="true" control={<Radio />} label="CashIn" />
//             </RadioGroup>
//           </FormControl>
//         </div> */}

//           <Grid
//             style={{paddingTop: '15px'}}
//             spacing={2}
//             // lg={12}
//             // md={12}
//             // sm={12}
//             // xs={12}
//             container
//             direction='row'
//             //
//           >
//             <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
//               <FormControl
//                 required={true}
//                 error={formErrors.payment_id === null ? false : true}
//                 component='fieldset'
//                 fullWidth={true}
//               >
//                 <InputLabel>Payment Mode</InputLabel>
//                 <Select
//                   style={{}}
//                   name='payment_id'
//                   label='Payment Mode'
//                   // items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
//                   required={false}
//                   onChange={handleChange}
//                   //defalutValue=''
//                   value={
//                     formValues.payment_id === null ? '' : formValues.payment_id
//                   }
//                 >
//                   {activeChip === 'cash' &&
//                     props.cash_box_adjustment_list?.map((d) => (
//                       <MenuItem value={d.id} key={d.id}>
//                         {d.name}
//                       </MenuItem>
//                     ))}

//                   {activeChip !== 'cash' &&
//                     props.paymentMethod
//                       .filter((f) => activeChip === f.bankAccountId)
//                       ?.map((d) => (
//                         <MenuItem value={d.paymentId} key={d.paymentId}>
//                           {d.paymentName}
//                         </MenuItem>
//                       ))}
//                 </Select>
//                 <FormHelperText>{formErrors.payment_id}</FormHelperText>
//               </FormControl>
//                   {/* <Autocomplete
//                   value={formValues.payment_id !== null? props.cash_box_adjustment_list.filter(f=>f.id === formValues.payment_id)[0] : {name:''}}
//                   name='payment_id'
//                   fullWidth={true}
//                   onChange={(event, newValue) => {
//                       handleChange({target : {name : 'payment_id' , value : newValue.id}})
//                   }}
//                   options={_.uniqBy(props.cash_box_adjustment_list,'name')}
//                   getOptionLabel={(option) => option.name}                
//                   renderInput={(params) => <TextField {...params}
//                    variant="outlined"
//                     error={formErrors.payment_id === null ? false : true} 
//                      helperText={formErrors.payment_id === null ? '' : formErrors.payment_id}
//                       label='Payment Mode'
//                        required={true} />}
//               /> */}

//             </Grid>

//             {/* <Grid
//             spacing={0}
//             lg={3}
//             md={4}
//             sm={6}
//             xs={12}
  
//            
//             container={true}
//             direction='row'>
//             <FormControl required={true}
//               error={formErrors.ledger_id === null ? false : true}
//               variant='outlined'
//               component='fieldset'
//               fullWidth={true}>
//               <InputLabel>
//                   Ledger
//               </InputLabel>
//               <Select style={{}}
//                 name='ledger_id'
//                 label='Payment Mode'
//                 items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
//                 required={false}
//                 onChange={handleChange}
//                 value={formValues.ledger_id === null ? "" : formValues.ledger_id}>
//                   {props.chartOfAccounts?.map(d => <MenuItem value={d.id} key={d}>
//                 {d.name} 
//               </MenuItem>)}
//               </Select>
//               <FormHelperText>
//               {formErrors.ledger_id}
//             </FormHelperText>
//             </FormControl>
//           </Grid> */}

//           <Grid
//             spacing={0}
//             lg={3}
//             md={4}
//             sm={6}
//             xs={12}
//            
//             container={true}
//             direction='row'>
          
//           <Autocomplete
//                value={
//                   formValues.ledger_id !== null
//                     ? props.payOutdata.filter(
//                         (f) => f.id === formValues.ledger_id,
//                       )[0]
//                     : {name: ''}
//                 }
//                 name='ledger_id'
//                 fullWidth={true}
//                 onChange={(event, newValue) => {
//                   // if (typeof newValue === 'string') {
//                   handleChange({
//                     target: {name: 'ledger_id', value: newValue.id},
//                   });
//                   // setFormValues({...formValues , ledger : newValue.id})
//                   // }
//                 }}
//                 // disablePortal
//                 // options={props.payOutdata}
//                 options={_.uniqBy(props.payOutdata, 'name')}
//                 // renderOption={(option) => option.name}
//                 getOptionLabel={(option) => option.name}
//                 // options={props.chartOfAccounts}
//                 // renderInput={(params) => (
//                 //   <TextField
//                 //     {...params}
//                 //     variant='outlined'
//                 //     error={formErrors.ledger_id === null ? false : true}
//                 //     helperText={
//                 //       formErrors.ledger_id === null ? '' : formErrors.ledger_id
//                 //     }
//                 //     label='Ledger'
//                 //     required={true}
//                 //   />
//                 renderInput={(params) => <TextField {...params}
//                 variant="outlined"
//                  error={formErrors.ledger_id === null ? false : true}
//                   helperText={formErrors.ledger_id === null ? '' : formErrors.ledger_id}
//                    label='Ledger'
//                     required={true} />}
//               />

//               </Grid>

//             <Grid
//               spacing={0}
//               lg={4}
//               md={4}
//               sm={4}
//               xs={12}
//              
//             >
//               <TextField
//                 onChange={handleChange}
//                 onBlur={(e) =>{activeChip === 'cash' && setOpenDenomination(true); setCurrentTarget('Tendered')}}
//                 // onBlur={handleChange}
//                 // onFocus={(e)=>setOpenDenomination(pre=> pre===true ?false:true)}
//                 // onClick={
//                 //   activeChip === 'cash' && handleChange
//                 // }
//                 required={true}
//                 style={{}}
//                 fullWidth={true}
//                 placeholder=' Enter Amount'
//                 label='Amount'
//                 name='amount'
//                 color='primary'
//                 multiline={false}
//                 type='number'
//                 regex=''
//                 variant='outlined'
//                 value={formValues.amount === null ? '' : formValues.amount}
//                 error={formErrors.amount === null ? false : true}
//                 helperText={formErrors.amount === null ? '' : formErrors.amount}
//               />
//             </Grid>

//             <Grid
//               spacing={0}
//               lg={12}
//               md={12}
//               sm={12}
//               xs={12}
//               container={true}
//               direction='row'
//              
//             >
//               <TextField
//                 onChange={handleChange}
//                 onBlur={handleChange}
//                 required={true}
//                 style={{}}
//                 fullWidth={true}
//                 placeholder=' Note'
//                 label='Note'
//                 name='reason'
//                 color='primary'
//                 multiline={true}
//                 variant='outlined'
//                 rows={2}
//                 type='text'
//                 regex=''
//                 value={formValues.reason === null ? '' : formValues.reason}
//                 error={formErrors.reason === null ? false : true}
//                 helperText={formErrors.reason === null ? '' : formErrors.reason}
//               />
//             </Grid>

            
//           </Grid>
//           <CancelDialog
//             handle={cancel}
//             delete={dialog}
//             close={props.handleClose}
//           ></CancelDialog>
//           {/* {openDenomination && ( */}
//             <DenominationDialog
//               openDenomination={openDenomination}
//               handleSubmit={setAmountDialogToState}
//               responseType={'cashOutIn'}
//               formValues={{...formValues}}
//               setFormValues={setFormValues}
//               setOpenDenomination={setOpenDenomination}
//               currentTarget={currentTarget}
//               setCurrentTarget={setCurrentTarget}
//               validationHandler={validationHandler}
//               total={formValues.amount}
//             />
//           {/* )} */}

//           <br />

//           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//             <Grid
//               // lg={12}
//               // md={12}
//               // sm={12}
//               // xs={12}
//               spacing={0}
//               container
//               direction='row'
//               //
//             >
//               <Grid size={{ xs: 6, sm: 6, md: 8, lg: 9 }}></Grid>

//               <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
//                 <Grid
//                   // lg={12}
//                   // md={12}
//                   // sm={12}
//                   // xs={12}
//                   spacing={0}
//                   container
//                   direction='row'
//                   //
//                 >
//                   {props.status !== 'edit' ? (
//                     <Grid
//                       lg={6}
//                       md={6}
//                       sm={6}
//                       xs={12}
//                       align='right'
//                      
//                     >
//                       {' '}
//                     </Grid>
//                   ) : (
//                     <Grid
//                       lg={1}
//                       md={4}
//                       sm={6}
//                       xs={12}
//                       align='right'
//                      
//                     >
//                       {form === false ? (
//                         <Button
//                           onClick={() => props.handleClose()}
//                           style={{}}
//                           name='Cancel'
//                           variant='contained'
//                           color='secondary'
//                           size='medium'
//                           text='button'
//                           fullWidth={false}
//                           type='cancel'
//                         >
//                           Cancel
//                         </Button>
//                       ) : (
//                         <Button
//                           onClick={() => validClose()}
//                           style={{}}
//                           name='Cancel'
//                           variant='contained'
//                           color='secondary'
//                           size='medium'
//                           text='button'
//                           fullWidth={false}
//                           type='cancel'
//                         >
//                           Cancel
//                         </Button>
//                       )}
//                     </Grid>
//                   )}

//                   <Grid size={{ xs: 12, sm: 6, md: 8, lg: 11 }} align='right'>
//                     <Button
//                       onClick={handleSubmit}
//                       name='Submit'
//                       size='medium'
//                       text='button'
//                       color='primary'
//                       style={{}}
//                       variant='contained'
//                       fullWidth={false}
//                     >
//                       Submit
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//         </>
//       )}
//       {
//         single === '2' && (
//           <>
//             {openDenomination && (
//               <DenominationDialog
//                 openDenomination={openDenomination}
//                 handleSubmit={setAmountDialogToState}
//                 responseType={'cashOutIn'}
//                 formValues={{...formValues}}
//                 setFormValues={setFormValues}
//                 setOpenDenomination={setOpenDenomination}
//                 currentTarget={currentTarget}
//                 setCurrentTarget={setCurrentTarget}
//                 validationHandler={validationHandler}
//                 total={formValues.amount}
//               />
//             )}
//           </>
//         )

        
//       }
//     </>
//   );
// }

// export default NewCashOutIn;

