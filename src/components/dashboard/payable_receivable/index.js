import React, { useEffect, useState, useRef, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTotAccDetails, List_Aging_payable, List_Aging_receivables } from '../../../redux/actions/totAcc_actions';
import { Grid, Typography } from '@mui/material';
import Payables from './totalAccountsPayables';
import Receivables from './totalAccountsReceivables';
import EquityRatio from './equity_ratio';
import DebtEquity from './debt_equity';
import CurrentRatio from './current_ratio';
import DaysSalesInventory from './daysSales_inventory';
import ProfitAndLoss from './profitAndLoss_summary';
import ReceivableAndPayableAging from './receivableAndPayableAging';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import DaySalesOutstanding from './daySales_outstanding';
import DayPayableOutstanding from './daysPayable_outstanding.js';
import NetVsGross from './netVsGross'
import TotalReceivables from './totalReceivables';
import {clientwebsocket } from '../../../http-common'
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';


export default function PayableReceivable() {

  const ref1 = useRef(null)

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });



  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const { TotAccReducer: { payable_receivable, aging_receivable, aging_payable } } = useSelector(state => state)

  const func1 = () => {
    if(inView){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        !payable_receivable.length && dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(List_Aging_receivables(setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(List_Aging_payable(setModalTypeHandler, setLoaderStatusHandler)),
      );
    }

  }


  ref1.current = func1
  useEffect(() => {
    ref1.current();
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'purchases') {
    //     !payable_receivable.length && dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
    //     dispatch(List_Aging_payable(setModalTypeHandler))
    //   }
    //   if (event === 'sales') {
    //     !payable_receivable.length && dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
    //     dispatch(List_Aging_receivables(setModalTypeHandler))
    //   }
    // }
  }, [inView])

  return (
    <>
      <Grid container spacing={2} display='flex' flexDirection='row' ref={ref}>
        <Grid
          size={{
            lg: 12,
            xs: 12,
            sm: 12,
            md: 12
          }}>
        <Typography
        variant='h6'
                style={{
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  padding:'0px 0px 10px 10px',
                  color:'black'
                }}
              >
            Total Account Payable and Receivable Dashboard
          </Typography>
        </Grid>

        <Grid container marginLeft='5px'>
          <Grid
            paddingRight='8px'
            size={{
              lg: 2.5,
              md: 2.5,
              sm: 2.5,
              xs: 12
            }}>
            <Grid container display='flex' flexDirection='column'>
              <Grid paddingBottom='10px'><Receivables data={payable_receivable} /></Grid>
              <Grid><Payables data={payable_receivable} /></Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              lg: 9.5,
              md: 9.5,
              sm: 9.5,
              xs: 12
            }}>
          <ReceivableAndPayableAging data={aging_receivable} payable ={aging_payable}/>
          </Grid>
        </Grid>
        {/* <Grid display='flex' flexDirection='row'>
        <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }} sx={{height:'40%'}}>
          <Grid container spacing={2} display='flex' flexDirection='column' >
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              <Receivables data={payable_receivable} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              <Payables data={payable_receivable} />
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              <EquityRatio />
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              <DebtEquity />
            </Grid> */}
          {/* </Grid>
        </Grid> */}
        {/* <Grid size={{ lg: 3.5 }}>
          <Grid container spacing={2} display='flex' flexDirection='column' pb='50px'>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              < CurrentRatio />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item

            >
              <DaysSalesInventory />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
              spacing={3}

            >
              <DaySalesOutstanding />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
              spacing={3}

            >
              <DayPayableOutstanding />
            </Grid>

          </Grid>
        </Grid> */}
        {/* <Grid size={{ xs: 12, sm: 10, md: 10, lg: 10 }}>
          <Grid container spacing={2} display='flex' flexDirection='column'>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
              item
            >
              <ReceivableAndPayableAging data={aging_receivable} payable ={aging_payable}/>
            </Grid>

            
          </Grid>
        </Grid>
        </Grid> */}
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}
              item
            >
{/* <TotalReceivables data={payable_receivable}/> */}
            {/* </Grid> */} 
      </Grid>
    </>
  );
}
