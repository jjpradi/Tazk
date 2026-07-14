import React, {useState, useEffect, useRef} from 'react';
// import UnSavedChangesWarning from '../pages/common/unChangeswarning';
// import CancelDialog from './CancelDialog';
// import DenominationDialog from './DenominationDialog';
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
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
  Box,
} from '@mui/material';
// import {getTrimmedData} from './trimFunction/index';
// import {useDispatch, useSelector} from 'react-redux';
import DenominationDialog from '../../pages/accounts/cashOutIn/DenominationDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Card} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Cookies from 'universal-cookie';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';

// import PosSalePayOutEntry from './posSalePayOutEntry'
// import { getLoginRoleAction } from 'redux/actions/userRole_actions';


function CancelPosSalePage(props) {
  const [formValues, setFormValues] = useState({
    cash_box_id: null,
    cash_box_ledger_id : null,
    ledger_id: null,
    amount: null,
    amount_in_denomination: null,
    note: null,
  });
  const [formErrors, setFormErrors] = useState({
    cash_box_id: null,
    ledger_id: null,
    amount: null,
    amount_in_denomination: null,
    note: null,
  });
  const [requiredFields] = useState([
    'cash_box_id',
    'ledger_id',
    'amount',
  ]);
  const [regex] = useState({});
//   const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [openDenomination, setOpenDenomination] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [currentTarget, setCurrentTarget] = useState('Tendered');
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const tempsummary = useRef(null);
  const [optionscashbox, setoptionscashbox] = useState('0');
//   const dispatch = useDispatch();
  const [reset,setreset]= useState(true);
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const emp = storage?.employee_id || 0;
  const [posSaleData, setPosSale] = useState([]);



useEffect(() => {
  let posSale = props.pos_sale_by_pagination;
  if(posSale.sale_id !== null){
    setPosSale(posSale[props.indexValue])
  }
},[props.pos_sale_by_pagination])


useEffect(() => {

  setFormValues({ ...formValues,amount: posSaleData?.received_amount, note: posSaleData?.invoice_number })

},[posSaleData])



const handleValueChange = (value) => {
  if(value === '1'){
    setOpenDenomination(true);
    setCurrentTarget('Tendered')
  }

    setoptionscashbox(value)
}

const setAmountDialogToState = (Amount) => {
  if (typeof Amount !== 'undefined') {
    setFormValues({...formValues, amount: Amount});
    setOpenDenomination(false);
    setStateHandler('amount', Amount);
  } else {
    setOpenDenomination(false);
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

        // if(formValues.amount_in_denomination === null){
        //   isValid = false;
        //   setFormErrors({
        //     ...formErrors,
        //     amount_in_denomination: ` Enter Amount in Denomination!`,
        //   });
        // }
        
          if(optionscashbox === '0'){
            const paymentAmount = posSaleData.pos_sales_payments.map(f => { return f.payment_amount})
            const unusedCredits = posSaleData?.unused_credits || 0
            const data = { unused_credits: unusedCredits , amount: paymentAmount[0] , type: 'Customer'}
            await props.handleCancelPosSale(data,posSaleData.sale_id)
          }
          else{
            if (isValid) {
              var date = new Date();
              var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

              formValues.date = moment(date, 'year', 'month', 'day').format('yyyy-MM-DD'),
              formValues.type = 'PayOut'

              // props.handleSubmit(getTrimmedData(formValues));
              // const data = { unused_credits: unusedCredits , amount: paymentAmount }
              await props.handleCancelPosSale(formValues,posSaleData.sale_id)
            }
          }
        
}

const handleChange = async (e) => {
  let {name, value} = e.target;
setStateHandler(name, value);
};

const setStateHandler = async (name, value) => {
  let formObj = {};
  if (name === 'ledger_id') {
    const ledgerName = posSaleData.Ledger.find((d) => d.id === value).name;
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
  else if (name === 'cash_box_id') {
   
    const paymentData = posSaleData.cashBox.find(
          (d) => d.id === value,
        );
        const payName = paymentData.name;
        formObj = {
          // ...contraform,
          ...formValues,
          [name]: value === '' ? null : value,
          cash_box_ledger_id : paymentData.ledger_id,
          payName,
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
  } else if(regex[name] === 'amount'){
    if(formValues.amount_in_denomination === null){
      setFormErrors({
        ...formErrors,
        [name]: ` Enter Amount in Denomination!`,
      });
    }
  } else {
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
  }
};
  return (
    <>
      {/* {Prompt} */}
      { openDenomination && (
        <DenominationDialog
        openDenomination={openDenomination}
        handleSubmit={setAmountDialogToState}
        responseType={'cashOutIn'}
        formValues={{...formValues}}
        setFormValues={setFormValues}
        setOpenDenomination={setOpenDenomination}
        currentTarget={currentTarget}
        setCurrentTarget={setCurrentTarget}
        validationHandler={validationHandler}
        total={formValues.amount}
      />
      )}
      <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        Return Payment
      </Typography>
      <div
        style={{
          border: '2px solid grey',
          borderRadius: '10px',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
      {/* {reset ?  */}
      <FormControl component='fieldset'>
          {/* <FormLabel component="legend">Gender</FormLabel> */}
          <RadioGroup
            row
            aria-label='customer'
            value={optionscashbox}
            name='customer_type'
            onChange={(e) => handleValueChange(e.target.value)}
          >
            <FormControlLabel  value='0' control={<Radio />} label='Add credit to customer' />
            <FormControlLabel value='1' control={<Radio />} label='Create payout entry' />
          </RadioGroup>
        </FormControl>
        {/* :   */}
        {/* <FormControl component='fieldset'> */}
        {/* <FormLabel component="legend">Gender</FormLabel> */}
        {/* <RadioGroup
          row
          aria-label='customer'
          value={optionscashbox}
          name='customer_type'
          onChange={Change}
        >
          <FormControlLabel disabled value='0' control={<Radio />} label='Add credit to customer' />
          <FormControlLabel value='1' control={<Radio />} label='Create payout entry' />
        </RadioGroup>
      </FormControl> */}
        {/* } */}
      </div>
      {optionscashbox === '1' ? <Grid container spacing={3} direction={'center'} style={{marginTop: 20}}>
       <Grid
         size={{
           lg: 3
         }}>
         <TextField
           id='outlined-read-only-input'
           fullWidth={true}
           label='Cash'
           defaultValue={'Cash'}
           InputProps={{
             readOnly: true,
           }}
         />
       </Grid>
       <Grid
         size={{
           lg: 3,
           md: 4,
           xs: 4,
           sm: 6
         }}>
         <FormControl
           required={true}
           error={formErrors.cash_box_id === null ? false : true}
           component='fieldset'
           fullWidth={true}
         >
           <InputLabel>Cash Box</InputLabel>
           <Select
             style={{}}
             name='cash_box_id'
             label='Cash Box'
             // items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
             required={false}
             onChange={handleChange}
             //defalutValue=''
             value={
               formValues.cash_box_id === null ? '' : formValues.cash_box_id
             }
           >
             {
               posSaleData.cashBox?.map((d) => (
                 <MenuItem value={d.id} key={d.id}>
                   {d.name}
                 </MenuItem>
               ))}

             {/* {activeChip !== 'cash' &&
               props.paymentMethod
                 .filter((f) => activeChip === f.bankAccountId)
                 ?.map((d) => (
                   <MenuItem value={d.paymentId} key={d.paymentId}>
                     {d.paymentName}
                   </MenuItem>
                 ))} */}
           </Select>
           <FormHelperText>{formErrors.cash_box_id}</FormHelperText>
         </FormControl>
       </Grid>
       <Grid
         size={{
           lg: 3,
           md: 4,
           xs: 4,
           sm: 6
         }}>
         <FormControl
             required={true}
             error={formErrors.ledger_id === null ? false : true}
             component='fieldset'
             fullWidth={true}
           >
             <InputLabel>Ledger Name</InputLabel>
             <Select
               style={{}}
               name='ledger_id'
               label='Ledger Name'
               // items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
               required={false}
               onChange={handleChange}
               //defalutValue=''
               value={
                 formValues.ledger_id === null ? '' : formValues.ledger_id
               }
             >
               {
                 posSaleData.Ledger?.map((d) => (
                   <MenuItem value={d.id} key={d.id}>
                     {d.name}
                   </MenuItem>
                 ))}

               {/* {activeChip !== 'cash' &&
                 props.paymentMethod
                   .filter((f) => activeChip === f.bankAccountId)
                   ?.map((d) => (
                     <MenuItem value={d.paymentId} key={d.paymentId}>
                       {d.paymentName}
                     </MenuItem>
                   ))} */}
             </Select>
             <FormHelperText>{formErrors.ledger_id}</FormHelperText>
           </FormControl>
       </Grid>
       <Grid
         size={{
           lg: 3
         }}>
       <TextField
           onChange={handleChange}
           // onBlur={(e) =>{optionscashbox === '1' && setOpenDenomination(true); setCurrentTarget('Tendered')}}
           // onBlur={handleChange}
           // onFocus={(e)=>setOpenDenomination(pre=> pre===true ?false:true)}
           // onClick={(e) => {setOpenDenomination(true); setCurrentTarget('Tendered')}}
           required={true}
           style={{}}
           fullWidth={true}
           onWheel={ (e) => e.target.blur()}
           placeholder=' Enter Amount'
           label='Amount'
           name='amount'
           color='primary'
           multiline={false}
           type='number'
           regex=''
           variant='filled'
           value={formValues.amount === null ? '' : formValues.amount}
           error={formErrors.amount === null ? false : true}
           helperText={formErrors.amount === null ? '' : formErrors.amount}
         />
       </Grid>
       <Grid
         size={{
           lg: 12
         }}>
         <TextField
           id='outlined-read-only-input'
           fullWidth={true}
           label='Note'
           value={formValues.note === null ? '' : formValues.note}
           InputProps={{
             readOnly: true,
           }}
           />
       </Grid>
      </Grid> :
      <Grid container spacing={3} style={{marginTop: 20}} >
       <Grid
         size={{
           lg: 12,
           md: 8
         }}>
       <Box>
         <Card variant='outlined' sx={{padding: '10px', width: '100%'}} >
           <Grid container spacing={3}>
             <Grid
               size={{
                 lg: 6
               }}>
               <Typography variant='body1' component='div' align='left'>
                   Payment Mode
               </Typography>
             </Grid>
             <Grid
               size={{
                 lg: 6
               }}>
               <Typography variant='body1' component='div' align='left'>
                     {posSaleData.unused_credits ? ` Unused Credits - ${posSaleData?.unused_credits}`: ''}
               </Typography>
             </Grid>
           </Grid>
             
             {
                 posSaleData.pos_sales_payments ? posSaleData.pos_sales_payments.map(f => (
                     <div style={{marginLeft:'60px'}}>
                         <ul>
                             <li >
                                 <Grid container spacing={2} style={{textAlign:'center'}}>
                                     <Grid
                                       size={{
                                         xs: 6,
                                         lg: 3
                                       }}>
                                     {f.payment_type}
                                     </Grid>
                                 
                                     <Grid
                                       size={{
                                         xs: 6,
                                         lg: 3
                                       }}>
                                     -
                                     </Grid>
                                     <Grid
                                       size={{
                                         xs: 6,
                                         lg: 3
                                       }}>
                                     {f.payment_amount}
                                     </Grid>
                                 </Grid>
                             </li>
                         </ul>
                     </div>
                 ))
                 :
                 []
             }
             
             
         </Card>
     </Box>
       </Grid>
      </Grid>
      }
      <Grid container justifyContent="flex-end" spacing={2} style={{ marginTop: 20 }}>
           <Grid>
             <Button
               onClick={() => {props.cancelPosSaleBackBtn(props.rowIndex) && props.rowIndexData(props.indexValue)}}
               style={{}}
               name='Cancel'
               variant='contained'
               color='secondary'
               size='medium'
               text='button'
               fullWidth={false}
               type='cancel'
             >
               cancel
             </Button>
           </Grid>
           {optionscashbox === '1' ?
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
           :
           <Grid
             size={{
               lg: 6
             }}>
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
               Add Credit
             </Button>
           </Grid>
           }
       </Grid>
      {/* <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog> */}
    </>
  );
}

export default CancelPosSalePage;
