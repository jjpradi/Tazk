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
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {listCashBoxDenominationAction} from '../redux/actions/cash_box_actions';
import apiCalls from 'utils/apiCalls';
import context from '../context/CreateNewButtonContext';

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

export default function DenominationDialog({
  
  open,
  handleSubmit,
  setOpenDenomination,
  responseType = '',
  formValues = {},
  setFormValues = () => {},
  currentTarget = '',
  validationHandler = () => { },
  openDenomination,
  total
}) {
 
  const dispatch = useDispatch();
  const {cash_box_denomination} = useSelector((state) => state.cashBoxReducer);

  const [Dopen, setDOpen] = useState(false);
  const [currencyValue, setCurrency] = useState([]);
  const tempinitsform = useRef(null);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);

  const handleClose = () => {
    setOpenDenomination(false);
    setDOpen(false);
  };

  // useEffect(() => {
  //    dispatch(listCashBoxDenominationAction())
  //    setOpen(true)
  // }, [])

  const initsform = () => {
    // dispatch(listCashBoxDenominationAction())
    setDOpen(true);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
    let temp = {}

    if(currentTarget === 'given_amount_val'){
      formValues.given_amount?.forEach(i => {
        temp[i.denomination_id] = i.denomination_count
      })
    }
    else if(currentTarget === 'taken_amount_val'){
      formValues.taken_amount?.forEach(i => {
        temp[i.denomination_id] = i.denomination_count
      })

    }else{
      formValues.update_val?.forEach(i => {
        temp[i.denomination_id] = i.denomination_count
      })
      
    }
    setCurrency(temp)


    if (openDenomination) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        !cash_box_denomination.length && dispatch(listCashBoxDenominationAction())
      );
    }
  }, []);

  const addCumulative = () => {
    let res = [];
    for (let key in currencyValue) {
      if (!isNaN(currencyValue[key])) {
        let currentId = cash_box_denomination.filter(
          (f) => f.id === parseInt(key),
        );
        res.push(currentId[0].denomination * currencyValue[key]);
      }
    }
    return res.length > 0
      ? Object.values(res).reduce((preVal, curVal) => preVal + curVal)
      : 0;
  };
  const cumulativeValue = addCumulative();
  const AmountToBePaid = formValues.cash_balance || formValues.taken_amount_val
  const handleSet = () => {


    let res = [];
    for (let key in currencyValue) {
      if (!isNaN(currencyValue[key])) {
        res.push({
          denomination_id: parseInt(key),
          denomination_count: currencyValue[key],
        });
      }
    }
    if (responseType === 'cashAdjustment') {
      if (currentTarget === 'given_amount_val') {
        setFormValues({
          ...formValues,
          given_amount: res,
          given_amount_val: addCumulative(),
        });
        validationHandler('given_amount_val', addCumulative());
      } else if (currentTarget === 'taken_amount_val') {
        setFormValues({
          ...formValues,
          taken_amount: res,
          taken_amount_val: addCumulative(),
        });
        validationHandler('taken_amount_val', addCumulative());
      } else {
        setFormValues({
          ...formValues,
          update_val: res,
          update_denomination: addCumulative(),
        });
        validationHandler('update_denomination', addCumulative());
      }
    } else if (responseType === 'cashOutIn') {
      if (currentTarget === 'amount') {
        setFormValues({
          ...formValues,
          amount_in_denomination: res,
          amount: addCumulative(),
        });
        validationHandler('amount', addCumulative());
      }
    } else {
      handleSubmit(addCumulative());
    }
    setDOpen(false);
    setOpenDenomination(false);
  };
  return (
    <div>
      {cash_box_denomination.length > 0 && 
        <Dialog
        open={Dopen}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Enter your Denomination'}
        </DialogTitle>
        <DialogContent sx={{alignContent: 'center'}}>
        <Grid container direction={'row'} spacing={3}>
          <Grid
            size={{
              lg: 4
            }}>
            <Typography variant='h6' component='h2'>
              {currentTarget === 'update_denomination' || currentTarget === 'given_amount_val'
                ? `Amount To Be Paid : ${
                    total
                    
                  }`
                : ''}
            </Typography>
          </Grid>
          {/* <Grid size={{ lg: 8 }}>
            <Typography variant='h6' component='h2' style={{ color:'red'}}>
              {handleErrorWarning()}
            </Typography>
          </Grid> */}
        </Grid>
          <List
            dense
            sx={{width: '100%', maxWidth: 560, bgcolor: 'background.paper'}}
          >
            {cash_box_denomination.map((value) => {
              return (
                <ListItem
                  key={value.id}
                  // secondaryAction={
                  //  <TextField style = {{backgroundColor:"white",paddingBottom:"0px",maxWidth:'50px'}} placeholder='0.00' type="number" variant="standard"/>
                  // }
                >
                  <Grid container spacing={0} direction='row'>
                    <Grid
                      size={{
                        xs: 2,
                        sm: 2,
                        md: 2,
                        lg: 2
                      }}>
                      <Typography variant='h6' component='h2'>
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
                      <Typography variant='h6' component='h2'>
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
                        sx={inputSx}
                        onWheel={ (e) => e.target.blur()}
                        style={{
                          backgroundColor: 'white',
                          paddingBottom: '0px',
                          maxWidth: '70px',
                        }}
                        placeholder='0.00'
                        type='number'
                        variant='standard'
                        onChange={(e) =>
                          setCurrency({
                            ...currencyValue,
                            [value.id]: parseInt(e.target.value),
                          })
                        }
                        value={currencyValue[value.id] || ''}
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
                        {isNaN(value.denomination * currencyValue[value.id])
                          ? 0
                          : value.denomination * currencyValue[value.id]}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              );
            })}
            <Divider />
            <Grid sx={{paddingRight: '14%'}} align={'Right'}>
              <Typography variant='h6' component='h2'>
                {`Total:  ₹ ${addCumulative()}`}
              </Typography>
            </Grid>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          {
             currentTarget === 'update_denomination' || currentTarget === 'given_amount_val' ?
                <Button onClick={() => handleSet()} autoFocus
                  disabled={AmountToBePaid == cumulativeValue ? false : true}
                >
                  Submit
                </Button> :
                <Button onClick={() => handleSet()} autoFocus
                  // disabled={AmountToBePaid == cumulativeValue ? false : true}
                >
                  Submit
                </Button>
            }
       
        </DialogActions>
      </Dialog>
      }
    </div>
  );
}
