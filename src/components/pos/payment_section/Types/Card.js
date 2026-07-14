import React, {useEffect, useRef, useState} from 'react';
// import { PaymentInputsWrapper, usePaymentInputs } from 'react-payment-inputs';
// import images from 'react-payment-inputs/images';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
// import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {useDispatch, useSelector} from 'react-redux';
import  Autocomplete from '@mui/material/Autocomplete'
import DenominationDialog from 'components/DenominationDialog';
import { Typography } from '@mui/material';
import moment from 'moment';
import { createSalesApproval, salesApprovalsAction } from 'redux/actions/sales_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import toMomentOrNull from 'utils/DateFixer';


// import IconButton from '@mui/material/IconButton';
// import { styled } from '@mui/material/styles';

// const Input = styled('input')({
//   display: 'none',
// });
// const imgStyle = {
//   //display: 'grid',
//   align: 'center',
//   borderradius: '5px',
//   padding: '3px',
//   cursor: 'pointer',
//   // border: '1px solid #73AD21',
//   width: '55px',
//   height: '45px',
//   opacity: '0.2',
//   //  rowGap: '1px',
//   // columnGap: '2px',
//   cursor: 'pointer',width: '55px', height: '45px', opacity: rupay ? '2' : '0.2'
// }

export default function PaymentInputs(props) {
  const {setOpen, setActiveOpen, activeOpen,rowData,receivableData,setPrevRequest} = props
  // const {
  //   getCardImageProps,
  //   getCardNumberProps,
  //   getExpiryDateProps,
  //   getCVCProps,
  //   wrapperProps
  // } = usePaymentInputs();

  const {handleCashClick,cash_type,paymentId,setOpenDenominationDialog,setNormalCashBoxInfo=()=>{},PaymentDenominationvalidation, defaultcash, setDefaultcash, normalCashBoxInfo }=props
  const [data, setdata] = useState({});
  const [cashdefault, setcashdefault] = useState(false)






  const handleChange = (e) => {
    const {name, value} = e.target;
    setdata((p) => ({...p, [name]: value}));
  };

  const Change = (e) => {
    let {value} = e.target;
    setdata(value);
    //setDirty();
  };
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchor, setAnchor] = React.useState(null);
  const [col, setCol] = useState(false);
  const [master, setMaster] = useState(false);
  const [rupay, setRupay] = useState(false);
  const [maestro, setMaestro] = useState(false);
  const [formvalue] = useState({visa: '', master: '', rupay: '', maestro: ''});
  const [referenceNoErr,setReferenceNoErr] = useState(false)
  const [chequeErr,setChequeErr] = useState({bankName:false,chequeNumber:false,chequeDate:false})
  const {referenceNo,setReferenceNo,chequeInfo,setChequeInfo,type} = props
  const {cash_box_denomination, cash_box_list, locateCashBox} = useSelector((state) => state.cashBoxReducer);
  const storage = getsessionStorage()
  const [tempData, setTempData] = useState([]);
  const [execute,setExecute] = useState(false)
   const {
          salesReducer : {salesApprovals,getApprovalRights}
      } = useSelector(state => state)
  const [request,setRequest] = useState(false)
  const dispatch = useDispatch()

  const Dropdown = (data)=>{
    setActiveOpen(-1)
    // setclosecard(false)
     PaymentDenominationvalidation(data?.id);
     setOpen(props.paymentId)
     setNormalCashBoxInfo({cash_box_id:data?.id || null ,cashboxLedgerId:data?.ledger_id || null})
   
   if(data?.allowdenomination === 0){
         setDefaultcash(data)
      // props.onClick();
      // handleClick({ currentTarget: anchorEl });
     }
     else{
     setOpenDenominationDialog(true); 
     setDefaultcash({})
     handleCashClick(cash_type,paymentId, defaultcash?.allowdenomination)
     }
   // await handleCashClick(cash_type,paymentId, data.allowdenomination)
    };

    useEffect(()=>{
      if(defaultcash !== undefined && normalCashBoxInfo?.cash_box_id && Object.keys(defaultcash).length > 0){
      handleCashClick(cash_type,paymentId, defaultcash?.allowdenomination)
      }
    
    },[normalCashBoxInfo])


  const handleClick = (event) => {

    let getAmount = props.Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    if (getAmount >= +props.total && !isOpen()) {
      return;
    }
    setAnchorEl(event.currentTarget);
    setOpen(props.paymentId);
  };

  const canBeOpen = isOpen() && Boolean(anchorEl);
  const BeOpen = isOpen() && Boolean(anchor);
  const id = canBeOpen ? 'transition-popper' : undefined;
  const sele = BeOpen ? 'transition-popper' : undefined;

  // const cardChange = (event) => {
  //   setAnchorEl(event.currentTarget);
  //   setCard((previousOpen) => !previousOpen);
  //   //  setCard(true)
  // }
  

  const colorChange = (event) => {
    // setCol(true)
    setAnchor(event.currentTarget);
    setMaster(false);
    setRupay(false);
    setMaestro(false);
    setCol((previousOpen) => !previousOpen);
  };
  const masterChange = (event) => {
    setAnchor(event.currentTarget);
    setCol(false);
    setRupay(false);
    setMaestro(false);
    setMaster((previousOpen) => !previousOpen);
  };
  const rupayChange = (event) => {
    setAnchor(event.currentTarget);
    setCol(false);
    setMaestro(false);
    setMaster(false);
    setRupay((previousOpen) => !previousOpen);
  };
  const maestroChange = (event) => {
    setAnchor(event.currentTarget);
    setCol(false);
    setRupay(false);
    setMaster(false);
    setMaestro((previousOpen) => !previousOpen);
  };
  const handleSubmit = () => {
    if (referenceNo === null && (type === 'UPI' || type === 'NEFT / RTGS / IMPS') || referenceNo === '') {
      setReferenceNoErr(true)
    }
    else if (type === 'Cheque') {
      let errors = {};
      let isValid = true;

      if (!chequeInfo.bankName) {
        errors.bankName = true;
        isValid = false;
      }

      if (!chequeInfo.chequeNumber || chequeInfo.chequeNumber.length !== 6) {
        errors.chequeNumber = true;
        isValid = false;
      }

      if (!chequeInfo.chequeDate) {
        errors.chequeDate = true;
        isValid = false;
      }

      setChequeErr(errors);

      if (isValid) {
        props.onClick();
        handleClick({ currentTarget: anchorEl });
      }
    } else {
      props.onClick();
      handleClick({ currentTarget: anchorEl });
    }
  };

  // useEffect(()=>{
  //   if(cashdefault === true){
  //     handleSubmit();
  //   }
  
  // },[cashdefault])
  const handleClose = (e) =>{
    if(isOpen()){
      setActiveOpen(-1)
    }else{
      setActiveOpen(props.paymentId)
    }
    setAnchorEl(e.currentTarget);
    setReferenceNo(null)
    setReferenceNoErr(false)
    setChequeInfo({...chequeInfo,bankName:null,chequeNumber:null})
    setChequeErr({bankName:false,chequeNumberErr:false,chequeDate:false})

  }

  function isOpen (){
    return props.paymentId === activeOpen;
  }

  function addBtnValidation(){
    let flag = false;


    if(type === 'Cheque'){

      if( chequeInfo.bankName === '' || !chequeInfo.chequeDate ){
        flag = true;
      }
    }else if(type === 'Card'){
      if( data.lastDigit?.length !== 4 ){
        flag = true;
      }
    }else if(type === 'UPI' || type === 'NEFT / RTGS / IMPS'){
      if( referenceNo === '' || referenceNo === null ){
        flag = true;
      }
    }


    return flag;
  }

  // const isExceeded = moment().isAfter(
  //     moment(rowData?.[0].invoice_date, 'DD/MM/YYYY').add(rowData?.[0].creditdays, 'days')
  //   );

  let isExceeded ;

  let isAnyExceeded2;

useEffect(()=>{
  console.log('exeuseeffttt')
  if (getApprovalRights?.rights !== true && receivableData?.length > 0) {
    const checkDate = new Date(moment(chequeInfo.chequeDate).format('YYYY-MM-DD')); // Convert to Date
    console.log(checkDate, 'checkDate', chequeInfo.chequeDate, receivableData);

    const isAnyExceeded = receivableData?.some(item => {
        const dueDate = new Date(item.due_date); // Convert due_date to Date object
        return dueDate < checkDate; // Compare dates correctly
    });

   return setRequest(isAnyExceeded)
}
},[receivableData?.length,chequeInfo?.chequeDate])

  console.log(receivableData,'yyyyyyyyy9',isExceeded)


  const finalData = useRef([]); // Store filtered data
  const hasExecuted = useRef(false);

  // useEffect(()=>{
  //   if(rowData?.length > 0){
  //     rowData[0].childRow.map((e)=>{
  //       const checkDate = moment(chequeInfo.chequeDate);
  //         // const invoiceDate = moment(e.date, "YYYY-MM-DD HH:mm:ss");
  //         const isSame = checkDate.isSame(e.invoice_date,"day");
  //         let isAfter = moment(e.due_date, 'YYYY-MM-DD').isAfter(moment(checkDate).startOf('day'));
  //         console.log(checkDate,'checkDateadasda',e.due_date,isAfter,)
          
  //       if(isAfter){
  //         console.log('workinggggg',e)
  //         finalData.current.push(e);
  //       }
  //     })
  //   }
  // },[rowData])

 

  useEffect(() => {
   if(getApprovalRights?.rights !== true){
    if ((!rowData || rowData?.length === 0 || !rowData[0] || hasExecuted.current)) return; // Ensure single execution
  
    hasExecuted.current = true; // Mark execution

    finalData.current = rowData[0].childRow.filter((e) =>
      moment(e.due_date, "YYYY-MM-DD").isAfter(moment(chequeInfo.chequeDate).startOf("day"))
    );
   }
  
  }, [rowData]);

  let filteredData ;
  if(receivableData !== undefined && receivableData?.length > 0 && getApprovalRights?.rights !== true){
   let data =  finalData.current
    .filter(sale => receivableData.some(receivable => receivable.id === sale.sale_id))
    ?.map(({ invoice_number, due_date, total, due_amount }) => ({
        invoice_number,
        due_date,
        total_amount: total,
        due_amount
    }));

    filteredData = data
  }


useEffect(()=>{ (async () => {


  if(salesApprovals?.length > 0 && rowData?.length > 0 && filteredData?.length > 0  && getApprovalRights?.rights !== true){
   
    
      salesApprovals[0].status === 'Approved' && setRequest(false) 


      salesApprovals.forEach(async(e) => {
      if (e.customer_id === rowData[0].customer_id && (e.status === 'Pending')) {
          const Tdata = await JSON.parse(e.receivable_items);

          if(Tdata.length > 0 ){
            const hasMatchingInvoice = Tdata?.some((t) =>
              filteredData.some((f) => t.invoice_number.trim() === f.invoice_number.trim())
          );

    
            if (hasMatchingInvoice) {
                // props.onClick()
                setRequest(true);
            }
            else{
              setRequest(false);
            }
          }
      }
  });
  }
})();
},[salesApprovals?.length,filteredData?.length])

function formatDate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;  // Converts to YYYY-MM-DD
}



useEffect(() => {
  if (props?.tempData?.length > 0) {
    setTempData(props.tempData); // ✅ Updates state properly
  }
}, [props?.tempData]);

const handleRequest = async()=>{
  console.log('consolsajdas')
   props.onClick();
  props.setPrevRequest((prev) => {
    console.log("PreviousValueinsidesetState:", prev);
    return true;
  });
  setRequest(true)
  setExecute(true)
  // handleClose()
}

console.log(tempData,'tempData98765',receivableData)

useEffect(()=>{
  if(request === true && execute === true && tempData.length > 0){
  const payload = {
    data :{
     customer_id : rowData[0]?.customer_id,
     credit_value : rowData[0]?.creditvalue,
     total : rowData[0]?.total,
     date :formatDate(rowData?.[0]?.sale_time),
     status  :  'Pending',
     po_number : rowData[0]?.invoice_number,
     request_type : 'Payment',
     receivable_items : JSON.stringify(filteredData),
     cheque_details :  JSON.stringify(chequeInfo),
       Payment_Tdata : JSON.stringify(props.tempData)

   },

    data1 : {
     customer_id :rowData[0]?.customer_id,
     tot_amount : rowData[0]?.total,
     req_date : new Date(),
     status  :  'Pending',
     request_type : 'Payment'
   }
  }

  dispatch(createSalesApproval(payload))
  }
},[request,execute])


const [chequeDate, setChequeDate] = useState(null);
const [bankName, setBankName] = useState(null);
const [chequeNumber, setChequeNumber] = useState(null);

  return (
    <>
      <Grid sx={{paddingBottom:'10px'}}>
      <Button
        aria-describedby={id}
        color={!isOpen() ? 'primary' : 'warning'}
        type='Button'
        variant='outlined'
        // sx={{height:'50px',borderRadius:'8px',width:'90px'}}
        onClick={(e)=> {
          e.stopPropagation()
          if(props.cash_type === "Cash (INR)" && props.isCashTransaction){
            alert('Cant edit this payment as cashbox does not have required denomination')
            return

          }
          setActiveOpen(props.paymentId);
          handleClose(e)
        }}
      >
        <Typography
          sx={{
          fontSize: 10,
          fontWeight: 600,
          // cursor: "pointer"
        }}>
        {!isOpen() ? props.paymentName : 'Close'}
        </Typography>
      </Button>
      </Grid>
      {/* 
            <Typography
              // aria-describedby={id}
              color={!isOpen() ? 'primary' : 'warning'}
              // type='Button'
              sx={{
                fontSize: 10,
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={(e)=> {
                e.stopPropagation()
                setActiveOpen(props.paymentId);
                handleClose(e)
              }}
            >
              {!isOpen() ? props.paymentName : 'Close'}
            </Typography> */}
      <Popper
        id={id}
        open={isOpen()}
        style={{zIndex: 9999}}
        anchorEl={anchorEl}
        placement='bottom-start'
        transition
      >
        {({TransitionProps}) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={3}>
              <div style={{padding: '10px'}}>
                {/* <Typography variant="overline" display="block" >
                  Saved Cards
                </Typography>

                <FormControl size='small' fullWidth>
                  <InputLabel id="card-select-label-500">Credit & Debit</InputLabel>
                  <Select

                    labelId="demo-simple-select-label"
                    id="credit-debit-select"
                    value={data.cardType}
                    label="Credit & Debit"
                    name='cardType'
                    onChange={handleChange}
                  >
                    <MenuItem value={'Visa'}>**** **** **** 9897, Visa</MenuItem>
                    <MenuItem value={'MasterCard'}>**** **** **** 9897, MasterCard</MenuItem>
                    <MenuItem value={'RuPay'}>**** **** **** 9897, RuPay</MenuItem>
                    <MenuItem value={'Maestro'}>**** **** **** 9897, Maestro</MenuItem>
                  </Select>
                </FormControl> */}

                {/* <Typography marginTop={'10px'} variant="overline" display="block" >
                  Add New Card
                </Typography>

                <FormControl size='small' sx={{ m: '0 0 10px 0' }} fullWidth>
                  <InputLabel id="card-type-select-label">Card Type</InputLabel>
                  <Select

                    labelId="demo-simple-select-label"
                    id="card-type-select"
                    value={data.cardType}
                    label="Card Type"
                    name='cardType'
                    onChange={handleChange}
                  >
                    <MenuItem value={'Visa'}>Visa</MenuItem>
                    <MenuItem value={'MasterCard'}>MasterCard</MenuItem>
                    <MenuItem value={'RuPay'}>RuPay</MenuItem>
                    <MenuItem value={'Maestro'}>Maestro</MenuItem>
                  </Select>
                </FormControl> */}
                {type === 'Card' && <><FormControl component='fieldset'>
                  <FormLabel component='legend'>Type</FormLabel>
                  <RadioGroup
                    row
                    aria-label='type'
                    name='row-radio-buttons-group'
                    onChange={Change}
                    defaultValue="credit"
                  >
                    <FormControlLabel
                      value='credit'
                      control={<Radio />}
                      label='Credit'
                    />
                    <FormControlLabel
                      value='debit'
                      control={<Radio />}
                      label='Debit'
                    />
                  </RadioGroup>
                </FormControl>
                <br />
                <br />
                <div>
                  <Grid container>
                    <Grid size={2}>
                      <img
                        src={'visa1.png'}
                        aria-describedby={sele}
                        value={formvalue.visa}
                        style={{
                          cursor: 'pointer',
                          width: '55px',
                          height: '45px',
                          opacity: col ? '2' : '0.2',
                        }}
                        alt=''
                        onClick={(event) => {
                          colorChange(event);
                        }}
                      />
                    </Grid>
                    <Grid size={2}>
                      <img
                        src={'master1.png'}
                        aria-describedby={sele}
                        value={formvalue.master}
                        style={{
                          cursor: 'pointer',
                          width: '55px',
                          height: '45px',
                          opacity: master ? '2' : '0.2',
                        }}
                        alt=''
                        onClick={(event) => {
                          masterChange(event);
                        }}
                      />
                    </Grid>
                    <Grid size={2}>
                      <img
                        src={'rupay.png'}
                        value={formvalue.rupay}
                        style={{
                          cursor: 'pointer',
                          width: '55px',
                          height: '45px',
                          opacity: rupay ? '2' : '0.2',
                          align: 'center',
                          borderradius: '5px',
                          padding: '3px',
                        }}
                        alt=''
                        onClick={(event) => {
                          rupayChange(event);
                        }}
                      />
                    </Grid>
                    <Grid size={2}>
                      <img
                        src={'maestro.png'}
                        value={formvalue.maestro}
                        style={{
                          cursor: 'pointer',
                          width: '55px',
                          height: '45px',
                          opacity: maestro ? '2' : '0.2',
                          align: 'center',
                          borderradius: '5px',
                          padding: '3px',
                        }}
                        alt=''
                        onClick={(event) => {
                          maestroChange(event);
                        }}
                      />
                    </Grid>
                    <Grid size={4}></Grid>
                  </Grid>
                  
                </div>
                </>}
                {/* } */}
                <br />
                <div style={{display: 'flex'}}>
                {type === 'Card' &&<TextField
                    id='outlined-basic'
                    size='small'
                    fullWidth
                    name='lastDigit'
                    // onChange={handleChange}
                    onChange = {(e)=> {
                      const regex = /^[0-9\b]+$/;
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if(val.length <= 4){
                        handleChange({target: { name:'lastDigit', value:val}})}
                      }
                    }
                    label='Last 4 Digit'
                    InputProps={{
                      maxLength: 4,
                      startAdornment: (
                        <InputAdornment position='start'>
                          **** **** ****
                        </InputAdornment>
                      ),
                    }}
                    value={data.lastDigit}
                    variant='outlined'
                    onInput={(e) => {
                      e.target.value = Math.max(0, parseInt(e.target.value))
                        .toString()
                        .slice(0, 4);
                    }}
                  />}
                  {type === 'Cash' &&  <Autocomplete
                  disablePortal
                   id="select-cashbox-combo"
                 options={locateCashBox}
                 fullWidth
                  getOptionLabel={(option) => option.name}
                  onChange ={(e,val)=>Dropdown(val)}
              sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Select CashBox" variant='outlined' />}
            /> }
                   {(type === 'UPI' || type === 'NEFT / RTGS / IMPS') && <TextField
                    name='referenceNo'
                    label = 'Enter Reference Number'
                    variant='outlined'
                    value = {referenceNo}
                    onChange = {(e)=> setReferenceNo(e.target.value)}
                    error = {referenceNoErr}
                    helperText = {referenceNoErr ? "Required!" : ''}
                    autoFocus
                    required
                    />}
                    {(type === 'Cheque') && 
                    <Grid container spacing={1}>
                      <Grid
                        size={{
                          lg: 4,
                          md: 4,
                          sm: 4
                        }}>
                        <TextField
                          name="bankName"
                          label="Enter Bank Name"
                          variant="outlined"
                          value={chequeInfo.bankName || ''}
                          onChange={(e) => {
                            setChequeInfo({ ...chequeInfo, bankName: e.target.value });
                            setChequeErr({ ...chequeErr, bankName: false });
                          }}
                          error={chequeErr.bankName}
                          helperText={chequeErr.bankName ? "Required!" : ""}
                          required
                        />

                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          lg: 4,
                          md: 4,
                          sm: 4
                        }}>
                        <TextField
                          name="chequeNumber"
                          label="Enter Cheque Number"
                          variant="outlined"
                          value={chequeInfo.chequeNumber || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 6) {
                              setChequeInfo({ ...chequeInfo, chequeNumber: val });
                              if (val.length === 6) {
                                setChequeErr({ ...chequeErr, chequeNumber: false });
                              }
                            }
                          }}
                          error={chequeErr.chequeNumber}
                          helperText={chequeErr.chequeNumber ? "Required! 6 digit number" : ""}
                          required
                          inputProps={{ maxLength: 6 }}
                        />

                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          lg: 4,
                          md: 4,
                          sm: 4
                        }}>
                      <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      name="chequeDate"
                      label="chequeDate"
                      inputVariant="outlined"
                      //  format="DD/MM/yyyy"
                      format="DD/MM/YYYY"
                      value={toMomentOrNull(chequeInfo.chequeDate)}
                      onChange={(date) =>
                        setChequeInfo({...chequeInfo,'chequeDate':date}) //(moment(date, 'year', 'month', 'day')).format("yyyy-MM-DD")
                      }
                      fullWidth={true}
                     slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>

                      </Grid>     
                      </Grid>
                    }
                   

                  <div style={{display: 'flex', marginLeft: 10}}>

                    {
                    //   (type !== 'Cash' && request && storage.role_name === 'Salesman' && salesApprovals[0]?.status  !== 'Approved') ? (<Button
                    //   type='Button'
                    //   color='success'
                    //   onClick={handleRequest}
                    //   variant='contained'
                    //   disabled={(request && salesApprovals?.length > 0) || execute}

                    // >
                    //   {(request && salesApprovals?.length > 0)  || execute ? 'Waiting for Approval ' : 'Request Approval'}
                    // </Button> ) : 
                    
                  type !== 'Cash' &&  <Button
                      type='Button'
                      color='success'
                      onClick={(e) => { handleSubmit(e)}}
                      variant='contained'
                      // disabled={addBtnValidation()}
                    >
                      Add
                    </Button>}
                  </div>
                </div>
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
}

// {/* <PaymentInputsWrapper {...wrapperProps}>
//           <svg {...getCardImageProps({ images })} />
//           <input {...getCardNumberProps({ onChange: handleChange })} />
//           <input {...getExpiryDateProps({ onChange: handleChange })} />
//           <input {...getCVCProps({ onChange: handleChange })} />
//         </PaymentInputsWrapper> */}

// {/* <TextField id="card-holder-name-field" size='small' fullWidth name='custName' onChange={handleChange} style={{ marginBottom: '15px' }} label="Card Holder Name" variant="outlined" /> */}
