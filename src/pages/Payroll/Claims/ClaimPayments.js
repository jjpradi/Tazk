import { Box, Button, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import {LocalizationProvider} from '@mui/x-date-pickers';
import React, { useContext, useState } from 'react'
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { claimManualPaymentAction, getClaimtransactionAction } from 'redux/actions/allLoans_actions';
import toMomentOrNull from 'utils/DateFixer';

const ClaimPayments = (props) => {
    // console.log("props.rowData.claim_id",props.rowData)
    const {
        AllLoansReducer: { claimMaunalPayment }
    } = useSelector((state) => state);

    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        allData
    } = useContext(CreateNewButtonContext);


       const [formValues, setFormValues] = useState({
        date: new Date(),
        amount: null,
        note : null
    });

     const [formErrors, setFormErrors] = useState({
        date: new Date(),
        amount: null,
        note : null
    });

const HandleSubmit = async () => {
    let isValid = true;
    let error = null;

    if (!formValues.amount) {
        error = 'Amount is required';
        isValid = false;
    } else if (formValues.amount > props.rowData.claim_amount) {
        error = `Amount exceeds`;
        isValid = false;
    }

    if (!isValid) {
        setFormErrors({ ...formErrors, amount: error });
        return;
    }

    const data = {
        date: formValues.date,
        amount: formValues.amount,
        note: formValues.note,
        location_name: headerLocationId,
        claim_id: props.rowData.claim_id
    };

    await dispatch(claimManualPaymentAction(data));
    await dispatch(getClaimtransactionAction({ claim_id: props.rowData.claim_id }));
    props.setPaymentOpen(false);
};


const onKeyDown = (e) => {
    e.preventDefault();
  };


  return (
      <div>
          <Grid container >
                  <Grid
                      style={{
                          border: '2px solid grey',
                          borderRadius: '10px',
                          justifyContent: 'center',
                          display: 'flex',
                          maxWidth: '100%'
                      }}
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <FormControl component='fieldset'>
                          <RadioGroup
                              row
                              aria-label='customer'
                              name='cash_type'
                              value={'MANUAL_PAYMENT'}
                          >
                              <FormControlLabel value={'MANUAL_PAYMENT'} control={<Radio />} label='Manual Payment' />

                              {/* <FormControlLabel  value={0} control={<Radio />} label='PayOut' /> */}
                          </RadioGroup>
                      </FormControl>
                  </Grid>
                  <Grid container display="flex" justifyContent="space-between">
                      <Grid
                          size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 12
                          }}></Grid>

                      <Grid
                          style={{ marginBottom: '25px', marginTop: '20px' }}
                      >
                          <Typography variant='h4'>OutStanding : Rs. {props.rowData.claim_amount}</Typography>

                      </Grid>
                  </Grid>
              </Grid>
          <Grid
              style={{ paddingTop: '15px' }}
              spacing={2}
              container
              direction='row'
          >


              <Grid
                  size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <Box>
                      <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                              label='Date'
                              // inputFormat='DD/MM/yyyy'
                              name='date'
                              value={toMomentOrNull(formValues.date)}
                              format='DD/MM/YYYY'
                              onChange={(value) => {
                                  setFormValues({ ...formValues, date: value});
                              }}
                              onKeyDown={onKeyDown} 
                              slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                          />
                      </LocalizationProvider>
                  </Box>
              </Grid>
              <Grid
                  size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                  }}>
                  <TextField
                      value={formValues.amount}
                      onChange={(e) => {
                          let num = e.target.value.replace(/[^0-9]/g, '');
                          // console.log("num", num)
                          if (num == '') {
                              setFormErrors({ ...formErrors, amount: 'Amount is Required' })
                          }
                          else {
                              setFormErrors({ ...formErrors, amount: null })
                          }

                          // console.log("ggfgfg", parseInt(num), num);
                          setFormValues({ ...formValues, amount: parseInt(num) })
                      }}
                      required
                      fullWidth
                      onWheel={(e) => e.target.blur()}
                      placeholder=' Enter Amount'
                      label='Amount'
                      name='amount'
                      color='primary'
                      type='number'
                      regex=''
                      variant='filled'
                      error={formErrors.amount === null ? false : true}
                      helperText={formErrors.amount === null ? '' : formErrors.amount}
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
                  fullWidth
                  placeholder=' Note'
                  label='Note'
                  name='reason'
                  color='primary'
                  multiline={true}
                  variant='filled'
                  rows={5}
                  type='text'
                  value={formValues.note}
                  onChange={(e)=> {setFormValues({ ...formValues, note: e.target.value})}}
              />
          </Grid>
          </Grid>
          <Grid container spacing={5} style={{ display: 'flex', justifyContent: 'end', paddingTop: '50px' }}>
             <Grid>
                 <Button color='secondary' variant='contained' onClick={props.handleClose}>
                     cancel
                 </Button>
             </Grid>
             <Grid>
                 <Button color='primary' variant='contained' onClick={HandleSubmit}>
                     submit
                 </Button>
             </Grid>
         </Grid>
      </div>
  );
}

export default ClaimPayments