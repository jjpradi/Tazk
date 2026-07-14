import React, {useEffect, useState, useRef, useContext} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {darken, lighten} from '@mui/material/styles';
import {
  TextField,
  ListItem,
  List,
  Grid,
  Typography,
  Divider,
  Autocomplete
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {listCashBoxDenominationAction} from '../../../redux/actions/cash_box_actions';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';

const inputSx = {
  '& input[type=number]': {
    '-moz-appearance': 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
};

export default function DenominationDialog(props) {
  const dispatch = useDispatch();
  const {cash_box_denomination, cash_box_list} = useSelector((state) => state.cashBoxReducer);
  const {pre_order_status} = useSelector((state) => state.productListReducer);
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);

  // const [open, setOpen] = useState(props.open);
  const [currencyValue, setCurrency] = useState([]);
  const [changeValue, setChange] = useState([]);
  const [currencyState, setCurrencyState] = useState({});
  const [changeState, setchangeState] = useState({});
  const [currencyValueError, setCurrencyValueError] = useState({});
  const [submitDisable,setSubmitDisable] = useState(false);
  const [currentIndex,setCurrentIndex] = useState('')
  const [currentEvent,setCurrentEvent] = useState('')
  const [currentValue,setCurrentValue] = useState('')
  const [currentTarget,setCurrentTarget] = useState('');
  const tempinitsform = useRef(null);

  let NegativeDenomination = props.cashOutIn_denomination[0]?.negativeDenomination !== undefined ? props.cashOutIn_denomination[0]?.negativeDenomination : 0
  const currentBalance = props.cashOutIn_denomination[0]?.current_balance === null ? 0 : props.cashOutIn_denomination[0]?.current_balance;
  
  const setDefaultState = () => {
    setCurrency([]);
    setChange([]);
    setCurrencyState({});
    setchangeState({});
    setCurrencyValueError({});
  };

  const handleClose = () => {
    props.setOpenDenomination(!props.open);
    setDefaultState()
    // if(props.currentTarget !== 'Tendered'){
    //   let temp = props.Due
    //   temp[props.index].payment_amount = props.Due[props.index]?.due
    //   props.setTdata(temp)
    // }
  };
  useEffect(() => {
    if (
      props.Due[props.index]?.payment_type === 'Cash (INR)' &&
      props.currentTarget !== 'Tendered' && NegativeDenomination === 1
    ) {
      var amtArray = cash_box_denomination.map((t) => t.denomination);
      let total = +props.Due[props.index].cash_adjustment;

      if (total) {
        const newChange = {};
        const newValue = {};
        cash_box_denomination.map((value, ind) => {
          newChange[`value${ind}`] = parseInt(total / amtArray[ind]);
          newValue[value.id] = parseInt(total / amtArray[ind]);
          total = total % amtArray[ind];
        });
        // $(this).text( parseInt(total / amtArray[i]));
        //Get the new total
        // total = total % amtArray[i];
        setchangeState(newChange);
        setChange(newValue);
      }
    }
  }, [props.Due[props.index], props.currentTarget]);

  // useEffect(() => {
  //   dispatch(listCashBoxDenominationAction())
  // }, [])

  useEffect(() => {
    setCurrency([]);
    setCurrencyState({})
    setCurrentTarget(props.currentTarget)
  }, [props.currentTarget]);

  const initsform = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxDenominationAction()),
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const addCumulative = (currentData) => {
console.log("currentData",changeValue);

    let res = [];
    for (let key in currentData) {
      if (!isNaN(currentData[key])) {
        let currentId = cash_box_denomination.filter((f) => f.id == key);
        res.push(currentId[0].denomination * currentData[key]);
      }
    }
    return res.length > 0
      ? Object.values(res).reduce((preVal, curVal) => preVal + curVal)
      : 0;
  };
  const handleSubmit = (currentData) => {
console.log("ouioiuyoiu",changeValue);

    let res = [];
    for (let key in currentData) {
      if (!isNaN(currentData[key])) {
        res.push({
          denomination_id: parseInt(key),
          denomination_count: currentData[key],
        });
      }
    }

    if (currentTarget === 'Tendered') {
      props.keyboard(addCumulative(currencyValue), res);
      // props.setOpenDenomination(false)
      setDefaultState();
    } else {
      props.dialogTochange(addCumulative(changeValue), res);
      handleClose();
    }

    // setOpen(false)
  };
  useEffect(()=>{
    if(Object.values(currencyValue).length || Object.values(changeValue).length ){
      if(currentValue !== '' && currentIndex !== ''&& currentEvent !== ''){
        setStateUpdate(currentValue,currentIndex,currentEvent,props.currentTarget)
      }
    }

  },[currencyValue,changeValue])

  const setStateUpdate = (value, ind, e)=> {
    let getValue = props.cashOutIn_denomination.filter(
      (f) => f.denomination_dtl_id === value.id,
    );
    if (props.responseType === 'cashOut' && currentTarget === 'Tendered') {
      if (NegativeDenomination === 0) {
        if (e.target.value === '') {
          setCurrencyValueError({ ...currencyValueError, [ind]: null })
          setSubmitDisable(false)
        } else if (getValue.length === 0 || (typeof getValue[0] !== 'undefined' ? getValue[0].denominationCount < e.target.value : true)) {
          // setCurrencyValueError({...currencyValueError,[ind]: `${e.target.value * value.denomination} is Invalid `})
          setCurrencyValueError({ ...currencyValueError, [ind]: `Your Denomination Count Is ${typeof getValue[0] !== 'undefined' ? getValue[0].denominationCount : 0}. Invalid Count !!` })
          setSubmitDisable(true)
        }else {
          setCurrencyValueError({ ...currencyValueError, [ind]: null })
          setSubmitDisable(false)
        }
      }
    } else if (props.responseType === 'cashIn' && currentTarget === 'Change') {
      if (NegativeDenomination === 0) {
        let changeTotal = props.Due[props.index]?.cash_adjustment || 0
        if (e.target.value === '') {
          
          setCurrencyValueError({ ...currencyValueError, [ind]: null })
          setSubmitDisable(false)
        } else if ((changeTotal < value.denomination * e.target.value) || (changeTotal < addCumulative(changeValue))) {
          // setCurrencyValueError({...currencyValueError,[ind]: `${e.target.value * value.denomination} is Invalid `})
          setCurrencyValueError({ ...currencyValueError, [ind]: `Invalid Amount.The Amount Should be Equal ${changeTotal} !!` })
          setSubmitDisable(true)
        }else if (getValue.length === 0 || (typeof getValue[0] !== 'undefined' ? getValue[0].denominationCount < e.target.value : true)) {
          // setCurrencyValueError({...currencyValueError,[ind]: `${e.target.value * value.denomination} is Invalid `})
          setCurrencyValueError({ ...currencyValueError, [ind]: `Your Denomination Count Is ${typeof getValue[0] !== 'undefined' ? getValue[0].denominationCount : 0}. Invalid Count !!` })
          setSubmitDisable(true)
        }else {
          setSubmitDisable(false)
          setCurrencyValueError({ ...currencyValueError, [ind]: null })
        }
      }
    }

   }


  const handleErrorWarning = () => {
    let getErrMsg = Object.values(currencyValueError)
    return typeof getErrMsg.find(f => f !== '') !== 'undefined' ? getErrMsg.find(f => f !== '' && f !== null) : ''
  } 


  const handleCurrencyState = (value, ind, e, currentTarget) => {
    setCurrentEvent(e);
    setCurrentIndex(ind);
    setCurrentValue(value)
   if (currentTarget === 'Tendered') {
      setCurrencyState((p) => ({
       ...p,
       [e.target.name]: e.target.value,
     }));
      setCurrency((p) => ({
       ...p,
       [value.id]: parseInt(e.target.value),
     }));
   } else {
      setchangeState((p) => ({
       ...p,
       [e.target.name]: e.target.value,
     }))
     setChange((p) => ({
       ...p,
       [value.id]: parseInt(e.target.value),
     }))
   }
   setCurrencyValueError({ ...currencyValueError, [ind]: null })
};
console.log("props.currentTarget",currentTarget,props.index,props.Due);


  return (
    <div>
      <Dialog
        open={props.open}
        // onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Enter your Denomination'}
        </DialogTitle>
        <DialogContent sx={{alignContent: 'center'}}>
        {/* {typeof props.posId === 'undefined' && <Autocomplete
          disablePortal
          id="select-cashbox-combo"
          options={cash_box_list}
          fullWidth
          getOptionLabel={(option) => option.name}
          onChange = {(e,val) => val !== null ? props.setStateCashBoxInfo({cash_box_id:val.id,cashboxLedgerId:val.ledger_id}) : props.setStateCashBoxInfo({cash_box_id:null,cashboxLedgerId:null})}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Select CashBox" variant='outlined' />}
        />} */}
          <Grid container direction={'row'} spacing={3}>
          <Grid
            size={{
              lg: 12
            }}>
            <Typography variant='h6' component='h2'>
              {currentTarget == 'Tendered'
                ? `Amount To Be Paid : ${
                    props.Due[props.index]
                      ? currentTarget == 'Tendered'
                        ? parseFloat(props.Due[props.index].due).toFixed(2)
                        : parseFloat(props.Due[props.index].cash_adjustment).toFixed(2)
                      : 0
                  }`
                : `Changes To Be Paid : ${
                    props.Due[props.index]
                      ? currentTarget == 'Tendered'
                        ? parseFloat(props.Due[props.index].due).toFixed(2)
                        : parseFloat(props.Due[props.index].cash_adjustment).toFixed(2)
                      : 0
                  }`}
            </Typography>
            </Grid>
            <Grid
              size={{
                lg: 8
              }}>
              <Typography variant='h6' component='h2' style={{ color:'red'}}>
               
              {handleErrorWarning()}
        
              </Typography>
            </Grid>
          </Grid>
          <List
            dense
            sx={{width: '100%', maxWidth: 560, bgcolor: 'background.paper'}}
          >
            {cash_box_denomination.map((value, ind) => {
              return (
                <ListItem
                  key={value.id}
                  // secondaryAction={
                  //  <TextField style = {{backgroundColor:"white",paddingBottom:"0px",maxWidth:'50px'}} placeholder='0.00' type="number" variant="standard"/>
                  // }
                >
                  <Grid container direction={'row'}>
                    <Grid
                      size={{
                        xs: 2,
                        sm: 2,
                        md: 2,
                        lg: 2
                      }}>
                      <Typography align='center' variant='h6' component='h2'>
                        {`${value.denomination}(${value.denomination_type})`}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{
                        xs: 2,
                        sm: 2,
                        md: 2,
                        lg: 2
                      }}>
                      <Typography align='center' variant='h6' component='h2'>
                        {'*'}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{
                        xs: 3,
                        sm: 3,
                        md: 3,
                        lg: 3
                      }}>
                      <TextField
                        name={`value${ind}`}
                        sx={inputSx}
                        style={{
                          backgroundColor: 'white',
                          paddingBottom: '0px',
                          maxWidth: '70px',
                        }}
                        placeholder='0.00'
                        type='number'
                        variant='standard'
                        value={
                          currentTarget === 'Tendered'
                            ? typeof currencyState[`value${ind}`] !== 'undefined'? currencyState[`value${ind}`] :''
                            : changeState[`value${ind}`]
                        }
                        error = {typeof currencyValueError[ind] !=='undefined' && currencyValueError[ind] !== null }
                        // helperText = {typeof currencyValueError[ind] !=='undefined' && currencyValueError[ind] !== null ? currencyValueError[ind] : ''}
                        onChange={(e) => {
                          // if (props.currentTarget === 'Tendered') {
                          //   handleCurrencyState(value,ind,e)
                          //   // setCurrencyState((p) => ({
                          //   //   ...p,
                          //   //   [e.target.name]: e.target.value,
                          //   // }));
                          //   // setCurrency({
                          //   //   ...currencyValue,
                          //   //   [value.id]: parseInt(e.target.value),
                          //   // });
                          // } else {
                          //   setchangeState((p) => ({
                          //     ...p,
                          //     [e.target.name]: e.target.value,
                          //   }));
                          //   setChange({
                          //     ...changeValue,
                          //     [value.id]: parseInt(e.target.value),
                          //   });
                          // }
                          handleCurrencyState(value,ind,e,props.currentTarget)
                        }}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 2,
                        sm: 2,
                        md: 2,
                        lg: 2
                      }}>
                      <Typography variant='h6' component='h2'>
                        {'='}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{
                        xs: 3,
                        sm: 3,
                        md: 3,
                        lg: 3
                      }}>
                      <Typography variant='h6' component='h2'>
                        {props.currentTarget === 'Tendered'
                          ? isNaN(value.denomination * currencyValue[value.id])
                            ? 0
                            : value.denomination * currencyValue[value.id]
                          : isNaN(value.denomination * changeValue[value.id])
                          ? 0
                          : value.denomination * changeValue[value.id]}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              );
            })}
            <Divider />
            <Grid sx={{paddingRight: '14%'}} align={'Right'}>
              <Typography variant='h6' component='h2'>
                {`Total:  ₹ ${
                  props.currentTarget === 'Tendered'
                    ? addCumulative(currencyValue)
                    : addCumulative(changeValue)
                }`}
              </Typography>
            </Grid>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() =>
              props.currentTarget === 'Tendered'
                ? handleSubmit(currencyValue)
                : handleSubmit(changeValue)
                // handleValidationSubmit()
            }
            autoFocus
            disabled={
              // props.Due[props.index]
              //   ? props.currentTarget === 'Change' &&
              //     addCumulative(changeValue) ===
              //       +props.Due[props.index].cash_adjustment
              //     ? false
              //     : props.currentTarget === 'Tendered'
              //     ? false
              //     : true
              //   : true
              // NegativeDenomination === 0 ?
              // handleNotAllowNegativeDenomination() :
              // handleAllowNegativeDenomination()
               pre_order_status === true && addCumulative(currencyValue) !== 0 ? false :
              submitDisable ? true :
              props.currentTarget === 'Tendered' && addCumulative(currencyValue) === 0 ? true :
              props.currentTarget === 'Change' ?
              props.Due[props.index]?.cash_adjustment !== addCumulative(changeValue) :
              false   
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
