import React, { useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { useDispatch, useSelector } from 'react-redux';
import { getTotAccDetails, List_Aging_payable, List_Aging_receivables, totalAccountsPayableAction } from 'redux/actions/totAcc_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { Grid, IconButton } from '@mui/material';
import {clientwebsocket } from '../../../http-common'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';


const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

function Payables(props) {
  // const dispatch = useDispatch();
  // const ref2 = useRef(null)
  // const [pollTimer, setPollTimer] = useState(null)

  // // const {ref, inView, entry} = useInView({
  // //   threshold: 0,
  // //   triggerOnce: true,
  // // });

  // const {
  //   setModalTypeHandler,
  //   setLoaderStatusHandler,
  //   headerLocationId
  // } = useContext(CreateNewButtonContext);

  // const { TotAccReducer: { payable_receivable, aging_receivable, aging_payable, totalAccountsPayable } } = useSelector(state => state)
  

  // const func1 = () => {
  //   if (props.inView) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       // dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
  //       dispatch(totalAccountsPayableAction(headerLocationId))
  //     )
  //     // dispatch(List_Aging_receivables(setModalTypeHandler, setLoaderStatusHandler))
  //     // dispatch(List_Aging_payable(setModalTypeHandler, setLoaderStatusHandler))
  //   }

  // }


  // ref2.current = func1
  // useEffect(() => {
  //   ref2.current();
  //   // clientwebsocket.socket.onmessage = async (message) => {
  //   //   let { event } = JSON.parse(message.data)
  //   //   if (event === 'purchases') {
  //   //     // dispatch(getTotAccDetails(setModalTypeHandler))
  //   //     dispatch(totalAccountsPayableAction())
  //   //     // dispatch(List_Aging_payable(setModalTypeHandler))
  //   //   }
  //   //   if (event === 'sales') {
  //   //     // dispatch(getTotAccDetails(setModalTypeHandler))
  //   //     dispatch(totalAccountsPayableAction())
  //   //     // dispatch(List_Aging_receivables(setModalTypeHandler))
  //   //   }
  //   // }
  // }, [props.inView, headerLocationId])

  // // const {data} = props
  // let data1 = totalAccountsPayable?.totalPayable ? (totalAccountsPayable?.totalPayable[0]?.payablesDueRecord) : ''

  // useEffect(() => {
  //   if (props.inViewport === true) {
  //     setTimeout(() => {
  //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
  //       if (props.inViewport === false) {
  //         clearTimeout(timer);
  //       }
  //       dispatch(setDashboardPollingTimerIdsAction(timer));
  //       setPollTimer(timer );
  //     }, props.DASHBOARD_API_POLL_TIMING);

  //   } else {
  //     clearTimeout(pollTimer);
  //   }

  //   return () => clearTimeout(pollTimer);
    
  // }, [props.inViewport]);

  // const pollData = () => {
  //   props.pollServer(
  //     dispatch(totalAccountsPayableAction(headerLocationId))
  //   );
  // }

  return (
    <Card 
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{ backgroundColor: 'white', height:'100%' }} 
     >
      <Grid container 
        style={{
          display:'flex', 
          alignItems:'center', 
          padding : '18px', 
          paddingTop : '13px', 
          paddingBottom : '3px' 
        }}
      >
        <Grid>
          <Typography variant='h6' > Total Accounts Payables </Typography>
        </Grid>
        <Grid style={{position:'fixed', right:'0'}}>
          {
            props.mode === 'edit' ? 
            <IconButton
                aria-label='view code'
                onClick={() => props.setCardClose()}
                size='large'
                >
                {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
            </IconButton>
            :
            ''
          }
        </Grid>
      </Grid>
      <hr/>
      <Grid align='center' style={{ padding:'35px 10px' }}>
          <AccountBalanceIcon color= 'primary' sx={{ fontSize: 75 }}/>
          <Typography variant='h1' color="text.secondary" gutterBottom>
          ₹ {props?.data[0]?.payablesDueRecord || '0.00'}
          </Typography>
      </Grid>
    </Card>
  );
}
export default useCommonRef(Payables);
